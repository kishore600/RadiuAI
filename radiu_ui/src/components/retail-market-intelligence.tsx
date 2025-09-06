"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Users, AlertCircle } from "lucide-react"
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

export function RetailMarketIntelligence() {
  const [data, setData] = useState<MarketIntelligenceData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastAnalysis, setLastAnalysis] = useState<string>("Never")

  // Form parameters
  const [lat, setLat] = useState("40.7128")
  const [lon, setLon] = useState("-74.0060")
  const [businessType, setBusinessType] = useState("supermarket")
  const [radiusKm, setRadiusKm] = useState("2")

  const handleParameterChange = (params: {
    lat: string
    lon: string
    businessType: string
    radiusKm: string
  }) => {
    setLat(params.lat)
    setLon(params.lon)
    setBusinessType(params.businessType)
    setRadiusKm(params.radiusKm)
  }

  const fetchMarketIntelligence = async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        lat,
        lon,
        businessType,
        radiusKm,
      })

      const response = await fetch(`http://localhost:5000/analyze/retail_market_intelligence_model?${params}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setData(result)
      setLastAnalysis(new Date().toLocaleString())
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch market intelligence data")
    } finally {
      setLoading(false)
    }
  }

  const currentLocation =
    lat && lon ? `${Number.parseFloat(lat).toFixed(4)}, ${Number.parseFloat(lon).toFixed(4)}` : "No location set"

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <DashboardHeader
        lastAnalysis={lastAnalysis}
        location={currentLocation}
        status={loading ? "analyzing" : data ? "active" : "idle"}
      />

      {/* Enhanced Parameter Controls */}
      <ParameterControls
        lat={lat}
        lon={lon}
        businessType={businessType}
        radiusKm={radiusKm}
        onParameterChange={handleParameterChange}
        onAnalyze={fetchMarketIntelligence}
        loading={loading}
      />

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Analysis Failed:</strong> {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Results Display */}
      {data && (
        <div className="space-y-6">
          {/* Market Overview Cards */}
          <MarketAnalysisCards data={data} />

          {/* Market Factor Chart */}
          <MarketFactorChart data={data.Market_Factor} />

          {/* Income Trend Chart */}
          <IncomeTrendChart data={data.Income_Data.data} />

          {/* Traffic Analysis */}
          <TrafficAnalysis data={data.Traffic_Score} />

          {/* Competitor Analysis */}
          <CompetitorAnalysis data={data.Existing_Competitors} />

          {/* Cultural Fit Analysis */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Cultural Fit Analysis
              </CardTitle>
              <CardDescription>{data.Cultural_Fit.location}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Cultural Fit Score</span>
                  <Badge variant={data.Cultural_Fit.cultural_fit_score > 0.5 ? "default" : "secondary"}>
                    {(data.Cultural_Fit.cultural_fit_score * 100).toFixed(1)}%
                  </Badge>
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium">Key Insights</h4>
                  <ul className="space-y-1">
                    {data.Cultural_Fit.insights.map((insight, index) => (
                      <li key={index} className="text-sm text-muted-foreground">
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
