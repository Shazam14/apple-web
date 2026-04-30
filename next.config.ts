import type { NextConfig } from "next";

const APPLE_API_INTERNAL = process.env.APPLE_API_INTERNAL || "http://localhost:8002";
const KEDCO_API_INTERNAL = process.env.KEDCO_API_INTERNAL || "http://localhost:8000";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/v1/lending/:path*",
        destination: `${APPLE_API_INTERNAL}/api/v1/lending/:path*`,
      },
      {
        source: "/api/v1/auth/:path*",
        destination: `${KEDCO_API_INTERNAL}/api/v1/auth/:path*`,
      },
    ];
  },
};

export default nextConfig;
