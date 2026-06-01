import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true
  }
};

export default withPWA({
  dest: "public",
  fallbacks: {
    document: "/offline"
  },
  disable: process.env.NODE_ENV === "development"
})(nextConfig);
