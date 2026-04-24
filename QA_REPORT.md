# QA Report — glitzandglamours.com

- **Date:** 2026-04-17
- **Target:** `https://glitzandglamours.com` (Next.js 16 / React 19 app built from this repo)
- **Method:** Static source audit (`src/**`, `prisma/**`, `next.config.ts`, env layout) + live probing of public URLs and unauthenticated API endpoints via HTTPS fetch. No interactive admin login was performed; all admin findings are code-only.
- **Toolchain observed:** Next 16 App Router, NextAuth v5 beta, custom admin JWT middleware, Prisma/PostgreSQL, MinIO (S3-compatible) object storage, Resend email, Pingram SMS, Groq LLM, Google/Apple Wallet, `next-pwa`, Capacitor hybrid wrapper deps.
- **Scope:** All public + customer surfaces, all `/api/**` handlers, all `/admin/**` pages and handlers, `prisma/schema.prisma`, `next.config.ts`, lint/typecheck. Out of scope: interactive admin QA, the standalone `GGS Contract [FINAL] V1.html` file, mobile Flutter / Android wrappers.

---

## Executive summary

| Severity | Count |
|---|---|
| **P0 — Blocker** | 5 |
| **P1 — High** | 15 |
| **P2 — Medium** | 17 |
| **P3 — Nits** | 9 |
| **Total** | **46** |

**Top 5 must-fix right now (in order):**

1. **P0 — Admin credential hygiene.** The current admin password was shared in plaintext in a developer chat during this QA. **Rotate `ADMIN_PASSWORD` immediately.** In addition, the admin auth cookie verifier accepts the legacy hardcoded string `"authenticated"` as a valid session (`src/lib/adminAuth.ts:20`, `src/app/api/admin/auth/route.ts:61`) — anyone can set `admin_session=authenticated` in their cookies and bypass every `/api/admin/*` auth check. (Note that the page middleware at `src/middleware.ts:15` does a *real* JWT verify and would block that cookie from reaching pages — but API routes are not covered by that middleware.)
2. **P0 — Hardcoded fallback JWT secret.** Both `src/lib/adminAuth.ts:7` and `src/app/api/admin/auth/route.ts:7` fall back to the string `'glam-admin-secret-2026'` if `ADMIN_JWT_SECRET`/`NEXTAUTH_SECRET` are missing. Anyone reading this repo can forge admin JWTs if that fallback is ever hit in production.
3. **P0 — `/api/tasks` is world-readable & world-writable.** `GET /api/tasks` returned a 46.9 KB payload of internal project backlog (financial handles — Cash App `$glitzandglamours`, Venmo `@glitzandglamours` — business strategy, internal developer discussions, image uploads) to an anonymous fetch. `POST`, `PATCH /api/tasks/[id]`, `DELETE /api/tasks/[id]` are also unauthenticated (`src/app/api/tasks/route.ts`, `src/app/api/tasks/[id]/route.ts`). Any visitor can read, mutate, or destroy every row.
4. **P0 — `/api/upload` accepts anonymous uploads.** Rate-limited (20/hr/IP) but has zero authentication (`src/app/api/upload/route.ts`). Any visitor can stash files on the studio's MinIO bucket.
5. **P1 — `/sitemap.xml` returns HTTP 500 in production** even though `src/app/sitemap.ts` exists and compiles; blogs queries in it aren't wrapped in try/catch. Google currently cannot ingest the sitemap.

---

## P0 — Blockers

### [P0] Admin session bypass via legacy plaintext cookie value
- **Area:** Security / Auth
- **Location:** `src/lib/adminAuth.ts:20`, `src/app/api/admin/auth/route.ts:61`
- **Observed:** Both admin verifiers include:
  ```ts
  if (token === 'authenticated') return true;
  ```
  Any client can send `Cookie: admin_session=authenticated` and pass the check used by every `/api/admin/*` handler.
- **Expected:** No legacy literal short-circuit in production; only real JWT verification.
- **Reproduction:**
  ```bash
  curl -H 'Cookie: admin_session=authenticated' https://glitzandglamours.com/api/admin/customers
  # returns 401 today IF middleware blocks page-level access, but API handlers ONLY use isAdminRequest
  # which accepts the string literally. Live test recommended from an off-deploy IP.
  ```
  (This QA did not execute that curl against production because it is potentially destructive — code path confirmed by inspection.)
- **Recommended fix:** Delete both `if (token === 'authenticated') return true;` lines. If any still-valid literal sessions exist, users will simply re-log in.

### [P0] Hardcoded fallback JWT secret `'glam-admin-secret-2026'`
- **Area:** Security / Secrets
- **Location:** `src/lib/adminAuth.ts:7`, `src/app/api/admin/auth/route.ts:7`
- **Observed:**
  ```ts
  const key = process.env.ADMIN_JWT_SECRET || process.env.NEXTAUTH_SECRET || 'glam-admin-secret-2026';
  ```
  An attacker who has read this open-source-style repo can mint `admin_session` JWTs if the env vars are ever unset (e.g. on a preview deploy, a reset VPS, or during a deploy window).
- **Expected:** Hard fail on startup if neither env var is set — the way `src/middleware.ts:6` already does for `ADMIN_JWT_SECRET`.
- **Reproduction:** Deploy without env var set; any HS256 JWT signed with that literal is accepted.
- **Recommended fix:**
  ```ts
  function getSecret() {
      const key = process.env.ADMIN_JWT_SECRET || process.env.NEXTAUTH_SECRET;
      if (!key) throw new Error('ADMIN_JWT_SECRET or NEXTAUTH_SECRET must be set');
      return new TextEncoder().encode(key);
  }
  ```

