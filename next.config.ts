import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['framer-motion'],
  },
  serverExternalPackages: ['pdf-parse', 'mammoth'],
}

export default nextConfig
