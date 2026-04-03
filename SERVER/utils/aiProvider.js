const OpenAI = require("openai");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const SYSTEM_PROMPT = `You are a learning path advisor. Given a student's learning goal and a catalog of available courses, you must:

1. Generate a comprehensive learning roadmap for the goal — covering all key topics, phases, and skills needed (like ChatGPT would explain it). Be specific, structured, and use bullet points or numbered steps.

2. From the provided course catalog, select the courses that are most relevant to the goal and return their _id values in recommended learning order.

RESPONSE FORMAT — return ONLY this JSON object, no extra text:
{
  "roadmap": "Full markdown-style roadmap text here with phases, bullet points, and what to learn at each stage",
  "ids": ["id1", "id2", "id3"]
}

RULES for ids:
- Only use _id values from the provided catalog
- Pick courses genuinely relevant to the goal
- If no courses match, return empty array []
- Do NOT number the courses — just return the ids in order`;

function buildUserPrompt(goal, catalog) {
  const catalogData = catalog.map((c) => ({
    _id: c._id,
    courseName: c.courseName,
    courseDescription: c.courseDescription,
    whatYouWillLearn: c.whatYouWillLearn,
    tag: c.tag,
    level: c.level,
    price: c.price,
  }));
  return `Learning goal: ${goal}\n\nCourse catalog (JSON):\n${JSON.stringify(catalogData)}`;
}

function makeError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function parseIds(text) {
  const cleaned = text.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim();
  const parsed = JSON.parse(cleaned);
  if (Array.isArray(parsed)) {
    return { ids: parsed.map(String), explanation: "" };
  }
  if (parsed && Array.isArray(parsed.ids)) {
    // support both "roadmap" and legacy "explanation" field
    return {
      ids: parsed.ids.map(String),
      explanation: parsed.roadmap || parsed.explanation || "",
    };
  }
  throw new Error("Unexpected response format");
}

async function callOpenAI(userPrompt) {
  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);

  let response;
  try {
    response = await client.chat.completions.create(
      {
        model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      },
      { signal: controller.signal }
    );
  } catch (err) {
    console.error("[OpenAI] Error:", err?.message, "status:", err?.status, "code:", err?.code);
    if (err.name === "AbortError" || err.code === "ECONNABORTED" || err.message?.includes("abort")) {
      throw makeError(504, "The AI service took too long to respond. Please try again.");
    }
    if (err.status && err.status >= 400) {
      throw makeError(502, "AI service is currently unavailable. Please try again later.");
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }

  return response.choices[0].message.content;
}

async function callGemini(userPrompt) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(
      () => reject(makeError(504, "The AI service took too long to respond. Please try again.")),
      30000
    )
  );

  let result;
  try {
    result = await Promise.race([
      model.generateContent(`${SYSTEM_PROMPT}\n\n${userPrompt}`),
      timeoutPromise,
    ]);
  } catch (err) {
    if (err.status === 504) throw err;
    // Log the real error for debugging
    console.error("[Gemini] Error:", err?.message, err?.status, err?.errorDetails);
    throw makeError(502, "AI service is currently unavailable. Please try again later.");
  }

  return result.response.text();
}

async function generateRoadmap(goal, catalog) {
  const provider = (process.env.AI_PROVIDER || "openai").toLowerCase();
  const userPrompt = buildUserPrompt(goal, catalog);

  const callProvider = provider === "gemini" ? callGemini : callOpenAI;

  // First attempt
  let rawText;
  try {
    rawText = await callProvider(userPrompt);
  } catch (err) {
    // Propagate typed errors (504, 502) directly
    if (err.status) throw err;
    throw makeError(502, "AI service is currently unavailable. Please try again later.");
  }

  // Try to parse; retry once on failure
  try {
    return parseIds(rawText);
  } catch (parseErr) {
    console.error("[AI] Parse failed on first attempt. Raw text:", rawText);
    // Retry
    let retryText;
    try {
      retryText = await callProvider(userPrompt);
    } catch (err) {
      if (err.status) throw err;
      throw makeError(502, "AI service is currently unavailable. Please try again later.");
    }

    try {
      return parseIds(retryText);
    } catch (_) {
      console.error("[AI] Parse failed on retry. Raw text:", retryText);
      throw makeError(502, "AI service returned an unexpected response.");
    }
  }
}

module.exports = { generateRoadmap };

// ── Generic single-prompt call (used by doubts, summaries, quiz gen) ──────────
async function callAI(systemPrompt, userPrompt) {
  const provider = (process.env.AI_PROVIDER || "openai").toLowerCase();
  const callProvider = provider === "gemini" ? callGemini : callOpenAI;

  // Temporarily swap system prompt
  const origSystem = SYSTEM_PROMPT;
  // We pass the system prompt inline via a wrapper
  const wrappedPrompt = `${systemPrompt}\n\n${userPrompt}`;

  const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30000);
  let response;
  try {
    response = await client.chat.completions.create(
      {
        model: process.env.OPENAI_MODEL || "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      },
      { signal: controller.signal }
    );
  } catch (err) {
    if (err.name === "AbortError" || err.message?.includes("abort")) {
      throw makeError(504, "AI service timed out. Please try again.");
    }
    throw makeError(502, "AI service is currently unavailable.");
  } finally {
    clearTimeout(timer);
  }
  return response.choices[0].message.content;
}

module.exports = { generateRoadmap, callAI };