### [P0] `/api/tasks` endpoints have no authentication — full project backlog leaked
- **Area:** Security / Data leak
- **Location:** `src/app/api/tasks/route.ts` (GET/POST), `src/app/api/tasks/[id]/route.ts` (PATCH/DELETE)
- **Observed:** Live `GET https://glitzandglamours.com/api/tasks` returned **46.9 KB of internal data**, including: the studio's Cash App (`$glitzandglamours`) and Venmo (`@glitzandglamours`) handles, references to internal business processes, developer-client chat about passwords/Apple Wallet/contract internals, direct `/api/images/uploads/...` links to private screenshots, and identifiable information about the owner ("JoJany"). No handler in the file calls `auth()` or `isAdminRequest()`.
- **Expected:** Admin-only. These endpoints are used by the `/tasks` admin-dashboard UI and are not meant to be public.
- **Reproduction:** `curl https://glitzandglamours.com/api/tasks` from any anonymous IP. Responds 200 with JSON body.
- **Recommended fix:** Guard every handler with `isAdminRequest()` the same way every `/api/admin/*` route already does:
  ```ts
  import { isAdminRequest } from '@/lib/adminAuth';
  export async function GET(req: NextRequest) {
      if (!(await isAdminRequest(req))) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      // … existing handler …
  }
  ```
  Apply identically to POST/PATCH/DELETE. Also consider moving the route under `/api/admin/tasks/*` so the naming matches its access tier.

### [P0] `/api/upload` allows unauthenticated image uploads
- **Area:** Security / Abuse
- **Location:** `src/app/api/upload/route.ts`
- **Observed:** Anonymous POST accepted. Rate limit is 20/hour/IP but IP is trusted from `X-Forwarded-For`. Uploads land in the shared MinIO bucket under `uploads/*.webp` with predictable public URL via `/api/images/uploads/*`. No CAPTCHA, no session gate, no CSRF, no content moderation.
- **Expected:** Session-gated (customer or admin) and/or CSRF-protected.
- **Reproduction:** `multipart/form-data POST` any PNG/JPG → returns a permanent URL on the studio's domain.
- **Recommended fix:** Require either (a) an authenticated customer `auth()` session for booking-inspo uploads, or (b) `isAdminRequest()` for gallery/slider/note uploads. Tag each uploaded object with the uploader's userId/adminId for accountability. Additionally, move the IP-based rate limit behind a real-IP source you control (see *P1 — Trustworthy client IP*).

### [P0] Admin password in plaintext env + shared in chat
- **Area:** Security / Credentials
- **Location:** `src/app/api/admin/auth/route.ts:14`; operational.
- **Observed:** `ADMIN_PASSWORD` is stored as plaintext in the environment and compared directly with `password.trim() !== adminPassword.trim()`. The actual production password was shared in plaintext in the dev chat during this audit. Additionally there is no username, no 2FA, no lockout, no CAPTCHA.
- **Expected:** Hashed secret (bcrypt/argon2) + constant-time compare + rate limit + optional TOTP/WebAuthn second factor.
- **Reproduction:** N/A (operational).
- **Recommended fix:**
  1. Rotate `ADMIN_PASSWORD` immediately.
  2. Replace the plaintext comparison with a bcrypt hash stored as `ADMIN_PASSWORD_HASH` and use `bcrypt.compare` (which is already a dependency) or `crypto.timingSafeEqual`.
  3. Apply `rateLimit()` to `POST /api/admin/auth` (e.g. 5 attempts / 15 min / IP).
  4. Consider switching to the `AdminUser` Prisma model that already exists (`prisma/schema.prisma:41-49`) so you can have multiple admins, individual rotation, and audit trails.
  5. Never share the current password over plaintext channels again — use a password manager share link.

---

## P1 — High

### [P1] `/sitemap.xml` returns HTTP 500 in production
- **Area:** SEO
- **Location:** `src/app/sitemap.ts:20-23`
- **Observed:** Live fetch returned `500 Internal Server Error`. Code path: `prisma.blogPost.findMany({ where: { published: true }, … })` is **not** wrapped in try/catch (only the services query is, at lines 10–17). Any Prisma exception (missing column, connection hiccup, or even an unpublished post with a null slug on legacy rows) blows up the whole sitemap.
- **Expected:** 200 OK with `<urlset>` body; `robots.txt` already advertises the sitemap.
- **Reproduction:** `curl -i https://glitzandglamours.com/sitemap.xml` → `HTTP/1.1 500`.
- **Recommended fix:** Wrap the blogs query in a try/catch identical to the services one, and defensively filter nullish slugs:
  ```ts
  let posts: { slug: string | null; updatedAt: Date }[] = [];
  try {
      posts = await prisma.blogPost.findMany({
          where: { published: true, slug: { not: '' } },
          select: { slug: true, updatedAt: true },
      });
  } catch { posts = []; }
  const blogUrls = posts.filter(p => !!p.slug).map(p => ({ … }));
  ```
  Also add a deploy-time check: `curl -fsS /sitemap.xml` in CI.

### [P1] `/api/services` leaks raw VPS IP + port in image URLs
- **Area:** Security / Infra exposure
- **Location:** Data in Prisma `services.imageUrl` column; surfaced by `src/app/api/services/route.ts`.
- **Observed:** Live `/api/services` response includes many entries like `"imageUrl":"http://31.97.236.172:9000/glitz-images/uploads/..."`. This:
  - Publishes the MinIO host and port (`:9000`) on the public internet,
  - Uses plaintext HTTP (mixed-content error in browsers on HTTPS pages),
  - Defeats the `/api/images/[...path]` proxy that newer uploads already use.
- **Expected:** All image URLs should be relative, using the proxy, e.g. `/api/images/uploads/<key>.webp`.
- **Reproduction:** `curl https://glitzandglamours.com/api/services | jq '.services[].imageUrl' | grep 31.97`.
- **Recommended fix:**
  - Run a one-shot migration on the `services` table: `UPDATE services SET "imageUrl" = REPLACE("imageUrl", 'http://31.97.236.172:9000/glitz-images', '/api/images') WHERE "imageUrl" LIKE 'http://31.97.236.172%';`. Repeat for `slider_images`, `gallery_images`, `blog_posts`, `customer_notes`, `reviews` if applicable.
  - Block the raw IP at the reverse proxy / firewall so MinIO can only be reached from the Next.js app.

