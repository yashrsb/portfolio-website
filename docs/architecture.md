# Architecture

This document describes the architecture of the Portfolio project — a full-stack
personal portfolio website composed of a public React frontend, an admin React
dashboard, and a layered Express API backed by PostgreSQL (via Prisma).

## System Overview

```
┌────────────────────────────┐      ┌─────────────────────────────┐
│  Public Website (frontend) │      │  Admin Dashboard (admin)    │
│  React + Vite :5173        │      │  React + Vite :5174         │
└─────────────┬──────────────┘      └──────────────┬──────────────┘
              │  HTTP / JSON                       │  HTTP / JSON
              └────────────────┬───────────────────┘
                               ▼
                    ┌───────────────────────────┐
                    │  Express API (backend)    │
                    │  :5000  /api/v1           │
                    └──────┬────────────────────┘
                           │
              ┌────────────┼──────────────┐
              ▼            ▼              ▼
        ┌──────────┐  ┌─────────┐  ┌────────────┐
        │PostgreSQL│  │ Files   │  │  Logs      │
        │(Prisma)  │  │(uploads)│  │ (morgan)   │
        └──────────┘  └─────────┘  └────────────┘
```

## Backend Layered Architecture

The backend follows a strict layered design. Each layer has a single
responsibility and depends only on the layer below it.

```
Request
  → Middleware stack (helmet, cors, compression, request-id, cookie-parser,
    body-parser, request-logger, rate-limiter)
    → Routes (routes/v1)
      → Validators (express-validator rules)
        → Controllers (thin HTTP handlers)
          → Services (business logic)
            → Repositories (data access)
              → Database (Prisma / PostgreSQL)
```

### Layers

| Layer          | Responsibility                                                               |
| -------------- | ---------------------------------------------------------------------------- |
| `config`       | Environment validation, CORS, Helmet, rate-limit configuration.              |
| `constants`    | HTTP status codes, error codes, and user-facing messages.                    |
| `middlewares`  | Cross-cutting concerns: request ID, logging, auth, validation, errors.       |
| `routes`       | Define URL-to-handler mappings and mount validation rules.                   |
| `validators`   | `express-validator` rule chains for request payloads.                        |
| `controllers`  | Validate → call a service → send a standardized response. No business logic. |
| `services`     | Business logic. Async so persistence can change without touching HTTP.       |
| `repositories` | Data access. Currently Prisma/PostgreSQL.                                    |
| `storage`      | File storage abstraction (`StorageService` → `LocalStorageProvider`).        |
| `utils`        | `ApiError`, `ApiResponse`, `asyncHandler`, logger.                           |
| `import`       | YAML → normalizer → validator → importer (bulk portfolio import).            |

### Key Design Decisions

- **Clean separation of concerns** — Controllers never touch the database;
  services never read HTTP request/response objects.
- **Standardized response envelope** — Every endpoint returns the same shape:
  `{ success, message, data, meta }`.
- **Centralized error handling** — A single `errorHandler` middleware converts
  errors into consistent JSON responses with the correct status code.
- **Fail-fast configuration** — `config/env.js` validates required environment
  variables (DATABASE_URL, JWT secrets) and throws on startup if missing.
- **Versioned API** — All endpoints live under `/api/v1` to allow non-breaking
  evolution.

## Authentication Flow

Authentication uses short-lived access tokens (JWT, in-memory) and long-lived
refresh tokens (JWT, stored hashed in the database, delivered via HttpOnly
cookie).

```
Login
  POST /api/v1/auth/login
    → verify credentials against User table
    → issue access token (15m) + refresh token (7d)
    → store refresh token hash in DB
    → set refresh token as HttpOnly cookie
    → return access token in body

Refresh
  POST /api/v1/auth/refresh
    → read refresh token cookie
    → verify signature + existence + not revoked + not expired
    → rotate: revoke old, issue new pair
    → replacement chain tracked via RefreshToken.replacedBy

Logout
  POST /api/v1/auth/logout
    → revoke refresh token, clear cookie
```

- **Reuse detection** — if a revoked/rotated refresh token is presented again,
  the entire token family is revoked for security.
- **Role-based access** — `ADMIN` and `EDITOR` roles gate admin endpoints via
  the `authorize` middleware.
