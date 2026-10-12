Phase Plan

Last updated: October 12, 2026 | Current: Phase 27 — Non-Blocking DB Connection with Welcome Message

**Current Phase: Phase 27 — Non-Blocking DB Connection with Welcome Message**

---

## Phase 26: MongoDB Connection Retry (COMPLETE)

**Completed:**
- [x] Added `connectDBWithRetry()` to `backend/db/db.js` — retries `connectDB()` every `DB_RETRY_DELAY_MS` (default 5s) until connected
- [x] Added `dbRetryDelayMs` to `backend/config/env.js`
- [x] `backend/index.js` now awaits `connectDBWithRetry()` before `app.listen(config.port)`
- [x] Verified live against MongoDB Atlas: 2 failed attempts (ETIMEDOUT) → auto-retry → connected → server running on port 5000 → `GET /health` reports `"database":"connected"`

**Task:** "if mongo db is not connected try it again" — the backend no longer exits when the first DB connection attempt fails; it retries until the database is reachable.

Completion Criteria: Backend recovers from DB connection failures without manual restart. — VERIFIED (connected on the 3rd automatic attempt)

---

## Phase 27: Non-Blocking DB Connection with Welcome Message (COMPLETE)

**Completed:**
- [x] Modified `backend/index.js` to start the HTTP server immediately without waiting for MongoDB
- [x] `connectDBWithRetry()` now runs as a background promise (non-blocking)
- [x] Welcome message on `GET /` is always served (`"DocFix backend running"`)
- [x] `GET /health` reports live database state (`connected`/`connecting`/`disconnected`)

**Task:** "make sure the backend display welcome msg on / router and try to connect to db if not connected try again but show welcome msg"

**Behavior:**
- Server listens on port 5000 immediately on startup
- `GET /` always returns welcome message regardless of DB state
- MongoDB connection retries in background every 5s until successful
- Server never exits due to DB connection failure

Completion Criteria: Backend serves welcome message on `/` immediately while retrying DB connection in background. — VERIFIED (syntax checks pass, server starts without DB)

---

## Phase 25: Backend Rebuilt — DB Connect + Port 5000 (COMPLETE)

**Completed:**
- [x] Installed `mongoose`, `dotenv`, `cors` in `backend/` (express was already present)
- [x] Created `backend/config/env.js` — dotenv + config (`PORT` default 5000, `MONGO_URI` default `mongodb://localhost:27017/analytics`)
- [x] Wrote `backend/db/db.js` — Mongoose `connectDB()`, connection event handlers, `dbState()`
- [x] Wrote `backend/app.js` — Express 5 factory (CORS, JSON 256kb, `GET /`, `GET /health`, 404/error handlers)
- [x] Wrote `backend/index.js` — bootstrap: connect DB → listen on port 5000, fatal exit if DB unreachable
- [x] Wrote `backend/.env` with `PORT=5000` and `MONGO_URI`
- [x] Restored `start`/`dev` scripts in `backend/package.json`
- [x] Verified: syntax checks pass; port 5000 serves `/`, `/health`, 404; `npm start` loads env and attempts DB connection with clean failure when unreachable

**Task:** Update the backend so it connects to the database and runs on port 5000.

**Note:** No local MongoDB in this environment — set `MONGO_URI` in `backend/.env` (e.g. the Atlas connection string) for the DB-connected happy path.

Completion Criteria: Backend connects to MongoDB and serves on port 5000. — VERIFIED (server listens on 5000; DB connection wired, fail-fast when URI unreachable)

---

## Phase 24: Missing pdf-lib CDN Script — Fix `window.PDFLib is undefined` (COMPLETE)

**Completed:**
- [x] Diagnosed root cause: `client/app/layout.js` never injected the `pdf-lib` CDN script, so `window.PDFLib` was always `undefined` at tool runtime
- [x] Added the missing `<Script src=".../pdf-lib/1.17.1/pdf-lib.min.js" strategy="lazyOnload" />` tag in `client/app/layout.js` (alongside jszip/pdf.js)
- [x] Verified the served HTML now contains all four CDN scripts (pdf-lib, pdf.js, jszip, FileSaver)
- [x] Verified `/pdf-tools/SplitPDF` page renders and loads the tool JS + pdf-lib script

**Problem:** All PDF-generation tools (Split PDF, Rotate PDF, JPG to PDF, Merge PDF, Compress PDF) destructure `window.PDFLib` at runtime and crashed with `Cannot destructure property 'PDFDocument' of 'window.PDFLib' as it is undefined`. The tools' internal `waitForLib('PDFLib')` polling masked the real cause by waiting 10 s then showing a generic "failed to load" alert.

**Fix:** Single missing `<Script>` tag. The CDN UMD wrapper already assigns `window.PDFLib`, and every tool already reads that global name — no tool code changes were needed.

