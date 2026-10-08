---
last_mapped_commit: 11da1ef612b172f9ad8cf487a7ad0a01a2cbae54
last_mapped_at: 2026-10-09
---
<!-- refreshed: 2026-10-09 -->

# Architecture

**Analysis Date:** 2026-10-09

## System Overview

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                            Client Layer                                     │
├───────────────────────┬─────────────────────────────┬───────────────────────┤
│  Customer Web (SSR/CSR)│   Admin Dashboard (CSR)     │  Capacitor Android    │
│  `src/app/`           │   `src/app/admin/`          │  `android/`, PWA      │
│  `src/components/`    │   `src/components/admin/`   │  `capacitor.config.ts`│
└───────────┬───────────┴──────────────┬──────────────┴───────────┬───────────┘
            │                          │                          │
            ▼                          ▼                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                 Edge Routing & Security Middleware                          │
│                 `src/middleware.ts` (jose JWT verify, redirects, CORS)       │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                 Next.js App Router / API Layer                              │
│                 `src/app/api/` (Route Handlers, REST API)                   │
├───────────────────────┬─────────────────────────────┬───────────────────────┤
│  Booking & Calendar   │   Auth & Sessions           │  Chat & AI Engine     │
│  `/api/bookings`      │   `/api/auth/` (NextAuth v5)│  `/api/chat` (OpenAI/ │
│  `/api/services`      │   `/api/admin/auth`         │   DeepSeek / Groq)    │
│  `/api/contracts`     │   `/api/mobile/auth`        │  `src/lib/chatTools.ts│
└───────────┬───────────┴──────────────┬──────────────┴───────────┬───────────┘
            │                          │                          │
            ▼                          ▼                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                 Business Logic & Integration Services                       │
│  `src/lib/sms.ts`, `src/lib/notify.ts`, `src/lib/email.ts` (Pingram)        │
│  `src/lib/wallet.ts`, `src/lib/applePush.ts` (PassKit & APN)                │
│  `src/lib/reviewAI.ts` (Groq), `src/lib/storage.ts` (Webdistt & MinIO)      │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
                                       ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                 Data Persistence & External Services                        │
├───────────────────────┬─────────────────────────────┬───────────────────────┤
│  PostgreSQL (Neon)    │   Object Storage            │  External Providers   │
│  `prisma/schema.prisma│   MinIO S3 / Webdistt       │  Pingram, Apple APN,  │
│  `src/lib/prisma.ts`  │   `src/lib/minioGetBuffer.ts│  Google Places/Wallet │
└───────────────────────┴─────────────────────────────┴───────────────────────┘
```

## Component Responsibilities

| Component | Responsibility | File |
|-----------|----------------|------|
| **Middleware** | Edge routing, domain canonicalization, HTTPS redirects, admin JWT cookie authentication | `src/middleware.ts` |
| **Customer Booking Wizard** | Multi-step interactive booking flow: service selection, date/time pickers, inspo photos, health intake | `src/app/book/page.tsx` |
| **Booking Detail Modal** | Admin booking detail inspector: status updates, time reschedules, price overrides, internal staff notes | `src/components/admin/BookingDetailModal.tsx` |
| **AI Assistant (Chatbot)** | Interactive floating conversational widget for 24/7 service inquiries, FAQ, slot availability, and lead capture | `src/components/Chatbot.tsx` |
| **Chat Tool Engine** | Function-calling execution layer for AI: checks real-time database calendar, fetches services, books pending requests | `src/lib/chatTools.ts` |
| **Review Generator** | Groq LLM integration crafting personalized post-visit review request messages in JoJany's brand voice | `src/lib/reviewAI.ts` |
| **Contract Wizard & Form** | Special events & bridal legal contracts management, form generation, and status tracking | `src/app/admin/contracts/SpecialEventAdminForm.tsx` |
| **Digital Signing Portal** | Customer-facing contract review and digital signature portal with legal disclosures and audit trails | `src/app/sign/[token]/page.tsx` |
| **Loyalty & Digital Pass** | Apple Wallet `.pkpass` and Google Wallet pass generation, pass push updates via APN | `src/lib/wallet.ts`, `src/lib/applePush.ts` |
| **Messaging Dispatcher** | Transactional SMS and email communications with error logging and soft-warning detection | `src/lib/sms.ts`, `src/lib/notify.ts` |

