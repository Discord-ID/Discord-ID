import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      "s1.imgcdn.dev"
      "s2.imgcdn.dev"
      "s3.imgcdn.dev"
      "s4.imgcdn.dev"
      "s5.imgcdn.dev"
      "s6.imgcdn.dev",
      "imgcdn.dev"
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.discordapp.com",
      },
    ],
  },
};

export default nextConfig;
