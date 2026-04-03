const express = require("express");
const router = express.Router();
const { auth, isInstructor, isStudent } = require("../middlewares/auth");
const {
  createQuiz,
  updateQuiz,
  deleteQuiz,
  getCourseQuizzes,
  getQuiz,
  submitQuiz,
  getMyAttempts,
  getQuizAttempts,
} = require("../controllers/Quiz");

// Instructor
router.post("/", auth, isInstructor, createQuiz);
router.put("/:quizId", auth, isInstructor, updateQuiz);
router.delete("/:quizId", auth, isInstructor, deleteQuiz);
router.get("/:quizId/attempts", auth, isInstructor, getQuizAttempts);

// Shared (auth required)
router.get("/course/:courseId", auth, getCourseQuizzes);
router.get("/:quizId", auth, getQuiz);

// Student
router.post("/:quizId/submit", auth, isStudent, submitQuiz);
router.get("/:quizId/my-attempts", auth, isStudent, getMyAttempts);

module.exports = router;
