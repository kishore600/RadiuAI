/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useAuth } from "@/components/auth-provider";
import { useEffect, useState } from "react";

export default function ProfilePage() {
  const { user, fetchSavedReports, savedReports } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [expandedReport, setExpandedReport] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);

  // useEffect(() =>{
  //   if(!user){
  //     router.push('/')
  //   }
  // },[user,router])


  useEffect(() => {
    console.log("in");
    fetchSavedReports();
  }, [user]);


  const toggleReport = (reportId: string) => {
    setExpandedReport(expandedReport === reportId ? null : reportId);
    setSelectedSection(null);
  };

  const toggleSection = (section: string) => {
    setSelectedSection(selectedSection === section ? null : section);
  };
  const handleExpandReport = (reportId: string, report: any) => {
    if (expandedReport === reportId) {
      setExpandedReport(null);
    } else {
      setExpandedReport(reportId);

      // Define priority order
      const sectionOrder = [
        "market-intel",
        "opportunity",
        "cultural",
        "recommendation",
      ];

      // Find first section that actually has data
      const defaultSection =
        sectionOrder.find((section) => {
          if (section === "market-intel") return report.marketIntel?.length > 0;
          if (section === "opportunity") return report.opportunity?.length > 0;
          if (section === "cultural") return report.cultural?.length > 0;
          if (section === "recommendation")
            return report.recommendation?.length > 0;
          return false;
        }) || "market-intel"; // fallback if none found

      setSelectedSection(defaultSection);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return "bg-green-100";
    if (score >= 60) return "bg-yellow-100";
    return "bg-red-100";
  };

  const getRatingColor = (rating: string) => {
    if (rating.includes("EXCELLENT") || rating.includes("Excellent"))
      return "bg-green-100 text-green-800";
    if (rating.includes("Moderate")) return "bg-yellow-100 text-yellow-800";
    if (rating.includes("Avoid")) return "bg-red-100 text-red-800";
    return "bg-gray-100 text-gray-800";
  };

  if (expandedReport) {
    setExpandedReport;
  }

  const renderMarketIntelligence = (report: any) => {
    const intel = report.data.retailMarketIntelligence;
    if (!intel) return null;
    console.log(user);
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-200">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-white rounded-xl shadow-sm border border-indigo-200">
              <svg
                className="w-6 h-6 text-indigo-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Retail Market Intelligence
              </h3>
              <p className="text-indigo-700">
                Comprehensive market analysis and competitive landscape
              </p>
            </div>
          </div>
        </div>

        {/* Traffic Score */}
        {intel.Traffic_Score && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-blue-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      Traffic Analysis
                    </h4>
                    <p className="text-sm text-blue-700">
                      Foot traffic and location assessment
                    </p>
                  </div>
                </div>
                <div
                  className={`text-2xl font-bold ${getScoreColor(
                    intel.Traffic_Score.traffic_score * 10
                  )}`}
                >
                  {intel.Traffic_Score.traffic_score}/10
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {intel.Traffic_Score.traffic_score}/10
                  </div>
                  <div className="text-sm text-blue-700">Traffic Score</div>
                  <div className="w-full bg-blue-200 rounded-full h-2 mt-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${intel.Traffic_Score.traffic_score * 10}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <svg
                      className="w-5 h-5 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-gray-900">
                      Location Coordinates
                    </span>
                  </div>
                  <div className="text-lg font-mono text-gray-700">
                    {intel.Traffic_Score.coordinates.latitude.toFixed(4)}
                  </div>
                  <div className="text-lg font-mono text-gray-700">
                    {intel.Traffic_Score.coordinates.longitude.toFixed(4)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Market Factor */}
        {intel.Market_Factor && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      Market Factor Analysis
                    </h4>
                    <p className="text-sm text-green-700">
                      Comprehensive market condition assessment
                    </p>
                  </div>
                </div>
                <div
                  className={`text-2xl font-bold ${getScoreColor(
                    intel.Market_Factor.market_factor * 100
                  )}`}
                >
                  {(intel.Market_Factor.market_factor * 100).toFixed(1)}%
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h5 className="font-semibold text-gray-900">
                      Market Score
                    </h5>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-600">Confidence:</span>
                      <span className="font-semibold text-green-600">
                        {(intel.Market_Factor.confidence * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${getScoreColor(
                        intel.Market_Factor.market_factor * 100
                      ).replace("text-", "bg-")}`}
                      style={{
                        width: `${intel.Market_Factor.market_factor * 100}%`,
                      }}
                    ></div>
                  </div>
                </div>
                <div>
                  <h5 className="font-semibold text-gray-900 mb-3">
                    Component Breakdown
                  </h5>
                  <div className="space-y-3">
                    {Object.entries(intel.Market_Factor.components).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between"
                        >
                          <span className="text-sm text-gray-600 capitalize">
                            {key.replace("_", " ")}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="font-semibold text-gray-900">
                              {value as number}
                            </span>
                            <span className="text-xs text-gray-500">
                              (
                              {(intel.Market_Factor.weights[key] * 100).toFixed(
                                0
                              )}
                              %)
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
              {intel.Market_Factor.notes && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <svg
                      className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <h6 className="font-semibold text-blue-800">
                        Market Insights
                      </h6>
                      <p className="text-blue-700 mt-1 text-sm leading-relaxed">
                        {intel.Market_Factor.notes}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Population Analysis */}
        {intel.Population_Analysis && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-purple-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    Demographic Analysis
                  </h4>
                  <p className="text-sm text-purple-700">
                    Population and competitive landscape
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {intel.Population_Analysis.population?.toLocaleString()}
                  </div>
                  <div className="text-sm text-purple-700">Population</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {intel.Population_Analysis.competition_count}
                  </div>
                  <div className="text-sm text-red-700">Competitors</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {intel.Population_Analysis.multiplier}
                  </div>
                  <div className="text-sm text-blue-700">Multiplier</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {intel.Population_Analysis.income_index}
                  </div>
                  <div className="text-sm text-green-700">Income Index</div>
                </div>
              </div>
              {intel.Population_Analysis.notes && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <svg
                      className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                      />
                    </svg>
                    <p className="text-yellow-700 text-sm leading-relaxed">
                      {intel.Population_Analysis.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Income Data */}
        {intel.Income_Data && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 px-6 py-4 border-b border-emerald-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    Income Trends
                  </h4>
                  <p className="text-sm text-emerald-700">
                    Historical income data and projections
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {intel.Income_Data.data.map((income: any, index: number) => (
                  <div
                    key={income.year}
                    className="group p-4 bg-white border border-emerald-100 rounded-lg hover:border-emerald-300 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-gray-900">
                        {income.year}
                      </span>
                      <div
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          income.confidence_score >= 90
                            ? "bg-green-100 text-green-600"
                            : income.confidence_score >= 80
                            ? "bg-yellow-100 text-yellow-600"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        <span className="text-xs font-bold">
                          {income.confidence_score}%
                        </span>
                      </div>
                    </div>
                    <div className="text-2xl font-bold text-emerald-600">
                      $
                      {income.value.toLocaleString(undefined, {
                        maximumFractionDigits: 0,
                      })}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Average Income
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Competitors */}
        {intel.Existing_Competitors && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-gradient-to-r from-orange-50 to-red-50 px-6 py-4 border-b border-orange-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    Competitive Landscape
                  </h4>
                  <p className="text-sm text-orange-700">
                    Market saturation and competitor analysis
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {intel.Existing_Competitors.data.total_competitors}
                  </div>
                  <div className="text-sm text-blue-700">Total Competitors</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {Math.round(
                      intel.Existing_Competitors.data.statistics
                        .average_distance
                    )}
                    m
                  </div>
                  <div className="text-sm text-green-700">Average Distance</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {intel.Existing_Competitors.data.statistics.business_density.toFixed(
                      1
                    )}
                  </div>
                  <div className="text-sm text-purple-700">
                    Business Density
                  </div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">
                    {Math.round(
                      intel.Existing_Competitors.data.statistics.closest
                        .distance
                    )}
                    m
                  </div>
                  <div className="text-sm text-red-700">Nearest Competitor</div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h5 className="font-semibold text-gray-900">
                    Top Competitors
                  </h5>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Distance
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                          Address
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {intel.Existing_Competitors.data.competitors
                        .slice(0, 10)
                        .map((competitor: any, index: number) => (
                          <tr
                            key={index}
                            className="hover:bg-gray-50 transition-colors"
                          >
                            <td className="px-4 py-3 text-sm font-medium text-gray-900">
                              {competitor.name}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {Math.round(competitor.distance)}m
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {competitor.address}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Cultural Fit */}
        {intel.Cultural_Fit && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 px-6 py-4 border-b border-pink-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-pink-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    Cultural Fit Analysis
                  </h4>
                  <p className="text-sm text-pink-700">
                    Local cultural alignment and sentiment
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="text-center p-6 bg-pink-50 rounded-lg">
                  <div
                    className={`text-3xl font-bold ${getScoreColor(
                      intel.Cultural_Fit.cultural_fit_score * 100
                    )}`}
                  >
                    {(intel.Cultural_Fit.cultural_fit_score * 100).toFixed(1)}%
                  </div>
                  <div className="text-sm text-pink-700 mt-1">
                    Cultural Fit Score
                  </div>
                </div>
                <div className="text-center p-6 bg-purple-50 rounded-lg">
                  <div className="text-3xl font-bold text-purple-600">
                    {intel.Cultural_Fit.sentiment_ratio}
                  </div>
                  <div className="text-sm text-purple-700 mt-1">
                    Sentiment Ratio
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                {intel.Cultural_Fit.insights.map(
                  (insight: string, index: number) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-pink-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-gray-700 text-sm leading-relaxed">
                        {insight}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderMarketOpportunity = (report: any) => {
    const opportunity = report.data.marketOpportunityScore;
    if (!opportunity) return null;

    const overallScore = opportunity.scores.overall;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-white rounded-xl shadow-sm border border-blue-200">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Market Opportunity Analysis
                </h3>
                <p className="text-blue-700">
                  Comprehensive assessment of business potential
                </p>
              </div>
            </div>
            <div
              className={`px-4 py-2 rounded-full text-lg font-bold ${getScoreColor(
                overallScore
              )} ${getScoreBgColor(overallScore)} border`}
            >
              {overallScore.toFixed(1)} / 100
            </div>
          </div>
        </div>

        {/* Overall Rating */}
        <div
          className={`p-6 rounded-xl border-2 ${
            overallScore >= 80
              ? "bg-green-50 border-green-200"
              : overallScore >= 60
              ? "bg-yellow-50 border-yellow-200"
              : "bg-red-50 border-red-200"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  overallScore >= 80
                    ? "bg-green-100 text-green-600"
                    : overallScore >= 60
                    ? "bg-yellow-100 text-yellow-600"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {overallScore >= 80 ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : overallScore >= 60 ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Overall Rating
                </h4>
                <p
                  className={`text-sm font-medium ${
                    overallScore >= 80
                      ? "text-green-700"
                      : overallScore >= 60
                      ? "text-yellow-700"
                      : "text-red-700"
                  }`}
                >
                  {opportunity.rating}
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-gray-900">
                {overallScore.toFixed(1)}
              </div>
              <div className="text-sm text-gray-600">Overall Score</div>
            </div>
          </div>
        </div>

        {/* Location Details */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Location Analysis
                </h4>
                <p className="text-sm text-blue-700">
                  Geographic and business context
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-6 h-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                  </svg>
                </div>
                <div className="font-semibold text-gray-900">
                  {opportunity.location.name}
                </div>
                <div className="text-sm text-gray-600">Location</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-6 h-6 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <div className="font-semibold text-gray-900 capitalize">
                  {opportunity.location.business_type}
                </div>
                <div className="text-sm text-gray-600">Business Type</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-6 h-6 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0"
                    />
                  </svg>
                </div>
                <div className="font-semibold text-gray-900">
                  {opportunity.location.radius_km} km
                </div>
                <div className="text-sm text-gray-600">Analysis Radius</div>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg
                    className="w-6 h-6 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="font-semibold text-gray-900 text-sm">
                  {opportunity.location.latitude.toFixed(4)},{" "}
                  {opportunity.location.longitude.toFixed(4)}
                </div>
                <div className="text-sm text-gray-600">Coordinates</div>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Scores */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-indigo-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-indigo-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">
                  Market Opportunity Scores
                </h4>
                <p className="text-sm text-indigo-700">
                  Detailed breakdown by category
                </p>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(opportunity.scores).map(([key, value]) => (
                <div
                  key={key}
                  className="group p-4 bg-white border border-gray-200 rounded-xl hover:border-indigo-300 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h5 className="font-semibold text-gray-900 capitalize">
                      {key.replace("_", " ")}
                    </h5>
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${getScoreBgColor(
                        value as number
                      )}`}
                    >
                      <span
                        className={`text-sm font-bold ${getScoreColor(
                          value as number
                        )}`}
                      >
                        {(value as number).toFixed(0)}
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        (value as number) >= 80
                          ? "bg-green-500"
                          : (value as number) >= 60
                          ? "bg-yellow-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${value as number}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>0</span>
                    <span>50</span>
                    <span>100</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Opportunities */}
        {opportunity.opportunities && opportunity.opportunities.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    Growth Opportunities
                  </h4>
                  <p className="text-sm text-green-700">
                    Potential areas for business success
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {opportunity.opportunities.map((opp: string, index: number) => (
                  <div
                    key={index}
                    className="group flex items-start space-x-4 p-4 bg-green-50 border border-green-200 rounded-lg hover:border-green-300 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                      <svg
                        className="w-4 h-4 text-green-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 leading-relaxed">{opp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Risk Factors */}
        {opportunity.risk_factors && opportunity.risk_factors.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 border-b border-red-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    Risk Factors
                  </h4>
                  <p className="text-sm text-red-700">
                    Areas requiring attention and mitigation
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {opportunity.risk_factors.map((risk: string, index: number) => (
                  <div
                    key={index}
                    className="group flex items-start space-x-4 p-4 bg-red-50 border border-red-200 rounded-lg hover:border-red-300 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors">
                      <svg
                        className="w-4 h-4 text-red-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 leading-relaxed">{risk}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Summary Card */}
        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-6 border border-gray-300">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">
                Investment Readiness
              </h4>
              <p className="text-gray-600">
                {overallScore >= 80
                  ? "High potential for success with strong market conditions"
                  : overallScore >= 60
                  ? "Moderate opportunity with some areas for improvement"
                  : "Significant challenges identified - careful consideration required"}
              </p>
            </div>
            <div className="text-right">
              <div
                className={`text-2xl font-bold ${getScoreColor(overallScore)}`}
              >
                {overallScore >= 80
                  ? "Strong"
                  : overallScore >= 60
                  ? "Moderate"
                  : "Weak"}
              </div>
              <div className="text-sm text-gray-600">Confidence Level</div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  const renderCulturalIntelligence = (report: any) => {
    const cultural = report.data.culturalIntelligence;
    if (!cultural) return null;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-white rounded-xl shadow-sm border border-purple-200">
              <svg
                className="w-6 h-6 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Cultural Intelligence
              </h3>
              <p className="text-purple-700">
                Local insights and cultural adaptation strategies
              </p>
            </div>
          </div>
        </div>

        {/* Menu Recommendations */}
        {cultural.menu_recommendations && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-green-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 8h6m-6 4h6m-6 4h6"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    Menu Recommendations
                  </h4>
                  <p className="text-sm text-green-700">
                    Curated suggestions for local preferences
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {cultural.menu_recommendations.map(
                  (recommendation: string, index: number) => (
                    <div
                      key={index}
                      className="group flex items-start space-x-4 p-4 bg-white border border-green-100 rounded-lg hover:border-green-300 hover:shadow-sm transition-all duration-200"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                        <span className="text-sm font-semibold text-green-700">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-gray-700 leading-relaxed">
                          {recommendation}
                        </p>
                      </div>
                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <svg
                          className="w-4 h-4 text-green-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* Marketing Ideas */}
        {cultural.marketing_ideas && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    Marketing Strategies
                  </h4>
                  <p className="text-sm text-blue-700">
                    Creative ideas to engage the local community
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {cultural.marketing_ideas.map((idea: string, index: number) => (
                  <div
                    key={index}
                    className="group flex items-start space-x-4 p-4 bg-white border border-blue-100 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                      <svg
                        className="w-4 h-4 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 10V3L4 14h7v7l9-11h-7z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 leading-relaxed">{idea}</p>
                    </div>
                    <div className="flex-shrink-0 text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Local Events */}
        {cultural.local_festivals_or_events && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-gradient-to-r from-purple-50 to-fuchsia-50 px-6 py-4 border-b border-purple-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-purple-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    Local Events & Festivals
                  </h4>
                  <p className="text-sm text-purple-700">
                    Key community gatherings and celebrations
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cultural.local_festivals_or_events.map(
                  (event: string, index: number) => (
                    <div
                      key={index}
                      className="group p-4 bg-white border border-purple-100 rounded-lg hover:border-purple-300 hover:shadow-sm transition-all duration-200"
                    >
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                          <span className="text-sm font-semibold text-purple-700">
                            {index + 1}
                          </span>
                        </div>
                        <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                            />
                          </svg>
                        </div>
                      </div>
                      <p className="text-gray-700 font-medium leading-relaxed">
                        {event}
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>
        )}

        {/* Cultural Tips */}
        {cultural.cultural_tips && (
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 border-b border-orange-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-orange-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <h4 className="text-lg font-semibold text-gray-900">
                    Cultural Best Practices
                  </h4>
                  <p className="text-sm text-orange-700">
                    Essential tips for cultural integration
                  </p>
                </div>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {cultural.cultural_tips.map((tip: string, index: number) => (
                  <div
                    key={index}
                    className="group flex items-start space-x-4 p-4 bg-white border border-orange-100 rounded-lg hover:border-orange-300 hover:shadow-sm transition-all duration-200"
                  >
                    <div className="flex-shrink-0 w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-200 transition-colors">
                      <svg
                        className="w-4 h-4 text-orange-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                        />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-700 leading-relaxed">{tip}</p>
                    </div>
                    <div className="flex-shrink-0 text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
            <div className="text-2xl font-bold text-green-600">
              {cultural.menu_recommendations?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Menu Ideas</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {cultural.marketing_ideas?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Marketing Strategies</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {cultural.local_festivals_or_events?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Local Events</div>
          </div>
          <div className="bg-white p-4 rounded-xl border border-gray-200 text-center">
            <div className="text-2xl font-bold text-orange-600">
              {cultural.cultural_tips?.length || 0}
            </div>
            <div className="text-sm text-gray-600">Cultural Tips</div>
          </div>
        </div>
      </div>
    );
  };

  const renderBusinessRecommendation = (report: any) => {
    const recommendation = report.data.businessRecommendation;
    if (!recommendation) return null;

    const paragraphs = recommendation.recommendation
      .split("\n")
      .filter((p: string) => p.trim());

    return (
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-white rounded-lg shadow-sm border border-gray-200">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Business Recommendation
                </h3>
                <p className="text-sm text-gray-600">
                  Based on comprehensive market analysis
                </p>
              </div>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                recommendation.recommendation.includes("**Avoid**")
                  ? "bg-red-100 text-red-800 border border-red-200"
                  : recommendation.recommendation.includes("**Moderate**")
                  ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                  : "bg-green-100 text-green-800 border border-green-200"
              }`}
            >
              {recommendation.recommendation.includes("**Avoid**")
                ? "Not Recommended"
                : recommendation.recommendation.includes("**Moderate**")
                ? "Moderate Risk"
                : "Recommended"}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 space-y-6">
          {/* Final Recommendation Card */}
          <div
            className={`p-4 rounded-lg border-2 ${
              recommendation.recommendation.includes("**Avoid**")
                ? "bg-red-50 border-red-200"
                : recommendation.recommendation.includes("**Moderate**")
                ? "bg-yellow-50 border-yellow-200"
                : "bg-green-50 border-green-200"
            }`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  recommendation.recommendation.includes("**Avoid**")
                    ? "bg-red-100 text-red-600"
                    : recommendation.recommendation.includes("**Moderate**")
                    ? "bg-yellow-100 text-yellow-600"
                    : "bg-green-100 text-green-600"
                }`}
              >
                {recommendation.recommendation.includes("**Avoid**") ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : recommendation.recommendation.includes("**Moderate**") ? (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
              </div>
              <div>
                <h4
                  className={`text-lg font-bold ${
                    recommendation.recommendation.includes("**Avoid**")
                      ? "text-red-800"
                      : recommendation.recommendation.includes("**Moderate**")
                      ? "text-yellow-800"
                      : "text-green-800"
                  }`}
                >
                  {recommendation.recommendation.includes("**Avoid**")
                    ? "Avoid Investment"
                    : recommendation.recommendation.includes("**Moderate**")
                    ? "Moderate Investment Opportunity"
                    : "Excellent Investment Opportunity"}
                </h4>
                <p
                  className={`text-sm ${
                    recommendation.recommendation.includes("**Avoid**")
                      ? "text-red-700"
                      : recommendation.recommendation.includes("**Moderate**")
                      ? "text-yellow-700"
                      : "text-green-700"
                  }`}
                >
                  {paragraphs.find((p: string) =>
                    p.includes("Final Recommendation")
                  ) || "Based on comprehensive market analysis"}
                </p>
              </div>
            </div>
          </div>

          {/* Key Reasons */}
          <div className="bg-gray-50 rounded-lg p-5">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-red-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900">
                Key Concerns
              </h4>
            </div>
            <div className="space-y-3">
              {paragraphs
                .filter((p: string) => p.match(/^\d+\./))
                .map((reason: string, index: number) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex-shrink-0 w-6 h-6 bg-red-50 rounded-full flex items-center justify-center mt-0.5">
                      <span className="text-sm font-semibold text-red-600">
                        {index + 1}
                      </span>
                    </div>
                    <p className="text-gray-700 leading-relaxed">
                      {reason.replace(/^\d+\.\s*/, "")}
                    </p>
                  </div>
                ))}
            </div>
          </div>

          {/* Next Steps */}
          <div className="bg-blue-50 rounded-lg p-5 border border-blue-200">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-blue-900">
                Recommended Next Steps
              </h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paragraphs
                .filter((p: string) => p.match(/^\d+\./) && p.includes(":"))
                .map((step: string, index: number) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg p-4 border border-blue-100 hover:border-blue-300 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-blue-600">
                          {index + 1}
                        </span>
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900 mb-1">
                          {step.split(":")[0].replace(/^\d+\.\s*/, "")}
                        </h5>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {step.split(":").slice(1).join(":").trim()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Conclusion */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-5 border border-gray-300">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-6 h-6 bg-gray-200 rounded-lg flex items-center justify-center">
                <svg
                  className="w-4 h-4 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-gray-900">
                Conclusion
              </h4>
            </div>
            <p className="text-gray-700 leading-relaxed italic">
              {paragraphs[paragraphs.length - 1]}
            </p>
          </div>

          {/* Confidence Meter */}
          <div className="bg-white rounded-lg p-5 border border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-semibold text-gray-900">
                Analysis Confidence
              </h4>
              <span className="text-sm font-medium text-blue-600">
                Based on comprehensive data review
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className={`h-3 rounded-full ${
                  recommendation.recommendation.includes("**Avoid**")
                    ? "bg-red-500"
                    : recommendation.recommendation.includes("**Moderate**")
                    ? "bg-yellow-500"
                    : "bg-green-500"
                }`}
                style={{ width: "85%" }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Low Confidence</span>
              <span>High Confidence</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Last updated: {formatDate(report.createdAt)}</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <span>AI-Powered Analysis</span>
            </div>
          </div>
        </div>
      </div>
    );
  };
const CustomAvatar = ({ src, alt, fallback, className = "" }:any) => {
  const [imgError, setImgError] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {!imgError && src ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover rounded-2xl border-4 border-blue-100 shadow-lg"
          onError={() => setImgError(true)}
        />
      ) : (
        <div className="w-full h-full rounded-2xl border-4 border-blue-100 shadow-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
          <span className="text-white font-bold text-2xl">
            {fallback?.charAt(0).toUpperCase() || "U"}
          </span>
        </div>
      )}
    </div>
  );
};
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-gray-50 to-blue-50/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 mb-8 transform hover:shadow-xl transition-all duration-300">
          <div className="flex items-center space-x-6">
            <div className="relative">
      <CustomAvatar
  src={user?.picture}
  alt={user?.name || "User Avatar"}
  fallback={user?.name || "User"}
  className="w-20 h-20"
/>
              <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-green-400 rounded-full border-2 border-white shadow-lg"></div>
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {user?.name}
              </h1>
              <p className="text-gray-600 text-lg mt-1">{user?.email}</p>
              <div className="flex items-center space-x-4 mt-3">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                  <svg
                    className="w-4 h-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Verified Account
                </span>
                <span className="text-sm text-gray-500">
                  Member since {user ? new Date().getFullYear() : "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 mb-8 overflow-hidden">
          <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50/50">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab("profile")}
                className={`flex-1 py-5 px-8 text-center border-b-2 font-semibold text-base transition-all duration-300 group ${
                  activeTab === "profile"
                    ? "border-blue-500 text-blue-600 bg-white shadow-sm"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-white/50"
                }`}
              >
                <div className="flex items-center justify-center space-x-3">
                  <svg
                    className={`w-5 h-5 transition-colors ${
                      activeTab === "profile"
                        ? "text-blue-500"
                        : "text-gray-400 group-hover:text-gray-600"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span>Profile Information</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("reports")}
                className={`flex-1 py-5 px-8 text-center border-b-2 font-semibold text-base transition-all duration-300 group ${
                  activeTab === "reports"
                    ? "border-blue-500 text-blue-600 bg-white shadow-sm"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-white/50"
                }`}
              >
                <div className="flex items-center justify-center space-x-3">
                  <svg
                    className={`w-5 h-5 transition-colors ${
                      activeTab === "reports"
                        ? "text-blue-500"
                        : "text-gray-400 group-hover:text-gray-600"
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>Saved Reports</span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-bold ${
                      activeTab === "reports"
                        ? "bg-blue-100 text-blue-600"
                        : "bg-gray-100 text-gray-600 group-hover:bg-gray-200"
                    }`}
                  >
                    {savedReports?.length || 0}
                  </span>
                </div>
              </button>
            </nav>
          </div>

          <div className="p-8">
            {activeTab === "profile" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
                      <label className="block text-sm font-semibold text-blue-800 mb-3 uppercase tracking-wide">
                        Full Name
                      </label>
                      <div className="text-lg font-medium text-gray-900 bg-white/50 rounded-lg px-4 py-3 border border-blue-200">
                        {user?.name || "Not provided"}
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
                      <label className="block text-sm font-semibold text-green-800 mb-3 uppercase tracking-wide">
                        Email Address
                      </label>
                      <div className="text-lg font-medium text-gray-900 bg-white/50 rounded-lg px-4 py-3 border border-green-200">
                        {user?.email || "Not provided"}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
                      <h3 className="text-lg font-semibold text-purple-800 mb-3">
                        Account Overview
                      </h3>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Member since</span>
                          <span className="font-semibold text-gray-900">
                            {user
                              ? new Date().toLocaleDateString("en-US", {
                                  year: "numeric",
                                  month: "long",
                                })
                              : "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Reports created</span>
                          <span className="font-semibold text-gray-900">
                            {savedReports?.length || 0}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Status</span>
                          <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">
                            Active
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "reports" && (
              <div className="space-y-8">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      Saved Analysis Reports
                    </h2>
                    <p className="text-gray-600 mt-2">
                      Comprehensive market analysis and business intelligence
                      reports
                    </p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                      {savedReports?.length || 0} report
                      {savedReports?.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>

                {!savedReports || savedReports.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
                      <svg
                        className="w-12 h-12 text-blue-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                      No reports yet
                    </h3>
                    <p className="text-gray-600 max-w-md mx-auto mb-6">
                      Start your first market analysis to get detailed insights
                      and recommendations for your business.
                    </p>
                    <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold">
                      Create First Report
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {savedReports.map((report: any) => (
                      <div
                        key={report._id}
                        className="bg-white rounded-2xl border border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden group"
                      >
                        <div
                          className="p-6 cursor-pointer flex justify-between items-center"
                          onClick={() => {
                            toggleReport(report._id);
                            handleExpandReport(report._id, report);
                          }}
                        >
                          <div className="flex-1">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                                <svg
                                  className="w-6 h-6 text-white"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                    {report.reportName}
                                  </h3>
                                  {report.data.marketOpportunityScore && (
                                    <span
                                      className={`px-3 py-1 rounded-full text-sm font-bold ${getRatingColor(
                                        report.data.marketOpportunityScore
                                          .rating
                                      )}`}
                                    >
                                      {
                                        report.data.marketOpportunityScore
                                          .rating
                                      }
                                    </span>
                                  )}
                                </div>
                                <p className="text-gray-500 mt-1 flex items-center space-x-2">
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  <span>
                                    Created {formatDate(report.createdAt)}
                                  </span>
                                </p>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            {report.data.marketOpportunityScore && (
                              <div className="text-right">
                                <div
                                  className={`text-2xl font-bold ${getScoreColor(
                                    report.data.marketOpportunityScore.scores
                                      .overall
                                  )}`}
                                >
                                  {report.data.marketOpportunityScore.scores.overall.toFixed(
                                    1
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 font-medium">
                                  Overall Score
                                </div>
                              </div>
                            )}
                            <svg
                              className={`w-6 h-6 text-gray-400 transform transition-transform duration-300 ${
                                expandedReport === report._id
                                  ? "rotate-180 text-blue-500"
                                  : "group-hover:text-gray-600"
                              }`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 9l-7 7-7-7"
                              />
                            </svg>
                          </div>
                        </div>

                        {expandedReport === report._id && (
                          <div className="border-t border-gray-200 bg-gradient-to-br from-gray-50 to-blue-50/30 p-8">
                            {/* Enhanced Section Navigation */}
                            <div className="flex flex-wrap gap-3 mb-8">
                              <button
                                onClick={() => toggleSection("market-intel")}
                                className={`px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center space-x-2 ${
                                  selectedSection === "market-intel"
                                    ? "bg-blue-500 text-white shadow-lg shadow-blue-200"
                                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:shadow-md"
                                }`}
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                  />
                                </svg>
                                <span>Market Intelligence</span>
                              </button>
                              <button
                                onClick={() => toggleSection("opportunity")}
                                className={`px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center space-x-2 ${
                                  selectedSection === "opportunity"
                                    ? "bg-green-500 text-white shadow-lg shadow-green-200"
                                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:shadow-md"
                                }`}
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                                  />
                                </svg>
                                <span>Market Opportunity</span>
                              </button>
                              <button
                                onClick={() => toggleSection("cultural")}
                                className={`px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center space-x-2 ${
                                  selectedSection === "cultural"
                                    ? "bg-purple-500 text-white shadow-lg shadow-purple-200"
                                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:shadow-md"
                                }`}
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                                <span>Cultural Intelligence</span>
                              </button>
                              <button
                                onClick={() => toggleSection("recommendation")}
                                className={`px-6 py-3 text-sm font-semibold rounded-xl transition-all duration-300 flex items-center space-x-2 ${
                                  selectedSection === "recommendation"
                                    ? "bg-orange-500 text-white shadow-lg shadow-orange-200"
                                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:shadow-md"
                                }`}
                              >
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                  />
                                </svg>
                                <span>Recommendation</span>
                              </button>
                            </div>

                            {/* Section Content */}
                            <div className="min-h-[400px]">
                              {!selectedSection ? (
                                <div className="text-center py-16">
                                  <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                    <svg
                                      className="w-10 h-10 text-blue-400"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={1.5}
                                        d="M19 9l-7 7-7-7"
                                      />
                                    </svg>
                                  </div>
                                  <h4 className="text-2xl font-bold text-gray-900 mb-3">
                                    Select a Section
                                  </h4>
                                  <p className="text-gray-600 max-w-md mx-auto">
                                    Choose from the sections above to explore
                                    detailed market analysis, opportunities, and
                                    recommendations for this location.
                                  </p>
                                </div>
                              ) : (
                                <>
                                  {selectedSection === "market-intel" &&
                                    renderMarketIntelligence(report)}
                                  {selectedSection === "opportunity" &&
                                    renderMarketOpportunity(report)}
                                  {selectedSection === "cultural" &&
                                    renderCulturalIntelligence(report)}
                                  {selectedSection === "recommendation" &&
                                    renderBusinessRecommendation(report)}
                                </>
                              )}
                            </div>

                            {/* Enhanced Action Buttons */}
                            <div className="flex justify-end space-x-4 mt-8 pt-6 border-t border-gray-300">
                              <button className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold flex items-center space-x-2">
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                  />
                                </svg>
                                <span>View Full Report</span>
                              </button>
                              <button className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold flex items-center space-x-2">
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                  />
                                </svg>
                                <span>Download PDF</span>
                              </button>
                              <button className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all duration-300 font-semibold flex items-center space-x-2">
                                <svg
                                  className="w-4 h-4"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                  />
                                </svg>
                                <span>Delete Report</span>
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
