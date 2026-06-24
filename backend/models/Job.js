const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "users", required: true },
    company: { type: String, required: true },
    position: { type: String, required: true },
    status: { type: String, default: "Applied" },
    location: { type: String, default: "Remote" },
    link: { type: String },
    notes: { type: String },
    interviewDate: { type: String },
    pdfData: { type: String }, 
  },
  { timestamps: true }
);

// ⚡ TUNED COMPOUND COMPILATION MAP
JobSchema.index({ user: 1 });

module.exports = mongoose.model("jobs", JobSchema);