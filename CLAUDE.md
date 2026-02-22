# CLAUDE.md — Rumi Project Context

## Context Window Management

**IMPORTANT**: When you detect that the context window is getting large (long conversation, many file reads, complex multi-step work), proactively tell the user:

> "We're approaching the context window limit. To preserve continuity, I recommend we save a context file now. Would you like me to create a summary at `docs/context-snapshots/YYYY-MM-DD-<topic>.md` so we can pick up seamlessly in a new conversation?"

When saving context, include:
1. **What was accomplished** — completed tasks with file paths
2. **What's in progress** — partially completed work and current state
3. **What's next** — planned tasks and known blockers
4. **Key decisions made** — architecture choices, trade-offs, patterns established
5. **Known issues** — bugs, failing tests, workarounds in place
6. **File inventory** — list of files created/modified in the session

When resuming from a context file, read it first and orient yourself before proceeding.

---

## What is Rumi?

Rumi is a SaaS platform targeting the **Colombian market** that connects landlords with tenants and matches roommates (Tinder-style swipe interface). The entire UI is in **Spanish**.

## Monorepo Structure

```
rumi/
├── packages/
│   ├── shared/    @rumi/shared  — Types, Zod schemas, constants, utils
│   ├── db/        @rumi/db      — Prisma schema, migrations, seed, client
│   ├── api/       @rumi/api     — Fastify REST API (local dev + Lambda)
│   ├── web/       @rumi/web     — React SPA (Vite + Tailwind v4)
│   └── infra/     @rumi/infra   — AWS CDK stacks
├── package.json                  — npm workspaces root
├── tsconfig.base.json            — Shared TS config
├── eslint.config.mjs             — ESLint 9 flat config
├── ARCHITECTURE.md               — Full architecture doc with schema details
├── CLAUDE.md                     — This file (project context for Claude)
├── docs/context-snapshots/       — Conversation continuity snapshots
└── .env                          — Local environment variables
```

## Tech Stack

| Layer | Technology |
|---|---|
| Monorepo | npm workspaces |
| Language | TypeScript (strict mode) |
| Frontend | React 19 + Vite 6 + Tailwind CSS v4 |
| Backend | Fastify 5 + Zod type provider |
| Database | PostgreSQL via Prisma ORM 6 |
| Auth (local) | bcryptjs + jsonwebtoken (local JWTs) |
| Auth (cloud) | AWS Cognito (dev/prod stages) |
| IaC | AWS CDK (TypeScript) |
| Hosting | S3 + CloudFront (frontend), Lambda + HTTP API Gateway v2 (backend) |
| Client State | Zustand 5 |
| Server State | TanStack Query 5 |
| Validation | Zod (shared between frontend & backend) |
| Swipe UI | Framer Motion |
| Forms | react-hook-form + @hookform/resolvers |
| Testing | Jest |

## Development Commands

```bash
# Install dependencies
npm install

# Run both API + Web dev servers concurrently (single terminal)
npm run dev

# Run individually
npm run dev:api          # Fastify on http://localhost:3000 (tsx watch, auto-restarts on file changes)
npm run dev:web          # Vite on http://localhost:5173

# Database
npm run db:generate      # Generate Prisma client
npm run db:migrate       # Run migrations
npm run db:seed          # Seed test data

# Quality
npm run lint             # ESLint
npm run lint:fix         # ESLint with auto-fix
npm run format           # Prettier
npm run typecheck        # TypeScript type checking
npm test                 # Jest tests

# Build
npm run build            # Build all packages
npm run build:web        # Build frontend only
npm run build:api        # Build API for Lambda
```

## Three-Stage Auth System

The app uses a `STAGE` environment variable to determine auth behavior:

| Stage | Auth Provider | Description |
|---|---|---|
| `localdev` | Local JWT + bcrypt | No AWS required. Real register/login/logout flow |
| `dev` | AWS Cognito | Development deployment with Cognito |
| `prod` | AWS Cognito | Production deployment |

### Local Dev Auth Flow
- `POST /api/v1/auth/register` — Creates user with bcrypt-hashed password, returns JWT
- `POST /api/v1/auth/login` — Validates credentials, returns JWT
- JWT payload `{ sub, email }` matches Cognito shape, so all routes work identically
- Local users get `cognitoSub: "local-<uuid>"` to distinguish from Cognito users
- Auth routes return 404 in non-localdev stages (defense in depth)
- Tokens persist in localStorage; `initFromStorage()` restores auth on page reload

### Test Users (localdev, after seeding)
| Email | Password | Role |
|---|---|---|
| julian@test.com | password123 | Tenant seeker |
| maria@test.com | password123 | Property owner |
| carlos@test.com | password123 | Roommate seeker |
| ana@test.com | password123 | Roommate seeker |

