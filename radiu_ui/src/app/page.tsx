"use client";

import { RetailMarketIntelligence } from "@/components/retail-market-intelligence";
import CommonHeader from "@/components/common-header";

export default function Home() {
  return (
      <CommonHeader
        data={{
          headerTitle: "Retail Market Intelligence Model",
          headerTitleSubtext: "Market Intelligence Dashboard",
          headerDescription:
            "Analyze retail market opportunities with comprehensive location-based intelligence",
          modelComponent: <RetailMarketIntelligence />,
        }}
      />
  );
}
