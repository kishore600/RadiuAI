"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Car } from "lucide-react"
import { POIDistributionChart } from "@/components/poi-distribution-chart"

interface TrafficAnalysisProps {
  data: {
    coordinates: { latitude: number; longitude: number }
    traffic_score: number
    top_poi_categories: Array<{ rank: number; category: string; count: number }>
  }
}

export function TrafficAnalysis({ data }: TrafficAnalysisProps) {
  const getScoreColor = (score: number) => {
    if (score >= 0.7) return "default"
    if (score >= 0.4) return "secondary"
    return "outline"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 0.7) return "High Traffic"
    if (score >= 0.4) return "Moderate Traffic"
    return "Low Traffic"
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5" />
            Traffic & Location Analysis
          </CardTitle>
          <CardDescription>
            Location: {data.coordinates.latitude.toFixed(4)}, {data.coordinates.longitude.toFixed(4)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Traffic Score */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Traffic Score</span>
                <Badge variant={getScoreColor(data.traffic_score)}>{getScoreLabel(data.traffic_score)}</Badge>
              </div>
              <Progress value={data.traffic_score * 100} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Score: {(data.traffic_score * 100).toFixed(1)}% - Based on nearby points of interest and foot traffic
                patterns
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* POI Distribution Chart */}
      <POIDistributionChart data={data.top_poi_categories} trafficScore={data.traffic_score} />
    </div>
  )
}
