Phase Plan

Last updated: October 9, 2026 | Current: Phase 8 — Add Live Activity and Optimize

<<<<<<< HEAD
**Current Phase: Phase 8 — Add Live Activity and Optimize**
=======
**Current Phase: Phase 7 — Build the Dashboard UI**
>>>>>>> e16a166025edd9e98d928564e8d1cf640896f67b

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

<<<<<<< HEAD
Phase 7: Build the Dashboard UI (COMPLETE)
=======
Phase 7: Build the Dashboard UI
>>>>>>> e16a166025edd9e98d928564e8d1cf640896f67b

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

Phase 8: Add Live Activity and Optimize

Add periodic session heartbeats, inactivity detection, recent-visitor reports, efficient database indexes, and cached or precomputed summaries when needed.

Completion Criteria: Recent activity updates reliably and reports remain responsive as data grows.

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

Phase 9: Add Advanced Analytics

Introduce funnels, returning-visitor reports, retention, heatmaps, and session replay.

For recordings, mask sensitive fields, avoid capturing passwords or private form content, and implement appropriate consent and retention controls.

Completion Criteria: Advanced reports work without compromising privacy or site performance.

Phase 10: Test, Deploy, and Maintain

Test event accuracy, authentication, API permissions, date filters, mobile layouts, duplicate requests, and database failures.

Deploy Next.js to Vercel and the Express API to a compatible host.

Configure environment variables, HTTPS, CORS, backups, and monitoring.

Completion Criteria: The production system works reliably from visitor activity to dashboard reports, with a documented recovery process.