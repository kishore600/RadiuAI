"use client"

/*
 * SECURITY NOTE: Google Maps API Key Usage
 *
 * The NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is intentionally exposed to the client-side
 * because the Google Maps JavaScript API requires a browser-accessible API key.
 * This is the standard and secure way to implement Google Maps.
 *
 * To secure your API key:
 * 1. In Google Cloud Console, restrict your API key by:
 *    - HTTP referrers (websites) - add your domain(s)
 *    - API restrictions - enable only Maps JavaScript API and Geocoding API
 * 2. Monitor usage in Google Cloud Console
 * 3. Set usage quotas to prevent unexpected charges
 *
 * This approach is recommended by Google's official documentation.
 */

import type React from "react"
import { useEffect, useRef, useState } from "react"
import { Loader } from "@googlemaps/js-api-loader"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { MapPin, Search, Crosshair, Shield } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

declare global {
  interface Window {
    google: typeof google
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
const [map, setMap] = useState<google.maps.Map | null>(null)
const [marker, setMarker] = useState<google.maps.Marker | null>(null)
  const [searchInput, setSearchInput] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentAddress, setCurrentAddress] = useState<string>("")

  // Initialize Google Maps
  useEffect(() => {
    const initMap = async () => {
      try {
        const loader = new Loader({
          // This API key is intentionally client-side for Google Maps JavaScript API
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
          styles: [
            {
              featureType: "poi",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
            {
              featureType: "transit",
              elementType: "labels",
              stylers: [{ visibility: "off" }],
            },
          ],
        })

        // Create marker with custom styling
        const markerInstance = new window.google.maps.Marker({
          position: {
            lat: Number.parseFloat(lat) || 40.7128,
            lng: Number.parseFloat(lon) || -74.006,
          },
          map: mapInstance,
          draggable: true,
          title: "Click and drag to set location",
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: "#8b5cf6",
            fillOpacity: 1,
            strokeColor: "#ffffff",
            strokeWeight: 2,
          },
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
        setError("Failed to load Google Maps. Please check your API key configuration.")
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

    setError(null) // Clear previous errors
    setIsLoading(true) // Show loading state during geolocation

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
        setIsLoading(false) // Clear loading state on success
      },
      (error) => {
        console.error("Geolocation error:", error)
        setIsLoading(false) // Clear loading state on error

        let errorMessage = ""
        let actionMessage = ""

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access was denied."
            actionMessage =
              "Please click the location icon in your browser's address bar and allow location access, then try again."
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Your location could not be determined."
            actionMessage =
              "Please check your GPS/location services are enabled and try again, or enter coordinates manually."
            break
          case error.TIMEOUT:
            errorMessage = "Location request timed out."
            actionMessage = "Please try again or check your internet connection."
            break
          default:
            errorMessage = "An unknown error occurred while getting your location."
            actionMessage = "Please try again or enter your location manually."
            break
        }

        setError(`${errorMessage} ${actionMessage}`)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000, // Increased timeout to 15 seconds
        maximumAge: 60000, // Reduced cache time to 1 minute for more accurate location
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
      <Alert variant="destructive" className="border-destructive/50">
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <div className="space-y-2">
            <p>
              <strong>Google Maps API key required</strong>
            </p>
            <p>
              Add <code className="bg-muted px-1 rounded">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> to your environment
              variables.
            </p>
            <p className="text-xs">
              <strong>Security:</strong> Restrict your API key in Google Cloud Console by domain and API scope.
            </p>
          </div>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <Card className={`${className} border-accent/20 bg-gradient-to-br from-card to-muted/30`}>
      <CardContent className="p-6 space-y-4">
        <div className="space-y-3">
          <Label className="flex items-center gap-2 text-base font-semibold">
            <div className="p-1 rounded bg-gradient-to-br from-accent to-primary text-white">
              <Search className="h-3 w-3" />
            </div>
            Location Search
          </Label>
          <div className="flex gap-2">
            <Input
              placeholder="Enter address, city, or landmark..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 border-accent/20 focus:border-accent"
            />
            <Button
              onClick={handleAddressSearch}
              variant="outline"
              size="sm"
              className="border-accent/20 hover:bg-accent/10 bg-transparent"
            >
              <Search className="h-4 w-4" />
            </Button>
            <Button
              onClick={handleCurrentLocation}
              variant="outline"
              size="sm"
              title="Use current location"
              className="border-accent/20 hover:bg-accent/10 bg-transparent"
            >
              <Crosshair className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Current Address Display */}
        {currentAddress && (
          <div className="p-3 bg-gradient-to-r from-muted to-muted/50 rounded-lg border border-accent/10">
            <div className="flex items-start gap-2">
              <MapPin className="h-4 w-4 text-accent mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-xs font-medium text-muted-foreground">Selected Location</p>
                <p className="text-sm">{currentAddress}</p>
              </div>
            </div>
          </div>
        )}

        {/* Map Container */}
        <div className="relative">
          <div
            ref={mapRef}
            className="w-full h-80 rounded-xl border border-accent/20 shadow-lg"
            style={{ minHeight: "320px" }}
          />

          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-muted to-muted/80 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-background/80 border border-accent/20">
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                <span className="font-medium">Loading interactive map...</span>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Instructions */}
        <div className="p-4 bg-gradient-to-r from-accent/5 to-primary/5 rounded-lg border border-accent/10">
          <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
            <MapPin className="h-4 w-4 text-accent" />
            How to use
          </h4>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>
              • <strong>Click</strong> anywhere on the map to set your analysis location
            </p>
            <p>
              • <strong>Drag</strong> the purple marker to fine-tune the exact position
            </p>
            <p>
              • <strong>Search</strong> for specific addresses or landmarks using the search box
            </p>
            <p>
              • <strong>Current location</strong> button uses your device's GPS (requires permission)
            </p>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="border-destructive/50 bg-destructive/5">
            <AlertDescription className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              {error}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
