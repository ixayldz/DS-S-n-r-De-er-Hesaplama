import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // CORS uyarısını gidermek için allowed origins
  allowedDevOrigins: [
    "192.168.1.198",
    "localhost:3000",
    "127.0.0.1:3000",
  ],
};

export default nextConfig;
