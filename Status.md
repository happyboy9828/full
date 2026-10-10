# Status.md

Last updated: 2026-10-10

## Colour Scheme 3 — Light / Dark / System Theme (COMPLETE)

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