## Pattern Overview

**Overall:** Next.js 16 Full-Stack Monolithic Architecture with modular service libraries and relational data models.

**Key Characteristics:**
- **App Router Architecture:** Modern React Server Components for SEO-critical pages (`/services`, `/blogs`, `/gallery`) mixed with feature-rich Client Components for workflows.
- **Dual Authentication Isolation:** NextAuth.js v5 handles customer social OAuth and password login; a dedicated Jose-based JWT system protects the `/admin` portal at the Edge middleware level to ensure complete separation between public users and salon management.
- **Relational Integrity via Prisma:** A comprehensive 40+ model PostgreSQL schema encapsulating bookings, audits, contracts, customer notes, loyalty cards, and promotional campaigns.

## Layers

**Edge & Routing Layer:**
- Purpose: Request interception, header decoration, security enforcement, and canonical redirects
- Location: `src/middleware.ts`
- Contains: Jose JWT verification, HTTP-to-HTTPS redirect, non-www to www redirect, CORS preflight
- Used by: All incoming HTTP requests to Next.js

**Presentation & UI Layer:**
- Purpose: User interfaces for customers and salon administrators
- Location: `src/app/`, `src/components/`
- Contains: Page layouts, modals, forms, animations (`framer-motion`), tailwind styles
- Depends on: Client fetch hooks, NextAuth session, icons (`lucide-react`)

**API Route Handlers:**
- Purpose: RESTful JSON endpoints backing all frontend operations
- Location: `src/app/api/`
- Contains: Route handlers (`route.ts`) for admin, bookings, contracts, auth, reviews, and mobile endpoints
- Depends on: `src/lib/prisma.ts`, `src/lib/sms.ts`, `src/lib/email.ts`, `src/lib/chatTools.ts`

**Service Abstractions (`src/lib/`):**
- Purpose: Reusable business logic, third-party integrations, and notification orchestration
- Location: `src/lib/`
- Contains: Pingram SMS/Email dispatchers, Apple Wallet generators, S3/MinIO clients, AI inference routines
- Used by: API route handlers and server actions

**Persistence Layer:**
- Purpose: Type-safe database operations and migrations
- Location: `prisma/schema.prisma`, `src/lib/prisma.ts`
- Contains: Prisma client singleton, schema definitions, relation models
- Used by: All server-side data operations

## Data Flow

### Primary Booking Path

1. Customer initiates booking on `/book` (`src/app/book/page.tsx:80`)
2. Client checks real-time slot availability via `GET /api/bookings?date=YYYY-MM-DD` (`src/app/api/bookings/route.ts:45`)
3. Customer submits form to `POST /api/bookings` (`src/app/api/bookings/route.ts:130`)
4. Handler parses IP and geolocation metadata via `src/lib/bookingOrigin.ts:12`
5. Handler queries `BlockedDate` and `ManualBlock` to prevent double-booking collisions
6. Booking stored in PostgreSQL with status `PENDING`
7. Async notifications fired: Pingram SMS (`sendBookingSMS`) and email (`sendBookingReceived`) to client and studio owner (`src/lib/sms.ts:70`, `src/lib/email.ts:80`)
8. Client receives confirmation screen with calendar sync link and Apple/Google Wallet pass download links

### Conversational AI Booking Path

1. Client types message into `Chatbot.tsx` (`src/components/Chatbot.tsx:120`)
2. Request posted to `POST /api/chat` (`src/app/api/chat/route.ts:192`)
3. OpenAI (`gpt-4o-mini`) / DeepSeek evaluates conversation history and invokes tool `check_availability` (`src/lib/chatTools.ts:135`)
4. Upon client confirmation, AI invokes tool `create_booking` (`src/lib/chatTools.ts:250`)
5. Handler writes booking record to database, dispatches notifications, and returns interactive `BookingCardData` component directly in chat stream

### Contract Signing Flow