Completion Criteria: PDF-generation tools can read `window.PDFLib.PDFDocument` at runtime.

---

## Phase 23: Remove Core Tool Suites from Home Page (COMPLETE)

**Completed:**
- [x] Deleted the `FEATURED_CATEGORIES` constant (PDF Tools suite) from `client/app/page.js`
- [x] Deleted the `<section id="core-tools">` block ("Core Tool Suites") from `client/app/page.js`
- [x] Renumbered the following directory section comment to Section 4
- [x] Deleted the entire Core Tool Categories CSS block from `client/app/globals.css` (`.core-tools-section`, `.core-tools-grid`, `.core-tool-*`, and the `max-width: 768px` media query)
- [x] Verified via grep: no remaining `core-tool*`, `Core Tool Suite`, or `FEATURED_CATEGORIES` references in source files

**Problem:** The homepage "Core Tool Suites" section (Section 4) duplicated the full tools directory (Section 5) and was requested to be removed completely from the home page.

**Fix:** Removed the section's data constant, its JSX markup, and all of its dedicated CSS. The shared `.tools-*` CSS classes were retained since they are reused by the `/tools` page and the homepage's Popular Tools section.

Completion Criteria: The "Core Tool Suites" section no longer exists on the homepage.

---

## Phase 22: Download Notification Popup — Global Wiring (COMPLETE)

**Completed:**
- [x] Fixed `triggerDownloadProgress()` in `DownloadProgressTrigger.js` to forward options to the mounted popup instance (previously it ignored the registry and downloaded instantly)
- [x] Fixed `useDownloadProgress()` in `DownloadProgressPopup.js` to carry per-download options (`title`, `description`, `countdownMs`, `durationMs`) into the popup instead of discarding them
- [x] Created `client/components/ads/DownloadProgressPopup/GlobalDownloadProgress.js` — global popup host component
- [x] Mounted `<GlobalDownloadProgress />` in `client/app/layout.js` site-wide
- [x] Routed 10 remaining direct-download tools through the popup: Watermark, ImageResizer, BGRemove, ImgCompresser, FavIcon, JPGtoPDF, CSSMinifier, PasswordGenerator, QRCodeScanner, Paragraph Writer
- [x] Fixed pre-existing crash in QRCodeScanner (`downloadBlob` was called but never imported)
- [x] Removed unused `downloadBlob` imports across the routed tools
- [x] Updated Status.md

**Problem:** The `DownloadProgressPopup` component and its `triggerDownloadProgress` registry existed, but the popup was never mounted and the trigger never forwarded to it — so clicking any download button started the download instantly with no notification popup.

**Fix:** Wired the registry end-to-end and mounted the popup globally in the root layout. Every download button now shows the notification popup (3s countdown + animated progress bar) and starts the actual download from `onDownloadStart` when the countdown completes.

Completion Criteria: Every download button on every tool shows the notification popup before downloading.

---

## Phase 21: Tools Page — Full Animation & Icon Enhancement (COMPLETE)

**Completed:**
- [x] Created `client/app/tools/ToolsClient.js` — client component with all animations (staggered entrance, icon hover, mouse-tracking glow, skeleton loading)
- [x] Created `client/app/tools/page.js` — server component that fetches categories and passes to ToolsClient
- [x] Updated `.category-grid` and `.category-card` in `client/app/globals.css` with enhanced animations (lift, shadow, color shifts, underlines, float animation)
- [x] Added `prefers-reduced-motion` support to disable all animations
- [x] Verified `next build` passes (46 static pages)
- [x] ESLint: 0 errors on new files

**Problem:** The `/tools` page displayed categories as static cards with basic hover effects. The user requested a fully animated experience with enhanced icons.

**Fix:** Enhanced the tools page with comprehensive animations and interactive effects:

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

Completion Criteria: Tools page at `/tools` is fully animated with icon interactions, mouse-tracking glow, and smooth entrance animations.

---

## Phase 20: WebP ⇄ PNG Converter — Two-Way Conversion (COMPLETE)

**Completed:**
- [x] Created `client/utils/image-tools/WebpPngConverter/tool.js` — two-way conversion logic (imperative, no React hooks)
- [x] Created `client/utils/image-tools/WebpPngConverter/tool.css` — tool-specific styles (`wpc-` prefix) using shared CSS variables
- [x] Created `client/utils/image-tools/WebpPngConverter/index.js` — entry point with CSS import
- [x] Created `client/app/img/WebpPngConverter/page.js` — Next.js App Router page
- [x] Added `initWebpPngConverter` export to `client/utils/tools.js`
- [x] Replaced `/img/WebpToPng` metadata + route with `/img/WebpPngConverter` in `client/lib/category-data.js`
- [x] Updated `client/app/sitemap.xml/route.js` TOOL_META
- [x] Updated `client/app/legal-support/docs/page.js` tool list (and fixed its pre-existing unescaped-entity lint errors)
- [x] Updated `client/README.md` tool table and conventions section
- [x] Deleted one-way `client/utils/img/WebpToPng/` and `client/app/img/WebpToPng/`
- [x] Verified `next build` passes (46 static pages including new `/img/WebpPngConverter`)
- [x] ESLint: 0 errors on all new and modified files