### [P1] `/api/chat` has no server-side rate limit (unbounded Groq billing)
- **Area:** Security / Cost
- **Location:** `src/app/api/chat/route.ts`
- **Observed:** Endpoint calls Groq on every POST. Only client-side "15 messages then localStorage flag" gate exists (`src/components/Chatbot.tsx:74`). Any attacker can `curl` in a loop and exhaust your Groq quota / run up an invoice.
- **Expected:** Server-side per-IP + per-session rate limit, identical in shape to `/api/bookings`.
- **Reproduction:** Loop `POST /api/chat` with a trivial `messages` payload → unbounded Groq fan-out.
- **Recommended fix:**
  ```ts
  const rl = rateLimit(getClientIp(req), 'chat', { limit: 30, windowMs: 60 * 60 * 1000 });
  if (!rl.ok) return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: { 'Retry-After': String(Math.ceil((rl.resetAt - Date.now()) / 1000)) } });
  ```
  Additionally: hard-cap `messages.length` (currently unbounded) and total token count before forwarding to Groq.

### [P1] `/api/admin/auth` login has no rate limit / lockout
- **Area:** Security / Brute force
- **Location:** `src/app/api/admin/auth/route.ts`
- **Observed:** A one-password single-tenant admin with no rate limit = brute-force heaven. `rateLimit` util exists and is used elsewhere but not here.
- **Recommended fix:** Apply `rateLimit(ip, 'admin-login', { limit: 5, windowMs: 15 * 60 * 1000 })` at the top of `POST`. On exhaustion return 429. Also add a small constant-time delay on failure, and use `crypto.timingSafeEqual(Buffer.from(password.trim()), Buffer.from(adminPassword.trim()))` to defeat timing attacks.

### [P1] `/api/bookings` POST trusts client-supplied promo price
- **Area:** Security / Business logic
- **Location:** `src/app/api/bookings/route.ts:95`
- **Observed:** Payload includes `promoPrice` straight from the client JSON. If the April promo is time-bound or limited to certain services, a malicious client can pass any `isPromoBooking:true, promoPrice:1` and the booking record will accept it.
- **Expected:** Server should determine the active promo (or reject the flag) from DB / server-side config, not echo the client value.
- **Recommended fix:** Derive `isPromoBooking`/`promoPrice` from the selected service and current date. Drop both from the request body, or validate them with a hardcoded allowlist.

### [P1] `/api/images/[...path]` is an unauthenticated whole-bucket enumerator
- **Area:** Security / Data leak
- **Location:** `src/app/api/images/[...path]/route.ts`
- **Observed:** Takes any user-supplied path segments, joins with `/`, and fetches the corresponding object from MinIO. Nothing restricts access to `uploads/*` — a caller who guesses or discovers any key (e.g. `contracts/signing-<id>.pdf`) can retrieve it. Signed contract PDFs are uploaded here per `src/app/api/contracts/sign/[token]/route.ts:193`.
- **Expected:** Proxy should only serve a whitelisted prefix (e.g. `uploads/`) and require a session / signed URL for contract PDFs.
- **Reproduction:** `curl https://glitzandglamours.com/api/images/contracts/signing-<anyInviteId>.pdf` would return a signed contract if guessed.
- **Recommended fix:**
  ```ts
  const allowedPrefixes = ['uploads/', 'slider/', 'gallery/'];
  if (!allowedPrefixes.some(p => key.startsWith(p))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  ```
  For contracts, switch to a short-lived signed URL minted by `/api/admin/contracts/[id]/pdf` and drop the public proxy for that prefix entirely.

### [P1] No `error.tsx` / `global-error.tsx` / `not-found.tsx` in the whole app
- **Area:** Code / UX
- **Location:** `src/app/**` — confirmed no `error.tsx`, `global-error.tsx`, or `not-found.tsx` exist.
- **Observed:** Any runtime error (like the broken sitemap or a DB blip on `/card`) falls through to Next.js' default error page, with zero branding and no guidance.
- **Expected:** Branded `error.tsx` and `not-found.tsx` with a link back to `/` and a "try again" button, plus a `global-error.tsx` for RootLayout-level failures.
- **Recommended fix:** Add three files:
  - `src/app/error.tsx` — route-level error boundary (must be a Client Component, accepts `{ error, reset }`).
  - `src/app/global-error.tsx` — must render `<html><body>` + an error UI.
  - `src/app/not-found.tsx` — 404 page with internal links.

### [P1] Admin password comparison is timing-attack vulnerable
- **Area:** Security
- **Location:** `src/app/api/admin/auth/route.ts:21`
- **Observed:** `password.trim() !== adminPassword.trim()` uses JS string comparison that short-circuits. In theory leaks one character at a time.
- **Recommended fix:** Use `crypto.timingSafeEqual(Buffer.from(input), Buffer.from(expected))` after length-padding, and move to a hashed comparison (see P0 on credentials).

### [P1] Client IP is trusted from `X-Forwarded-For` without proxy allowlist
- **Area:** Security / Rate limiting
- **Location:** `src/lib/rateLimit.ts:63-69`
- **Observed:** `getClientIp` returns the first comma-separated value from `X-Forwarded-For`. If the reverse proxy (Nginx/Cloudflare) doesn't strip client-supplied headers, an attacker can bypass every rate-limited endpoint by rotating `X-Forwarded-For`.
- **Recommended fix:** On the VPS Nginx config, always set `X-Forwarded-For` / `X-Real-IP` to `$proxy_add_x_forwarded_for` or to the genuine remote address, and document that. In code, prefer the trusted header your proxy sets (e.g. `cf-connecting-ip` on Cloudflare) over `X-Forwarded-For` if Cloudflare is in front.

### [P1] In-memory rate limiter is per-instance
- **Area:** Perf / Security
- **Location:** `src/lib/rateLimit.ts:31`
- **Observed:** `Map` lives in module memory — on a scale-out or serverless deploy, each cold-start instance has its own counters. The file itself calls this out. Effective throughput = `limit × instance_count`.
- **Recommended fix:** If/when the app scales beyond a single VPS, swap for Upstash Ratelimit or Redis. Acceptable today on a single VPS.

