/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/pulse' : '',
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_GCS_BUCKET: 'policyengine-pulse-data',
    NEXT_PUBLIC_ENV: process.env.NODE_ENV || 'development',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig