"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Users, AlertCircle, Sparkles } from "lucide-react"
import { MarketAnalysisCards } from "@/components/market-analysis-cards"
import { CompetitorAnalysis } from "@/components/competitor-analysis"
import { TrafficAnalysis } from "@/components/traffic-analysis"
import { DashboardHeader } from "@/components/dashboard-header"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MarketFactorChart } from "@/components/market-factor-chart"
import { IncomeTrendChart } from "@/components/income-trend-chart"
import { ParameterControls } from "@/components/parameter-controls"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface MarketIntelligenceData {
  Traffic_Score: {
    coordinates: { latitude: number; longitude: number }
    traffic_score: number
    top_poi_categories: Array<{ rank: number; category: string; count: number }>
  }
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
    coordinates: [number, number]
    radius_km: number
  }
  Income_Data: {
    data: Array<{
      year: string
      value: number
      confidence_score: number
    }>
  }
  Existing_Competitors: {
    data: {
      total_competitors: number
      competitors: Array<{
        name: string
        type: string
        distance: number
        latitude: number
        longitude: number
        address: string
      }>
      statistics: {
        closest: { name: string; distance: number }
        average_distance: number
        business_density: number
      }
    }
  }
  Cultural_Fit: {
    location: string
    cultural_fit_score: number
    sentiment_ratio: number
    insights: string[]
  }
}

export function RetailMarketIntelligence({data, lat, lon,loading,error}: {data?: MarketIntelligenceData, lat?: string, lon?: string, loading?: boolean, error?: string}) {

  const currentLocation =
    lat && lon ? `${Number.parseFloat(lat).toFixed(4)}, ${Number.parseFloat(lon).toFixed(4)}` : "No location set"

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-card via-muted to-card p-6 border border-accent/20 animate-fade-in-up">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/5 to-primary/5" />
        <div className="relative">
          <DashboardHeader
            location={currentLocation}
            status={loading ? "analyzing" : data ? "active" : "idle"}
          />
        </div>
      </div>


      {/* Error Display */}
      {error && (
        <Alert variant="destructive" className="animate-fade-in-up border-destructive/50 bg-destructive/5">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Analysis Failed:</strong> {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Results Display */}
      {data && (
        <div className="space-y-8">
          <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
            <MarketAnalysisCards data={data} />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            <div className="animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
              <MarketFactorChart data={data.Market_Factor} />
            </div>
            <div className="animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
              <IncomeTrendChart data={data.Income_Data.data} />
            </div>
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
            <TrafficAnalysis data={data.Traffic_Score} />
          </div>

          <div className="animate-fade-in-up" style={{ animationDelay: "0.6s" }}>
            <CompetitorAnalysis data={data.Existing_Competitors} />
          </div>

          <Card
            className="animate-fade-in-up border-accent/20 bg-gradient-to-br from-card to-muted/30"
            style={{ animationDelay: "0.7s" }}
          >
            <CardHeader className="bg-gradient-to-r from-transparent to-accent/5">
              <CardTitle className="flex items-center gap-2 text-xl">
                <div className="p-2 rounded-lg bg-gradient-to-br from-accent to-primary text-white">
                  <Users className="h-5 w-5" />
                </div>
                Cultural Fit Analysis
                <Sparkles className="h-4 w-4 text-accent ml-auto" />
              </CardTitle>
              <CardDescription className="text-base">{data.Cultural_Fit.location}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-muted to-muted/50">
                <span className="text-base font-semibold">Cultural Fit Score</span>
                <Badge
                  variant={data.Cultural_Fit.cultural_fit_score > 0.5 ? "default" : "secondary"}
                  className={`text-sm px-3 py-1 ${
                    data.Cultural_Fit.cultural_fit_score > 0.5
                      ? "bg-gradient-to-r from-accent to-primary text-white border-0"
                      : ""
                  }`}
                >
                  {(data.Cultural_Fit.cultural_fit_score * 100).toFixed(1)}%
                </Badge>
              </div>
              <div className="space-y-3">
                <h4 className="text-base font-semibold flex items-center gap-2">
                  Key Insights
                  <div className="h-px flex-1 bg-gradient-to-r from-accent/50 to-transparent" />
                </h4>
                <ul className="space-y-2">
                  {data.Cultural_Fit.insights.map((insight, index) => (
                    <li
                      key={index}
                      className="text-sm text-muted-foreground p-3 rounded-lg bg-muted/50 border-l-2 border-accent/30"
                    >
                      {insight}
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