- **Security** — refresh cookie is `HttpOnly`, configurable `SameSite` and
  `Secure` flags; secrets are never logged.

## Resume Management

Resume files are managed through the `storage` layer:

```
ResumeController → ResumeService → ResumeRepository (DB metadata)
                                 → StorageService → LocalStorageProvider (file)
```

- Upload, replace, delete, and download flows are supported.
- The database stores metadata (filename, mime type, size, storage key, URL).
- The actual bytes are written to the configured upload directory
  (`STORAGE_LOCAL_UPLOAD_DIR`, default `uploads/`).
- Only `application/pdf` is allowed by default; max size is configurable
  (`STORAGE_MAX_SIZE_BYTES`, default 5 MB).
- The public portfolio can download the latest resume via
  `GET /api/v1/resume/download`.

## CRUD Architecture

The admin dashboard manages seven portfolio resources:
Projects, Skills, Experience, Education, Certificates, Achievements, and
Social Links.

- **Admin frontend** uses a generic `BaseCrudService` + `useResource` hook to
  avoid repeating fetch/loading/error/optimistic-update logic per resource.
- **Backend** exposes a generic CRUD + reorder pattern under `/api/v1/admin/*`
  with per-resource validators and a shared `adminController`/`adminService`/
  `adminRepository` trio.
- **Optimistic updates + rollback** on the client keep the UI responsive.
- **Reorder** is supported via a `displayOrder` field and a dedicated reorder
  endpoint.

## StorageService

`StorageService` abstracts file storage behind a single interface so the
default `LocalStorageProvider` can be swapped for S3/GCS later without
changing controllers or services.

```
StorageService
  ├── init()
  ├── save(buffer, metadata) → { storageKey, path, url }
  ├── delete(storageKey)
  └── getStream(storageKey)
```

## Frontend (Public Website)

- React + Vite + React Router.
- CSS Modules + design tokens (dark/light theme via `ThemeContext`).
- Pages: Home, About, Projects, Skills, Experience, Education, Contact,
  NotFound.
- Data fetched from the API via a small `apiClient` with timeout, retry, and
  abort support.
- Scroll-reveal animations respect `prefers-reduced-motion`.
- SEO-friendly semantic markup and meta tags.

## Admin Dashboard

- Separate React + Vite app on port 5174.
- Auth context (`AuthContext`) backing login/logout/refresh.
- `ProtectedRoute` guards admin pages.
- CRUD pages for all resources, a dashboard with stats, and a resume manager.
- Shared UI kit: `Button`, `Modal`, `DataTable`, `ConfirmDialog`, `Badge`,
  `Skeleton*`, error/loading states.
- CSS Modules scoped per component.

## Analytics System (Phase 13)

A first-party, privacy-conscious analytics system collects page views, project
views/clicks, and blog views without any third-party scripts.

```
Frontend (useAnalytics hook)
  │
  │ POST /api/v1/analytics/events (sendBeacon / fetch keepalive)
  │
  └─► AnalyticsController (public ingest, 202 Accepted)
        └─► AnalyticsService
              ├── isBotUserAgent() → drops crawlers
              ├── generateVisitorHash() → daily-salt SHA-256(IP+UA)
              ├── parseUserAgent() → device / browser / OS
              └── resolveCountry() → from proxy headers
                    └─► AnalyticsRepository.createEvent()
                          └─► PostgreSQL (Prisma AnalyticsEvent model)

Admin Dashboard
  └─► AnalyticsController (admin endpoints, aggregates only)
        └─► AnalyticsService
              └──► AnalyticsRepository (GROUP BY / date_trunc / COUNT DISTINCT)
                    └─► PostgreSQL
```

- **No raw data in admin** — all admin endpoints return aggregated metrics only.
- **Bot filtering** — a regex-based detector drops ~30 known crawler patterns.
- **Retention** — a cleanup script (`npm run analytics:cleanup`) purges events
  older than `DEFAULT_ANALYTICS_RETENTION_DAYS` (default 90).
- **Rate limited** — the public ingestion endpoint is rate-limited per IP
  (default 60 events / 60 s).
