const express = require("express");
const  multer = require ("multer");
const  {verifyOtp,sendOtp} = require("../controllers/auth.controller.js");

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

module.exports = router