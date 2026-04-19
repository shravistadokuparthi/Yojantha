require("dotenv").config();

const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const Scheme = require("../models/Schemes");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ═══════════════════════════════════════════════════════════════
//  RAG UTILITIES
// ═══════════════════════════════════════════════════════════════

const getQueryEmbedding = async (text) => {
  const model = genAI.getGenerativeModel({ model: "gemini-embedding-001" });
  const truncated = text.substring(0, 8000);
  const result = await model.embedContent(truncated);
  return result.embedding.values;
};

const cosineSimilarity = (vecA, vecB) => {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
};

const extractKeywords = (text) => {
  if (!text) return [];
  const stopWords = new Set([
    "i", "am", "a", "an", "the", "is", "are", "was", "were", "be", "been",
    "being", "have", "has", "had", "do", "does", "did", "will", "would",
    "could", "should", "may", "might", "shall", "can", "need", "must",
    "for", "from", "to", "in", "on", "at", "by", "of", "with", "and",
    "or", "but", "not", "no", "my", "me", "we", "our", "you", "your",
    "they", "their", "its", "his", "her", "this", "that", "these", "those",
    "what", "which", "who", "whom", "how", "when", "where", "why",
    "all", "any", "some", "than", "too", "very", "just", "about",
    "looking", "want", "get", "find", "help", "please", "like",
    "tell", "give", "show", "know", "available", "there",
    "schemes", "scheme", "government", "govt", "yes", "yeah", "okay",
  ]);
  return Array.from(
    new Set(
      text.toLowerCase().match(/\b[\wÀ-ÿ]{3,}\b/g)?.filter((w) => !stopWords.has(w)) || []
    )
  );
};

const keywordOverlapScore = (keywords, scheme) => {
  if (!keywords.length) return 0;
  const schemeText = `${scheme.scheme_name || ""} ${scheme.schemeCategory || ""} ${scheme.eligibility || ""} ${scheme.details || ""} ${scheme.benefits || ""} ${scheme.tags || ""} ${scheme.state || ""} ${scheme.application || ""}`.toLowerCase();
  let matched = 0;
  keywords.forEach((kw) => { if (schemeText.includes(kw)) matched++; });
  return matched / keywords.length;
};

/**
 * Hybrid retrieval: semantic + keyword, with threshold.
 */
const hybridRetrieval = async (searchText, allSchemes) => {
  const queryEmbedding = await getQueryEmbedding(searchText);
  const keywords = extractKeywords(searchText);

  console.log(`🔑 Chat keywords: [${keywords.join(", ")}]`);

  const scored = allSchemes
    .filter((s) => s.embedding && s.embedding.length > 0)
    .map((scheme) => {
      const semScore = cosineSimilarity(queryEmbedding, scheme.embedding);
      const kwScore = keywordOverlapScore(keywords, scheme);
      const hybridScore = 0.65 * semScore + 0.35 * kwScore;
      return { scheme, score: hybridScore };
    })
    .filter((item) => item.score >= 0.30)
    .sort((a, b) => b.score - a.score);

  console.log(`📊 Chat retrieval: ${scored.length} above threshold`);
  return scored.slice(0, 12).map((item) => item.scheme);
};

const keywordFallback = (message, allSchemes) => {
  const keywords = extractKeywords(message);
  const scored = allSchemes.map((scheme) => {
    const schemeText = `${scheme.scheme_name || ""} ${scheme.schemeCategory || ""} ${scheme.eligibility || ""} ${scheme.details || ""} ${scheme.benefits || ""} ${scheme.tags || ""} ${scheme.state || ""}`.toLowerCase();
    let score = 0;
    keywords.forEach((kw) => { if (schemeText.includes(kw)) score += 30; });
    return { scheme, score };
  });
  return scored.filter((i) => i.score > 0).sort((a, b) => b.score - a.score).slice(0, 10).map((i) => i.scheme);
};

// ═══════════════════════════════════════════════════════════════
//  CONVERSATIONAL AGENT PROMPT
// ═══════════════════════════════════════════════════════════════

/**
 * Build search text from conversation history for retrieval.
 * Combines recent messages to understand context.
 */
const buildSearchQuery = (message, history) => {
  // Extract key entities from history (like state, category, occupation) and append current message
  const recentContext = (history || [])
    .slice(-6)
    .map((m) => m.content)
    .join(" ");
  // Combine it in a single semantic string
  return `${recentContext} ${message}`.trim();
};

/**
 * Build the system prompt for the conversational agent.
 */
