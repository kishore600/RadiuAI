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
import {
  Target,
  MapPin,
  Map,
  Layers,
  CheckCircle2,
  Users,
  TrendingUp,
  AlertCircle,
  Radar,
  Building2,
  ShoppingCart,
  Coffee,
  Store,
  Pill,
  Car,
  Banknote,
  Dumbbell,
} from "lucide-react";
import { GoogleMapsPicker } from "./google-maps-picker";

interface ParameterControlsProps {
  lat: string;
  lon: string;
  businessType: string;
  radiusKm: string;
  focus: string;
  target_audience: string;
  onParameterChange: (params: {
    lat: string;
    lon: string;
    businessType: string;
    radiusKm: string;
    focus: string;
    target_audience: string;
  }) => void;
  onAnalyze: () => void;
  loading: boolean;
}

const BUSINESS_TYPES = [
  {
    value: "supermarket",
    label: "Supermarket",
    description: "Grocery stores and food markets",
    icon: ShoppingCart,
    color: "from-green-500 to-green-600",
  },
  {
    value: "restaurant",
    label: "Restaurant",
    description: "Dining establishments",
    icon: Coffee,
    color: "from-orange-500 to-orange-600",
  },
  {
    value: "retail",
    label: "Retail Store",
    description: "General merchandise stores",
    icon: Store,
    color: "from-purple-500 to-purple-600",
  },
  {
    value: "pharmacy",
    label: "Pharmacy",
    description: "Drug stores and pharmacies",
    icon: Pill,
    color: "from-red-500 to-red-600",
  },
  {
    value: "gas_station",
    label: "Gas Station",
    description: "Fuel stations and convenience stores",
    icon: Car,
    color: "from-blue-500 to-blue-600",
  },
  {
    value: "bank",
    label: "Bank",
    description: "Financial institutions",
    icon: Banknote,
    color: "from-yellow-500 to-yellow-600",
  },
  {
    value: "coffee_shop",
    label: "Coffee Shop",
    description: "Cafes and coffee houses",
    icon: Coffee,
    color: "from-amber-500 to-amber-600",
  },
  {
    value: "gym",
    label: "Gym/Fitness",
    description: "Fitness centers and gyms",
    icon: Dumbbell,
    color: "from-indigo-500 to-indigo-600",
  },
];