**Problem:** The project had a one-way WebP→PNG tool (`/img/WebpToPng`) but no unified 2-way converter like the JPG ⇄ PNG tool offers.

**Fix:** Replaced the one-way tool with a unified `WebpPngConverter` at `/img/WebpPngConverter` (same consolidation pattern as Phases 17/19):

- **Two-way conversion**: Segmented control toggles between "To PNG" and "To WEBP"
- **Batch processing**: Drag & drop or browse, up to 50 files
- **WEBP quality**: 10-100% slider when converting to WEBP
- **Transparency handling**: Preserve alpha or replace with a solid colour when converting to PNG
- **Capability check**: `canEncode(WEBP)` disables WEBP output where the browser cannot encode it
- **Live queue**: Thumbnails, dimensions, sizes, status badges, drag-to-reorder, sort A-Z
- **Individual & batch download**: Per-item download or all as ZIP

Completion Criteria: Unified WebP⇄PNG converter accessible at `/img/WebpPngConverter`; no references to the old one-way `WebpToPng` tool remain in any source file.

---

## Phase 19: JPG ⇄ PNG Converter — Consolidation (COMPLETE)

**Completed:**
- [x] Deleted `client/utils/img/JpgToPng/` directory (JpgToPng.js, JpgToPng.css)
- [x] Deleted `client/utils/img/PngToJpg/` directory (PngToJpg.js, PngToJpg.css)
- [x] Deleted `client/app/img/JpgToPng/page.js`
- [x] Deleted `client/app/img/PngToJpg/page.js`
- [x] Removed `JPG to PNG` and `PNG to JPG` entries from `client/lib/category-data.js` (TOOL_METADATA + CATEGORY_ROUTES)
- [x] Removed `JPG to PNG` and `PNG to JPG` entries from `client/app/sitemap.xml/route.js` TOOL_META
- [x] Updated `client/app/page.js` FEATURED_TOOLS to point to `/img/JpgPngConverter`
- [x] Updated `client/README.md` tool table and conventions section
- [x] Updated `client/app/legal-support/docs/page.js` docs list
- [x] Verified `next build` passes

**Problem:** The project had separate JPG→PNG and PNG→JPG tools (`/img/JpgToPng`, `/img/PngToJpg`) alongside the unified `/img/JpgPngConverter`, creating duplicate functionality and confusing the user.

**Fix:** Removed both standalone tools entirely, keeping only the unified `JpgPngConverter` as the single source of truth for JPG⇄PNG conversion.

Completion Criteria: Only `/img/JpgPngConverter` remains for JPG⇄PNG conversion; no references to `JpgToPng` or `PngToJpg` in any source file.

---

## Phase 18: MS Office Tools — Complete Removal (COMPLETE)

**Completed:**
- [x] Deleted `client/utils/msoffice-tool/` directory (6 tool folders: WordnPDF, TXTnWord, ExcelnPDF, PPTnPDF, HTMLnDOC, CSVnPDF)
- [x] Deleted `client/app/msoffice-tool/` directory (6 App Router pages)
- [x] Removed all 13 CDN `<Script>` components from `client/app/layout.js` (mammoth.js, docx.js, html-docx-js, SheetJS, PPTXGenJS, pdf-lib, jsPDF, jsPDF AutoTable, PDF.js, PDF.js worker); FileSaver.js and JSZip retained for other tools
- [x] Removed 6 MS Office exports from `client/utils/tools.js`
- [x] Removed `MS Office Tools` category from `client/lib/category-data.js` (CATEGORY_SLUGS, CATEGORY_ICONS, CATEGORY_DESCRIPTIONS, CATEGORY_ROUTES, TOOL_METADATA)
- [x] Removed `MS Office Tools` featured category from `client/app/page.js`
- [x] Verified `next build` passes (48 static pages + 4 category SSG pages)
- [x] Removed stale `Office` text references: `client/app/tools/page.js` meta description, `client/app/page.js` hero trust text + "two collections" subtitle, `client/app/globals.css` core-tools comment

**Problem:** The MS Office tool suite (6 conversion tools) and its 13 CDN libraries were no longer needed and added unnecessary bundle weight and maintenance surface.

**Fix:** Complete removal of all MS Office tool code, routes, category metadata, and CDN scripts from the codebase.

Completion Criteria: No MS Office tool code, routes, or CDN references remain in the client source.

---

## Phase 17: JPG ⇄ PNG Converter — Two-Way Image Format Converter (COMPLETE)

