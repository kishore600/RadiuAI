const User = require("../models/user.Model.js");

// Save Report
const saveReport = async (req, res) => {
  try {
    const { userId, reportName, data } = req.body;

    if (!userId || !reportName) {
      return res.status(400).json({ error: "User ID and Report Name required" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.savedReports.push({
      reportName,
      data,
    });

    await user.save();
    res.status(201).json({ message: "Report saved successfully", reports: user.savedReports });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get Reports
const getReports = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("savedReports");
    if (!user) return res.status(404).json({ error: "User not found" });

    res.json(user.savedReports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

// Delete Report
const deleteReport = async (req, res) => {
  try {
    const { userId, reportId } = req.params;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.savedReports = user.savedReports.filter(
      (report) => report._id.toString() !== reportId
    );

    await user.save();
    res.json({ message: "Report deleted successfully", reports: user.savedReports });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const downloadReport = async (req, res) => {
  try {
    const { userId, reportName, reportData } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: "User not found" });

    if (user.tokens <= 0) {
      return res.status(403).json({ error: "No tokens left. Please purchase a plan." });
    }

    // Save report
    user.savedReports.push({ reportName, data: reportData });
    user.tokens -= 1; // reduce 1 token per download
    await user.save();

    res.json({
      message: "Report downloaded successfully",
      remainingTokens: user.tokens,
    });
  } catch (error) {
    console.error("Download error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { saveReport, getReports, deleteReport,downloadReport };
