import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-09-30.clover",
});

export async function POST(req: NextRequest) {
  try {
    const { plan, user } = await req.json();

    if (!plan || !plan.price || !plan.name) {
      return NextResponse.json({ error: "Invalid plan data" }, { status: 400 });
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
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_CLIENT_URL}/cancel`,
      metadata: {
        userId: user?.id || "guest",
        userEmail: user?.email || "anonymous",
        planName: plan.name,
        reports: plan.reports,
      },
    });

    return NextResponse.json({ url: session.url });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (err: any) {
    console.error("Stripe Error:", err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
