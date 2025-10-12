"use client";

import { loadStripe } from "@stripe/stripe-js";
import { useState } from "react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function CheckoutPage() {
  const [amount, setAmount] = useState(1000); // $10

  const handlePayment = async () => {
    const res = await fetch("/api/payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });

    const { clientSecret } = await res.json();
    const stripe = await stripePromise;

    if (!stripe || !clientSecret) {
      alert("Stripe not initialized or missing client secret.");
      return;
    }

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        // For demonstration, use a test token. In production, use Stripe Elements.
        card: { token: "tok_visa" },
      },
    });

    if (result.error) {
      alert(result.error.message);
    } else if (result.paymentIntent?.status === "succeeded") {
      alert("✅ Payment successful!");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold">Pay $10</h2>
      <button
        onClick={handlePayment}
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
      >
        Pay Now
      </button>
    </div>
  );
}
