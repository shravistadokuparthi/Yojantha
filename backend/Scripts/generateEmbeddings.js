require("dotenv").config({ path: "../.env" });

const mongoose = require("mongoose");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// 🔥 FIXED PATH
const Scheme = require("../models/Schemes");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ===============================
// 🔹 GET EMBEDDING
// ===============================
async function getEmbedding(text) {
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

// ===============================
// 🔹 MAIN FUNCTION
// ===============================
async function run() {
  try {
    // 🔥 CONNECT DB
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    const schemes = await Scheme.find();

    if (schemes.length === 0) {
      console.log("❌ No schemes found in DB");
      process.exit();
    }

    // 🔥 LOOP ALL SCHEMES
    for (let scheme of schemes) {
      const text = `
      ${scheme.scheme_name}
      ${scheme.details}
      ${scheme.benefits}
      ${scheme.eligibility}
      ${scheme.schemeCategory}
      ${scheme.state}
      `;

      const embedding = await getEmbedding(text);

      scheme.embedding = embedding;
      await scheme.save();

      console.log("✅ Done:", scheme.scheme_name);
    }

    console.log("🎉 ALL EMBEDDINGS GENERATED");
    process.exit();
  } catch (err) {
    console.error("❌ ERROR:", err);
  }
}

run();