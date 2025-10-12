// app/pricing/page.tsx
"use client";

import { useAuth } from "@/components/auth-provider";
import {
  CheckIcon,
  StarIcon,
  BoltIcon,
  GiftIcon,
} from "@heroicons/react/24/outline";

const pricingTiers = [
  {
    name: "Free Trial",
    price: "$0",
    period: "1 day",
    description: "Perfect for initial exploration",
    reports: "1 report",
    freeReports: "",
    features: [
      "1 comprehensive market report",
      "Basic market insights",
      "Standard competitor analysis",
      "Essential demographic data",
      "Email support",
    ],
    cta: "Get Started Free",
    popular: false,
    color: "from-gray-500 to-gray-700",
    badge: "",
  },
  {
    name: "Starter Pack",
    price: "$1",
    period: "one-time",
    description: "Perfect for trying out our service",
    reports: "1 report",
    freeReports: "",
    features: [
      "1 detailed market report",
      "Basic market intelligence",
      "Essential competitor insights",
      "Cultural fit analysis",
      "Standard processing",
      "Save to profile",
    ],
    cta: "Buy for $1",
    popular: false,
    color: "from-blue-500 to-cyan-500",
    badge: "Special Offer",
  },
  {
    name: "Pro Bundle",
    price: "$10",
    period: "one-time",
    description: "Most popular - Best value",
    reports: "12 reports",
    freeReports: "+2 free",
    features: [
      "12 comprehensive reports",
      "Advanced AI insights",
      "Custom analysis parameters",
      "Save to profile",
      "Dedicated support",
      "Comparative insights",
      "Advanced visualization",
    ],
    cta: "Buy Pro Bundle",
    popular: true,
    color: "from-purple-500 to-pink-500",
    badge: "Save 33%",
  },
  {
    name: "Power User",
    price: "$24",
    period: "one-time",
    description: "For extensive research needs",
    reports: "24 reports",
    freeReports: "+2 free",
    features: [
      "24 comprehensive reports",
      "All Pro Bundle features",
      "API access (basic)",
      "Premium support",
      "Custom report templates",
      "Batch processing",
      "Organize reports in folders",
    ],
    cta: "Buy Power Pack",
    popular: false,
    color: "from-orange-500 to-red-500",
    badge: "Save 50%",
  },
  {
    name: "Business Pack",
    price: "$49",
    period: "one-time",
    description: "Complete business intelligence",
    reports: "50 reports",
    freeReports: "+1 free",
    features: [
      "50 comprehensive reports",
      "All Power User features",
      "Advanced API access",
      "Dedicated account manager",
      "Team report sharing",
      "Team collaboration",
      "Priority processing",
      "Custom analytics",
    ],
    cta: "Buy Business Pack",
    popular: false,
    color: "from-green-500 to-emerald-500",
    badge: "Save 51%",
  },
  {
    name: "Enterprise Suite",
    price: "$99",
    period: "one-time",
    description: "Ultimate value for teams",
    reports: "100 reports",
    freeReports: "+1 free",
    features: [
      "100 comprehensive reports",
      "All Business Pack features",
      "Unlimited API access",
      "Custom integrations",
      "24/7 premium support",
      "Advanced security",
      "Training sessions",
      "Quarterly reviews",
    ],
    cta: "Buy Enterprise Suite",
    popular: false,
    color: "from-indigo-500 to-purple-500",
    badge: "Save 51%",
  },
];

