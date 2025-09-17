/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { ParameterControls } from "./parameter-controls";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RetailMarketIntelligence } from "./retail-market-intelligence";
import MarketOpportunityScore from "./market-opportunity-scorer";

interface ModelData {
  retailMarketIntelligence: any | null;
  marketOpportunityScore: any | null;
  culturalIntelligence: any | null;
  businessRecommendation: any | null;
  [key: string]: any | null;
}

const CommonParameterControl = () => {
  const [data, setData] = useState<ModelData>({
    retailMarketIntelligence: null,
    marketOpportunityScore: null,
    culturalIntelligence: null,
    businessRecommendation: null,
  });

  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string | null>(null);
  const [lastAnalysis, setLastAnalysis] = useState<string>("Never");
  const [activeModels, setActiveModels] = useState<{ [key: string]: boolean }>({
    retailMarketIntelligence: false,
    marketOpportunityScore: false,
    culturalIntelligence: false,
    businessRecommendation: false,
  });

  const [lat, setLat] = useState("40.7128");
  const [lon, setLon] = useState("-74.0060");
  const [businessType, setBusinessType] = useState("supermarket");
  const [radiusKm, setRadiusKm] = useState("2");

  const handleParameterChange = (params: {
    lat: string;
    lon: string;
    businessType: string;
    radiusKm: string;
  }) => {
    setLat(params.lat);
    setLon(params.lon);
    setBusinessType(params.businessType);
    setRadiusKm(params.radiusKm);
  };

  const toggleModel = (modelName: keyof typeof activeModels) => {
    setActiveModels((prev) => ({
      ...prev,
      [modelName]: !prev[modelName],
    }));
  };

  const fetchModelData = async (modelName: keyof typeof activeModels) => {
    setLoading((prev) => ({ ...prev, [modelName]: true }));
    setError(null);

    try {
      let url = "";
      let options: RequestInit = {};

      const params = new URLSearchParams({
        lat,
        lon,
        businessType,
        radiusKm,
      });

      switch (modelName) {
        case "retailMarketIntelligence":
          url = `http://localhost:5000/analyze/retail_market_intelligence_model?${params}`;
          options = { method: "GET" };
          break;

        case "marketOpportunityScore":
          url = `http://localhost:5000/analyze/market_opportunity_score`;
          options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lat,
              lon,
              businessType,
              radiusKm,
            }),
          };
          break;

        case "culturalIntelligence":
          url = `http://localhost:5000/analyze/cultural_intelligence_model?${params}`;
          options = { method: "GET" };
          break;

        case "businessRecommendation":
          url = `http://localhost:5000/analyze/business_recommendation_engine?${params}`;
          options = { method: "GET" };
          break;

        default:
          throw new Error("Unknown model");
      }

      const response = await fetch(url, options);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      setData((prev) => ({
        ...prev,
        [modelName]: result,
      }));

      setLastAnalysis(new Date().toLocaleString());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : `Failed to fetch ${modelName} data`
      );
    } finally {
      setLoading((prev) => ({ ...prev, [modelName]: false }));
    }
  };

  const fetchAllActiveModels = async () => {
    const activeModelNames = Object.entries(activeModels)
      .filter(([_, isActive]) => isActive)
      .map(([modelName]) => modelName as keyof typeof activeModels);

    if (activeModelNames.length === 0) {
      setError("Please select at least one model to analyze");
      return;
    }

    for (const modelName of activeModelNames) {
      await fetchModelData(modelName);
    }
  };

  const ModelToggle = ({
    name,
    displayName,
  }: {
    name: keyof typeof activeModels;
    displayName: string;
  }) => (
    <Card>
      <CardContent className="flex items-center justify-between border-none">
        <div className="flex items-center gap-3">
          <Switch
            checked={activeModels[name]}
            className={`data-[state=unchecked]:bg-gray-400 data-[state=checked]:bg-blue-600 `}
            onCheckedChange={() => toggleModel(name)}
          />
          <Label className="font-medium">{displayName}</Label>
        </div>

        <div className="flex items-center gap-3">
          {loading[name] && (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
          )}
          {data[name] && !loading[name] && (
            <span className="text-sm text-green-600">✓ Data loaded</span>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 space-y-6">
      <ParameterControls
        lat={lat}
        lon={lon}
        businessType={businessType}
        radiusKm={radiusKm}
        onParameterChange={handleParameterChange}
        onAnalyze={fetchAllActiveModels}
        loading={Object.values(loading).some((l) => l)}
      />

      {/* Model Toggles */}
 {/* Model Toggles */}
<div className="mt-10">
  <Card>
    <CardHeader>
      <CardTitle className="text-xl font-semibold">
        Select Models to Analyze
      </CardTitle>
      <p className="text-sm text-muted-foreground">
        Choose one or more models to include in your analysis.
      </p>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <ModelToggle
          name="retailMarketIntelligence"
          displayName="Retail Market Intelligence Model"
        />
        <ModelToggle
          name="marketOpportunityScore"
          displayName="Market Opportunity Score"
        />
        <ModelToggle
          name="culturalIntelligence"
          displayName="Cultural Intelligence Model"
        />
        <ModelToggle
          name="businessRecommendation"
          displayName="Business Recommendation Engine"
        />
      </div>
    </CardContent>
  </Card>
</div>


      {/* Analyze All Button */}
      <div className="flex justify-center">
        <Button
          onClick={fetchAllActiveModels}
          disabled={
            Object.values(loading).some((l) => l) ||
            Object.values(activeModels).every((a) => !a)
          }
          className="w-64"
        >
          Analyze All Selected Models
        </Button>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-300 bg-red-50">
          <CardContent className="p-4 text-red-700">{error}</CardContent>
        </Card>
      )}

      {/* Last Analysis Time */}
      <p className="text-center text-sm text-gray-600">
        Last analysis: {lastAnalysis}
      </p>

      {/* Data Display */}
      <div className="w-full">
        {Object.values(data).some((d) => d) && (
          <Card className="w-full shadow-lg border border-gray-200">
            <CardHeader className="border-b bg-gray-50/70">
              <CardTitle className="text-lg font-semibold text-gray-800">
                Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue={Object.keys(data)[0]} className="w-full">
                {/* Tab buttons */}
                <TabsList className="flex flex-wrap justify-start gap-2 bg-gray-100 p-2 rounded-xl">
                  {Object.entries(data).map(
                    ([modelName, modelData]) =>
                      modelData && (
                        <TabsTrigger
                          key={modelName}
                          value={modelName}
                          className="rounded-lg px-4 py-2 text-sm font-medium transition-all
                               data-[state=active]:bg-blue-600 
                               data-[state=active]:text-white 
                               data-[state=active]:shadow-sm
                               data-[state=inactive]:bg-white 
                               data-[state=inactive]:text-gray-600 
                               hover:bg-blue-50"
                        >
                          {modelName.replace(/([A-Z])/g, " $1").trim()}
                        </TabsTrigger>
                      )
                  )}
                </TabsList>

                {/* Tab content */}
                <div className="mt-4">
                  {Object.entries(data).map(
                    ([modelName, modelData]) =>
                      modelData && (
                        <TabsContent
                          key={modelName}
                          value={modelName}
                          className="rounded-lg border p-4 bg-gray-50 shadow-inner"
                        >
                          {modelName === "marketOpportunityScore" && (
                            <MarketOpportunityScore data={modelData} />
                          )}

                          {modelName === "retailMarketIntelligence" && (
                            <RetailMarketIntelligence
                              data={modelData}
                              lat={lat}
                              lon={lon}
                              loading={loading[modelName]}
                              error={error ? "Loading error" : ""}
                            />
                          )}
                        </TabsContent>
                      )
                  )}
                </div>
              </Tabs>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CommonParameterControl;