1. Admin drafts event contract in `/admin/contracts` (`src/app/admin/contracts/SpecialEventAdminForm.tsx`)
2. System generates unique signed token and creates `ContractSigningInvite` record
3. Pingram emails secure signing invitation to client (`src/lib/notify.ts`)
4. Client accesses `/sign/[token]` (`src/app/sign/[token]/page.tsx`), reviews terms, and signs via digital canvas
5. Signature captured, audit log recorded (`ContractAuditLog`), and tamper-proof PDF generated via Puppeteer/Chrome or `pdf-lib`
6. Final PDF stored in MinIO storage and emailed as attachment to both client and owner

## Key Abstractions

**Chat Tool Engine:**
- Purpose: Bridges unstructured natural language AI interactions with deterministic salon booking rules
- Examples: `src/lib/chatTools.ts:6` (`TOOL_DEFINITIONS`, `executeTool`)
- Pattern: Command/Tool Dispatcher pattern matching OpenAI function-calling specifications

**Notification Dispatcher:**
- Purpose: Unified multi-channel messaging wrapper around Pingram with fallback and error logging
- Examples: `src/lib/sms.ts:19` (`dispatchSms`), `src/lib/notify.ts:22` (`dispatchEmail`)
- Pattern: Gateway / Adapter pattern with transparent database logging (`notifLogger.ts`)

**Image Storage Provider:**
- Purpose: Multi-target object storage allowing uploads to Webdistt CDN and MinIO S3
- Examples: `src/lib/storage.ts:20` (`uploadImage`), `src/lib/minioGetBuffer.ts:22` (`minioGetBuffer`)
- Pattern: Strategy / Client wrapper

## Entry Points

**Web Application Entry:**
- Location: `src/app/layout.tsx`, `src/app/page.tsx`
- Triggers: Browser HTTP GET request
- Responsibilities: Loads fonts, global CSS, meta tags, top navigation, footer, lazy chatbot widget, and analytics

**Admin Portal Entry:**
- Location: `src/app/admin/layout.tsx`, `src/app/admin/page.tsx`
- Triggers: Administrative HTTP GET to `/admin`
- Responsibilities: Verifies `admin_session` cookie via middleware, renders navigation sidebar and KPI overview

**API Gateway Entry:**
- Location: `src/app/api/[...]/route.ts`
- Triggers: Fetch calls from frontend, mobile app, Apple Wallet devices, or external webhooks
- Responsibilities: Validates payloads, runs auth guards, interacts with database, dispatches side effects

## Architectural Constraints

- **Single Process Monolith:** Deployed as a single Node.js instance on a VPS; high memory tasks like headless Chrome PDF generation share resources with web traffic.
- **Edge Middleware Boundaries:** Next.js Edge middleware cannot use Node.js native packages like `crypto` or `bcryptjs` (hence `jose` is used for Edge JWT checks and `src/auth.config.ts` excludes Prisma).
- **Dual Session Systems:** NextAuth session cookie for customers and `admin_session` cookie for admin. Cross-session contamination is prevented by strict path isolation in middleware.
- **Apple Wallet Certificate Dependencies:** Generation of `.pkpass` files requires valid Apple certificates (`pass.cer`, `pass.key`) and the Apple WWDR intermediate certificate on the filesystem.

## Anti-Patterns

### Mega-Components with Excessive Lines of Code

**What happens:** Core administration forms and detail views contain 1,500 to 2,500+ lines in single files (`SpecialEventAdminForm.tsx`, `BookingDetailModal.tsx`, `src/app/book/page.tsx`).
**Why it's wrong:** High cognitive overhead, risk of accidental regressions during edits, slow IDE performance, and inability to unit-test sub-components.
**Do this instead:** Refactor into cohesive modular sub-components and custom hooks (`useBookingForm`, `BookingPricingSummary`, `ClientNotesPanel`).

### Broad Suppression of TypeScript Types (`any`)

**What happens:** Numerous API routes and components cast database payloads and form inputs to `any` (over 400 instances documented in `lint-src.txt`).
**Why it's wrong:** Defeats TypeScript's compile-time safety and can hide null reference errors in runtime production logs.
**Do this instead:** Leverage Prisma-generated types (`Prisma.BookingGetPayload<...>`, `User`, `ContractSigningInvite`) throughout API handlers.

---

*Architecture analysis: 2026-10-09*
