FROM node:20-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./
COPY packages/shared/package.json ./packages/shared/
COPY packages/config/package.json ./packages/config/
COPY packages/db/package.json ./packages/db/
COPY packages/observability/package.json ./packages/observability/
COPY packages/security/package.json ./packages/security/
COPY packages/ai/package.json ./packages/ai/
COPY packages/payments/package.json ./packages/payments/
COPY packages/vehicle-providers/package.json ./packages/vehicle-providers/
COPY apps/backend/package.json ./apps/backend/
RUN npm install --omit=dev --workspace=@carverify/backend

COPY packages/ ./packages/
COPY apps/backend/ ./apps/backend/

# Generate Prisma client
RUN npx prisma generate --schema=./packages/db/prisma/schema.prisma

EXPOSE 4000
USER node

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget -qO- http://localhost:4000/api/v1/health || exit 1

CMD ["node", "apps/backend/src/server.js"]
