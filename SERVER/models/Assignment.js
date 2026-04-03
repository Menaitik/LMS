const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true }, // text submission
    fileUrl: { type: String, default: "" },    // optional file upload
    grade: { type: Number, default: null },    // null = not graded
    feedback: { type: String, default: "" },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    section: { type: mongoose.Schema.Types.ObjectId, ref: "Section" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    dueDate: { type: Date, default: null },
    maxScore: { type: Number, default: 100 },
    isPublished: { type: Boolean, default: false },
    submissions: { type: [submissionSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Assignment", assignmentSchema);