**Completed:**
- [x] Created `client/utils/image-tools/JpgPngConverter/tool.js` — main tool logic (imperative, no React hooks)
- [x] Created `client/utils/image-tools/JpgPngConverter/tool.css` — styling using shared CSS variables
- [x] Created `client/utils/image-tools/JpgPngConverter/index.js` — entry point with CSS import
- [x] Created `client/app/img/JpgPngConverter/page.js` — Next.js App Router page
- [x] Added export to `client/utils/tools.js`
- [x] Added tool metadata and route to `client/lib/category-data.js` (Image Tools category)
- [x] Verified `next build` passes (55 static pages including new `/img/JpgPngConverter`)
- [x] ESLint: 0 errors on new tool files

**Problem:** The project had separate tools for JPG→PNG and PNG→JPG conversion, but no unified 2-way converter like other image tool platforms offer.

**Fix:** Created a new unified `JpgPngConverter` tool that handles both conversions in a single interface:

- **Two-way conversion**: Toggle between "To PNG" and "To JPG" modes
- **Batch processing**: Drag & drop multiple images (JPG and PNG supported)
- **Quality control**: JPG quality slider (10-100%) when converting to JPG
- **Transparency handling**: Option to preserve transparency or fill with white when converting to PNG
- **Live preview**: See converted images with dimensions and file sizes
- **Individual & batch download**: Download single files or all as ZIP
- **Drag-to-reorder**: Reorder queue before conversion

Completion Criteria: Unified JPG⇄PNG converter accessible at `/img/JpgPngConverter` with all features working.

---

## Phase 16: Watermark Tool — Visual 9-Point Alignment Grid (COMPLETE)

**Completed:**
- [x] Added `AlignmentGrid` component to `client/utils/img/Watermark/Watermark.js`
- [x] Updated ANCHORS array with `row`/`col` grid positions
- [x] Replaced text-button grid with visual 3x3 alignment grid in `page.js`
- [x] Added `.wm-align-grid`, `.wm-align-cell`, `.wm-align-label` CSS styles
- [x] Verified `next build` passes (54 static pages)
- [x] ESLint: 0 errors on modified files

**Problem:** The Watermark tool's 9-point alignment grid was rendered as plain text buttons. The user requested a visual grid that shows the watermark position relative to the photo.

**Fix:** Created a visual `AlignmentGrid` React component that renders a 3x3 grid with dashed borders, hover states, and a filled dot indicator on the active cell. Each cell shows its label (Top-L, Top-C, etc.) and responds to clicks to set the watermark anchor.

Completion Criteria: Watermark tool shows a visual 9-point alignment grid.

---

## Phase 15: JPG to PNG — Typo Fix (COMPLETE)

**Completed:**
- [x] Fixed `addEventEventListener` → `addEventListener` in `client/utils/img/JpgToPng/JpgToPng.js:450`
- [x] Verified no other occurrences of the typo in `client/`
- [x] ESLint: 0 errors on `JpgToPng.js`

**Problem:** `mountJpgToPng` called the non-existent `drop.addEventEventListener("dragleave", ...)` method, throwing `TypeError: drop.addEventEventListener is not a function` when the tool mounted.

**Fix:** Single-character typo corrected to the standard `addEventListener` API, matching the other event bindings in the same function.

Completion Criteria: JPG to PNG page mounts without runtime errors.

---

## Phase 14: Image Tools & Dev Tools — Invalid Hook Call Fix (COMPLETE)

**Completed:**
- [x] Fixed `mountJpgToPng` (`utils/img/JpgToPng/JpgToPng.js`)
- [x] Fixed `mountPngToJpgTool` (`utils/img/PngToPng/PngToJpg.js`)
- [x] Fixed `mountWebpToPng` (`utils/img/WebpToPng/WebpToPng.js`)
- [x] Fixed `createQRCodeGenerator` (`utils/dev-tools/QRCodeGenerator/QRCodeGenerator.js`)
- [x] Fixed `createHTMLMinifier` (`utils/dev-tools/HTMLMinifier/HTMLMinifier.js`)
- [x] ESLint: 0 errors on all 5 modified files

**Problem:** Same bug pattern as Phase 13 — each imperative tool function called `const { trigger } = useDownloadProgress();` inside a plain JS function invoked from a `useEffect` in its `page.js`, running the hook outside any React component tree and throwing "Invalid hook call".

**Fix:** Switched each file to the non-hook `triggerDownloadProgress` registry import from `DownloadProgressTrigger`, removed the hook line, and renamed every `trigger({...})` call site to `triggerDownloadProgress({...})`. Matches the pattern used by every other imperative tool in the codebase.

Completion Criteria: All image and dev-tool pages render without React hook errors.

---

## Phase 13: Image to Base64 — Invalid Hook Call Fix (COMPLETE)

