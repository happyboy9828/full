# Status.md

Last updated: 2026-10-09

## Phase 1 â€” Project Inspection (COMPLETE)

### Project Overview
- **Name**: DocFix â€” browser-only image/document tools
- **Stack**: Next.js 16.3.8 (App Router) + React 19.2.8 + Tailwind CSS v4 (client) | Express 5 + Mongoose 9 + MongoDB Atlas (backend)
- **Root layout**: `client/app/layout.js` â€” shared Navbar, Footer, ad units (Multitag, DownloadProgressPopup), Geist fonts, theme system (light/dark/neon)

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

<<<<<<< HEAD
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
=======
**Current phase: Phase 7 — Build the Dashboard UI**

- [ ] Build overview report view (page views, sessions, visitors, bounce rate, avg duration, pages/session)
- [ ] Build traffic sources view (UTM source/medium/campaign breakdown with percentages)
- [ ] Build top pages view (most visited paths with page view counts)
- [ ] Build devices view (device type, browser, OS breakdown)
- [ ] Build events view (event type counts, custom event breakdown)
- [ ] Build live activity view (active sessions, recent events)
- [ ] Add date-range picker (presets: today, 7d, 30d, custom)
- [ ] Add loading, error, and empty states
- [ ] Add CSV export for each report
- [ ] Ensure responsive layout and pagination where needed
- [ ] Use real backend data via authenticated fetch (cookie-based `requireAdmin` sessions)
- [ ] Verify `next build` still passes
>>>>>>> e16a166025edd9e98d928564e8d1cf640896f67b
