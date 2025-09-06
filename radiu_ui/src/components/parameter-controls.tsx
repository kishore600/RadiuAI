"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Target, MapPin, Settings, History, Star, AlertTriangle, Map } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GoogleMapsPicker } from "./google-maps-picker"

interface ParameterControlsProps {
  lat: string
  lon: string
  businessType: string
  radiusKm: string
  onParameterChange: (params: {
    lat: string
    lon: string
    businessType: string
    radiusKm: string
  }) => void
  onAnalyze: () => void
  loading: boolean
}

const PRESET_LOCATIONS = [
  { name: "New York City", lat: "40.7128", lon: "-74.0060", description: "Manhattan, NY" },
  { name: "Los Angeles", lat: "34.0522", lon: "-118.2437", description: "Downtown LA, CA" },
  { name: "Chicago", lat: "41.8781", lon: "-87.6298", description: "The Loop, IL" },
  { name: "Houston", lat: "29.7604", lon: "-95.3698", description: "Downtown Houston, TX" },
  { name: "Phoenix", lat: "33.4484", lon: "-112.0740", description: "Central Phoenix, AZ" },
  { name: "Philadelphia", lat: "39.9526", lon: "-75.1652", description: "Center City, PA" },
  { name: "San Antonio", lat: "29.4241", lon: "-98.4936", description: "Downtown San Antonio, TX" },
  { name: "San Diego", lat: "32.7157", lon: "-117.1611", description: "Downtown San Diego, CA" },
]

const BUSINESS_TYPES = [
  { value: "supermarket", label: "Supermarket", description: "Grocery stores and food markets" },
  { value: "restaurant", label: "Restaurant", description: "Dining establishments" },
  { value: "retail", label: "Retail Store", description: "General merchandise stores" },
  { value: "pharmacy", label: "Pharmacy", description: "Drug stores and pharmacies" },
  { value: "gas_station", label: "Gas Station", description: "Fuel stations and convenience stores" },
  { value: "bank", label: "Bank", description: "Financial institutions" },
  { value: "coffee_shop", label: "Coffee Shop", description: "Cafes and coffee houses" },
  { value: "gym", label: "Gym/Fitness", description: "Fitness centers and gyms" },
]

