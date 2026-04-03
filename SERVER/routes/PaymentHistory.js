const express = require("express");
const router = express.Router();
const { auth, isStudent, isAdmin } = require("../middlewares/auth");
const { getMyPayments, getAllPayments } = require("../controllers/PaymentHistory");

router.get("/my", auth, isStudent, getMyPayments);
router.get("/all", auth, isAdmin, getAllPayments);

module.exports = router;
