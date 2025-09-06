"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Loader } from "@googlemaps/js-api-loader"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { MapPin, Search, Crosshair } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

declare global {
  interface Window {
    google: unknown
  }
}

interface GoogleMapsPickerProps {
  lat: string
  lon: string
  onLocationChange: (lat: string, lon: string, address?: string) => void
  className?: string
}

export function GoogleMapsPicker({ lat, lon, onLocationChange, className }: GoogleMapsPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [marker, setMarker] = useState<any>(null)
  const [searchInput, setSearchInput] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentAddress, setCurrentAddress] = useState<string>("")

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      try {
        const loader = new Loader({
          apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
          version: "weekly",
          libraries: ["places", "geocoding"],
        })

        await loader.load()

        if (!mapRef.current || !window.google) return

        const mapInstance = new window.google.maps.Map(mapRef.current, {
          center: {
            lat: Number.parseFloat(lat) || 40.7128,
            lng: Number.parseFloat(lon) || -74.006,
          },
          zoom: 13,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        })

        // Create marker
        const markerInstance = new window.google.maps.Marker({
          position: {
            lat: Number.parseFloat(lat) || 40.7128,
            lng: Number.parseFloat(lon) || -74.006,
          },
          map: mapInstance,
          draggable: true,
          title: "Click and drag to set location",
        })

        // Handle map clicks
        mapInstance.addListener("click", (event: any) => {
          if (event.latLng) {
            const newLat = event.latLng.lat().toString()
            const newLng = event.latLng.lng().toString()

            markerInstance.setPosition(event.latLng)
            onLocationChange(newLat, newLng)

            // Reverse geocode to get address
            reverseGeocode(event.latLng.lat(), event.latLng.lng())
          }
        })

        // Handle marker drag
        markerInstance.addListener("dragend", (event: any) => {
          if (event.latLng) {
            const newLat = event.latLng.lat().toString()
            const newLng = event.latLng.lng().toString()

            onLocationChange(newLat, newLng)
            reverseGeocode(event.latLng.lat(), event.latLng.lng())
          }
        })

        setMap(mapInstance)
        setMarker(markerInstance)
        setIsLoading(false)

        // Get initial address
        if (lat && lon) {
          reverseGeocode(Number.parseFloat(lat), Number.parseFloat(lon))
        }
      } catch (err) {
        console.error("Error loading Google Maps:", err)
        setError("Failed to load Google Maps. Please check your API key.")
        setIsLoading(false)
      }
    }

    initMap()
  }, [])

  // Update marker position when lat/lon props change
  useEffect(() => {
    if (map && marker && lat && lon) {
      const newPosition = { lat: Number.parseFloat(lat), lng: Number.parseFloat(lon) }
      marker.setPosition(newPosition)
      map.setCenter(newPosition)
    }
  }, [lat, lon, map, marker])

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      if (!window.google) return

      const geocoder = new window.google.maps.Geocoder()
      const response = await geocoder.geocode({
        location: { lat, lng },
      })

      if (response.results[0]) {
        setCurrentAddress(response.results[0].formatted_address)
      }
    } catch (err) {
      console.error("Reverse geocoding failed:", err)
    }
  }

  const handleAddressSearch = async () => {
    if (!searchInput.trim() || !map || !window.google) return

    try {
      const geocoder = new window.google.maps.Geocoder()
      const response = await geocoder.geocode({
        address: searchInput,
      })

      if (response.results[0]) {
        const location = response.results[0].geometry.location
        const newLat = location.lat().toString()
        const newLng = location.lng().toString()

        map.setCenter(location)
        map.setZoom(15)

        if (marker) {
          marker.setPosition(location)
        }

        onLocationChange(newLat, newLng, response.results[0].formatted_address)
        setCurrentAddress(response.results[0].formatted_address)
        setSearchInput("")
      }
    } catch (err) {
      console.error("Geocoding failed:", err)
      setError("Address search failed. Please try a different address.")
    }
  }

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.")
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const newLat = position.coords.latitude.toString()
        const newLng = position.coords.longitude.toString()

        if (map && marker) {
          const location = { lat: position.coords.latitude, lng: position.coords.longitude }
          map.setCenter(location)
          map.setZoom(15)
          marker.setPosition(location)
        }

        onLocationChange(newLat, newLng)
        reverseGeocode(position.coords.latitude, position.coords.longitude)
      },
      (error) => {
        console.error("Geolocation error:", error)
        setError("Unable to get your current location.")
      },
    )
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddressSearch()
    }
  }

  if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
    return (
      <Alert variant="destructive">
        <MapPin className="h-4 w-4" />
        <AlertDescription>
          Google Maps API key is required. Please add NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to your environment variables.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className={className}>
      <CardContent className="p-4 space-y-4">
        {/* Address Search */}
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search Address
          </Label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter address or place name..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
            />
            <Button onClick={handleAddressSearch} variant="outline" size="sm">
              <Search className="h-4 w-4" />
            </Button>
            <Button onClick={handleCurrentLocation} variant="outline" size="sm" title="Use current location">
              <Crosshair className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Current Address Display */}
        {currentAddress && (
          <div className="p-2 bg-muted rounded text-sm">
            <strong>Selected:</strong> {currentAddress}
          </div>
        )}

        {/* Map Container */}
        <div className="relative">
          <div ref={mapRef} className="w-full h-64 rounded-lg border" style={{ minHeight: "256px" }} />

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Loading map...
              </div>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• Click anywhere on the map to set location</p>
          <p>• Drag the marker to fine-tune position</p>
          <p>• Search for addresses using the search box above</p>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
