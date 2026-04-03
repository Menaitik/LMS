const Announcement = require("../models/Announcement");
const Course = require("../models/Course");

// ── Instructor: Create announcement ──────────────────────────────────────────
exports.createAnnouncement = async (req, res) => {
  try {
    const { courseId, title, content } = req.body;
    if (!courseId || !title || !content) {
      return res.status(400).json({ success: false, message: "courseId, title, and content are required." });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: "Course not found." });
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }

    const announcement = await Announcement.create({
      course: courseId,
      author: req.user.id,
      title,
      content,
    });

    await announcement.populate("author", "firstName lastName image");
    return res.status(201).json({ success: true, data: announcement });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get announcements for a course ───────────────────────────────────────────
exports.getCourseAnnouncements = async (req, res) => {
  try {
    const { courseId } = req.params;
    const announcements = await Announcement.find({ course: courseId })
      .populate("author", "firstName lastName image")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: announcements });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Instructor: Delete announcement ──────────────────────────────────────────
exports.deleteAnnouncement = async (req, res) => {
  try {
    const { announcementId } = req.params;
    const ann = await Announcement.findById(announcementId);
    if (!ann) return res.status(404).json({ success: false, message: "Announcement not found." });
    if (ann.author.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }
    await Announcement.findByIdAndDelete(announcementId);
    return res.status(200).json({ success: true, message: "Announcement deleted." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
