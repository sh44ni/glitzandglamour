---
last_mapped_commit: 11da1ef612b172f9ad8cf487a7ad0a01a2cbae54
last_mapped_at: 2026-10-09
---
# Codebase Concerns

**Analysis Date:** 2026-10-09

## Tech Debt

**Monolithic UI Components:**
- Issue: Several critical components and pages exceed 1,500 to 2,500+ lines of code, packing data fetching, state management, complex form validation, and presentation into single monolithic files.
- Files:
  - `src/app/admin/contracts/SpecialEventAdminForm.tsx` (151 KB)
  - `src/components/admin/BookingDetailModal.tsx` (150 KB)
  - `src/app/admin/bookings/page.tsx` (115 KB)
  - `src/app/book/page.tsx` (98 KB)
  - `src/components/admin/AnalyticsSection.tsx` (79 KB)
  - `src/components/Chatbot.tsx` (69 KB)
- Impact: High risk of unintended regression during routine UI tweaks, slow IDE responsiveness, hard-to-maintain state machines, and inability to write focused component tests.
- Fix approach: Decompose into modular child components (e.g., extract `BookingStatusControl`, `BookingCustomerNotes`, `BookingServiceEditor` from `BookingDetailModal.tsx`) and custom hooks for business logic.

**Pervasive `any` Type Annotations:**
- Issue: Over 400 instances of `@typescript-eslint/no-explicit-any` across API routes and components (as recorded in `lint-src.txt`).
- Files: `src/app/api/profile/route.ts`, `src/app/api/reviews/route.ts`, `src/app/api/tasks/route.ts`, `src/app/api/admin/bookings/route.ts`, and others.
- Impact: Bypasses TypeScript's static guarantees; schema field renames or null values can cause silent runtime errors in production.
- Fix approach: Refactor API route handlers to use Prisma's generated types (`Prisma.BookingGetPayload`, `User`, `ContractSigningInvite`) and Zod schemas for input validation.

**Divergent Storage Backends:**
- Issue: The application relies on two separate storage solutions: the Webdistt cloud bucket API (`https://storage.webdistt.com` in `src/lib/storage.ts`) and a self-hosted MinIO S3 instance on the VPS (`src/lib/minioGetBuffer.ts`).
- Files: `src/lib/storage.ts`, `src/lib/minioGetBuffer.ts`, `src/lib/imageUrl.ts`
- Impact: Fragmentation in asset URL resolution, upload failure recovery, and migration complexity.
- Fix approach: Unify object storage behind a single S3-compatible abstraction layer.

**Unused Mobile Flutter Skeleton:**
- Issue: `apps/mobile_flutter/` contains an unpopulated Flutter project structure with empty lib directories, while the production mobile strategy is Capacitor 8 Android (`android/`, `capacitor.config.ts`).
- Files: `apps/mobile_flutter/`
- Impact: Developer confusion regarding mobile architecture and repository bloat.
- Fix approach: Remove or archive `apps/mobile_flutter/` if Capacitor is the chosen mobile distribution model.

## Known Bugs & Fragile Areas

**Headless Chrome PDF Generation Dependency:**
- Symptoms: Legal contract PDF generation can fail or timeout under high memory load if Chromium fails to spawn.
- Files: `src/app/api/contracts/sign/route.ts`, `src/app/api/contracts/[id]/pdf/route.ts`
- Trigger: Client signing contract or admin downloading PDF when `CHROME_PATH` is unconfigured or VPS memory is constrained.
- Workaround: System currently attempts fallback to `pdf-lib` for basic stamp operations, but multi-page layout requires Chrome.
- Fix approach: Ensure robust background queueing for PDF generation or delegate rendering to an isolated microservice / serverless function.

**Pre-release Auth.js (NextAuth v5 Beta):**
- Symptoms: Unintended session edge cases across Next.js minor releases.
- Files: `src/auth.ts`, `src/auth.config.ts`, `src/middleware.ts`
- Why fragile: `next-auth: ^5.0.0-beta.25` is a pre-release version. Upstream changes in session cookie naming or callback signatures can break authentication.
- Safe modification: Lock the exact beta version and avoid upgrading without comprehensive end-to-end verification.

**In-Memory Rate Limiting:**
- Files: `src/lib/rateLimit.ts`
- Why fragile: Uses an in-memory Node.js `Map` (`Map<string, { count: number; resetAt: number }>`).
- Impact: State does not survive process restarts and does not synchronize across clustered Node.js workers or multiple server processes.
- Fix approach: Transition to Redis or PostgreSQL-backed rate limiting for production scalability.

## Security Considerations

**Workspace Secrets & Keys:**
- Risk: Root directory contains private key/certificate files (`AuthKey_UNY7PU7P6T.p8`, `VPS_pass.pem`).
- Current mitigation: Files are in `.gitignore`.
- Recommendations: Store production deployment keys and Apple APN keys in secure credential managers or dedicated protected secrets paths (`certs/secrets/`) rather than the project root.

**Cron & Automation Endpoint Protection:**
- Risk: Automated routes (such as `/api/cron/sync-reviews` and `/api/noremail`) could be abused if exposed without authentication.
- Current mitigation: Basic secret checks.
- Recommendations: Enforce a strict shared secret Bearer token (`CRON_SECRET`) on all cron and webhook entry points in `src/middleware.ts`.

## Performance Bottlenecks

**Heavy Client-Side JavaScript Bundles:**
- Problem: Large initial bundle sizes flagged by PageSpeed due to rich interactive components on the homepage and booking wizard.
- Files: `src/components/Chatbot.tsx`, `src/components/HomeClient.tsx`, `src/app/book/page.tsx`
- Cause: Inclusion of heavy animation libraries (`framer-motion`) and complex UI state machines loaded synchronously.
- Improvement path: Leverage Next.js dynamic imports (`next/dynamic` with `ssr: false`) for non-critical elements (e.g. Chatbot widget is already using `ChatbotLazy.tsx`, extend this pattern to booking sub-modals).

**Iterative Database Operations in Admin Campaigns:**
- Problem: Bulk SMS and email campaign dispatches iterate sequentially over recipients.
- Files: `src/app/api/admin/campaigns/send/route.ts`, `src/app/api/admin/push/send/route.ts`
- Cause: Loops issuing individual `prisma.notificationLog.create` calls.
- Improvement path: Use `prisma.notificationLog.createMany` and asynchronous background worker queues.

## Test Coverage Gaps

**Zero Automated Test Suite:**
- What's not tested: Entire codebase (0% test coverage; no test runner installed).
- Files: All source files across `src/`
- Risk: Critical business features—such as double-booking prevention, calendar slot calculations, pricing rules, contract signing audit trails, and payment/deposit records—can experience undetected regressions during maintenance.
- Priority: High. Establish Vitest unit tests for core business calculations and Playwright for critical customer journeys.

---

*Concerns audit: 2026-10-09*