export default function Pricing() {
  const { user } = useAuth();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCheckout = async (tier: any) => {
    if (!user) {
      alert("Please sign in to purchase reports");
      return;
    }

    try {
      const response = await fetch("/api/payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          plan: tier,
          userId: user.id,
          userEmail: user.email 
        }),
      });

      const data = await response.json();

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        alert(data.error || "Failed to start checkout session");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong. Please try again.");
    }
  };

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Choose Your{" "}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Report Pack
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600">
            All reports are automatically saved to your profile. Access them anytime, from any device.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-2 xl:grid-cols-3">
          {pricingTiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative flex flex-col rounded-3xl bg-white p-8 shadow-2xl ring-1 ring-gray-200/60 ${
                tier.popular ? "ring-2 ring-purple-500 scale-105" : ""
              } transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}
            >
              {/* Popular Badge */}
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-1 text-sm font-semibold text-white shadow-lg">
                    <StarIcon className="h-4 w-4" />
                    Most Popular
                  </span>
                </div>
              )}

              {/* Savings Badge */}
              {tier.badge && (
                <div className="absolute -top-3 right-4">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 px-3 py-1 text-xs font-semibold text-white">
                    <GiftIcon className="h-3 w-3" />
                    {tier.badge}
                  </span>
                </div>
              )}

              <div className="flex-1">
                {/* Tier Header */}
                <div className="text-center">
                  <h3 className="text-lg font-semibold leading-8 text-gray-900">
                    {tier.name}
                  </h3>

                  {/* Price */}
                  <div className="mt-4 flex items-baseline justify-center gap-x-1">
                    <span className="text-5xl font-bold tracking-tight text-gray-900">
                      {tier.price}
                    </span>
                    {tier.period && (
                      <span className="text-sm font-semibold leading-6 text-gray-600">
                        {tier.period}
                      </span>
                    )}
                  </div>

                  {/* Reports Count */}
                  <div className="mt-4">
                    <div className="flex items-center justify-center gap-2">
                      <BoltIcon className="h-5 w-5 text-yellow-500" />
                      <span className="text-lg font-bold text-gray-900">
                        {tier.reports}
                      </span>
                      {tier.freeReports && (
                        <span className="text-sm font-semibold text-green-600">
                          {tier.freeReports}
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-gray-600">
                      {tier.description}
                    </p>
                  </div>
                </div>

                {/* Features List */}
                <ul className="mt-8 space-y-3 text-sm leading-6 text-gray-600">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <CheckIcon className="h-6 w-5 flex-none text-green-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <div className="mt-8">
                <button
                  onClick={() => handleCheckout(tier)}
                  className={`w-full rounded-xl px-3 py-3 text-sm font-semibold shadow-lg transition-all duration-200 ${
                    tier.popular
                      ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 hover:shadow-xl"
                      : "bg-gradient-to-r from-gray-800 to-gray-900 text-white hover:from-gray-700 hover:to-gray-800"
                  }`}
                >
                  {tier.cta}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Features Highlight */}
        <div className="mt-24 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Your Reports, Always Accessible
          </h2>
          <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Auto-Save to Profile</h3>
              <p className="mt-2 text-gray-600">All reports automatically saved to your personal dashboard</p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Secure Storage</h3>
              <p className="mt-2 text-gray-600">Your data is encrypted and securely stored in the cloud</p>
            </div>
            <div className="text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900">Easy Access</h3>
              <p className="mt-2 text-gray-600">Retrieve and review your reports anytime from any device</p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mx-auto mt-24 max-w-4xl">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>
          <dl className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
            <div>
              <dt className="text-lg font-semibold text-gray-900">
                Where are my reports saved?
              </dt>
              <dd className="mt-2 text-gray-600">
                All reports are automatically saved to your profile dashboard. You can access them anytime under &quot;My Reports&quot;.
              </dd>
            </div>
            <div>
              <dt className="text-lg font-semibold text-gray-900">
                Can I organize my saved reports?
              </dt>
              <dd className="mt-2 text-gray-600">
                Yes! You can create folders, add tags, and search through all your saved reports for easy organization.
              </dd>
            </div>
            <div>
              <dt className="text-lg font-semibold text-gray-900">
                Do reports expire?
              </dt>
              <dd className="mt-2 text-gray-600">
                No, all purchased reports are saved permanently to your profile and never expire.
              </dd>
            </div>
            <div>
              <dt className="text-lg font-semibold text-gray-900">
                Can I share saved reports with my team?
              </dt>
              <dd className="mt-2 text-gray-600">
                Yes! Business and Enterprise plans include team sharing features. All plans allow basic report sharing.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}