const express = require("express");
const router = express.Router();
const { auth, isStudent } = require("../middlewares/auth");
const { getCertificate, verifyCertificate, getMyCertificates } = require("../controllers/Certificate");

router.get("/my", auth, isStudent, getMyCertificates);
router.get("/verify/:certificateId", verifyCertificate); // public
router.get("/:courseId", auth, isStudent, getCertificate);

module.exports = router;
