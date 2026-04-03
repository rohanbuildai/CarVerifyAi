# CarVerify AI

> AI-powered used-car intelligence platform for India.

## Quick Start

### Prerequisites
- Node.js 20+
- npm 10+
- Docker & Docker Compose
- MySQL 8 (or use Docker)
- Redis 7 (or use Docker)

### Setup

```bash
# 1. Clone and install
git clone <repo-url> && cd CarVerifyAi
npm install

# 2. Setup environment
cp .env.example .env
# Edit .env with your credentials

# 3. Start infrastructure (MySQL + Redis)
docker compose up -d mysql redis

# 4. Generate Prisma client & run migrations
npm run db:generate
npm run db:migrate

# 5. Seed database
npm run db:seed

# 6. Start all services
npm run dev
```

### Services
| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Next.js app |
| Backend API | http://localhost:4000 | Express API |
| Worker | (background) | BullMQ job processor |
| Nginx | http://localhost:80 | Reverse proxy |

### Default Credentials
- **Admin**: admin@carverify.ai / admin123456
- **Test User**: test@example.com / test123456

## Architecture

```
apps/frontend  → Next.js 14 (App Router, Tailwind CSS)
apps/backend   → Express.js (REST API)
apps/worker    → BullMQ (background jobs)
packages/*     → Shared domain packages
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start all services in dev mode |
| `npm run dev:frontend` | Start frontend only |
| `npm run dev:backend` | Start backend only |
| `npm run dev:worker` | Start worker only |
| `npm run build` | Build all packages |
| `npm run lint` | Run ESLint |
| `npm run test` | Run all tests |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Open Prisma Studio |
| `npm run docker:up` | Start Docker Compose |

## Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) — Deploy to staging/production
- [SECURITY.md](./SECURITY.md) — Security architecture
- [OPERATIONS.md](./OPERATIONS.md) — Runbooks and operations

## License

Proprietary. All rights reserved.
