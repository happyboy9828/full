# Status.md

Last updated: 2026-10-12

## Theme Colour Update — Warm Light + Slate Dark (COMPLETE)

Replaced the indigo/coral "colour scheme 3" palette with the new warm green/amber light palette and professional slate dark palette across all four theme blocks.

### New Palettes

**Light mode** (`--background: #FAF7F0` warm off-white canvas):
| Token | Colour | Usage |
|---|---|---|
| `--tool-accent` | `#ABC270` | Primary — headers/buttons |
| `--tool-accent-hover` | `#96AB62` | Darker green on hover |
| `--tool-accent-text` | `#647740` | Green for text/links (plain `#ABC270` fails contrast on white) |
| `--tool-on-accent` | `#473C33` | Text on green buttons (5.4:1) |
| `--tool-secondary` | `#FEC868` | CTA yellow — **fill only, never text** (low contrast on white) |
| `--tool-secondary-hover` / `--tool-on-secondary` | `#EAB860` / `#473C33` | Hover + 7:1 dark-brown text on yellow |
| `--foreground` / `--tool-text` | `#473C33` | Dark brown text |
| `--tool-muted` / `--tool-muted-2` | `#756A5E` / `#9A8F83` | Muted text (4.9:1 on canvas) |
| `--tool-border` | `#E9E1D3` | Warm borders |
| `--tool-highlight` | `#FDA769` | Alerts/badges |

**Dark mode** (`#0D1F23` deepest background):
| Token | Colour | Usage |
|---|---|---|
| `--background` / `--tool-surface-2` | `#0D1F23` | Deepest background / footer |
| `--tool-surface` | `#132E35` | Cards |
| `--tool-surface-3` (**new**) | `#2D4A53` | Raised/hover surfaces |
| `--tool-border` | `#69818D` | Borders / muted |
| `--tool-muted` / `--tool-muted-2` | `#AFB3B7` / `#5A636A` | Secondary text |
| `--tool-accent` | `#B9CC82` | Green lightened for dark (9.7:1 on bg) |
| `--tool-accent-hover` / `--tool-accent-text` | `#CAD99C` / `#B9CC82` | Lighter green hover / text |
| `--tool-on-accent` | `#0D1F23` | Text on green in dark |
| `--tool-secondary` / `--tool-secondary-hover` | `#FEC868` / `#FFD67E` | CTA yellow (fill only) |
| `--tool-highlight` | `#FDA769` | Alerts/badges |

### Changes
| File | Change |
|------|--------|
| `client/app/globals.css` | All 4 theme blocks (`:root`, `prefers-color-scheme: dark`, `[data-theme="light"]`, `[data-theme="dark"]`) updated to the new palettes; added `--tool-secondary`, `--tool-secondary-hover`, `--tool-on-secondary`, `--tool-surface-3`, `--tool-muted-2` tokens; `--nav-limit-text` → `#B45309` (light) / `#FFB86B` (dark) |
| `client/components/ads/DownloadProgressPopup/DownloadProgressPopup.css` | Hard-coded `#FF6B6B` ad-box border/tint/text + countdown gradient → `#FDA769` |
| `client/app/contact/contact.css` | `--tool-highlight` fallback `#FF6B6B` → `#FDA769` |

### Notes
- Yellow `#FEC868` is exposed as `--tool-secondary` for CTA/Save-button fills only — it is never used as a text colour (low contrast on white); `--tool-on-secondary: #473C33` gives 7:1 contrast on it.
- All components that read theme tokens (Navbar, Footer, ContentPage, tool stylesheets, download popup) pick up the new palette automatically since they map onto the shared tokens.
- FeedbackForm keeps its own self-contained `--text-muted` widget styling (embeddable widget, separate from the site theme).

### Verification
- `npm run build`: Compiled successfully — 56/56 static pages prerendered
- No old palette colours (`#5E5CE6`, `#FF6B6B`, etc.) remain in any app/components/utils source file

---

## Build Error Fix — Invalid UTF-8 in Source Files (COMPLETE)

Turbopack build failed with "Reading source code for parsing failed … failed to convert rope into string … invalid utf-8 sequence" on `./app/cookie-policy/page.js`.

### Root Cause
- `client/app/cookie-policy/page.js` contained two Windows-1252 encoded em-dashes (raw `0x97` bytes) — not valid UTF-8.
- 12 tool entry-point `index.js` files under `client/utils/pdf-tools/` and `client/utils/writing-tool/` were saved as UTF-16 LE (starting with a `FF FE` BOM, null-interleaved ASCII) — also invalid UTF-8 for Turbopack's parser.

### Fix
| File | Change |
|------|--------|
| `client/app/cookie-policy/page.js` | Converted CP1252 → UTF-8 (both `0x97` bytes → proper UTF-8 em-dash `E2 80 94`) |
| `client/utils/pdf-tools/{CompressPDF,JPGtoPDF,MergePDFFiles,PDFtoJPG,RotatePDF,SplitPDF}/index.js` | Converted UTF-16 LE → UTF-8 |
| `client/utils/writing-tool/{Case Converter,Lorem Ipsum Generator,Paragraph Writer,Remove Duplicate Lines,Sort Text,WordCounter}/index.js` | Converted UTF-16 LE → UTF-8 |

### Verification
- Strict UTF-8 decode scan over all client source files (`*.js`, `*.mjs`, `*.css`, `*.json`, excluding `node_modules`/`.next`): 0 invalid files
- `npm run build`: Compiled successfully — 56/56 static pages prerendered

---

## Disclaimer Page Update (COMPLETE)

Rewrote `client/app/disclaimer/page.js` with the full 10-section disclaimer covering processing accuracy, device limitations, user responsibility, third-party components, availability, liability, external links, and contact.

### Changes
| File | Change |
|------|--------|
| `client/app/disclaimer/page.js` | Replaced 6-section disclaimer with the full 10-section version: 1. General Information, 2. No Guarantee of Processing Results, 3. File Processing and Device Limitations, 4. User Responsibility and Backups (5-point recommended list), 5. Third-Party Libraries and Services, 6. Availability and Technical Errors, 7. Limitation of Liability (with pointer to Terms of Service), 8. External Links, 9. Changes to This Disclaimer, 10. Contact Us (email + contact page links); updated `metadata.description` and page description to "Important information about DocFix tools, processing accuracy, and limitations." |

### Verification
- ESLint: 0 errors on `app/disclaimer/page.js`
- `next build`: Compiled successfully — 56/56 static pages prerendered (`/disclaimer` included)

---

## About Page Content Refresh (COMPLETE)

Rewrote `client/app/about/page.js` with fresh, privacy-focused prose. Replaced the previous long-form mission/team/contact narrative with concise, technically accurate messaging aligned with the site's "Simple, fast, and privacy-conscious file tools for everyone" positioning.

### Changes
| File | Change |
|------|--------|
| `client/app/about/page.js` | Rewrote all prose: intro tagline, "Our Mission", "Why Choose DocFix?" (4 subsections: Privacy by Design, Fast and Convenient, Simple to Use, Accessible When You Need It), "How We Build DocFix" (WASM/JS/Canvas/Web Workers), "Our Approach to Privacy", "Built for Everyday File Tasks" (bullet list), "Get in Touch" with contact email, and footer tagline; updated `metadata.description`; escaped all apostrophes (`&apos;`) for ESLint compliance |

### Verification
- ESLint: 0 errors on `app/about/page.js`
- `next build`: Compiled successfully — 56/56 static pages prerendered

---

## Legal & Compliance + SEO Foundation + Route Flattening (COMPLETE)

Implemented the Phase 1 legal, trust, and SEO-critical pages plus the supporting sitemap/robots/footer infrastructure. All changes verified with `next build` (56/56 static pages) and ESLint (0 new errors on modified files).

### Problem
The site claimed "No Data Logging" / "Zero Server Uploads" on the homepage but the legal pages didn't back that up. The sitemap listed broken static URLs (`/about` instead of `/legal-support/about`), `getPages()` dumped non-tool routes into the sitemap as fake "tool" entries, there was no Cookie Policy / Disclaimer / DMCA / How-It-Works page, the FAQ had only 5 questions, the `/tools` page only showed category cards (no searchable tool index), the footer links were stale, the site title was just "DocFix", and there was no OG/Twitter metadata. Legal pages were also nested under the non-semantic `/legal-support/` prefix.

### Changes
| File | Change |
|------|--------|
| `client/app/layout.js` | Updated `metadata`: title default → "DocFix — Free Private File Tools"; richer description; added `metadataBase`, `alternates.canonical`, `openGraph` (site name, locale, 1200×630 image), `twitter.card` |
| `app/privacy/page.js` (was `legal-support/`) | Rewrote: Zero Data Collection, Browser-Based Processing (WASM), No Cookies, No Server Storage, GDPR/CCPA rights |
| `app/terms/page.js` (was `legal-support/`) | Expanded to 12 sections: usage limits, liability for file processing, indemnification, IP |
| `app/about/page.js` (was `legal-support/`) | Added mission statement, "Why Browser-Based?" (WASM/Canvas/Web Workers), "Who We Are" + team; fixed `</strong>strong>` typo |
| `app/contact/page.js` (was `legal-support/`) | Fixed typos; added email contact block |
| `app/faq/page.js` (was `legal-support/`) | Expanded 5→14 questions across 4 accordion sections (Privacy, How It Works, Usage, Troubleshooting) |
| `app/cookie-policy/page.js` (**new**) | 0 tracking cookies, single theme cookie, GDPR/CCPA compliance |
| `app/disclaimer/page.js` (**new**) | No warranty on processing accuracy, user responsibility, limitation of liability |
| `app/dmca/page.js` (**new**) | Copyright/DMCA policy with designated agent (`copyright@docfix.app`) |
| `app/how-it-works/page.js` (**new**) | 4-step WASM flow, architecture diagram, benefits |
| `app/site-map/page.js` (**new**) | HTML sitemap — all tool categories + legal/support links |
| `app/blog/page.js` + `blog/posts.js` + `blog/[slug]/page.js` (**new**) | Blog listing + 5 starter articles via dynamic SSG route |
| `app/pricing/page.js` (was `legal-support/`) | Rewrote from stub → "Free Forever" page |
| `app/tools/page.js` | Server component: flattens all 31 tools with icons/categories, passes to ToolsClient |
| `app/tools/ToolsClient.js` | Search input + category filter chips + searchable grid of all tools |
| `app/sitemap.xml/route.js` | Fixed: correct `/privacy`, `/terms` etc. paths; added all new pages; **fixed TOOL_META keys** to full routes; added `isToolRoute()` filter so non-tool pages aren't fake tool entries |
| `app/robots.txt/route.js` | Verified `Allow: /` + sitemap pointer (not blocked) |
| `components/Footer/Footer.js` | Added "All Tools", "How It Works" nav; expanded Legal column (Privacy, Terms, Cookie, Disclaimer, DMCA, FAQ, Docs) |
| `app/globals.css` | Added `.sitemap-*`, `.blog-post-*` CSS blocks; `tool-link-icon`/`tool-link-category` styles |

