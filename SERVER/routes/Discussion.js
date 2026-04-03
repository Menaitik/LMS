const express = require("express");
const router = express.Router();
const { auth } = require("../middlewares/auth");
const {
  createDiscussion,
  getCourseDiscussions,
  addReply,
  resolveDiscussion,
  deleteDiscussion,
} = require("../controllers/Discussion");

router.post("/", auth, createDiscussion);
router.get("/course/:courseId", auth, getCourseDiscussions);
router.post("/:discussionId/reply", auth, addReply);
router.patch("/:discussionId/resolve", auth, resolveDiscussion);
router.delete("/:discussionId", auth, deleteDiscussion);

module.exports = router;
