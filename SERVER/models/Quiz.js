const mongoose = require("mongoose");

const optionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  isCorrect: { type: Boolean, default: false },
});

const questionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: { type: [optionSchema], required: true },
  explanation: { type: String, default: "" },
});

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    section: { type: mongoose.Schema.Types.ObjectId, ref: "Section" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    questions: { type: [questionSchema], default: [] },
    timeLimit: { type: Number, default: 0 }, // minutes, 0 = no limit
    passingScore: { type: Number, default: 60 }, // percentage
    isPublished: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Quiz", quizSchema);
