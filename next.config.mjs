/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  output: process.env.BUILD_MODE === 'docker' ? 'standalone' : 'export',
  env: {
    APP_TITLE: process.env.APP_TITLE || 'Home of Doji',
    IMAGE_PATH: process.env.IMAGE_PATH || 'https://raw.githubusercontent.com/1143520/chaijun/main/mao'
  }
}

export default nextConfig