const buildAgentPrompt = (message, history, schemes) => {
  // Truncate fields to keep prompt size manageable
  const trunc = (str, max = 200) => {
    if (!str) return "";
    return str.length > max ? str.substring(0, max) + "..." : str;
  };

  const simplifiedSchemes = schemes.slice(0, 8).map((s) => ({
    id: s._id?.toString(),
    name: s.scheme_name || "",
    category: s.schemeCategory || "",
    eligibility: trunc(s.eligibility),
    benefits: trunc(s.benefits),
    details: trunc(s.details, 150),
    application: trunc(s.application, 150),
    documents: trunc(s.documents, 150),
    tags: s.tags || "",
    state: s.state || "",
  }));

  // Build conversation history for context
  const conversationHistory = (history || [])
    .slice(-10) // Last 10 messages for context
    .map((m) => `${m.role === "user" ? "USER" : "ASSISTANT"}: ${m.content}`)
    .join("\n");

  return `You are "Yojanta AI", a smart, friendly, and conversational Indian government scheme assistant. You behave like a knowledgeable human advisor — NOT like a search engine that dumps lists.

YOUR PERSONALITY:
- You are warm, patient, and helpful like a government helpdesk officer who genuinely cares
- You speak naturally and conversationally
- You ask clarifying questions when needed instead of guessing
- You explain things simply, like talking to a friend
- You can discuss, compare, and analyze schemes in depth

CONVERSATION SO FAR:
${conversationHistory || "(This is the start of the conversation)"}

USER'S LATEST MESSAGE:
"${message}"

SCHEME DATABASE (retrieved based on conversation context):
${JSON.stringify(simplifiedSchemes, null, 2)}

HOW TO BEHAVE — FOLLOW THESE RULES:

1. **BE CONVERSATIONAL**: Don't just list schemes. Have a real conversation. If the user says "hi", greet them warmly. If they ask a vague question, ask follow-up questions to understand their needs better.

2. **ASK QUESTIONS WHEN NEEDED**: 
   - If user asks "Am I eligible for X?" → Ask their age, income, category, state, occupation if not already known from conversation history
   - If user asks "What schemes for me?" → Ask about their situation: "Could you tell me a bit about yourself? What's your age, occupation, and which state are you from?"
   - If user gives partial info → Ask for what's missing: "Got it! And what about your annual income? That helps me check eligibility."

3. **REMEMBER CONTEXT**: Use the conversation history above. If the user already told you their age/state/category in previous messages, don't ask again. Build on what you already know.

4. **ANSWER DEEPLY**: When asked about a specific scheme, provide:
   - What the scheme is about
   - Who is eligible
   - What benefits they get
   - How to apply
   - What documents are needed
   Don't just give one-liners.

5. **BE HONEST**: If you're not sure or don't have data for a scheme, say so. Don't make up details.

6. **CHECK ELIGIBILITY PROPERLY**: When determining eligibility, cross-check the user's details against the scheme's eligibility criteria point by point. Tell them clearly if they qualify or not, and why.

7. **GUIDE THE USER**: After answering, suggest next steps: "Would you like to know how to apply?" or "Should I check if there are more schemes in your state?"

8. **SCHEME REFERENCES & GENERAL CHAT**: Use the database for scheme details. However, if the user asks a normal conversational question (e.g., "How are you?", "Who made you?"), or talks about general topics, **answer them naturally and warmly like a friendly human**. Do not rigidly say "I don't have details about that scheme in my database" if they are just chatting with you! Be conversational and fluid.

9. **OUT OF SCOPE SCHEMES**: If they specifically ask for a government scheme *not* in your database, then you can say politely, "I don't have details about that specific scheme right now, but here's what I can help with..."

RESPONSE FORMAT — JSON only:
{
  "answer": "Your conversational response. Use **bold** for scheme names and key terms. Use \\n for line breaks when listing things.",
  "schemeIds": ["only-ids-of-schemes-you-explicitly-discussed"]
}

Keep answers natural, helpful, and under 500 words. The "schemeIds" should only include schemes you actually talked about (max 5).`;
};

// ═══════════════════════════════════════════════════════════════
//  CHAT ENDPOINT
// ═══════════════════════════════════════════════════════════════

