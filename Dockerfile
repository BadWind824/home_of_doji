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
ARG APP_TITLE
ARG APP_ICON
ARG APP_LINK
ARG GITHUB_REPO
ARG GITHUB_BRANCH
ARG IMAGE_PATH

ENV NEXT_TELEMETRY_DISABLED 1
ENV APP_TITLE=${APP_TITLE}
ENV APP_ICON=${APP_ICON}
ENV APP_LINK=${APP_LINK}
ENV GITHUB_REPO=${GITHUB_REPO}
ENV GITHUB_BRANCH=${GITHUB_BRANCH}
ENV IMAGE_PATH=${IMAGE_PATH}

RUN npm install -g pnpm
RUN pnpm build

# 生产环境
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# 运行时环境变量
ENV APP_TITLE=${APP_TITLE}
ENV APP_ICON=${APP_ICON}
ENV APP_LINK=${APP_LINK}
ENV GITHUB_REPO=${GITHUB_REPO}
ENV GITHUB_BRANCH=${GITHUB_BRANCH}
ENV IMAGE_PATH=${IMAGE_PATH}

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