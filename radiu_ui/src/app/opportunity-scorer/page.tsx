"use client";

import CommonHeader from "@/components/common-header";
import MarketOpportunityScore from "@/components/market-opportunity-scorer";
export default function MarketOpportunityScorePage() {  

  return (
     <CommonHeader
        data={{
          headerTitle: " Market Opportunity Scorer",
          headerTitleSubtext: "Opportunity Scorer Engine",
          headerDescription:
            "Analyze retail market opportunities with comprehensive location-based intelligence",
          modelComponent: <MarketOpportunityScore />,
        }}
      />
  );
}
