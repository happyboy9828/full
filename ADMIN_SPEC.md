# Administrative Login & Dashboard — Technical Specification

**Status:** Implemented (this document describes the shipped system)
**Scope:** `/kingdome/*` admin area — authentication, RBAC, dashboard shell and data-management modules.
**Stack:** Next.js 16 (App Router, React 19) + Express 5 + MongoDB/Mongoose 9.

---

## 1. Architecture

### 1.1 Request flow

```
Browser (Next.js client :3000)
   │  fetch("/api/auth/login", { credentials: "include" })
   ▼
Next.js rewrite  (next.config.mjs → BACKEND_URL)
   │  /api/auth/*  → backend /api/auth/*
   │  /api/admin/* → backend /api/admin/*
   ▼
Express app (backend :5000)
   │  cookie-parser → routes/auth.js | routes/admin.js
   │  middleware/auth.js  (resolveSession → requireAdmin)
   │  middleware/rbac.js  (requirePermission / requireRole)
   │  controllers/*       (business logic)
   ▼
MongoDB (Atlas) — admins, adminsessions, adminactivities, appusers
```

The admin area is a **separate origin-neutral surface** inside the marketing
site. The root layout always renders the public `Navbar`/`Footer`; the admin
area hides them with a pure-CSS `body:has(#admin-route-marker)` rule. The
marker element is emitted by `client/app/kingdome/layout.js`, so the rule
applies on the first paint — no flash of site chrome, no client script that
mutates React-managed attributes.

### 1.2 Design decisions

| Decision | Rationale |
| --- | --- |
| **Opaque server-side sessions** (32 random bytes in an httpOnly cookie) instead of JWT | Sessions can be revoked instantly, roles can change without waiting for a token to expire, and the audit trail can attribute every request to a real session row. |
| **scrypt** for password hashing (`crypto.scryptSync`, N=16384, r=8, p=1) | Ships with Node's standard library — no native build step, no extra dependency to audit. Format `salt:keyHex`. |
| **Permissions, not roles, are the enforcement unit** | Routes declare `requirePermission("users.manage")`. Roles are just named bundles of permissions, so new modules do not need a role. |
| **Client-side RBAC is UX only** | The client hides what a role cannot use; the server re-checks every request. The client matrix is never a security boundary. |
| **Audit trail is append-only** | `AdminActivity` has no update path. Every mutating action and every authentication attempt is recorded. |
| **IP / user-agent stored as SHA-256 hashes** | The audit trail needs correlation, not surveillance. Raw IPs are never persisted. |

### 1.3 Recommended stack (for a green-field rebuild)

The implementation in this repository is the recommendation, made concrete:

* **Frontend — Next.js (App Router).** Server Components by default, client
  components only where interactivity is needed. Route handlers/proxy for the
  API rewrite keep cookies first-party, which removes CORS and `SameSite`
  problems entirely.
* **Backend — Express 5 + Mongoose.** Thin controllers, middleware-based auth,
  no service layer needed at this size.
* **Database — MongoDB.** Document model fits the analytics workload; the
  admin system reuses the same cluster and connection pool.

Alternatives considered: Django + DRF (stronger ORM/admin, but the analytics
aggregation workload is Mongo-shaped); NestJS (more ceremony than the
handful of admin endpoints justify).

---

## 2. Authentication

### 2.1 Endpoints

| Method | Path | Auth | Purpose |
| --- | --- | --- | --- |
| POST | `/api/auth/login` | public (rate limited) | Sign in. Body `{ email, password }`. |
| POST | `/api/auth/logout` | optional | Revoke the current session and clear the cookie. |
| GET | `/api/auth/me` | session | Current identity + effective permissions. |
| POST | `/api/auth/password` | session | Change own password; revokes other sessions. |
| PATCH | `/api/auth/profile` | session | Update own display name / recovery phone. |
| GET | `/api/auth/sessions` | session | List the account's active sessions. |
| DELETE | `/api/auth/sessions/:id` | session | Revoke one session. |
| POST | `/api/auth/password-recovery/request` | public (rate limited) | Existing SMS OTP recovery flow. |
| POST | `/api/auth/password-recovery/verify` | public (rate limited) | Existing SMS OTP recovery flow. |

