import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  devIndicators: false,
  env: {
    NEXT_DASHBOARD_ENABLED: process.env.NEXT_DASHBOARD_ENABLED ?? "true",
  },
};

export default nextConfig;
