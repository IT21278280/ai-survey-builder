import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configure allowed external image hosts used by Next Image
  images: {
    // Prefer remotePatterns to allow specific hosts and paths
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
        pathname: "/:path*",
      },
    ],
  },
};

export default nextConfig;
