FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/registry/package.json ./apps/registry/
COPY packages/schema/package.json ./packages/schema/
RUN corepack enable pnpm && pnpm install --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN corepack enable pnpm
RUN cd apps/registry && pnpm prisma generate
RUN pnpm --filter @skillspace/registry build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app
ENV NODE_ENV production

# You only need to copy next.config.js if you are NOT using the default configuration
COPY --from=builder /app/apps/registry/next.config.ts ./apps/registry/
COPY --from=builder /app/apps/registry/public ./apps/registry/public
COPY --from=builder /app/apps/registry/.next/standalone ./
COPY --from=builder /app/apps/registry/.next/static ./apps/registry/.next/static

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "apps/registry/server.js"]
