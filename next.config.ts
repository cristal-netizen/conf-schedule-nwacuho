import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/2027",
        destination: "/2027-preview/index.html",
      },
    ];
  },
};

export default nextConfig;
