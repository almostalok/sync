# SiteSync — Monorepo Architecture Specification

## 1. Monorepo Organization
SiteSync uses a clean pnpm workspace monorepo layout:

```text
sitesync/
│
├── apps/
│   ├── web/           # Next.js 14 App Router UI (Control Room, Gantt, Review Queue, Copilot)
│   ├── api/           # Domain-driven NestJS/Node backend services, controllers & repositories
│   └── ai/            # Python / FastAPI AI matching, embedding & extraction microservice
│
├── packages/
│   ├── config/        # Centralized constants (MATCHING_WEIGHTS, CONFIDENCE_POLICY, RISK_THRESHOLDS)
│   ├── types/         # Shared TypeScript DTOs, interfaces & enums
│   ├── validation/    # Boundary input validation schemas (Project, WBS, Activity, Report)
│   ├── events/        # Event-driven architecture payload contracts
│   └── utils/         # Pure reusable date, text, and ID utilities
│
├── data/
│   ├── synthetic/     # Generated ~1,000 activities, ~5,000 dependencies, field reports
│   ├── fixtures/      # Deterministic CSV & TXT sample project files
│   └── benchmark/     # Train (70%), Validation (15%), Test (15%) evaluation splits
│
├── docs/              # Comprehensive PRD, Domain, Database, Security & Architecture specs
│
├── prisma/            # PostgreSQL + pgvector schema & deterministic seed
└── docker-compose.yml # PostgreSQL + Redis local infrastructure
```

## 2. Architectural Boundaries & Rules
1. **No UI Database Logic:** `apps/web` communicates exclusively with the REST / WebSocket API (`/api/v1`), never importing Prisma directly.
2. **AI Service Boundary:** `apps/ai` produces extraction and similarity metadata but never directly mutates the persistent schedule state.
3. **Domain Isolation:** All project-scoped queries strictly enforce `projectId` filters.
4. **Centralized Configuration:** Constants like `MATCHING_WEIGHTS` (40% Semantic, 15% Discipline, 10% Loc, 10% WBS, 10% Temp, 10% Dep, 5% Entity) reside solely in `@sitesync/config`.
