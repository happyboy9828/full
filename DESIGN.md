# Phase 2 — API Design & Data Model

Last updated: 2026-10-09

## Overview
This document defines the API contract and MongoDB schemas for the analytics system. Frontend (Next.js) will send tracking events to the Express backend, which stores them in MongoDB. Authenticated admins access reports via protected endpoints.

## Data Model (MongoDB Schemas)

### 1. `sites` Collection
Stores configuration for tracked websites.
- `_id` (ObjectId)
- `domain` (String, required, unique) — e.g., "example.com"
- `name` (String) — site display name
- `trackingEnabled` (Boolean, default: true)
- `settings` (Object)
  - `trackOutboundLinks` (Boolean, default: true)
  - `trackClicks` (Boolean, default: true)
  - `trackEngagement` (Boolean, default: true)
  - `respectDNT` (Boolean, default: true)
- `createdAt` (Date, default: Date.now)
- `updatedAt` (Date, default: Date.now)

### 2. `sessions` Collection
Represents a single visit/session. Sessions timeout after inactivity (Phase 8).
- `_id` (ObjectId)
- `sessionId` (String, required, unique) — pseudonymous UUID v4
- `visitorId` (String, required) — pseudonymous UUID v4 (persists across sessions)
- `siteId` (ObjectId, ref: 'sites') — optional
- `domain` (String) — site domain for filtering
- `startedAt` (Date, required, default: Date.now)
- `endedAt` (Date, nullable)
- `lastActivityAt` (Date, required, default: Date.now)
- `duration` (Number, default: 0) — seconds of active engagement
- `isActive` (Boolean, default: true)
- `entryPage` (String) — landing URL/path
- `exitPage` (String, nullable)
- `referrer` (String, nullable) — document.referrer
- `referrerDomain` (String, nullable)
- `utmSource` (String, nullable)
- `utmMedium` (String, nullable)
- `utmCampaign` (String, nullable)
- `utmTerm` (String, nullable)
- `utmContent` (String, nullable)
- `country` (String, nullable) — optional geo (privacy-aware)
- `region` (String, nullable)
- `city` (String, nullable)
- `deviceType` (String) — 'desktop' | 'tablet' | 'mobile' | 'unknown'
- `browser` (String, nullable)
- `browserVersion` (String, nullable)
- `os` (String, nullable)
- `osVersion` (String, nullable)
- `language` (String, nullable)
- `screenWidth` (Number, nullable)
- `screenHeight` (Number, nullable)
- `viewportWidth` (Number, nullable)
- `viewportHeight` (Number, nullable)
- `ipHash` (String, nullable) — hashed IP for deduplication (never store raw PII)
- `userAgent` (String, nullable) — truncated if needed for privacy
- `pageCount` (Number, default: 0)
- `eventCount` (Number, default: 0)
- `createdAt` (Date, default: Date.now)
- `updatedAt` (Date, default: Date.now)

Indexes: { sessionId: 1 }, { visitorId: 1 }, { startedAt: -1 }, { lastActivityAt: -1 }, { domain: 1, startedAt: -1 }, { isActive: 1 }

### 3. `events` Collection
Individual tracking events (pageviews, clicks, custom events).
- `_id` (ObjectId)
- `eventId` (String, required, unique) — UUID v4
- `eventType` (String, required) — 'pageview' | 'click' | 'navigation' | 'heartbeat' | 'outbound' | 'custom'
- `sessionId` (String, required) — references sessions.sessionId
- `visitorId` (String, required)
- `siteId` (ObjectId, ref: 'sites')
- `domain` (String)
- `path` (String, nullable) — pathname
- `url` (String, nullable) — full URL (strip sensitive query params before storing)
- `title` (String, nullable) — page title
- `referrer` (String, nullable)
- `referrerDomain` (String, nullable)
- `previousPath` (String, nullable) — for SPA navigation
- `element` (Object, nullable) — for click events
  - `tagName` (String)
  - `id` (String)
  - `className` (String)
  - `text` (String) — truncated, no PII
  - `href` (String, nullable) — for outbound links
- `customName` (String, nullable) — for custom events
- `customData` (Object, nullable) — sanitized metadata (no PII)
- `duration` (Number, nullable) — engagement seconds
- `scrollDepth` (Number, nullable) — 0-100
- `timestamp` (Date, required, default: Date.now)
- `createdAt` (Date, default: Date.now)

