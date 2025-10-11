const express = require("express");
const {
  saveReport,
  getReports,
  deleteReport,
  downloadReport,
} = require("../controllers/report.controller.js");

const router = express.Router();

router.post("/save", saveReport);

router.get("/user/:userId", getReports);

router.delete("/:userId/:reportId", deleteReport);

router.post("/download", downloadReport);

module.exports = router;