### 2.2 Login sequence

```
POST /api/auth/login { email, password }
  │
  ├─ password missing            → 400 "Password is required"
  ├─ email absent                → legacy operator login (env password → superadmin role)
  ├─ account not found           → dummyVerify() (timing equalisation) → 401 generic
  ├─ account locked              → 429 + Retry-After
  ├─ password mismatch           → failedLoginAttempts++ ; lock after N → 401 generic
  ├─ account inactive            → 403 "This account has been deactivated"
  └─ success
       ├─ reset failedLoginAttempts / lockedUntil
       ├─ lastLoginAt + lastLoginIpHash
       ├─ create AdminSession (opaque token, role snapshot, absolute expiry)
       ├─ Set-Cookie: admin_session (httpOnly, sameSite=lax, secure in prod)
       ├─ append AdminActivity "auth.login"
       └─ 200 { success, user: { id, email, name, role, roleLabel, permissions }, expiresAt }
```

**Error messages are deliberately generic.** `Invalid email or password` is
returned for both an unknown email and a wrong password so the endpoint
cannot be used to enumerate accounts. A dummy scrypt verification runs on the
unknown-account path so response time does not leak existence either.

### 2.3 Brute-force protection (two layers)

| Layer | Scope | Default |
| --- | --- | --- |
| IP rate limit | `POST /api/auth/login` | 20 failures / 15 min |
| Account lockout | per admin account | 5 failures → 15 min lock |

The IP limiter uses `countOnlyFailures: true`: successful logins release the
slot again, so a legitimate administrator is never locked out by their own
successful sign-ins. The account lockout is persisted on the `Admin` document
(`failedLoginAttempts`, `lockedUntil`), so it survives a server restart.

### 2.4 Session model

| Field | Purpose |
| --- | --- |
| `sessionToken` | 32 random bytes (hex), indexed unique — the cookie value |
| `userId` | `Admin._id`, or `"admin"` for the legacy operator account |
| `email`, `name`, `role` | Identity/role snapshot for the audit trail |
| `ipHash`, `userAgentHash`, `userAgent` | Device correlation, IP hashed |
| `expiresAt` | Idle expiry — slides forward while the user is active |
| `absoluteExpiresAt` | Hard session lifetime; `expiresAt` never passes it |
| `lastActivityAt` | Last request timestamp |
| `revokedAt` | Set on logout, password change, deactivation or admin deletion |

TTL index on `expiresAt` (`expireAfterSeconds: 0`) means expired sessions are
removed by MongoDB rather than accumulating.

### 2.5 Cookie

`admin_session` — `httpOnly`, `sameSite=lax`, `path=/`, `secure` in
production, 7-day lifetime. Because the client calls the API through the
Next.js rewrite, the cookie is always first-party: no CORS preflight, no
`SameSite` cross-site restrictions.

---

## 3. Authorization & RBAC

### 3.1 Roles

| Role | Level | Permissions |
| --- | --- | --- |
| `superadmin` | 40 | all |
| `admin` | 30 | `dashboard.view`, `analytics.view`, `activity.view`, `users.view`, `users.manage`, `system.view`, `settings.view` |
| `analyst` | 20 | `dashboard.view`, `analytics.view`, `activity.view` |
| `viewer` | 10 | `dashboard.view` |

### 3.2 Permission catalogue

| Permission | Grants |
| --- | --- |
| `dashboard.view` | Traffic dashboard |
| `analytics.view` | Analytics modules (pages, sources, devices, events, live) |
| `users.view` | Read the application user table |
| `users.manage` | Create / edit / suspend / delete application users |
| `activity.view` | Read the audit trail |
| `system.view` | Read system statistics |
| `settings.view` | Own profile, password and sessions |
| `settings.manage` | Global settings (reserved) |
| `admins.manage` | Create / edit / disable / delete administrator accounts |
| `sessions.manage` | Revoke other users' sessions (reserved) |

