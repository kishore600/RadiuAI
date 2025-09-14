"use client";

import { useEffect, useState } from "react";

type ApiResponse = {
  location: {
    name: string;
    latitude: number;
    longitude: number;
    country_code: string;
    business_type: string;
    radius_km: number;
  };
  scores: {
    demographics: number;
    competition: number;
    accessibility: number;
    growth_potential: number;
    cultural_factors: number;
    overall: number;
  };
  rating: string;
  risk_factors: string[];
  opportunities: string[];
  raw_data: Record<string, unknown>;
};

export default function MarketOpportunityScorePage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:5000/analyze/market_opportunity_score")
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p className="p-6">Loading...</p>;
  if (!data) return <p className="p-6 text-red-500">Failed to load data.</p>;

  return (
    <div className="p-6 space-y-6">
      {/* Location Info */}
      <div className="p-4 border rounded-lg shadow bg-white">
        <h2 className="text-xl font-bold mb-2">📍 Location</h2>
        <p><strong>Name:</strong> {data.location.name}</p>
        <p><strong>Business Type:</strong> {data.location.business_type}</p>
        <p><strong>Coordinates:</strong> {data.location.latitude}, {data.location.longitude}</p>
        <p><strong>Country:</strong> {data.location.country_code}</p>
        <p><strong>Radius:</strong> {data.location.radius_km} km</p>
      </div>

      {/* Scores */}
      <div className="p-4 border rounded-lg shadow bg-white">
        <h2 className="text-xl font-bold mb-2">📊 Scores</h2>
        <ul>
          {Object.entries(data.scores).map(([key, value]) => (
            <li key={key} className="capitalize">{key}: <strong>{value.toFixed(2)}</strong></li>
          ))}
        </ul>
        <p className="mt-3 font-semibold text-blue-600">Rating: {data.rating}</p>
      </div>

      {/* Opportunities */}
      <div className="p-4 border rounded-lg shadow bg-white">
        <h2 className="text-xl font-bold mb-2">💡 Opportunities</h2>
        <ul className="list-disc pl-6">
          {data.opportunities.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>

      {/* Risk Factors */}
      {data.risk_factors.length > 0 && (
        <div className="p-4 border rounded-lg shadow bg-white">
          <h2 className="text-xl font-bold mb-2">⚠️ Risk Factors</h2>
          <ul className="list-disc pl-6">
            {data.risk_factors.map((risk, i) => (
              <li key={i}>{risk}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Raw Data */}
      <div className="p-4 border rounded-lg shadow bg-white">
        <h2 className="text-xl font-bold mb-2">📂 Raw Data</h2>
        <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
          {JSON.stringify(data.raw_data, null, 2)}
        </pre>
      </div>
    </div>
  );
}
