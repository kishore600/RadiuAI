"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Sparkles,
  TrendingUp,
  MapPin,
  Users,
  Target,
  BarChart3,
  Shield,
  Zap,
  CheckCircle,
  ArrowRight,
  Play,
  Award,
  Clock,
  DollarSign,
  Building,
  ChartBar,
  Lightbulb,
  Search,
} from "lucide-react";
import CommonHeader from "@/components/common-header";
import CommonParameterControl from "@/components/common-parameter-control";
import { AuthProvider, useAuth } from "@/components/auth-provider";

export default function Home() {
  const [activeFeature, setActiveFeature] = useState(0);
  const { user } = useAuth();

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const features = [
    {
      icon: BarChart3,
      title: "Retail Market Intelligence (RMI)",
      description:
        "Deep dive into the real-world retail environment around your target location",
      color: "from-blue-500 to-cyan-500",
      details: [
        "Traffic Score Analysis (0-1 scale)",
        "Market Factor Composite Scoring",
        "Population & Demographic Analysis",
        "Competitor Mapping & Density",
        "Income Trend Analysis",
        "Cultural Fit Assessment",
      ],
      insights:
        "Understand exactly what the current market looks like - from foot traffic to competition density",
    },
    {
      icon: Target,
      title: "Market Opportunity Score (MOS)",
      description: "Comprehensive scoring system evaluating business viability",
      color: "from-green-500 to-emerald-500",
      details: [
        "Demographics Scoring (0-100)",
        "Competition Intensity Analysis",
        "Accessibility & Location Factors",
        "Growth Potential Assessment",
        "Cultural Factor Integration",
        "Overall Investment Rating",
      ],
      insights:
        "Get a clear, data-driven rating on whether a location is worth investing in",
    },
    {
      icon: Users,
      title: "Cultural Intelligence (CI)",
      description: "Local preferences, behaviors, and adaptation strategies",
      color: "from-purple-500 to-pink-500",
      details: [
        "Menu & Product Recommendations",
        "Marketing Strategy Ideas",
        "Local Event Integration",
        "Cultural Adaptation Tips",
        "Community Engagement Plans",
        "Seasonal Opportunity Mapping",
      ],
      insights:
        "Align your business with local culture for better acceptance and success",
    },
    {
      icon: TrendingUp,
      title: "Business Recommendation",
      description: "AI-powered final verdict with actionable next steps",
      color: "from-orange-500 to-red-500",
      details: [
        "Clear Investment Recommendation",
        "Key Risk Factor Identification",
        "Opportunity Assessment",
        "Practical Next Steps",
        "Competitive Advantage Analysis",
        "Risk Mitigation Strategies",
      ],
      insights:
        "Receive a definitive go/no-go decision backed by comprehensive data analysis",
    },
  ];

  const pricingTiers = [
    {
      name: "Free",
      price: "$0",
      period: "day",
      description: "Perfect for initial exploration",
      features: [
        "1 comprehensive report per day",
        "Basic market insights",
        "Standard competitor analysis",
        "Essential demographic data",
        "Email support",
      ],
      cta: "Get Started Free",
      popular: false,
      color: "from-gray-500 to-gray-600",
    },
    {
      name: "Single Report",
      price: "$1",
      period: "report",
      description: "One-time detailed analysis",
      features: [
        "Download full PDF report",
        "Complete market intelligence",
        "Detailed competitor mapping",
        "Cultural fit analysis",
        "Priority processing",
      ],
      cta: "Buy Single Report",
      popular: false,
      color: "from-blue-500 to-cyan-500",
    },
    {
      name: "5-Pack",
      price: "$5",
      period: "bundle",
      description: "Most popular - Save 20%",
      features: [
        "5 detailed market reports",
        "Bonus comparative insights",
        "Advanced visualization",
        "Export capabilities",
        "Dedicated support",
      ],
      cta: "Buy 5-Pack",
      popular: true,
      color: "from-purple-500 to-pink-500",
    },
    {
      name: "12-Pack",
      price: "$10",
      period: "bundle",
      description: "Best value - Save 58%",
      features: [
        "12 comprehensive reports",
        "Advanced AI insights",
        "Custom analysis parameters",
        "API access (basic)",
        "Premium support",
      ],
      cta: "Buy 12-Pack",
      popular: false,
      color: "from-green-500 to-emerald-500",
    },
  ];

  return (
    <div className="min-h-screen   bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {!user && (
        <div>
          {/* Hero Section - CORRECTED LAYOUT */}
          <section className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
            <div className="relative  mx-auto px-4 sm:px-6 lg:px-8 py-20">
              <div className="grid lg:grid-cols-2 gap-12 items-center">
                {/* Left Column - Text Content */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8 }}
                  className="text-left"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 mb-8 border border-blue-200 shadow-lg"
                  >
                    <Sparkles className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-semibold text-blue-600">
                      AI-Powered Market Intelligence
                    </span>
                  </motion.div>

                  <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                    Smarter Business
                    <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      Decisions Start Here
                    </span>
                  </h1>

                  <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                    Analyze real market opportunities with comprehensive
                    location-based intelligence.{" "}
                    <span className="font-semibold text-gray-900">
                      Make data-driven choices with confidence.
                    </span>
                  </p>

                  {/* Stats Grid - CORRECTED LAYOUT */}
                  <div className="grid grid-cols-2 gap-6 mb-8">
                    {[
                      { number: "10K+", label: "Market Analytics" },
                      { number: "99.9%", label: "Accuracy Rate" },
                      { number: "24/7", label: "All Monitoring" },
                      { number: "50+", label: "Cities Covered" },
                    ].map((stat, index) => (
                      <div key={index} className="text-left">
                        <div className="text-2xl md:text-3xl font-bold text-gray-900">
                          {stat.number}
                        </div>
                        <div className="text-sm text-gray-600">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Right Column - Auth Component */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="flex justify-center"
                >
                  <div className="w-full max-w-md">
                    <AuthProvider>
                      <CommonHeader
                        data={{
                          headerTitle: "Home - Radiu AI",
                          headerTitleSubtext:
                            "Complete Business Intelligence Ecosystem",
                          headerDescription:
                            "Analyze real market opportunities with comprehensive location-based intelligence",
                          modelComponent: <CommonParameterControl />,
                        }}
                      />
                    </AuthProvider>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Four Powerful Intelligence Models Section - CORRECTED */}
          <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-16"
              >
                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                  Four Powerful Intelligence Models
                </h2>
                <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                  Our AI analyzes multiple data dimensions to give you a
                  complete picture of any market opportunity.
                </p>
              </motion.div>

              {/* First Feature Highlight */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-center mb-12"
              >
                <div className="inline-flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-full px-6 py-3 mb-4">
                  <BarChart3 className="h-5 w-5 text-blue-600" />
                  <span className="text-lg font-semibold text-blue-600">
                    Retail Market Intelligence (RMI)
                  </span>
                </div>

                <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                  Comprehensive analysis of retail environments, competitor
                  landscape, and market viability factors.
                </p>
              </motion.div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}
                    >
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* How It Works Section */}
          <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="text-center mb-16"
              >
                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-6">
                  How Radiu AI Works
                </h2>
              </motion.div>

              <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
                {[
                  {
                    step: "01",
                    title: "Enter Location",
                    description:
                      "Provide the business location you want to analyze",
                    icon: MapPin,
                    color: "from-blue-500 to-cyan-500",
                  },
                  {
                    step: "02",
                    title: "AI Analysis",
                    description:
                      "Our models process 50+ data points across 4 dimensions",
                    icon: ChartBar,
                    color: "from-purple-500 to-pink-500",
                  },
                  {
                    step: "03",
                    title: "Get Insights",
                    description:
                      "Receive comprehensive report with clear recommendations",
                    icon: Lightbulb,
                    color: "from-green-500 to-emerald-500",
                  },
                ].map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.2 }}
                    className="text-center"
                  >
                    <div
                      className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mx-auto mb-6 shadow-lg`}
                    >
                      <step.icon className="h-10 w-10 text-white" />
                    </div>
                    <div className="text-sm font-semibold text-gray-500 mb-2">
                      STEP {step.step}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">
                      {step.title}
                    </h3>
                    <p className="text-gray-600">{step.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="py-20 bg-gradient-to-r from-gray-900 to-blue-900 text-white">
            <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h2 className="text-3xl md:text-5xl font-bold mb-6">
                  Ready to Make Smarter Business Decisions?
                </h2>
                <p className="text-xl text-blue-200 mb-8">
                  Get your first AI-powered market analysis completely free - no
                  credit card required
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-8 py-4 bg-white text-blue-600 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    Start Free Analysis Now
                  </motion.button>
                </div>

                <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6 text-sm text-blue-300">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Setup in 2 minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4" />
                    <span>Professional-grade insights</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>
        </div>
      )}

      {user && (
        <div>
          <AuthProvider>
            <CommonHeader
              data={{
                headerTitle: "Home - Radiu AI",
                headerTitleSubtext: "Complete Business Intelligence Ecosystem",
                headerDescription:
                  "Analyze real market opportunities with comprehensive location-based intelligence",
                modelComponent: <CommonParameterControl />,
              }}
            />
          </AuthProvider>
        </div>
      )}
    </div>
  );
}
