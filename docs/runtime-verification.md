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

Base URL: `http://localhost:5000/api/v1`
Refresh cookie: `portfolio_refresh` (HttpOnly, path `/api/v1/auth`)
Access token: sent as `Authorization: Bearer <token>`
Login payload: `{ "email": "...", "password": "..." }`

- [ ] `POST /auth/login` — seeded admin credentials → `200`, access token in
      body + HttpOnly refresh cookie.
```bash
  curl -X POST http://localhost:5000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@example.com","password":"YOUR_PASSWORD"}' \
    -c cookies.txt
  ```
- [ ] Login with wrong password → `401`, no token/cookie.
  ```bash
  curl -X POST http://localhost:5000/api/v1/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@example.com","password":"wrong-password"}'
  ```
- [ ] Login with a deactivated account → `403`.
- [ ] `GET /auth/me` with valid token → `200` current user.
  ```bash
  curl -X GET http://localhost:5000/api/v1/auth/me \
    -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
  ```
- [ ] `POST /auth/refresh` (send the cookie) → `200`, rotates token + new cookie.
  ```bash
  curl -X POST http://localhost:5000/api/v1/auth/refresh -b cookies.txt -c cookies.txt
  ```
- [ ] Reuse an already-rotated refresh token → `401` and revokes the whole
      family (`revokeAllUserTokens`).
  ```bash
  curl -X POST http://localhost:5000/api/v1/auth/refresh \
    -H "Cookie: portfolio_refresh=THE_REVOKED_TOKEN"
  ```
- [ ] `POST /auth/logout` (send the cookie) → `200`, clears cookie + revokes.
  ```bash
  curl -X POST http://localhost:5000/api/v1/auth/logout -b cookies.txt -c cookies.txt
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

## 8. Build & Static Checks (already verified)

- [ ] Backend/eslint, frontend/eslint, admin/eslint all clean (`--max-warnings 0`).
- [ ] Prettier check clean across all files.
- [ ] `npm run build` passes for frontend and admin.
- [ ] `prisma validate` passes.
