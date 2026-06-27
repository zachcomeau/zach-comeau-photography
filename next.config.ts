import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/shop", destination: "/prints", permanent: true },
      { source: "/shop/:slug", destination: "/prints/:slug", permanent: true },
      { source: "/galleries", destination: "/gallery", permanent: true },
      { source: "/wildlife", destination: "/gallery", permanent: true },
      { source: "/landscapes", destination: "/gallery", permanent: true },
    ];
  },
};

export default nextConfig;
