"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { DollarSign, TrendingUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface IncomeTrendChartProps {
  data: Array<{
    year: string
    value: number
    confidence_score: number
  }>
}

const chartConfig = {
  income: {
    label: "Average Income",
    color: "hsl(var(--chart-3))",
  },
}

export function IncomeTrendChart({ data }: IncomeTrendChartProps) {
  const chartData = data.map((item) => ({
    year: item.year,
    income: Math.round(item.value),
    confidence: item.confidence_score,
  }))

  const latestYear = data[data.length - 1]
  const firstYear = data[0]
  const growthRate = data.length > 1 ? ((latestYear.value - firstYear.value) / firstYear.value) * 100 : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Income Trend Analysis
        </CardTitle>
        <CardDescription className="flex items-center justify-between">
          <span>Average household income over time</span>
          <Badge variant={growthRate > 0 ? "default" : "secondary"} className="ml-2">
            <TrendingUp className="h-3 w-3 mr-1" />
            {growthRate > 0 ? "+" : ""}
            {growthRate.toFixed(1)}%
          </Badge>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`} />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => [`$${Number(value).toLocaleString()}`, "Average Income"]}
                  />
                }
              />
              <Line
                type="monotone"
                dataKey="income"
                stroke="var(--color-income)"
                strokeWidth={3}
                dot={{ fill: "var(--color-income)", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "var(--color-income)", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Latest ({latestYear.year}):</span>
            <div className="font-medium">${latestYear.value.toLocaleString()}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Growth Rate:</span>
            <div className="font-medium">
              {growthRate > 0 ? "+" : ""}
              {growthRate.toFixed(1)}%
            </div>
          </div>
          <div>
            <span className="text-muted-foreground">Confidence:</span>
            <div className="font-medium">{latestYear.confidence_score}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
