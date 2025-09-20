/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Target,
  MapPin,
  Building2,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  Users,
  GraduationCap,
  DollarSign,
  Car,
  Train,
  ParkingCircle,
  Footprints,
  Zap,
  Sparkles,
  Download,
  Share,
  BarChart3,
  Crown,
  Award,
  Rocket,
  Eye,
  ChartNoAxesCombined,
} from "lucide-react";

type Props = {
  data: any;
};

export default function MarketOpportunityScore({ data }: Props) {
  // Prepare data for charts
  const scoreData = Object.entries(data.scores).map(([key, value]) => ({
    name: key.replace(/_/g, " ").toUpperCase(),
    value: typeof value === "number" ? value : 0,
    fill: getScoreColor(typeof value === "number" ? value : 0),
  }));

  const demographicData = data.raw_data.demographics
    ? [
        {
          name: "Population Density",
          value: data.raw_data.demographics.population_density * 100,
          icon: Users,
          color: "#3B82F6",
        },
        {
          name: "Income Distribution",
          value: data.raw_data.demographics.income_distribution / 100,
          icon: DollarSign,
          color: "#10B981",
        },
        {
          name: "Age Composition",
          value: data.raw_data.demographics.age_composition * 100,
          icon: ChartNoAxesCombined,
          color: "#F59E0B",
        },
        {
          name: "Education Levels",
          value: data.raw_data.demographics.education_levels * 100,
          icon: GraduationCap,
          color: "#8B5CF6",
        },
      ]
    : [];

  const accessibilityData = data.raw_data.accessibility
    ? [
        {
          name: "Traffic Flow",
          value: data.raw_data.accessibility.traffic_flow * 10,
          icon: Car,
          color: "#EF4444",
        },
        {
          name: "Public Transport",
          value: data.raw_data.accessibility.public_transport * 10,
          icon: Train,
          color: "#3B82F6",
        },
        {
          name: "Parking",
          value: data.raw_data.accessibility.parking_availability * 10,
          icon: ParkingCircle,
          color: "#10B981",
        },
        {
          name: "Walkability",
          value: data.raw_data.accessibility.walkability * 10,
          icon: Footprints,
          color: "#F59E0B",
        },
      ]
    : [];

  function getScoreColor(score: number) {
    if (score >= 80) return "#10b981"; // green
    if (score >= 60) return "#f59e0b"; // amber
    if (score >= 40) return "#f97316"; // orange
    return "#ef4444"; // red
  }

  function getRatingColor(rating: string) {
    if (rating.includes("High")) return "bg-gradient-to-r from-green-500 to-green-600 text-white";
    if (rating.includes("Moderate")) return "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white";
    if (rating.includes("Low")) return "bg-gradient-to-r from-red-500 to-red-600 text-white";
    return "bg-gradient-to-r from-gray-500 to-gray-600 text-white";
  }

  function getScoreIcon(score: number) {
    if (score >= 80) return <Crown className="h-5 w-5" />;
    if (score >= 60) return <Award className="h-5 w-5" />;
    if (score >= 40) return <Eye className="h-5 w-5" />;
    return <AlertTriangle className="h-5 w-5" />;
  }

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

  return (
    <div className="space-y-6">
      {/* Header with Overall Score */}
      <Card className="border-0 bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50">
        <CardHeader className="text-center">
          <CardTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Market Opportunity Score
          </CardTitle>
          <CardDescription className="text-lg text-gray-600">
            {data.location.name}, {data.location.country_code}
          </CardDescription>
          <div className="mt-4">
            <Badge className={`text-lg px-6 py-3 ${getRatingColor(data.rating)}`}>
              <div className="flex items-center gap-2">
                {getScoreIcon(data.scores.overall)}
                {data.rating}
              </div>
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Location Info */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-semibold">
              <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              Location Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-600 font-medium">Name</p>
                <p className="font-semibold text-lg">{data.location.name}</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-purple-600 font-medium">Business Type</p>
                <p className="font-semibold text-lg capitalize">{data.location.business_type}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm text-green-600 font-medium">Coordinates</p>
                <p className="font-semibold text-sm">
                  {data.location.latitude.toFixed(6)}, {data.location.longitude.toFixed(6)}
                </p>
              </div>
              <div className="bg-orange-50 p-4 rounded-lg">
                <p className="text-sm text-orange-600 font-medium">Radius</p>
                <p className="font-semibold text-lg">{data.location.radius_km} km</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overall Score */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-semibold">
              <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                <BarChart3 className="h-5 w-5 text-white" />
              </div>
              Overall Score
            </CardTitle>
            <CardDescription>Market Opportunity Assessment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
                {data.scores.overall.toFixed(1)}
              </div>
              <Progress value={data.scores.overall} className="h-3 bg-gray-200">
                <div
                  className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-1000"
                  style={{ width: `${data.scores.overall}%` }}
                />
              </Progress>
              <p className="text-sm text-gray-500 mt-3">Out of 100 points</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scores Radar Chart */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-semibold">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
              <RadarChart className="h-5 w-5 text-white" />
            </div>
            Detailed Scores Analysis
          </CardTitle>
          <CardDescription>Performance across key metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={scoreData}>
                <PolarGrid stroke="#E5E7EB" />
                <PolarAngleAxis 
                  dataKey="name" 
                  tick={{ fill: '#374151', fontSize: 12 }}
                />
                <PolarRadiusAxis domain={[0, 100]} />
                <Radar
                  name="Scores"
                  dataKey="value"
                  stroke="#4F46E5"
                  fill="#4F46E5"
                  fillOpacity={0.6}
                />
                <Tooltip 
                  contentStyle={{
                    background: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Individual Scores with Progress Bars */}

      {/* Opportunities & Risks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-semibold">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            Detailed Scores Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {scoreData
            .filter((item) => item.name !== "OVERALL")
            .map((item, index) => (
              <div key={item.name} className="space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.fill }} />
                    <span className="font-semibold text-gray-800 capitalize">
                      {item.name.toLowerCase()}
                    </span>
                  </div>
                  <span className="font-bold text-2xl" style={{ color: item.fill }}>
                    {item.value.toFixed(1)}
                  </span>
                </div>
                <Progress value={item.value} className="h-3 bg-gray-200">
                  <div
                    className="h-full transition-all duration-1000"
                    style={{ 
                      width: `${item.value}%`,
                      backgroundColor: item.fill
                    }}
                  />
                </Progress>
              </div>
            ))}
        </CardContent>
      </Card>
        {/* Opportunities */}
        <Card className="border-0 shadow-xl bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl font-semibold text-green-800">
              <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                <Lightbulb className="h-5 w-5 text-white" />
              </div>
              Opportunities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {data.opportunities.map((item: string, i: number) => (
                <li
                  key={i}
                  className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm border border-green-100"
                >
                  <div className="w-3 h-3 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm text-green-800 leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Risk Factors */}
        {data.risk_factors.length > 0 && (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-red-50 to-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-semibold text-red-800">
                <div className="p-2 bg-gradient-to-r from-red-500 to-red-600 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-white" />
                </div>
                ⚠️ Risk Factors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {data.risk_factors.map((risk: string, i: number) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 p-4 bg-white rounded-xl shadow-sm border border-red-100"
                  >
                    <div className="w-3 h-3 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                    <span className="text-sm text-red-800 leading-relaxed">{risk}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Demographic Data Chart */}
        {demographicData.length > 0 && (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                <div className="p-2 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg">
                  <Users className="h-5 w-5 text-white" />
                </div>
                Demographic Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={demographicData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" tick={{ fill: '#374151', fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#374151' }} />
                    <Tooltip 
                      contentStyle={{
                        background: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {demographicData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Accessibility Data Chart */}
        {accessibilityData.length > 0 && (
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-xl font-semibold">
                <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
                  <Car className="h-5 w-5 text-white" />
                </div>
                Accessibility Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={accessibilityData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" tick={{ fill: '#374151', fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#374151' }} />
                    <Tooltip 
                      contentStyle={{
                        background: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                      {accessibilityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Raw Data Summary */}
      <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl font-semibold">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg">
              <Zap className="h-5 w-5 text-white" />
            </div>
            Detailed Metrics Breakdown
          </CardTitle>
          <CardDescription>Comprehensive data analysis across all categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(data.raw_data).map(([category, metrics]) => (
              <div key={category} className="bg-gradient-to-br from-gray-50 to-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h4 className="font-semibold text-lg text-gray-800 capitalize mb-4">
                  {category.replace(/_/g, " ")}
                </h4>
                <div className="space-y-3">
                  {Object.entries(metrics as any).map(([metric, value]) => (
                    <div key={metric} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                      <span className="text-sm text-gray-600 capitalize">
                        {metric.replace(/_/g, " ")}
                      </span>
                      <span className="font-semibold text-gray-800">
                        {typeof value === "number" ? value.toFixed(2) : String(value)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}