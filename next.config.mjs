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
    NEXT_PUBLIC_APP_TITLE: process.env.NEXT_PUBLIC_APP_TITLE || '柴郡 の 小窝',
    NEXT_PUBLIC_APP_ICON: process.env.NEXT_PUBLIC_APP_ICON || 'https://jsd.chatbtc.cn.eu.org/gh/manji1143/picx-images-hosting@master/paste/picx-1B9BFE309BB818923ADAE3C76350B23E-removebg-preview.3rbhhkvfr3.avif',
    NEXT_PUBLIC_APP_LINK: process.env.NEXT_PUBLIC_APP_LINK || 'https://mao.1143520.xyz/',
    NEXT_PUBLIC_GITHUB_REPO: process.env.NEXT_PUBLIC_GITHUB_REPO || '1143520/chaijun',
    NEXT_PUBLIC_GITHUB_BRANCH: process.env.NEXT_PUBLIC_GITHUB_BRANCH || 'main',
    NEXT_PUBLIC_IMAGE_PATH: process.env.NEXT_PUBLIC_IMAGE_PATH || 'mao'
  }
}

export default nextConfig
