import React from "react";
import LocationForm from "./location-form";
import ResultsView from "./results-view";
import { useState } from "react";
import { ParameterControls } from "./parameter-controls";

const MarketOpportunityScore = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [result, setResult] = useState<any | null>(null);
  const [latitude, setLatitude] = useState<string>("40.7128"); // default: Manhattan
  const [longitude, setLongitude] = useState<string>("-74.006");
  const [radius, setRadius] = useState<string>("5");
  const [businessType, setBusinessType] = useState<string>("supermarket");
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "http://localhost:5000/analyze/market_opportunity_score",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            latitude: latitude,
            longitude: longitude,
            radius_km: radius,
            business_type: businessType,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleParameterChange = (params: {
    lat: string;
    lon: string;
    businessType: string;
    radiusKm: string;
  }) => {
    setLatitude(params.lat);
    setLongitude(params.lon);
    setBusinessType(params.businessType);
    setRadius(params.radiusKm);
  };

  return (
    <div>
      <ParameterControls
        lat={latitude}
        lon={longitude}
        businessType={businessType}
        radiusKm={radius}
        onParameterChange={handleParameterChange}
        onAnalyze={handleSearch}
        loading={loading}
      />
      {result && <ResultsView data={result} />}
    </div>
  );
};

export default MarketOpportunityScore;
