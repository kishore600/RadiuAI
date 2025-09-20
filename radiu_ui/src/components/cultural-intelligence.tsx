/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface CulturalIntelligenceProps {
  data: any;
  loading?: boolean;
  error?: string;
}

const CulturalIntelligence: React.FC<CulturalIntelligenceProps> = ({
  data,
  loading = false,
  error,
}) => {
  console.log(data)
  if (loading) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-gray-600">Loading cultural intelligence data...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-red-300 bg-red-50">
        <CardContent className="p-4 text-red-700">{error}</CardContent>
      </Card>
    );
  }

  if (!data) {
    return (
      <Card>
        <CardContent className="p-4 text-gray-500">
          No cultural intelligence data available.
        </CardContent>
      </Card>
    );
  }

  return (
<Card className="shadow-sm">
  <CardHeader>
    <CardTitle className="text-lg font-semibold text-blue-700">
      Cultural Intelligence Insights
    </CardTitle>
  </CardHeader>
  <CardContent className="space-y-4">

    {data.menu_recommendations && (
      <div>
        <h3 className="font-semibold text-gray-800">Menu Recommendations:</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          {data.menu_recommendations.map((item: string, i: number) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
    )}

    {data.marketing_ideas && (
      <div>
        <h3 className="font-semibold text-gray-800">Marketing Ideas:</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          {data.marketing_ideas.map((item: string, i: number) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
    )}

    {data.local_festivals_or_events && (
      <div>
        <h3 className="font-semibold text-gray-800">Local Festivals or Events:</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          {data.local_festivals_or_events.map((item: string, i: number) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
    )}

    {data.cultural_tips && (
      <div>
        <h3 className="font-semibold text-gray-800">Cultural Tips:</h3>
        <ul className="list-disc list-inside text-gray-700 space-y-1">
          {data.cultural_tips.map((item: string, i: number) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </div>
    )}

  </CardContent>
</Card>

  );
};

export default CulturalIntelligence;
