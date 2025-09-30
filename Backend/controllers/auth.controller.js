const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const Otp = require("../models/Otp.Model.js");
const User = require("../models/user.Model.js");
const sendEmail = require("../config/sendMail.config.js");

const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const otp = crypto.randomInt(100000, 999999).toString();

    await Otp.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), 
    });
    
    await sendEmail({
      email,
      subject: "Your OTP Code",
      name: email.split("@")[0], 
      message:otp,
      showResetButton: false, 
    });

    res.json({ message: "OTP sent to email" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const verifyOtp = async (req, res) => {
  try {
    const { name,email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ error: "Email and OTP required" });

    const record = await Otp.findOne({ email, otp });
    if (!record) return res.status(400).json({ error: "Invalid OTP" });

    if (record.expiresAt < new Date()) {
      return res.status(400).json({ error: "OTP expired" });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: name || "New User",
        email: email,
      });
    } else {
      if (!user.name && name) {
        user.name = name;
        await user.save();
      }
    }


    await Otp.deleteMany({ email });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  sendOtp,
  verifyOtp
}