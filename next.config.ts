import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [{ source: "/demo", destination: "/v/ember-date-kitchen", permanent: false }];
  },
};

export default nextConfig;