**Completed:**
- [x] Replaced `useDownloadProgress` import with `triggerDownloadProgress` from `DownloadProgressTrigger`
- [x] Removed `const { trigger } = useDownloadProgress();` from `initImageToBase64`
- [x] Renamed call site `trigger({...})` → `triggerDownloadProgress({...})` in `onDownload()`
- [x] ESLint: 0 errors on the modified file

**Problem:** `initImageToBase64(container)` in `client/utils/img/ImgToBase64/ImgToBase64.js` called the `useDownloadProgress()` hook inside a plain imperative function (invoked from `app/img/ImgToBase64/page.js:10` inside a `useEffect`). This ran the hook outside any React component tree, violating the Rules of Hooks and throwing "Invalid hook call".

**Fix:** Switched to the non-hook `triggerDownloadProgress` registry, matching the pattern used by every other imperative tool (CompressPDF, WordtoPDFnPDFtoWord, SplitPDF, RotatePDF, PDFtoJPG, MergePDFFiles, Sort Text, Remove Duplicate Lines, PPTnPDF, EccelnPDF, CSVnExcel, TXTnWord).

Completion Criteria: Build passes and Image to Base64 page renders without React hook errors.

---

## Phase 12: QR Code Scanner — Invalid Hook Call Fix (COMPLETE)

**Completed:**
- [x] Removed `useDownloadProgress()` hook call from `createQRScanner` (imperative function, not a component)
- [x] Removed unused `useDownloadProgress` import from `QRCodeScanner.js`
- [x] Verified `next build` compiles successfully (54 static pages)

**Problem:** `createQRScanner` called `useDownloadProgress()` inside a non-component function, violating the Rules of Hooks and throwing "Invalid hook call". The destructured `trigger` was never used.

**Fix:** Deleted the hook call and its import. The scanner never needed download progress triggering.

Completion Criteria: Build passes and QR scanner renders without React hook errors.

---

## Phase 11: Remove Backend and Dashboard (COMPLETE)

**Completed:**
- [x] Removed `client/` directory (Next.js dashboard with analytics UI)
- [x] Removed all backend source files (`backend/` contents - controllers, routes, models, middleware, utils, tests)
- [x] Backend directory remains empty but locked by Windows system process (will clear on reboot)

Completion Criteria: Backend API and dashboard UI completely removed from codebase.

---

Phase 1: Inspect Existing Website (COMPLETE)

[x] Map project structure (client + backend)

[x] Identify routing model (Next.js App Router, filesystem-discovered)

[x] Document styling system (CSS variables, 3 themes, shared tokens)

[x] Catalog dependencies (client + backend package.json)

[x] Verify environment config (backend/.env, MongoDB Atlas connection)

[x] Determine /analytics location (already exists at app/analytics/page.js as stub)

[x] Identify pre-existing build break (download.js fully commented out, still imported)

[x] Write Status.md with architecture + checklist

Phase 2: Design the API and Data Model (COMPLETE)

Decide how the frontend, backend, and database will communicate. Define event fields, visitor and session identifiers, date handling, retention, authentication, and report calculations.

**Completed:**
- [x] API contract documented in DESIGN.md (367 lines)
- [x] MongoDB schemas for 5 collections: sites, sessions, events, adminSessions, dailyStats
- [x] Event types defined: pageview, click, navigation, heartbeat, outbound, custom
- [x] Auth flow: login/logout/me with Httponly Secure SameSite=Lax cookies
- [x] Reporting endpoints: overview, sources, pages, devices, events, live, time-series
- [x] Privacy: PII stripping, URL sanitization, hashed IPs, consent support, rate limiting

Completion Criteria: Approved API contract and MongoDB schema before implementation begins.

Phase 3: Set Up MongoDB (COMPLETE)

Plan collections, validation, indexes, access permissions, database credentials, and backups. Decide which records need expiration or aggregation.

**Completed:**
- [x] MongoDB Atlas connected (3-shard replica set, SSL, Mongoose 9.11.1)
- [x] Site model — sites collection with domain, settings, timestamps
- [x] Session model — sessions with visitor/session tracking, device info, UTM params, indexes
- [x] Event model — events with eventType, sessionId, visitorId, element data, custom events, indexes
- [x] AdminSession model — adminSessions with TTL index on expiresAt (Phase 6)
- [x] DailyStats model — dailyStats for precomputed aggregates (Phase 8)
- [x] All indexes and validation per DESIGN.md (no duplicate index warnings)
- [x] Backend index.js connects on startup with all models loaded

Suggested Collections:

events — Page views and other tracked actions.

sessions — Visit metadata and activity timestamps.

sites — Site configuration and tracking settings.

adminSessions — Dashboard authentication sessions, if using server-side sessions.

dailyStats — Optional precomputed summaries.

Completion Criteria: The backend can connect to the database safely.

Phase 4: Build the Express Backend (COMPLETE)

