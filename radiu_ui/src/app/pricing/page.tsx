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
    price: "$5",
    period: "one-time",
    description: "Great for occasional research",
    reports: "6 reports",
    freeReports: "+1 free",
    features: [
      "6 detailed market reports",
      "Complete market intelligence",
      "Detailed competitor mapping",
      "Cultural fit analysis",
      "Priority processing",
      "PDF export capabilities",
    ],
    cta: "Buy Starter Pack",
    popular: false,
    color: "from-blue-500 to-cyan-500",
    badge: "Save 17%",
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
      "Export capabilities",
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
      "Data export in multiple formats",
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
      "White-label reports",
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
  const { user: userId } = useAuth();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCheckout = async (tier: any) => {
    try {
      const response = await fetch(
        "http://localhost:8000/api/payment/create-checkout-session",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: tier, userId }),
        }
      );

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url; // Redirect to Stripe Checkout
      } else {
        alert("Failed to start checkout session");
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
            Get more value with every bundle. The larger the pack, the more you
            save per report!
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

        {/* Comparison Table */}
        <div className="mt-24">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Compare Plans
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
              See how much you save with each bundle
            </p>
          </div>

          <div className="mt-12 overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-2xl">
            <table className="min-w-full divide-y divide-gray-300">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                    Plan
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Total Reports
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Price
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Cost per Report
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
                    Savings
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                <tr>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    Free Trial
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500">
                    1
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500">
                    $0
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500">
                    $0
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500">
                    -
                  </td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    Starter Pack
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500">
                    6
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500">
                    $5
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500">
                    $0.83
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-green-600 font-semibold">
                    17%
                  </td>
                </tr>
                <tr className="bg-purple-50">
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    Pro Bundle
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500">
                    12
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500">
                    $10
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500">
                    $0.83
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-green-600 font-semibold">
                    33%
                  </td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    Power User
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500">
                    24
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500">
                    $24
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500">
                    $1.00
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-green-600 font-semibold">
                    50%
                  </td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    Business Pack
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500">
                    50
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500">
                    $49
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500">
                    $0.98
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-green-600 font-semibold">
                    51%
                  </td>
                </tr>
                <tr>
                  <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                    Enterprise Suite
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500">
                    100
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500">
                    $99
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-gray-500">
                    $0.99
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-center text-sm text-green-600 font-semibold">
                    51%
                  </td>
                </tr>
              </tbody>
            </table>
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
                Do reports expire?
              </dt>
              <dd className="mt-2 text-gray-600">
                No, all purchased reports are yours forever and never expire.
                You can access them anytime from your dashboard.
              </dd>
            </div>
            <div>
              <dt className="text-lg font-semibold text-gray-900">
                Can I share reports with my team?
              </dt>
              <dd className="mt-2 text-gray-600">
                Yes! All plans allow you to share reports. Business and
                Enterprise plans include team collaboration features.
              </dd>
            </div>
            <div>
              <dt className="text-lg font-semibold text-gray-900">
                What payment methods do you accept?
              </dt>
              <dd className="mt-2 text-gray-600">
                We accept all major credit cards, PayPal, and bank transfers.
                All payments are processed securely.
              </dd>
            </div>
            <div>
              <dt className="text-lg font-semibold text-gray-900">
                Can I upgrade my bundle later?
              </dt>
              <dd className="mt-2 text-gray-600">
                Absolutely! You can upgrade anytime and only pay the difference
                between your current bundle and the new one.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
