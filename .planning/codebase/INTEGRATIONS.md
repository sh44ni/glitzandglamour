---
last_mapped_commit: 11da1ef612b172f9ad8cf487a7ad0a01a2cbae54
last_mapped_at: 2026-10-09
---
# External Integrations

**Analysis Date:** 2026-10-09

## APIs & External Services

**Transactional Messaging (SMS & Email):**
- **Pingram:** Primary multi-channel transactional messaging provider for customer communications, booking confirmations, deposit reminders, staff alerts, review invitations, and marketing SMS campaigns.
  - SDK: `pingram` (client initialized via `src/lib/pingramClient.ts`)
  - SMS Implementation: `src/lib/sms.ts` (dispatches `sendBookingSMS`, review requests, cancellation notices)
  - Email Implementation: `src/lib/notify.ts` and `src/lib/email.ts` (dispatches HTML emails with PDF contract attachments)
  - Auth / Env: `PINGRAM_API_KEY`, `PINGRAM_FROM_EMAIL`, `PINGRAM_FROM_NUMBER`, `PINGRAM_CLIENT_ID`, `PINGRAM_CLIENT_SECRET`, `PINGRAM_BASE_URL`
- **Resend:** Secondary email service provider retained for standalone utility endpoints.
  - SDK: `resend`
  - Usage: `src/app/api/noremail/route.ts`
  - Auth / Env: `RESEND_API_KEY_SECONDARY`

**AI & Language Models:**
- **Groq AI:** Ultra-fast LLM inference using `llama-3.3-70b-versatile` to dynamically compose personalized post-service review request messages (SMS & Email) in owner JoJany's brand voice.
  - SDK: `groq-sdk`
  - Implementation: `src/lib/reviewAI.ts`
  - Auth / Env: `GROQ_API_KEY_REVIEWS` / `GROQ_API_KEY`
- **OpenAI & DeepSeek:** Conversational AI engine for the 24/7 studio website chatbot assistant with function calling (slot availability, services lookup, pending booking creation).
  - Implementation: `src/app/api/chat/route.ts`, tool execution in `src/lib/chatTools.ts`
  - Models: `gpt-4o-mini` (OpenAI), `deepseek-v4-flash` (DeepSeek)
  - Auth / Env: `OPENAI_API_KEY`, `OPENAI_MODEL`, `DEEPSEEK_API_KEY`

**Reviews & Reputation:**
- **Google Places / Business API:** Aggregates and synchronizes Google customer reviews into PostgreSQL to display live verified social proof across the site.
  - Implementation: `src/lib/googleReviews.ts`, route handlers in `src/app/api/admin/sync-google-reviews/route.ts` and `src/app/api/cron/sync-reviews/route.ts`
  - Schedule: Triggered via daily cron or manually in admin portal

## Data Storage

**Databases:**
- **PostgreSQL (Neon Managed Database):** Core persistent storage for 40+ relational models including bookings, users, admin users, contracts, audit logs, loyalty cards, stamps, and blog posts.
  - Connection: `DATABASE_URL` via Prisma ORM client (`src/lib/prisma.ts`)
  - Schema: `prisma/schema.prisma`

**File & Object Storage:**
- **Webdistt Object Storage:** Dedicated cloud bucket storage used for client inspiration images, gallery photos, and website media uploads.
  - Target URL: `https://storage.webdistt.com/api/buckets/lava/upload`
  - Client / Server Implementation: `src/lib/storage.ts`
- **MinIO S3-Compatible Storage:** Self-hosted S3 object store on the production VPS used for binary assets, uploaded attachments, and signed contract PDFs.
  - SDK: `@aws-sdk/client-s3` (`src/lib/minioGetBuffer.ts`)
  - Configuration: `MINIO_ENDPOINT`, `MINIO_PORT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`, `MINIO_BUCKET`, `MINIO_PUBLIC_URL`

**Caching:**
- In-memory rate limiting and typing state (`src/lib/rateLimit.ts`, `src/lib/typingState.ts`)
- HTTP Cache-Control headers on static and image assets (`next.config.ts`)

## Authentication & Identity

