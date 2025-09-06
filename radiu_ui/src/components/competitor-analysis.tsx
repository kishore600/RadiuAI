"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Building2, MapPin, ExternalLink } from "lucide-react"
import { useState } from "react"
import { CompetitorDistanceChart } from "@/components/competitor-distance-chart"

interface CompetitorAnalysisProps {
  data: {
    data: {
      total_competitors: number
      competitors: Array<{
        name: string
        type: string
        distance: number
        latitude: number
        longitude: number
        address: string
        google_maps_url?: string
      }>
      statistics: {
        closest: { name: string; distance: number }
        average_distance: number
        business_density: number
      }
    }
  }
}

export function CompetitorAnalysis({ data }: CompetitorAnalysisProps) {
  const [showAll, setShowAll] = useState(false)
  const displayedCompetitors = showAll ? data.data.competitors : data.data.competitors.slice(0, 10)

  const formatDistance = (distance: number) => {
    if (distance < 1000) {
      return `${Math.round(distance)}m`
    }
    return `${(distance / 1000).toFixed(1)}km`
  }

  const getDensityLevel = (density: number) => {
    if (density > 3) return { label: "Very High", variant: "destructive" as const }
    if (density > 2) return { label: "High", variant: "secondary" as const }
    if (density > 1) return { label: "Moderate", variant: "outline" as const }
    return { label: "Low", variant: "default" as const }
  }

  const densityInfo = getDensityLevel(data.data.statistics.business_density)

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Competitor Analysis Overview
          </CardTitle>
          <CardDescription>{data.data.total_competitors} competitors found in the analysis area</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Statistics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Closest Competitor</span>
                <div className="space-y-1">
                  <p className="font-medium text-sm">{data.data.statistics.closest.name}</p>
                  <Badge variant="outline" className="text-xs">
                    {formatDistance(data.data.statistics.closest.distance)}
                  </Badge>
                </div>
              </div>
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Average Distance</span>
                <p className="text-lg font-bold text-card-foreground">
                  {formatDistance(data.data.statistics.average_distance)}
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">Business Density</span>
                <div className="space-y-1">
                  <p className="text-lg font-bold text-card-foreground">
                    {data.data.statistics.business_density.toFixed(1)}/km²
                  </p>
                  <Badge variant={densityInfo.variant} className="text-xs">
                    {densityInfo.label}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Distance Distribution Chart */}
      <CompetitorDistanceChart
        competitors={data.data.competitors}
        averageDistance={data.data.statistics.average_distance}
      />

      {/* Competitors List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Nearby Competitors</CardTitle>
              <CardDescription>Detailed list of competitors in your area</CardDescription>
            </div>
            {data.data.competitors.length > 10 && (
              <Button variant="outline" size="sm" onClick={() => setShowAll(!showAll)}>
                {showAll ? "Show Less" : `Show All ${data.data.competitors.length}`}
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] w-full">
            <div className="space-y-3">
              {displayedCompetitors.map((competitor, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <h5 className="font-medium text-sm">{competitor.name}</h5>
                      <Badge variant="outline" className="text-xs capitalize">
                        {competitor.type}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {formatDistance(competitor.distance)}
                      </span>
                      {competitor.address && competitor.address !== "Address not specified" && (
                        <span className="truncate max-w-[200px]">{competitor.address}</span>
                      )}
                    </div>
                  </div>
                  {competitor.google_maps_url && (
                    <Button variant="ghost" size="sm" asChild className="ml-2">
                      <a href={competitor.google_maps_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}
