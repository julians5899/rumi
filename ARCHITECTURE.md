# Rumi MVP — Monorepo Architecture Plan

## Context
Rumi is a SaaS platform targeting the Colombian market that connects landlords with tenants and matches roommates (Tinder-style). The repo is currently empty (just .gitignore, LICENSE, README). We need to scaffold the entire monorepo from scratch with a working skeleton that compiles, tests, and is ready for AWS deployment.

---

## Tech Stack (Confirmed)
| Layer | Choice |
|---|---|
| Monorepo | npm workspaces |
| Language | TypeScript |
| Frontend | React + Vite + Tailwind CSS v4 |
| Backend | Fastify (Node.js) + REST API |
| Database | PostgreSQL (AWS RDS) via Prisma ORM |
| Auth | AWS Cognito (frontend via aws-amplify) |
| IaC | AWS CDK (TypeScript) |
| Hosting | S3 + CloudFront (frontend), Lambda + HTTP API Gateway (backend) |
| State Mgmt | Zustand (client state) + TanStack Query (server state) |
| Validation | Zod (shared between frontend & backend) |
| Swipe UI | react-tinder-card + Framer Motion |
| Testing | Jest (unit tests) |

---

## Monorepo Structure

```
rumi/
├── .github/workflows/ci.yml
├── packages/
│   ├── shared/          # @rumi/shared — types, Zod schemas, constants, utils
│   ├── db/              # @rumi/db — Prisma schema, migrations, seed, generated client
│   ├── api/             # @rumi/api — Fastify REST API (local dev + Lambda entry)
│   ├── web/             # @rumi/web — React SPA (Vite)
│   └── infra/           # @rumi/infra — AWS CDK stacks
├── package.json         # Root workspace config
├── tsconfig.base.json   # Shared TS config
├── eslint.config.mjs    # ESLint 9 flat config
├── .prettierrc
├── jest.config.base.ts
└── .env.example
```

---

## Brand & Color Palette (from logo)

| Token | Hex | Usage |
|---|---|---|
| `rumi-primary` | `#C06E9E` | Main brand color (mauve/pink from logo text) |
| `rumi-primary-light` | `#D4A0BE` | Hover states, light backgrounds |
| `rumi-primary-dark` | `#A45882` | Active states, dark accents |
| `rumi-accent` | `#5B3A6B` | Deep purple (from logo house & dot) |
| `rumi-accent-light` | `#7B5A8B` | Secondary buttons, highlights |
| `rumi-success` | `#10B981` | Positive actions, match confirmed |
| `rumi-danger` | `#EF4444` | Destructive actions, errors |
| `rumi-warning` | `#F59E0B` | Warnings, pending states |
| `rumi-bg` | `#FDF8FB` | Page background (warm off-white tint) |
| `rumi-text` | `#2D1B36` | Primary text (dark purple-tinted) |

The Rumi logo image is stored at the project root for reference.

---

## Key Architecture Decisions

### Backend: Fastify over Express
- 2-3x faster, built-in TypeScript support, first-class Lambda adapter (`@fastify/aws-lambda`), native Zod integration via `fastify-type-provider-zod`

### ORM: Prisma
- Schema-as-documentation, auto-generated TypeScript types, excellent migration system

### Monolithic Lambda
- Single Lambda running the full Fastify app (via `@fastify/aws-lambda`) — simplest for MVP, avoids cold start multiplication across dozens of functions

### HTTP API Gateway (v2) over REST API (v1)
- 71% cheaper, lower latency, native JWT authorizer for Cognito

### Separate `@rumi/db` package
- Isolates Prisma schema + generated client so both `@rumi/api` and `@rumi/shared` can depend on it cleanly

### Messaging: WebSocket for real-time chat
- `@fastify/websocket` provides real-time messaging via `ws://` upgrade at `/api/v1/messages/ws`
- Authenticated via token query parameter, in-memory connection registry for local dev
- Instant message delivery when both participants are online, with REST fallback for offline scenarios

