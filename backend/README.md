# DocFix Analytics Backend

Express 5 + Mongoose 9 + MongoDB Atlas backend for the DocFix analytics system.

**Current Status**: Phase 4 Complete — All API endpoints implemented and tested (37/37 passing). Phase 5 (Tracking Client) in progress.

## Installation

```bash
npm install
```

## Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/analytics
ADMIN_PASSWORD=change-me
ADMIN_SESSION_TTL_DAYS=7
CORS_ORIGIN=http://localhost:3000,http://127.0.0.1:3000
LOG_LEVEL=debug
BODY_LIMIT=256kb
TRACK_RATE_LIMIT=100
```

- `ADMIN_PASSWORD` — admin login password (hashed with scrypt at runtime; never stored in plaintext). In production you may instead set `ADMIN_PASSWORD_HASH` as `scrypt$<base64-salt>$<base64-hash>`.
- `CORS_ORIGIN` — comma-separated allowed origins. In production this must be set explicitly.

## Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `node test/api.test.js` - Run integration tests (37 tests, cleans collections first)

## API Endpoints

### Health
- `GET /` - Welcome message
- `GET /health` - Health check (uptime, timestamp)
- `GET /status` - Database connection status
- `GET /api/analytics/health` - Analytics service health

### Event Ingestion (public, rate limited to 100 req/min per IP)
- `POST /api/analytics/track` - Generic event tracker (pageview, click, navigation, heartbeat, outbound, custom)
- `POST /api/analytics/pageview` - Convenience pageview endpoint
- `POST /api/analytics/sessions/start` - Create or resume a session
- `POST /api/analytics/sessions/heartbeat` - Update session activity/engagement
- `POST /api/analytics/sessions/end` - End a session

### Authentication
- `POST /api/auth/login` - Admin login; sets HttpOnly, Secure, SameSite=Lax cookie
- `POST /api/auth/logout` - Revoke session and clear cookie
- `GET /api/auth/me` - Check auth status

### Analytics Reporting (protected, requires admin session cookie)

All report endpoints accept `startDate`, `endDate` (ISO 8601), `domain` (optional), and `granularity` (`day`|`hour`, time-series only). Dates default to the last 30 days.

- `GET /api/analytics/reports/overview` - High-level metrics (pageviews, visitors, sessions, bounce rate, durations)
- `GET /api/analytics/reports/sources` - Traffic sources (UTM + referrer breakdown)
- `GET /api/analytics/reports/pages` - Top pages by views
- `GET /api/analytics/reports/devices` - Device/browser/OS breakdown
- `GET /api/analytics/reports/events` - Event-type and custom-event counts
- `GET /api/analytics/reports/live` - Active visitors/sessions and recent events
- `GET /api/analytics/reports/time-series` - Pageviews/sessions/visitors over time

## Project Structure

```
backend/
├── app.js                 # Express factory (CORS, JSON limit, logger, error handlers)
├── index.js               # Bootstrap: connectDB → listen
├── config/
│   └── env.js             # Validated environment config
├── db/
│   └── db.js              # Mongoose connect + connection events
├── models/
│   ├── index.js           # Exports all models
│   ├── Site.js            # sites collection (domain, settings)
│   ├── Session.js         # sessions (visitor/session tracking, UTM, device, indexes)
│   ├── Event.js           # events (eventType, element data, custom events, indexes)
│   ├── AdminSession.js    # adminSessions with TTL index (7 days)
│   └── DailyStats.js      # dailyStats for precomputed aggregates (Phase 8)
├── routes/
│   ├── index.js           # Route aggregator
│   ├── health.js          # /, /health, /status, /api/analytics/health
│   ├── analytics.js       # Public ingestion endpoints (rate limited)
│   ├── reports.js         # Protected reporting endpoints (date-range middleware)
│   └── auth.js            # Auth endpoints (rate limited)
├── controllers/
│   ├── analyticsController.js  # Track, pageview, session lifecycle
│   ├── reportsController.js    # 7 reports via MongoDB aggregation
│   └── authController.js       # Scrypt hash, timingSafeEqual, session create/revoke
├── middleware/
│   ├── rateLimit.js       # In-memory sliding window
│   ├── auth.js            # requireAdmin via cookie → adminSessions lookup
│   └── validate.js        # Payload validators + report date-range parser
├── utils/
│   ├── logger.js          # Structured JSON logs + request logger
│   ├── sanitize.js        # URL param stripping, PII scrubbing, SHA-256, UA parsing
│   └── cookies.js         # Cookie parse/options
└── test/
    └── api.test.js        # 37/37 integration tests
```

## Privacy & Security

- Raw IPs are never stored; only SHA-256 hashes (`ipHash`) for deduplication
- Sensitive URL query params (token, password, email, auth, session, ...) are stripped before persisting
- Custom event data is recursively scrubbed of sensitive keys and PII
- Request bodies are size-limited (256kb); all payloads validated (event type, UUID v4 format, lengths, ranges)
- Reporting endpoints require a server-side admin session (stored in `adminSessions` with TTL expiry)
- Passwords hashed with scrypt (N=16384, r=8, p=1); verified with `timingSafeEqual`
- Auth cookies: HttpOnly, Secure (production), SameSite=Lax, 7-day TTL

## Testing

```bash
# Start the server first (in another terminal)
npm run dev

# Run tests
node test/api.test.js
```

Tests clean all collections, then exercise:
- Health endpoints
- Event ingestion (validation, rate limits, session lifecycle)
- Authentication (login, logout, me, rate limits, timing attacks)
- All 7 reporting endpoints
- 404 handling

## MongoDB Collections

| Collection | Purpose | Key Indexes |
|------------|---------|-------------|
| `sites` | Site configuration | domain (unique) |
| `sessions` | Visitor/session tracking | sessionId (unique), visitorId, siteId+startedAt |
| `events` | Page views & actions | sessionId+timestamp, visitorId+timestamp, eventType |
| `adminSessions` | Admin auth sessions | sessionToken (unique), expiresAt (TTL) |
| `dailyStats` | Precomputed aggregates | siteId+date (unique) |

## Deployment Notes

- Set `NODE_ENV=production` for Secure cookies
- Use `ADMIN_PASSWORD_HASH` instead of `ADMIN_PASSWORD` in production
- Configure `CORS_ORIGIN` to your exact production domain(s)
- MongoDB Atlas: SSL enabled, replica set recommended
- Consider Redis for rate limiting in multi-instance deployments