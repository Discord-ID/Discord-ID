import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // {
      //   protocol: "https",
      //   hostname: "cdn.discordapp.com",
      // },

      // *ah sudahlah, allow saja semuanya
      {
        protocol: "https",
        hostname: "**",
      }
    ],
  },
};

export default nextConfig;
