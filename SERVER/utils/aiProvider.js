const Groq = require("groq-sdk");

function makeError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

function getClient() {
  return new Groq({ apiKey: process.env.GROQ_API_KEY });
}

const MODEL = () => process.env.GROQ_MODEL || "openai/gpt-oss-120b";

// ── Generic call ──────────────────────────────────────────────────────────────
async function callAI(systemPrompt, userPrompt) {
  const groq = getClient();
  try {
    const completion = await groq.chat.completions.create({
      model: MODEL(),
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_completion_tokens: 4096,
      top_p: 1,
      stream: false,
    });
    return completion.choices[0]?.message?.content || "";
  } catch (err) {
    console.error("[Groq] Error:", err?.message, "status:", err?.status);
    if (err.status === 429) throw makeError(429, "AI rate limit reached. Please try again later.");
    if (err.status === 401) throw makeError(401, "Invalid Groq API key.");
    throw makeError(502, `AI service error: ${err.message}`);
  }
}

// ── Learning path system prompt ───────────────────────────────────────────────
const ROADMAP_SYSTEM = `You are a learning path advisor. Given a student's learning goal and a catalog of available courses, you must:

1. Generate a comprehensive learning roadmap for the goal — covering all key topics, phases, and skills needed. Be specific, structured, and use bullet points or numbered steps.

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

function parseIds(text) {
  const cleaned = text.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim();
  const parsed = JSON.parse(cleaned);
  if (Array.isArray(parsed)) return { ids: parsed.map(String), explanation: "" };
  if (parsed && Array.isArray(parsed.ids)) {
    return { ids: parsed.ids.map(String), explanation: parsed.roadmap || parsed.explanation || "" };
  }
  throw new Error("Unexpected response format");
}

// ── Generate learning roadmap ─────────────────────────────────────────────────
async function generateRoadmap(goal, catalog) {
  const catalogData = catalog.slice(0, 30).map((c) => ({
    _id: c._id,
    courseName: c.courseName,
    courseDescription: c.courseDescription?.slice(0, 120),
    tag: c.tag,
    level: c.level,
    price: c.price,
  }));
  const userPrompt = `Learning goal: ${goal}\n\nCourse catalog (JSON):\n${JSON.stringify(catalogData)}`;

  let rawText;
  try {
    rawText = await callAI(ROADMAP_SYSTEM, userPrompt);
  } catch (err) {
    if (err.status) throw err;
    throw makeError(502, "AI service is currently unavailable. Please try again later.");
  }

  try {
    return parseIds(rawText);
  } catch (_) {
    console.error("[AI] Parse failed. Raw:", rawText);
    try {
      const retry = await callAI(ROADMAP_SYSTEM, userPrompt);
      return parseIds(retry);
    } catch (err) {
      if (err.status) throw err;
      throw makeError(502, "AI service returned an unexpected response.");
    }
  }
}

module.exports = { generateRoadmap, callAI };