**Customer Authentication:**
- **NextAuth.js (Auth.js v5):** Multi-provider authentication supporting:
  - Google OAuth (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`)
  - Apple Sign-In (`AUTH_APPLE_ID`, `AUTH_APPLE_SECRET`)
  - Email/Password credentials (`src/auth.ts` using `bcryptjs`)
  - Session strategy: JWT with 30-day max age, shared across `.glitzandglamours.com` subdomains
- **Native Mobile Auth:**
  - Token exchange endpoints in `src/app/api/mobile/auth/` verifying Google idTokens and Apple identity tokens against allowed client IDs (`GOOGLE_MOBILE_CLIENT_IDS`, `APPLE_MOBILE_BUNDLE_ID`).

**Admin Authentication:**
- Standalone stateless JWT authentication (`admin_session` cookie) verified at the Next.js edge middleware level using `jose` (`src/middleware.ts`, `src/lib/adminAuth.ts`, `src/app/api/admin/auth/route.ts`).
- Auth / Env: `ADMIN_JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`

## Mobile Pass & Push Notifications

**Digital Passes:**
- **Apple Wallet (.pkpass):** Dynamically generated loyalty cards signed with Apple certificates.
  - SDK: `passkit-generator` (`src/lib/wallet.ts`)
  - Device Registration Endpoints: Implements official Apple Passbook web service protocol at `src/app/api/apple-wallet/v1/`
  - Push Updates: `@parse/node-apn` triggers silent push notifications to devices when stamps or balance update (`src/lib/applePush.ts`)
- **Google Wallet:** Generates Google Wallet loyalty passes.
  - SDK: `googleapis` (`src/app/api/card/google-wallet/route.ts`)
  - Auth / Env: `GOOGLE_CLIENT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_ISSUER_ID`

## Monitoring & Observability

**Error Tracking:**
- Localized server route logging (`console.error`, `console.warn`) with structured status logging for notifications in PostgreSQL (`prisma.notificationLog` via `src/lib/notifLogger.ts`)

**Logs:**
- Relational database audit logs:
  - `ContractAuditLog`: Records contract views, IP addresses, signing events, and voiding
  - `StaffBookingLog`: Internal staff notes and timestamped updates per booking
  - `HealthFormLog`: Records health intake form revisions and client compliance
  - `BlockLog`: Records security blocklist additions, removals, and trigger reasons

## CI/CD & Deployment

**Hosting:**
- Linux VPS hosting the Next.js application at `glitzandglamours.com`
- Process manager: Node.js process managed via deployment shell script (`deploy.sh`)
- Automated build pipeline: `npm run build` runs `prisma generate`, compiles TypeScript, and creates standalone Next.js build

## Environment Configuration

**Required Env Vars:**
- Database & Auth: `DATABASE_URL`, `AUTH_SECRET`, `ADMIN_JWT_SECRET`, `AUTH_URL`
- OAuth: `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTH_APPLE_ID`, `AUTH_APPLE_SECRET`
- Messaging: `PINGRAM_API_KEY`, `PINGRAM_FROM_EMAIL`, `PINGRAM_FROM_NUMBER`
- AI Models: `OPENAI_API_KEY`, `DEEPSEEK_API_KEY`, `GROQ_API_KEY_REVIEWS`
- Storage: `MINIO_ENDPOINT`, `MINIO_ACCESS_KEY`, `MINIO_SECRET_KEY`
- PDF: `CHROME_PATH` (headless Chrome executable path for Puppeteer)

**Secrets Location:**
- Local development: `.env.local` (git-ignored)
- Production: Environment variables on VPS host

## Webhooks & Callbacks

**Incoming:**
- `/api/auth/callback/google` - Google OAuth authentication callback
- `/api/auth/callback/apple` - Apple Sign-In POST callback
- `/api/apple-wallet/v1/devices/[deviceLibraryId]/registrations/[passTypeIdentifier]/[serialNumber]` - Apple Wallet push registration
- `/api/apple-wallet/v1/passes/[passTypeIdentifier]/[serialNumber]` - Apple Wallet pass download
- `/api/apple-wallet/v1/log` - Apple Wallet client error logging

**Outgoing:**
- Apple APN gateway: `api.push.apple.com` for Wallet pass update triggers
- Pingram API: `https://api.pingram.io` for SMS and transactional emails
- OpenAI API: `https://api.openai.com/v1/chat/completions` for chatbot conversations
- Groq API: `https://api.groq.com/openai/v1/` for review request generation

---

*Integration audit: 2026-10-09*
