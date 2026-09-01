import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "pub-10241731b8cc4bdba7d941736ac1bb56.r2.dev",
      },
    ],
  },
};

export default nextConfig;