### [P1] NextAuth config says it protects `/admin` but the real gate is a separate middleware
- **Area:** Code / Security architecture
- **Location:** `src/auth.config.ts:27-44` vs `src/middleware.ts`
- **Observed:** `authConfig.authorized` has code to redirect non-`ADMIN` sessions away from `/admin`, but `src/middleware.ts` uses a completely different admin-session JWT check and does not consult NextAuth at all. The `ADMIN` role in the NextAuth JWT is set via a provider called `'admin-credentials'` that doesn't exist anywhere in the codebase — confirming this branch is dead code.
- **Expected:** One truth. Either migrate `/admin` under NextAuth or delete the NextAuth admin branches.
- **Recommended fix:** Remove the `/admin` branches from `auth.config.ts`'s `authorized` callback and the `admin-credentials` provider branch in `auth.ts:89` / `auth.config.ts:53-55`. Document that `/admin` auth lives in `src/middleware.ts` + `src/lib/adminAuth.ts`.

### [P1] Signup password policy is minimal
- **Area:** Security / Auth
- **Location:** `src/app/api/auth/signup/route.ts:36`
- **Observed:** Only enforces `password.length >= 8` — no complexity, no common-password denylist, no breach-check. Also no server-side email format validation (regex is only done in `/api/contact`).
- **Recommended fix:** Add a simple zxcvbn or custom strength check (min 8, at least one digit, disallow top 1000 common passwords). Validate email with the same regex used in `/api/contact`. Consider using a shared `validate.ts` with Zod schemas for all POST bodies (no Zod is currently in `package.json`).

### [P1] Missing indexes on hot Prisma query columns
- **Area:** Data / Performance
- **Location:** `prisma/schema.prisma`
- **Observed:** Several columns are filtered / ordered on without an index:
  - `Booking.userId`, `Booking.serviceId`, `Booking.status`, `Booking.preferredDate` (listing pages filter by these)
  - `Review.userId`, `Review.bookingId` (already unique on `bookingId`, but non-unique reads on `userId` have no index)
  - `Stamp.loyaltyCardId`, `Stamp.bookingId`
  - `CustomerNote.userId`
  - `Referral.referrerId`, `Referral.referredUserId`
  - `ChatConversation.userId`
- **Recommended fix:** Add `@@index([...])` for each. Sample:
  ```prisma
  model Booking {
    …
    @@index([userId])
    @@index([status])
    @@index([preferredDate])
    @@index([serviceId])
  }
  ```
  Keep the migration small and deploy during a low-traffic window.

### [P1] Orphan rows risk: FKs without `onDelete` cascade
- **Area:** Data
- **Location:** `prisma/schema.prisma` — most relations use the default `Restrict`.
- **Observed:** `ReviewToken → Booking`, `DiscountCode → Booking`, `NotificationLog → Booking`, `Review → Booking`, `Stamp → LoyaltyCard`, `Referral → LoyaltyCard`, `LoyaltyCard → User`, `Booking → User` all use default `NoAction`. The admin `/api/admin/customers` DELETE handler manually deletes in a transaction to compensate, but any other path (e.g. Prisma Studio, DB cleanup scripts) will hit FK errors.
- **Recommended fix:** Decide per-relation — either set `onDelete: Cascade` (for dependent records like `Stamp`, `Referral`, `NotificationLog`, `ReviewToken`, `DiscountCode`) or `onDelete: SetNull` (for soft unlink like `Booking.userId`). Current deletion code in `src/app/api/admin/customers/route.ts:234-255` can then be simplified.

### [P1] `react-hooks/set-state-in-effect` in 8 components (cascading renders)
- **Area:** Code quality / Perf
- **Location:**
  - `src/app/card/page.tsx:445`
  - `src/app/leave-review/[token]/page.tsx:195`
  - `src/app/leave-review/guest/[token]/page.tsx:88,92`
  - `src/app/sign/[token]/ContractSignForm.tsx:176`
  - `src/app/sign/[token]/SpecialEventSignWizard.tsx:315,396`
  - `src/components/PageTransition.tsx:16`
  - `src/components/admin/AnalyticsSection.tsx:132`
  - `src/lib/i18n.tsx:45`
- **Observed:** React 19 surfaces these as errors (`react-hooks/set-state-in-effect`). Each calls `setState(...)` directly inside `useEffect` body, triggering a re-render cycle.
- **Recommended fix:** Either derive the value with `useMemo`, use `useSyncExternalStore` for external subscriptions, or move the state update into a proper event handler / deferred task. The `/card/page.tsx` banner case is the simplest — replace with `const showBookedBanner = useMemo(() => searchParams.get('booked') === '1', [searchParams]);`.

### [P1] `PageTracker.tsx` calls `Date.now()` during render (impure component)
- **Area:** Code quality
- **Location:** `src/components/PageTracker.tsx:31`
- **Observed:** `const entryTimeRef = useRef<number>(Date.now());` — `Date.now()` is called every render, not just first mount. React 19's `react-hooks/purity` rule flags this as impure and unpredictable.
- **Recommended fix:** Initialize inside a `useEffect(() => { entryTimeRef.current = Date.now(); }, [pathname])` or use a lazy initializer pattern on a state value.

### [P1] Admin listing API returns bcrypt password hashes
- **Area:** Security / Defense in depth
- **Location:** `src/app/api/admin/customers/route.ts:40` (`password: true` in `select`)
- **Observed:** The admin UI fetches customer records including the `password` column (bcrypt hash). The hash never gets displayed, so this is gratuitous data disclosure if the admin cookie is ever MITM'd or the admin UI has any XSS.
- **Recommended fix:** Remove `password: true` from the `select`; replace with a derived `hasPassword: !!user.password` if the UI needs to know whether the customer can log in with email/password.

---

## P2 — Medium

### [P2] `/api/contact` silently succeeds without sending anything
- **Area:** Code / Functional
- **Location:** `src/app/api/contact/route.ts:58`
- **Observed:** After validation, handler returns `{ success: true }` without calling `sendEmail`, Resend, or persisting to DB. Any contact form submission is dropped on the floor.
- **Recommended fix:** Either wire it to Resend (`sendContactMessage(body)`) or remove the form. At minimum log to DB in a `ContactMessage` Prisma model so messages aren't lost.

