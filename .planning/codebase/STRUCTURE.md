---
last_mapped_commit: 11da1ef612b172f9ad8cf487a7ad0a01a2cbae54
last_mapped_at: 2026-10-09
---
# Codebase Structure

**Analysis Date:** 2026-10-09

## Directory Layout

```
glitzandglamourmvp/
├── .agents/                 # GSD agent skills and core runtime
├── .planning/               # GSD planning, codebase intelligence, and roadmap
│   └── codebase/            # Codebase map documents (STACK, ARCHITECTURE, etc.)
├── android/                 # Capacitor Android native studio project wrapper
├── apps/
│   └── mobile_flutter/      # Flutter mobile application skeleton
├── certs/                   # Apple Wallet cryptographic certificates (.p8, .cer, .key)
├── prisma/
│   ├── schema.prisma        # Prisma relational schema with 40+ models
│   └── seed.ts              # Database seeding script for services and test data
├── public/                  # Static assets (favicons, manifest.json, logos, icons)
├── scripts/                 # Maintenance, migration, and audit scripts
├── src/
│   ├── app/                 # Next.js App Router (pages and API route handlers)
│   │   ├── (public pages)   # /, /book, /card, /services, /special-events, /blogs, etc.
│   │   ├── admin/           # Administrative portal (/admin, /admin/bookings, etc.)
│   │   ├── api/             # RESTful API route handlers
│   │   │   ├── admin/       # Secured administrative backend endpoints
│   │   │   ├── apple-wallet/# Official Apple Passbook web service protocol endpoints
│   │   │   ├── auth/        # NextAuth v5 session, sign-in, and verification endpoints
│   │   │   ├── bookings/    # Public booking submission and slot checking
│   │   │   ├── chat/        # Conversational AI chatbot backend (OpenAI / DeepSeek)
│   │   │   ├── contracts/   # Legal contract signing and status management
│   │   │   ├── mobile/      # Native mobile auth (Apple/Google) and profile routes
│   │   │   └── reviews/     # Review tokens and Google Places sync
│   │   └── sign/[token]/    # Public legal contract electronic signature wizard
│   ├── components/          # Reusable React UI components
│   │   ├── admin/           # Admin-only modals, editors, and panels
│   │   ├── booking/         # Customer booking wizard step components
│   │   └── (global)         # Chatbot, TopNav, BottomNav, Footer, Lightbox, etc.
│   ├── contracts/
│   │   └── templates/       # HTML contract templates for in-studio and mobile glam
│   ├── data/                # Static data catalogs and detailed service matrices
│   ├── hooks/               # Custom React hooks (i18n, translations)
│   ├── lib/                 # Core business logic, third-party clients, utilities
│   ├── locales/             # Localization files (en.json, es.json)
│   ├── types/               # TypeScript interfaces and shared data types
│   ├── auth.config.ts       # Edge-compatible NextAuth configuration
│   ├── auth.ts              # Full Node.js NextAuth configuration with DB callbacks
│   └── middleware.ts        # Next.js Edge routing, canonical redirects, admin auth
├── capacitor.config.ts      # Capacitor Android wrapper configuration
├── eslint.config.mjs        # ESLint flat config with Next.js rules
├── next.config.ts           # Next.js optimization, security headers, and redirects
├── package.json             # NPM dependencies and scripts
└── tsconfig.json            # TypeScript configuration with @/* alias
```

## Directory Purposes

