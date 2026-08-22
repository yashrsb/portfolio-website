# Runtime Verification Checklist (v1.0)

This checklist covers the manual, end-to-end runtime verification for the
Portfolio Release Candidate v1.0. It **requires a live PostgreSQL database** and
a running backend. It is intentionally **NOT marked complete** — it must be run
by a human against a real environment before release.

> Status: PENDING — requires a live database and running services.

## Prerequisites

- [ ] PostgreSQL is running and reachable via `DATABASE_URL`.
- [ ] Backend env configured: `backend/.env` with `DATABASE_URL`, JWT secrets,
      and admin seed credentials.
- [ ] Migrations applied: `npm run db:migrate` (dev) or `db:migrate:deploy`.
- [ ] Seed run: `npm run db:seed` (creates content + admin user).
- [ ] Backend running: `npm run server` → `http://localhost:5000`.
- [ ] Frontend running: `npm run dev` → `http://localhost:5173`.
- [ ] Admin running: `npm run admin` → `http://localhost:5174`.

## 1. Public Website

- [ ] `GET http://localhost:5173/` loads without console errors.
- [ ] Home page renders profile, stats, and CTA.
- [ ] About page loads profile from API.
- [ ] Projects page lists projects from the API.
- [ ] Skills page groups skills by category with proficiency bars.
- [ ] Experience page renders the timeline with company links.
- [ ] Education page shows education, certificates, and achievements.
- [ ] Contact page submits a message successfully (200) and shows a success toast.
- [ ] Navigation links work for all routes; NotFound page handles unknown URLs.
- [ ] Dark/light theme toggles and persists across reloads.
- [ ] Resume download link returns the latest PDF.
- [ ] Reduced-motion preference disables scroll-reveal animations.

## 2. Authentication

Base URL: `http://localhost:5001/api/v1`
Refresh cookie: `portfolio_refresh` (HttpOnly, path `/api/v1/auth`)
Access token: sent as `Authorization: Bearer <token>`
Login payload: `{ "email": "...", "password": "..." }`

- [ ] `POST /auth/login` — seeded admin credentials → `200`, access token in
      body + HttpOnly refresh cookie.

```bash
  curl -X POST http://localhost:5001/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@example.com","password":"YOUR_PASSWORD"}' \
    -c cookies.txt
```

- [ ] Login with wrong password → `401`, no token/cookie.
  ```bash
  curl -X POST http://localhost:5001/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@example.com","password":"wrong-password"}'
  ```
- [ ] Login with a deactivated account → `403`.
- [ ] `GET /auth/me` with valid token → `200` current user.
  ```bash
  curl -X GET http://localhost:5001/api/v1/auth/me \
    -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
  ```
- [ ] `POST /auth/refresh` (send the cookie) → `200`, rotates token + new cookie.
  ```bash
  curl -X POST http://localhost:5001/api/v1/auth/refresh -b cookies.txt -c cookies.txt
  ```
- [ ] Reuse an already-rotated refresh token → `401` and revokes the whole
      family (`revokeAllUserTokens`).
  ```bash
  curl -X POST http://localhost:5001/api/v1/auth/refresh \
    -H "Cookie: portfolio_refresh=THE_REVOKED_TOKEN"
  ```
- [ ] `POST /auth/logout` (send the cookie) → `200`, clears cookie + revokes.
  ```bash
  curl -X POST http://localhost:5001/api/v1/auth/logout -b cookies.txt -c cookies.txt
  ```

## 3. Admin Dashboard

- [ ] Login page authenticates and redirects to the dashboard.
- [ ] Protected routes redirect unauthenticated users to login.
- [ ] Dashboard shows statistics (counts per resource).
- [ ] Editor role cannot access ADMIN-only actions (403).
- [ ] Logout ends the session and clears tokens.

## 4. CRUD Operations (per resource: Projects, Skills, Experience, Education,

Certificates, Achievements, Social Links)

For each resource, verify:

- [ ] List loads from the API.
- [ ] Create (POST) adds a new record and appears in the list.
- [ ] Update (PUT/PATCH) edits an existing record.
- [ ] Delete (DELETE) removes a record (with confirmation dialog).
- [ ] Validation errors show inline field messages (400).
- [ ] Reorder updates `displayOrder` and persists on reload.
- [ ] Optimistic updates roll back on failure.