## Database

- **Engine**: PostgreSQL (local for dev, AWS RDS for cloud)
- **ORM**: Prisma 6
- **Models** (15 total): User, Property, PropertyImage, PropertyView, RoommateProfile, Swipe, Match, Conversation, Message, Application, Appointment, AvailabilitySlot, Document, Lease, Rating
- **Conventions**: All tables use `@@map` for snake_case in PostgreSQL, camelCase in TypeScript
- **Password**: Nullable `password` field on User model (only populated in localdev)
- **Important**: All Prisma user queries must use `omit: { password: true }` to prevent password hash leaking

### Key Schema Design
- `User.seekingMode` enum (NONE | TENANT | ROOMMATE) — mutual exclusivity
- `Swipe` with `@@unique([senderId, receiverId])` — prevents duplicate swipes
- `Rating` with `@@unique([raterId, ratedUserId, context])` — multi-context scoring (LANDLORD, TENANT, ROOMMATE)
- `PropertyView` tracks seen properties for "Ya visto" badge
- `RoommateProfile.lifestyle` is JSON for flexible evolving criteria

### Post-Approval Workflow Models
After an Application is ACCEPTED, the workflow progresses through related records (the `ApplicationStatus` enum is **NOT** modified):

- `Appointment` — 1:1 with Application. Status: SCHEDULING → CONFIRMED → COMPLETED | CANCELLED
- `AvailabilitySlot` — N:1 with Appointment. Both parties propose time windows; system computes overlaps (≥30 min)
- `Document` — N:1 with Application. Types: CC, WORK_CERT, OTHER. Status: PENDING → APPROVED | REJECTED
- `Lease` — 1:1 with Application. Status: ACTIVE → ENDED | CANCELLED. Stores dates + monthly rent

**Current workflow stage is inferred**, not stored. See `getApplicationWorkflow()` in `applications.service.ts`.

### Storage Abstraction
- `packages/api/src/lib/storage.ts` — `StorageProvider` interface with S3 and local filesystem implementations
- Local uploads plugin only active when `STAGE=localdev` — stores files in `uploads/` directory
- **IMPORTANT**: Prisma does NOT allow mixing `select` and `include` at the same query level. Use `include: true` when you need both relation data and all scalar fields.

## API Routes

All routes prefixed with `/api/v1`. Auth required unless noted.

- `GET /health` — No auth
- `POST /auth/register` — No auth, localdev only
- `POST /auth/login` — No auth, localdev only
- `POST /auth/sync` — Sync Cognito user to DB
- `GET|PUT /users/me` — Profile CRUD
- `PUT /users/me/seeking-mode` — Toggle seeking mode
- `GET /users/:id/ratings` — User ratings breakdown
- `GET|POST|GET:id|PUT|DELETE /properties` — Property CRUD + search
- `POST /properties/:id/view` — Record property view
- `GET /properties/viewed` — Properties already viewed
- `GET|PUT /roommates/profile` — Roommate profile
- `GET /roommates/candidates` — Swipe candidates
- `POST /roommates/swipe` — Record like/pass
- `GET|DELETE /matches` — List/unmatch
- `GET /messages/conversations` — List conversations
- `GET|POST /messages/conversations/:id` — Read/send messages
- `POST /applications` — Apply to property
- `GET /applications/sent|received` — View applications
- `PUT /applications/:id/status` — Accept/reject
- `GET /applications/:id/workflow` — Full workflow state (stage, appointment, documents, lease)
- `POST /appointments` — Create appointment for accepted application
- `GET /appointments/by-application/:applicationId` — Get appointment
- `POST /appointments/:id/slots` — Add availability slots
- `DELETE /appointments/:id/slots/:slotId` — Delete own slot
- `GET /appointments/:id/matches` — Compute overlapping windows
- `PUT /appointments/:id/confirm` — Confirm time slot
- `PUT /appointments/:id/complete` — Mark visit completed (landlord)
- `PUT /appointments/:id/cancel` — Cancel appointment
- `POST /documents/upload-url` — Get presigned upload URL
- `POST /documents` — Create document record
- `GET /documents/by-application/:applicationId` — List documents
- `PUT /documents/:id/approve` — Approve document (landlord)
- `PUT /documents/:id/reject` — Reject with note (landlord)
- `DELETE /documents/:id` — Delete own pending document
- `POST /leases` — Create lease (requires CC + WORK_CERT approved)
- `GET /leases` — My leases (as tenant or landlord)
- `GET /leases/:id` — Lease detail
- `PUT /leases/:id/end` — End active lease (landlord)
- `POST /ratings` — Rate a user
- `GET /ratings/given|received` — My ratings

