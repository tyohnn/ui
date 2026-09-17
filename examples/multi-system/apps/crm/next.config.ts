import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // tyohnn:begin transpile
  transpilePackages: ["@acme/ui"],
  // tyohnn:end transpile
  /* config options here */
};

export default nextConfig;