### [P2] `/api/profile` PATCH accepts any date-of-birth, incl. future dates
- **Area:** Code / Validation
- **Location:** `src/app/api/profile/route.ts:34-38`
- **Observed:** Only `isNaN(dob.getTime())` is checked. Future dates, year 1900, age 4 all pass.
- **Recommended fix:** Require `dobDate < new Date()` and `ageYears between 13 and 120`, same as signup.

### [P2] `/api/bookings` date validation is a string passthrough
- **Area:** Code / Validation
- **Location:** `src/app/api/bookings/route.ts:36,88`
- **Observed:** `preferredDate` is stored as raw String (per schema line 87). No format check, no "must be in the future" check, no max-forward-window. Junk data can land in the bookings table.
- **Recommended fix:** Parse to `Date`, require ISO `YYYY-MM-DD`, reject past dates and anything >180 days out.

### [P2] Blog renders `dangerouslySetInnerHTML` without sanitization
- **Area:** Security / XSS
- **Location:** `src/app/blogs/[slug]/page.tsx:421`
- **Observed:** `blog.content` is rendered raw after a small cover-image strip. Blog content is admin-authored, so stored XSS is attacker-requires-admin, but (a) admin auth can be compromised via the P0 above, (b) a tired admin pasting rich text from Word may inject `<script>`, and (c) imported content (e.g. the "Health Intake Form Script" task you saw in `/api/tasks`) sometimes contains script-heavy HTML.
- **Recommended fix:** Sanitize via `isomorphic-dompurify` on render (or on save). Same fix applies to `src/app/admin/blogs/BlogEditor.tsx:226` (preview only — lower risk) and `src/app/noremail/page.tsx:216` (if that surface is ever shown to non-admins).

### [P2] Most pages lack unique `<title>` / `<meta description>`
- **Area:** SEO
- **Location:** `src/app/**/page.tsx` — only `src/app/blogs/[slug]/page.tsx` and `src/app/services/[slug]/page.tsx` export `generateMetadata`. Everything else inherits the root title "Glitz & Glamour Studio | Nails, Hair & Beauty in Vista, CA".
- **Observed:** `/book`, `/gallery`, `/reviews`, `/faq`, `/terms`, `/privacy`, `/policy`, `/waiver`, `/sign-in`, `/blogs`, `/services` (list) all share the same `<title>` and no descriptions. Verified live — `WebFetch` of `/book`, `/gallery`, `/reviews` etc. returned the root title.
- **Recommended fix:** Add per-route `export const metadata: Metadata = { … }` with page-specific title, description, and OG image. Google/Bing will index them separately.

### [P2] Pages return a near-empty HTML shell (heavy CSR)
- **Area:** Perf / SEO
- **Location:** `src/app/page.tsx`, `src/components/HomeClient.tsx`, most client components in `src/app/**/page.tsx`.
- **Observed:** A raw `curl` of `/`, `/services`, `/book`, `/gallery`, etc. returns only the global chrome (chatbot teaser, title) — the meaningful content is rendered client-side by React after hydration. This hurts LCP, crawlability (Google can JS-render, but spends crawl budget), and breaks plain-text scrapers / AI agents.
- **Recommended fix:** Convert at least the top-fold of `/`, `/services`, `/book`, `/blogs` to Server Components that read from Prisma directly. Keep interactive parts in child Client Components. The `/api/services` call used by the homepage can be replaced with a direct `prisma.service.findMany({ where: { isActive: true } })` in a server component.

### [P2] Root BeautySalon JSON-LD has empty `telephone`
- **Area:** SEO / Local SEO
- **Location:** `src/app/layout.tsx:64`
- **Observed:** `"telephone": ""` — Google Business and rich results won't show a phone from this JSON-LD.
- **Recommended fix:** Fill in `+17602905910`. Also consider setting `"openingHours"`, `"aggregateRating"` (pulled from Review count/avg), and a `sameAs` entry for TikTok / Facebook if used.

### [P2] Chatbot "exhausted" rate limit is client-only
- **Area:** Security / Cost
- **Location:** `src/components/Chatbot.tsx:74`
- **Observed:** 15-message limit is enforced in localStorage — trivially bypassable by calling the API directly. Pairs with `/api/chat` having no server limit (see P1).
- **Recommended fix:** Move enforcement to the server (per-IP + per-session Prisma-backed counter) and keep client copy just for UX.

### [P2] Hardcoded Google Analytics ID + no consent gating
- **Area:** Privacy / Code
- **Location:** `src/app/layout.tsx:16`
- **Observed:** `const GA_ID = 'G-4VMS8GSC0P';` fires `gtag` on every page with no cookie-consent gate. California (where the business operates) requires CCPA disclosures; EU visitors are not gated at all.
- **Recommended fix:** Move `GA_ID` to `NEXT_PUBLIC_GA_ID`. Wrap the `Script` tags in a client-side cookie consent flow, or at minimum respect a "Do Not Track" signal. Link `/privacy` already states data capture — mention GA explicitly.

### [P2] ESLint config doesn't ignore `.claude/worktrees/**`
- **Area:** DX / Noise
- **Location:** `eslint.config.mjs:10-15`
- **Observed:** `npm run lint` emits ~10,000 lines of noise from `.claude/worktrees/lucid-borg/.next/**`. The current `globalIgnores` only covers top-level `.next/**`, `out/**`, `build/**`. The real lint output is buried.
- **Recommended fix:** Add `'.claude/**'` and `'**/.next/**'` (with leading glob) to `globalIgnores` so nested build artifacts are ignored.

### [P2] `any` sprinkled across hot paths (145 lint errors)
- **Area:** Code quality
- **Location:** `src/lib/discountCodes.ts`, `src/lib/reviewTokens.ts`, `src/lib/wallet.ts`, `src/lib/applePush.ts`, `src/auth.ts:63,111,112`, many `src/app/api/**` routes.
- **Observed:** Most `any`s are used to dodge incomplete Prisma types on models added after `prisma generate` (customerNote, referral, task, reviewToken). Real bug surface: a typo in a property name survives.
- **Recommended fix:** Run `npx prisma generate` on CI, then replace `(prisma as any).task` with `prisma.task`. For the `session.user as any` assertions in `auth.ts`, extend the NextAuth module types via `src/types/next-auth.d.ts`.

