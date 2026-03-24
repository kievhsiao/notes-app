import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { hostname: "64.media.tumblr.com" },
      { hostname: "pbs.twimg.com" },
      { hostname: "localhost" },
      { hostname: "127.0.0.1" }
    ],
  },
};

export default nextConfig;
