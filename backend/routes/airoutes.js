require("dotenv").config();

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Scheme = require("../models/Schemes");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ═══════════════════════════════════════════════════════════════
//  SEMANTIC RAG (Retrieval-Augmented Generation) ENGINE
// ═══════════════════════════════════════════════════════════════

/**
 * Generate an embedding vector for any text using Google's text-embedding-004.
 * Returns a 768-dimensional float array.
 */
const getQueryEmbedding = async (text) => {
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const truncated = text.substring(0, 8000);
  const result = await model.embedContent(truncated);
  return result.embedding.values;
};

/**
 * Compute cosine similarity between two vectors.
 * Returns a value between -1 and 1 (1 = identical meaning).
 */
const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  const denominator = Math.sqrt(normA) * Math.sqrt(normB);
  if (denominator === 0) return 0;
  return dotProduct / denominator;
};

/**
 * Build a rich query string from the user's profile for embedding.
 * Combines all available user data into a single semantic paragraph.
 */
const buildQueryText = (userProfile) => {
  const parts = [];

  // The user's free-text description is the most important signal
  if (userProfile.textInput) {
    parts.push(userProfile.textInput);
  }

  if (userProfile.schemeType) parts.push(`Looking for ${userProfile.schemeType} schemes`);
  if (userProfile.category) parts.push(`Category: ${userProfile.category}`);
  if (userProfile.state) parts.push(`State: ${userProfile.state}`);
  if (userProfile.gender) parts.push(`Gender: ${userProfile.gender}`);
  if (userProfile.age) parts.push(`Age: ${userProfile.age} years old`);
  if (userProfile.income) parts.push(`Income: ${userProfile.income}`);
  if (userProfile.incomeGroup) parts.push(`Income group: ${userProfile.incomeGroup}`);

  if (userProfile.interests) {
    const interests = Array.isArray(userProfile.interests)
      ? userProfile.interests.join(", ")
      : userProfile.interests;
    if (interests) parts.push(`Interests: ${interests}`);
  }

  return parts.join(". ");
};

/**
 * RETRIEVAL STEP: Use semantic similarity to find the most relevant schemes.
 * This replaces the old keyword-matching scoreScheme() function.
 */
const semanticRetrieval = async (userProfile, allSchemes) => {
  const queryText = buildQueryText(userProfile);

  if (!queryText || queryText.trim().length === 0) {
    // No query info at all — return first 10 schemes as generic fallback
    return allSchemes.slice(0, 10);
  }

  // Generate embedding for the user's query
  const queryEmbedding = await getQueryEmbedding(queryText);

  // Score every scheme that has an embedding using cosine similarity
  const scored = allSchemes
    .filter((scheme) => scheme.embedding && scheme.embedding.length > 0)
    .map((scheme) => ({
      scheme,
      similarity: cosineSimilarity(queryEmbedding, scheme.embedding),
    }))
    .sort((a, b) => b.similarity - a.similarity);

  // Take top 30 semantically similar schemes
  return scored.slice(0, 30).map((item) => item.scheme);
};

/**
 * GENERATION STEP: Build an enhanced prompt for Gemini to rank and explain.
 */
const buildRAGPrompt = (userProfile, schemes) => {
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

  return `You are an expert Indian government scheme recommender. You have been given a user's profile and a list of candidate schemes that were pre-selected using semantic similarity search. Your job is to pick the TOP 5-10 BEST matching schemes and explain why each one is relevant.

USER PROFILE:
- Name: ${userProfile.name || "N/A"}
- Age: ${userProfile.age || "N/A"}
- Gender: ${userProfile.gender || "N/A"}
- Income: ${userProfile.income || "N/A"}
- Income Group: ${userProfile.incomeGroup || "N/A"}
- Category/Caste: ${userProfile.category || "N/A"}
- State: ${userProfile.state || "N/A"}
- Interested Scheme Type: ${userProfile.schemeType || "N/A"}
- Preference Level: ${userProfile.level || "Any"}
- Interests: ${Array.isArray(userProfile.interests) ? userProfile.interests.join(", ") : userProfile.interests || "N/A"}
- User's Description: ${userProfile.textInput || "N/A"}

CANDIDATE SCHEMES (pre-filtered by semantic relevance):
${JSON.stringify(simplifiedSchemes, null, 2)}

STRICT RULES:
1. The user's text description is the PRIMARY matching signal. If they say "education", only return education-related schemes.
2. Carefully read each scheme's name, eligibility, details, benefits, and tags to verify it truly matches the user's intent.
3. Do NOT recommend a scheme unless you can clearly justify why it is relevant to the user.
4. If the user mentions a caste/reservation category (SC, ST, OBC, BC, minority, PWD, etc.), only include schemes whose eligibility explicitly supports that group.
5. If the user mentions a specific state, prioritize schemes from that state.
6. Return between 5 and 10 schemes maximum, ranked by relevance.
7. Do NOT invent schemes. Only use schemes from the candidate list above.
8. Respond ONLY with valid JSON, no markdown, no extra text.

OUTPUT FORMAT:
[
  {
    "id": "scheme-object-id",
    "name": "Scheme Name",
    "reason": "A clear 1-2 sentence explanation of why this scheme matches the user"
  }
]`;
};

