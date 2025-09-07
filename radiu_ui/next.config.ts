import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)", // apply to all routes
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "unsafe-none", // allow window.postMessage
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "unsafe-none", // avoid blocking Google identity iframe
          },
        ],
      },
    ]
  },
}

export default nextConfig;
