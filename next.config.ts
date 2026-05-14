import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "media.api-sports.io", pathname: "/**" },
      { protocol: "https", hostname: "v3.football.api-sports.io", pathname: "/**" },
    ],
  },
};

export default nextConfig;
