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
  output: 'standalone',
  env: {
    APP_TITLE: process.env.APP_TITLE || '柴郡 の 小窝',
    APP_ICON: process.env.APP_ICON || 'https://jsd.chatbtc.cn.eu.org/gh/manji1143/picx-images-hosting@master/paste/picx-1B9BFE309BB818923ADAE3C76350B23E-removebg-preview.3rbhhkvfr3.avif',
    APP_URL: process.env.APP_URL || 'https://mao.1143520.xyz/',
    IMAGE_PATH: process.env.IMAGE_PATH || 'https://raw.githubusercontent.com/1143520/chaijun/main/mao'
  }
}

export default nextConfig