### 3.3 Enforcement

```js
// backend/routes/admin.js
router.use(requireAdmin);                                   // valid session
router.get("/users",  requirePermission(PERMISSIONS.USERS_VIEW),  listUsers);
router.post("/users", writeLimiter, requirePermission(PERMISSIONS.USERS_MANAGE), createUser);
```

`requireAdmin` populates `req.admin = { id, email, name, role, permissions, isActive }`.
`requirePermission` answers `403` with the missing permission so the client
can show an accurate message.

Guard rails for privileged mutations:

* Only a `superadmin` may modify administrator accounts.
* The last active superadmin cannot be demoted, disabled or deleted.
* An administrator cannot delete their own account.
* A password reset or deactivation revokes that account's sessions immediately.

### 3.4 Client-side gating

* `AuthProvider` exposes `user`, `role`, `permissions` and `hasPermission()`.
* `lib/adminNav.js` declares a required permission per navigation entry;
  `Sidebar` filters the list so a viewer never sees a link that would 403.
* `AdminShell` accepts `requirePermission` and renders a 403 panel instead of
  the content.
* `client/middleware.js` performs a *fast path* only: no `admin_session`
  cookie → redirect to `/kingdome/login?redirect=…`. It does not validate the
  cookie; the server does that on every request.

---

## 4. Dashboard interface

### 4.1 Shell

```
┌────────────┬──────────────────────────────────────────────┐
│            │  AdminHeader  (sticky)                      │
│  Sidebar   │  title · subtitle · search · bell · profile   │
│  (fixed)   ├──────────────────────────────────────────────┤
│            │                                              │
│  Analytics │  AdminContent                                │
│  Management│  metric cards · charts · tables              │
│  Account   │                                              │
└────────────┴──────────────────────────────────────────────┘
```

| Component | File | Responsibility |
| --- | --- | --- |
| `AdminShell` | `client/components/AdminShell/AdminShell.js` | Layout, session gate, permission gate |
| `AdminHeader` | `client/components/AdminHeader/AdminHeader.js` | Title bar, search, notifications, profile menu |
| `Sidebar` | `client/components/Sidebar/Sidebar.js` | Sectioned, permission-filtered navigation |
| `AdminShell.css` | `client/components/AdminShell/AdminShell.css` | Shared admin primitives (panels, tables, badges, forms, modal) |

### 4.2 Responsive behaviour

| Breakpoint | Layout |
| --- | --- |
| `< 768px` | Sidebar becomes an off-canvas drawer opened by a floating hamburger; the header pads left to clear it; the search field collapses; the profile shows only the avatar |
| `768–1023px` | Sidebar collapses to a 72px icon rail with a toggle |
| `≥ 1024px` | Sidebar fixed at 240px, always expanded |

### 4.3 Profile menu

Avatar (initials), display name, role badge, `Profile & security` link and
`Sign out`. The dropdown closes on outside click and on `Escape`.

---

## 5. Core modules

| Module | Route | Permission | Backend |
| --- | --- | --- | --- |
| Traffic dashboard | `/kingdome/dashboard` | `dashboard.view` | `/api/analytics/reports/*` |
| Users | `/kingdome/users` | `users.view` / `users.manage` | `/api/admin/users` |
| Administrators | `/kingdome/admins` | `admins.manage` | `/api/admin/admins` |
| Activity log | `/kingdome/activity` | `activity.view` | `/api/admin/activity` |
| System | `/kingdome/system` | `system.view` | `/api/admin/system` |
| Settings | `/kingdome/settings` | `settings.view` | `/api/auth/profile`, `/password`, `/sessions` |
| Pages | `/kingdome/pages` | `analytics.view` | `/api/analytics/reports/pages` |
| Traffic sources | `/kingdome/traffic-sources` | `analytics.view` | `/api/analytics/reports/sources` |
| Devices | `/kingdome/devices` | `analytics.view` | `/api/analytics/reports/devices` |
| Live visitors | `/kingdome/live-visitors` | `analytics.view` | `/api/analytics/reports/live` |
| Events | `/kingdome/events` | `analytics.view` | `/api/analytics/reports/events` |

