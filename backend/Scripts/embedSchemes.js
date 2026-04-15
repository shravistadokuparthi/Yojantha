/**
 * One-time script to generate semantic embeddings for all schemes in MongoDB.
 * Uses Google's text-embedding-004 model to convert scheme text into 768-dim vectors.
 * 
 * Run: node scripts/embedSchemes.js
 */

require("dotenv").config({ path: require("path").join(__dirname, "..", ".env") });

const mongoose = require("mongoose");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Scheme = require("../models/Schemes");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const buildSchemeText = (scheme) => {
  const parts = [];
  if (scheme.scheme_name) parts.push(`Scheme: ${scheme.scheme_name}`);
  if (scheme.schemeCategory) parts.push(`Category: ${scheme.schemeCategory}`);
  if (scheme.eligibility) parts.push(`Eligibility: ${scheme.eligibility}`);
  if (scheme.details) parts.push(`Details: ${scheme.details}`);
  if (scheme.benefits) parts.push(`Benefits: ${scheme.benefits}`);
  if (scheme.tags) parts.push(`Tags: ${scheme.tags}`);
  if (scheme.state) parts.push(`State: ${scheme.state}`);
  if (scheme.application) parts.push(`Application: ${scheme.application}`);
  if (scheme.documents) parts.push(`Documents: ${scheme.documents}`);
  return parts.join(". ");
};

const getEmbedding = async (text) => {
  const model = genAI.getGenerativeModel({ model: "text-embedding-004" });
  const truncated = text.substring(0, 8000);
  const result = await model.embedContent(truncated);
  return result.embedding.values;
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const main = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const schemes = await Scheme.find({
      $or: [
        { embedding: { $exists: false } },
        { embedding: { $size: 0 } },
        { embedding: null }
      ]
    }).lean();

    console.log(`Found ${schemes.length} schemes without embeddings`);

    if (schemes.length === 0) {
      console.log("All schemes already have embeddings!");
      process.exit(0);
    }

    let success = 0;
    let failed = 0;
    const BATCH_SIZE = 5;

    for (let i = 0; i < schemes.length; i += BATCH_SIZE) {
      const batch = schemes.slice(i, i + BATCH_SIZE);
      const batchNum = Math.floor(i / BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(schemes.length / BATCH_SIZE);

      console.log(`Processing batch ${batchNum}/${totalBatches} (schemes ${i + 1}-${Math.min(i + BATCH_SIZE, schemes.length)})`);

      const promises = batch.map(async (scheme) => {
        try {
          const text = buildSchemeText(scheme);
          if (!text || text.length < 10) {
            failed++;
            return;
          }
          const embedding = await getEmbedding(text);
          await Scheme.updateOne(
            { _id: scheme._id },
            { $set: { embedding: embedding } }
          );
          success++;
        } catch (err) {
          failed++;
          console.error(`Failed: ${scheme._id} - ${err.message}`);
        }
      });

      await Promise.all(promises);

      if (i + BATCH_SIZE < schemes.length) {
        await sleep(1500);
      }
    }

    console.log(`\nEmbedding complete! Success: ${success}, Failed: ${failed}, Total: ${schemes.length}`);
    process.exit(0);
  } catch (err) {
    console.error("Fatal error:", err);
    process.exit(1);
  }
};

main();
