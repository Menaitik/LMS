const Course = require("../models/Course");
const SubSection = require("../models/SubSection");
const aiProvider = require("../utils/aiProvider");

exports.generateLearningPath = async (req, res) => {
  try {
    const { goal } = req.body;

    // Validate goal length
    if (!goal || goal.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Please describe your goal in at least 10 characters.",
      });
    }
    if (goal.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Goal description must be 500 characters or fewer.",
      });
    }

    // Fetch published courses
    const catalog = await Course.find({ status: "Published" })
      .select("_id courseName courseDescription whatYouWillLearn tag level price thumbnail")
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    if (catalog.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No courses are currently available.",
      });
    }

    // Build in-memory map for ID validation
    const catalogMap = new Map(catalog.map((c) => [c._id.toString(), c]));

    // Call AI provider
    let parsed;
    try {
      parsed = await aiProvider.generateRoadmap(goal, catalog);
    } catch (err) {
      const status = err.status || 502;
      return res.status(status).json({
        success: false,
        message: err.message,
      });
    }

    const { ids, explanation } = parsed;

    // Validate returned IDs and build ordered roadmap
    const roadmap = ids
      .map((id) => catalogMap.get(String(id)))
      .filter(Boolean);

    return res.status(200).json({
      success: true,
      roadmap,
      explanation: explanation || "",
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred.",
    });
  }
};

// ── Ask AI a doubt about a lecture ───────────────────────────────────────────
exports.askDoubt = async (req, res) => {
  try {
    const { question, subSectionId, context } = req.body;
    if (!question || question.trim().length < 5) {
      return res.status(400).json({ success: false, message: "Please provide a question (min 5 chars)." });
    }

    let lectureContext = context || "";
    if (subSectionId && !lectureContext) {
      const sub = await SubSection.findById(subSectionId).select("title description");
      if (sub) lectureContext = `Lecture: "${sub.title}"\n${sub.description}`;
    }

    const systemPrompt = `You are a helpful course tutor. Answer the student's question clearly and concisely. 
If lecture context is provided, use it to give a more relevant answer.
Keep answers focused, educational, and under 300 words.`;

    const userPrompt = lectureContext
      ? `Lecture context:\n${lectureContext}\n\nStudent question: ${question}`
      : `Student question: ${question}`;

    const answer = await aiProvider.callAI(systemPrompt, userPrompt);
    return res.status(200).json({ success: true, answer });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

// ── Generate a summary for a lecture ─────────────────────────────────────────
exports.generateSummary = async (req, res) => {
  try {
    const { subSectionId, text } = req.body;
    let content = text || "";

    if (subSectionId && !content) {
      const sub = await SubSection.findById(subSectionId).select("title description");
      if (sub) content = `Title: ${sub.title}\n\n${sub.description}`;
    }

    if (!content || content.trim().length < 20) {
      return res.status(400).json({ success: false, message: "Not enough content to summarize." });
    }

    const systemPrompt = `You are an expert at creating concise, structured summaries for students.
Create a clear bullet-point summary of the provided lecture content.
Format: use markdown with ## headings and bullet points. Keep it under 200 words.`;

    const summary = await aiProvider.callAI(systemPrompt, content);
    return res.status(200).json({ success: true, summary });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ success: false, message: err.message });
  }
};

// ── Generate quiz questions from lecture content ───────────────────────────────
exports.generateQuizFromContent = async (req, res) => {
  try {
    const { subSectionId, text, count = 5 } = req.body;
    let content = text || "";

    if (subSectionId && !content) {
      const sub = await SubSection.findById(subSectionId).select("title description");
      if (sub) content = `Title: ${sub.title}\n\n${sub.description}`;
    }

    if (!content || content.trim().length < 30) {
      return res.status(400).json({ success: false, message: "Not enough content to generate quiz." });
    }

    const numQ = Math.min(Math.max(Number(count) || 5, 1), 10);

    const systemPrompt = `You are a quiz generator. Given lecture content, generate exactly ${numQ} multiple-choice questions.
RESPONSE FORMAT — return ONLY this JSON array, no extra text:
[
  {
    "questionText": "...",
    "options": [
      { "text": "...", "isCorrect": false },
      { "text": "...", "isCorrect": true },
      { "text": "...", "isCorrect": false },
      { "text": "...", "isCorrect": false }
    ],
    "explanation": "Brief explanation of the correct answer"
  }
]
RULES:
- Exactly one option per question must have isCorrect: true
- All 4 options must have text
- Questions must be based on the provided content`;

    const raw = await aiProvider.callAI(systemPrompt, content);
    const cleaned = raw.replace(/```(?:json)?\s*/gi, "").replace(/```/g, "").trim();
    const questions = JSON.parse(cleaned);

    if (!Array.isArray(questions)) throw new Error("Invalid response format");

    return res.status(200).json({ success: true, questions });
  } catch (err) {
    const status = err.status || 500;
    return res.status(status).json({ success: false, message: err.message || "Failed to generate quiz." });
  }
};