**`src/app/`:**
- Purpose: Application routing using Next.js 16 App Router. Houses all public pages, the protected admin portal, and RESTful route handlers.
- Contains: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx`, and `route.ts` API endpoints.
- Key files: `src/app/page.tsx` (Homepage), `src/app/book/page.tsx` (Booking wizard), `src/app/admin/page.tsx` (Admin dashboard), `src/app/sign/[token]/page.tsx` (Contract signing).

**`src/app/api/`:**
- Purpose: Serverless backend endpoints serving JSON responses to web clients, mobile apps, and webhook consumers.
- Contains: Secure CRUD handlers for salon operations, AI completions, pass generation, and notifications.
- Key files: `src/app/api/bookings/route.ts`, `src/app/api/chat/route.ts`, `src/app/api/contracts/sign/route.ts`, `src/app/api/mobile/auth/login/route.ts`.

**`src/components/`:**
- Purpose: Encapsulated UI components shared across pages.
- Contains: Interactive widgets, navigation bars, modal dialogs, and admin sub-views.
- Key files: `src/components/Chatbot.tsx`, `src/components/HomeClient.tsx`, `src/components/TopNav.tsx`, `src/components/admin/BookingDetailModal.tsx`.

**`src/lib/`:**
- Purpose: Core backend business logic and service wrappers.
- Contains: Prisma singleton, Pingram messaging helpers, AI prompt runners, Apple Wallet pass generator, rate limiters.
- Key files: `src/lib/prisma.ts`, `src/lib/sms.ts`, `src/lib/notify.ts`, `src/lib/chatTools.ts`, `src/lib/wallet.ts`, `src/lib/reviewAI.ts`.

**`src/contracts/templates/`:**
- Purpose: Authoritative HTML templates for legal contracts between the studio and bridal/special event clients.
- Contains: English and Spanish versions of In-Studio and On-Location contracts.
- Key files: `in-studio-v1-contract-only.html`, `on-location-v1-contract-only.html`.

**`prisma/`:**
- Purpose: Relational database architecture definition and database seeding.
- Contains: `schema.prisma` (PostgreSQL data models, enums, indexes) and `seed.ts` (test data and initial service catalogue).

## Key File Locations

**Entry Points:**
- Web App Layout: `src/app/layout.tsx`
- Web App Home: `src/app/page.tsx`
- Admin Dashboard: `src/app/admin/page.tsx`
- Edge Request Interceptor: `src/middleware.ts`
- Mobile Capacitor Config: `capacitor.config.ts`

**Configuration:**
- Next.js Configuration: `next.config.ts`
- TypeScript Paths: `tsconfig.json`
- Linter Rules: `eslint.config.mjs`
- Environment Variables Spec: `.env.example`

**Core Business Logic:**
- Database Client: `src/lib/prisma.ts`
- Transactional SMS & Email: `src/lib/sms.ts`, `src/lib/notify.ts`
- AI Tool Execution: `src/lib/chatTools.ts`
- PassKit & Wallet Push: `src/lib/wallet.ts`, `src/lib/applePush.ts`
- Admin Authentication Guard: `src/lib/adminAuth.ts`

**Data Catalogs:**
- Service Definitions: `src/data/servicesDetailed.ts`
- Special Events Content: `src/data/specialEventsDetailed.ts`

## Naming Conventions

**Files:**
- React Components & Modals: PascalCase (`BookingDetailModal.tsx`, `ScheduleStep.tsx`)
- App Router Pages & Layouts: Next.js convention kebab/lowercase (`page.tsx`, `layout.tsx`, `route.ts`)
- Utility & Service Modules: camelCase (`sms.ts`, `chatTools.ts`, `reviewAI.ts`, `notifLogger.ts`)
- Contract Templates: kebab-case (`in-studio-v1-contract-only.html`)

**Directories:**
- App Router Routes: kebab-case (`special-events`, `apple-wallet`, `push-notifications`)
- Component Groups: camelCase / lowercase (`admin`, `booking`, `contracts`)

## Where to Add New Code

**New Customer Feature / Page:**
- Create new App Router folder under `src/app/[feature-name]/page.tsx`
- Build accompanying UI components under `src/components/[feature-name]/`
- Export shared TypeScript types under `src/types/`

**New API Endpoint:**
- Create route handler under `src/app/api/[resource]/route.ts`
- Add validation, rate limiting (`src/lib/rateLimit.ts`), and session check (`auth()` or `isAdminRequest()`)
- Keep route handler thin; place data transformations or external API calls inside a dedicated module in `src/lib/`

**New Database Model:**
- Define model and relations in `prisma/schema.prisma`
- Run `npm run db:push` (for dev) or `npm run db:migrate` (for production)
- Re-run `npx prisma generate` to refresh `@prisma/client` types

**New External Service / Integration:**
- Create wrapper client under `src/lib/[serviceName].ts`
- Expose typed functions that handle error capture, logger calls, and fallback logic

## Special Directories

**`.planning/`:**
- Purpose: Project roadmap, architectural decisions, codebase intelligence, and GSD state
- Generated: Maintained by GSD workflows
- Committed: Yes

**`certs/`:**
- Purpose: Apple Wallet developer certificates and private keys
- Generated: Generated via Apple Developer portal
- Committed: Selected non-sensitive public assets only; sensitive keys MUST be protected

**`android/`:**
- Purpose: Native Android platform generated by `@capacitor/cli`
- Generated: Yes (via `npx cap add android`)
- Committed: Yes (holds Android manifest and build settings)

---

*Structure analysis: 2026-10-09*
