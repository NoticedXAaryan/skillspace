import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: process.env.BUILD_STANDALONE === 'true' ? 'standalone' : undefined,
  transpilePackages: ['@skillspace/schema', '@skillspace/runtime'],
  outputFileTracingRoot: require('path').join(__dirname),
};

export default nextConfig;
