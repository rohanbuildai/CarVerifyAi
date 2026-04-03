FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/config/package.json ./packages/config/
COPY packages/db/package.json ./packages/db/
COPY packages/observability/package.json ./packages/observability/
COPY packages/ai/package.json ./packages/ai/
COPY packages/vehicle-providers/package.json ./packages/vehicle-providers/
COPY apps/worker/package.json ./apps/worker/
RUN npm install --omit=dev --workspace=@carverify/worker

COPY packages/ ./packages/
COPY apps/worker/ ./apps/worker/

RUN npx prisma generate --schema=./packages/db/prisma/schema.prisma

USER node

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD node -e "process.exit(0)" || exit 1

CMD ["node", "apps/worker/src/index.js"]
