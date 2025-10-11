const express = require("express");
const {
  createCheckoutSession,
  stripeWebhook
} = require("../controllers/payment.controller.js");

const router = express.Router();

// Create checkout session
router.post("/create-checkout-session", createCheckoutSession);

router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);


module.exports = router;
