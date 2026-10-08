---
last_mapped_commit: 11da1ef612b172f9ad8cf487a7ad0a01a2cbae54
last_mapped_at: 2026-10-09
---
# Testing Patterns

**Analysis Date:** 2026-10-09

## Test Framework

**Runner:**
- Currently Not Installed - There is no automated test runner configured in `package.json` (no Vitest, Jest, Cypress, or Playwright).
- Config: None present (`vitest.config.ts` or `jest.config.js` not detected).

**Assertion Library:**
- None installed.

**Run Commands:**

```bash

# Current quality validation commands:

npm run lint          # Run ESLint (Next.js flat config)
npm run build         # Validate TypeScript compilation & Next.js production bundle
npx prisma validate   # Validate Prisma schema integrity
```

## Test File Organization

**Location:**
- No test files currently exist in `src/` or project root.

**Recommended Future Pattern:**
- Co-located unit tests adjacent to source files: `src/lib/__tests__/[module].test.ts`
- Component tests: `src/components/__tests__/[Component].test.tsx`
- Integration / E2E tests: dedicated top-level `tests/e2e/` directory

## Current Verification Practices

In the absence of an automated test suite, verification relies on:

1. **Static Analysis & Type Checking:**
   - Strict TypeScript checking (`"strict": true` in `tsconfig.json`) executed during `npm run build`
   - ESLint rules for Next.js and TypeScript (`npm run lint`)

2. **Schema & Database Consistency:**
   - Prisma ORM type-checking ensuring relational consistency across models (`prisma generate`)

3. **Manual Verification Workflows:**
   - **Booking Flow Verification:** Testing `/book` multi-step submission, ensuring database persistence in `prisma.booking` and notification delivery via Pingram.
   - **Chatbot Tool Calling:** Manual testing of conversational prompts in `Chatbot.tsx` verifying slot availability checks and booking generation.
   - **Admin Portal Inspection:** Manual review of `/admin` tabs (Bookings, Calendar, Codes, Customers, Contracts).
   - **Apple Wallet Pass Testing:** Inspecting generated `.pkpass` downloads on iOS devices / simulator.
   - **SEO & Performance Audits:** Executing custom audit scripts (e.g. `audit-gallery.cjs`) and Google Lighthouse / PageSpeed checks.

## Mocking Strategy (Recommended for Implementation)

When introducing Vitest to the project, the following mocking patterns should be adopted:

**Prisma Client:**

```typescript
import { mockDeep, mockReset, DeepMockProxy } from 'vitest-mock-extended';
import { PrismaClient } from '@prisma/client';
import { prisma } from '@/lib/prisma';

vi.mock('@/lib/prisma', () => ({
    __esModule: true,
    prisma: mockDeep<PrismaClient>(),
}));
```

**Third-Party Messaging (Pingram):**

```typescript
vi.mock('@/lib/pingramClient', () => ({
    buildPingram: vi.fn().mockResolvedValue({
        send: vi.fn().mockResolvedValue({ trackingId: 'mock-track-id' }),
    }),
}));
```

**AI Language Models (OpenAI & Groq):**

```typescript
vi.mock('groq-sdk', () => ({
    default: vi.fn().mockImplementation(() => ({
        chat: {
            completions: {
                create: vi.fn().mockResolvedValue({
                    choices: [{ message: { content: JSON.stringify({ sms: 'Hi!', emailBody: 'Hello!' }) } }],
                }),
            },
        },
    })),
}));
```

## Coverage

**Requirements:**
- None enforced currently.

**Target for Planned Test Setup:**
- Critical Path Priority 1: Booking validation and slot collision logic (`src/app/api/bookings/route.ts`, `src/lib/chatTools.ts`)
- Critical Path Priority 2: Admin authentication and role verification (`src/middleware.ts`, `src/lib/adminAuth.ts`)
- Critical Path Priority 3: Legal contract invite generation, signing token verification, and signature hashing (`src/app/api/contracts/`)

---

*Testing analysis: 2026-10-09*