## 5. Resume Management

- [ ] Upload a PDF via the admin resume page succeeds.
- [ ] Upload a non-PDF file is rejected (`400`).
- [ ] Upload a file larger than `STORAGE_MAX_SIZE_BYTES` is rejected (`400`).
- [ ] Replace the resume with a new PDF updates the file.
- [ ] Delete the resume removes the file and metadata.
- [ ] `GET /api/v1/resume/download` serves the latest resume.

## 6. Contact Messages (admin)

- [ ] Submitted contact messages appear in the admin inbox.
- [ ] Messages can be marked read / deleted.
- [ ] Public submission without required fields is rejected (400).

## 7. Security & Robustness

- [ ] Requests to `/api/v1/*` without a token on protected routes return `401`.
- [ ] Passing an invalid/malformed token returns `401`.
- [ ] Unknown routes return `404` with the standard error envelope.
- [ ] Rate limiter returns `429` after exceeding the request limit.
- [ ] CORS blocks origins not in `FRONTEND_URL`.
- [ ] Response envelope is consistent: `success`, `message`, `data`, `meta`.
- [ ] No sensitive data (passwords, refresh token hashes, secrets) is returned.

## Admin Router Fix (useBlocker / data router)

The admin app previously used `BrowserRouter`. CRUD pages (e.g. Projects,
Experience) use `useDirtyForm` → React Router's `useBlocker`, which **only works
with a data router** and throws an invariant when used with `BrowserRouter`,
causing a blank page. The app was migrated to `createBrowserRouter` +
`RouterProvider` (in `src/App.jsx` / `src/main.jsx`) and wrapped in an
`ErrorBoundary` so any future render error shows a readable fallback instead of
a blank screen.

- **Files changed:** `admin/src/App.jsx` (router def), `admin/src/main.jsx`
  (`RouterProvider`), `admin/src/components/ErrorBoundary.jsx` (new).
- **Verified:** `npm run build` passes; ESLint clean on changed files.

## 8. Project Showcase (Phase 11)

- [ ] `GET /api/v1/projects/:slug` returns a single project with showcase fields.
- [ ] `GET /api/v1/projects/:slug` with a non-existent slug returns `404`.
- [ ] `/projects` list page shows project cards with a "View Case Study" link.
- [ ] `/projects/:slug` renders the dedicated project detail page.
- [ ] Project detail page shows: overview, features, tech stack, architecture,
      screenshots (with lightbox), challenges, lessons learned, GitHub, and
      optional live demo.
- [ ] Live Demo button is omitted when `demoUrl` is null (no placeholder "#").
- [ ] GitHub button is omitted when `githubUrl` is null.
- [ ] Screenshot section is hidden when no screenshots exist.
- [ ] Empty optional sections (features, challenges, etc.) are not rendered.
- [ ] Admin "create/edit" form saves new fields to PostgreSQL.
- [ ] Editing a project in admin immediately reflects on the public page after refresh.
- [ ] SEO meta tags (title, description, OG) update dynamically per project.
- [ ] Screenshot lightbox: click to enlarge, Escape to close, arrow keys to navigate.

## 10. Blog Engine (Phase 12)

### Public API (Base URL: `http://localhost:5001/api/v1`)

- [ ] `GET /blog/posts` — paginated list of published posts returns `200` with
      `data` (post cards) and `meta.pagination`.
- [ ] `GET /blog/posts?limit=5` — respects limit param.
- [ ] `GET /blog/posts?search=redis` — filters posts by keyword in title/excerpt.
- [ ] `GET /blog/posts?category=backend` — filters posts by category slug.
- [ ] `GET /blog/posts?tag=redis` — filters posts by tag slug.
- [ ] `GET /blog/posts?featured=true` — returns only featured posts.
- [ ] `GET /blog/posts/draft-post-slug` — unpublished draft returns `404`.
- [ ] `GET /blog/posts/:slug` — returns full post with `content`, category, tags.
- [ ] `GET /blog/posts/:slug` with non-existent slug returns `404`.
- [ ] `GET /blog/featured` — returns featured posts ordered by `publishedAt`.
- [ ] `GET /blog/categories` — returns all unique categories used by published posts.
- [ ] `GET /blog/categories/:slug/posts` — posts filtered by category.
- [ ] `GET /blog/tags` — returns all unique tags with post counts.
- [ ] `GET /blog/tags/:slug/posts` — posts filtered by tag.
- [ ] `GET /blog/sitemap` — returns JSON array of all published post slugs + dates.

