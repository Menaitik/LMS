const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fileUrl:  { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number, required: true }, // bytes
});

const subSectionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    timeDuration: { type: String},
    description: { type: String },
    videoUrl: { type: String, required: true },
    resources: { type: [resourceSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("SubSection", subSectionSchema);