/**
 * Keyword-based fallback when embeddings are not available or API fails.
 */
const keywordFallback = (userProfile, allSchemes) => {
  const queryText = (userProfile.textInput || "").toLowerCase();
  const schemeType = (userProfile.schemeType || "").toLowerCase();
  const category = (userProfile.category || "").toLowerCase();
  const userState = (userProfile.state || "").toLowerCase();

  const scored = allSchemes.map((scheme) => {
    let score = 0;
    const text = `${scheme.scheme_name || ""} ${scheme.schemeCategory || ""} ${scheme.eligibility || ""} ${scheme.details || ""} ${scheme.benefits || ""} ${scheme.tags || ""} ${scheme.state || ""}`.toLowerCase();

    if (queryText) {
      const tokens = Array.from(new Set(queryText.match(/\b[\wÀ-ÿ]{3,}\b/g) || []));
      tokens.forEach((token) => {
        if (text.includes(token)) score += 30;
      });
    }

    if (schemeType && text.includes(schemeType)) score += 20;
    if (category && text.includes(category)) score += 15;
    if (userState && text.includes(userState)) score += 15;

    return { scheme, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 10)
    .map((item) => item.scheme);
};

/**
 * Format scheme objects for the frontend response.
 */
const formatResponse = (schemes, reasonMap = {}) => {
  return schemes.map((s) => ({
    id: s._id,
    name: s.scheme_name || "Unknown Scheme",
    category: s.schemeCategory,
    eligibility: s.eligibility,
    benefits: s.benefits,
    details: s.details,
    application: s.application,
    documents: s.documents,
    tags: s.tags,
    state: s.state,
    reason: reasonMap[s._id?.toString()] || "Matched based on your profile",
  }));
};

// ═══════════════════════════════════════════════════════════════
//  MAIN RECOMMENDATION ENDPOINT
// ═══════════════════════════════════════════════════════════════

router.post("/recommend", async (req, res) => {
  try {
    const { userProfile } = req.body;

    const allSchemes = await Scheme.find().lean();
    if (!allSchemes.length) return res.json([]);

    // Check if embeddings exist
    const hasEmbeddings = allSchemes.some((s) => s.embedding && s.embedding.length > 0);

    let candidateSchemes;

    try {
      if (hasEmbeddings) {
        // ✅ SEMANTIC RETRIEVAL: Use vector similarity to find relevant schemes
        console.log("🔍 Using SEMANTIC search (RAG) for retrieval...");
        candidateSchemes = await semanticRetrieval(userProfile, allSchemes);
      } else {
        // ⚠️ No embeddings yet — use keyword fallback
        console.log("⚠️ No embeddings found. Using keyword fallback. Run: node scripts/embedSchemes.js");
        candidateSchemes = keywordFallback(userProfile, allSchemes);
      }
    } catch (retrievalError) {
      console.error("Retrieval error, falling back to keywords:", retrievalError.message);
      candidateSchemes = keywordFallback(userProfile, allSchemes);
    }

    if (!candidateSchemes.length) {
      return res.json([]);
    }

    try {
      // ✅ GENERATION: Pass candidates to Gemini for final ranking + explanation
      const prompt = buildRAGPrompt(userProfile, candidateSchemes);
      const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash",
        generationConfig: {
          responseMimeType: "application/json",
        },
      });

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      let aiRecommendations = [];
      try {
        aiRecommendations = JSON.parse(responseText);
      } catch (e) {
        const cleanText = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
        aiRecommendations = JSON.parse(cleanText);
      }

      // Map AI results back to full scheme objects from DB
      const finalResult = aiRecommendations
        .map((rec) => {
          const original = allSchemes.find((s) => s._id.toString() === rec.id);
          if (original) {
            return {
              id: original._id,
              name: original.scheme_name || rec.name,
              category: original.schemeCategory,
              eligibility: original.eligibility,
              benefits: original.benefits,
              details: original.details,
              application: original.application,
              documents: original.documents,
              tags: original.tags,
              state: original.state,
              reason: rec.reason || "Matched based on your profile",
            };
          }
          return null;
        })
        .filter(Boolean);

      if (finalResult.length > 0) {
        console.log(`✅ RAG returned ${finalResult.length} recommendations`);
        return res.json(finalResult);
      }
    } catch (aiError) {
      console.error("Gemini generation error:", aiError.message);
    }

    // FINAL FALLBACK: Return keyword-matched candidates with generic reason
    console.log("⚠️ Falling back to keyword results");
    const fallback = formatResponse(candidateSchemes.slice(0, 5));
    return res.json(fallback);

  } catch (err) {
    console.error("Recommendation endpoint error:", err);
    res.status(500).json({ error: "Failed to get recommendations" });
  }
});

module.exports = router;