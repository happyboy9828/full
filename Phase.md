Phase Plan

Last updated: October 9, 2026

**Current Phase: Phase 5 — Build the Tracking Client**

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

Phase 5: Build the Tracking Client

Integrate a lightweight tracking client into the existing Next.js website.

Track initial page loads and App Router navigation.

Generate pseudonymous visitor and session identifiers.

Record page URLs, referrers, and campaign parameters.

Track selected clicks, outbound links, and custom events.

Measure engagement using defined rules.

Prevent duplicate events and handle failed network requests.

Respect consent settings and avoid capturing sensitive data.

Completion Criteria: Browsing the site produces accurate records in MongoDB without noticeably slowing the website.

Phase 6: Protect /analytics

Since your public website has no login or registration, add authentication specifically for the analytics area.

Create a private administrator login.

Store a password hash, not the plaintext password.

Use secure, HTTP-only session cookies.

Protect the dashboard page and every private reporting API.

Add login rate limiting, session expiration, and logout.

Ensure public tracking endpoints cannot read private analytics data.

Completion Criteria: Only an authenticated administrator can see reports.

Phase 7: Build the Dashboard UI

Create the overview, traffic sources, top pages, devices, events, and conversions views.

Add date filters, loading and error states, empty states, responsive layouts, pagination, and CSV export.

Use actual backend data rather than hardcoded demo statistics.

Completion Criteria: All core reports display correctly and respond to filters.

Phase 8: Add Live Activity and Optimize

Add periodic session heartbeats, inactivity detection, recent-visitor reports, efficient database indexes, and cached or precomputed summaries when needed.

Completion Criteria: Recent activity updates reliably and reports remain responsive as data grows.

Phase 9: Add Advanced Analytics

Introduce funnels, returning-visitor reports, retention, heatmaps, and session replay.

For recordings, mask sensitive fields, avoid capturing passwords or private form content, and implement appropriate consent and retention controls.

Completion Criteria: Advanced reports work without compromising privacy or site performance.

Phase 10: Test, Deploy, and Maintain

Test event accuracy, authentication, API permissions, date filters, mobile layouts, duplicate requests, and database failures.

Deploy Next.js to Vercel and the Express API to a compatible host.

Configure environment variables, HTTPS, CORS, backups, and monitoring.

Completion Criteria: The production system works reliably from visitor activity to dashboard reports, with a documented recovery process.