### i18n: Simple translation object for MVP
- No heavy i18n library; a `t` object with Spanish strings, upgradeable to react-i18next later

---

## AWS Infrastructure (CDK Stacks)

| Stack | Resources | Est. Cost/mo |
|---|---|---|
| VPC | VPC, 2 AZs, public + isolated subnets, no NAT Gateway | $0 |
| Auth | Cognito User Pool + Web Client (email sign-in, PKCE) | $0 (free <50K MAU) |
| Database | RDS PostgreSQL 16, db.t4g.micro, isolated subnet | ~$13-15 |
| Storage | S3 bucket for property images + CORS | ~$1-3 |
| API | Lambda (512MB) + HTTP API Gateway + JWT authorizer | ~$0-1 |
| Frontend | S3 bucket (private) + CloudFront distribution + OAC | ~$0-1 |
| **Total** | | **~$15-21/month** |

---

## Database Schema (Prisma)

**Models:** User, Property, PropertyImage, PropertyView, RoommateProfile, Swipe, Match, Conversation, Message, Application, Appointment, AvailabilitySlot, Document, Lease, Rating

**Key design points:**
- `User.seekingMode` enum (NONE | TENANT | ROOMMATE) — enforces mutual exclusivity at data level
- `User.cognitoSub` links to Cognito identity
- `Swipe` table with `@@unique([senderId, receiverId])` — prevents duplicate swipes
- Separate `Match` table for fast match queries
- `Conversation` uses participant1/participant2 (always 1:1)
- `Property.amenities` as PostgreSQL array
- `RoommateProfile.lifestyle` as JSON (flexible evolving criteria)
- All tables use `@map` for PostgreSQL snake_case conventions

### Property View Tracking
- `PropertyView` table: `{ userId, propertyId, viewedAt }` with `@@unique([userId, propertyId])`
- Tracks which properties a user has already seen
- Enables "Ya visto" badge on listings and filtering to show only unseen properties
- `viewedAt` is updated on revisit (upsert)

### Post-Approval Workflow (Appointment → Documents → Lease)

After an application is ACCEPTED, the workflow progresses through related records. **The `ApplicationStatus` enum is NOT modified** — instead, the current stage is inferred from the existence and status of related records.

**Workflow state machine:**
```
Application ACCEPTED
  → Appointment SCHEDULING (both parties propose availability slots)
  → Appointment CONFIRMED (overlapping window selected, ≥30 min)
  → Appointment COMPLETED (landlord marks visit done)
  → Documents uploaded (tenant uploads CC, Work Certificate)
  → Documents APPROVED (landlord reviews)
  → Lease ACTIVE (landlord creates formal contract)
```

**New enums:**
- `AppointmentStatus`: SCHEDULING | CONFIRMED | COMPLETED | CANCELLED
- `DocumentType`: CC | WORK_CERT | OTHER
- `DocumentStatus`: PENDING | APPROVED | REJECTED
- `LeaseStatus`: ACTIVE | ENDED | CANCELLED

**New models:**
- `Appointment` — 1:1 with Application. Tracks visit scheduling with confirmed time window.
- `AvailabilitySlot` — N:1 with Appointment. Each party proposes time windows; the system computes overlaps.
- `Document` — N:1 with Application. Stores file metadata (key, name, size, MIME type) with approval workflow.
- `Lease` — 1:1 with Application. Formal contract with dates, monthly rent, and status.

**Key relations added to existing models:**
- `User`: `confirmedAppointments[]`, `availabilitySlots[]`, `uploadedDocuments[]`, `tenantLeases[]`
- `Application`: `appointment?`, `documents[]`, `lease?`
- `Property`: `leases[]`

### Storage Abstraction (S3 + Local)

File storage uses a `StorageProvider` interface (`packages/api/src/lib/storage.ts`) with two implementations:
- **S3StorageProvider** (dev/prod): Wraps existing `s3.ts` for presigned upload URLs
- **LocalStorageProvider** (localdev): Stores files in `uploads/` directory, served via `@fastify/static`

