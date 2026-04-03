const express = require("express");
const router = express.Router();
const { auth, isInstructor, isStudent } = require("../middlewares/auth");
const {
  createAssignment, updateAssignment, deleteAssignment,
  getCourseAssignments, submitAssignment, getMySubmission,
  getSubmissions, gradeSubmission,
} = require("../controllers/Assignment");

// Instructor
router.post("/", auth, isInstructor, createAssignment);
router.put("/:assignmentId", auth, isInstructor, updateAssignment);
router.delete("/:assignmentId", auth, isInstructor, deleteAssignment);
router.get("/:assignmentId/submissions", auth, isInstructor, getSubmissions);
router.patch("/:assignmentId/submissions/:submissionId/grade", auth, isInstructor, gradeSubmission);

// Shared
router.get("/course/:courseId", auth, getCourseAssignments);

// Student
router.post("/:assignmentId/submit", auth, isStudent, submitAssignment);
router.get("/:assignmentId/my-submission", auth, isStudent, getMySubmission);

module.exports = router;
