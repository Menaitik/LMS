const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema({
  questionId: { type: mongoose.Schema.Types.ObjectId, required: true },
  selectedOptionIndex: { type: Number, required: true },
  isCorrect: { type: Boolean, required: true },
});

const quizAttemptSchema = new mongoose.Schema(
  {
    quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    answers: { type: [answerSchema], default: [] },
    score: { type: Number, required: true }, // percentage
    passed: { type: Boolean, required: true },
    timeTaken: { type: Number, default: 0 }, // seconds
  },
  { timestamps: true }
);

module.exports = mongoose.model("QuizAttempt", quizAttemptSchema);
