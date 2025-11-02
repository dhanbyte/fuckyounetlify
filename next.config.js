/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    loader: 'custom',
    loaderFile: './imageLoader.js',
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
        pathname: '/b5qewhvhb/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'shopwave.b-cdn.net',
      },
    ],
  },
  env: {
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/fallback',
    MONGODB_DB_NAME: process.env.MONGODB_DB_NAME || 'fallback-db',
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 'pk_test_dummy_key_for_build',
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || 'sk_test_dummy_secret_for_build',
    NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || 'public_dummy_key',
    IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY || 'private_dummy_key',
    NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/dummy',
    RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET || 'dummy_razorpay_secret',
    NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_dummy_key'
  }
}

module.exports = nextConfig