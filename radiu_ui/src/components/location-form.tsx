"use client";

import { useState } from "react";

type Props = {
  onSearch: (params: {
    latitude: number;
    longitude: number;
    radius_km: number;
    business_type: string;
  }) => void;
};

export default function LocationForm({ onSearch }: Props) {

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      latitude,
      longitude,
      radius_km: radius,
      business_type: businessType,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-lg shadow bg-white space-y-4">
      <h2 className="text-lg font-bold">🔍 Search Market Opportunity</h2>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Latitude</label>
          <input
            type="number"
            value={latitude}
            onChange={(e) => setLatitude(parseFloat(e.target.value))}
            className="w-full border rounded p-2"
            step="0.0001"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Longitude</label>
          <input
            type="number"
            value={longitude}
            onChange={(e) => setLongitude(parseFloat(e.target.value))}
            className="w-full border rounded p-2"
            step="0.0001"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium">Radius (km)</label>
        <input
          type="number"
          value={radius}
          onChange={(e) => setRadius(parseInt(e.target.value))}
          className="w-full border rounded p-2"
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Business Type</label>
        <input
          type="text"
          value={businessType}
          onChange={(e) => setBusinessType(e.target.value)}
          className="w-full border rounded p-2"
        />
      </div>

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Get Market Opportunity Score
      </button>
    </form>
  );
}