Indexes: { timestamp: -1 }, { sessionId: 1, timestamp: -1 }, { visitorId: 1, timestamp: -1 }, { eventType: 1, timestamp: -1 }, { domain: 1, timestamp: -1 }, { path: 1 }

### 4. `adminSessions` Collection (Phase 6)
Server-side admin auth sessions.
- `_id` (ObjectId)
- `sessionToken` (String, required, unique) — cryptographically random
- `userId` (String, default: 'admin')
- `ipHash` (String, nullable)
- `userAgentHash` (String, nullable)
- `expiresAt` (Date, required) — TTL index
- `createdAt` (Date, default: Date.now)
- `lastActivityAt` (Date, default: Date.now)
- `revokedAt` (Date, nullable)

Indexes: { sessionToken: 1 }, { expiresAt: 1 } (TTL), { userId: 1 }

### 5. `dailyStats` Collection (Optional, Phase 8)
Precomputed daily aggregates for performance.
- `_id` (ObjectId)
- `date` (Date, required) — start of day (UTC)
- `domain` (String, required)
- `pageViews` (Number, default: 0)
- `uniqueVisitors` (Number, default: 0)
- `sessions` (Number, default: 0)
- `bounceRate` (Number, default: 0) — percentage
- `avgSessionDuration` (Number, default: 0) — seconds
- `topPages` (Array) — [{ path, count }]
- `referrers` (Array) — [{ domain, count }]
- `devices` (Array) — [{ type, count }]
- `countries` (Array) — [{ country, count }]
- `createdAt` (Date, default: Date.now)
- `updatedAt` (Date, default: Date.now)

Compound index: { domain: 1, date: -1 } (unique per domain/date)

### 6. `admins` Collection (Phase 39 — Admin Password Recovery)
Administrator account records used for password recovery.
- `_id` (ObjectId)
- `email` (String, required, unique) — admin login email (lowercased)
- `passwordHash` (String, required) — scrypt hash (`salt:keyHex`)
- `recoveryPhone` (String, required) — registered recovery phone number (E.164, e.g. `+14155552671`) to which recovery OTPs are sent
- `isActive` (Boolean, default: true)
- `createdAt` (Date, default: Date.now)
- `updatedAt` (Date, default: Date.now)

Index: { email: 1 } (unique)

### 7. `adminOtps` Collection (Phase 39 — Admin Password Recovery)
One-time password records for admin password recovery. Single-use, short-lived.
- `_id` (ObjectId)
- `admin` (ObjectId, ref: 'admins', required) — the admin record this OTP belongs to
- `phone` (String, required) — recovery phone number the OTP was sent to
- `otpHash` (String, required) — SHA-256 hash of the numeric OTP
- `purpose` (String, enum: ['password_recovery'], default: 'password_recovery')
- `attempts` (Number, default: 0) — failed verification attempts
- `maxAttempts` (Number, default: 5) — lockout threshold
- `verifiedAt` (Date, nullable) — set when OTP is successfully verified
- `consumedAt` (Date, nullable) — set when OTP is used, expired, or locked out
- `expiresAt` (Date, required) — TTL index (`expireAfterSeconds: 0`), auto-removed by MongoDB
- `createdAt` (Date, default: Date.now)
- `updatedAt` (Date, default: Date.now)

Indexes: { expiresAt: 1 } (TTL), { admin: 1, createdAt: -1 }



## API Contract

### Base URLs
- Tracking (public): `/api/analytics/*`
- Reporting (protected): `/api/analytics/reports/*` or root-level protected under analytics
- Auth (public): `/api/auth/*`

All requests/responses use JSON. Timestamps in ISO 8601 UTC.

### 1. Event Ingestion (Public - Rate Limited)

#### POST `/api/analytics/track`
Generic event tracker. Body:
```json
{
  "eventType": "pageview|click|navigation|heartbeat|outbound|custom",
  "sessionId": "uuid",
  "visitorId": "uuid",
  "path": "/tools",
  "url": "https://example.com/tools?utm_source=...",
  "title": "Tools",
  "referrer": "https://google.com",
  "previousPath": "/",
  "element": { "tagName": "a", "href": "https://external.com", "text": "External" },
  "customName": "signup_clicked",
  "customData": { "plan": "free" },
  "duration": 30,
  "scrollDepth": 75
}
```
Response: `200 OK` `{ "success": true, "eventId": "uuid" }` or `400` on validation error.