The local uploads plugin (`packages/api/src/plugins/local-uploads.ts`) registers a `PUT /api/v1/uploads/*` endpoint and static file serving, only when `STAGE=localdev`.

### Multi-Context Rating System
- `Rating` table: `{ id, raterId, ratedUserId, context (LANDLORD | TENANT | ROOMMATE), score (1-5), comment?, createdAt }`
- Each user accumulates **three independent scores** based on context:
  1. **As Landlord** — rated by tenants
  2. **As Tenant** — rated by landlords
  3. **As Roommate** — rated by roommates
- All three scores carry **equal weight**
- Ratings are **per-user**, not per-property — all tenant ratings about a landlord go into their single landlord score
- Ratings **persist across time** — a roommate rating from years ago still counts
- **Overall score** = average of the three context averages (displayed by default)
- **On hover**: shows breakdown — "Arrendador: 4.8 | Inquilino: 4.5 | Compañero: 4.2"
- Constraint: `@@unique([raterId, ratedUserId, context])` — one rating per rater per context per user

---

## API Routes (REST, prefixed `/api/v1`)

- `GET /health` — health check
- `POST /auth/sync` — sync Cognito user to DB
- `GET|PUT /users/me` — profile CRUD
- `PUT /users/me/seeking-mode` — toggle seeking mode
- `GET /users/:id/ratings` — get user's ratings breakdown (overall + per context)
- `POST|GET|GET:id|PUT|DELETE /properties` — property CRUD + search
- `POST /properties/:id/view` — record property view (upsert)
- `GET /properties/viewed` — list properties already viewed by current user
- `GET|PUT /roommates/profile` — roommate profile
- `GET /roommates/candidates` — swipe candidates batch
- `POST /roommates/swipe` — record like/pass
- `GET|DELETE /matches` — list/unmatch
- `GET /messages/conversations` — list conversations
- `GET|POST /messages/conversations/:id` — read/send messages
- `POST /applications` — apply to property
- `GET /applications/sent|received` — view applications
- `PUT /applications/:id/status` — accept/reject
- `GET /applications/:id/workflow` — full workflow state (stage, appointment, documents, lease)
- `POST /appointments` — create appointment (requires Application ACCEPTED)
- `GET /appointments/by-application/:applicationId` — get appointment for an application
- `POST /appointments/:id/slots` — add availability time slots
- `DELETE /appointments/:id/slots/:slotId` — delete own slot
- `GET /appointments/:id/matches` — compute overlapping time windows (≥30 min)
- `PUT /appointments/:id/confirm` — confirm a matching time slot
- `PUT /appointments/:id/complete` — mark visit completed (landlord only)
- `PUT /appointments/:id/cancel` — cancel appointment
- `POST /documents/upload-url` — get presigned upload URL (S3 or local)
- `POST /documents` — create document record after upload
- `GET /documents/by-application/:applicationId` — list documents for an application
- `PUT /documents/:id/approve` — approve document (landlord only)
- `PUT /documents/:id/reject` — reject document with note (landlord only)
- `DELETE /documents/:id` — delete own pending document
- `POST /leases` — create lease (requires CC + WORK_CERT approved)
- `GET /leases` — list my leases (as tenant or landlord)
- `GET /leases/:id` — get lease detail
- `PUT /leases/:id/end` — end active lease (landlord only)
- `POST /ratings` — rate a user (context: LANDLORD | TENANT | ROOMMATE)
- `GET /ratings/given` — ratings I've given
- `GET /ratings/received` — ratings I've received

---

## Frontend Architecture

