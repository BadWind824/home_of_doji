FROM node:20-alpine AS base

# 安装依赖
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile

# 构建应用
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 设置构建时环境变量
ARG NEXT_PUBLIC_APP_TITLE
ARG NEXT_PUBLIC_APP_ICON
ARG NEXT_PUBLIC_APP_LINK
ARG NEXT_PUBLIC_GITHUB_REPO
ARG NEXT_PUBLIC_GITHUB_BRANCH
ARG NEXT_PUBLIC_IMAGE_PATH

ENV NEXT_TELEMETRY_DISABLED 1
ENV NEXT_PUBLIC_APP_TITLE=${NEXT_PUBLIC_APP_TITLE}
ENV NEXT_PUBLIC_APP_ICON=${NEXT_PUBLIC_APP_ICON}
ENV NEXT_PUBLIC_APP_LINK=${NEXT_PUBLIC_APP_LINK}
ENV NEXT_PUBLIC_GITHUB_REPO=${NEXT_PUBLIC_GITHUB_REPO}
ENV NEXT_PUBLIC_GITHUB_BRANCH=${NEXT_PUBLIC_GITHUB_BRANCH}
ENV NEXT_PUBLIC_IMAGE_PATH=${NEXT_PUBLIC_IMAGE_PATH}

RUN npm install -g pnpm
RUN pnpm build

# 生产环境
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# 运行时环境变量
ENV NEXT_PUBLIC_APP_TITLE=${NEXT_PUBLIC_APP_TITLE}
ENV NEXT_PUBLIC_APP_ICON=${NEXT_PUBLIC_APP_ICON}
ENV NEXT_PUBLIC_APP_LINK=${NEXT_PUBLIC_APP_LINK}
ENV NEXT_PUBLIC_GITHUB_REPO=${NEXT_PUBLIC_GITHUB_REPO}
ENV NEXT_PUBLIC_GITHUB_BRANCH=${NEXT_PUBLIC_GITHUB_BRANCH}
ENV NEXT_PUBLIC_IMAGE_PATH=${NEXT_PUBLIC_IMAGE_PATH}

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 1143

ENV PORT 1143
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"] 