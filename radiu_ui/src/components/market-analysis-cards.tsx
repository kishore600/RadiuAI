"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, DollarSign, Users, Building, AlertTriangle } from "lucide-react"

interface MarketAnalysisCardsProps {
  data: {
    Market_Factor: {
      market_factor: number
      components: {
        rent_index: number
        regulatory_index: number
        seasonality_index: number
        competition_density: number
      }
      confidence: number
      notes: string
    }
    Population_Analysis: {
      multiplier: number
      confidence: number
      population: number
      competition_count: number
      income_index: number
      notes: string
    }
    Income_Data: {
      data: Array<{
        year: string
        value: number
        confidence_score: number
      }>
    }
  }
}

export function MarketAnalysisCards({ data }: MarketAnalysisCardsProps) {
  const latestIncomeData = data.Income_Data.data[data.Income_Data.data.length - 1]
  const incomeGrowth =
    data.Income_Data.data.length > 1
      ? ((latestIncomeData.value - data.Income_Data.data[0].value) / data.Income_Data.data[0].value) * 100
      : 0

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Market Factor Score */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Market Factor</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-card-foreground">
            {(data.Market_Factor.market_factor * 100).toFixed(1)}%
          </div>
          <div className="flex items-center space-x-2 mt-2">
            <Progress value={data.Market_Factor.confidence * 100} className="flex-1" />
            <Badge variant="outline" className="text-xs">
              {(data.Market_Factor.confidence * 100).toFixed(0)}% confidence
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{data.Market_Factor.notes}</p>
        </CardContent>
      </Card>

      {/* Population Analysis */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Population</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-card-foreground">
            {data.Population_Analysis.population.toLocaleString()}
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">Multiplier</span>
            <Badge variant={data.Population_Analysis.multiplier > 1 ? "default" : "secondary"}>
              {data.Population_Analysis.multiplier.toFixed(1)}x
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Income Index: {(data.Population_Analysis.income_index * 100).toFixed(0)}%
          </p>
        </CardContent>
      </Card>

      {/* Competition Analysis */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Competition</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-card-foreground">{data.Population_Analysis.competition_count}</div>
          <div className="flex items-center space-x-2 mt-2">
            <AlertTriangle className="h-3 w-3 text-amber-500" />
            <span className="text-xs text-muted-foreground">competitors nearby</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{data.Population_Analysis.notes}</p>
        </CardContent>
      </Card>

      {/* Income Analysis */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Avg Income</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-card-foreground">
            ${latestIncomeData.value.toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </div>
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground">{latestIncomeData.year}</span>
            <Badge variant={incomeGrowth > 0 ? "default" : "secondary"}>
              {incomeGrowth > 0 ? "+" : ""}
              {incomeGrowth.toFixed(1)}%
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Confidence: {latestIncomeData.confidence_score}%</p>
        </CardContent>
      </Card>
    </div>
  )
}
