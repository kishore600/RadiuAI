/* eslint-disable @typescript-eslint/no-explicit-any */
// components/business-recommendation.tsx
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  Award,
  Star,
  CheckCircle2,
  Target,
  Building2,
  Users,
  Zap,
  Lightbulb,
} from "lucide-react";

interface BusinessRecommendationProps {
  data: any;
  loading?: boolean;
  error?: string;
}

export function BusinessRecommendation({ data, loading, error }: BusinessRecommendationProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i} className="animate-pulse border-0 bg-gradient-to-br from-white to-gray-50/50">
            <CardContent className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50/50 border-0">
        <CardContent className="p-6 text-center">
          <div className="text-red-500 mb-2">
            <Zap className="h-12 w-12 mx-auto opacity-50" />
          </div>
          <p className="text-red-700 font-medium">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card className="border-0 bg-gradient-to-br from-white to-gray-50/50">
        <CardContent className="p-6 text-center">
          <div className="text-gray-400 mb-2">
            <Lightbulb className="h-12 w-12 mx-auto" />
          </div>
          <p className="text-gray-500">No business recommendations available yet.</p>
          <p className="text-sm text-gray-400 mt-2">
            Enable at least 2 analysis models to get comprehensive recommendations.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Sample data structure - adjust based on your actual API response
  const recommendations = data.recommendations || [
    { business_type: "Cafe", score: 92, reason: "High foot traffic and young demographic" },
    { business_type: "Restaurant", score: 88, reason: "Strong cultural fit and market demand" },
    { business_type: "Retail Store", score: 85, reason: "Good location with shopping potential" },
    { business_type: "Gym/Fitness", score: 78, reason: "Growing health consciousness in area" },
    { business_type: "Co-working Space", score: 75, reason: "Proximity to business districts" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-3 text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            <Target className="h-8 w-8 text-blue-600" />
            Top Business Recommendations
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            Based on comprehensive market analysis and cultural intelligence
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Recommendations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {recommendations.map((rec: any, index: number) => (
          <Card
            key={index}
            className={`border-0 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 ${
              index === 0
                ? "bg-gradient-to-br from-yellow-50 to-amber-50 ring-2 ring-yellow-300"
                : "bg-gradient-to-br from-white to-gray-50/50"
            }`}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  {index === 0 ? (
                    <div className="w-10 h-10 bg-gradient-to-r from-yellow-500 to-amber-600 rounded-full flex items-center justify-center shadow-lg">
                      <Award className="h-6 w-6 text-white" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <Star className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <h3 className="font-semibold text-lg text-gray-800">
                    {rec.business_type}
                  </h3>
                </div>
                <Badge
                  className={`text-sm px-3 py-1 ${
                    index === 0
                      ? "bg-gradient-to-r from-yellow-500 to-amber-600 text-white"
                      : "bg-gradient-to-r from-green-500 to-green-600 text-white"
                  }`}
                >
                  {rec.score}/100
                </Badge>
              </div>

              <Progress value={rec.score} className="h-2 mb-4 bg-gray-200">
                <div
                  className="h-full bg-gradient-to-r transition-all duration-1000"
                  style={{
                    width: `${rec.score}%`,
                    background:
                      index === 0
                        ? "linear-gradient(to right, #f59e0b, #d97706)"
                        : "linear-gradient(to right, #10b981, #059669)",
                  }}
                />
              </Progress>

              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {rec.reason}
              </p>

              {index === 0 && (
                <div className="mt-3 flex items-center gap-2 text-sm text-yellow-700 bg-yellow-100 px-3 py-2 rounded-lg">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Best match for this location</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-gray-50 to-white">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-semibold">
            <TrendingUp className="h-6 w-6 text-blue-600" />
            Analysis Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{recommendations.length}</div>
              <div className="text-sm text-blue-700">Total Recommendations</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {recommendations[0]?.score || 0}
              </div>
              <div className="text-sm text-green-700">Top Score</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {Math.round(recommendations.reduce((sum: number, rec: any) => sum + rec.score, 0) / recommendations.length)}
              </div>
              <div className="text-sm text-purple-700">Average Score</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {recommendations.filter((rec: any) => rec.score >= 80).length}
              </div>
              <div className="text-sm text-orange-700">High Potential</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}