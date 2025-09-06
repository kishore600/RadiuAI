"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Clock, MapPin, Activity } from "lucide-react"

interface DashboardHeaderProps {
  lastAnalysis?: string
  location?: string
  status?: "active" | "idle" | "analyzing"
}

export function DashboardHeader({
  lastAnalysis = "Never",
  location = "No location set",
  status = "idle",
}: DashboardHeaderProps) {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return { variant: "default" as const, label: "Active", icon: Activity }
      case "analyzing":
        return { variant: "secondary" as const, label: "Analyzing", icon: Activity }
      default:
        return { variant: "outline" as const, label: "Idle", icon: Activity }
    }
  }

  const statusConfig = getStatusConfig(status)
  const StatusIcon = statusConfig.icon

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <StatusIcon className="h-5 w-5" />
              System Status
            </CardTitle>
            <CardDescription>Current analysis status and recent activity</CardDescription>
          </div>
          <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Last Analysis:</span>
            <span className="text-sm font-medium">{lastAnalysis}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Location:</span>
            <span className="text-sm font-medium">{location}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
