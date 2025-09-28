/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Users,
  AlertCircle,
  Sparkles,
  MapPin,
  Target,
  TrendingUp,
  Car,
  Building2,
  DollarSign,
  Heart,
  Shield,
  Clock,
  BarChart3,
  Eye,
  Crown,
  Award,
  Lightbulb,
  Download,
  Share,
  Zap,
} from "lucide-react";

interface MarketIntelligenceData {
  Traffic_Score: {
    coordinates: { latitude: number; longitude: number };
    traffic_score: number;
    top_poi_categories: Array<{
      rank: number;
      category: string;
      count: number;
    }>;
  };
  Market_Factor: {
    market_factor: number;
    components: {
      rent_index: number;
      regulatory_index: number;
      seasonality_index: number;
      competition_density: number;
    };
    confidence: number;
    notes: string;
  };
  Population_Analysis: {
    multiplier: number;
    confidence: number;
    population: number;
    competition_count: number;
    income_index: number;
    notes: string;
    coordinates: [number, number];
    radius_km: number;
  };
  Income_Data: {
    data: Array<{
      year: string;
      value: number;
      confidence_score: number;
    }>;
  };
  Existing_Competitors: {
    data: {
      total_competitors: number;
      competitors: Array<{
        name: string;
        type: string;
        distance: number;
        latitude: number;
        longitude: number;
        address: string;
      }>;
      statistics: {
        closest: { name: string; distance: number };
        average_distance: number;
        business_density: number;
      };
    };
  };
  Cultural_Fit: {
    location: string;
    cultural_fit_score: number;
    sentiment_ratio: number;
    insights: string[];
  };
}

// Market Analysis Cards Component
function MarketAnalysisCards({ data }: { data: MarketIntelligenceData }) {
  const cards = [
    {
      title: "Traffic Score",
      value: data.Traffic_Score.traffic_score * 100,
      icon: Car,
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
    },
    {
      title: "Market Factor",
      value: data.Market_Factor.market_factor * 100,
      icon: TrendingUp,
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
    },
    {
      title: "Population Multiplier",
      value: data.Population_Analysis.multiplier * 100,
      icon: Users,
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
    },
    {
      title: "Cultural Fit",
      value: data.Cultural_Fit.cultural_fit_score * 100,
      icon: Heart,
      color: "from-pink-500 to-pink-600",
      bgColor: "bg-pink-50",
      textColor: "text-pink-700",
    },
  ];
  console.log(data);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <Card
            key={index}
            className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50"
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`p-3 rounded-lg bg-gradient-to-r ${card.color}`}
                >
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <Badge className={`${card.bgColor} ${card.textColor} border-0`}>
                  {card.value.toFixed(1)}%
                </Badge>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {card.title}
              </h3>
              <Progress value={card.value} className="h-2 bg-gray-200">
                <div
                  className="h-full bg-gradient-to-r transition-all duration-1000"
                  style={{
                    width: `${card.value}%`,
                    background: `linear-gradient(to right, ${
                      card.color.split(" ")[1]
                    }, ${card.color.split(" ")[3]})`,
                  }}
                />
              </Progress>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// Market Factor Chart Component