- **Dashboard endpoint** — the admin dashboard uses a single aggregated
  `GET /api/v1/admin/analytics/dashboard?days=N` request that fetches all
  metrics concurrently server-side, instead of 8 separate HTTP round-trips.
  Individual endpoints (`/overview`, `/timeseries`, `/pages`, etc.) remain
  available for other consumers.
- **Zero-filled time-series** — the `timeseries` response always includes one
  entry per day in the requested range (UTC dates), with `0` for days that have
  no events, ensuring the trend chart renders a complete timeline.
- See `docs/analytics.md` for the full specification.

## Folder Structure

```
portfolio/
├── frontend/                 # Public React website (:5173)
├── admin/                    # Admin dashboard (:5174)
├── backend/                  # Express API (:5000)
├── docs/                     # Architecture, API, deployment docs
├── .github/                  # GitHub templates / workflows
├── .env.example              # Central env reference
└── package.json              # Root scripts (dev, server, admin, lint, ...)
```

## Conventions

- **JavaScript** (ESM) throughout — no TypeScript.
- **Prettier** for formatting, **ESLint** for linting (both run with
  `--max-warnings 0`).
- **Consistent naming** — plural resource names, `camelCase` identifiers,
  PascalCase for classes/components/React files.
- **No commented-out code**; dead code is removed.
- Each app owns its `package.json` and dependencies; the root scripts delegate
  using `--prefix`.

## SEO Architecture (Phase 14)

The portfolio uses a **centralized SEO system** with no external SEO framework.

### Configuration

`frontend/src/config/seo.js` exports `SEO_CONFIG` with:

- `siteUrl` — derived from `VITE_SITE_URL` env var (with `window.location.origin` fallback)
- `siteName`, `siteDescription`, `authorName`, `defaultOgImage`
- `titleTemplate` — `'%s — Portfolio'` (blog posts override to `'%s — Portfolio Blog'`)

### SEO Utility

`frontend/src/utils/seo.js` provides:

- `setSEOMeta(params)` — central function that creates/updates **and removes** meta tags. Key difference from the old pattern: empty values **remove** stale tags instead of skipping them, preventing meta tag leakage between page navigations.
- `setJsonLd(id, data)` — safely injects JSON-LD with `<` and `>` escaped as `\u003c`/`\u003e` to prevent script injection.
- `removeJsonLd(id)` — removes a JSON-LD script tag.
- `setPageSEO(params)` — convenience wrapper with sensible defaults.

### Page-level SEO

Each page component calls `setSEOMeta` or `setPageSEO` inside a `useEffect`:

- **Home**: Person + WebSite JSON-LD, profile-driven title/description
- **About/Experience/Skills/Education/Contact/Projects**: Static titles + descriptions
- **Blog listing**: WebSite JSON-LD with SearchAction
- **BlogPost**: BlogPosting + BreadcrumbList JSON-LD (via `blogSeo.js` wrapper), `noindex` for drafts
- **CategoryPosts/TagPosts**: Dynamic titles from category/tag name
- **ProjectDetailPage**: SoftwareApplication + BreadcrumbList JSON-LD
- **NotFound**: `noindex, nofollow` robots meta, fallback title

### Sitemap (`/sitemap.xml`)

Generated server-side in `backend/src/routes/index.js`. Includes:

- All static pages (`/`, `/about`, `/experience`, `/skills`, `/projects`, `/education`, `/contact`, `/blog`)
- Project detail pages (`/projects/:slug`) — only from non-deleted projects
- Published blog posts (`/blog/:slug`) — only from PUBLISHED posts
- Blog category/tag pages — only for categories/tags that have published posts

Blog posts have zero entries when no posts are published. No draft or unpublished content appears.

### robots.txt (`/robots.txt`)

Disallows `/admin/`, `/login`, and API auth/admin routes. References the sitemap at the configured site URL.

### Environment Variables

| Variable                 | Description                                      | Default                 |
| ------------------------ | ------------------------------------------------ | ----------------------- |
| `VITE_SITE_URL`          | Public site URL for canonicals, OG URLs, JSON-LD | `http://localhost:5173` |
| `FRONTEND_URL` (backend) | Origin(s) for CORS + sitemap/robots URLs         | `http://localhost:5173` |