### Feed / SEO (Root-level URLs)

- [ ] `GET http://localhost:5001/rss.xml` — returns RSS 2.0 XML with `<item>`
      entries per published post (title, link, description, date, author, category).
- [ ] `GET http://localhost:5001/sitemap.xml` — returns XML sitemap including
      static routes and `/blog/:slug` URLs.
- [ ] `GET http://localhost:5001/robots.txt` — allows `/` and disallows `/admin`.
- [ ] RSS feed excludes draft posts (verify count matches published API).
- [ ] Draft post slug does not appear in `sitemap.xml`.

### Frontend (Blog pages)

- [ ] `/blog` — renders blog listing with search box, category filters, tag cloud.
- [ ] `/blog` — pagination renders and navigates correctly.
- [ ] `/blog/:slug` — renders full Markdown article with Table of Contents sidebar.
- [ ] `/blog/:slug` — displays reading time (200 WPM calculation).
- [ ] `/blog/:slug` — shows social sharing buttons (X, LinkedIn, Copy Link).
- [ ] `/blog/:slug` — `<title>`, `<meta>`, and `<script type="application/ld+json">`
      update with article data.
- [ ] `/blog/category/:slug` — shows posts filtered by category.
- [ ] `/blog/tag/:slug` — shows posts filtered by tag.
- [ ] `/` navigation includes a "Blog" link.
- [ ] Markdown code blocks are syntax-highlighted.
- [ ] External links open in a new tab with `rel="noopener noreferrer"`.

### Admin

- [ ] Admin sidebar has a "Blog" dropdown with Posts, Categories, Tags.
- [ ] `/blog` — admin lists all posts with status badges and publish/unpublish.
- [ ] `/blog` — "New Post" opens modal with title, slug, excerpt, Markdown editor,
      category, tags, status, featured, published date, SEO fields.
- [ ] Admin Markdown preview uses the same rendering pipeline as the public page.
- [ ] `/blog/categories` — CRUD categories.
- [ ] `/blog/tags` — CRUD tags.
- [ ] Creating/editing/deleting a post in admin persists to PostgreSQL.
- [ ] Publish/unpublish toggles post status and removes drafts from the live feed.

### Content Import

- [ ] `npm run import:portfolio` seeds 4 published posts + 1 draft post.
- [ ] Draft posts do not appear in `/blog/posts`, `/rss.xml`, or `/sitemap.xml`.

## 11. Analytics System (Phase 13)

### Public API

- [ ] `POST /api/v1/analytics/events` — sends a `PAGE_VIEW` event → `202`.
  ```bash
  curl -X POST http://localhost:5001/api/v1/analytics/events \
    -H "Content-Type: application/json" \
    -d '{"eventType":"PAGE_VIEW","path":"/test"}'
  ```
- [ ] `POST /api/v1/analytics/events` with invalid `eventType` → `400`.
- [ ] `POST /api/v1/analytics/events` with empty `path` → `400`.
- [ ] Exceeding 60 events/min from one IP → `429` with `RATE_LIMIT_EXCEEDED`.
- [ ] Bot user-agents (e.g. `Googlebot`) are silently dropped (no error, no row).
- [ ] `projectSlug` is resolved to a `Project.id` (non-existent slug → no FK set).
- [ ] `blogPostSlug` is resolved to a published `BlogPost.id` (draft → no FK set).

### Storage & Privacy

- [ ] Analytics events are stored in the `AnalyticsEvent` table.
- [ ] `visitorHash` is a SHA-256 digest (no raw IPs stored).
- [ ] Same visitor hash changes daily (daily salt rotation).
- [ ] No full user-agent string is stored (only parsed device/browser/os).
- [ ] Events older than `DEFAULT_ANALYTICS_RETENTION_DAYS` (default 90) are
      purged by `npm run analytics:cleanup`.

