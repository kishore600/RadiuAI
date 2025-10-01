"use client";

import CommonHeader from "@/components/common-header";
import CommonParameterControl from "@/components/common-parameter-control";
import { AuthProvider } from "@/components/auth-provider";

export default function Home() {
  return (
    <div style={{ width: "-webkit-fill-available" }}>
      <AuthProvider>
      <CommonHeader
        data={{
          headerTitle: "Home - Radiu AI",
          headerTitleSubtext: "Complete Bisuness Intelligence Eco Ecosystem",
          headerDescription:
            "Analyze real  market opportunities with comprehensive location-based intelligence",
          modelComponent: <CommonParameterControl />,
        }}
      />
      </AuthProvider>
    </div>
  );
}
