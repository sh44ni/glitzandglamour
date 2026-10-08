---
last_mapped_commit: 11da1ef612b172f9ad8cf487a7ad0a01a2cbae54
last_mapped_at: 2026-10-09
---
# Coding Conventions

**Analysis Date:** 2026-10-09

## Naming Patterns

**Files:**
- React Components & Modals: PascalCase (e.g. `src/components/Chatbot.tsx`, `src/components/admin/BookingDetailModal.tsx`)
- App Router Pages & Layouts: standard Next.js lowercase filenames (e.g. `page.tsx`, `layout.tsx`, `route.ts`, `loading.tsx`)
- Service & Utility Modules: camelCase (e.g. `src/lib/chatTools.ts`, `src/lib/sms.ts`, `src/lib/adminAuth.ts`, `src/lib/notifLogger.ts`)
- Static Data & Seed Files: camelCase (e.g. `src/data/servicesDetailed.ts`, `prisma/seed.ts`)
- Contract HTML Templates: kebab-case with versioning (e.g. `src/contracts/templates/in-studio-v1-contract-only.html`)

**Functions:**
- Utility & Service Functions: camelCase verb phrases (e.g. `dispatchSms`, `generateReviewMessage`, `minioGetBuffer`, `isAdminRequest`, `checkAvailability`)
- React Components: PascalCase nouns (e.g. `Chatbot`, `BookingDetailModal`, `SpecialEventAdminForm`, `CategorySelector`)
- App Router Route Handlers: Uppercase HTTP method names (e.g. `export async function GET(...)`, `export async function POST(...)`, `export async function DELETE(...)`)

**Variables:**
- Local Variables & Object Keys: camelCase (e.g. `bookingId`, `trackingId`, `isFirstVisit`, `rawResponse`)
- Module-Level Constants & Configs: UPPER_SNAKE_CASE (e.g. `ADMIN_COOKIE`, `FROM_EMAIL`, `TOOL_DEFINITIONS`, `MAX_TOOL_ROUNDS`, `STORAGE_BASE`)

**Types & Interfaces:**
- Interfaces & Type Aliases: PascalCase (e.g. `UploadResult`, `PingramSendResult`, `EmailDispatchOpts`, `BookingCardData`, `QuickReply`)
- Type parameters: PascalCase (e.g. `T`)

## Code Style

**Formatting:**
- Indentation: 4 spaces in backend service files (`src/lib/*`), 2 spaces in UI components and Next.js config files
- Quotes: Single quotes (`'...'`) for JavaScript/TypeScript strings; double quotes (`"..."`) for HTML/JSX attributes and JSON files
- Semicolons: Always present at line terminations

**Linting:**
- Tool: ESLint 9 using Flat Config (`eslint.config.mjs`)
- Presets: `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`
- Ignored Paths: `.next/**`, `out/**`, `build/**`, `next-env.d.ts`

## Import Organization

**Order:**
1. Next.js and React core packages (`next/server`, `next/navigation`, `react`)
2. Third-party library packages (`@prisma/client`, `groq-sdk`, `jose`, `bcryptjs`, `framer-motion`)
3. Internal application modules using the `@/*` path alias (`@/lib/prisma`, `@/lib/sms`, `@/lib/notify`, `@/components/Chatbot`)
4. Type-only imports using TypeScript's `import type { ... }` syntax

**Path Aliases:**
- Standard alias configured in `tsconfig.json`:
  ```json
  "paths": {
    "@/*": ["./src/*"]
  }
  ```
- Always use `@/lib/...` or `@/components/...` instead of deep relative paths (`../../lib/...`)

## Error Handling

**Patterns:**
- **Route Handler Guard Rails:** API routes wrap execution in `try / catch` blocks and return standardized JSON error objects:
  ```typescript
  try {
    // operation
  } catch (error) {
    console.error('[resource] error:', error);
    return NextResponse.json({ error: 'Operation failed' }, { status: 500 });
  }
  ```
- **Graceful Fallbacks for External APIs:**
  - AI LLM Generation: In `src/lib/reviewAI.ts`, if Groq inference fails, a high-quality fallback template string is generated without interrupting the client flow.
  - Messaging: In `src/lib/sms.ts`, missing API keys or soft delivery failures are caught, logged to `NotificationLog`, and return `{ success: false, reason: 'no-key' }` rather than crashing.
- **Edge-Safe Auth Exceptions:** `src/middleware.ts` catches JWT expiration or tamper errors cleanly and redirects unauthenticated requests to `/admin/login`.

## Logging

**Framework:**
- Native `console.log`, `console.warn`, and `console.error`
- Tagged prefixes for easy grep/filtering in VPS system logs (e.g. `[SMS SKIPPED]`, `[SMS SOFT-FAILURE]`, `[Review AI]`, `[auth]`, `[chat]`)

**Database Audit Logging:**
- Outbound communications are persistently recorded in the `NotificationLog` table via `src/lib/notifLogger.ts`
- Legal signing actions and IP footprints are stored in the `ContractAuditLog` table

## Comments

**When to Comment:**
- Use block comments (`// ── Section Name ───────`) to separate functional concerns within large files (e.g. in `src/app/api/chat/route.ts` and `src/lib/chatTools.ts`)
- Use JSDoc comments to document parameter expectations for shared helper functions (e.g. in `src/lib/storage.ts` and `src/lib/adminAuth.ts`)
- Add inline notes explaining non-obvious business rules (such as Apple Wallet domain sharing, OAuth redirect preservation, or canonical host enforcement)

## Function Design

**Size:**
- Aim for single-responsibility helper functions in `src/lib/`
- *Note:* Major React page components currently deviate from ideal size guidelines and require future decomposition

**Parameters:**
- Functions with more than 2 arguments should use a single typed options object (e.g. `dispatchSms(opts: { ... })`, `dispatchEmail(opts: EmailDispatchOpts)`)

**Return Values:**
- Service operations return structured result objects with `success: boolean` and descriptive error codes (e.g. `PingramSendResult`)

## Module Design

**Exports:**
- Named exports for library utilities, functions, and interfaces
- Default export reserved for Next.js App Router components (`page.tsx`, `layout.tsx`, `middleware.ts`)

**Barrel Files:**
- Avoid sprawling barrel files that aggregate full directories; import directly from specific module paths (e.g. `@/lib/sms`, `@/lib/prisma`) to maintain fast compilation and avoid circular dependencies

---

*Convention analysis: 2026-10-09*