#### POST `/api/analytics/pageview`
Convenience endpoint for pageviews. Body:
```json
{
  "sessionId": "uuid",
  "visitorId": "uuid",
  "path": "/",
  "url": "https://...",
  "title": "Home",
  "referrer": "https://..."
}
```
Response: `200 OK` `{ "success": true }`

#### POST `/api/analytics/sessions/start`
Create or update session.
```json
{
  "sessionId": "uuid",
  "visitorId": "uuid",
  "path": "/",
  "url": "https://...",
  "referrer": "https://...",
  "utmSource": "google",
  "utmMedium": "cpc",
  "utmCampaign": "spring"
}
```
Response: `200 OK` `{ "success": true, "sessionId": "uuid" }`

#### POST `/api/analytics/sessions/heartbeat`
Update session activity (engagement tracking, Phase 8).
```json
{
  "sessionId": "uuid",
  "duration": 5,
  "scrollDepth": 50
}
```
Response: `200 OK` `{ "success": true }`

#### POST `/api/analytics/sessions/end`
End a session.
```json
{
  "sessionId": "uuid",
  "exitPage": "/contact"
}
```
Response: `200 OK` `{ "success": true }`

### 2. Authentication (Public/Protected)

#### POST `/api/auth/login`
Admin login. Body:
```json
{
  "password": "admin-password"
}
```
Response: `200 OK` sets `HttpOnly Secure SameSite=Lax` cookie, returns `{ "success": true }`. `401` on invalid password.

#### POST `/api/auth/logout`
Clear session cookie. Auth required (or always allow).
Response: `200 OK` `{ "success": true }`

#### GET `/api/auth/me`
Check auth status.
Response: `200 OK` `{ "authenticated": true }` or `401` `{ "authenticated": false }`

### 2.1 Password Recovery — SMS OTP (Public, Rate Limited)

SMS-based OTP flow for an administrator to reset their password when they no longer remember it.

#### POST `/api/auth/password-recovery/request`
Initiate recovery. Body:
```json
{
  "email": "admin@docfix.app"
}
```
Response: `200 OK` `{ "success": true, "message": "If an active account with a registered recovery phone exists, an OTP has been sent to that number." }` — always generic to prevent user enumeration. `400` if email is missing.

Behavior:
1. Load the `Admin` record by email and read its registered `recoveryPhone`.
2. Generate a random numeric OTP (default 6 digits), SHA-256 hash it, and store it in `adminOtps` with a TTL (default 10 minutes).
3. Invalidate any prior unredeemed OTPs for the same admin.
4. Send the OTP to `recoveryPhone` via SMS (provider configurable; `mock` writes to server logs in dev).
5. Rate-limited per IP (default 5 requests per 15 min).

#### POST `/api/auth/password-recovery/verify`
Verify OTP and reset password. Body:
```json
{
  "email": "admin@docfix.app",
  "otp": "123456",
  "newPassword": "NewStrongPass123"
}
```
Response: `200 OK` `{ "success": true, "message": "Password updated successfully. Please log in again." }`. `400` on missing fields, weak password (< 8 chars), invalid/expired OTP, or too many attempts. `500` on server error.

Behavior:
1. Load the active `Admin` record by email.
2. Find the latest unredeemed, unverified OTP for that admin and phone.
3. Reject if expired (`expiresAt` passed) or if `attempts >= maxAttempts`.
4. Compare the submitted OTP against `otpHash` using a timing-safe comparison; increment attempts on each check.
5. On success, mark the OTP verified + consumed (single-use), rotate `admin.passwordHash` with scrypt, and revoke all existing `AdminSession` records so the admin must log in again with the new password.

### 3. Analytics Reporting (Protected - Requires Auth)

All reporting endpoints accept query params: `startDate`, `endDate` (ISO 8601), `domain` (optional), `granularity` ('day'|'hour', optional). Dates default to last 30 days if not provided.