### [P2] 60+ `<img>` usages instead of `next/image`
- **Area:** Perf
- **Location:** Homepage, blogs list, blog detail, card, book, admin customers/bookings/calendar, PWAInstallPrompt, Chatbot, etc.
- **Observed:** Lint (`@next/next/no-img-element`) flags every one. Effects: no automatic lazy-loading, no AVIF/WebP negotiation, no preloading for LCP, no `<Image priority>` control.
- **Recommended fix:** Migrate at least the LCP-critical images on `/` and `/services/[slug]` to `next/image`. Configure `next.config.ts`'s `images.remotePatterns` (already present) and drop the `http://31.97.236.172` entry after the image-URL migration in P1.

### [P2] Booking schema models extras as comma-separated string
- **Area:** Data / Integrity
- **Location:** `prisma/schema.prisma:86`, `src/app/api/bookings/route.ts:87`
- **Observed:** `additionalServiceIds String?  // comma-separated extra service IDs`. Loses FK integrity; if a Service is renamed/deleted, this silently points to nothing. Also impossible to index/query.
- **Recommended fix:** Introduce a `BookingService` join table with `(bookingId, serviceId)` composite PK, and migrate existing CSV rows. Low urgency if service catalog never prunes.

### [P2] `/card/page.tsx:290 stats` variable assigned but unused
- **Area:** Code quality
- **Location:** `src/app/card/page.tsx:290,295`
- **Observed:** A stats object is computed but never rendered. Dead code.
- **Recommended fix:** Either render it or delete.

### [P2] `PageTracker` duration is sent via `fetch` (not `navigator.sendBeacon`)
- **Area:** Perf
- **Location:** `src/components/PageTracker.tsx` (inferred)
- **Observed:** Normal fetch on unload is often cancelled by the browser; `sendBeacon` is designed for this exact case.
- **Recommended fix:** Use `navigator.sendBeacon('/api/analytics/view', JSON.stringify(payload))` inside a `visibilitychange === 'hidden'` listener.

### [P2] Public file `GGS Contract [FINAL] V1.html` at repo root (untracked in git status)
- **Area:** Code hygiene
- **Location:** repo root.
- **Observed:** 1 MB standalone HTML contract checked in at the top level. Not referenced by the app. Looks like a one-off test artifact.
- **Recommended fix:** Move to `src/contracts/templates/` if needed as a template, or delete. Currently gitignored by virtue of untracked status.

### [P2] `VPS_pass.pem` present in repo root
- **Area:** Security hygiene
- **Location:** Repo root; gitignored by `*.pem`.
- **Observed:** The file is in the working directory. `git ls-files` confirms it is NOT tracked, so no leak occurred — but having a VPS SSH key next to your code is a footgun (accidental `git add .` with a weaker gitignore could leak it).
- **Recommended fix:** Move the key out of the project directory entirely (e.g. to `~/.ssh/glitz_vps.pem`). Rotate it if there's any doubt.

### [P2] No Content-Security-Policy / security headers
- **Area:** Security
- **Location:** `next.config.ts`
- **Observed:** No `headers()` block. `X-Content-Type-Options`, `Strict-Transport-Security`, `Referrer-Policy`, `Permissions-Policy`, and CSP are all unset.
- **Recommended fix:** Add a conservative baseline:
  ```ts
  async headers() {
    return [
      { source: '/:path*', headers: [
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ]},
    ];
  }
  ```
  CSP is higher effort because of GA + Google Fonts + `dangerouslySetInnerHTML` JSON-LD; build up from `report-only` first.

---

## P3 — Nits / polish

### [P3] Admin pages lack `robots: 'noindex'` metadata
- **Area:** SEO
- **Location:** `src/app/admin/**/page.tsx`
- **Observed:** `robots.txt` disallows `/admin/`, but if Google ever sees an internal/external link to `/admin/bookings` it may index the URL (not the contents). A per-page `robots: 'noindex'` belt-and-braces closes this.

### [P3] `src/app/admin/customers/page.tsx` imports `Customer.password` into client state
- **Area:** Code quality
- **Location:** Line 28.
- **Observed:** Same finding as P1 on the API side, from the client-type angle. Drop the field in both places.

### [P3] Unused imports + dead code (126 lint warnings)
- **Area:** Code quality
- **Location:** Across `src/app/**` and `src/components/**`; full list in Appendix A.
- **Observed:** Examples: `Calendar`, `Award`, `User` imports never used on the homepage; `restBlogs`, `canvas`, `stats`, `err` variables assigned but never read.
- **Recommended fix:** Run `eslint --fix` across the repo; most of these are 1-line deletes.

### [P3] Unescaped apostrophes/quotes in JSX
- **Area:** Code quality
- **Location:** `src/app/book/page.tsx:319,698,709,831,874`, `src/app/services/page.tsx:75`, `src/app/reviews/page.tsx:185`, `src/app/blogs/[slug]/page.tsx:428`.
- **Observed:** Lint `react/no-unescaped-entities`. Cosmetic only — Next 15 stripped auto-escaping for `'` and `"` in JSX.
- **Recommended fix:** Replace with `&apos;` / `&quot;` or wrap in string braces.

### [P3] Empty `alt=""` on decorative images (this is correct)
- **Area:** A11y
- **Location:** `src/app/card/page.tsx:178,327`.
- **Observed:** `<img alt="" aria-hidden="true" … />` for decorative Hello Kitty silhouettes. Called out because decorative-empty-alt is correct but grep-unfriendly — just confirming.

### [P3] `prefers-reduced-motion` is not respected
- **Area:** A11y
- **Location:** Global CSS + framer-motion usages.
- **Observed:** No `@media (prefers-reduced-motion: reduce)` rule found in the repo. The page-transition, orb animations, popups, and framer transitions all play regardless of OS motion preference.
- **Recommended fix:** Add a global CSS block:
  ```css
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; scroll-behavior: auto !important; }
  }
  ```
  For framer-motion specifically, pass `useReducedMotion()` from `framer-motion` into `initial`/`animate`.