## Frontend Architecture

- **Routing**: React Router v7 with AuthLayout (login/register) and MainLayout (authenticated)
- **State**: Zustand for auth (with localStorage persistence), TanStack Query for server data
- **API Client**: Axios instance at `src/services/api-client.ts` with auth token interceptor
- **i18n**: Simple Spanish translation object at `src/i18n/es.ts` (no i18n library)
- **Brand Colors**: Tailwind v4 CSS-first `@theme` config in `src/index.css`
  - Primary: `#C06E9E` (mauve/pink)
  - Accent: `#5B3A6B` (deep purple)
  - Background: `#FDF8FB` (warm off-white)
  - Text: `#2D1B36` (dark purple-tinted)
- **Logo**: SVG at `public/logo.svg`, favicon at `public/favicon.svg`, React component at `src/components/ui/RumiLogo.tsx`
  - Logo design: mauve "rumi" text with a deep purple house integrated into the "r" letterform, deep purple dot on the "i"
- **Workflow Components** (`src/components/workflow/`):
  - `WorkflowStepper` — horizontal 5-step progress indicator
  - `AvailabilityScheduler` — slot management with match detection
  - `AppointmentCard` — confirmed/completed visit card
  - `DocumentUpload` — 3 upload zones (CC, Work Cert, Other) with approve/reject
  - `LeaseForm` — contract creation form (dates + rent)
  - `LeaseCard` — active/ended lease display
- **Pages**: Home, Login, Register, Profile, PropertyList, PropertyDetail, PropertyCreate, RoommateSwipe, Matches, Messages, Applications, ApplicationWorkflow, Leases, NotFound

## Coding Conventions

- **Language**: TypeScript strict mode everywhere
- **UI text**: All user-facing strings in Spanish
- **Naming**: camelCase in TypeScript, snake_case in PostgreSQL (Prisma `@map`)
- **Validation**: Zod schemas in `@rumi/shared`, shared between frontend and backend
- **API patterns**: Fastify route → handler → service → Prisma
- **Imports**: Direct imports (no barrel files except `@rumi/shared/src/index.ts`)
- **Error handling**: Fastify error handler plugin + API client 401 interceptor for token expiry
- **Env vars**: `.env` at monorepo root, loaded by dotenv in API server.ts, by Vite for web (prefix `VITE_`)

## AWS Infrastructure (CDK)

6 stacks in `packages/infra`:

| Stack | Resources |
|---|---|
| VPC | VPC, 2 AZs, public + isolated subnets |
| Auth | Cognito User Pool + Web Client |
| Database | RDS PostgreSQL 16, db.t4g.micro |
| Storage | S3 bucket for property images |
| API | Lambda + HTTP API Gateway v2 |
| Frontend | S3 + CloudFront + OAC |

Estimated monthly cost: ~$15-21 for MVP.

## Common Tasks

### Adding a new API route
1. Create route folder in `packages/api/src/routes/<name>/`
2. Add `index.ts` (route registration), `<name>.handler.ts`, `<name>.service.ts`
3. Register in `packages/api/src/routes/index.ts`
4. Add Zod schemas in `packages/shared/src/schemas/`

### Adding a new page
1. Create page component in `packages/web/src/pages/`
2. Add route in `packages/web/src/App.tsx`
3. Use shared Zod schemas for form validation

### Database changes
1. Edit `packages/db/prisma/schema.prisma`
2. Run `npm run db:migrate` (creates migration)
3. Run `npm run db:generate` (regenerates client)
4. Update seed file if needed: `packages/db/prisma/seed.ts`

## Project Status

### Completed
- Full monorepo scaffold (all 5 packages)
- Prisma schema with 15 models + migrations + seed data
- Fastify API with all MVP route structures (handlers + services)
- React SPA with all pages, layouts, routing, stores
- Three-stage auth system (localdev works fully without AWS)
- AWS CDK infrastructure (6 stacks)
- CI pipeline (GitHub Actions)
- Brand logo + favicon integrated
- Frontend wired to real API calls (properties, applications, roommates, matches, messages, ratings)
- Property image upload (S3 presigned URLs + local dev storage)
- Real-time messaging via WebSocket (`@fastify/websocket`)
- Post-approval workflow: Appointments (scheduling + slot matching), Documents (upload + review), Leases (creation + management)
- Storage abstraction (S3 for dev/prod, local filesystem for localdev)
- Workflow UI with stepper, availability scheduler, document upload, lease forms

### Next Steps
- Deploy to AWS (CDK deploy)
- Add comprehensive tests
- Push notifications for workflow events
- Email notifications