#### GET `/api/analytics/reports/overview`
Returns high-level metrics.
```json
{
  "success": true,
  "data": {
    "pageViews": 12345,
    "uniqueVisitors": 2345,
    "sessions": 3456,
    "bounceRate": 45.2,
    "avgSessionDuration": 125, // seconds
    "avgPagesPerSession": 3.57,
    "returningVisitors": 456,
    "newVisitors": 1889,
    "totalEvents": 15678
  },
  "period": { "startDate": "2026-09-09T00:00:00Z", "endDate": "2026-10-09T00:00:00Z" }
}
```

#### GET `/api/analytics/reports/sources`
Traffic sources breakdown.
```json
{
  "success": true,
  "data": [
    { "source": "direct", "visits": 1200, "percentage": 34.7 },
    { "source": "google", "visits": 800, "percentage": 23.1 },
    { "source": "twitter", "visits": 300, "percentage": 8.7 },
    { "source": "(referral)", "visits": 1156, "percentage": 33.5 }
  ]
}
```
Derived from referrer + UTM params.

#### GET `/api/analytics/reports/pages`
Top pages by views.
```json
{
  "success": true,
  "data": [
    { "path": "/", "title": "Home", "pageViews": 5000, "uniqueVisitors": 2100, "avgTime": 45 },
    { "path": "/tools", "title": "Tools", "pageViews": 3200, "uniqueVisitors": 1800, "avgTime": 62 }
  ]
}
```

#### GET `/api/analytics/reports/devices`
Device/browser/OS breakdown.
```json
{
  "success": true,
  "data": {
    "deviceTypes": [
      { "type": "desktop", "count": 2000, "percentage": 57.9 },
      { "type": "mobile", "count": 1200, "percentage": 34.7 },
      { "type": "tablet", "count": 256, "percentage": 7.4 }
    ],
    "browsers": [...],
    "operatingSystems": [...]
  }
}
```

#### GET `/api/analytics/reports/events`
Custom/click events.
```json
{
  "success": true,
  "data": [
    { "eventType": "click", "count": 4500 },
    { "eventType": "pageview", "count": 12345 },
    { "customName": "download", "count": 890 }
  ]
}
```

#### GET `/api/analytics/reports/live`
Recent activity (Phase 8).
```json
{
  "success": true,
  "data": {
    "activeVisitors": 12,
    "activeSessions": 15,
    "recentEvents": [
      { "path": "/img/ImageResizer", "timestamp": "2026-10-09T02:50:00Z", "visitorId": "..." }
    ]
  }
}
```

#### GET `/api/analytics/reports/time-series`
Pageviews over time for charts.
```json
{
  "success": true,
  "data": [
    { "date": "2026-10-09T00:00:00Z", "pageViews": 450, "sessions": 120, "visitors": 95 }
  ]
}
```

### 4. Health/Status
- GET `/health` — server health (existing)
- GET `/status` — DB status (existing)
- GET `/api/analytics/health` — analytics service health

## Security & Privacy Considerations

- **PII**: Never store raw IPs, emails, passwords, or form inputs. Store only hashed values where needed (ipHash).
- **URL Sanitization**: Strip sensitive query params (token, password, email, auth, session) before persisting URLs.
- **Referrer Policy**: Respect privacy; store domains only when appropriate.
- **Consent**: Design to support consent flags (respectDNT, future opt-in/out).
- **Rate Limiting**: Apply to tracking endpoints (prevent spam/abuse). Suggested: 100 req/min per IP for /track.
- **CORS**: Restrict to trusted domains in production.
- **Input Validation**: Validate all event payloads (type, UUID format, lengths).
- **Auth**: HttpOnly, Secure, SameSite=Lax cookies; 7-day or configurable expiry; rotate on login; revoke on logout.
- **Data Retention**: Plan for TTL/archival later (Phase 8/9).

## Implementation Notes

- Use `crypto.randomUUID()` for IDs (Node 18+). Fallback if needed.
- Device detection: parse User-Agent server-side (ua-parser-js) or client-side hints.
- GeoIP: optional, privacy-respecting (country-level only). Defer to Phase 9 if heavy.
- Bounce rate: session with 1 pageview and < 30s duration (configurable).
- Engagement: heartbeat every 15-30s while tab active (Phase 8).
- SPA navigation: track via route changes (Next.js App Router via client component).

This design satisfies Phase 2 requirements (approved API contract + MongoDB schema). No implementation yet.