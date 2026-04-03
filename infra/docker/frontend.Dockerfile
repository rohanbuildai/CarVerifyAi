FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/config/package.json ./packages/config/
COPY apps/frontend/package.json ./apps/frontend/
RUN npm install --workspace=@carverify/frontend

COPY packages/shared/ ./packages/shared/
COPY packages/config/ ./packages/config/
COPY apps/frontend/ ./apps/frontend/

FROM base AS builder
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build -w apps/frontend

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

COPY --from=builder /app/apps/frontend/.next/standalone ./
COPY --from=builder /app/apps/frontend/.next/static ./apps/frontend/.next/static
COPY --from=builder /app/apps/frontend/public ./apps/frontend/public

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:3000 || exit 1

CMD ["node", "apps/frontend/server.js"]