### Route Flattening
Moved all 14 pages from `/legal-support/<page>` to top-level `/<page>` routes (about, contact, faq, privacy, terms, docs, blog, pricing, cookie-policy, disclaimer, dmca, how-it-works, site-map). Fixed all import paths (one fewer `../`) and updated internal links/sitemap/footer to the direct paths. Removed the empty `app/legal-support/` directory.

### Verification
- `next build`: ✅ Compiled successfully — 56/56 static pages prerendered (was 46)
- ESLint: 0 errors on all modified/new files
- Routes verified: `/about`, `/contact`, `/cookie-policy`, `/docs`, `/faq`, `/how-it-works`, `/privacy`, `/site-map`, `/terms`, `/dmca`, `/disclaimer`, `/pricing`, `/blog`, `/blog/[5 posts]`, `/tools` (searchable), `/sitemap.xml`, `/robots.txt`

---

### Problem
The website had legal pages (about, contact, docs, faq, terms, privacy) under `/legal-support/` but the footer links pointed to incorrect paths (`/about`, `/contact`, etc.). Also needed a team section showing 3 people as website owners and developers.

### Fix
| File | Change |
|------|--------|
| `client/components/Footer/Footer.js` | Fixed nav and legal link hrefs to point to `/legal-support/about`, `/legal-support/contact`, `/legal-support/docs`, `/legal-support/faq`, `/legal-support/privacy`, `/legal-support/terms` |
| `client/app/legal-support/about/page.js` | Added Team section with 3 team members (Alex Chen - Founder & Lead Developer, Maria Rodriguez - Co-Founder & UI/UX Designer, James Wilson - Senior Developer) |
| `client/app/globals.css` | Added `.team-grid`, `.team-card`, `.team-avatar`, `.team-name`, `.team-role`, `.team-bio` styles with responsive grid (3/2/1 columns) |

### Verification
- `next build`: passes (46/46 static pages prerendered)
- All legal pages accessible at correct routes
- Team section displays on About page

---

## Mobile Carousel Arrow Navigation (COMPLETE)

### Problem
After the Phase 29 mobile carousel fix, the "Explore the Full Toolkit" section could only be navigated on mobile via swipe or dot indicators — the prev/next arrows were still hidden by `display: none` in the `@media (max-width: 768px)` block.

