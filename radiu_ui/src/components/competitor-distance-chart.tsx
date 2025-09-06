"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { Building2 } from "lucide-react"

interface CompetitorDistanceChartProps {
  competitors: Array<{
    name: string
    distance: number
  }>
  averageDistance: number
}

const chartConfig = {
  count: {
    label: "Number of Competitors",
    color: "hsl(var(--chart-2))",
  },
}

export function CompetitorDistanceChart({ competitors, averageDistance }: CompetitorDistanceChartProps) {
  // Create distance buckets
  const buckets = [
    { range: "0-0.5km", min: 0, max: 500, count: 0 },
    { range: "0.5-1km", min: 500, max: 1000, count: 0 },
    { range: "1-1.5km", min: 1000, max: 1500, count: 0 },
    { range: "1.5-2km", min: 1500, max: 2000, count: 0 },
    { range: "2km+", min: 2000, max: Number.POSITIVE_INFINITY, count: 0 },
  ]

  competitors.forEach((competitor) => {
    const bucket = buckets.find((b) => competitor.distance >= b.min && competitor.distance < b.max)
    if (bucket) bucket.count++
  })

  const chartData = buckets.filter((bucket) => bucket.count > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Competitor Distance Distribution
        </CardTitle>
        <CardDescription>How competitors are distributed by distance from your location</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="range" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} label={{ value: "Competitors", angle: -90, position: "insideLeft" }} />
              <ChartTooltip
                content={<ChartTooltipContent formatter={(value) => [`${value} competitors`, "Count"]} />}
              />
              <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Total Competitors:</span>
            <span className="ml-2 font-medium">{competitors.length}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Average Distance:</span>
            <span className="ml-2 font-medium">
              {averageDistance < 1000 ? `${Math.round(averageDistance)}m` : `${(averageDistance / 1000).toFixed(1)}km`}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
