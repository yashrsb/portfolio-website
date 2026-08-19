# Analytics System

## Overview

The portfolio includes a **first-party, privacy-conscious analytics system**.
No third-party tracking scripts (Google Analytics, Plausible, etc.) are used.
All events are collected by the portfolio's own backend and viewed through
the admin dashboard.

## Design Goals

- **Privacy first** — No raw IPs or full user-agents are stored. A daily-rotated
  hash of `IP + User-Agent` is used for unique-visitor counting.
- **Bot filtering** — Requests from known crawlers/bots are dropped before
  storage using a regex-based detector (30+ patterns).
- **Rate limited** — The public ingestion endpoint is rate-limited per IP
  (default: 60 events / 60 seconds) to prevent abuse.
- **Aggregate only in admin** — The admin dashboard only ever sees aggregated
  statistics. Raw event rows are never exposed to any API response.

## Data Flow

```
Browser (frontend)
  │
  │  navigator.sendBeacon (POST /api/v1/analytics/events)
  │  or fetch with { keepalive: true } (fallback)
  │
  └─► Backend: analyticsRateLimiter → analyticsValidator →
        analyticsController.recordEventHandler →
        analyticsService.recordEvent →
          1. isBotUserAgent(userAgent) → drop if true
          2. generateVisitorHash(ip, userAgent) → daily-salt SHA-256
          3. parseUserAgent(userAgent) → device / browser / OS
          4. resolveCountry(req) → from cf-ipcountry or similar header
          5. analyticsRepository.createEvent({ ...aggregated data })
```

## Schema

The `AnalyticsEvent` model (see `backend/prisma/schema.prisma`):

| Field         | Type           | Nullable | Description                                  |
| ------------- | -------------- | -------- | -------------------------------------------- |
| `id`          | `String` (UUID)| no       | Primary key                                  |
| `eventType`   | `AnalyticsEventType` | no  | `PAGE_VIEW`, `PROJECT_VIEW`, `PROJECT_CLICK`, `BLOG_POST_VIEW` |
| `path`        | `String`       | no       | URL path of the event (e.g. `/projects/notifyhub`) |
| `projectId`   | `String` (FK)  | yes      | Links to `Project.id` when applicable        |
| `blogPostId`  | `String` (FK)  | yes      | Links to `BlogPost.id` when applicable       |
| `visitorHash` | `String`       | no       | Daily-rotated SHA-256 of `IP + User-Agent`   |
| `country`     | `String`       | no       | ISO country code from proxy header or `Unknown` |
| `deviceType`  | `DeviceType`   | no       | `DESKTOP`, `MOBILE`, `TABLET`, `UNKNOWN`     |
| `browser`     | `BrowserType`  | no       | `CHROME`, `FIREFOX`, `SAFARI`, `EDGE`, `OTHER` |
| `os`          | `OperatingSystem` | no   | `WINDOWS`, `MACOS`, `LINUX`, `IOS`, `ANDROID`, `OTHER` |
| `referrer`    | `String`       | yes      | Referring URL, if available                  |
| `metadata`    | `Json`         | yes      | Arbitrary key/value pairs (validated, size-limited) |
| `createdAt`   | `DateTime`     | no       | Timestamp of the event                       |

**Indexes** (on `createdAt`, `eventType`, `projectId`, `blogPostId`,
`visitorHash`, and a composite on `(eventType, createdAt)` for fast
aggregations).

## Public API

### `POST /api/v1/analytics/events`

Ingest a single analytics event from the frontend. Rate-limited per IP.

**Request body:**

```json
{
  "eventType": "PAGE_VIEW",
  "path": "/projects/notifyhub",
  "projectSlug": "notifyhub",
  "metadata": { "source": "nav-link" }
}
```

| Field          | Required | Description                                      |
| -------------- | -------- | ------------------------------------------------ |
| `eventType`    | yes      | One of `PAGE_VIEW`, `PROJECT_VIEW`, `PROJECT_CLICK`, `BLOG_POST_VIEW` |
| `path`         | yes      | URL path (max 500 chars)                         |
| `projectSlug`  | no       | Resolved to a `Project.id` internally            |
| `blogPostSlug` | no       | Resolved to a published `BlogPost.id`            |
| `metadata`     | no       | JSON object (max 10 keys, values ≤ 500 chars)    |

**Response:** `202 Accepted` on success. The event is enqueued for best-effort
processing (fire-and-forget).

**Rate limit:** 60 requests / 60 seconds per IP (configurable). Exceeding
returns `429` with `RATE_LIMIT_EXCEEDED`.

### Bot Detection

Known crawler/bot user-agents are identified by `isBotUserAgent()`
(`src/utils/botDetection.js`). Matching events are silently dropped — no
response body, just `202`.

### Visitor Hashing

`generateVisitorHash(ip, userAgent)` (`src/utils/visitorHash.js`):

