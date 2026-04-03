const Certificate = require("../models/Certificate");
const Course = require("../models/Course");
const CourseProgress = require("../models/CourseProgress");
const { randomUUID } = require("crypto");

// ── Issue or fetch certificate for a completed course ────────────────────────
exports.getCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.id;

    // Check if already issued
    const existing = await Certificate.findOne({ student: userId, course: courseId })
      .populate("course", "courseName instructor")
      .populate("student", "firstName lastName email");
    if (existing) {
      return res.status(200).json({ success: true, data: existing });
    }

    // Verify course completion
    const course = await Course.findById(courseId).populate({
      path: "courseContent",
      populate: { path: "subSection" },
    });
    if (!course) return res.status(404).json({ success: false, message: "Course not found." });

    // Check enrollment
    if (!course.studentsEnrolled.map(String).includes(userId)) {
      return res.status(403).json({ success: false, message: "Not enrolled in this course." });
    }

    // Count total subsections
    const totalSubSections = course.courseContent.reduce(
      (acc, sec) => acc + (sec.subSection?.length || 0), 0
    );

    const progress = await CourseProgress.findOne({ courseId, userId });
    const completed = progress?.completedVideos?.length || 0;

    if (totalSubSections === 0 || completed < totalSubSections) {
      return res.status(400).json({
        success: false,
        message: `Course not completed yet. ${completed}/${totalSubSections} lectures done.`,
      });
    }

    // Issue certificate
    const cert = await Certificate.create({
      student: userId,
      course: courseId,
      certificateId: randomUUID(),
    });

    await cert.populate("course", "courseName instructor");
    await cert.populate("student", "firstName lastName email");

    return res.status(201).json({ success: true, data: cert });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Verify a certificate by ID (public) ──────────────────────────────────────
exports.verifyCertificate = async (req, res) => {
  try {
    const { certificateId } = req.params;
    const cert = await Certificate.findOne({ certificateId })
      .populate("course", "courseName")
      .populate("student", "firstName lastName");

    if (!cert) return res.status(404).json({ success: false, message: "Certificate not found." });
    return res.status(200).json({ success: true, data: cert });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get all certificates for the logged-in student ───────────────────────────
exports.getMyCertificates = async (req, res) => {
  try {
    const certs = await Certificate.find({ student: req.user.id })
      .populate("course", "courseName thumbnail instructor")
      .sort({ issuedAt: -1 });
    return res.status(200).json({ success: true, data: certs });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
