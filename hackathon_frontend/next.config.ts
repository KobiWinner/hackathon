// import bundleAnalyzer from "@next/bundle-analyzer";

import type { NextConfig } from "next";

// const withBundleAnalyzer = bundleAnalyzer({
//   enabled: process.env.ANALYZE === "true",
// });

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  output: "standalone",
};

export default nextConfig;
// export default withBundleAnalyzer(nextConfig);