### [P3] `ImageLightbox` modal has no focus trap
- **Area:** A11y
- **Location:** `src/components/ImageLightbox.tsx`
- **Observed:** Keyboard handlers (Esc/Arrow keys) are wired, and body scroll is locked, but `Tab` can still move focus to elements behind the lightbox. No `role="dialog"` or `aria-modal`.
- **Recommended fix:** Use `focus-trap-react` or a small hand-rolled trap. Add `role="dialog" aria-modal="true" aria-label="Image viewer"` to the container. Same applies to `AprilPromoPopup`, `BirthdayModal`, and the Chatbot drawer.

### [P3] `next.config.ts` still allows `http://localhost` + `http://31.97.236.172` image hosts
- **Area:** Perf / Security
- **Location:** Lines 21-22.
- **Observed:** After the image-URL migration in P1, the raw-IP remote pattern is no longer needed.
- **Recommended fix:** Remove those two entries once the DB rewrite is complete.

### [P3] `auth.config.ts` contains unused `isLoggedIn`
- **Area:** Code quality
- **Location:** Line 28.
- **Observed:** Dead variable. Lint-warn.

### [P3] Hardcoded owner personal text "JoJany Lavalle" in admin layout
- **Area:** Code
- **Location:** `src/app/admin/layout.tsx:89`.
- **Observed:** If ownership ever changes, you'll need a code deploy. Low priority.
- **Recommended fix:** Move to an env var or the `AdminUser.name` field of whoever's logged in.

---

## Appendix A — Build / lint / typecheck output

### TypeScript (`npx tsc --noEmit`)

**Result: 0 errors.** Clean compile.

### ESLint (`npx eslint src`)

**Result: 271 problems (145 errors, 126 warnings).** Full unfiltered output saved to `lint-src.txt` at repo root; a condensed per-file summary below.

```
src/app/api/noremail/route.ts                         1 err
src/app/api/profile/route.ts                          5 err, 1 warn
src/app/api/reviews/guest-token/route.ts              4 err, 1 warn
src/app/api/reviews/route.ts                          2 err
src/app/api/reviews/submit-token/route.ts             1 err, 1 warn
src/app/api/services/route.ts                         1 warn
src/app/api/tasks/[id]/route.ts                       4 err
src/app/api/tasks/route.ts                            2 err
src/app/api/upload/route.ts                           1 warn
src/app/blogs/BlogsClient.tsx                         1 warn (<img>)
src/app/blogs/[slug]/CommentsSection.tsx              1 warn (<img>)
src/app/blogs/[slug]/page.tsx                         1 err, 2 warn
src/app/blogs/page.tsx                                2 err, 2 warn
src/app/book/page.tsx                                 6 err (unescaped quotes), 1 warn
src/app/card/page.tsx                                 3 err (incl. set-state-in-effect), 8 warn (<img>)
src/app/leave-review/[token]/page.tsx                 1 err (set-state-in-effect)
src/app/leave-review/guest/[token]/page.tsx           2 err (set-state-in-effect)
src/app/noremail/page.tsx                             1 warn
src/app/page.tsx                                      1 err, 6 warn (<img>, unused)
src/app/profile/page.tsx                              1 warn
src/app/reviews/page.tsx                              1 err (unescaped)
src/app/services/[slug]/page.tsx                      1 err, 2 warn
src/app/services/page.tsx                             2 err
src/app/sign/[token]/ContractSignForm.tsx             1 err (set-state-in-effect), 1 warn
src/app/sign/[token]/SpecialEventSignWizard.tsx       2 err (set-state-in-effect), 1 warn
src/app/tasks/page.tsx                                3 warn
src/auth.config.ts                                    1 warn
src/auth.ts                                           3 err (any)
src/components/BirthdayModal.tsx                      2 warn
src/components/BottomNav.tsx                          1 warn
src/components/Chatbot.tsx                            2 warn
src/components/HomeClient.tsx                         1 err, 5 warn
src/components/ImageLightbox.tsx                      2 warn
src/components/OnboardingGuard.tsx                    2 err, 2 warn
src/components/PWAInstallPrompt.tsx                   1 warn
src/components/PageTracker.tsx                        1 err (Date.now during render)
src/components/PageTransition.tsx                     1 err (set-state-in-effect)
src/components/admin/AnalyticsSection.tsx             1 err (set-state-in-effect)
src/lib/applePush.ts                                  2 err (any)
src/lib/contracts/adminContractPayload.ts             2 warn
src/lib/contracts/buildPdf.ts                         1 err (prefer-const)
src/lib/contracts/renderFrozenContract.ts             3 warn
src/lib/contracts/submitSpecialEventSign.ts           1 err (prefer-const)
src/lib/contracts/validate.ts                         1 warn
src/lib/discountCodes.ts                              6 err (any)
src/lib/i18n.tsx                                      1 err (set-state-in-effect)
src/lib/reviewTokens.ts                               5 err (any)
src/lib/sms.ts                                        3 warn
src/lib/wallet.ts                                     1 err (any)
```

### Build (`npm run build`)

Not executed in this pass — build requires all production env vars to be present, and the key ones (`ADMIN_JWT_SECRET`, `DATABASE_URL`, `RESEND_API_KEY`, `PINGRAM_*`, `MINIO_*`, `GROQ_API_KEY`, `GOOGLE_*`) are sourced from `.env.local` which is not available in this QA context. `tsc --noEmit` passing is a strong proxy for build-time type correctness; a full `npm run build` should be run in CI on every push with a sanitized env file.

---

## Appendix B — Route inventory

### Public pages
```
/                           app/page.tsx                  heavy CSR, root metadata
/about                      app/about/page.tsx
/blogs                      app/blogs/page.tsx            no generateMetadata
/blogs/[slug]               app/blogs/[slug]/page.tsx     has generateMetadata, JSON-LD
/book                       app/book/page.tsx
/card                       app/card/page.tsx             session-gated in-page
/faq                        app/faq/page.tsx
/gallery                    app/gallery/page.tsx
/policy                     app/policy/page.tsx
/privacy                    app/privacy/page.tsx
/reviews                    app/reviews/page.tsx
/services                   app/services/page.tsx
/services/[slug]            app/services/[slug]/page.tsx  has generateMetadata, JSON-LD
/sign-in                    app/sign-in/page.tsx
/sign-up                    app/sign-up/page.tsx
/sign-up/verify             app/sign-up/verify/page.tsx
/special-events             app/special-events/page.tsx
/terms                      app/terms/page.tsx
/waiver                     app/waiver/page.tsx
/sitemap.xml                app/sitemap.ts               🔴 500 in prod
/casestudy                  rewrite → /casestudy.html
```