- **Routing:** React Router v7
- **Pages:** Home, Login, Register, Profile, PropertyList, PropertyDetail, PropertyCreate, RoommateSwipe, Matches, Messages, Applications, ApplicationWorkflow, Leases, NotFound
- **Swipe UI:** `react-tinder-card` for drag/swipe gestures + like/pass buttons below card + Framer Motion for match notification animation
- **Auth:** aws-amplify v6 for Cognito OAuth/PKCE flow, synced to Zustand store
- **API Client:** Axios wrapper with auth token injection, consumed via TanStack Query hooks
- **Forms:** react-hook-form + @hookform/resolvers (Zod integration with shared schemas)
- **Property Views:** "Ya visto" badge on property cards for already-viewed listings, optional filter to hide seen properties
- **Rating Display:** Overall score shown by default (star + number), hover tooltip reveals per-context breakdown (Arrendador / Inquilino / Compañero)
- **Brand Theme:** Tailwind v4 `@theme` using Rumi color palette (mauve primary `#C06E9E`, deep purple accent `#5B3A6B`)
- **Workflow UI** (`components/workflow/`):
  - `WorkflowStepper` — horizontal 5-step progress indicator (Aceptada → Agendando → Visita → Documentos → Contrato)
  - `AvailabilityScheduler` — slot management with date/time inputs, match detection, and confirmation
  - `AppointmentCard` — confirmed/completed visit details
  - `DocumentUpload` — three upload zones (CC, Work Certificate, Other) with approve/reject workflow
  - `LeaseForm` — contract creation form (dates + monthly rent)
  - `LeaseCard` — active/ended lease display

---

## Implementation Steps

### Step 1 — Monorepo Foundation
- Root `package.json` with workspaces
- `tsconfig.base.json`
- `eslint.config.mjs` + `.prettierrc`
- `jest.config.base.ts`
- Update `.gitignore`
- Create `.env.example`

### Step 2 — `@rumi/shared` Package
- `package.json`, `tsconfig.json`, `jest.config.ts`
- Types: user, property, property-view, roommate, message, application, rating
- Zod schemas: user, property, property-view, roommate, message, application, rating
- Constants: Colombian cities/departments, seeking modes, property types, amenities, rating contexts
- Utils: formatCOP currency helper
- Unit tests for schemas

### Step 3 — `@rumi/db` Package
- `package.json`, `tsconfig.json`
- Full `schema.prisma` with all models (including PropertyView and Rating)
- Seed file with test data
- Re-export PrismaClient from `src/index.ts`

### Step 4 — `@rumi/api` Package
- `package.json`, `tsconfig.json`, `jest.config.ts`
- Fastify app factory (`app.ts`) with Zod type provider
- Local dev entry (`server.ts`) + Lambda entry (`lambda.ts`)
- Plugins: CORS, auth (Cognito JWT via aws-jwt-verify), error handler
- Health check route
- Route structure for all MVP endpoints (handlers + services)
- Prisma client singleton
- esbuild config for Lambda bundling
- Unit tests for health route

### Step 5 — `@rumi/web` Package
- Scaffold with Vite + React + TypeScript
- Tailwind v4 setup with custom theme (Rumi brand colors)
- React Router with all page routes
- Layout components (MainLayout, AuthLayout)
- Zustand stores (auth, UI)
- TanStack Query client setup
- API client service with auth token injection
- Cognito config (aws-amplify)
- Placeholder pages for all routes
- Swipe card components (SwipeCard, SwipeStack)
- Spanish translation object (`i18n/es.ts`)

### Step 6 — `@rumi/infra` Package
- `package.json`, `tsconfig.json`, `cdk.json`
- CDK app entry (`bin/infra.ts`)
- All stacks: VPC, Auth, Database, Storage, API, Frontend

### Step 7 — CI Pipeline
- `.github/workflows/ci.yml` — lint, typecheck, generate Prisma, test, build

---

## Verification
1. `npm install` succeeds at root
2. `npm run build` compiles all packages
3. `npm test` passes all unit tests
4. `npm run dev:api` starts Fastify local server on port 3000
5. `npm run dev:web` starts Vite dev server on port 5173 with API proxy
6. `npm run lint` passes with no errors
7. `npx prisma validate -w @rumi/db` validates the schema