export function ParameterControls({
  lat,
  lon,
  businessType,
  radiusKm,
  onParameterChange,
  onAnalyze,
  loading,
}: ParameterControlsProps) {
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [savedPresets, setSavedPresets] = useState<
    Array<{
      name: string
      params: { lat: string; lon: string; businessType: string; radiusKm: string }
      timestamp: string
    }>
  >([])
  const [useMapInput, setUseMapInput] = useState(true)

  useEffect(() => {
    const saved = localStorage.getItem("radiu-ai-presets")
    if (saved) {
      try {
        setSavedPresets(JSON.parse(saved))
      } catch (e) {
        console.error("Failed to load presets:", e)
      }
    }
  }, [])

  const validateParameters = () => {
    const newErrors: Record<string, string> = {}

    const latNum = Number.parseFloat(lat)
    const lonNum = Number.parseFloat(lon)
    const radiusNum = Number.parseFloat(radiusKm)

    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      newErrors.lat = "Latitude must be between -90 and 90"
    }

    if (isNaN(lonNum) || lonNum < -180 || lonNum > 180) {
      newErrors.lon = "Longitude must be between -180 and 180"
    }

    if (isNaN(radiusNum) || radiusNum <= 0 || radiusNum > 50) {
      newErrors.radiusKm = "Radius must be between 0.1 and 50 km"
    }

    if (!businessType) {
      newErrors.businessType = "Please select a business type"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleAnalyze = () => {
    if (validateParameters()) {
      onAnalyze()
    }
  }

  const handlePresetSelect = (preset: (typeof PRESET_LOCATIONS)[0]) => {
    onParameterChange({
      lat: preset.lat,
      lon: preset.lon,
      businessType,
      radiusKm,
    })
  }

  const handleSavePreset = () => {
    if (!validateParameters()) return

    const presetName = `${businessType} - ${lat}, ${lon}`
    const newPreset = {
      name: presetName,
      params: { lat, lon, businessType, radiusKm },
      timestamp: new Date().toISOString(),
    }

    const updatedPresets = [newPreset, ...savedPresets.slice(0, 9)] // Keep only 10 most recent
    setSavedPresets(updatedPresets)
    localStorage.setItem("radiu-ai-presets", JSON.stringify(updatedPresets))
  }

  const handleLoadPreset = (preset: (typeof savedPresets)[0]) => {
    onParameterChange(preset.params)
  }

  const handleMapLocationChange = (newLat: string, newLon: string, address?: string) => {
    onParameterChange({
      lat: newLat,
      lon: newLon,
      businessType,
      radiusKm,
    })
  }

  const selectedBusinessType = BUSINESS_TYPES.find((bt) => bt.value === businessType)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Analysis Parameters
        </CardTitle>
        <CardDescription>
          Configure location and business parameters for comprehensive market intelligence analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Basic Settings</TabsTrigger>
            <TabsTrigger value="presets">Presets</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Location Input Method</Label>
              <div className="flex items-center gap-2">
                <Button variant={useMapInput ? "default" : "outline"} size="sm" onClick={() => setUseMapInput(true)}>
                  <Map className="h-4 w-4 mr-1" />
                  Map
                </Button>
                <Button variant={!useMapInput ? "default" : "outline"} size="sm" onClick={() => setUseMapInput(false)}>
                  <MapPin className="h-4 w-4 mr-1" />
                  Manual
                </Button>
              </div>
            </div>

            {useMapInput ? (
              <GoogleMapsPicker lat={lat} lon={lon} onLocationChange={handleMapLocationChange} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude" className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Latitude
                  </Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={lat}
                    onChange={(e) => onParameterChange({ lat: e.target.value, lon, businessType, radiusKm })}
                    placeholder="40.7128"
                    className={errors.lat ? "border-destructive" : ""}
                  />
                  {errors.lat && <p className="text-xs text-destructive">{errors.lat}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={lon}
                    onChange={(e) => onParameterChange({ lat, lon: e.target.value, businessType, radiusKm })}
                    placeholder="-74.0060"
                    className={errors.lon ? "border-destructive" : ""}
                  />
                  {errors.lon && <p className="text-xs text-destructive">{errors.lon}</p>}
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="business-type">Business Type</Label>
                <Select
                  value={businessType}
                  onValueChange={(value) => onParameterChange({ lat, lon, businessType: value, radiusKm })}
                >
                  <SelectTrigger className={errors.businessType ? "border-destructive" : ""}>
                    <SelectValue placeholder="Select business type" />
                  </SelectTrigger>
                  <SelectContent>
                    {BUSINESS_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex flex-col">
                          <span>{type.label}</span>
                          <span className="text-xs text-muted-foreground">{type.description}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.businessType && <p className="text-xs text-destructive">{errors.businessType}</p>}
                {selectedBusinessType && (
                  <p className="text-xs text-muted-foreground">{selectedBusinessType.description}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="radius">Analysis Radius (km)</Label>
                <Input
                  id="radius"
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="50"
                  value={radiusKm}
                  onChange={(e) => onParameterChange({ lat, lon, businessType, radiusKm: e.target.value })}
                  placeholder="2"
                  className={errors.radiusKm ? "border-destructive" : ""}
                />
                {errors.radiusKm && <p className="text-xs text-destructive">{errors.radiusKm}</p>}
                <p className="text-xs text-muted-foreground">
                  Recommended: 1-5km for urban areas, 5-20km for suburban areas
                </p>
              </div>
            </div>

            {lat && lon && businessType && (
              <div className="p-3 bg-muted rounded-lg">
                <h4 className="text-sm font-medium mb-2">Current Selection</h4>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">
                    {Number.parseFloat(lat).toFixed(4)}, {Number.parseFloat(lon).toFixed(4)}
                  </Badge>
                  <Badge variant="outline">{selectedBusinessType?.label}</Badge>
                  <Badge variant="outline">{radiusKm}km radius</Badge>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="presets" className="space-y-4">
            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Major Cities
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {PRESET_LOCATIONS.map((preset) => (
                  <Button
                    key={preset.name}
                    variant="outline"
                    size="sm"
                    onClick={() => handlePresetSelect(preset)}
                    className="justify-start h-auto p-3"
                  >
                    <div className="text-left">
                      <div className="font-medium">{preset.name}</div>
                      <div className="text-xs text-muted-foreground">{preset.description}</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Saved Presets
                </h4>
                <Button variant="outline" size="sm" onClick={handleSavePreset} disabled={!lat || !lon || !businessType}>
                  <Star className="h-3 w-3 mr-1" />
                  Save Current
                </Button>
              </div>
              {savedPresets.length > 0 ? (
                <div className="space-y-2">
                  {savedPresets.map((preset, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1">
                        <div className="text-sm font-medium">{preset.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(preset.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => handleLoadPreset(preset)}>
                        Load
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No saved presets yet</p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="advanced" className="space-y-4">
            <div className="space-y-4">
              <Alert>
                <Settings className="h-4 w-4" />
                <AlertDescription>
                  Advanced settings for fine-tuning your market analysis. These parameters affect the depth and scope of
                  the intelligence gathering.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label>Analysis Depth</Label>
                <Select defaultValue="standard">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quick">Quick Analysis (Basic metrics only)</SelectItem>
                    <SelectItem value="standard">Standard Analysis (Recommended)</SelectItem>
                    <SelectItem value="comprehensive">Comprehensive Analysis (All metrics)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Higher depth provides more detailed insights but takes longer to process
                </p>
              </div>

              <div className="space-y-2">
                <Label>Data Freshness Preference</Label>
                <Select defaultValue="balanced">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="latest">Latest Data Only (May be incomplete)</SelectItem>
                    <SelectItem value="balanced">Balanced (Recommended)</SelectItem>
                    <SelectItem value="historical">Include Historical Data</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Competitor Analysis Scope</Label>
                <Select defaultValue="direct">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="direct">Direct Competitors Only</SelectItem>
                    <SelectItem value="related">Include Related Businesses</SelectItem>
                    <SelectItem value="all">All Business Types</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {Object.keys(errors).length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Please fix the following issues before running analysis:
                    <ul className="mt-2 list-disc list-inside">
                      {Object.entries(errors).map(([field, error]) => (
                        <li key={field} className="text-xs">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 pt-4 border-t">
          <Button
            onClick={handleAnalyze}
            disabled={loading || Object.keys(errors).length > 0}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <>
                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Analyzing Market Intelligence...
              </>
            ) : (
              <>
                <Target className="mr-2 h-4 w-4" />
                Run Market Intelligence Analysis
              </>
            )}
          </Button>
          {Object.keys(errors).length > 0 && (
            <p className="text-xs text-muted-foreground mt-2 text-center">Fix parameter errors to enable analysis</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
