require("dotenv").config();

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Scheme = require("../models/Schemes");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const scoreScheme = (scheme, userProfile) => {
  let score = 0;
  const text = `${scheme.scheme_name || ""} ${scheme.schemeCategory || ""} ${scheme.eligibility || ""} ${scheme.details || ""} ${scheme.benefits || ""} ${scheme.tags || ""}`.toLowerCase();
  const schemeType = (userProfile.schemeType || "").toLowerCase();
  const category = (userProfile.category || "").toLowerCase();
  const interests = Array.isArray(userProfile.interests)
    ? userProfile.interests
    : (userProfile.interests || "").split(/[,\s]+/).filter(Boolean);

  if (schemeType && text.includes(schemeType)) score += 30;
  if (category && text.includes(category)) score += 20;
  if (userProfile.gender && scheme.eligibility?.toLowerCase().includes(userProfile.gender.toLowerCase())) score += 10;

  if (userProfile.age && scheme.eligibility) {
    const eligibilityText = scheme.eligibility.toLowerCase();
    if (userProfile.age >= 60 && eligibilityText.includes("senior")) score += 10;
    if (userProfile.age <= 35 && eligibilityText.includes("youth")) score += 8;
  }

  interests.forEach((interest) => {
    const normalized = interest.toLowerCase();
    if (normalized && text.includes(normalized)) score += 10;
  });

  if (scheme.schemeCategory && userProfile.schemeType && scheme.schemeCategory.toLowerCase() === schemeType) score += 15;
  return score;
};

const getCandidateSchemes = (userProfile, schemes) => {
  const scored = schemes
    .map((scheme) => ({ scheme, score: scoreScheme(scheme, userProfile) }))
    .sort((a, b) => b.score - a.score);

  const candidates = scored.filter((item) => item.score > 0).map((item) => item.scheme);
  if (candidates.length >= 5) {
    return candidates.slice(0, 20);
  }

  return schemes.slice(0, 30);
};

const buildPrompt = (userProfile, schemes) => {
  const simplifiedSchemes = schemes.map((scheme) => ({
    id: scheme._id?.toString(),
    name: scheme.scheme_name || "",
    category: scheme.schemeCategory || "",
    eligibility: scheme.eligibility || "",
    benefits: scheme.benefits || "",
    details: scheme.details || "",
    application: scheme.application || "",
    documents: scheme.documents || "",
    tags: scheme.tags || "",
    state: scheme.state || "",
  }));

  return `You are an expert government scheme recommender. Use the user profile and candidate schemes to recommend the top 5 schemes for this user.\n\nUSER PROFILE:\n- Name: ${userProfile.name || "N/A"}\n- Age: ${userProfile.age || "N/A"}\n- Income: ${userProfile.income || "N/A"}\n- Category: ${userProfile.category || "N/A"}\n- Interested Scheme Type: ${userProfile.schemeType || "N/A"}\n- Preference Level: ${userProfile.level || "Any"}\n- Gender: ${userProfile.gender || "N/A"}\n- Income Group: ${userProfile.incomeGroup || "N/A"}\n- Interests: ${Array.isArray(userProfile.interests) ? userProfile.interests.join(", ") : userProfile.interests || "N/A"}\n\nCANDIDATE SCHEMES:\n${JSON.stringify(simplifiedSchemes, null, 2)}\n\nINSTRUCTIONS:\n1. Return exactly 5 recommendations if possible.\n2. Include the scheme id and explain why it matches the user's profile.\n3. Prioritize schemes that match the user's type, category, income, eligibility, and interests.\n4. If eligibility is unclear, assume eligibility and explain match by benefits and profile.\n5. Respond only with valid JSON and no extra text.\n\nOUTPUT FORMAT:\n[\n  {\n    "id": "scheme-object-id",\n    "name": "Scheme Name",\n    "reason": "Why this scheme is suitable for the user"\n  }\n]`;
};

const fallbackRecommendations = async (userProfile, allSchemes) => {
  const candidateSchemes = getCandidateSchemes(userProfile, allSchemes);
  const top = candidateSchemes.slice(0, 5);
  return top.map((scheme) => ({
    id: scheme._id.toString(),
    name: scheme.scheme_name || "Scheme",
    reason: "Recommended by fallback filtering using your profile.",
    category: scheme.schemeCategory,
    eligibility: scheme.eligibility,
    benefits: scheme.benefits,
    details: scheme.details,
    application: scheme.application,
    documents: scheme.documents,
    tags: scheme.tags,
    state: scheme.state
  }));
};

router.post("/recommend", async (req, res) => {
  try {
    const { userProfile } = req.body;

    if (!userProfile) {
      return res.status(400).json({ error: "User profile is required" });
    }

    const allSchemes = await Scheme.find().lean();
    if (!allSchemes || allSchemes.length === 0) {
      return res.json([
        {
          name: "No Data Found",
          reason: "Your database is empty. Please upload schemes."
        }
      ]);
    }

    const candidateSchemes = getCandidateSchemes(userProfile, allSchemes);
    const schemesForLLM = candidateSchemes.length > 0 ? candidateSchemes : allSchemes.slice(0, 30);

    if (!process.env.GEMINI_API_KEY) {
      const fallback = await fallbackRecommendations(userProfile, allSchemes);
      return res.json(fallback);
    }

    const prompt = buildPrompt(userProfile, schemesForLLM);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    console.log("🔍 Gemini raw output:\n", text);
    text = text.replace(/```json|```|`/g, "").trim();

    let recommendations;
    try {
      recommendations = JSON.parse(text);
    } catch (parseError) {
      console.error("❌ JSON parse error:", parseError.message);
      console.error("Raw output:\n", text);
      const fallback = await fallbackRecommendations(userProfile, allSchemes);
      return res.json(fallback);
    }

    if (!Array.isArray(recommendations)) {
      recommendations = [recommendations];
    }

    const ids = recommendations.map((item) => item?.id).filter(Boolean);
    const recommendedSchemes = await Scheme.find({
      _id: { $in: ids.map((id) => new mongoose.Types.ObjectId(id)) }
    }).lean();

    const schemeMap = recommendedSchemes.reduce((acc, scheme) => {
      acc[scheme._id.toString()] = scheme;
      return acc;
    }, {});

    const responsePayload = recommendations
      .map((item) => {
        const scheme = schemeMap[item.id];
        if (!scheme) return null;
        return {
          id: item.id,
          name: scheme.scheme_name || item.name || "Unknown Scheme",
          reason: item.reason || "Recommended based on your profile.",
          category: scheme.schemeCategory,
          eligibility: scheme.eligibility,
          benefits: scheme.benefits,
          details: scheme.details,
          application: scheme.application,
          documents: scheme.documents,
          tags: scheme.tags,
          state: scheme.state
        };
      })
      .filter(Boolean);

    if (responsePayload.length === 0) {
      const fallback = await fallbackRecommendations(userProfile, allSchemes);
      return res.json(fallback);
    }

    res.json(responsePayload);
  } catch (error) {
    console.error("❌ AI Recommendation Error:", error);
    const fallback = await fallbackRecommendations(req.body.userProfile || {}, await Scheme.find().lean());
    if (fallback && fallback.length > 0) {
      return res.json(fallback);
    }
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
});

module.exports = router;
