const mongoose = require("mongoose");

const replySchema = new mongoose.Schema(
  {
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    isInstructor: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const discussionSchema = new mongoose.Schema(
  {
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    subSection: { type: mongoose.Schema.Types.ObjectId, ref: "SubSection" },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    content: { type: String, required: true },
    replies: { type: [replySchema], default: [] },
    isResolved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Discussion", discussionSchema);
