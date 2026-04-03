# Deployment Guide

## Local Development
```bash
cp .env.example .env
docker compose up -d mysql redis
npm install
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

## Staging (Docker Compose)
```bash
docker compose -f docker-compose.yml build
docker compose -f docker-compose.yml up -d
```

## Production (Kubernetes)

### Prerequisites
- K8s cluster (EKS/GKE/AKS or self-managed)
- kubectl configured
- Container registry (ECR/GCR/ACR)
- cert-manager for TLS
- MySQL 8 (managed: RDS/Cloud SQL)
- Redis (managed: ElastiCache/Memorystore)

### Steps
```bash
# 1. Build and push images
docker build -f infra/docker/backend.Dockerfile -t registry/carverify/backend:v1 .
docker build -f infra/docker/frontend.Dockerfile -t registry/carverify/frontend:v1 .
docker build -f infra/docker/worker.Dockerfile -t registry/carverify/worker:v1 .
docker push registry/carverify/backend:v1
docker push registry/carverify/frontend:v1
docker push registry/carverify/worker:v1

# 2. Create namespace and secrets
kubectl apply -f k8s/namespace.yaml
kubectl create secret generic carverify-secrets \
  --from-env-file=.env.production -n carverify

# 3. Deploy
kubectl apply -f k8s/

# 4. Run migrations
kubectl exec -it deploy/backend -n carverify -- \
  npx prisma migrate deploy --schema=packages/db/prisma/schema.prisma

# 5. Seed (first time only)
kubectl exec -it deploy/backend -n carverify -- \
  node packages/db/prisma/seed.js
```

### Rollback
```bash
kubectl rollout undo deployment/backend -n carverify
kubectl rollout undo deployment/worker -n carverify
```

### Scaling
```bash
kubectl scale deployment/backend --replicas=4 -n carverify
kubectl scale deployment/worker --replicas=3 -n carverify
```

## Environment Variables
See `.env.example` for all required variables. Critical production vars:
- `DATABASE_URL` — managed MySQL connection string
- `REDIS_URL` — managed Redis connection string
- `SESSION_SECRET` — 64-char random hex (generate with `openssl rand -hex 32`)
- `RAZORPAY_KEY_ID/SECRET` — live Razorpay credentials
- `OPENAI_API_KEY` — production OpenAI key

## Database Backups
- Enable automated daily backups on managed MySQL (RDS: 30-day retention)
- Point-in-time recovery must be enabled
- Test restore quarterly