The production `VITE_SITE_URL` must be set to the real HTTPS domain before building.

### Performance

- `ProjectDetailPage` and `BlogPost` are **code-split** via React `lazy()` + `Suspense`
- Blog post images use `loading="eager"` (above-the-fold); project screenshots use `loading="lazy"`
- All images have explicit `width`/`height` or aspect-ratio to prevent layout shift

## Performance Architecture (Phase 15)

### Bundle Optimization

**Vite `manualChunks`**: The `react-markdown` + `rehype-highlight` + `remark-gfm` +
`rehype-sanitize` dependency group (~350 kB raw) is split into its own `markdown` chunk,
loaded on-demand only when a blog post or markdown-rendering page is visited.

**Before (single chunk)**: 579 kB JS (179 kB gzipped)
**After (split chunks)**: 210 kB initial JS (70 kB gzipped) + 348 kB markdown chunk (106 kB gzipped, lazy)

### Lazy Loading Strategy

- `ProjectDetailPage`, `BlogPost`, `CategoryPosts`, and `TagPosts` are lazy-loaded via
  `React.lazy` + `Suspense` with an accessible `LoadingState` fallback
- All images below the fold use `loading="lazy"`
- Above-the-fold hero images use `loading="eager"` + `fetchPriority="high"`
- All images include `decoding="async"` to prevent blocking the main thread
- `aspect-ratio` CSS ensures layout stability before images load

### Image Optimization

- Every `<img>` element includes `decoding="async"`
- Above-the-fold images (Home profile, BlogPost cover) use `loading="eager"` + `fetchPriority="high"`
- Below-the-fold images use `loading="lazy"`
- Explicit `width`/`height` + `style={{ aspectRatio }}` on every image prevents CLS
- Markdown-rendered images inherit `loading="lazy"` + `decoding="async"` via `MarkdownRenderer`

### Caching Strategy

**Frontend (in-memory)**:

- `apiClient.js` implements a module-level in-memory cache for GET requests (30-second TTL)
- Duplicate in-flight requests for the same URL are deduplicated
- Cache is bypassed when an `AbortSignal` is passed (component unmount)
- POST/PUT/PATCH/DELETE automatically invalidate the entire cache

**Backend (HTTP)**:

- `cacheHeaders()` middleware sets `Cache-Control: public, max-age=N, stale-while-revalidate=60`
  on public GET endpoints (profile/projects: 600s, blog: 300s, resume: 3600s)
- Admin/authenticated routes are NOT cached
- Sitemap.xml: 3600s, RSS feed: 300s, robots.txt: 3600s

### Compression

- `compression()` middleware with Brotli enabled (when client supports it) + gzip level 6
- 1 KB threshold — small responses are not compressed
- Admin app is a separate Vite build, completely isolated from the public bundle

### React Rendering Optimizations

- `ThemeContext` value memoized with `useMemo` to prevent unnecessary re-renders
- App route transition delay reduced from 150ms to 75ms

### Core Web Vitals Considerations

- **LCP**: Above-the-fold images eager-loaded with `fetchPriority="high"`;
  initial JS bundle reduced from 579 kB to 210 kB
- **CLS**: All images have explicit dimensions + `aspect-ratio`
- **INP**: Heavy markdown library (348 kB) loaded on-demand; reduced transition delay

### Lighthouse Results

Lighthouse could not be executed in the current environment because Chrome/Lighthouse tooling
was unavailable. Performance was validated through production builds, bundle analysis, and
runtime verification.

**Verified metrics**:

- Initial JS bundle: 210 kB (70 kB gzipped) — down from 579 kB (179 kB gzipped)
- Markdown chunk: 348 kB (106 kB gzipped) — lazy-loaded only on blog pages
- CSS: 43 kB main + per-route CSS (blog: 7.2 kB, project: 4.7 kB)
- All images include `decoding="async"`, explicit dimensions, and `aspect-ratio`

**Known limitations**:

- No build-time image optimization or WebP/AVIF conversion pipeline. If images are
  hosted on Cloudinary, URL-based transformations could provide additional gains.
- In-memory frontend cache is per-session. HTTP cache headers on the backend provide
  cross-session caching at the browser/CDN level.
