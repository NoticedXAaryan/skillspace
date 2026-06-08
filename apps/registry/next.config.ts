import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // output: 'standalone', // Disabled due to Windows EPERM symlink errors during local dev
  transpilePackages: ['@skillspace/schema', '@skillspace/runtime'],
};

export default nextConfig;
