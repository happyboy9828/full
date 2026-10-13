# Analytics API Connection Guide

## Base URL
All analytics endpoints are protected by admin authentication (cookie-based session).

**Base Path:** `/api/analytics/reports/`

## Protected Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/reports/overview` | Dashboard overview stats |
| GET | `/api/analytics/reports/sources` | Traffic sources |
| GET | `/api/analytics/reports/pages` | Top pages |
| GET | `/api/analytics/reports/devices` | Device breakdown |
| GET | `/api/analytics/reports/events` | Custom events |
| GET | `/api/analytics/reports/live` | Real-time visitors |
| GET | `/api/analytics/reports/time-series` | Time series data |
| GET | `/api/analytics/reports/funnel` | Conversion funnel |
| GET | `/api/analytics/reports/retention` | User retention |
| GET | `/api/analytics/reports/heatmap` | Click heatmaps |
| GET | `/api/analytics/reports/session-replay` | Session recordings |
| GET | `/api/analytics/reports/returning-visitors` | Returning users |
| GET | `/api/analytics/reports/recent-visitors` | Recent visitors |

### Daily Stats
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/daily-stats` | Computed daily stats (requires date range) |
| POST | `/api/analytics/daily-stats/compute` | Trigger daily stats computation |

## Authentication

The API uses **cookie-based session authentication** with the `admin_session` cookie.

### 1. Login to Get Session Cookie
```bash
POST /api/auth/login
Content-Type: application/json
{ "password": "admin123" }
```

**Response:** Sets `admin_session` cookie (HttpOnly, Secure, SameSite=Lax)

### 2. Use Cookie for Protected Requests
Include the cookie in subsequent requests:
```bash
GET /api/analytics/reports/overview
Cookie: admin_session=<token_from_login>
```

## Default Credentials

| Setting | Value | Environment Variable |
|---------|-------|---------------------|
| Admin Password | `admin123` | `ADMIN_PASSWORD` |
| Session TTL | 7 days | `ADMIN_SESSION_TTL_DAYS` |
| Password Hash | (auto-generated) | `ADMIN_PASSWORD_HASH` |

## Example: Complete Flow

### Using curl
```bash
# 1. Login and save cookies
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"password":"admin123"}' \
  -c cookies.txt

# 2. Fetch analytics data using saved cookies
curl -X GET "http://localhost:5000/api/analytics/reports/overview" \
  -b cookies.txt

# 3. Fetch with date range (optional query params)
curl -X GET "http://localhost:5000/api/analytics/reports/time-series?from=2024-01-01&to=2024-01-31" \
  -b cookies.txt
```

### Using JavaScript (fetch)
```javascript
// 1. Login
const loginRes = await fetch('http://localhost:5000/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  credentials: 'include', // Important: includes cookies
  body: JSON.stringify({ password: 'admin123' })
});

// 2. Fetch analytics (cookies sent automatically with credentials: 'include')
const analyticsRes = await fetch('http://localhost:5000/api/analytics/reports/overview', {
  credentials: 'include'
});
const data = await analyticsRes.json();
```

## Query Parameters (for reports)

Most report endpoints accept optional date range:
- `from` - Start date (ISO format: `YYYY-MM-DD`)
- `to` - End date (ISO format: `YYYY-MM-DD`)
- `tz` - Timezone (default: `UTC`)

Example:
```
GET /api/analytics/reports/overview?from=2024-01-01&to=2024-01-31&tz=America/New_York
```

## Error Responses

| Status | Reason |
|--------|--------|
| 401 | No session cookie / Invalid session / Expired session |
| 403 | Admin access required |
| 500 | Server error |

## Notes
- All endpoints require valid admin session
- Cookies must be sent with requests (`credentials: 'include'` in fetch)
- CORS must be configured to allow credentials from your dashboard origin
- In production, set `ADMIN_PASSWORD_HASH` for better security