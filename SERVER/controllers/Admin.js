const User = require("../models/User");
const Course = require("../models/Course");
const CourseProgress = require("../models/CourseProgress");

// ── Get all users (paginated) ─────────────────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, accountType, search } = req.query;
    const filter = {};
    if (accountType) filter.accountType = accountType;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const total = await User.countDocuments(filter);
    const users = await User.find(filter)
      .select("-password -token -resetPasswordExpires")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return res.status(200).json({
      success: true,
      data: users,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Toggle user active status (ban/unban) ─────────────────────────────────────
exports.toggleUserStatus = async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId === req.user.id) {
      return res.status(400).json({ success: false, message: "Cannot modify your own account." });
    }
    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    user.active = !user.active;
    await user.save();

    return res.status(200).json({
      success: true,
      message: `User ${user.active ? "activated" : "deactivated"}.`,
      data: { _id: user._id, active: user.active },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Delete a user ─────────────────────────────────────────────────────────────
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;
    if (userId === req.user.id) {
      return res.status(400).json({ success: false, message: "Cannot delete your own account." });
    }
    const user = await User.findByIdAndDelete(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found." });

    // Clean up enrollments
    await Course.updateMany({ studentsEnrolled: userId }, { $pull: { studentsEnrolled: userId } });

    return res.status(200).json({ success: true, message: "User deleted." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Platform stats ────────────────────────────────────────────────────────────
exports.getPlatformStats = async (req, res) => {
  try {
    const [totalUsers, totalStudents, totalInstructors, totalCourses, publishedCourses] =
      await Promise.all([
        User.countDocuments(),
        User.countDocuments({ accountType: "Student" }),
        User.countDocuments({ accountType: "Instructor" }),
        Course.countDocuments(),
        Course.countDocuments({ status: "Published" }),
      ]);

    return res.status(200).json({
      success: true,
      data: { totalUsers, totalStudents, totalInstructors, totalCourses, publishedCourses },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Get all courses (admin view) ──────────────────────────────────────────────
exports.getAllCourses = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) filter.courseName = { $regex: search, $options: "i" };

    const total = await Course.countDocuments(filter);
    const courses = await Course.find(filter)
      .populate("instructor", "firstName lastName email")
      .select("courseName status price studentsEnrolled createdAt instructor thumbnail")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    return res.status(200).json({ success: true, data: courses, total });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Delete a course (admin) ───────────────────────────────────────────────────
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findByIdAndDelete(courseId);
    if (!course) return res.status(404).json({ success: false, message: "Course not found." });

    // Remove from enrolled users
    await User.updateMany({ courses: courseId }, { $pull: { courses: courseId } });

    return res.status(200).json({ success: true, message: "Course deleted." });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