### 5.1 Analytics modules (Pages, Traffic sources, Devices, Live visitors, Events)

All five share one filter bar and one presentation layer
(`client/components/AdminReports/`):

- **Filter bar** (`ReportToolbar`) — from/to date inputs, 7/30/90-day presets and
  an optional domain filter (the hostname captured by the tracking client).
  The date window is widened to the start of the first day and the end of the
  last day so the selected days are inclusive.
- **Stat strip** (`ReportStatGrid`) — four headline metrics per module.
- **Bar list** (`BarList`) — ranked distribution with proportional bars.
- **States** (`ReportStates`) — loading, error (with retry), empty and
  "last updated" stamp.
- **CSV export** (`client/lib/csv.js`) — every table exports the current
  filtered rows as a UTF-8 CSV (BOM included so Excel reads it correctly).

Module specifics:

| Module | Content |
| --- | --- |
| Pages | Ranked table of every page that received a pageview — path, title, views, visitors, share of the top page, average time. Free-text search on path/title, sort by views/visitors/time/path, 25 rows per page. |
| Traffic sources | Ranked table and distribution bars of session sources. Sessions without a referrer or a UTM source are reported as `direct`. |
| Devices | Device-type split (bar list + table with per-type icons), browser split and operating-system table. |
| Live visitors | Sessions active in the last five minutes and the most recent events, polled every 15 s with an auto-refresh toggle. No date filter — the backend always uses a rolling five-minute window. |
| Events | Count of every tracked event type (and custom event name) with share bars, a type filter and a top-ten distribution. |

### 5.2 Users table

Search (name / email / company), status filter, role filter, pagination
(default 25 per page, max 100). Create and edit use a modal form; row actions
suspend / reactivate and delete. Status and plan render as coloured badges.

### 5.3 Activity log

Every administrative action and authentication attempt. Filters: free-text
search, action facet, success/failure. Columns: timestamp, actor (+ role),
action, target, result, details. IP addresses are shown only as hashes.

### 5.4 System statistics

Runtime (uptime, Node version, environment), memory (RSS / heap / system),
database (state, host, size on disk when the deployment exposes it),
collection counters and the most frequent audit actions.

---

## 6. Database schema

### 6.1 `admins`

| Field | Type | Notes |
| --- | --- | --- |
| `email` | String | required, unique, lowercase, indexed |
| `name` | String | display name; falls back to the email |
| `passwordHash` | String | `salt:keyHex` (scrypt) — never returned by the API |
| `role` | String | enum `superadmin \| admin \| analyst \| viewer` |
| `recoveryPhone` | String | optional; used by the SMS OTP recovery flow |
| `isActive` | Boolean | default `true` |
| `failedLoginAttempts` | Number | lockout counter |
| `lockedUntil` | Date | lock expiry |
| `lastLoginAt` | Date | last successful sign-in |
| `lastLoginIpHash` | String | SHA-256 of the client IP |
| `passwordUpdatedAt` | Date | last credential change |

Indexes: `email` (unique), `role + isActive`.

### 6.2 `adminsessions`

| Field | Type | Notes |
| --- | --- | --- |
| `sessionToken` | String | required, unique — the cookie value |
| `userId` | String | `Admin._id` or `"admin"` |
| `email`, `name`, `role` | String | snapshot |
| `ipHash`, `userAgentHash` | String | SHA-256 hashes |
| `userAgent` | String | truncated to 255 chars |
| `expiresAt` | Date | idle expiry, slides forward |
| `absoluteExpiresAt` | Date | hard lifetime |
| `createdAt`, `lastActivityAt` | Date | |
| `revokedAt` | Date | set on revocation |

