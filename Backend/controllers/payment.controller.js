// controllers/paymentController.js
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2024-04-10",
});

// Create Checkout Session
exports.createCheckoutSession = async (req, res) => {
  try {
    const { plan, userId } = req.body;

    if (!plan || !plan.name || !plan.price) {
      return res.status(400).json({ error: "Invalid plan data" });
    }

    // Convert "$10" → 1000 cents
    const amount = Math.round(parseFloat(plan.price.replace("$", "")) * 100);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: plan.name,
              description: `${plan.description} (${plan.reports})`,
            },
            unit_amount: 1,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/pricing`,
      metadata: {
        userId: userId.id,
        userEmail: userId.email,
        planName: plan.name,
        reports: plan.reports,
      },
    });

    return res.json({ url: session.url });
  } catch (error) {
    console.error("Stripe error:", error);
    return res.status(500).json({ error: error.message });
  }
};

exports.stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("⚠️ Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle successful payment
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { userId, planName, reports } = session.metadata;

    try {
      const user = await User.findById(userId);
      if (!user) {
        console.error("User not found for payment:", userId);
        return res.status(404).end();
      }

      // Extract number from "6 reports"
      const reportCount = parseInt(reports) || 0;

      // Add purchased reports to user's token count
      user.tokens += reportCount;
      await user.save();

      console.log(`✅ Added ${reportCount} tokens to ${user.email}`);
    } catch (error) {
      console.error("Error updating user tokens:", error);
    }
  }

  res.status(200).json({ received: true });
};
