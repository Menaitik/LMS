const PaymentRecord = require("../models/PaymentRecord");

// ── Student: Get my payment history ──────────────────────────────────────────
exports.getMyPayments = async (req, res) => {
  try {
    const records = await PaymentRecord.find({ student: req.user.id })
      .populate("courses", "courseName thumbnail price")
      .sort({ createdAt: -1 });
    return res.status(200).json({ success: true, data: records });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

// ── Admin: Get all payments ───────────────────────────────────────────────────
exports.getAllPayments = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const total = await PaymentRecord.countDocuments();
    const records = await PaymentRecord.find()
      .populate("student", "firstName lastName email image")
      .populate("courses", "courseName price")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    return res.status(200).json({ success: true, data: records, total });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
