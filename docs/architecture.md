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
