const Quiz = require("../models/Quiz");
const QuizAttempt = require("../models/QuizAttempt");
const Course = require("../models/Course");

// ── Instructor: Create quiz ──────────────────────────────────────────────────
exports.createQuiz = async (req, res) => {
  try {
    const { courseId, sectionId, title, questions, timeLimit, passingScore } = req.body;

    if (!courseId || !title || !questions?.length) {
      return res.status(400).json({ success: false, message: "courseId, title, and questions are required." });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: "Course not found." });
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    const quiz = await Quiz.create({
      title,
      course: courseId,
      section: sectionId || null,
      createdBy: req.user.id,
      questions,
      timeLimit: timeLimit || 0,
      passingScore: passingScore || 60,
    });

    return res.status(201).json({ success: true, message: "Quiz created.", data: quiz });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Instructor: Update quiz ──────────────────────────────────────────────────
exports.updateQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found." });
    if (quiz.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    const allowed = ["title", "questions", "timeLimit", "passingScore", "isPublished"];
    allowed.forEach((field) => {
      if (req.body[field] !== undefined) quiz[field] = req.body[field];
    });
    await quiz.save();

    return res.status(200).json({ success: true, message: "Quiz updated.", data: quiz });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Instructor: Delete quiz ──────────────────────────────────────────────────
exports.deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found." });
    if (quiz.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }
    await Quiz.findByIdAndDelete(quizId);
    return res.status(200).json({ success: true, message: "Quiz deleted." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get quizzes for a course ─────────────────────────────────────────────────
exports.getCourseQuizzes = async (req, res) => {
  try {
    const { courseId } = req.params;
    const isInstructor = req.user.accountType === "Instructor";
    const filter = { course: courseId };
    if (!isInstructor) filter.isPublished = true;

    const quizzes = await Quiz.find(filter).select(isInstructor ? "" : "-questions.options.isCorrect -questions.explanation");
    return res.status(200).json({ success: true, data: quizzes });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get single quiz (student view strips answers) ────────────────────────────
exports.getQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found." });

    const isInstructor = req.user.accountType === "Instructor";
    if (!isInstructor && !quiz.isPublished) {
      return res.status(403).json({ success: false, message: "Quiz not available." });
    }

    // Strip correct answers for students
    if (!isInstructor) {
      const sanitized = quiz.toObject();
      sanitized.questions = sanitized.questions.map((q) => ({
        ...q,
        options: q.options.map(({ text, _id }) => ({ text, _id })),
        explanation: undefined,
      }));
      return res.status(200).json({ success: true, data: sanitized });
    }

    return res.status(200).json({ success: true, data: quiz });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Student: Submit quiz attempt ─────────────────────────────────────────────
exports.submitQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answers, timeTaken } = req.body; // answers: [{ questionId, selectedOptionIndex }]

    const quiz = await Quiz.findById(quizId);
    if (!quiz || !quiz.isPublished) {
      return res.status(404).json({ success: false, message: "Quiz not found." });
    }

    // Score calculation
    let correct = 0;
    const gradedAnswers = answers.map((ans) => {
      const question = quiz.questions.id(ans.questionId);
      if (!question) return { ...ans, isCorrect: false };
      const isCorrect = question.options[ans.selectedOptionIndex]?.isCorrect === true;
      if (isCorrect) correct++;
      return { questionId: ans.questionId, selectedOptionIndex: ans.selectedOptionIndex, isCorrect };
    });

    const score = quiz.questions.length > 0
      ? Math.round((correct / quiz.questions.length) * 100)
      : 0;
    const passed = score >= quiz.passingScore;

    const attempt = await QuizAttempt.create({
      quiz: quizId,
      student: req.user.id,
      course: quiz.course,
      answers: gradedAnswers,
      score,
      passed,
      timeTaken: timeTaken || 0,
    });

    // Return with explanations
    const result = attempt.toObject();
    result.questions = quiz.questions.map((q) => ({
      _id: q._id,
      questionText: q.questionText,
      options: q.options,
      explanation: q.explanation,
    }));

    return res.status(201).json({ success: true, message: passed ? "Passed!" : "Failed.", data: result });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Student: Get my attempts for a quiz ──────────────────────────────────────
exports.getMyAttempts = async (req, res) => {
  try {
    const { quizId } = req.params;
    const attempts = await QuizAttempt.find({ quiz: quizId, student: req.user.id })
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: attempts });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Instructor: Get all attempts for a quiz ───────────────────────────────────
exports.getQuizAttempts = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId);
    if (!quiz) return res.status(404).json({ success: false, message: "Quiz not found." });
    if (quiz.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    const attempts = await QuizAttempt.find({ quiz: quizId })
      .populate("student", "firstName lastName email image")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: attempts });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