Indexes: `sessionToken` (unique), `userId + createdAt`, TTL on `expiresAt`.

### 6.3 `adminactivities`

| Field | Type | Notes |
| --- | --- | --- |
| `actorId`, `actorEmail`, `actorName`, `actorRole` | String | the acting administrator |
| `action` | String | e.g. `auth.login`, `user.update`, `admin.create` |
| `targetType`, `target` | String | what was acted on |
| `status` | String | `success \| failure` |
| `message` | String | human-readable summary |
| `meta` | Mixed | structured context |
| `ipHash`, `userAgentHash` | String | SHA-256 hashes |
| `createdAt` | Date | |

Indexes: `createdAt`, `actorEmail + createdAt`, `action + createdAt`.

### 6.4 `appusers`

| Field | Type | Notes |
| --- | --- | --- |
| `name` | String | required |
| `email` | String | required, unique, lowercase |
| `company`, `phone`, `notes` | String | free text |
| `role` | String | enum `owner \| admin \| member \| viewer` |
| `status` | String | enum `active \| invited \| suspended` |
| `plan` | String | enum `free \| pro \| team \| enterprise` |
| `lastSeenAt` | Date | |
| `createdAt`, `updatedAt` | Date | timestamps |

Indexes: `email` (unique), `status + createdAt`, `role + status`.

---

## 7. API reference (admin)

### `GET /api/admin/users`

Query: `search`, `status`, `role`, `page` (default 1), `limit` (default 25,
max 100).

```json
{
  "success": true,
  "data": [ { "_id": "…", "name": "Ada Lovelace", "email": "ada@example.com",
              "role": "owner", "status": "active", "plan": "enterprise",
              "company": "Analytical Engines Ltd", "createdAt": "…", "lastSeenAt": null } ],
  "pagination": { "page": 1, "limit": 25, "total": 5, "totalPages": 1 }
}
```

### `POST /api/admin/users` → `201`

Body: `name`, `email`, `company?`, `role?`, `status?`, `plan?`, `phone?`,
`notes?`. `409` if the email is taken.

### `PATCH /api/admin/users/:id`

Partial update of `name`, `company`, `role`, `status`, `plan`, `phone`,
`notes`. `400` on an invalid enum value.

### `DELETE /api/admin/users/:id`

`404` when the record does not exist.

### `GET /api/admin/admins`

All administrator accounts. Password hashes and lockout counters are never
serialised (`publicAdmin()`).

### `POST /api/admin/admins` → `201`

Body: `email`, `name`, `password`, `role?`, `recoveryPhone?`. The password
must satisfy the policy (≥ 8 characters, ≥ 1 letter, ≥ 1 number).

### `PATCH /api/admin/admins/:id`

Body: `name?`, `role?`, `isActive?`, `recoveryPhone?`, `password?`. Supplying
`password` resets the credential and revokes that account's sessions.

### `DELETE /api/admin/admins/:id`

Cannot delete your own account; cannot delete the last active superadmin.

### `GET /api/admin/activity`

Query: `search`, `action`, `status`, `actor`, `from`, `to`, `page`, `limit`
(default 30, max 200). Also returns an `action` facet list for the filter
dropdown.

### `GET /api/admin/system`

Runtime, memory, database and collection counters, plus the top audit
actions.

---

## 8. Directory structure

