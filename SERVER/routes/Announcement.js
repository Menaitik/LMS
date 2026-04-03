const express = require("express");
const router = express.Router();
const { auth, isInstructor } = require("../middlewares/auth");
const { createAnnouncement, getCourseAnnouncements, deleteAnnouncement } = require("../controllers/Announcement");

router.post("/", auth, isInstructor, createAnnouncement);
router.get("/course/:courseId", auth, getCourseAnnouncements);
router.delete("/:announcementId", auth, isInstructor, deleteAnnouncement);

module.exports = router;
