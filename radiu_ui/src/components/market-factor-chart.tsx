"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts"
import { TrendingUp } from "lucide-react"

interface MarketFactorChartProps {
  data: {
    market_factor: number
    components: {
      rent_index: number
      regulatory_index: number
      seasonality_index: number
      competition_density: number
    }
    weights: {
      rent_index: number
      regulatory_index: number
      seasonality_index: number
      competition_density: number
    }
    confidence: number
  }
}

const chartConfig = {
  value: {
    label: "Index Value",
    color: "hsl(var(--chart-1))",
  },
  weight: {
    label: "Weight",
    color: "hsl(var(--chart-2))",
  },
}

export function MarketFactorChart({ data }: MarketFactorChartProps) {
  const chartData = [
    {
      component: "Rent Index",
      value: data.components.rent_index,
      weight: data.weights.rent_index,
      weighted: data.components.rent_index * data.weights.rent_index,
    },
    {
      component: "Regulatory",
      value: data.components.regulatory_index,
      weight: data.weights.regulatory_index,
      weighted: data.components.regulatory_index * data.weights.regulatory_index,
    },
    {
      component: "Seasonality",
      value: data.components.seasonality_index,
      weight: data.weights.seasonality_index,
      weighted: data.components.seasonality_index * data.weights.seasonality_index,
    },
    {
      component: "Competition",
      value: data.components.competition_density,
      weight: data.weights.competition_density,
      weighted: data.components.competition_density * data.weights.competition_density,
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Market Factor Breakdown
        </CardTitle>
        <CardDescription>
          Component analysis with weighted impact on overall market factor ({(data.market_factor * 100).toFixed(1)}%)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis
                dataKey="component"
                tick={{ fontSize: 12 }}
                interval={0}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="value" fill="var(--color-value)" name="Index Value" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Overall Confidence:</span>
            <span className="ml-2 font-medium">{(data.confidence * 100).toFixed(0)}%</span>
          </div>
          <div>
            <span className="text-muted-foreground">Market Factor:</span>
            <span className="ml-2 font-medium">{(data.market_factor * 100).toFixed(1)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
