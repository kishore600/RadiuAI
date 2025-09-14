/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

type Props = {
  data: any;
};

export default function ResultsView({ data }: Props) {
  // Prepare data for charts
  const scoreData = Object.entries(data.scores).map(([key, value]) => ({
    name: key.replace(/_/g, ' ').toUpperCase(),
    value: typeof value === 'number' ? value : 0,
    fill: getScoreColor(typeof value === 'number' ? value : 0)
  }));

  const demographicData = data.raw_data.demographics ? [
    { name: 'Population Density', value: data.raw_data.demographics.population_density * 100 },
    { name: 'Income Distribution', value: data.raw_data.demographics.income_distribution / 100 },
    { name: 'Age Composition', value: data.raw_data.demographics.age_composition * 100 },
    { name: 'Education Levels', value: data.raw_data.demographics.education_levels * 100 }
  ] : [];

  const radarData = Object.entries(data.raw_data).flatMap(([category, metrics]) => 
    Object.entries(metrics as any).map(([metric, value]) => ({
      subject: metric.replace(/_/g, ' '),
      [category]: typeof value === 'number' ? value * 10 : 0,
      fullMark: 100
    }))
  );

  function getScoreColor(score: number) {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#f59e0b'; // amber
    if (score >= 40) return '#f97316'; // orange
    return '#ef4444'; // red
  }

  function getRatingColor(rating: string) {
    if (rating.includes('High')) return 'bg-green-100 text-green-800';
    if (rating.includes('Moderate')) return 'bg-yellow-100 text-yellow-800';
    if (rating.includes('Low')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-6 p-4">
      {/* Header with Overall Score */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold">Market Opportunity Analysis</CardTitle>
          <CardDescription>{data.location.name}, {data.location.country_code}</CardDescription>
          <Badge className={`text-lg px-4 py-2 ${getRatingColor(data.rating)}`}>
            {data.rating}
          </Badge>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Location Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📍 Location Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Name</p>
                <p className="font-semibold">{data.location.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Business Type</p>
                <p className="font-semibold capitalize">{data.location.business_type}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Coordinates</p>
                <p className="font-semibold">{data.location.latitude}, {data.location.longitude}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Radius</p>
                <p className="font-semibold">{data.location.radius_km} km</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overall Score */}
        <Card>
          <CardHeader>
            <CardTitle>Overall Score</CardTitle>
            <CardDescription>Market Opportunity Assessment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-5xl font-bold text-blue-600 mb-2">
                {data.scores.overall.toFixed(1)}
              </div>
              <Progress value={data.scores.overall} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2">Out of 100 points</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scores Radar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Scores Analysis</CardTitle>
          <CardDescription>Performance across key metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={scoreData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="name" />
                <PolarRadiusAxis domain={[0, 100]} />
                <Radar
                  name="Scores"
                  dataKey="value"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.6}
                />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Individual Scores with Progress Bars */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Scores</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {scoreData.filter(item => item.name !== 'OVERALL').map((item, index) => (
            <div key={item.name} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium capitalize">{item.name.toLowerCase()}</span>
                <span className="font-bold">{item.value.toFixed(1)}</span>
              </div>
              <Progress value={item.value} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Opportunities */}
      <Card className="bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-800">
            💡 Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {data.opportunities.map((item: string, i: number) => (
              <li key={i} className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                <span className="text-sm">{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Risk Factors */}
      {data.risk_factors.length > 0 && (
        <Card className="bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-800">
              ⚠️ Risk Factors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {data.risk_factors.map((risk: string, i: number) => (
                <li key={i} className="flex items-start gap-3 p-3 bg-white rounded-lg shadow-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                  <span className="text-sm">{risk}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Demographic Data Chart */}
      {demographicData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Demographic Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={demographicData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Raw Data Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Raw Data Summary</CardTitle>
          <CardDescription>Detailed metrics breakdown</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(data.raw_data).map(([category, metrics]) => (
              <div key={category} className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold capitalize mb-3">{category.replace(/_/g, ' ')}</h4>
                <div className="space-y-2">
                  {Object.entries(metrics as any).map(([metric, value]) => (
                    <div key={metric} className="flex justify-between text-sm">
                      <span className="capitalize">{metric.replace(/_/g, ' ')}:</span>
                      <span className="font-medium">{typeof value === 'number' ? value.toFixed(2) : String(value)}</span>
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