export function ParameterControls({
  lat,
  lon,
  businessType,
  radiusKm,
  focus,
  target_audience,
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

  const handleMapLocationChange = (newLat: string, newLon: string) => {
    onParameterChange({
      lat: newLat,
      lon: newLon,
      businessType,
      radiusKm,
      focus,
      target_audience,
    });
  };

  const selectedBusinessType = BUSINESS_TYPES.find(
    (bt) => bt.value === businessType
  );

  return (
    <Card className="w-full mx-auto border-0  bg-gradient-to-br from-white to-gray-50/50 ">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
          <Target className="h-5 w-5 text-white" />
          </div>
          <p className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Analysis Parameters
          </p>
        </CardTitle>
        <CardDescription>
          Configure location and business parameters for comprehensive market
          intelligence analysis
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                    focus,
                    target_audience,
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
                    focus,
                    target_audience,
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

        <div className="space-y-2 mt-4 px-3">
          {/* Business Configuration */}
          <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-gray-50/50 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    Business Configuration
                  </h3>
                  <p className="text-sm text-gray-500">
                    Define your business type and analysis scope
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label
                    htmlFor="business-type"
                    className="text-sm font-medium ml-3"
                  >
                    Business Type
                  </Label>
                  <Select
                    value={businessType}
                    onValueChange={(value) =>
                      onParameterChange({
                        lat,
                        lon,
                        businessType: value,
                        radiusKm,
                        focus,
                        target_audience,
                      })
                    }
                  >
                    <SelectTrigger
                      className={`h-12 mt-4 border-2 transition-all duration-200 mt-6 focus:ring-4 focus:ring-purple-500/20 ${
                        errors.businessType
                          ? "border-red-400 bg-red-50"
                          : businessType
                          ? ""
                          : "border-gray-200 hover:border-purple-300"
                      }`}
                    >
                      <SelectValue placeholder="Select your business type" />
                    </SelectTrigger>
                    <SelectContent className="max-h-[300px]">
                      {BUSINESS_TYPES.map((type) => {
                        const IconComponent = type.icon;
                        return (
                          <SelectItem
                            key={type.value}
                            value={type.value}
                            className="p-3"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`p-2 rounded-lg bg-gradient-to-r ${type.color}`}
                              >
                                <IconComponent className="h-4 w-4 text-white" />
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {type.label}
                                </span>
                                <span className="text-xs text-black">
                                  {type.description}
                                </span>
                              </div>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {errors.businessType && (
                    <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded-lg">
                      <AlertCircle className="h-3 w-3" />
                      {errors.businessType}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                    💡 Note: Focused business type selection helps tailor the
                    analysis to your specific market segment and competitive
                    landscape.
                  </p>
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="radius"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <Radar className="h-4 w-4 text-purple-500" />
                    Analysis Radius (km)
                  </Label>
                  <div className="relative">
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
                          focus,
                          target_audience,
                        })
                      }
                      placeholder="2"
                      className={`h-12 pl-4 pr-12 border-2 transition-all duration-200 focus:ring-4 focus:ring-purple-500/20 ${
                        errors.radiusKm
                          ? "border-red-400 bg-red-50"
                          : radiusKm && !errors.radiusKm
                          ? "border-green-400 bg-green-50"
                          : "border-gray-200 hover:border-purple-300"
                      }`}
                    />
                    {radiusKm && !errors.radiusKm && (
                      <CheckCircle2 className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-green-500" />
                    )}
                    {errors.radiusKm && (
                      <AlertCircle className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-red-500" />
                    )}
                  </div>
                  {errors.radiusKm ? (
                    <div className="flex items-center gap-2 text-xs text-red-600 bg-red-50 p-2 rounded-lg">
                      <AlertCircle className="h-3 w-3" />
                      {errors.radiusKm}
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                      💡 Recommended: 1-5km for urban areas, 5-20km for suburban
                      areas
                    </p>
                  )}
                </div>
              </div>

              {/* Focus and Target Audience */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label
                    htmlFor="focus"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <TrendingUp className="h-4 w-4 text-blue-500" />
                    Focus Area
                  </Label>
                  <Input
                    id="focus"
                    value={focus}
                    onChange={(e) =>
                      onParameterChange({
                        lat,
                        lon,
                        businessType,
                        radiusKm,
                        focus: e.target.value,
                        target_audience,
                      })
                    }
                    placeholder="e.g., Market penetration, Customer acquisition"
                    className="h-12 border-2 border-gray-200 hover:border-blue-300 focus:ring-4 focus:ring-blue-500/20 transition-all duration-200"
                  />
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="target_audience"
                    className="flex items-center gap-2 text-sm font-medium"
                  >
                    <Users className="h-4 w-4 text-green-500" />
                    Target Audience
                  </Label>
                  <Input
                    id="target_audience"
                    value={target_audience}
                    onChange={(e) =>
                      onParameterChange({
                        lat,
                        lon,
                        businessType,
                        radiusKm,
                        focus,
                        target_audience: e.target.value,
                      })
                    }
                    placeholder="e.g., Young professionals, Families, Students"
                    className="h-12 border-2 border-gray-200 hover:border-green-300 focus:ring-4 focus:ring-green-500/20 transition-all duration-200"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Current Configuration Summary */}
          {lat && lon && businessType && (
            <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 backdrop-blur-sm animate-fade-in">
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <Layers className="h-5 w-5 text-white" />
                  </div>
                  <h4 className="text-lg font-semibold">
                    Configuration Summary
                  </h4>
                  {/* {isValidated && (
                <CheckCircle2 className="h-5 w-5 text-green-500 animate-bounce" />
              )} */}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/60 p-4 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium text-gray-600">
                        Location
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800"
                    >
                      {parseFloat(lat).toFixed(4)}, {parseFloat(lon).toFixed(4)}
                    </Badge>
                  </div>

                  <div className="bg-white/60 p-4 rounded-lg border border-purple-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium text-gray-600">
                        Business
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800"
                    >
                      {selectedBusinessType?.label}
                    </Badge>
                  </div>

                  <div className="bg-white/60 p-4 rounded-lg border border-green-200">
                    <div className="flex items-center gap-2 mb-2">
                      <Radar className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium text-gray-600">
                        Radius
                      </span>
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-gradient-to-r from-green-100 to-green-200 text-green-800"
                    >
                      {radiusKm}km coverage
                    </Badge>
                  </div>
                </div>

                {(focus || target_audience) && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {focus && (
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700 border-blue-200"
                      >
                        🎯 {focus}
                      </Badge>
                    )}
                    {target_audience && (
                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200"
                      >
                        👥 {target_audience}
                      </Badge>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