### Customer-session pages (in-page auth)
```
/profile                    app/profile/page.tsx
/noremail                   app/noremail/page.tsx
/leave-review/[token]       token-gated
/leave-review/guest/[token] token-gated
/sign/[token]               contract token-gated
/tasks                      app/tasks/page.tsx           🔴 UI consumer of public /api/tasks
```

### Admin pages (middleware-gated)
```
/admin                      dashboard
/admin/login
/admin/bookings
/admin/calendar
/admin/customers
/admin/blogs
/admin/blogs/new
/admin/blogs/[id]
/admin/blogs/analytics
/admin/reviews
/admin/codes
/admin/contracts
/admin/chats
/admin/notifications
/admin/slider
/admin/gallery
/admin/wallet
/admin/manage
```

### Public API
```
GET    /api/services                          ⚠ leaks VPS IP
POST   /api/bookings                          ⚠ client-trusted promo price
GET    /api/bookings                          (auth)
POST   /api/chat                              🔴 no rate limit
POST   /api/contact                           ⚠ silent drop
POST   /api/auth/signup                       rate-limited
POST   /api/auth/verify-email                 (review)
…      /api/auth/[...nextauth]                NextAuth handlers
GET    /api/profile                           (auth)
PATCH  /api/profile                           (auth)
DELETE /api/profile                           (auth)
POST   /api/upload                            🔴 unauthenticated
GET    /api/images/[...path]                  🔴 whole-bucket enumerator
GET    /api/reviews                           (public list)
POST   /api/reviews                           token-gated
POST   /api/reviews/guest-token               admin?
POST   /api/reviews/submit-token              token-gated
GET    /api/contracts/sign/[token]            token-gated
POST   /api/contracts/sign/[token]            token-gated
GET    /api/tasks                             🔴 UNAUTH
POST   /api/tasks                             🔴 UNAUTH
PATCH  /api/tasks/[id]                        🔴 UNAUTH
DELETE /api/tasks/[id]                        🔴 UNAUTH
…      /api/apple-wallet/v1/*                 Apple-signed device registration
```

### Admin API (`isAdminRequest`-gated)
```
POST   /api/admin/auth                        login
DELETE /api/admin/auth                        logout
GET/POST/DELETE /api/admin/customers
POST   /api/admin/customers/note-image
GET/POST/DELETE /api/admin/customers/[id]/notes
GET/POST         /api/admin/bookings
POST             /api/admin/bookings/staff-log
GET              /api/admin/bookings/staff-log-history
GET/POST/PUT/DELETE /api/admin/blogs
GET/PUT/DELETE      /api/admin/blogs/[id]
GET                 /api/admin/blogs/analytics
PUT                 /api/admin/blogs/seo
GET                 /api/admin/analytics
GET/POST/DELETE  /api/admin/services
GET/POST/DELETE  /api/admin/slider
GET/POST/DELETE  /api/admin/gallery
GET/POST         /api/admin/codes
GET              /api/admin/chats
GET              /api/admin/notifications
GET/POST/DELETE  /api/admin/contracts
GET/PUT/DELETE   /api/admin/contracts/[id]
GET              /api/admin/contracts/[id]/pdf
POST             /api/admin/contracts/[id]/send
POST             /api/admin/contracts/[id]/finalize
POST             /api/admin/wallet-push
POST             /api/admin/sync-reviews
```

Confirmed that every `/api/admin/*` file above imports `isAdminRequest`/`verifyAdminCookie` and invokes it at the top of every exported handler. The gatekeeper itself is compromised by the P0 "legacy plaintext cookie" finding.

---

## Appendix C — Follow-ups requiring live admin login

These items were **not** verified in this QA and should be re-tested once the password is rotated and a fresh admin session is available to the QA tooling:

1. **Admin UI end-to-end:** dashboard counters vs DB reality, booking status transitions (PENDING → CONFIRMED → COMPLETED → CANCELLED) with notification side-effects.
2. **Destructive confirmations:** delete customer, delete booking, delete blog, delete review, revoke insider, delete gallery/slider image — all should require a double confirm and surface a success/failure toast.
3. **Contract lifecycle:** create → send → client signs on `/sign/[token]` → retainer → admin finalize. PDF generation via `puppeteer-core` on the VPS (check `CHROME_PATH` env var is set).
4. **Apple Wallet push:** issuing a stamp should fire `pushAppleWalletUpdate()` and an installed pass should refresh on the phone within a minute.
5. **Google Wallet:** verify `GOOGLE_PRIVATE_KEY` / `GOOGLE_ISSUER_ID` path — does tapping "Add to Google Wallet" on `/card` generate a valid link?
6. **SMS delivery:** Pingram production plan — booking SMS, cancellation SMS, review-link SMS, all observable in Pingram dashboard.
7. **Email delivery:** Resend production — booking-received, booking-confirmed, verification email, review invite.
8. **PWA install & offline:** `next-pwa` service worker strategy (runtime caching for `/api/images/*`, `/` shell, etc.). Test on iOS Safari and Android Chrome.
9. **Robots/sitemap/indexing:** once P1 sitemap is fixed, submit in Google Search Console and verify indexing coverage.
10. **Lighthouse/PageSpeed on mobile** for `/`, `/services`, `/book`, `/card` — focus on LCP, INP, CLS.
11. **Accessibility sweep with axe:** screen-reader run-through on `/book` form (the heaviest interactive surface), `/sign-in`, and `/card`.
12. **Load test** `/api/bookings` POST to validate the P1 rate-limit and confirm single-instance in-memory limiter is acceptable given current traffic.

---

*End of report.*