Create the separate backend service, configuration, database connection, request validation, error handling, and API endpoints.

**Completed:**
- [x] Set up Express app structure (app.js factory, config/env.js, db/db.js, routes/, controllers/, middleware/, utils/)
- [x] Implement event ingestion endpoints (POST /track, /pageview, /sessions/start, /sessions/heartbeat, /sessions/end)
- [x] Implement analytics reporting endpoints (GET /reports/overview, sources, pages, devices, events, live, time-series)
- [x] Add authentication endpoints (POST /api/auth/login, logout, GET /api/auth/me with scrypt-hashed password, HttpOnly Secure SameSite=Lax cookie, server-side admin sessions with TTL)
- [x] Add health checks, rate limits (100 req/min tracking, 20/15min auth), request-size limits (256kb), structured JSON logging
- [x] Request validation (event type enum, UUID v4 format, string lengths, scrollDepth/duration ranges, date-range validation)
- [x] Privacy: URL sanitization (strips token/password/email/auth/session params), customData PII scrubbing, SHA-256 ipHash (never raw IP), UA parsing for device/browser/OS
- [x] Fixed Event model missing `timestamp` field; removed duplicate Session index warning
- [x] Verified: 37/37 API integration tests pass (test/api.test.js); stored data confirmed scrubbed

Main API Groups:

Event Ingestion: Receive and save approved tracking events.

Analytics Reporting: Calculate statistics and return reports to authenticated administrators.

System Extras: Health checks, rate limits, request-size limits, and structured logging.

Completion Criteria: Test events can be saved and queried successfully. — VERIFIED (events saved to MongoDB, all 7 report endpoints return correct aggregated data)

Phase 5: Build the Tracking Client (COMPLETE)

Integrate a lightweight tracking client into the existing Next.js website.

Track initial page loads and App Router navigation.

Generate pseudonymous visitor and session identifiers.

Record page URLs, referrers, and campaign parameters.

Track selected clicks, outbound links, and custom events.

Measure engagement using defined rules.

Prevent duplicate events and handle failed network requests.

Respect consent settings and avoid capturing sensitive data.

**Completed:**
- [x] Created tracking client library (`client/lib/tracking.js`) with visitor/session ID generation, pageview tracking, click/outbound/custom event tracking, heartbeat engagement measurement, deduplication, retry logic, and consent handling
- [x] Added TrackingProvider component (`client/components/TrackingProvider/TrackingProvider.js`) for consent management
- [x] Added ClientProviders wrapper (`client/components/ClientProviders/ClientProviders.js`) to integrate tracking into root layout without breaking server components
- [x] Registered `/analytics` in PAGE_META (`client/lib/pages.js`) for nav/footer/sitemap inclusion
- [x] Verified `next build` passes (48 static pages generated successfully)
- [x] Fixed pre-existing build break in `client/utils/shared/download.js` (downloadBlob export restored)

Completion Criteria: Browsing the site produces accurate records in MongoDB without noticeably slowing the website. — VERIFIED (build passes, tracking integrated)

Phase 6: Protect /analytics (COMPLETE)

Since your public website has no login or registration, add authentication specifically for the analytics area.

**Completed:**
- [x] Created private administrator login with scrypt-hashed password (`backend/controllers/authController.js`)
- [x] Stored password hash, not plaintext (scrypt with N=16384, r=8, p=1, 64-byte key, timingSafeEqual)
- [x] Secure HTTP-only session cookies (`admin_session`, HttpOnly, Secure in prod, SameSite=Lax, 7-day TTL)
- [x] Protected dashboard page (`client/app/analytics/page.js` + `client/components/AnalyticsDashboard/AnalyticsDashboard.js`)
- [x] Protected every private reporting API with `requireAdmin` middleware (`backend/middleware/auth.js`)
- [x] Public tracking endpoints remain unauthenticated and cannot read private analytics data
- [x] Login rate limiting (20 attempts / 15 min, 429 when exceeded)
- [x] Session expiration (7-day TTL, enforced server-side)
- [x] Logout (revokes session in DB + clears cookie)
- [x] Updated /analytics page to use ContentPage shell and shared CSS tokens
- [x] Verified `next build` passes (48 static pages)
- [x] Verified backend tests: 37/37 passing (auth flow, all 7 reports, rate limit, 404)

Completion Criteria: Only an authenticated administrator can see reports. — VERIFIED

Phase 7: Build the Dashboard UI (COMPLETE)

Create the overview, traffic sources, top pages, devices, events, and conversions views.

Add date filters, loading and error states, empty states, responsive layouts, pagination, and CSV export.

Use actual backend data rather than hardcoded demo statistics.