function MarketFactorChart({
  data,
}: {
  data: MarketIntelligenceData["Market_Factor"];
}) {
  const factors = [
    {
      name: "Rent Index",
      value: data.components.rent_index * 100,
      color: "#3B82F6",
    },
    {
      name: "Regulatory Index",
      value: data.components.regulatory_index * 100,
      color: "#10B981",
    },
    {
      name: "Seasonality Index",
      value: data.components.seasonality_index * 100,
      color: "#F59E0B",
    },
    {
      name: "Competition Density",
      value: data.components.competition_density * 100,
      color: "#EF4444",
    },
  ];

  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl font-semibold">
          <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          Market Factor Analysis
        </CardTitle>
        <CardDescription>Breakdown of key market components</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center">
          <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent mb-2">
            {(data.market_factor * 100).toFixed(1)}%
          </div>
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Overall Market Factor
          </Badge>
        </div>

        <div className="space-y-3">
          {factors.map((factor, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-700">{factor.name}</span>
                <span className="font-bold" style={{ color: factor.color }}>
                  {factor.value.toFixed(1)}%
                </span>
              </div>
              <Progress value={factor.value} className="h-2 bg-gray-200">
                <div
                  className="h-full transition-all duration-1000"
                  style={{
                    width: `${factor.value}%`,
                    backgroundColor: factor.color,
                  }}
                />
              </Progress>
            </div>
          ))}
        </div>

        <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-700">{data.notes}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Income Trend Chart Component
function IncomeTrendChart({
  data,
}: {
  data: MarketIntelligenceData["Income_Data"]["data"];
}) {
  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl font-semibold">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
            <DollarSign className="h-5 w-5 text-white" />
          </div>
          Income Trend Analysis
        </CardTitle>
        <CardDescription>Historical income data trends</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <span className="font-medium text-gray-700">{item.year}</span>
              <div className="flex items-center gap-3">
                <span className="font-bold text-purple-600">
                  ${item.value.toLocaleString()}
                </span>
                <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                  {item.confidence_score * 100}%
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Traffic Analysis Component
function TrafficAnalysis({
  data,
}: {
  data: MarketIntelligenceData["Traffic_Score"];
}) {
  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl font-semibold">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
            <Car className="h-5 w-5 text-white" />
          </div>
          Traffic Analysis
        </CardTitle>
        <CardDescription>
          Location traffic patterns and POI categories
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mb-2">
            {(data.traffic_score * 100).toFixed(1)}%
          </div>
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            Traffic Score
          </Badge>
        </div>

      </CardContent>
    </Card>
  );
}

// Competitor Analysis Component
function CompetitorAnalysis({
  data,
}: {
  data: MarketIntelligenceData["Existing_Competitors"];
}) {
  return (
    <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 text-xl font-semibold">
          <div className="p-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          Competitor Analysis
        </CardTitle>
        <CardDescription>Nearby business competitors</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* --- Summary Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-orange-50 rounded-lg border border-orange-200">
            <div className="text-2xl font-bold text-orange-600">
              {data.data.total_competitors}
            </div>
            <div className="text-sm text-orange-700">Total Competitors</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-2xl font-bold text-green-600">
              {data.data.statistics?.average_distance.toFixed(1)}km
            </div>
            <div className="text-sm text-green-700">Avg Distance</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">
              {data.data.statistics?.business_density.toFixed(1)}
            </div>
            <div className="text-sm text-blue-700">Density Score</div>
          </div>
        </div>

        {/* --- Closest Competitor --- */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-800">Closest Competitor</h4>
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="font-medium text-gray-800">
              {data.data.statistics.closest.name}
            </div>
            <div className="text-sm text-gray-600">
              {data.data.statistics.closest.distance.toFixed(1)}km away
            </div>
          </div>
        </div>

        {/* --- Competitors List --- */}
        <div className="space-y-3">
          <h4 className="font-semibold text-gray-800">All Competitors</h4>
          <div className="max-h-80 overflow-y-auto space-y-2">
            {data.data.competitors.map((comp: any, idx: number) => (
              <div
                key={idx}
                className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
              >
                <div className="font-medium text-gray-800">{comp.name}</div>
                <div className="text-sm text-gray-600">
                  {comp.distance.toFixed(1)}m away • {comp.type}
                </div>
                <div className="text-xs text-blue-600">
                  <a
                    href={comp.google_maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on Map
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function RetailMarketIntelligence({
  data,
  lat,
  lon,
  loading,
  error,
}: {
  data?: MarketIntelligenceData;
  lat?: string;
  lon?: string;
  loading?: boolean;
  error?: string;
}) {
  const currentLocation =
    lat && lon
      ? `${Number.parseFloat(lat).toFixed(4)}, ${Number.parseFloat(lon).toFixed(
          4
        )}`
      : "No location set";

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="border-0 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Retail Market Intelligence
          </CardTitle>
          <p className="text-gray-600">
            Comprehensive market analysis for your business location
          </p>
          <Badge
            variant="outline"
            className="mt-3 bg-blue-50 text-blue-700 border-blue-200"
          >
            <MapPin className="h-3 w-3 mr-1" />
            {currentLocation}
          </Badge>
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert
          variant="destructive"
          className="animate-fade-in-up border-red-200 bg-red-50"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Analysis Failed:</strong> {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analyzing market data...</p>
        </div>
      )}

      {/* Results Display */}
      {data && !loading && (
        <div className="space-y-8">
          <MarketAnalysisCards data={data} />

          <div className="grid lg:grid-cols-1 gap-6">
            <MarketFactorChart data={data.Market_Factor} />
          </div>
          <div className="flex flex-col gap-6">
            <TrafficAnalysis data={data.Traffic_Score} />
            <CompetitorAnalysis data={data.Existing_Competitors} />
          </div>

          {/* Cultural Fit Analysis */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-pink-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                <div className="p-2 bg-gradient-to-r from-pink-500 to-pink-600 rounded-lg">
                  <Heart className="h-5 w-5 text-white" />
                </div>
                Cultural Fit Analysis
                <Sparkles className="h-4 w-4 text-pink-500 ml-auto" />
              </CardTitle>
              <CardDescription>{data.Cultural_Fit.location}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-pink-50 to-pink-100 border border-pink-200">
                <span className="text-base font-semibold text-pink-800">
                  Cultural Fit Score
                </span>
                <Badge className="bg-gradient-to-r from-pink-500 to-pink-600 text-white border-0 text-lg px-4 py-2">
                  {(data.Cultural_Fit.cultural_fit_score * 100).toFixed(1)}%
                </Badge>
              </div>

              <div className="space-y-4">
                <h4 className="text-base font-semibold text-gray-800 flex items-center gap-3">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  Key Insights
                </h4>
                <div className="space-y-2">
                  {data.Cultural_Fit.insights.map((insight, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg bg-white border-l-4 border-pink-400 shadow-sm"
                    >
                      <p className="text-sm text-gray-700">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
