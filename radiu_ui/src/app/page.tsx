"use client";

import { RetailMarketIntelligence } from "@/components/retail-market-intelligence";
import CommonHeader from "@/components/common-header";
import CommonParameterControl from "@/components/common-parameter-control";

export default function Home() {
  return (
    <div style={{ width: "-webkit-fill-available" }}>
      <CommonHeader
        data={{
          headerTitle: "Home - Radiu AI",
          headerTitleSubtext: "Complete AI Model Ecosystem",
          headerDescription:
            "Analyze real  market opportunities with comprehensive location-based intelligence",
          modelComponent: <CommonParameterControl />,
        }}
      />
    </div>
  );
}
