"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Target, MapPin, Map } from "lucide-react";
import {GoogleMapsPicker} from "./google-maps-picker";

interface ParameterControlsProps {
  lat: string;
  lon: string;
  businessType: string;
  radiusKm: string;
  onParameterChange: (params: {
    lat: string;
    lon: string;
    businessType: string;
    radiusKm: string;
  }) => void;
  onAnalyze: () => void;
  loading: boolean;
}

const BUSINESS_TYPES = [
  {
    value: "supermarket",
    label: "Supermarket",
    description: "Grocery stores and food markets",
  },
  {
    value: "restaurant",
    label: "Restaurant",
    description: "Dining establishments",
  },
  {
    value: "retail",
    label: "Retail Store",
    description: "General merchandise stores",
  },
  {
    value: "pharmacy",
    label: "Pharmacy",
    description: "Drug stores and pharmacies",
  },
  {
    value: "gas_station",
    label: "Gas Station",
    description: "Fuel stations and convenience stores",
  },
  { value: "bank", label: "Bank", description: "Financial institutions" },
  {
    value: "coffee_shop",
    label: "Coffee Shop",
    description: "Cafes and coffee houses",
  },
  {
    value: "gym",
    label: "Gym/Fitness",
    description: "Fitness centers and gyms",
  },
];

export function ParameterControls({
  lat,
  lon,
  businessType,
  radiusKm,
  onParameterChange,
  onAnalyze,
  loading,
}: ParameterControlsProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [useMapInput, setUseMapInput] = useState(true);

  const validateParameters = () => {
    const newErrors: Record<string, string> = {};

    const latNum = Number.parseFloat(lat);
    const lonNum = Number.parseFloat(lon);
    const radiusNum = Number.parseFloat(radiusKm);

    if (isNaN(latNum) || latNum < -90 || latNum > 90) {
      newErrors.lat = "Latitude must be between -90 and 90";
    }

    if (isNaN(lonNum) || lonNum < -180 || lonNum > 180) {
      newErrors.lon = "Longitude must be between -180 and 180";
    }

    if (isNaN(radiusNum) || radiusNum <= 0 || radiusNum > 50) {
      newErrors.radiusKm = "Radius must be between 0.1 and 50 km";
    }

    if (!businessType) {
      newErrors.businessType = "Please select a business type";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAnalyze = () => {
    if (validateParameters()) {
      onAnalyze();
    }
  };

  const handleMapLocationChange = (
    newLat: string,
    newLon: string,
    address?: string
  ) => {
    onParameterChange({
      lat: newLat,
      lon: newLon,
      businessType,
      radiusKm,
    });
  };

  const selectedBusinessType = BUSINESS_TYPES.find(
    (bt) => bt.value === businessType
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Analysis Parameters
        </CardTitle>
        <CardDescription>
          Configure location and business parameters for comprehensive market
          intelligence analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Location Input Method</Label>
          <div className="flex items-center gap-2">
            <Button
              variant={useMapInput ? "default" : "outline"}
              size="sm"
              onClick={() => setUseMapInput(true)}
            >
              <Map className="h-4 w-4 mr-1" />
              Map
            </Button>
            <Button
              variant={!useMapInput ? "default" : "outline"}
              size="sm"
              onClick={() => setUseMapInput(false)}
            >
              <MapPin className="h-4 w-4 mr-1" />
              Manual
            </Button>
          </div>
        </div>

        {useMapInput ? (
          <GoogleMapsPicker
            lat={lat}
            lon={lon}
            onLocationChange={handleMapLocationChange}
          />
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
                onChange={(e) =>
                  onParameterChange({
                    lat: e.target.value,
                    lon,
                    businessType,
                    radiusKm,
                  })
                }
                placeholder="40.7128"
                className={errors.lat ? "border-destructive" : ""}
              />
              {errors.lat && (
                <p className="text-xs text-destructive">{errors.lat}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                type="number"
                step="any"
                value={lon}
                onChange={(e) =>
                  onParameterChange({
                    lat,
                    lon: e.target.value,
                    businessType,
                    radiusKm,
                  })
                }
                placeholder="-74.0060"
                className={errors.lon ? "border-destructive" : ""}
              />
              {errors.lon && (
                <p className="text-xs text-destructive">{errors.lon}</p>
              )}
            </div>
          </div>
        )}

        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="business-type">Business Type</Label>
            <div className="mt-3">
              <Select
                value={businessType}
                onValueChange={(value) =>
                  onParameterChange({ lat, lon, businessType: value, radiusKm })
                }
              >
                <SelectTrigger
                  className={errors.businessType ? "border-destructive" : ""}
                >
                  <SelectValue placeholder="Select business type" />
                </SelectTrigger>
                <SelectContent>
                  {BUSINESS_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex flex-col">
                        <span className="flex">{type.label}</span>
                        <span className="text-xs text-muted-foreground">
                          {type.description}
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {errors.businessType && (
              <p className="text-xs text-destructive">{errors.businessType}</p>
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
              onChange={(e) =>
                onParameterChange({
                  lat,
                  lon,
                  businessType,
                  radiusKm: e.target.value,
                })
              }
              placeholder="2"
              className={errors.radiusKm ? "border-destructive" : ""}
            />
            {errors.radiusKm && (
              <p className="text-xs text-destructive">{errors.radiusKm}</p>
            )}
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
                {Number.parseFloat(lat).toFixed(4)},{" "}
                {Number.parseFloat(lon).toFixed(4)}
              </Badge>
              <Badge variant="outline">{selectedBusinessType?.label}</Badge>
              <Badge variant="outline">{radiusKm}km radius</Badge>
            </div>
          </div>
        )}

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
            <p className="text-xs text-muted-foreground mt-2 text-center">
              Fix parameter errors to enable analysis
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
