const express = require("express");
const router = express.Router();
const { auth, isAdmin } = require("../middlewares/auth");
const {
  getAllUsers,
  toggleUserStatus,
  deleteUser,
  getPlatformStats,
  getAllCourses,
  deleteCourse,
} = require("../controllers/Admin");

router.get("/users", auth, isAdmin, getAllUsers);
router.patch("/users/:userId/toggle-status", auth, isAdmin, toggleUserStatus);
router.delete("/users/:userId", auth, isAdmin, deleteUser);
router.get("/stats", auth, isAdmin, getPlatformStats);
router.get("/courses", auth, isAdmin, getAllCourses);
router.delete("/courses/:courseId", auth, isAdmin, deleteCourse);

module.exports = router;