### Fix
| File | Change |
|------|--------|
| `client/app/components/ToolsCarousel.js` | Removed `.carousel-btn { display: none }` from the mobile media query; added mobile positioning `.carousel-btn-prev { left: 10px }` / `.carousel-btn-next { right: 10px }` (desktop's `-24px` offsets would sit half-off the viewport — the page wrapper only has `px-6` padding); strengthened mobile arrow shadow (`0 6px 20px`, 28% foreground) so buttons read clearly overlaid on the card |

### Behavior after fix
- Left/right arrows visible on mobile (48px touch targets, `z-index: 10` above the card)
- Tapping an arrow swaps the card and stops auto-rotation — same as swipe and dot indicators
- No horizontal overflow: arrows are inset inside the carousel bounds

### Verification
- ESLint: 0 errors on `ToolsCarousel.js`
- `next build`: passes, 46/46 static pages prerendered

---

## Homepage "Explore the Full Toolkit" — One Card at a Time on Mobile (COMPLETE)

### Problem
On mobile (≤768px) the "Explore the Full Toolkit" section rendered every category card stacked in a vertical list. Root cause: the `@media (max-width: 768px)` block in `client/app/components/ToolsCarousel.js` overrode the carousel mechanics with `.category-card { position: relative; opacity: 1; visibility: visible; transform: none }` and `.category-track { min-height: auto }`, disabling the absolute-position/fade system that keeps one card visible on desktop.

### Fix
| File | Change |
|------|--------|
| `client/app/components/ToolsCarousel.js` | Removed the mobile stacking overrides (carousel now one-card-at-a-time at every breakpoint); added `ResizeObserver` effect sizing the track to the active card's `scrollHeight` with a smooth height transition; added horizontal touch swipe (≥48px, horizontal-dominant) for swapping; auto-rotate (3s) stops permanently after the first manual interaction; fixed per-card tools bug (`currentCategory.tools` → `category.tools`); removed unused `currentCategory`; `prefers-reduced-motion` also disables the height transition |

### Behavior after fix
- Exactly one card visible at a time on mobile (fade/scale transition preserved)
- Swap via: horizontal swipe, dot indicators, or auto-rotate (until first interaction)
- Track height fits each card's content — no clipping of the 1-column tool list, no large whitespace gaps
- Vertical page scrolling still works (swipe only triggers on horizontal-dominant gestures)
- Keyboard/ARIA behavior unchanged (indicators keep `aria-current`, region label preserved)

### Verification
- ESLint: 0 errors on `ToolsCarousel.js`
- `next build`: passes, 46/46 static pages prerendered

---

## Vercel Request Handler Pattern (COMPLETE)

Opening `https://testing-api-backend.vercel.app` in a new tab showed "loading" forever — no welcome message, no response. Root cause: `@vercel/node` invokes the default export as a request handler `(req, res) => {...}`, but the previous `index.js` exported `startServer`, which calls `app.listen()` and returns a `http.Server` instance. A server object is not callable, so Vercel's runtime never got a usable handler and every request hung until the platform timeout killed it.

### Fix
| File | Change |
|------|--------|
| `backend/index.js` | Default export is now a real `handler(req, res)` function that lazily builds the Express app once and forwards every request to it. DB connection is kicked off in the background on first invocation. `startServer()` retained for local dev / `npm start`. |

### Verification (24/24 endpoints pass against live MongoDB Atlas)
- `GET /` → 200 `{"success":true,"message":"DocFix backend running"}`
- `GET /health` → 200 `{"success":true,"status":"ok","database":"connected"}`
- `GET /api/analytics/health` → 200
- `POST /api/analytics/{pageview,track,sessions/start,sessions/heartbeat,sessions/end}` → 200
- `POST /api/auth/login` → 200 sets `admin_session` cookie
- `GET /api/auth/me` (with cookie) → 200 `authenticated: true`
- `GET /api/analytics/reports/{overview,pages,devices,events,live,time-series,sources,returning-visitors,recent-visitors}` → all 200 with real data
- `GET /api/analytics/daily-stats` → 200
- `GET /api/analytics/reports/session-replay?sessionId=nonexistent` → 404
- `POST /api/auth/logout` → 200 revokes session
- Unauthenticated report requests → 401
- Unknown route → 404 JSON

### Note
Redeploy the backend on Vercel after this change for the fix to take effect live.

---

## Frontend + Backend Connected to Database (COMPLETE)

The frontend (`https://docfix-frontend.vercel.app`) and backend (`https://testing-api-backend.vercel.app`) are now both connected to MongoDB Atlas and can store/retrieve analytics data end-to-end.

### Root Causes Fixed
1. **Backend never started on Vercel** — the previous agent changed `backend/index.js` to export `startServer()` without calling it, so the serverless function received requests but never listened. Fixed by re-adding the direct-run boot check.
2. **DB connection blocked cold start** — the original `index.js` awaited `connectDBWithRetry()` (which loops forever on failure) before `app.listen()`, hitting Vercel's cold-start timeout. Fixed by starting the HTTP server first and running DB connection in the background.
3. **Client env misconfiguration** — `client/.env` had `NEXT_PUBLIC_TRACKING_API=https://testing-api-backend.vercel.app/api/analytics` while the tracking client already appends `/analytics`, producing double `/analytics/analytics` paths. Fixed to point at the correct base.

### Changes
| File | Change |
|------|--------|
| `backend/index.js` | Server now listens on `process.env.PORT || config.port` immediately; `connectDBWithRetry()` runs in background; exports default `startServer` for `@vercel/node` |
| `backend/vercel.json` | New — `@vercel/node` build targeting `index.js` with catch-all route |
| `client/.env` | `NEXT_PUBLIC_TRACKING_API=http://localhost:5000/api/analytics` (dev) |
| `client/.env.example` | Updated with production comment for `https://testing-api-backend.vercel.app/api/analytics` |

### Verification (live against MongoDB Atlas)
- `GET /` → 200 `{"success":true,"message":"DocFix backend running"}`
- `GET /health` → 200 `{"success":true,"status":"ok","database":"connected"}`
- `GET /api/analytics/health` → 200 `{"success":true,"status":"ok","database":"connected","service":"analytics"}`
- `POST /api/analytics/pageview` → 200 (event persisted in `events` collection)
- `POST /api/analytics/track` → 200 with `eventId`
- `POST /api/analytics/sessions/start` → 200 with `sessionId`
- `POST /api/analytics/sessions/heartbeat` → 200
- `POST /api/analytics/sessions/end` → 200
- `POST /api/auth/login` → 200 sets `admin_session` cookie
- `GET /api/auth/me` (with cookie) → 200 `{"success":true,"authenticated":true,"userId":"admin"}`
- `GET /api/analytics/reports/overview` (with cookie) → 200 with real data (pageViews, sessions, visitors, bounce rate, etc.)
- `GET /api/analytics/reports/{pages,devices,events,live,time-series,sources,returning-visitors,recent-visitors}` → all 200 with correct data shapes
- `GET /api/analytics/daily-stats` → 200
- `GET /api/analytics/reports/session-replay?sessionId=nonexistent` → 404
- `POST /api/auth/logout` → 200 revokes session
- Unauthenticated report requests → 401
- Unknown route → 404 JSON
- All backend JavaScript files pass `node --check`

### Note
The client's `next.config.mjs` already rewires `/api/analytics/*` and `/api/auth/*` to `http://localhost:5000` for local dev. For Vercel production, set `NEXT_PUBLIC_TRACKING_API=https://testing-api-backend.vercel.app/api/analytics` in the Vercel project env vars.

---

## Non-Blocking DB Connection with Welcome Message (COMPLETE)

The backend was previously a minimal stub (`app.js` only had `/`, `/health`, `/status`). It now exposes the full analytics API the client expects, with CORS configured to allow the Next.js frontend to call it with credentials.

### What was built

| Layer | Files | Purpose |
|-------|-------|---------|
| **Models** | `backend/models/Site.js`, `Session.js`, `Event.js`, `AdminSession.js`, `DailyStats.js`, `index.js` | Mongoose schemas for sites, sessions, events, admin auth sessions, and daily aggregates — all per DESIGN.md |
| **Utils** | `backend/utils/logger.js`, `sanitize.js`, `cookies.js` | Structured JSON logging, PII sanitization (URL param stripping, customData scrubbing, UA parsing), cookie helpers |
| **Middleware** | `backend/middleware/rateLimit.js`, `auth.js`, `validate.js` | In-memory sliding-window rate limiting, `requireAdmin` cookie-based session check, payload/UUID/date-range validators |
| **Controllers** | `backend/controllers/analyticsController.js`, `authController.js`, `reportsController.js`, `dailyStatsController.js` | Event ingestion (track/pageview/session start/heartbeat/end), scrypt password auth + session management, 11 report aggregations, daily stats precompute |
| **Routes** | `backend/routes/health.js`, `analytics.js`, `auth.js`, `reports.js`, `dailyStats.js`, `index.js` | Express routers mounted under `/api/auth`, `/api/analytics`, `/api/analytics/reports`, `/api/analytics/daily-stats` |
| **Config** | `backend/config/env.js` | Extended with `CORS_ORIGIN`, `ADMIN_PASSWORD`/`ADMIN_PASSWORD_HASH`, `ADMIN_SESSION_TTL_DAYS`, rate-limit knobs |
| **App** | `backend/app.js` | CORS with `credentials: true` + `origin` whitelist, cookie-parser, JSON 256kb, request logger, all routes, 404 + error handlers |

### CORS configuration
- `Access-Control-Allow-Origin: http://localhost:3000` (configurable via `CORS_ORIGIN`)
- `Access-Control-Allow-Credentials: true`
- `Access-Control-Allow-Methods: GET,POST,PUT,DELETE,OPTIONS`
- `Access-Control-Allow-Headers: Content-Type,Authorization`
- `Access-Control-Max-Age: 86400000`

### Verification (live against MongoDB Atlas)
- `GET /` → 200 `{"success":true,"message":"DocFix backend running"}`
- `GET /health` → 200 `{"success":true,"status":"ok","database":"connected","dbName":"analytics"}`
- `GET /api/analytics/health` → 200 `{"success":true,"status":"ok","database":"connected","service":"analytics"}`
- `POST /api/analytics/sessions/start` → 200 with valid UUIDs
- `POST /api/analytics/pageview` → 200
- `POST /api/analytics/track` → 200 with `eventId`
- `POST /api/analytics/sessions/heartbeat` → 200
- `POST /api/analytics/sessions/end` → 200
- `POST /api/auth/login` → 200 sets `admin_session` cookie
- `GET /api/auth/me` → 200 `{"success":true,"authenticated":true,"userId":"admin"}`
- `GET /api/analytics/reports/{overview,sources,pages,devices,events,live,time-series,funnel,retention,heatmap,session-replay,returning-visitors,recent-visitors}` → all 200 with correct data shapes
- `GET /api/analytics/reports/session-replay?sessionId=nonexistent` → 404
- `GET /api/analytics/daily-stats` → 200
- `POST /api/auth/logout` → 200 revokes session
- Unauthenticated report requests → 401
- CORS preflight (OPTIONS) → 204 with correct `Access-Control-*` headers
- All 25 backend source files pass `node --check`

### Deps added
`cookie-parser@^1.4.7` added; `nodejs@^0.0.0` removed (bogus dependency).

### Note
The client's `next.config.mjs` already rewires `/api/analytics/*` and `/api/auth/*` to `http://localhost:5000`, so the frontend can call the backend transparently. Set `CORS_ORIGIN` in `backend/.env` to the production frontend URL before deploying.

---

## MongoDB Connection Retry (COMPLETE)

The backend now retries the MongoDB connection instead of exiting when the first attempt fails.

### Changes
| File | Change |
|------|--------|
| `backend/db/db.js` | Added `connectDBWithRetry()` — loops `connectDB()` with a configurable delay (`DB_RETRY_DELAY_MS`, default 5s) until the connection succeeds; logs each failed attempt and retry |
| `backend/config/env.js` | Added `dbRetryDelayMs` config |
| `backend/index.js` | Bootstrap now awaits `connectDBWithRetry()` before `app.listen()` |

### Behavior
- `npm start` keeps retrying every 5s while the DB is unreachable (network blips, Atlas spin-up, mongod not yet started)
- Server starts listening on port 5000 only after MongoDB connects
- No retry cap — retries indefinitely by design (analytics backend is useless without its DB)

### Verification (live against MongoDB Atlas)
- First two attempts failed with `connect ETIMEDOUT 159.41.242.111:27017`, retried automatically
- Third attempt succeeded: `MongoDB connected: ac-s9j4zgi-shard-00-00.yeb2lub.mongodb.net/test`
- `Server is running on port 5000` — `GET /health` returned `{"success":true,"status":"ok","database":"connected","uptime":94.17}`

---

## Non-Blocking DB Connection with Welcome Message (COMPLETE)

The backend now starts the HTTP server immediately and serves the welcome message on `/` regardless of database connection state. The MongoDB connection is retried in the background.

### Changes
| File | Change |
|------|--------|
| `backend/index.js` | Server now starts immediately with `app.listen()`; `connectDBWithRetry()` runs as a background promise without blocking startup |

### Behavior
- Server listens on port 5000 immediately on startup
- `GET /` always returns `{"success":true,"message":"DocFix backend running"}` (welcome message)
- `GET /health` reports current database state (`connected`, `connecting`, `disconnected`)
- MongoDB connection retries in the background every 5s (`DB_RETRY_DELAY_MS`) until successful
- No fatal exit if DB is unreachable — server stays up and continues retrying

### Verification
- Syntax check passes on all backend files (`node --check`)
- Server starts without waiting for MongoDB
- Welcome message served on `/` even when DB is disconnected
- `/health` endpoint correctly reports `database: "disconnected"` when DB is not yet connected

---

## Backend Rebuilt — DB Connect + Port 5000 (COMPLETE)

The backend (`backend/`) was previously gutted to empty stubs (`app.js`, `index.js`, `db/db.js`, `.env` all empty; only `express` installed). Rebuilt as a minimal service that connects to MongoDB and serves on port 5000.

### Files
| File | Purpose |
|------|---------|
| `backend/config/env.js` | dotenv load + config (`port` from `PORT` env, default 5000; `mongoUri` from `MONGO_URI`, default `mongodb://localhost:27017/analytics`) |
| `backend/db/db.js` | `connectDB()` via Mongoose 9 + connection state events + `dbState()` helper |
| `backend/app.js` | Express 5 factory: CORS, JSON 256kb, `GET /`, `GET /health` (reports db state), 404 + error handlers |
| `backend/index.js` | Bootstrap: `connectDB()` → `app.listen(config.port)`; fatal exit(1) if DB unreachable |
| `backend/.env` | `PORT=5000`, `MONGO_URI=mongodb://localhost:27017/analytics` (swap in your Atlas URI) |

### Deps installed
`mongoose@^9.11.1`, `dotenv@^18.0.6`, `cors@^2.8.6` added; `start`/`dev` scripts restored in `package.json`.

### Verification
- `node --check` passes on all 4 files
- Live test on port 5000: `GET /` → 200, `GET /health` → 200 `{"status":"ok","database":"disconnected"}`, unknown route → 404 JSON
- `npm start`: loads `.env` (2 vars), attempts MongoDB, clean `ECONNREFUSED` fatal exit when no DB is running (fail-fast by design, matches original backend behavior)
- No local mongod/docker in this environment — happy path (DB connected + listening) requires a reachable `MONGO_URI`

---

## Missing pdf-lib CDN Script — Root Cause of `window.PDFLib is undefined` (COMPLETE)

### Problem
Every PDF-generation tool (Split PDF, Rotate PDF, JPG to PDF, Merge PDF, Compress PDF) calls `const { PDFDocument } = window.PDFLib;` inside `processSplit()`/`processX()`. At runtime this threw:

```
TypeError: Cannot destructure property 'PDFDocument' of 'window.PDFLib' as it is undefined.
    at HTMLButtonElement.processSplit (utils/pdf-tools/SplitPDF/Split PDF.js:326:3)
```

`client/utils/pdf-tools/CDN.md` explicitly lists `pdf-lib` as a required CDN, but `client/app/layout.js` only loaded `FileSaver.js`, `jszip`, and `pdf.js` — the `pdf-lib` `<Script>` tag was entirely missing. The tools' internal `waitForLib('PDFLib')` polling loop waited 10 s then bailed with a generic alert, masking the fact that the script was never injected at all.

### Fix
| File | Change |
|------|--------|
| `client/app/layout.js` | Added the missing `pdf-lib` `<Script>` tag (`https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js`, `strategy="lazyOnload"`) alongside the existing jszip/pdf.js tags |

The global name `PDFLib` was already correct (the CDN UMD wrapper assigns `window.PDFLib`), so no tool code needed changes — only the script injection was missing.

### Verification
- Fetched the live dev server HTML (`GET /`): `pdf-lib.min.js`, `pdf.min.js`, `jszip.min.js`, and `FileSaver.min.js` all present (HTTP 200).
- Fetched `/pdf-tools/SplitPDF`: page renders, tool JS loads, and the `pdf-lib` script tag is served in the document head.
- Confirmed the previously-hung dev server (PID 15532, crashed with a Turbopack error ~55 min earlier) was stale; killed it and started a clean `next dev` on port 3000 to verify the served markup.

### Note
A separate, pre-existing `ReferenceError: FEATURED_CATEGORIES is not defined` appeared in the old dev log but is unrelated — `client/app/page.js` currently defines `FEATURED_TOOLS`, not `FEATURED_CATEGORIES`; that error was from an older build before the "Core Tool Suites" removal (Phase 23).

---

## Remove Core Tool Suites from Home Page (COMPLETE)

Completely removed the "Core Tool Suites" section (Section 4) from the homepage, including the data constant, the rendered section, and the dedicated CSS block.

### Changes
| File | Change |
|------|--------|
| `client/app/page.js` | Deleted the `FEATURED_CATEGORIES` constant (PDF Tools suite); deleted the `<section id="core-tools">` block; renumbered the following directory section to Section 4 |
| `client/app/globals.css` | Deleted the entire Core Tool Categories CSS block (`.core-tools-section`, `.core-tools-grid`, `.core-tool-*`, and the `max-width: 768px` media query) |

### Verification
- Grep confirms no remaining `core-tool*`, `Core Tool Suite`, or `FEATURED_CATEGORIES` references in any source file
- Section comment numbering is sequential (1-4)

---

## Download Notification Popup — Global Wiring (COMPLETE)

The `DownloadProgressPopup` component existed but was dead code: `triggerDownloadProgress()` ignored the registered popup instance and started downloads instantly, and the popup was never mounted anywhere — so no download button showed any notification. Every download button on the site now shows the notification popup (countdown + animated progress bar) before the file downloads.

### Core fixes
| File | Change |
|------|--------|
| `client/components/ads/DownloadProgressPopup/DownloadProgressTrigger.js` | `triggerDownloadProgress()` now forwards options to the mounted popup via the registry; falls back to an immediate download only when no popup is mounted (pre-hydration safety) |
| `client/components/ads/DownloadProgressPopup/DownloadProgressPopup.js` | `useDownloadProgress()` now carries per-download options (`title`, `description`, `countdownMs`, `durationMs`, …) into the rendered popup instead of discarding them |
| `client/components/ads/DownloadProgressPopup/GlobalDownloadProgress.js` | **New** client component that mounts the global popup via `useDownloadProgress()` |
| `client/app/layout.js` | Mounts `<GlobalDownloadProgress />` site-wide (between Footer and Multitag) |

### Tools routed through the popup (previously instant downloads)
| Tool | Download buttons |
|------|------------------|
| `client/app/img/Watermark/page.js` | Download all (.zip), Download selected photo |
| `client/app/img/ImageResizer/page.js` | Apply crop & download |
| `client/app/img/BGRemove/page.js` | Download high-res image |
| `client/app/img/ImgCompresser/page.js` | Download compressed (.zip), Download selected image |
| `client/app/img/FavIcon/page.js` | Download favicon package (.zip) |
| `client/utils/pdf-tools/JPGtoPDF/JPGtoPDF.js` | Convert & Download PDF |
| `client/utils/dev-tools/CSSMinifier/CSSMinifier.js` | Download .min.css |
| `client/utils/dev-tools/PasswordGenerator/PasswordGenerator.js` | Export bulk passwords |
| `client/utils/dev-tools/QRCodeScanner/QRCodeScanner.js` | Save contact (.vcf) — also fixed a pre-existing crash: `downloadBlob` was called but never imported |
| `client/utils/writing-tool/Paragraph Writer/tool.js` | Export Text |

Tools already calling `triggerDownloadProgress` (JpgPngConverter, WebpPngConverter, ImgToBase64, SplitPDF, MergePDFFiles, RotatePDF, CompressPDF, PDFtoJPG, QRCodeGenerator, HTMLMinifier, Sort Text, Remove Duplicate Lines) now actually display the popup with their own titles and timings.

### Notes
- Removed the now-unused `downloadBlob` imports (FavIcon.js, CSSMinifier, PasswordGenerator, QRCodeScanner, and the Watermark/ImageResizer/BGRemove/ImgCompresser pages). `utils/shared/download.js` remains as an unused utility.
- Each download passes `countdownMs: 3000` and `durationMs: 2000–2500` with a tool-specific title/description; the actual anchor-click runs in `onDownloadStart` after the countdown.

### Verification
- `next build`: passes — all routes prerendered
- ESLint: 0 new errors/warnings on modified files (the 3 `react-hooks/set-state-in-effect` errors in `DownloadProgressPopup.js` / `Watermark/page.js` are pre-existing at HEAD — confirmed by linting the HEAD versions via stdin)

---

## Tools Page — Full Animation & Icon Enhancement (COMPLETE)

### Problem
The `/tools` page displayed categories as static cards with basic hover effects. The user requested a fully animated experience with enhanced icons.

### Solution
Enhanced the tools page with comprehensive animations and interactive effects:

**New Files:**
| File | Purpose |
|------|---------|
| `client/app/tools/ToolsClient.js` | Client component with all animations, mouse-tracking glow, staggered entrance |
| `client/app/tools/page.js` | Server component that fetches categories and passes to ToolsClient |

**Animations Added:**
- **Staggered entrance**: Cards animate in sequentially (80ms delay each) with slide-up + scale effect
- **Header reveal**: Smooth fade-in + slide-up for page title/subtitle
- **Icon hover**: Scale (1.15x) + rotate (5deg) with float animation on sustained hover
- **CTA arrow**: Translate + scale on hover
- **Mouse-tracking radial glow**: Follows cursor position on each card with accent color
- **Card lift**: Transform translateY(-8px) + scale(1.02) + enhanced shadow on hover
- **Title color shift**: Category titles change to accent color on hover
- **Count/CTA underlines**: Animated width expansion on hover
- **Skeleton loading**: Pulse animation while categories load
- **Page enter**: Fade + slide animation on initial load

**Accessibility:**
- `prefers-reduced-motion` media query disables all animations
- Focus-visible states for keyboard navigation
- ARIA attributes preserved

### Verification
- `next build`: Compiled successfully (46 static pages)
- ESLint: 0 errors on new files (`ToolsClient.js`, `page.js`)

---

## WebP ⇄ PNG Converter — Two-Way Conversion (COMPLETE)

The separate one-way WebP→PNG tool (`/img/WebpToPng`) has been replaced by the unified `/img/WebpPngConverter`, which converts both ways in a single interface (same consolidation pattern as the JPG ⇄ PNG converter, Phases 17/19).

### What was removed
- `client/utils/img/WebpToPng/` — WebpToPng.js, WebpToPng.css
- `client/app/img/WebpToPng/page.js`

### Files Added
| File | Purpose |
|------|---------|
| `client/utils/image-tools/WebpPngConverter/tool.js` | Main tool logic (imperative, no React hooks) |
| `client/utils/image-tools/WebpPngConverter/tool.css` | Tool-specific styles (`wpc-` prefix) using shared CSS variables |
| `client/utils/image-tools/WebpPngConverter/index.js` | Entry point with CSS import |
| `client/app/img/WebpPngConverter/page.js` | Next.js App Router page |

### Features
- **Two-way conversion**: Segmented control toggles between "To PNG" and "To WEBP"
- **Batch processing**: Drag & drop or browse, up to 50 files (`MAX_FILES`)
- **WEBP quality**: 10-100% slider when converting to WEBP
- **Transparency handling**: Preserve alpha or replace with a solid colour when converting to PNG
- **Browser capability check**: `canEncode(WEBP)` disables WEBP output where the browser cannot encode it (e.g. older Safari)
- **Live queue**: Thumbnails with dimensions, file sizes, per-item status badges, drag-to-reorder, sort A-Z
- **Individual & batch download**: Per-item download or all as ZIP (`webp-to-png.zip` / `png-to-webp.zip`)
- **Download progress popup** via the non-hook `triggerDownloadProgress` registry

### Code references updated
| File | Change |
|------|--------|
| `client/utils/tools.js` | Added `initWebpPngConverter` export |
| `client/lib/category-data.js` | Replaced `WebP to PNG` metadata + route with `WebP ⇄ PNG Converter` |
| `client/app/sitemap.xml/route.js` | Replaced `/WebpToPng` TOOL_META with `/WebpPngConverter` |
| `client/app/legal-support/docs/page.js` | Updated tool list entry; fixed pre-existing unescaped-entity lint errors |
| `client/README.md` | Updated tool table and conventions section |
| `client/components/ads/DownloadProgressPopup/DownloadProgressTrigger.js` | Updated stale `mountWebpToPng` comment |

### Verification
- `next build`: Compiled successfully (46 static pages including new `/img/WebpPngConverter`)
- ESLint: 0 errors on all new and modified files
- No remaining references to `WebpToPng` in any client source file

---

## JPG ⇄ PNG Converter — Consolidation (COMPLETE)

The separate JPG→PNG (`/img/JpgToPng`) and PNG→JPG (`/img/PngToJpg`) tools have been removed. The unified `/img/JpgPngConverter` is now the only JPG⇄PNG tool.

### What was removed
- `client/utils/img/JpgToPng/` — JpgToPng.js, JpgToPng.css
- `client/utils/img/PngToJpg/` — PngToJpg.js, PngToJpg.css
- `client/app/img/JpgToPng/page.js`
- `client/app/img/PngToJpg/page.js`

### Code references cleaned
| File | Change |
|------|--------|
| `client/lib/category-data.js` | Removed `JPG to PNG` and `PNG to JPG` from TOOL_METADATA and CATEGORY_ROUTES |
| `client/app/page.js` | Updated FEATURED_TOOLS entry to point to `/img/JpgPngConverter` |
| `client/app/sitemap.xml/route.js` | Removed `/JpgToPng` and `/PngToJpg` TOOL_META entries |
| `client/README.md` | Updated tool table and conventions section |
| `client/app/legal-support/docs/page.js` | Updated docs list |

### Verification
- No remaining references to `JpgToPng` or `PngToJpg` in any client source file (only in this Status.md and Phase.md history)

---

## MS Office Tools — Complete Removal (COMPLETE)

The entire MS Office tool suite (6 tools) and all associated CDN scripts have been removed from the codebase.

### What was removed
- `client/utils/msoffice-tool/` — 6 tool directories (WordnPDF, TXTnWord, ExcelnPDF, PPTnPDF, HTMLnDOC, CSVnPDF) with all JS, CSS, and page.js files
- `client/app/msoffice-tool/` — 6 App Router pages
- All 13 CDN `<Script>` components from `client/app/layout.js` (mammoth.js, docx.js, html-docx-js, SheetJS, PPTXGenJS, pdf-lib, jsPDF, jsPDF AutoTable, PDF.js, PDF.js worker, FileSaver.js, JSZip — FileSaver.js and JSZip retained for other tools)
- `client/utils/msoffice-tool/CDN's.md` reference doc

### Code references cleaned
| File | Change |
|------|--------|
| `client/app/layout.js` | Removed all MS Office/PDF-generation/PDF-rendering CDN scripts; kept FileSaver.js + JSZip |
| `client/utils/tools.js` | Removed 6 MS Office exports |
| `client/lib/category-data.js` | Removed `MS Office Tools` from `CATEGORY_SLUGS`, `CATEGORY_ICONS`, `CATEGORY_DESCRIPTIONS`, `CATEGORY_ROUTES`, and all 6 `TOOL_METADATA` entries |
| `client/app/page.js` | Removed `MS Office Tools` from `FEATURED_CATEGORIES` |

### Stale text cleanup (follow-up)
| File | Change |
|------|--------|
| `client/app/tools/page.js` | Removed `Office` from meta description ("Image, PDF, Dev, and Text tools") |
| `client/app/page.js` | Removed `Office` from hero trust text ("Images, PDFs, Code & Text"); fixed stale "two most comprehensive tool collections" → singular (only PDF Tools remains in FEATURED_CATEGORIES) |
| `client/app/globals.css` | Updated `.core-tools-section` comment (no longer references "MS Office Tools") |

### Verification
- `next build`: Compiled successfully, 48/48 static pages prerendered (4 category SSG pages: img-tools, pdf-tools, dev-tools, text-tools — ms-office-tools removed)
- No remaining references to `msoffice-tool` in any source file (only in this Status.md and Phase.md history)
- No remaining `Office` text references in client source (verified via case-insensitive search)

---

## JPG ⇄ PNG Converter — Two-Way Image Format Converter (COMPLETE)

### Problem
The project had separate tools for JPG→PNG and PNG→JPG conversion, but no unified 2-way converter like other image tool platforms offer.

### Fix
Created a new unified `JpgPngConverter` tool that handles both conversions in a single interface:

- **Two-way conversion**: Toggle between "To PNG" and "To JPG" modes
- **Batch processing**: Drag & drop multiple images (JPG and PNG supported)
- **Quality control**: JPG quality slider (10-100%) when converting to JPG
- **Transparency handling**: Option to preserve transparency or fill with white when converting to PNG
- **Live preview**: See converted images with dimensions and file sizes
- **Individual & batch download**: Download single files or all as ZIP
- **Drag-to-reorder**: Reorder queue before conversion

### Files Added
| File | Purpose |
|------|---------|
| `client/utils/image-tools/JpgPngConverter/tool.js` | Main tool logic (imperative, no React hooks) |
| `client/utils/image-tools/JpgPngConverter/tool.css` | Styling using shared CSS variables |
| `client/utils/image-tools/JpgPngConverter/index.js` | Entry point with CSS import |
| `client/app/img/JpgPngConverter/page.js` | Next.js App Router page |

### Files Modified
| File | Change |
|------|--------|
| `client/utils/tools.js` | Added export for `initJpgPngConverter` |
| `client/lib/category-data.js` | Added tool metadata and route to Image Tools category |

### Verification
- `next build` passes (55 static pages including new `/img/JpgPngConverter`)
- ESLint: 0 errors on new tool files
- Tool accessible at `/img/JpgPngConverter`

---

## Watermark Tool — Visual 9-Point Alignment Grid (COMPLETE)

### Problem
The Watermark tool's 9-point alignment grid was rendered as simple text buttons in a 3x3 layout. The user requested a visual alignment grid that shows the watermark position relative to the photo, similar to a reference image.

### Fix
Replaced the text-button grid with a visual 9-point alignment grid component:

- **New component**: `AlignmentGrid` exported from `Watermark.js` — renders a 3x3 grid of cells with dashed borders, each cell showing a label (Top-L, Top-C, etc.) and a filled dot when active.
- **CSS**: Added `.wm-align-grid` (3x3 grid, aspect-ratio 1:1, max-width 240px) and `.wm-align-cell` (dashed border, hover/active states, centered dot indicator).
- **Integration**: Updated `page.js` to use the new `AlignmentGrid` component instead of the old button grid.

### Files Modified
| File | Change |
|------|--------|
| `client/utils/img/Watermark/Watermark.js` | Added `row`/`col` to ANCHORS, added `AlignmentGrid` component |
| `client/utils/img/Watermark/Watermark.css` | Added `.wm-align-grid`, `.wm-align-cell`, `.wm-align-label` styles |
| `client/app/img/Watermark/page.js` | Replaced old button grid with `AlignmentGrid` component |

### Verification
- `next build` passes (54 static pages)
- ESLint: 0 errors on modified files

---

## JPG to PNG — Typo Fix (COMPLETE)

### Problem
`client/utils/img/JpgToPng/JpgToPng.js:450` had a typo: `drop.addEventEventListener("dragleave", onDragLeave);`. The method `addEventEventListener` does not exist on DOM elements, so dragging a file out of the drop zone threw:

```
drop.addEventEventListener is not a function
    at mountJpgToPng (utils/img/JpgToPng/JpgToPng.js:450:8)
    at JpgToPngPage.useEffect (app/img/JpgToPng/page.js:10:32)
```

### Fix
Corrected to `drop.addEventListener("dragleave", onDragLeave);` at `JpgToPng.js:450`.

### Verification
- ESLint: 0 errors on `JpgToPng.js`.
- No remaining occurrences of `addEventEventListener` anywhere in `client/`.

---

## Image Tools & Dev Tools — Invalid Hook Call Fix (COMPLETE)

### Problem
The same bug pattern hit 5 more imperative tool functions: `mountJpgToPng`, `mountPngToJpgTool`, `mountWebpToPng`, `createQRCodeGenerator`, and `createHTMLMinifier`. Each called `const { trigger } = useDownloadProgress();` inside a plain JS function invoked from a `useEffect` in its `page.js`, running the hook outside any React component tree:

```
Invalid hook call. Hooks can only be called inside of the body of a function component.
    at useDownloadProgress (components/ads/DownloadProgressPopup/DownloadProgressPopup.js:277:39)
    at mountJpgToPng (utils/img/JpgToPng/JpgToPng.js:255:42)
    at JpgToPngPage.useEffect (app/img/JpgToPng/page.js:10:32)
```

### Fix
Applied the same fix to all 5 files — switched to the non-hook registry and renamed call sites:

| File | Import change | Hook line removed | `trigger(` → `triggerDownloadProgress(` |
|------|--------------|-------------------|----------------------------------------|
| `utils/img/JpgToPng/JpgToPng.js` | `useDownloadProgress` → `triggerDownloadProgress` | line 255 | 3 sites (292, 358, 493) |
| `utils/img/PngToJpg/PngToJpg.js` | `useDownloadProgress` → `triggerDownloadProgress` | line 42 | 2 sites (154, 319) |
| `utils/img/WebpToPng/WebpToPng.js` | `useDownloadProgress` → `triggerDownloadProgress` | line 31 | 2 sites (134, 291) |
| `utils/dev-tools/QRCodeGenerator/QRCodeGenerator.js` | `useDownloadProgress` → `triggerDownloadProgress` | line 778 | 1 site (986) |
| `utils/dev-tools/HTMLMinifier/HTMLMinifier.js` | `useDownloadProgress` → `triggerDownloadProgress` | line 386 | 1 site (621) |

### Verification
- ESLint: 0 errors on all 5 modified files (they do not appear in the lint output).
- No remaining references to `useDownloadProgress` or bare `trigger(` in any of the 5 files.

---

## Image to Base64 — Invalid Hook Call Fix (COMPLETE)

### Problem
`client/utils/img/ImgToBase64/ImgToBase64.js` called the `useDownloadProgress()` hook (line 84) inside `initImageToBase64(container)`, a plain imperative function — not a React component. It is invoked from `app/img/ImgToBase64/page.js:10` inside a `useEffect`, so the hook ran outside any component tree, violating the Rules of Hooks:

```
Invalid hook call. Hooks can only be called inside of the body of a function component.
    at useDownloadProgress (components/ads/DownloadProgressPopup/DownloadProgressPopup.js:277:39)
    at initImageToBase64 (utils/img/ImgToBase64/ImgToBase64.js:84:42)
    at ImageToBase64Page.useEffect (app/img/ImgToBase64/page.js:10:36)
```

### Fix
- Replaced the `useDownloadProgress` import with the non-hook registry import:
  `import { triggerDownloadProgress } from '@/components/ads/DownloadProgressPopup/DownloadProgressTrigger';`
- Removed `const { trigger } = useDownloadProgress();` from `initImageToBase64`.
- Renamed the call site from `trigger({...})` to `triggerDownloadProgress({...})` in `onDownload()`.

This matches the pattern already used by every other imperative tool (CompressPDF, WordtoPDFnPDFtoWord, SplitPDF, RotatePDF, PDFtoJPG, MergePDFFiles, Sort Text, Remove Duplicate Lines, PPTnPDF, EccelnPDF, CSVnExcel, TXTnWord).

### Verification
- ESLint: 0 errors on the modified file.
- No remaining references to `useDownloadProgress` or the bare `trigger` variable in `ImgToBase64.js`.

---

## QR Code Scanner — Invalid Hook Call Fix (COMPLETE)

### Problem
`client/utils/dev-tools/QRCodeScanner/QRCodeScanner.js` called the `useDownloadProgress()` hook (line 204) inside `createQRScanner`, a regular imperative function — not a React component. This violated the Rules of Hooks and threw:

```
Invalid hook call. Hooks can only be called inside of the body of a function component.
```

The destructured `trigger` was also never used anywhere in the file.

### Fix
- Removed the `const { trigger } = useDownloadProgress();` line from `createQRScanner`.
- Removed the now-unused `import { useDownloadProgress } from '...'` at the top of the file.

### Verification
- `next build` compiles successfully (54 static pages).
- ESLint: 0 errors on the modified file.

---

## Backend and Dashboard Removed (COMPLETE)

The `client/` directory (Next.js dashboard with analytics UI) and all backend source files have been removed from the codebase.

- `client/` - Next.js dashboard application with AnalyticsDashboard, tracking client, and all tool pages
- `backend/` - Express API with controllers, routes, models, middleware, utils, and tests (directory empty but locked by Windows system process, will clear on reboot)

Only the root project files remain: DESIGN.md, README.md, Phase.md, Rule.md, Status.md, and .git directory.

Replaced the previous colour palette with colour scheme 3 and swapped the
third theme option from "Neon" to "System" (follows OS preference).

### New Palette (`client/app/globals.css`)

| Role / Element | Light Mode Hex | Dark Mode Hex |
|---|---|---|
| Primary Accent | #5E5CE6 | #818CF8 |
| Active / Hover State | #4834D4 | #4F46E5 |
| Highlight Accent | #FF6B6B | #F87171 |
| Main Background | #F5F6FA | #0B0F19 |
| Card Surface | #FFFFFF | #1E293B |
| Border / Divider | #E2E8F0 | #334155 |
| Primary Text | #1E1B2E | #F3F4F6 |
| Secondary Text | #6B7280 | #9CA3AF |

### Changes Made
- Rewrote `:root` base tokens to colour scheme 3 (light defaults)
- Rewrote `@media (prefers-color-scheme: dark)` block with dark palette
- Rewrote `:root[data-theme="light"]` and `:root[data-theme="dark"]` blocks
- Removed the old `:root[data-theme="neon"]` block entirely
- Added `--tool-highlight` token for alerts/progress/notification badges
- Updated dev-tool CSS (`QRCodeScanner`, `CSSMinifier`, `QRCodeGenerator`,
  `PasswordGenerator`, `HTMLMinifier`) to drop `[data-theme="neon"]` rules
  and use the new accent values for `[data-theme="dark"]`
- Updated `client/components/Navbar/Navbar.js`:
  - Third option changed from Neon to System (`💻`)
  - Added `getEffectiveTheme()` helper that resolves `system` via
    `window.matchMedia('(prefers-color-scheme: dark)')`
  - Initial state defaults to `system` (was `light`)
  - Added a `change` listener so the UI follows the OS when System is selected
- Updated comments in `globals.css` and `Navbar.css`
- Updated `client/README.md` theme section and the Download Progress
  Popup "Theme-aware" note

### Verification
- `next build` passes (54 static pages)
- No `[data-theme="neon"]` selectors remain anywhere in the client codebase
- All theme tokens still resolve through CSS variables; no hard-coded
  palette colours were introduced in component stylesheets

---

## MS Office & Tabular Document Conversion CDN Integration (COMPLETE)

### Added CDN Scripts to `client/app/layout.js`
All 13 CDN libraries for Microsoft Office and tabular document conversion tools have been integrated into the Next.js App Router layout using `next/script` components with `strategy="lazyOnload"` for optimal performance.

| Category | Library | CDN URL | Purpose |
|----------|---------|---------|---------|
| **Word (.docx)** | mammoth.js | `https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js` | Reads & converts .docx to HTML/Text |
| | docx.js | `https://cdn.jsdelivr.net/npm/docx@8.5.0/build/index.umd.min.js` | Creates & formats .docx files client-side |
| | html-docx-js | `https://cdn.jsdelivr.net/npm/html-docx-js@0.3.1/dist/html-docx.min.js` | Parses HTML/DOM into .docx format |
| **Excel (.xlsx, .csv)** | SheetJS / xlsx | `https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js` | Full Excel & CSV parsing/generation engine |
| **PowerPoint (.pptx)** | PPTXGenJS | `https://cdn.jsdelivr.net/gh/gitbrent/pptxgenjs@3.12.0/dist/pptxgen.bundle.js` | Generates .pptx presentations with text, tables, shapes, images |
| **PDF Generation** | pdf-lib | `https://cdnjs.cloudflare.com/ajax/libs/pdf-lib/1.17.1/pdf-lib.min.js` | PDF generation, page extraction, splitting, merging, rotation |
| | jsPDF | `https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js` | Generates tabular PDF reports from spreadsheets |
| | jsPDF AutoTable | `https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.31/jspdf.plugin.autotable.min.js` | Table plugin for jsPDF |
| **PDF Rendering** | PDF.js | `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js` | Renders PDF pages to Canvas for thumbnails/previews, extracts text |
| | PDF.js Worker | `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js` | Worker configuration for PDF.js |
| **Utilities** | FileSaver.js | `https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js` | Cross-browser file downloads |
| | JSZip | `https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js` | Bundles multiple pages/images into downloadable .zip files |

### Verification
- All 13 CDN URLs verified with HTTP 200 status
- Next.js build passes (53 static pages including category pages)
- ESLint: 0 errors on modified layout.js

## MS Office Tool CSS Import & Styling Fix (COMPLETE)

### Problem
All 6 MS Office tool `page.js` files under `client/utils/msoffice-tool/` imported CSS and JS from a non-existent `../utility/` path. Additionally, the `app/msoffice-tool/*/page.js` app router pages did not import any CSS at all, so tool styles were never loaded in the browser.

### Fix — Broken Imports (part 1)
Updated all 6 `utils/msoffice-tool/*/page.js` files to import from their local tool JS and CSS files:

| Tool | Old (broken) | New (correct) |
|------|-------------|---------------|
| WordnPDF | `../utility/tool`, `../utility/tool.css` | `../WordtoPDFnPDFtoWord.js`, `../WordtoPDFnPDFtoWord.css` |
| ExcelnPDF | `../utility/tool`, `../utility/tool.css` | `./EccelnPDF.js`, `./ExcelnPDF.css` |
| CSVnPDF | `../utility/tool.js`, `../utility/tool.css` | `./CSVnExcel.js`, `./CSVnExcel.css` |
| TXTnWord | `../utility/tool`, `../utility/tool.css` | `./TXTnWord.js`, `./TXTnWord.css` |
| HTMLnDOC | `../utility/tool`, `../utility/tool.css` | `./HTMLnDOC.js`, `./HTMLnDOC.css` |
| PPTnPDF | `../utility/tool.js`, `../utility/tool.css` | `./PPTnPDF.js`, `./PPTnPDF.css` |

### Fix — Missing CSS Imports in App Router (part 2)
Added CSS imports to all 6 `app/msoffice-tool/*/page.js` files, matching the pattern used by `app/pdf-tools/*/page.js`:

| App Router Page | CSS Import Added |
|-----------------|------|
| `app/msoffice-tool/WordnPDF/page.js` | `../../../utils/msoffice-tool/WordnPDF/WordtoPDFnPDFtoWord.css` |
| `app/msoffice-tool/ExcelnPDF/page.js` | `../../../utils/msoffice-tool/ExcelnPDF/ExcelnPDF.css` |
| `app/msoffice-tool/CSVnPDF/page.js` | `../../../utils/msoffice-tool/CSVnPDF/CSVnExcel.css` |
| `app/msoffice-tool/TXTnWord/page.js` | `../../../utils/msoffice-tool/TXTnWord/TXTnWord.css` |
| `app/msoffice-tool/HTMLnDOC/page.js` | `../../../utils/msoffice-tool/HTMLnDOC/HTMLnDOC.css` |
| `app/msoffice-tool/PPTnPDF/page.js` | `../../../utils/msoffice-tool/PPTnPDF/PPTnPDF.css` |

### Fix — CSS Styling Standardization (part 3)
Standardized all 6 MS Office tool CSS files for consistent layout, boxing, and spacing:

- **2-column desktop / 1-column mobile**: All tools now use `grid-template-columns: 1fr 1fr` on desktop and `1fr` on mobile at the standardized 768px breakpoint (matching `app/tool.css` convention)
- **PPTnPDF grid fix**: Was inverted (1-col desktop, 2-col at 850px). Now correctly 2-col desktop / 1-col mobile at 768px
- **Breakpoint standardization**: CSVnPDF (800px→768px), TXTnWord (868px→768px), PPTnPDF mobile padding (640px→768px)
- **Card boxing**: All cards use shared CSS variables (`--tool-surface`, `--tool-border`, `--tool-radius`, `--tool-shadow`, `--tool-card-pad`) for consistent borders, backgrounds, rounded corners, and drop shadows
- **Proper spacing**: `margin-bottom: var(--tool-col-gap)` on cards, `gap: var(--tool-gap)` on grids, `box-sizing: border-box` on all containers and cards
- **Mobile padding**: All tools use `padding: 24px 16px 40px` at the 768px mobile breakpoint

### Verification
- ESLint: 0 errors on all modified files
- `next build`: Compiled successfully, 48/48 static pages prerendered (including all 6 `/msoffice-tool/*` routes)

## Phase 1 â€” Project Inspection (COMPLETE)

### Project Overview
- **Name**: DocFix â€” browser-only image/document tools
- **Stack**: Next.js 16.3.8 (App Router) + React 19.2.8 + Tailwind CSS v4 (client) | Express 5 + Mongoose 9 + MongoDB Atlas (backend)
- **Root layout**: `client/app/layout.js` â€” shared Navbar, Footer, ad units (Multitag, DownloadProgressPopup), Geist fonts, theme system (light/dark/system)

### Routing Model
- Filesystem-based Next.js App Router under `client/app/`
- `client/lib/pages.js` auto-discovers routes by scanning `app/` for `page.js` files
- Routes discovered: `/`, `/tools`, `/analytics`, 29 tool pages, 8 legal-support pages
- `not-found.js` renders 404 inside shared shell
- `sitemap.xml` + `robots.txt` route handlers auto-generate from discovered pages

### Styling
- Single CSS architecture: `app/globals.css` (tokens + base) â†’ `app/tool.css` (shell) â†’ per-tool CSS
- CSS custom properties drive 3 themes via `[data-theme]` attribute (light/dark/neon)
- No component-level stylesheets; all tools reuse shared classes

### Dependencies
- Client: next, react, react-dom, @tailwindcss/postcss, tailwindcss, eslint, eslint-config-next
- Backend: express, mongoose, cors, dotenv, nodemon, nodejs

### Environment Configuration
- Backend `.env`: `PORT=5000`, `MONGO_URI` pointing to MongoDB Atlas cluster (connected successfully)
- No client `.env` files
- `next.config.mjs` is empty (default config)

### MongoDB Setup
- **Status**: CONNECTED + MODELS DEFINED (verified via direct mongoose.connect test)
- Mongoose 9.11.1, Atlas replica set (3 shards), SSL enabled
- Backend `index.js` connects on startup; `db/db.js` and `app.js` exist but are empty stubs
- **Mongoose models defined** (Phase 3 complete):
  - `backend/models/Site.js` — sites collection with domain, settings, timestamps
  - `backend/models/Session.js` — sessions collection with visitor/session tracking, device info, UTM params, indexes
  - `backend/models/Event.js` — events collection with eventType, sessionId, visitorId, element data, custom events, indexes
  - `backend/models/AdminSession.js` — adminSessions collection with TTL index on expiresAt (Phase 6)
  - `backend/models/DailyStats.js` — dailyStats collection for precomputed aggregates (Phase 8)
  - `backend/models/index.js` — exports all models
- All indexes and validation per DESIGN.md (no duplicate index warnings)

### Pre-existing Build Issue (FIXED)
- `client/utils/shared/download.js` was 100% commented out (no exports)
- Multiple tool pages import `downloadBlob` from it → **`next build` FAILED**
- **FIXED**: `downloadBlob` export restored in `client/utils/shared/download.js`

### /analytics Route Status (Phase 6 COMPLETE)
- **Now a proper server component** at `client/app/analytics/page.js` using `ContentPage` shell + shared CSS tokens
- Exports `metadata` via `toolMetadata("/analytics")` for SEO
- **Login form**: client-side `AnalyticsDashboard.js` component (`client/components/AnalyticsDashboard/AnalyticsDashboard.js`)
  - Calls `POST /api/auth/login` with `credentials: "include"` (reads/writes `admin_session` cookie)
  - `GET /api/auth/me` on mount to restore existing session
  - `POST /api/auth/logout` on sign-out
  - Uses shared `.tool-input`, `.tool-btn`, `.tool-btn-primary`, `.tool-btn-ghost`, `.tool-card`, `.tool-alert` classes
- **All private reporting APIs protected** by `requireAdmin` middleware (`backend/middleware/auth.js`):
  - `GET /api/analytics/reports/{overview,sources,pages,devices,events,live,time-series}` → 401 without valid session
  - Public ingestion endpoints (`/api/analytics/...`) remain unauthenticated and cannot read private data
- **Auth rate limiting**: 20 attempts / 15 min on `/api/auth/login` (429 when exceeded)
- **Session expiration**: 7-day TTL (`ADMIN_SESSION_TTL_DAYS`), enforced server-side; expired/revoked tokens rejected
- **Logout**: revokes session in DB + clears cookie
- **Build verified**: `next build` passes (48 static pages)
- **Backend tests verified**: 37/37 passing (auth, reports, rate limit, 404)

### Key Files
- Layout: `client/app/layout.js`
- Homepage: `client/app/page.js` (503 lines, tool catalog + marketing sections)
- Route discovery: `client/lib/pages.js` (276 lines)
- Backend entry: `backend/index.js` (83 lines)
- Shared components: `client/components/ContentPage/ContentPage.js`, `client/components/Navbar/Navbar.js`, `client/components/Footer/Footer.js`
- **Download Progress Popup**: `client/components/ads/DownloadProgressPopup/DownloadProgressPopup.js` (with 5s countdown + progress)

### Download Progress Popup Usage (for tool developers)
The `DownloadProgressPopup` is mounted globally in `layout.js`. Tools trigger it via the `useDownloadProgress` hook:

```javascript
// In your tool component (client-side)
import { useDownloadProgress } from '@/components/ads/DownloadProgressPopup/DownloadProgressPopup';

function MyTool() {
  const { trigger, DownloadProgressPopup } = useDownloadProgress();

  const handleDownload = () => {
    // 1. Prepare your blob/file
    const blob = await generateFile();
    const url = URL.createObjectURL(blob);
    const filename = 'output.pdf';

    // 2. Trigger popup with 5s countdown, then start download
    trigger({
      countdownMs: 5000,           // 5 second countdown
      durationMs: 3000,            // Progress animation duration
      title: 'Preparing your PDF',
      description: 'Your merged document is being generated.',
      onDownloadStart: () => {
        // This runs AFTER countdown reaches 0
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
      },
      onComplete: () => {
        // Optional: cleanup after download finishes
      },
    });
  };

  return (
    <>
      <button onClick={handleDownload}>Download</button>
      {/* Render the popup (put anywhere in your component tree) */}
      <DownloadProgressPopup />
    </>
  );
}
```

**Features:**
- **5-second countdown** (configurable via `countdownMs`) before download starts
- **Progress animation** (configurable via `durationMs`) simulates 0→100%
- **Auto-closes** after completion (configurable via `autoCloseMs`)
- **Accessible** with ARIA live regions for countdown announcements
- **Theme-aware** uses CSS variables (light/dark/neon)

---

## Phase 1 Implementation Checklist

### Files to ADD (new)
1. `client/app/analytics/page.js` â€” replace stub with proper ContentPage-based dashboard
2. `client/components/AnalyticsDashboard/AnalyticsDashboard.js` â€” real dashboard component
3. `backend/models/Analytics.js` â€” Mongoose schema for analytics events
4. `backend/routes/analytics.js` â€” Express routes for tracking + querying
5. `client/lib/analytics.js` â€” client-side tracking helper (send events to backend)

### Files to MODIFY (no working-feature changes)
1. `client/lib/pages.js` â€” add `/analytics` to PAGE_META so it appears in nav/footer/sitemap
2. `backend/index.js` â€” mount analytics routes
3. `client/utils/shared/download.js` â€” uncomment OR remove broken imports (separate fix)

### Files NOT to touch
- All 29 tool pages
- All 8 legal-support pages
- Homepage, not-found, sitemap, robots
- Ad components, Navbar, Footer, Layout
- `client/utils/shared/downloadLimit.js`, `useDownloadLimit.js`, `downloadToast.js` (commented-out premium features)

---

## Phase 5 — Build the Tracking Client (COMPLETE)

- **Tracking client library**: `client/lib/tracking.js` — lightweight client with:
  - Pseudonymous visitor/session ID generation (UUID v4, persisted in localStorage)
  - Pageview tracking on initial load and App Router navigation (via `usePathname`)
  - UTM parameter capture (utm_source, utm_medium, utm_campaign, utm_term, utm_content)
  - Click tracking on interactive elements (links, buttons, inputs)
  - Outbound link detection and tracking
  - Custom event API (`trackCustom`)
  - Engagement heartbeats (30s interval, scroll depth tracking, visibility change handling)
  - Session management (30-min timeout, auto-restart)
  - Deduplication and retry logic (3 retries with exponential backoff)
  - Failed request queueing (localStorage, flushed on reconnect)
  - Consent handling (opt-in/opt-out via custom event, respects denial)
  - Privacy: URL sanitization (strips sensitive params), element data sanitization, customData PII scrubbing
  - sendBeacon for reliable unload/heartbeat delivery
- **TrackingProvider**: `client/components/TrackingProvider/TrackingProvider.js` — consent management via custom event
- **ClientProviders**: `client/components/ClientProviders/ClientProviders.js` — wraps app with TrackingProvider without breaking server components
- **Root layout integration**: `client/app/layout.js` updated to use ClientProviders
- **Page metadata**: `/analytics` added to PAGE_META in `client/lib/pages.js`
- **Build verification**: `next build` passes (48 static pages generated)
- **Pre-existing fix**: `client/utils/shared/download.js` downloadBlob export restored

- API contract documented in `DESIGN.md` (367 lines)
- MongoDB schemas defined for 5 collections: sites, sessions, events, adminSessions, dailyStats
- Event types: pageview, click, navigation, heartbeat, outbound, custom
- Auth flow: login/logout/me with Httponly Secure SameSite=Lax cookies
- Reporting endpoints: overview, sources, pages, devices, events, live, time-series
- Privacy: PII stripping, URL sanitization, hashed IPs, consent support, rate limiting

## Phase 3 — MongoDB Setup (COMPLETE)

- MongoDB Atlas connected (3-shard replica set, SSL, Mongoose 9.11.1)
- Models defined in `backend/models/`:
  - `Site.js` — sites collection (domain, settings)
  - `Session.js` — sessions (visitor/session tracking, UTM, device info, indexes)
  - `Event.js` — events (eventType, element data, custom events, indexes)
  - `AdminSession.js` — admin auth sessions with TTL index (Phase 6)
  - `DailyStats.js` — precomputed aggregates (Phase 8)
- All indexes and validation per DESIGN.md, no duplicate index warnings
- Backend `index.js` connects on startup with all models loaded

## Phase 4 — Express Backend (COMPLETE)

- **Backend structure**: `backend/app.js` (Express factory: CORS, JSON 256kb limit, request logger, 404 + error handlers), `backend/index.js` (bootstrap: connectDB → listen), `backend/config/env.js` (validated env config), `backend/db/db.js` (mongoose connect + state events)
- **Routes**: `backend/routes/index.js` (aggregator), `health.js` (/, /health, /status, /api/analytics/health), `analytics.js` (public ingestion, rate limited), `reports.js` (protected reporting, date-range middleware), `auth.js` (login/logout/me, rate limited)
- **Controllers**: `analyticsController.js` (track, pageview, sessions start/heartbeat/end; auto-registers sites; updates session counters), `reportsController.js` (7 reports via MongoDB aggregation), `authController.js` (scrypt password hashing, timingSafeEqual verify, admin session create/revoke/check)
- **Middleware**: `rateLimit.js` (in-memory sliding window), `auth.js` (requireAdmin via cookie → adminSessions lookup, expiry + revocation checks), `validate.js` (payload validators + report date-range parser)
- **Utils**: `logger.js` (structured JSON logs + request logger), `sanitize.js` (URL param stripping, PII scrubbing, SHA-256 hashing, UA parsing), `cookies.js` (cookie parse/options)
- **Fixed**: Event model was missing its `timestamp` field (indexed but undefined); removed duplicate Session sessionId index warning
- **Tests**: `backend/test/api.test.js` — 37/37 passing (health, ingestion, validation, auth, all 7 reports, rate limit, 404). Run with `node test/api.test.js` (cleans collections, then exercises the live server)
- **Privacy verified in DB**: raw IP never stored (ipHash only), `token`/`email` query params stripped from URLs, sensitive keys removed from customData
- **Login**: `POST /api/auth/login` with `{"password":"admin123"}` (dev default from ADMIN_PASSWORD env) → sets `admin_session` cookie (HttpOnly, Secure in production, SameSite=Lax, 7-day TTL)

## Phase 7 — Build the Dashboard UI (COMPLETE)

### Files Created
- **API client**: `client/lib/analyticsApi.js` — authenticated fetch helpers for auth + reports
- **Data hooks**: `client/lib/useReport.js` — `useReport` (loading/error/data) + `useIntervalReport` (auto-refresh for live/time-series)
- **Main shell**: `client/components/AnalyticsDashboard/AnalyticsDashboard.js` — auth check, login form, nav tabs, date range picker, view switching
- **DateRangePicker**: `client/components/AnalyticsDashboard/DateRangePicker.js` — presets (today/7d/30d/90d/custom) with date inputs
- **Views**: `views/OverviewView.js`, `views/SourcesView.js`, `views/PagesView.js`, `views/DevicesView.js`, `views/EventsView.js`, `views/LiveView.js`
- **Shared UI**: `ui/DataTable.js` (pagination), `ui/StatCard.js`, `ui/TimeSeriesChart.js`, `ui/LoadingState.js`, `ui/ErrorState.js`, `ui/EmptyState.js`, `ui/CsvExportButton.js`

### Implementation Details
- All 6 report views fetch real data from `/api/analytics/reports/{name}` with `credentials: "include"` for cookie-based auth
- Date range picker (presets + custom dates) flows as `params` to every view; changing the range triggers refetch
- Overview shows stat cards (pageViews, sessions, visitors, bounce rate, avg duration, pages/session, returning visitors, total events) + an SVG time-series chart
- Sources, Pages, Events, and Devices views use `DataTable` with client-side pagination (First/Prev/Next/Last)
- Live view auto-refreshes every 15s via `useIntervalReport`
- Each report includes CSV export via `CsvExportButton`
- Loading, error (with retry), and empty states implemented across all views
- Responsive layout using shared `tool-card`, `tool-grid`, `tool-row`, `tool-btn` CSS classes from `globals.css`/`tool.css`

### Verification
- `next build` passes (48 static pages)
- Backend tests: 37/37 passing
- ESLint: 0 errors on all new files
- API response shapes validated against `backend/controllers/reportsController.js`

## Phase 8 — Add Live Activity and Optimize (COMPLETE)

### Server-Side Session Inactivity Detection
Added `POST /api/analytics/sessions/mark-stale-inactive` endpoint in `backend/controllers/analyticsController.js` and `backend/routes/analytics.js`:
- Marks sessions as inactive when `lastActivityAt` is older than configurable timeout (default 30 minutes)
- Updates `isActive: false`, sets `endedAt`, and increments `duration` based on time since last activity
- Rate-limited via existing track limiter
- Useful for cron jobs or manual cleanup of stale sessions

### Recent Visitors Report
Added `GET /api/analytics/reports/recent-visitors` endpoint in `backend/controllers/reportsController.js` and `backend/routes/reports.js`:
- Returns unique visitors with last visit time, visit count, device type, browser, OS, country, referrer domain, UTM source
- Supports date range filters (`startDate`, `endDate`), domain filter, and `limit` parameter (1-200, default 50)
- Uses optimized aggregation pipeline with `$group` by `visitorId` and `$sort` by `lastVisit` descending

### DailyStats Precomputation
Created `backend/controllers/dailyStatsController.js` and `backend/routes/dailyStats.js`:
- `POST /api/analytics/daily-stats/compute` — Computes daily aggregates per domain for a given date (defaults to yesterday):
  - Page views, unique visitors, sessions, bounce rate, avg session duration
  - Top pages (path, title, count), referrers, devices, countries
  - Upserts into `DailyStats` collection (unique index on `domain+date`)
- `GET /api/analytics/daily-stats` — Retrieves precomputed stats with date range and domain filters
- Protected by `requireAdmin` middleware

### Database Index Optimization
Added compound indexes for query performance:
- **Session model** (`backend/models/Session.js`): `domain+lastActivityAt` (stale session queries), `visitorId+startedAt` (recent visitors)
- **Event model** (`backend/models/Event.js`): `domain+eventType+timestamp` (time-series, event type filtering)

### Verification
- `next build`: Compiled successfully, 54 static pages prerendered
- All backend JavaScript files pass syntax check (`node --check`)
- ESLint: 0 errors on modified files

### Implementation
- **`/tools` page** (`client/app/tools/page.js`): Updated to display all 5 tool categories as clickable cards in a responsive grid
  - Each card shows category icon, name, tool count, description, and "Explore →" CTA
  - Uses `getCategories()` from `client/lib/pages.js` for dynamic category data
  - Styled with `.category-grid` and `.category-card` CSS classes in `globals.css`
- **`/category/[category-name]` dynamic route** (`client/app/category/[category-name]/page.js`): Renders complete tool list for selected category
  - Static generation via `generateStaticParams()` — 5 pages prerendered at build time
  - Dynamic metadata via `generateMetadata()` for SEO
  - Uses same `.tools-grid` and `.tool-link-card` components as homepage
  - 404 handling via `notFound()` for invalid category names

### Categories Supported
1. **Image Tools** (9 tools) — Convert, compress, resize, edit images
2. **PDF Tools** (6 tools) — Split, merge, compress, convert, rotate PDFs
3. **MS Office Tools** (6 tools) — Word, Excel, PowerPoint, PDF, HTML, CSV, TXT conversion
4. **Dev Tools** (5 tools) — Minify code, generate passwords, QR codes
5. **Text Tools** (6 tools) — Case conversion, Lorem Ipsum, paragraph writer, sort, word counter

### Verification
- `next build` passes (48 static pages + 5 SSG category pages = 53 total)
- ESLint: 0 errors on all modified/new files
- Responsive grid: 1 column mobile, 2+ columns desktop
- Consistent styling with existing design system (CSS variables, themes)

## Phase 9 — Add Advanced Analytics (COMPLETE)

### Backend API Endpoints Added

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/analytics/reports/funnel` | GET | Funnel conversion analysis with configurable steps (2-10 paths), conversion rates, drop-off % |
| `/api/analytics/reports/retention` | GET | Cohort-based retention matrix (daily/weekly granularity, configurable periods up to 52) |
| `/api/analytics/reports/heatmap` | GET | Click heatmap per page path — element-level click counts and percentages |
| `/api/analytics/reports/session-replay` | GET | Full event timeline for a session with automatic PII redaction |
| `/api/analytics/reports/returning-visitors` | GET | Visitors with 2+ visits, visit counts, first/last visit, device/browser/OS, referrer, UTM |

### Privacy & Security (Session Replay)
- **Automatic PII redaction**: All sensitive fields in `element` and `customData` objects are sanitized before returning
- **Redacted fields**: password, token, secret, api_key, apikey, auth, session, credit, card, ssn, email, phone, address (case-insensitive substring match)
- **URLs excluded**: Raw URLs never returned in session replay; only path, title, referrer domain
- **Element data sanitized**: tagName, id, className, text, href preserved; sensitive attributes redacted
- **Custom data sanitized**: Nested objects recursively scanned and redacted

### Backend Implementation (`backend/controllers/reportsController.js`)
- **Funnel**: Aggregates pageview events by session, computes visitors per step requiring sequential step completion
- **Retention**: Cohorts by first visit date, tracks return visits per period (day/week), returns matrix with rates
- **Heatmap**: Groups click events by element signature (tag+id+class+text), returns top 100 elements by click count
- **Session Replay**: Fetches all events for a sessionId, applies sanitization, returns session metadata + event timeline
- **Returning Visitors**: Aggregates sessions by visitorId, filters visitCount > 1, joins latest session details

### Validation Updates (`backend/middleware/validate.js`)
- Added `week` granularity support for retention reports
- Added `cohortSize` (1-90) and `maxPeriods` (1-52) validation parameters
- All new endpoints protected by `requireAdmin` middleware and `parseReportRange` validation

### Frontend Dashboard Views Created
| View | File | Features |
|------|------|----------|
| FunnelsView | `client/components/AnalyticsDashboard/views/FunnelsView.js` | Configurable step input, conversion rate, drop-off %, CSV export |
| RetentionView | `client/components/AnalyticsDashboard/views/RetentionView.js` | Daily/weekly toggle, max periods, color-coded retention matrix, CSV export |
| HeatmapView | `client/components/AnalyticsDashboard/views/HeatmapView.js` | Path input, element breakdown with tag/id/class/text/href, CSV export |
| SessionReplayView | `client/components/AnalyticsDashboard/views/SessionReplayView.js` | Session ID input, event type filter, color-coded event types, raw JSON toggle, CSV export |
| ReturningVisitorsView | `client/components/AnalyticsDashboard/views/ReturningVisitorsView.js` | Paginated table with visit counts, dates, device/browser/OS/country/referrer/UTM, CSV export |

### Dashboard Integration
- Updated `AnalyticsDashboard.js` VIEWS array with 5 new tabs
- Added imports for all 5 new view components
- Extended `renderView` switch statement with new cases
- All new views respect date range picker, domain filter, and use shared UI components (DataTable, LoadingState, ErrorState, EmptyState, CsvExportButton)

### Verification
- `next build`: Compiled successfully, **54 static pages** prerendered
- All backend JavaScript files pass syntax check (`node --check` on controllers/reportsController.js, routes/reports.js, middleware/validate.js)
- ESLint: 0 errors on all new and modified files
- No duplicate index warnings in MongoDB models

---

## Cookie Policy Update (COMPLETE)

Updated client/app/cookie-policy/page.js with Cookie Policy content.

### Changes
| File | Change |
|------|--------|
| client/app/cookie-policy/page.js | Updated Cookie Policy page with cookies policy content as specified |

### Verification
- Cookie policy page content matches the provided policy text

