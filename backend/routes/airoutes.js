const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post("/recommend", async (req, res) => {
  try {
    const { userProfile } = req.body;

    // Fetch schemes from MongoDB (ensure collection name matches)
    const allSchemes = await mongoose.connection.db.collection("Govt_Schemes").find({}).toArray();

    if (!allSchemes || allSchemes.length === 0) {
      return res.json([{ 
        name: "No Data Found", 
        reason: "Your database is empty. Please upload the CSV data to MongoDB." 
      }]);
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // THE "INFLEXIBLE" PROMPT
    const prompt = `
      USER PROFILE:
      - Name: ${userProfile.name}
      - Age: ${userProfile.age}
      - Income: ${userProfile.income}
      - Category (Caste): ${userProfile.category}
      - Interested in: ${userProfile.schemeType}
      - Preference Level: ${userProfile.level || 'Any'}

      DATABASE SCHEMES (From CSV):
      ${JSON.stringify(allSchemes.map(s => ({
        name: s.scheme_name,
        details: s.details,
        eligibility: s.eligibility,
        category: s.schemeCategory,
        level: s.level
      })))}

      MATCHING INSTRUCTIONS (BE EXTREMELY GENEROUS/INFLEXIBLE):
      1. **Missing Category/Caste Rule**: Look at the 'eligibility' and 'details' fields. If NO specific caste (OBC/SC/ST/General) is mentioned as a restriction, IGNORE the user's category and assume they ARE eligible.
      2. **Missing Income Rule**: If the 'eligibility' or 'details' do NOT explicitly state a maximum income limit, IGNORE the user's income and assume they ARE eligible.
      3. **Fuzzy Scheme Type**: If the user's interest is '${userProfile.schemeType}', match any scheme where the name or 'schemeCategory' is even slightly related (e.g., 'Agriculture' matches 'Farmers').
      4. **Strict Level Match**: Only filter by 'Central' or 'State' if the user explicitly chose one. Otherwise, show both.
      5. **No Empty Arrays**: You MUST find and return exactly 3 schemes. If no schemes match perfectly, pick the 3 most helpful-looking ones from the list.

      RETURN ONLY A JSON ARRAY:
      [{"name": "Scheme Name", "reason": "Detailed explanation of why they qualify, specifically mentioning that no income/category restrictions were found in the data so they are eligible."}]
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, "").trim();
    
    res.json(JSON.parse(text));

  } catch (error) {
    console.error("AI Recommendation Error:", error);
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
});

module.exports = router;