const express = require("express");
const router = express.Router();

const { generateLearningPath, askDoubt, generateSummary, generateQuizFromContent } = require("../controllers/AI");
const { auth, isStudent } = require("../middlewares/auth");

router.post("/learning-path", auth, isStudent, generateLearningPath);
router.post("/ask-doubt", auth, isStudent, askDoubt);
router.post("/summary", auth, isStudent, generateSummary);
router.post("/generate-quiz", auth, generateQuizFromContent); // instructors can also use this

module.exports = router;
