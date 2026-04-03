const Discussion = require("../models/Discussion");
const Course = require("../models/Course");

// ── Create a discussion/question ─────────────────────────────────────────────
exports.createDiscussion = async (req, res) => {
  try {
    const { courseId, subSectionId, title, content } = req.body;
    if (!courseId || !title || !content) {
      return res.status(400).json({ success: false, message: "courseId, title, and content are required." });
    }

    const discussion = await Discussion.create({
      course: courseId,
      subSection: subSectionId || null,
      author: req.user.id,
      title,
      content,
    });

    await discussion.populate("author", "firstName lastName image accountType");
    return res.status(201).json({ success: true, data: discussion });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get discussions for a course (optionally filtered by subSection) ──────────
exports.getCourseDiscussions = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { subSectionId } = req.query;
    const filter = { course: courseId };
    if (subSectionId) filter.subSection = subSectionId;

    const discussions = await Discussion.find(filter)
      .populate("author", "firstName lastName image accountType")
      .populate("replies.author", "firstName lastName image accountType")
      .sort({ createdAt: -1 });

    return res.status(200).json({ success: true, data: discussions });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Add a reply ───────────────────────────────────────────────────────────────
exports.addReply = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const { content } = req.body;
    if (!content) return res.status(400).json({ success: false, message: "Content is required." });

    const discussion = await Discussion.findById(discussionId);
    if (!discussion) return res.status(404).json({ success: false, message: "Discussion not found." });

    const isInstructor = req.user.accountType === "Instructor";
    discussion.replies.push({ author: req.user.id, content, isInstructor });
    await discussion.save();

    await discussion.populate("author", "firstName lastName image accountType");
    await discussion.populate("replies.author", "firstName lastName image accountType");

    return res.status(200).json({ success: true, data: discussion });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Mark as resolved ──────────────────────────────────────────────────────────
exports.resolveDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const discussion = await Discussion.findById(discussionId);
    if (!discussion) return res.status(404).json({ success: false, message: "Discussion not found." });

    // Only author or instructor can resolve
    if (discussion.author.toString() !== req.user.id && req.user.accountType !== "Instructor") {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    discussion.isResolved = true;
    await discussion.save();
    return res.status(200).json({ success: true, data: discussion });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Delete discussion (author or instructor) ──────────────────────────────────
exports.deleteDiscussion = async (req, res) => {
  try {
    const { discussionId } = req.params;
    const discussion = await Discussion.findById(discussionId);
    if (!discussion) return res.status(404).json({ success: false, message: "Discussion not found." });

    if (discussion.author.toString() !== req.user.id && req.user.accountType !== "Instructor" && req.user.accountType !== "Admin") {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    await Discussion.findByIdAndDelete(discussionId);
    return res.status(200).json({ success: true, message: "Discussion deleted." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
