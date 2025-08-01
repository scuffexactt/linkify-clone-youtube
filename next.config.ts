import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "robust-parakeet-829.convex.cloud", // <- match actual hostname in image src
      },
    ],
  },
};

export default nextConfig;