router.post("/chat", async (req, res) => {
  try {
    const { message, history } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: "Message is required" });
    }

    console.log(`\n💬 Chat: "${message}" (history: ${(history || []).length} msgs)`);

    const allSchemes = await Scheme.find().lean();
    if (!allSchemes.length) {
      return res.json({
        answer: "I don't have any schemes in my database yet. Please check back later! 😊",
        schemes: [],
      });
    }

    // Build a richer search query from conversation context
    const searchQuery = buildSearchQuery(message, history);

    // Use hybrid retrieval (semantic text-embedding + keyword overlap)
    let candidateSchemes = [];
    try {
      console.log("🔍 Chatbot trying semantic hybrid retrieval...");
      candidateSchemes = await hybridRetrieval(searchQuery, allSchemes);
      
      // If semantic retrieval yielded nothing, fallback to keyword
      if (candidateSchemes.length === 0) {
        candidateSchemes = keywordFallback(searchQuery, allSchemes);
      }
    } catch (retrievalError) {
      console.log("⚠️ Embedding failed (rate limit/quota), using keyword fallback:", retrievalError.message);
      candidateSchemes = keywordFallback(searchQuery, allSchemes);
    }

    // Even with no candidates, still let Gemini respond conversationally
    // (it might be a greeting or general question)

    try {
      const prompt = buildAgentPrompt(message, history, candidateSchemes);

      // Helper: call Gemini with model fallback + retry
      const MODELS = ["gemini-flash-latest", "gemini-2.5-flash-lite", "gemini-pro-latest"];
      let lastError = null;

      const callGemini = async () => {
        for (const modelName of MODELS) {
          try {
            console.log(`🤖 Trying model: ${modelName}`);
            const model = genAI.getGenerativeModel({ 
              model: modelName,
              generationConfig: {
                responseMimeType: "application/json"
              }
            });
            const result = await model.generateContent(prompt);
            console.log(`✅ Success with: ${modelName}`);
            return result.response.text();
          } catch (err) {
            lastError = err;
            console.log(`⚠️ ${modelName} failed (${err.status || "unknown"}): ${(err.message || "").substring(0, 100)}`);
            if (err.status === 429 || err.status === 503) {
              continue; // Try next model on rate limits or service unavailable
            }
            throw err; // Non-rate-limit error, stop
          }
        }
        throw lastError || new Error("All models exhausted");
      };

      const responseText = await callGemini();

      let parsed;
      try {
        parsed = JSON.parse(responseText);
      } catch (e) {
        const cleanText = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
        parsed = JSON.parse(cleanText);
      }

      // Map scheme IDs to full objects
      const referencedSchemes = (parsed.schemeIds || [])
        .map((id) => {
          const s = allSchemes.find((scheme) => scheme._id.toString() === id);
          if (s) {
            return {
              id: s._id,
              name: s.scheme_name || "Unknown Scheme",
              category: s.schemeCategory || "",
              eligibility: s.eligibility || "",
              benefits: s.benefits || "",
              state: s.state || "",
              application: s.application || "",
            };
          }
          return null;
        })
        .filter(Boolean);

      console.log(`✅ Chat agent responded (${referencedSchemes.length} schemes referenced)`);

      return res.json({
        answer: parsed.answer || "I'm not sure how to respond to that. Could you rephrase?",
        schemes: referencedSchemes,
      });
    } catch (aiError) {
      console.log("❌ Gemini unavailable, using smart Q&A fallback");

      // ══════════════════════════════════════════════════════
      //  SMART Q&A FALLBACK (No AI required)
      // ══════════════════════════════════════════════════════
      return smartFallback(message, candidateSchemes, allSchemes, res);
    }
  } catch (err) {
    console.log("❌ Chat endpoint error:", err.message || err);
    res.status(500).json({ error: "Failed to process chat message" });
  }
});

/**
 * Smart Q&A fallback — answers questions directly from DB data.
 */
