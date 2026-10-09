# DocFix Analytics Platform

A privacy-first analytics platform for the **DocFix** browser-based image/document tool suite. Tracks visitor behavior without collecting PII — no raw IPs, no uploaded data, no third-party cookies.

## Architecture

```
docfix-analytics/
├── client/          # Next.js 16 + React 19 + Tailwind v4 (DocFix tools + analytics dashboard)
├── backend/         # Express 5 + Mongoose 9 + MongoDB Atlas (analytics API)
└── DESIGN.md        # API contract & data model (367 lines)
```

## Current Phase: Phase 5 — Build the Tracking Client

| Phase | Status | Description |
|-------|--------|-------------|
| 1 | ✅ Complete | Project inspection & documentation |
| 2 | ✅ Complete | API design & MongoDB data model |
| 3 | ✅ Complete | MongoDB Atlas setup & Mongoose models |
| 4 | ✅ Complete | Express backend (ingestion, reports, auth, tests) |
| **5** | 🟢 **In Progress** | **Tracking client (page loads, navigation, clicks, heartbeats, dedupe, consent)** |
| 6 | ⏳ Pending | Protect `/analytics` with admin auth |
| 7 | ⏳ Pending | Dashboard UI (overview, sources, pages, devices, events, live, time-series) |
| 8 | ⏳ Pending | Live activity & optimization |
| 9 | ⏳ Pending | Advanced analytics (funnels, retention, heatmaps) |
| 10 | ⏳ Pending | Test, deploy, maintain |

## Quick Start

### Backend (API)
```bash
cd backend
npm install
npm run dev          # http://localhost:5000
```

### Client (DocFix + Dashboard)
```bash
cd client
npm install
npm run dev          # http://localhost:3000
```

## Backend API (Phase 4 Complete)

**Health**: `GET /`, `/health`, `/status`, `/api/analytics/health`

**Event Ingestion** (public, rate-limited 100 req/min):
- `POST /api/analytics/track` — generic event (pageview, click, navigation, heartbeat, outbound, custom)
- `POST /api/analytics/pageview` — convenience pageview
- `POST /api/analytics/sessions/start` — create/resume session
- `POST /api/analytics/sessions/heartbeat` — update engagement
- `POST /api/analytics/sessions/end` — end session

**Auth** (admin only):
- `POST /api/auth/login` — sets HttpOnly Secure SameSite=Lax cookie
- `POST /api/auth/logout` — revoke session
- `GET /api/auth/me` — check auth status

**Reports** (protected, admin session required):
- `GET /api/analytics/reports/overview` — high-level metrics
- `GET /api/analytics/reports/sources` — traffic sources (UTM + referrer)
- `GET /api/analytics/reports/pages` — top pages
- `GET /api/analytics/reports/devices` — device/browser/OS breakdown
- `GET /api/analytics/reports/events` — event type counts
- `GET /api/analytics/reports/live` — active visitors/sessions
- `GET /api/analytics/reports/time-series` — metrics over time

**Tests**: `cd backend && node test/api.test.js` (37/37 passing)

## Privacy by Design

- **No raw IPs stored** — only SHA-256 hashes (`ipHash`) for deduplication
- **URL sanitization** — strips `token`, `password`, `email`, `auth`, `session`, etc. before persisting
- **Custom data scrubbing** — recursive PII removal from custom events
- **Consent-ready** — tracking client respects `localStorage` consent flags
- **No third-party cookies** — server-side admin sessions only

## Client Features (DocFix)

29+ browser-only tools — **zero uploads, no sign-up, free**:

| Category | Tools |
|----------|-------|
| **Image** | BGRemove, FavIcon, ImageResizer, ImgCompresser, ImgToBase64, JpgToPng, PngToJpg, WebpToPng, Watermark |
| **Dev Tools** | CSSMinifier, HTMLMinifier, PasswordGenerator, QRCodeGenerator, QRCodeScanner |
| **Planned** | PDF Tools, MS Office Tools, Text Tools |

## Documentation

- **Phase Plan**: [`Phase.md`](Phase.md) — 10-phase roadmap with completion criteria
- **Status**: [`Status.md`](Status.md) — detailed implementation checklist
- **API Design**: [`DESIGN.md`](DESIGN.md) — full contract, schemas, privacy rules
- **Backend README**: [`backend/README.md`](backend/README.md)
- **Client README**: [`client/README.md`](client/README.md)

## License

Private. All rights reserved.