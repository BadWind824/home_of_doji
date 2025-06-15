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
  publicRuntimeConfig: {
    APP_TITLE: process.env.APP_TITLE,
    APP_ICON: process.env.APP_ICON,
    APP_LINK: process.env.APP_LINK,
    GITHUB_REPO: process.env.GITHUB_REPO,
    GITHUB_BRANCH: process.env.GITHUB_BRANCH,
    IMAGE_PATH: process.env.IMAGE_PATH
  },
  env: {
    APP_TITLE: process.env.APP_TITLE || '柴郡 の 小窝',
    APP_ICON: process.env.APP_ICON || 'https://jsd.chatbtc.cn.eu.org/gh/manji1143/picx-images-hosting@master/paste/picx-1B9BFE309BB818923ADAE3C76350B23E-removebg-preview.3rbhhkvfr3.avif',
    APP_LINK: process.env.APP_LINK || 'https://mao.1143520.xyz/',
    GITHUB_REPO: process.env.GITHUB_REPO || '1143520/chaijun',
    GITHUB_BRANCH: process.env.GITHUB_BRANCH || 'main',
    IMAGE_PATH: process.env.IMAGE_PATH || 'mao'
  }
}

export default nextConfig
