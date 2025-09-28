/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { ParameterControls } from "./parameter-controls";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { RetailMarketIntelligence } from "./retail-market-intelligence";
import MarketOpportunityScore from "./market-opportunity-scorer";
import CulturalIntelligence from "./cultural-intelligence";
import {
  Activity,
  AlertCircle,
  Badge,
  BarChart3,
  Building,
  Building2,
  CheckCircle2,
  Download,
  FileText,
  Globe,
  Lightbulb,
  Share,
  Sparkles,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { BusinessRecommendation } from "./business-recommendation";
import ReportActions from "./radui-action";

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
    retailMarketIntelligence: true,
    marketOpportunityScore: true,
    culturalIntelligence: true,
    businessRecommendation: true,
  });

  const [lat, setLat] = useState("40.7128");
  const [lon, setLon] = useState("-74.0060");
  const [businessType, setBusinessType] = useState("supermarket");
  const [radiusKm, setRadiusKm] = useState("2");
  const [focus, setFocus] = useState("menu and marketing recommendations");
  const [targetAudience, setTargetAudience] = useState(
    "families and young adults"
  );

  const handleParameterChange = (params: {
    lat: string;
    lon: string;
    businessType: string;
    radiusKm: string;
    focus: string;
    target_audience: string;
  }) => {
    setLat(params.lat);
    setLon(params.lon);
    setBusinessType(params.businessType);
    setRadiusKm(params.radiusKm);
    setFocus(params.focus);
    setTargetAudience(params.target_audience);
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
          url = `http://localhost:5000/analyze/cultural_intelligence_system`;
          options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lat,
              lon,
              business_type: businessType,
              focus: focus,
              target_audience: targetAudience,
            }),
          };
          break;

        case "businessRecommendation":
          url = `http://localhost:5000/analyze/business-recommendation`;
          options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              retailMarketIntelligence: data.retailMarketIntelligence,
              marketOpportunityScore: data.marketOpportunityScore,
              culturalIntelligence: data.culturalIntelligence,
            }),
          };
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
  const toggleModel = (modelName: keyof typeof activeModels) => {
    setActiveModels((prev) => {
      const newState = {
        ...prev,
        [modelName]: !prev[modelName],
      };

      // Enable business recommendation if at least 2 other models are selected
      const otherModelsSelected = Object.entries(newState)
        .filter(([key]) => key !== "businessRecommendation")
        .filter(([_, isActive]) => isActive).length;

      if (otherModelsSelected >= 2 && !newState.businessRecommendation) {
        newState.businessRecommendation = true;
      }

      return newState;
    });
  };
  const ModelToggle = ({
    name,
    displayName,
    icon: Icon,
    description,
  }: {
    name: keyof typeof activeModels;
    displayName: string;
    icon: any;
    description: string;
  }) => (
    <Card className="group relative overflow-hidden border-0 bg-gradient-to-br from-slate-50 to-slate-100 hover:from-blue-50 hover:to-indigo-50 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <CardContent className="relative p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-110">
                <Icon className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 opacity-0 group-hover:opacity-20 blur transition-all duration-300" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">
                {displayName}
              </h3>
              <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                {description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {loading[name] && (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-blue-600 font-medium">
                  Analyzing...
                </span>
              </div>
            )}
            {data[name] && !loading[name] && (
              <div className="flex items-center gap-2 bg-green-100 px-3 py-1 rounded-full">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-sm text-green-700 font-medium">
                  Complete
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
  console.log(data);
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
        focus={focus}
        target_audience={targetAudience}
      />

      <Card className="border-0 bg-white/70 backdrop-blur-sm shadow-2xl shadow-purple-500/10">
        <CardHeader className=" text-black rounded-t-lg items-center">
          <CardTitle className="flex items-center gap-3 text-2xl  flex-row">
            <div className="p-2 bg-gradient-to-r from-green-500 to-green-600 rounded-lg">
              <BarChart3 className="h-6 w-6 text-white" />
            </div>
            <div>
              <p>AI Analysis Models</p>
              <CardDescription className="text-black">
                Select one or more AI models to analyze your market intelligence
                data
              </CardDescription>
            </div>
            <Zap className="h-5 w-5 ml-auto animate-bounce" />
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ModelToggle
              name="retailMarketIntelligence"
              displayName="Retail Market Intelligence"
              description="Predict business success probability by analyzing multiple data dimensions simultaneously"
              icon={Building}
            />
            <ModelToggle
              name="marketOpportunityScore"
              displayName="Market Opportunity Score"
              description="Provides an overall attractiveness score (1-100) for any location, helping users compare multiple locations."
              icon={TrendingUp}
            />
            <ModelToggle
              name="culturalIntelligence"
              displayName="Cultural Intelligence"
              description="Provides deep cultural insights to optimize business strategy for local preferences and behaviors."
              icon={Users}
            />
            <ModelToggle
              name="businessRecommendation"
              displayName="Business Recommendations"
              description="Analyzes location characteristics and recommends the top 5 most suitable business types."
              icon={Activity}
            />
          </div>
        </CardContent>
      </Card>
      {Object.entries(activeModels)
        .filter(([key]) => key !== "businessRecommendation")
        .filter(([_, isActive]) => isActive).length >= 2 && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-700 flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            <span>
              <strong>Business Recommendations enabled:</strong> Comprehensive
              analysis from multiple models provides better insights.
            </span>
          </p>
        </div>
      )}
      {/* Analyze All Button */}
      <div className="flex justify-center">
        <Button
          onClick={fetchAllActiveModels}
          disabled={
            Object.values(loading).some((l) => l) ||
            Object.values(activeModels).every((a) => !a)
          }
          className={`relative h-14 px-8 text-lg font-semibold transition-all duration-300 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-2xl hover:shadow-3xl transform hover:scale-105`}
        >
          {Object.values(loading).some((l) => l) ||
          Object.values(activeModels).every((a) => !a)
            ? " Get Startted"
            : "Analyze Market..."}
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
          <Card className="w-full border-0 shadow-2xl bg-gradient-to-br from-white to-gray-50/80 backdrop-blur-sm">
            <CardHeader className="border-b border-gray-200/50 bg-gradient-to-r from-blue-50/70 to-purple-50/70">
              <CardTitle className="flex items-center gap-3 text-xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                <Sparkles className="h-6 w-6 text-blue-600" />
                Analysis Results
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs
                defaultValue={Object.keys(data).find((key) => data[key]) || ""}
                className="w-full px-6"
              >
                {/* Tab buttons */}
                <TabsList className="flex h-full  w-full flex-wrap justify-start gap-6  bg-gradient-to-r from-gray-100 to-gray-200/80  rounded-2xl shadow-inner ">
                  {Object.entries(data).map(
                    ([modelName, modelData]) =>
                      modelData && (
                        <TabsTrigger
                          key={modelName}
                          value={modelName}
                          className="rounded-xl p-5  text-sm font-semibold transition-all duration-300
                         data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 
                         data-[state=active]:text-white 
                         data-[state=active]:shadow-lg
                         data-[state=active]:scale-105
                         data-[state=inactive]:bg-white 
                         data-[state=inactive]:text-gray-700 
                         data-[state=inactive]:shadow-md
                         data-[state=inactive]:border
                         data-[state=inactive]:border-gray-200
                         hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50
                         hover:text-blue-700
                         hover:shadow-lg
                         hover:scale-90"
                        >
                          <div className="flex items-center gap-2">
                            {modelName === "marketOpportunityScore" && (
                              <Target className="h-4 w-4" />
                            )}
                            {modelName === "retailMarketIntelligence" && (
                              <Building2 className="h-4 w-4" />
                            )}
                            {modelName === "culturalIntelligence" && (
                              <Globe className="h-4 w-4" />
                            )}
                            {modelName === "businessRecommendation" && (
                              <Lightbulb className="h-4 w-4" />
                            )}
                            {modelName.replace(/([A-Z])/g, " $1").trim()}
                          </div>
                        </TabsTrigger>
                      )
                  )}
                </TabsList>

                {/* Tab content */}
                <div className="mt-6">
                  {Object.entries(data).map(
                    ([modelName, modelData]) =>
                      modelData && (
                        <TabsContent
                          key={modelName}
                          value={modelName}
                          className="rounded-2xl border-0 bg-gradient-to-br from-white to-gray-50/50 p-6 shadow-lg animate-fade-in"
                        >
                          {/* Loading State */}
                          {loading[modelName] && (
                            <div className="flex items-center justify-center py-12">
                              <div className="text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                <p className="text-gray-600 font-medium">
                                  Loading{" "}
                                  {modelName.replace(/([A-Z])/g, " $1").trim()}
                                  ...
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Error State */}
                          {error && (
                            <Card className="border-red-200 bg-red-50/80 mb-6">
                              <CardContent className="p-4 flex items-center gap-3">
                                <AlertCircle className="h-5 w-5 text-red-600" />
                                <div>
                                  <p className="text-red-800 font-medium">
                                    Analysis Error
                                  </p>
                                  <p className="text-red-600 text-sm">
                                    {error}
                                  </p>
                                </div>
                              </CardContent>
                            </Card>
                          )}

                          {/* Success Content */}
                          {!loading[modelName] && !error && (
                            <div className="space-y-6">
                              {/* Model-specific content */}
                              {modelName === "marketOpportunityScore" && (
                                <MarketOpportunityScore data={modelData} />
                              )}

                              {modelName === "retailMarketIntelligence" && (
                                <RetailMarketIntelligence
                                  data={modelData}
                                  lat={lat}
                                  lon={lon}
                                  loading={loading[modelName]}
                                />
                              )}

                              {modelName === "culturalIntelligence" && (
                                <CulturalIntelligence
                                  data={modelData}
                                  loading={loading[modelName]}
                                />
                              )}

                              {modelName === "businessRecommendation" && (
                                <BusinessRecommendation
                                  data={modelData}
                                  loading={loading[modelName]}
                                />
                              )}

                              {/* Footer with timestamp */}
                              <div className="pt-6 border-t border-gray-200/50">
                                <p className="text-sm text-gray-500 text-center">
                                  Analysis generated on{" "}
                                  {new Date().toLocaleDateString()} at{" "}
                                  {new Date().toLocaleTimeString()}
                                </p>
                              </div>
                            </div>
                          )}
                        </TabsContent>
                      )
                  )}
                </div>
              </Tabs>

              <ReportActions data={data} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CommonParameterControl;
