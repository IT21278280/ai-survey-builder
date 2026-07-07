import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // allow user profile photos served from Google
    domains: ["lh3.googleusercontent.com"],
  },
};

export default nextConfig;
