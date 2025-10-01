const express = require("express");
const {
  saveReport,
  getReports,
  deleteReport,
} = require("../controllers/report.controller.js");

const router = express.Router();

router.post("/save", saveReport);

router.get("/user/:userId", getReports);

router.delete("/:userId/:reportId", deleteReport);

module.exports = router;