```
fullstack/
├── backend/
│   ├── config/
│   │   ├── env.js                  # environment configuration
│   │   └── roles.js                # RBAC matrix  ← new
│   ├── controllers/
│   │   ├── authController.js       # login/logout/me/password/profile/sessions
│   │   ├── adminUsersController.js # application users + admin accounts  ← new
│   │   ├── activityController.js   # audit trail reader                ← new
│   │   ├── systemController.js     # runtime + collection statistics   ← new
│   │   ├── otpController.js        # SMS password recovery
│   │   ├── reportsController.js    # analytics reports
│   │   └── analyticsController.js  # tracking ingestion
│   ├── middleware/
│   │   ├── auth.js                 # requireAdmin / optionalAdmin / resolveSession
│   │   ├── rbac.js                 # requirePermission / requireRole  ← new
│   │   ├── rateLimit.js            # in-memory limiter
│   │   └── validate.js
│   ├── models/
│   │   ├── Admin.js                # administrator accounts
│   │   ├── AdminSession.js         # server-side sessions
│   │   ├── AdminActivity.js        # audit trail                      ← new
│   │   ├── AppUser.js              # application users                ← new
│   │   ├── Site.js  Session.js  Event.js  DailyStats.js  Feedback.js
│   │   └── index.js
│   ├── routes/
│   │   ├── index.js                # router mounting
│   │   ├── auth.js                 # /api/auth/*
│   │   ├── admin.js                # /api/admin/*                     ← new
│   │   ├── analytics.js  reports.js  dailyStats.js  feedback.js  recovery.js  health.js
│   ├── scripts/
│   │   └── seed-admin.js           # bootstrap + demo seed            ← new
│   ├── test/
│   │   └── admin-auth.test.js      # offline auth/RBAC suite         ← new
│   ├── utils/
│   │   ├── password.js             # scrypt hash / verify / policy
│   │   ├── cookies.js              # session cookie helpers
│   │   ├── audit.js                # audit trail writer              ← new
│   │   └── sms.js
│   ├── app.js  index.js  package.json
│
└── client/
    ├── app/
    │   ├── layout.js               # root layout (site chrome)
    │   ├── globals.css
    │   ├── kingdome/
    │   │   ├── layout.js           # admin marker element            ← new
    │   │   ├── page.js             # → /kingdome/dashboard            ← new
    │   │   ├── login/page.js       # sign-in form                    ← rewritten
    │   │   ├── dashboard/           # traffic dashboard (live)
    │   │   ├── users/page.js       # user table                      ← new
    │   │   ├── admins/page.js      # administrator accounts          ← new
    │   │   ├── activity/page.js    # audit trail                     ← new
    │   │   ├── system/page.js      # system statistics               ← new
    │   │   ├── settings/page.js    # profile, password, sessions     ← rewritten
    │   │   └── pages|traffic-sources|devices|live-visitors|events/   # analytics modules ← rewritten
    ├── components/
    │   ├── AdminShell/             # shell + shared admin CSS        ← new
    │   ├── AdminHeader/            # top bar + profile menu          ← new
    │   ├── AuthProvider/           # auth context + permissions
    │   ├── Sidebar/                # permission-filtered navigation
    │   ├── AdminReports/           # analytics modules + shared UI   ← new
    │   └── ClientProviders/ TrackingProvider/ Navbar/ Footer/ …
    ├── lib/
    │   ├── adminApi.js             # admin + auth + reports API      ← new
    │   ├── adminNav.js             # navigation map + permissions    ← new
    │   ├── permissions.js          # permission constants            ← new
    │   ├── useAdminQuery.js        # collection fetch hook           ← new
    │   ├── useReportQuery.js       # report fetch hook (polling)     ← new
    │   ├── reportParams.js         # date-window + query params      ← new
    │   ├── csv.js                  # CSV export helper               ← new
    │   ├── format.js               # number/date/duration formatting ← new
    │   ├── analyticsApi.js  useReport.js  tracking.js  pages.js
    ├── middleware.js               # fast-path cookie redirect
    └── next.config.mjs             # /api/auth + /api/admin rewrites
```

---

## 9. Configuration

### Backend (`.env`)