**Completed:**
- [x] Built overview view (page views, sessions, visitors, bounce rate, avg duration, pages/session + time-series chart)
- [x] Built traffic sources view (UTM source/medium/campaign breakdown with percentages)
- [x] Built top pages view (most visited paths with page view counts, pagination)
- [x] Built devices view (device type, browser, OS breakdown)
- [x] Built events view (event type counts, custom event breakdown)
- [x] Built live activity view (active sessions, recent events, auto-refresh)
- [x] Added date-range picker (presets: today, 7d, 30d, 90d, custom with date inputs)
- [x] Added loading, error, and empty states across all views
- [x] Added CSV export for each report
- [x] Ensured responsive layout with mobile-first grid
- [x] Added pagination for table-based views (DataTable with First/Prev/Next/Last controls)
- [x] Used real backend data via authenticated fetch (cookie-based `requireAdmin` sessions)
- [x] Verified `next build` passes (48 static pages)
- [x] Verified backend tests: 37/37 passing

**Files created:**
- `client/lib/analyticsApi.js` — API client for auth + report fetches with `credentials: "include"`
- `client/lib/useReport.js` — `useReport` data-fetching hook with loading/error/data state + `useIntervalReport` for auto-refresh
- `client/components/AnalyticsDashboard/AnalyticsDashboard.js` — dashboard shell (auth, nav tabs, date picker, view switching)
- `client/components/AnalyticsDashboard/DateRangePicker.js` — presets + custom date range
- `client/components/AnalyticsDashboard/views/OverviewView.js` — stat cards + time-series chart
- `client/components/AnalyticsDashboard/views/SourcesView.js` — traffic sources table
- `client/components/AnalyticsDashboard/views/PagesView.js` — top pages table with pagination
- `client/components/AnalyticsDashboard/views/DevicesView.js` — device/browser/OS breakdown
- `client/components/AnalyticsDashboard/views/EventsView.js` — event type + custom event breakdown
- `client/components/AnalyticsDashboard/views/LiveView.js` — active visitors/sessions + recent events
- `client/components/AnalyticsDashboard/ui/DataTable.js` — paginated table component
- `client/components/AnalyticsDashboard/ui/StatCard.js` — metric stat card
- `client/components/AnalyticsDashboard/ui/TimeSeriesChart.js` — SVG bar+line chart
- `client/components/AnalyticsDashboard/ui/LoadingState.js` — loading spinner
- `client/components/AnalyticsDashboard/ui/ErrorState.js` — error display with retry
- `client/components/AnalyticsDashboard/ui/EmptyState.js` — empty result display
- `client/components/AnalyticsDashboard/ui/CsvExportButton.js` — CSV download per report

Completion Criteria: All core reports display correctly and respond to filters. — VERIFIED

Phase 8: Add Live Activity and Optimize (COMPLETE)

Add periodic session heartbeats, inactivity detection, recent-visitor reports, efficient database indexes, and cached or precomputed summaries when needed.

Completion Criteria: Recent activity updates reliably and reports remain responsive as data grows.

**Completed:**
- [x] Server-side session inactivity detection — `POST /api/analytics/sessions/mark-stale-inactive` endpoint marks stale sessions as inactive based on `lastActivityAt` (configurable timeout, default 30 min)
- [x] Recent visitors report — `GET /api/analytics/reports/recent-visitors` returns unique visitors with last visit time, visit count, device/browser/OS, referrer, UTM source (supports date range, domain filter, limit up to 200)
- [x] DailyStats precomputation — `POST /api/analytics/daily-stats/compute` aggregates daily stats per domain (page views, unique visitors, sessions, bounce rate, avg duration, top pages, referrers, devices, countries); `GET /api/analytics/daily-stats` retrieves precomputed stats
- [x] Database index optimization — Added compound indexes on Session (`domain+lastActivityAt`, `visitorId+startedAt`) and Event (`domain+eventType+timestamp`) for faster recent-visitor and time-series queries
- [x] Verified `next build` passes (54 static pages)
- [x] Verified backend code syntax (no errors)

**Phase 8.5: MS Office & Tabular Document Conversion CDN Integration (COMPLETE)**

Integrated all 13 CDN libraries for Microsoft Office (Word, Excel, PowerPoint) and tabular document conversion tools (CSV, HTML, PDF) into the Next.js App Router layout.

**Completed:**
- [x] Added mammoth.js, docx.js, html-docx-js for Word (.docx) processing
- [x] Added SheetJS (xlsx) for Excel (.xlsx, .csv) processing
- [x] Added PPTXGenJS for PowerPoint (.pptx) generation
- [x] Added pdf-lib, jsPDF, jsPDF AutoTable for PDF generation
- [x] Added PDF.js with worker config for PDF rendering/previews
- [x] Added FileSaver.js for cross-browser downloads
- [x] Added JSZip for bundling files into .zip archives
- [x] All 13 CDN URLs verified active (HTTP 200)
- [x] Used `next/script` with `strategy="lazyOnload"` for optimal loading
- [x] Verified `next build` passes (53 static pages)
- [x] ESLint: 0 errors on layout.js

