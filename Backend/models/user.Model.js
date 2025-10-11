// models/User.js
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    tokens: { type: Number, default: 0 },
    savedReports: [
      {
        reportName: String,
        createdAt: { type: Date, default: Date.now },
        data: {
          type: Object,
        },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