| Variable | Default | Purpose |
| --- | --- | --- |
| `ADMIN_PASSWORD` | `kingdom` | Legacy operator password |
| `ADMIN_PASSWORD_HASH` | — | Pre-computed scrypt hash (preferred in production) |
| `ADMIN_EMAIL` | — | Primary operator account email |
| `ADMIN_SESSION_TTL_DAYS` | `7` | Absolute session lifetime |
| `ADMIN_SESSION_IDLE_HOURS` | `24` | Idle timeout |
| `ADMIN_MAX_LOGIN_ATTEMPTS` | `5` | Attempts before lockout |
| `ADMIN_LOCKOUT_MINUTES` | `15` | Lockout duration |
| `ADMIN_BOOTSTRAP_EMAIL` | `admin@docstools.app` | Seed account email |
| `ADMIN_BOOTSTRAP_NAME` | `Super Administrator` | Seed account name |
| `ADMIN_BOOTSTRAP_PASSWORD` | — | Seed account password |
| `ADMIN_ACTIVITY_RETENTION_DAYS` | `90` | Audit retention window |

### Client

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_ADMIN_API` | Override the admin API base (default `/api`, proxied by the Next rewrite) |
| `NEXT_PUBLIC_TRACKING_API` | Analytics API base (default `/api`) |
| `BACKEND_URL` | Backend origin used by the Next rewrites |

---

## 10. Seeding and operations

```bash
cd backend
npm run seed        # ensure the bootstrap super admin exists
npm run seed:demo   # also create demo admins + application users
npm test            # offline auth/RBAC test suite (22 assertions)
```

Demo accounts created by `npm run seed:demo` (password `Docstools#2026`):

| Email | Role |
| --- | --- |
| `admin@docstools.app` | `superadmin` (password = `ADMIN_PASSWORD`) |
| `ops@docstools.app` | `admin` |
| `analyst@docstools.app` | `analyst` |
| `viewer@docstools.app` | `viewer` |

### Manual smoke test

```bash
# 1. sign in
curl -i -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@docstools.app","password":"kingdom"}' -c cookies.txt

# 2. read the identity + permissions
curl -s http://localhost:5000/api/auth/me -b cookies.txt

# 3. read the user table
curl -s "http://localhost:5000/api/admin/users?limit=5" -b cookies.txt

# 4. confirm a viewer is refused
curl -i http://localhost:5000/api/admin/users -b viewer-cookies.txt   # → 403
```

---

## 11. Security checklist

| Concern | Control |
| --- | --- |
| Password storage | scrypt, random 16-byte salt, never returned by the API |
| Credential enumeration | Generic 401 + dummy verification on unknown accounts |
| Brute force | Per-IP rate limit (failures only) + per-account lockout |
| Session theft | httpOnly cookie, `SameSite=Lax`, `Secure` in production |
| Session lifetime | 24 h idle timeout, 7-day hard cap |
| Privilege escalation | Permission check on every request; last-superadmin guard |
| Session revocation | Instant on logout, password change, deactivation, deletion |
| Auditability | Append-only trail of every action and auth attempt |
| PII in logs | IP and user agent stored as SHA-256 hashes |
| Clickjacking / sniffing | `helmet` CSP/HSTS, `secure: true` cookies in production |
| Client-side trust | The client matrix is UX only; the server is the authority |

### Known gaps / next steps

1. **The rate limiter is in-process** — it does not survive a restart and is
   not shared between instances. Move it to Redis before scaling out.
2. **The audit trail has no retention job** — `ADMIN_ACTIVITY_RETENTION_DAYS`
   is configured but not yet enforced by a scheduled task.
3. **No CSRF token** — the API is cookie-authenticated, so a cross-site POST
   from a third-party page is possible in theory. The mitigation today is
   `SameSite=Lax` plus the JSON-only content type; add an explicit
   double-submit token before enabling cross-site embeds.
4. **No MFA** — TOTP/WebAuthn is the natural next step for `superadmin`.
5. **Two-factor for the SMS recovery flow** — OTP delivery still depends on a
   single SMS provider.
