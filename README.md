# Frontend gif image gallery

_Automatically synced with your [v0.dev](https://v0.dev) deployments_

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/aliya1143/v0-frontend-gif-image-gallery)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.dev-black?style=for-the-badge)](https://v0.dev/chat/projects/DK2soljIQdh)

## Overview

This repository will stay in sync with your deployed chats on [v0.dev](https://v0.dev).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.dev](https://v0.dev).

## Deployment

Your project is live at:

**[https://vercel.com/aliya1143/v0-frontend-gif-image-gallery](https://vercel.com/aliya1143/v0-frontend-gif-image-gallery)**

## Build your app

Continue building your app on:

**[https://v0.dev/chat/projects/DK2soljIQdh](https://v0.dev/chat/projects/DK2soljIQdh)**

## How It Works

1. Create and modify your project using [v0.dev](https://v0.dev)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

# Home of Doji

一个基于 Next.js 的图片展示应用，自动从 GitHub 仓库同步图片。

## 环境变量

应用支持以下环境变量配置：要修改图片网站信息，直接fork修改app\layout.tsx和app\layout.tsx


## Docker 部署

### 使用预构建镜像

```bash
docker pull ghcr.io/[你的GitHub用户名]/home_of_doji:main

docker run -d -p 1143:1143 ghcr.io/1143520/home_of_doji:main
```

### 本地构建

1. 克隆仓库

```bash
git clone https://github.com/[你的GitHub用户名]/home_of_doji.git
cd home_of_doji
```

2. 构建 Docker 镜像

```bash
docker build -t home_of_doji .
```

3. 运行容器

```bash
docker run -d -p 1143:1143 ghcr.io/1143520/home_of_doji:main
```

## 开发

```bash
# 安装依赖
pnpm install

# 开发环境运行
pnpm dev

# 构建
pnpm build

# 生产环境运行
pnpm start
```

## GitHub Actions

本项目配置了 GitHub Actions 自动构建流程：

1. 当推送到 main 分支时自动触发构建
2. 构建 Docker 镜像并推送到 GitHub Container Registry
3. 使用环境变量配置应用标题和图片路径

## 技术栈

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- Docker