### Admin Dashboard

- [ ] Login to admin → navigate to `/analytics` → dashboard loads.
- [ ] Overview page shows current + previous-period visitor/page-view counts.
- [ ] Timeseries line chart shows daily visitor trend.
- [ ] Top Pages table lists pages by event count.
- [ ] Top Countries table lists countries by visitor count.
- [ ] Devices chart shows desktop/mobile/tablet breakdown.
- [ ] Browsers chart shows browser distribution.
- [ ] Projects table shows per-project views, clicks, and click source breakdown.
- [ ] Referrers table shows top referring URLs.
- [ ] Date range selector (Today / 7d / 30d / 90d) updates all charts.
- [ ] Dark mode toggle is respected on all analytics pages.
- [ ] No raw event rows are ever returned by any admin endpoint.

### Frontend

- [ ] Navigating the public site triggers `PAGE_VIEW` events (check DB).
- [ ] Visiting `/projects/:slug` triggers a `PROJECT_VIEW` event.
- [ ] Clicking a project's GitHub/Demo link triggers a `PROJECT_CLICK` event.
- [ ] Visiting `/blog/:slug` triggers a `BLOG_POST_VIEW` event.
- [ ] Setting `localStorage.analytics_opt_out = "true"` stops all tracking.
      Removing it re-enables tracking.
- [ ] `navigator.sendBeacon` is used for event delivery (verify via dev tools).

## 10. Performance (Phase 15)

### Bundle & Code Splitting

- [ ] Production build produces multiple JS chunks (not a single 500 kB+ file).
- [ ] `markdown-*.js` chunk (react-markdown + rehype-highlight) loads only on blog pages.
- [ ] `CategoryPosts` and `TagPosts` are lazy-loaded (visible in Network tab as separate chunks).
- [ ] Main JS bundle < 250 kB (gzipped ~70 kB).

### Images

- [ ] Above-the-fold images (Home profile, BlogPost cover) load eagerly with `fetchpriority=high`.
- [ ] Below-the-fold images use `loading="lazy"`.
- [ ] All images have `decoding="async"`.
- [ ] All images have explicit `width`/`height` + `aspect-ratio` (no layout shift in dev tools).

### Caching

- [ ] Public GET API responses include `Cache-Control: public, max-age=N` headers.
- [ ] Admin/authenticated routes do NOT include cache headers.
- [ ] Navigating between pages does NOT trigger duplicate API requests (in-memory cache hit).

### Compression

- [ ] Backend responses are served with `Content-Encoding: br` (Brotli) when client supports it.

## 11. Build & Static Checks (already verified)

- [x] Backend/eslint, frontend/eslint, admin/eslint all clean (`--max-warnings 0`).
- [x] `npm run test` passes for all three apps (backend 145, frontend 87, admin 68).
- [x] `npm run build` passes for frontend and admin.
- [x] `prisma validate` passes.

## 12. Docker (Phase 17)

### Docker Build Verification

- [ ] `frontend/Dockerfile` builds successfully
- [ ] `admin/Dockerfile` builds successfully
- [ ] `backend/Dockerfile` builds successfully
- [ ] `docker-compose.yml` is valid

### Docker Runtime Verification

- [ ] `docker compose up --build` starts all services
- [ ] PostgreSQL container becomes healthy
- [ ] Backend runs migrations successfully
- [ ] `GET /api/v1/health` returns 200
- [ ] Frontend loads at `http://localhost:3000`
- [ ] Admin loads at `http://localhost:3001`
- [ ] Frontend can retrieve projects from backend
- [ ] Project detail pages work
- [ ] Blog pages work
- [ ] Contact form works
- [ ] Admin login works
- [ ] Admin CRUD operations work
- [ ] Resume functionality works

### Docker Persistence Verification

- [ ] `docker compose down` preserves PostgreSQL data
- [ ] `docker compose up` restarts with existing data
- [ ] Uploaded files persist across restarts

### Docker Security Verification

- [ ] Backend container runs as non-root user
- [ ] PostgreSQL is not exposed to host by default
- [ ] No secrets in Dockerfiles or docker-compose.yml
- [ ] `.dockerignore` files exclude sensitive files
