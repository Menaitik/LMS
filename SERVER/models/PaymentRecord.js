const mongoose = require("mongoose");

const paymentRecordSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Course" }],
    orderId: { type: String, required: true },
    paymentId: { type: String, default: "" },
    amount: { type: Number, required: true }, // in INR (not paise)
    status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
    currency: { type: String, default: "INR" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaymentRecord", paymentRecordSchema);