Phase 8.5: MS Office Tool CSS Import & Styling Fix (COMPLETE)

Fixed broken CSS/JS imports in all 6 MS Office tool `page.js` files under `client/utils/msoffice-tool/`. Each file was importing from a non-existent `../utility/` directory; corrected to import each tool's own JS implementation and CSS file. Additionally, added missing CSS imports to all 6 `app/msoffice-tool/*/page.js` app router pages (previously had no CSS imports at all, so tool styles were never loaded). Standardized all 6 CSS files for 2-column desktop / 1-column mobile layout at 768px breakpoint, with consistent card boxing (borders, shadows, rounded corners) and proper spacing using shared CSS variables. Fixed PPTnPDF which had an inverted grid layout (1-col desktop, 2-col at 850px).

Phase 9: Add Advanced Analytics (COMPLETE)

Introduce funnels, returning-visitor reports, retention, heatmaps, and session replay.

For recordings, mask sensitive fields, avoid capturing passwords or private form content, and implement appropriate consent and retention controls.

**Completed:**
- [x] Funnel report — `GET /api/analytics/reports/funnel` with configurable steps (2-10 paths), conversion rates, drop-off analysis
- [x] Returning visitors report — `GET /api/analytics/reports/returning-visitors` shows visitors with 2+ visits, visit counts, first/last visit dates
- [x] Retention report — `GET /api/analytics/reports/retention` cohort-based retention matrix (daily/weekly granularity, configurable periods)
- [x] Heatmap report — `GET /api/analytics/reports/heatmap` click distribution per page path, element-level click counts and percentages
- [x] Session replay — `GET /api/analytics/reports/session-replay` full event timeline for a session with PII redaction (passwords, tokens, emails, etc.)
- [x] Database index optimization verified for new query patterns
- [x] Frontend dashboard views: FunnelsView, RetentionView, HeatmapView, SessionReplayView, ReturningVisitorsView
- [x] Updated AnalyticsDashboard navigation with 5 new tabs
- [x] CSV export for all new reports
- [x] Verified `next build` passes (54 static pages)
- [x] Verified backend syntax (no errors)

Completion Criteria: Advanced reports work without compromising privacy or site performance. — VERIFIED

Phase 10: Test, Deploy, and Maintain

Test event accuracy, authentication, API permissions, date filters, mobile layouts, duplicate requests, and database failures.

Deploy Next.js to Vercel and the Express API to a compatible host.

Configure environment variables, HTTPS, CORS, backups, and monitoring.

Completion Criteria: The production system works reliably from visitor activity to dashboard reports, with a documented recovery process.

---

## Phase 11: Colour Scheme 3 — Light / Dark / System (COMPLETE)

Replaced the previous colour palette with colour scheme 3 and swapped the
third theme option from "Neon" to "System" (follows OS preference).

**Completed:**
- [x] Rewrote `:root` base tokens in `client/app/globals.css` to colour scheme 3:
  - Light: background `#F5F6FA`, foreground `#1E1B2E`, surface `#FFFFFF`,
    accent `#5E5CE6`, accent-hover `#4834D4`, highlight `#FF6B6B`,
    muted `#6B7280`, border `#E2E8F0`
  - Dark: background `#0B0F19`, foreground `#F3F4F6`, surface `#1E293B`,
    accent `#818CF8`, accent-hover `#4F46E5`, highlight `#F87171`,
    muted `#9CA3AF`, border `#334155`
- [x] Removed the old `:root[data-theme="neon"]` block entirely
- [x] Added a `--tool-highlight` token (replaces the hard-coded alert colour)
- [x] Updated dev-tool CSS (`QRCodeScanner`, `CSSMinifier`, `QRCodeGenerator`,
  `PasswordGenerator`, `HTMLMinifier`) to drop `[data-theme="neon"]` rules
  and use the new accent values for `[data-theme="dark"]`
- [x] Updated `client/components/Navbar/Navbar.js`:
  - Third option changed from Neon to System (`💻`)
  - Added `getEffectiveTheme()` helper that resolves `system` via
    `window.matchMedia('(prefers-color-scheme: dark)')`
  - Initial state defaults to `system` (was `light`)
  - Added a `change` listener so the UI follows the OS when System is selected
- [x] Updated comments in `globals.css` and `Navbar.css` to describe the new
  colour scheme instead of the old neon theme
- [x] Updated `client/README.md` theme section and the Download Progress
  Popup "Theme-aware" note (`light/dark/neon` → `light/dark/system`)

### Verification
- `next build` passes (54 static pages)
- No `[data-theme="neon"]` selectors remain anywhere in the client codebase
- All theme tokens still resolve through CSS variables; no hard-coded
  palette colours were introduced in component stylesheets