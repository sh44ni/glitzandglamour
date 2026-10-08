---
last_mapped_commit: 11da1ef612b172f9ad8cf487a7ad0a01a2cbae54
last_mapped_at: 2026-10-09
---
# Technology Stack

**Analysis Date:** 2026-10-09

## Languages

**Primary:**
- TypeScript `^5` - Full-stack application code across `src/app/`, `src/components/`, `src/lib/`, `src/types/`, and Prisma seed scripts in `prisma/`

**Secondary:**
- JavaScript (Node.js CJS/MJS) - Deployment scripts (`deploy.sh`, `migrate-webdistt.cjs`, `audit-gallery.cjs`), configuration files (`eslint.config.mjs`, `postcss.config.mjs`), and utility scripts
- HTML - Contract templates (`src/contracts/templates/` and root legal contract HTMLs)
- Dart - Mobile skeleton in `apps/mobile_flutter/` (currently inactive)

## Runtime

**Environment:**
- Node.js 18+ (verified with Node.js 20+ runtime for Next.js 16)
- OS Targets: Linux (production VPS at `glitzandglamours.com`), Windows (development environment)

**Package Manager:**
- npm (lockfile: `package-lock.json` present and committed)
- Scripts: `npm run dev`, `npm run build`, `npm run start`, `npm run lint`, `npm run db:push`, `npm run db:migrate`, `npm run db:seed`, `npm run db:studio`

## Frameworks

**Core:**
- Next.js `16.1.1` (App Router, Server Actions, Route Handlers, Edge & Node runtimes) - Core web application framework
- React `19.2.3` and React-DOM `19.2.3` - UI rendering engine
- Tailwind CSS `^4` (via `@tailwindcss/postcss` and `tailwindcss`) - Utility-first styling with modern CSS variables

**Testing:**
- Not configured - No test runner (`vitest`, `jest`, `playwright`, `cypress`) installed or defined in `package.json`

**Build/Dev:**
- TypeScript `^5` (`tsconfig.json`) - Strict type checking (`"strict": true`)
- PostCSS (`postcss.config.mjs`) - CSS compilation for Tailwind 4
- ESLint `^9` (`eslint.config.mjs`) - Flat config with `eslint-config-next` (`core-web-vitals` & `typescript`)
- `tsx` `^4.7.0` - Fast TypeScript runtime for executing database seeds (`prisma/seed.ts`)
- Capacitor CLI `^8.2.0` - Hybrid mobile bundling for Android native platform

## Key Dependencies

**Critical:**
- `@prisma/client` & `prisma` `^6.4.0` - Type-safe database ORM managing 40+ PostgreSQL models (`prisma/schema.prisma`)
- `next-auth` `^5.0.0-beta.25` - Authentication core for Google/Apple OAuth and customer credentials (`src/auth.ts`, `src/auth.config.ts`)
- `jose` `^6.1.3` - Lightweight JWT verification for Edge middleware admin protection (`src/middleware.ts`, `src/lib/adminAuth.ts`)
- `pingram` (`latest`) - Official SDK for multi-channel transactional messaging: Pingram SMS and Pingram Email (`src/lib/sms.ts`, `src/lib/notify.ts`, `src/lib/pingramClient.ts`)
- `@aws-sdk/client-s3` `^3.1000.0`, `@aws-sdk/s3-request-presigner` `^3.1075.0` - Object storage access for image assets and PDF buffering (`src/lib/minioGetBuffer.ts`)
- `groq-sdk` `^1.1.2` - Fast LLM inference with `llama-3.3-70b-versatile` for personalized review request generation (`src/lib/reviewAI.ts`)
- `openai` `^7.23.0` & DeepSeek API - Multi-turn function-calling AI chatbot assistant (`src/app/api/chat/route.ts`, `src/lib/chatTools.ts`)

**Infrastructure & Utilities:**
- `passkit-generator` `^3.5.7` - Apple Wallet `.pkpass` generation and signing (`src/app/api/card/route.ts`, `src/lib/wallet.ts`)
- `@parse/node-apn` `^7.1.0` - Direct Apple Push Notification service connection for real-time wallet balance/pass updates (`src/lib/applePush.ts`)
- `pdf-lib` `^1.17.1` & `puppeteer-core` `^24.40.0` - Contract PDF rendering, signing stamps, and multi-page contract document export (`src/app/api/contracts/`)
- `sharp` `^0.34.5` - High-performance server-side image processing, optimization, and format conversion
- `framer-motion` `^11.0.0` - Smooth animations, modals, transitions, and interactive UI components (`src/components/HomeClient.tsx`, `src/components/Chatbot.tsx`)
- `lucide-react` `^0.575.0` & `react-icons` `^5.6.0` - Application iconography with tree-shaking enabled in `next.config.ts`
- `next-pwa` `^5.6.0` - Progressive Web Application service worker and offline support (`src/components/PWAInstallPrompt.tsx`)
- `bcryptjs` `^2.4.3` - Password hashing for credential-based customer and admin accounts
- `nanoid` `^5.1.6` - Cryptographically secure unique token and invite code generation

## Configuration

**Environment:**
- Managed via `.env.local` (local dev) and system environment variables in production VPS (`deploy.sh`)
- Template defined in `.env.example`
- Critical variables: `DATABASE_URL`, `ADMIN_JWT_SECRET`, `AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `AUTH_APPLE_ID`, `AUTH_APPLE_SECRET`, `PINGRAM_API_KEY`, `OPENAI_API_KEY`, `DEEPSEEK_API_KEY`, `GROQ_API_KEY_REVIEWS`, `MINIO_ENDPOINT`, `CHROME_PATH`

**Build:**
- `next.config.ts` - Custom security headers (`HSTS`, `X-Frame-Options`, `X-Content-Type-Options`, `Permissions-Policy`), 1-year immutable cache for static assets, CORS for `/api/*`, image optimization with AVIF/WebP, and canonical 301 redirects for legacy service routes
- `tsconfig.json` - Path alias `@/*` mapped to `./src/*`, target `ES2017`, strict mode enabled
- `eslint.config.mjs` - ESLint 9 flat configuration with custom ignore patterns
- `capacitor.config.ts` - Mobile app ID `com.glitzandglamour.studio`, live server pointing to `https://glitzandglamours.com`

## Platform Requirements

**Development:**
- Node.js 18+ or 20+
- PostgreSQL database instance (Neon or local)
- Git for version control
- (Optional) Android Studio / SDK for native mobile testing via Capacitor

**Production:**
- Host: VPS Linux Server (`glitzandglamours.com`) running PM2/systemd Node.js service
- Database: Managed PostgreSQL (Neon)
- Storage: MinIO Object Storage instance (port 9000) and Webdistt bucket storage
- Reverse Proxy: Nginx handling SSL termination and forwarding to Next.js port

---

*Stack analysis: 2026-10-09*