function smartFallback(message, candidateSchemes, allSchemes, res) {
  const msg = message.toLowerCase().trim();

  // Format scheme for response
  const formatScheme = (s) => ({
    id: s._id,
    name: s.scheme_name || "Unknown",
    category: s.schemeCategory || "",
    eligibility: s.eligibility || "",
    benefits: s.benefits || "",
    state: s.state || "",
    application: s.application || "",
  });

  // ── 1. GREETINGS ──
  const greetings = ["hi", "hello", "hey", "hii", "hiii", "good morning", "good evening", "namaste"];
  if (greetings.some((g) => msg === g || msg === g + "!")) {
    return res.json({
      answer: "Hello! 👋 Welcome to **Yojanta AI**!\n\nI can help you with Indian government schemes. Here's what you can ask me:\n\n• **\"What education schemes are available?\"**\n• **\"Eligibility for PM Awas Yojana\"**\n• **\"Benefits of Sukanya Samriddhi Yojana\"**\n• **\"How to apply for farmer schemes?\"**\n• **\"Schemes for women in Telangana\"**\n\nGo ahead, ask me anything! 😊",
      schemes: [],
    });
  }

  // ── 2. FIND SPECIFIC SCHEME BY NAME ──
  const specificScheme = allSchemes.find((s) => {
    const name = (s.scheme_name || "").toLowerCase();
    return name && (msg.includes(name) || name.includes(msg.replace(/[?!.,]/g, "").trim()));
  });

  // ── 3. DETECT INTENT ──
  const isEligibility = /eligib|who can|qualify|criteria|eligible|can i apply|am i eligible/i.test(msg);
  const isBenefits = /benefit|advantage|what do i get|how much|amount|money|subsid/i.test(msg);
  const isApplication = /how to apply|apply|application|process|register|enroll|procedure/i.test(msg);
  const isDocuments = /document|papers|required doc|what documents|proof/i.test(msg);
  const isDetails = /tell me about|what is|details|explain|describe|information/i.test(msg);

  // ── 4. ANSWER ABOUT SPECIFIC SCHEME ──
  if (specificScheme) {
    let answer = `Here's what I know about **${specificScheme.scheme_name}**:\n\n`;

    if (isEligibility && specificScheme.eligibility) {
      answer += `📋 **Eligibility:**\n${specificScheme.eligibility}\n\n`;
    } else if (isBenefits && specificScheme.benefits) {
      answer += `💰 **Benefits:**\n${specificScheme.benefits}\n\n`;
    } else if (isApplication && specificScheme.application) {
      answer += `📝 **How to Apply:**\n${specificScheme.application}\n\n`;
    } else if (isDocuments && specificScheme.documents) {
      answer += `📄 **Documents Required:**\n${specificScheme.documents}\n\n`;
    } else {
      // Give full details
      if (specificScheme.details) answer += `📌 **About:** ${specificScheme.details.substring(0, 300)}\n\n`;
      if (specificScheme.eligibility) answer += `📋 **Eligibility:** ${specificScheme.eligibility.substring(0, 300)}\n\n`;
      if (specificScheme.benefits) answer += `💰 **Benefits:** ${specificScheme.benefits.substring(0, 300)}\n\n`;
      if (specificScheme.application) answer += `📝 **How to Apply:** ${specificScheme.application.substring(0, 300)}\n\n`;
    }

    answer += `\nWould you like to know more? Ask about eligibility, benefits, or how to apply! 😊`;

    return res.json({
      answer,
      schemes: [formatScheme(specificScheme)],
    });
  }

  // ── 5. ANSWER GENERAL QUESTIONS WITH MATCHED SCHEMES ──
  if (candidateSchemes.length > 0) {
    const topSchemes = candidateSchemes.slice(0, 5);
    let answer = "";

    if (isEligibility) {
      answer = `Here are the **eligibility details** for schemes matching your query:\n\n`;
      topSchemes.forEach((s, i) => {
        const elig = s.eligibility ? s.eligibility.substring(0, 200) : "Details not available";
        answer += `${i + 1}. **${s.scheme_name}**\n   📋 ${elig}\n\n`;
      });
      answer += `Ask me about a specific scheme for more details!`;
    } else if (isBenefits) {
      answer = `Here are the **benefits** of matching schemes:\n\n`;
      topSchemes.forEach((s, i) => {
        const ben = s.benefits ? s.benefits.substring(0, 200) : "Details not available";
        answer += `${i + 1}. **${s.scheme_name}**\n   💰 ${ben}\n\n`;
      });
    } else if (isApplication) {
      answer = `Here's **how to apply** for matching schemes:\n\n`;
      topSchemes.forEach((s, i) => {
        const app = s.application ? s.application.substring(0, 200) : "Details not available";
        answer += `${i + 1}. **${s.scheme_name}**\n   📝 ${app}\n\n`;
      });
    } else if (isDocuments) {
      answer = `Here are the **documents required** for matching schemes:\n\n`;
      topSchemes.forEach((s, i) => {
        const docs = s.documents ? s.documents.substring(0, 200) : "Details not available";
        answer += `${i + 1}. **${s.scheme_name}**\n   📄 ${docs}\n\n`;
      });
    } else {
      // General listing with brief info
      answer = `I found **${topSchemes.length} schemes** related to your query! 🔍\n\n`;
      topSchemes.forEach((s, i) => {
        const detail = s.details || s.benefits || s.eligibility || "";
        answer += `${i + 1}. **${s.scheme_name}**`;
        if (s.schemeCategory) answer += ` (${s.schemeCategory})`;
        answer += `\n   ${detail.substring(0, 150)}${detail.length > 150 ? "..." : ""}\n\n`;
      });
      answer += `💡 Ask me:\n• *"What is the eligibility for [scheme name]?"*\n• *"Benefits of [scheme name]"*\n• *"How to apply for [scheme name]?"*`;
    }

    return res.json({
      answer,
      schemes: topSchemes.map(formatScheme),
    });
  }

  // ── 6. NO MATCHES ──
  return res.json({
    answer: "I couldn't find schemes matching your query. Try asking about:\n\n• 📚 **Education** — scholarships, student schemes\n• 🌾 **Agriculture** — farmer subsidies, crop insurance\n• 🏥 **Healthcare** — medical schemes, Ayushman Bharat\n• 🏠 **Housing** — PM Awas Yojana, housing loans\n• 👩 **Women** — Sukanya Samriddhi, Mahila schemes\n• 💼 **Employment** — skill development, startup schemes\n\nOr type a specific scheme name to get details!",
    schemes: [],
  });
}

module.exports = router;