- Normalises the IP (strips port, IPv4-mapped IPv6 prefix).
- Concatenates with the full user-agent string.
- Prepends a daily-rotating salt derived from `process.env.VISITOR_HASH_SECRET`
  (or a hardcoded default for local dev) + the current date (ISO `yyyy-mm-dd`).
- Produces a SHA-256 hex digest.

This means:
- The same visitor is consistently identified within a day.
- The hash changes daily (cannot be tracked long-term).
- Raw IPs are never stored.

### Retention & Cleanup

Expired events (older than `DEFAULT_ANALYTICS_RETENTION_DAYS`, default 90) are
purged by a scheduled script:

```bash
cd backend
npm run analytics:cleanup
```

This runs `cleanupAnalytics.js`, which calls
`analyticsRepository.cleanupOldEvents(retentionDays)`.

## Admin API

All endpoints below require `ADMIN` (or `EDITOR`) role. They return
**aggregated** data only.

### `GET /api/v1/admin/analytics/overview?days=30`

Returns current + previous-period summary metrics.

```json
{
  "success": true,
  "data": {
    "current": {
      "totalVisitors": 100,
      "totalPageViews": 500,
      "totalProjectViews": 50,
      "totalProjectClicks": 10,
      "totalBlogViews": 30
    },
    "previous": {
      "totalVisitors": 80,
      "totalPageViews": 400,
      "totalProjectViews": 40,
      "totalProjectClicks": 8,
      "totalBlogViews": 20
    }
  }
}
```

### `GET /api/v1/admin/analytics/timeseries?days=30`

Daily visitor + page-view counts over the date range.

```json
{
  "success": true,
  "data": [
    { "date": "2025-08-01", "visitors": 12, "pageViews": 34 },
    { "date": "2025-08-02", "visitors": 8,  "pageViews": 22 }
  ]
}
```

### `GET /api/v1/admin/analytics/pages?days=30&limit=10`

Top pages by event count.

| Field         | Type    | Description                          |
| ------------- | ------ | ------------------------------------ |
| `path`        | string | URL path                             |
| `title`       | string | Human-readable title (if resolvable) |
| `eventType`   | enum   | The AnalyticsEventType for this path |
| `count`       | int    | Total events                         |
| `uniqueVisitors` | int  | Distinct visitor hashes              |

### `GET /api/v1/admin/analytics/countries?days=30&limit=10`

Top countries by visitor count.

| Field    | Type   |
| -------- | ------ |
| `country`| string |
| `visitors` | int  |

### `GET /api/v1/admin/analytics/devices?days=30`

Device-type breakdown.

| Field      | Type   |
| ---------- | ------ |
| `deviceType` | enum |
| `count`    | int   |

### `GET /api/v1/admin/analytics/browsers?days=30`

Browser breakdown.

| Field    | Type   |
| -------- | ------ |
| `browser` | enum |
| `count`   | int   |

### `GET /api/v1/admin/analytics/projects?days=30`

Per-project statistics (views, clicks, unique visitors, click breakdown).

| Field           | Type  |
| --------------- | ----- |
| `slug`          | string|
| `title`         | string|
| `views`         | int   |
| `clicks`        | int   |
| `uniqueVisitors`| int   |
| `githubClicks`  | int   |
| `demoClicks`    | int   |

### `GET /api/v1/admin/analytics/referrers?days=30&limit=10`

Top referrers by visitor count.

| Field       | Type   |
| ----------- | ------ |
| `referrer`  | string |
| `visitors`  | int    |
| `percentage`| number |

## Frontend Integration

The frontend automatically tracks:

1. **Page views** — `useAnalytics()` hook (called in `App.jsx`) listens to
   `useLocation` changes and sends `PAGE_VIEW` events.
2. **Project views** — `ProjectDetailPage.jsx` sends `PROJECT_VIEW` when a
   project is viewed, `PROJECT_CLICK` when the GitHub or Demo link is clicked.
3. **Blog post views** — `BlogPost.jsx` sends `BLOG_POST_VIEW`.

Tracking is done via `navigator.sendBeacon()` (preferred) with a
`fetch({ keepalive: true })` fallback. Events are never-blocking and silently
fail on network errors.

### Opt-Out

Users can opt out of analytics at any time:

```js
import { setAnalyticsOptOut } from './utils/analyticsOptOut';
setAnalyticsOptOut(true);  // sets localStorage.analytics_opt_out = "true"
```

When opted out, all tracking calls are no-ops.

## Environment Variables

| Variable                                   | Description                          | Default  |
| ------------------------------------------ | ------------------------------------ | -------- |
| `DEFAULT_ANALYTICS_RATE_LIMIT_WINDOW_MS`   | Rate-limit window in ms              | `60000`  |
| `DEFAULT_ANALYTICS_RATE_LIMIT_MAX`         | Max events per window per IP         | `60`     |
| `DEFAULT_ANALYTICS_RETENTION_DAYS`         | Days to retain events before cleanup | `90`     |
| `VISITOR_HASH_SECRET`                      | Secret for daily visitor hash salt  | (random default) |
