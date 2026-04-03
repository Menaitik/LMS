const Assignment = require("../models/Assignment");
const Course = require("../models/Course");

// ── Instructor: Create assignment ─────────────────────────────────────────────
exports.createAssignment = async (req, res) => {
  try {
    const { courseId, sectionId, title, description, dueDate, maxScore } = req.body;
    if (!courseId || !title || !description) {
      return res.status(400).json({ success: false, message: "courseId, title, and description are required." });
    }
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: "Course not found." });
    if (course.instructor.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }
    const assignment = await Assignment.create({
      title, description, course: courseId,
      section: sectionId || null,
      createdBy: req.user.id,
      dueDate: dueDate || null,
      maxScore: maxScore || 100,
    });
    return res.status(201).json({ success: true, data: assignment });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Instructor: Update assignment ─────────────────────────────────────────────
exports.updateAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ success: false, message: "Not found." });
    if (assignment.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }
    ["title", "description", "dueDate", "maxScore", "isPublished"].forEach((f) => {
      if (req.body[f] !== undefined) assignment[f] = req.body[f];
    });
    await assignment.save();
    return res.status(200).json({ success: true, data: assignment });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Instructor: Delete assignment ─────────────────────────────────────────────
exports.deleteAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ success: false, message: "Not found." });
    if (assignment.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }
    await Assignment.findByIdAndDelete(assignmentId);
    return res.status(200).json({ success: true, message: "Deleted." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get assignments for a course ──────────────────────────────────────────────
exports.getCourseAssignments = async (req, res) => {
  try {
    const { courseId } = req.params;
    const isInstructor = req.user.accountType === "Instructor";
    const filter = { course: courseId };
    if (!isInstructor) filter.isPublished = true;
    const assignments = await Assignment.find(filter)
      .select("-submissions")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: assignments });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Student: Submit assignment ────────────────────────────────────────────────
exports.submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ success: false, message: "Submission content is required." });

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment || !assignment.isPublished) {
      return res.status(404).json({ success: false, message: "Assignment not found." });
    }

    // Check due date
    if (assignment.dueDate && new Date() > new Date(assignment.dueDate)) {
      return res.status(400).json({ success: false, message: "Submission deadline has passed." });
    }

    // Check if already submitted
    const existing = assignment.submissions.find((s) => s.student.toString() === req.user.id);
    if (existing) {
      existing.content = content;
      existing.submittedAt = new Date();
    } else {
      assignment.submissions.push({ student: req.user.id, content });
    }
    await assignment.save();
    return res.status(200).json({ success: true, message: "Submitted successfully." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Student: Get my submission ────────────────────────────────────────────────
exports.getMySubmission = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ success: false, message: "Not found." });
    const submission = assignment.submissions.find((s) => s.student.toString() === req.user.id);
    return res.status(200).json({ success: true, data: submission || null });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Instructor: Get all submissions ──────────────────────────────────────────
exports.getSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await Assignment.findById(assignmentId)
      .populate("submissions.student", "firstName lastName email image");
    if (!assignment) return res.status(404).json({ success: false, message: "Not found." });
    if (assignment.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }
    return res.status(200).json({ success: true, data: assignment.submissions });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Instructor: Grade a submission ────────────────────────────────────────────
exports.gradeSubmission = async (req, res) => {
  try {
    const { assignmentId, submissionId } = req.params;
    const { grade, feedback } = req.body;
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ success: false, message: "Not found." });
    if (assignment.createdBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized." });
    }
    const submission = assignment.submissions.id(submissionId);
    if (!submission) return res.status(404).json({ success: false, message: "Submission not found." });
    if (grade !== undefined) submission.grade = grade;
    if (feedback !== undefined) submission.feedback = feedback;
    await assignment.save();
    return res.status(200).json({ success: true, data: submission });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
