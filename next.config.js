/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/fallback',
    MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || 'fallback-db',
  }
}

module.exports = nextConfig