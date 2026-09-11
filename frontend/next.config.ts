import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cpa.nadirlabs.net",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "3005",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "3005",
      },
    ],
  },
};

export default nextConfig;
