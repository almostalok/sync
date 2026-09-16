# SiteSync — Local Setup & Development Guide

## 1. Prerequisites
- Node.js >= 18.0 (Tested on Node 22)
- pnpm >= 9.0 (or npm)
- Docker & Docker Compose (Optional for local PostgreSQL + Redis)
- Python >= 3.10 (Optional for standalone evaluation scripts)

## 2. Quickstart
```bash
# 1. Install dependencies
pnpm install

# 2. Start PostgreSQL + pgvector & Redis containers (optional)
docker compose up -d

# 3. Generate Prisma client
pnpm db:generate

# 4. Run database migrations
pnpm db:migrate

# 5. Seed deterministic baseline
pnpm db:seed

# 6. Run domain unit & boundary tests
pnpm test

# 7. Start application in development mode
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
API Health endpoint: `http://localhost:3000/health`
