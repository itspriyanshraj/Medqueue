import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const configuredBackendUrl = process.env.API_BACKEND_URL;
    const backendUrl = (configuredBackendUrl ||
      (process.env.NODE_ENV === "development" ? "http://localhost:5000" : ""))
      .replace(/\/+$/, "");

    if (!backendUrl) return [];

    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
