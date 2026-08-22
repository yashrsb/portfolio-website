# Deployment

This guide covers environment configuration and production deployment for the
Portfolio project.

## Environment Variables

Copy `.env.example` to the app directory and set real values. Never commit
secrets.

| Variable                                        | Description                             | Default                                       |
| ----------------------------------------------- | --------------------------------------- | --------------------------------------------- |
| `VITE_SITE_URL` (frontend)                      | Public site URL for canonical/OG links  | `http://localhost:5173`                       |
| `PORT`                                          | Backend server port                     | `5000`                                        |
| `NODE_ENV`                                      | `development` \| `production` \| `test` | `development`                                 |
| `API_PREFIX`                                    | Versioned API base path                 | `/api/v1`                                     |
| `FRONTEND_URL`                                  | Comma-separated allowed CORS origins    | `http://localhost:5173,http://localhost:5174` |
| `DATABASE_URL`                                  | PostgreSQL connection string            | _(required)_                                  |
| `JWT_ACCESS_SECRET`                             | Secret for signing access tokens        | _(required)_                                  |
| `JWT_REFRESH_SECRET`                            | Secret for signing refresh tokens       | _(required)_                                  |
| `JWT_ACCESS_SECRET_TTL`                         | Access token lifetime (e.g. `15m`)      | `15m`                                         |
| `JWT_REFRESH_SECRET_TTL_DAYS`                   | Refresh token lifetime in days          | `7`                                           |
| `REFRESH_TOKEN_COOKIE_NAME`                     | HttpOnly cookie name for refresh token  | `portfolio_refresh`                           |
| `COOKIE_SECURE`                                 | Set `true` over HTTPS (production)      | `false`                                       |
| `COOKIE_SAME_SITE`                              | `lax` \| `strict` \| `none`             | `lax`                                         |
| `ADMIN_NAME` / `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Admin seed account (used by `db:seed`)  | `Admin` / `admin@example.com` / changeme      |
| `STORAGE_DRIVER`                                | Storage backend (`local`)               | `local`                                       |
| `STORAGE_LOCAL_UPLOAD_DIR`                      | Local upload directory                  | `uploads`                                     |
| `STORAGE_LOCAL_PUBLIC_BASE_URL`                 | Public base URL for uploaded files      | `http://localhost:5001/api/v1`                |
| `STORAGE_MAX_SIZE_BYTES`                        | Max upload size in bytes                | `5242880` (5 MB)                              |
| `STORAGE_ALLOWED_MIME_TYPES`                    | Comma-separated allowed MIME types      | `application/pdf`                             |
| `DEFAULT_ANALYTICS_RATE_LIMIT_WINDOW_MS`        | Analytics event rate-limit window (ms)  | `60000`                                       |
| `DEFAULT_ANALYTICS_RATE_LIMIT_MAX`              | Max analytics events per window/IP      | `60`                                          |
| `DEFAULT_ANALYTICS_RETENTION_DAYS`              | Days to retain analytics events         | `90`                                          |
| `VISITOR_HASH_SECRET`                           | Secret salt for visitor hashing         | (random)                                      |

Frontend and admin each read `VITE_API_BASE_URL`:

```
VITE_API_BASE_URL=http://localhost:5001/api/v1
```

> Note: Vite env vars are inlined at build time. Set them before running
> `npm run build`.

## Local Development

```bash
# install all dependencies
npm install
npm run install:all

# backend
cp backend/.env.example backend/.env   # then fill in DATABASE_URL + secrets

# database
cd backend
npm run db:migrate   # apply migrations (dev)
npm run db:seed      # seed portfolio content + admin user
npm run db:generate  # regenerate Prisma client

# run everything from the repo root
npm run dev        # frontend :5173
npm run admin      # admin :5174
npm run server     # backend :5000
```

## Production Build

```bash
# frontend (public website)
cd frontend
npm run build        # outputs to frontend/dist

# admin dashboard
cd ../admin
npm run build        # outputs to admin/dist

# backend
cd ../backend
npm run db:migrate:deploy   # apply migrations in production
npm run start               # node src/server.js
```

Serve `frontend/dist` and `admin/dist` with any static host (Nginx, Vercel,
Netlify, S3 + CloudFront) and route `/api/*` to the backend.

## Production Hardening Checklist

- [ ] Set `NODE_ENV=production`.
- [ ] Set `FRONTEND_URL` to your real public origins (comma-separated).
- [ ] Set `COOKIE_SECURE=true` (HTTPS only).
- [ ] Use strong, unique, random `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`.
- [ ] Set a strong `ADMIN_PASSWORD` and rotate admin credentials.
- [ ] Point `DATABASE_URL` at a managed PostgreSQL instance.
- [ ] Configure `STORAGE_LOCAL_UPLOAD_DIR` to a persistent, non-public volume.
      Ensure the directory is gitignored.
- [ ] Terminate TLS at the reverse proxy / load balancer.
- [ ] Enable request logging and centralize logs (e.g. stdout → log aggregator).
- [ ] Verify CORS only permits your own origins.
- [ ] Confirm the rate limiter is active (default 100 req / 15 min).
- [ ] Schedule the analytics cleanup script (`npm run analytics:cleanup`) via
      cron or a task scheduler — purges events older than
      `DEFAULT_ANALYTICS_RETENTION_DAYS` (default 90 days).
- [ ] Run `npm run lint` and `npm run build` in CI before deploy.

## CI/CD with GitHub Actions

The CI/CD pipeline is defined in `.github/workflows/`:

- **`ci.yml`** — runs on every PR and push to `main`:
  1. Install dependencies (`npm ci`)
  2. Lint all apps (frontend, backend, admin)
  3. Run all tests (frontend, backend, admin)
  4. Validate Prisma schema
  5. Build frontend, admin

- **`deploy.yml`** — runs only after CI succeeds on `main`:
  1. Checks out the **exact commit** that passed CI (via `workflow_run.head_sha`)
  2. Build all artifacts (frontend, admin, backend)
  3. Apply production database migrations (`prisma migrate deploy`)
  4. Deploy backend (rsync + restart via PM2)
  5. Health check + smoke tests (`GET /api/v1/health`, `/api/v1/projects`, etc.)
  6. Deploy frontend + admin static files
  7. Verify all endpoints respond with HTTP 200

### GitHub Secrets

All sensitive values are stored as GitHub repository secrets at:
**Settings → Secrets and variables → Actions**

| Secret                | Description                                                                |
| --------------------- | -------------------------------------------------------------------------- |
| `DEPLOY_HOST`         | SSH host (server IP or hostname)                                           |
| `DEPLOY_USER`         | SSH username (e.g. `deploy`)                                               |
| `DEPLOY_SSH_KEY`      | SSH private key (no passphrase, dedicated deployment key)                  |
| `DEPLOY_KNOWN_HOSTS`  | SSH known_hosts entry for the deploy host (for host verification)          |
| `DEPLOY_BACKEND_DIR`  | Remote directory for backend code                                          |
| `DEPLOY_PUBLIC_DIR`   | Remote directory for frontend `dist/`                                      |
| `DEPLOY_ADMIN_DIR`    | Remote directory for admin `dist/`                                         |
| `DEPLOY_BACKEND_URL`  | Full backend URL for health/smoke checks (e.g. `https://api.example.com/`) |
| `DEPLOY_FRONTEND_URL` | Full frontend URL for verification (e.g. `https://example.com`)            |
| `DATABASE_URL`        | Production PostgreSQL connection string for migrations                     |

### Server-side Environment

The backend reads configuration from a `.env.production` file on the server.
**Never commit real secrets to the repository.**

```bash
# On the server: /opt/portfolio/backend/.env.production
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/portfolio
JWT_ACCESS_SECRET=<strong-random-string>
JWT_REFRESH_SECRET=<strong-random-string>
FRONTEND_URL=https://your-frontend.com,https://your-admin.com
VITE_SITE_URL=https://your-frontend.com
VISITOR_HASH_SECRET=<strong-random-string>

# IMPORTANT: Use an absolute path OUTSIDE the backend code directory.
# The deployment workflow uses rsync --delete on DEPLOY_BACKEND_DIR.
# If uploads/ is inside the backend directory, --delete would erase
# uploaded resumes. This path is excluded from rsync and persists.
STORAGE_LOCAL_UPLOAD_DIR=/var/lib/portfolio/uploads
```

#### Why uploads must be outside the backend directory

The deployment syncs code into `DEPLOY_BACKEND_DIR` using `rsync --delete`.
The `uploads/` directory is excluded from rsync via `--exclude uploads`, but
to be fully safe, `STORAGE_LOCAL_UPLOAD_DIR` should point to a separate
persistent directory (e.g. `/var/lib/portfolio/uploads`).

#### Adding known_hosts for SSH verification

Generate the known_hosts entry on your deployment server:

```bash
ssh-keyscan -H your-deploy-host.com >> ~/.ssh/known_hosts
```

Then copy the relevant line into GitHub Secrets as `DEPLOY_KNOWN_HOSTS`.
This prevents man-in-the-middle attacks during deployment.

### Deployment Order

```
CI passes on main (lint + test + prisma validate + build)
  ↓
Deploy workflow checks out the exact CI-validated commit (head_sha)
  ↓
Production migration (prisma migrate deploy)
  ↓
  ┌── Migration fails? → STOP. Backend NOT restarted. Manual fix needed.
  └──
      ↓
Deploy backend (rsync, excluding uploads/ and .env.production)
  ↓
Restart backend (PM2 / systemd)
  ↓
Backend health check + smoke tests (/api/v1/health, /api/v1/projects, ...)
  ↓
Deploy frontend + admin static files
  ↓
Verify frontend + public endpoints (/projects, /sitemap.xml, /robots.txt)
```

### Migration Safety

Database migrations use `prisma migrate deploy` (never `migrate dev`).

**If a migration fails:**

- The deploy workflow stops immediately (step exits non-zero)
- The backend is NOT restarted — the old version continues running
- Frontend and admin are NOT deployed
- Manual intervention is required

**Migration strategy: Expand → Deploy → Contract**

For future destructive schema changes:

1. **Expand**: Add new nullable columns/tables (backward-compatible)
2. **Deploy**: Update application to use the new schema
3. **Contract**: Remove old columns/tables (after confirming no rollback to old version)

**Rollback strategy:**

- **Application rollback**: `git revert <sha>` → push to `main` → new deploy with known-good code
- **Database rollback**: NOT automatic. Use a corrective forward migration.
  For example, if a migration added a required column, the rollback would be
  a new migration to drop it (after the application no longer depends on it).
- Migrations should be backward-compatible with the previous application version
  whenever possible, so reverting application code alone is sufficient.

### Branch Protection

Recommended GitHub settings for `main`:

- Require pull request before merging
- Require status checks to pass (CI workflow)
- Require branches to be up to date before merging
- Include administrators

## Example: Reverse Proxy (Nginx)

```nginx
server {
  listen 80;
  server_name example.com;

  # Public website
  location / {
    proxy_pass http://127.0.0.1:5173;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
  }

  # Admin dashboard
  location /admin {
    proxy_pass http://127.0.0.1:5174;
  }

  # API
  location /api/ {
    proxy_pass http://127.0.0.1:5000;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```

## Docker Deployment (Phase 17)

The application supports containerized deployment using Docker Compose for
local development and staging environments.

### Quick Start

```bash
# Create environment file
cp docker/.env.example .env

# Build and start all services
docker compose up --build

# Access the application:
# - Public frontend: http://localhost:3000
# - Admin dashboard:  http://localhost:3001
# - Backend API:      http://localhost:5000
```

### Docker Services

| Service   | Image              | Port  | Description              |
|-----------|--------------------|-------|--------------------------|
| frontend  | nginx:1.27-alpine  | 3000  | Public React website     |
| admin     | nginx:1.27-alpine  | 3001  | Admin dashboard          |
| backend   | node:20-alpine     | 5000  | Express API              |
| postgres  | postgres:16-alpine | 5432  | PostgreSQL database      |

### Common Docker Commands

```bash
# Start services
docker compose up --build

# Start in detached mode
docker compose up -d --build

# View logs
docker compose logs -f

# Stop services (preserves data)
docker compose down

# Stop and remove all data
docker compose down -v

# Rebuild without cache
docker compose build --no-cache

# List running services
docker compose ps
```

### Database Initialization

The backend container automatically runs migrations on startup:

1. PostgreSQL starts and becomes healthy
2. Backend container starts
3. Backend runs `npx prisma migrate deploy`
4. Backend starts the Express server

This is safe to run repeatedly — migrations are idempotent.

### Environment Variables

Docker environment variables are configured in `.env` (see `docker/.env.example`).
The `VITE_API_BASE_URL` must point to the browser-accessible backend URL
(`http://localhost:5000/api/v1`), not the internal Docker hostname (`backend`).

### Data Persistence

- PostgreSQL data is stored in a named volume (`postgres_data`)
- Uploaded files are stored in a named volume (`backend_uploads`)
- Data survives `docker compose down`
- Use `docker compose down -v` to erase all data

### Development vs Docker

| Aspect           | Local Development    | Docker                    |
|------------------|----------------------|---------------------------|
| Frontend port    | 5173                 | 3000                      |
| Admin port       | 5174                 | 3001                      |
| Backend port     | 5000                 | 5000                      |
| Database         | Local PostgreSQL     | Container PostgreSQL      |
| Hot reload       | Yes (Vite dev server)| No (production build)     |
| Node.js required | Yes                  | No (only Docker)          |

### Production Notes

Docker is intended for local development and staging. For production deployments,
use the existing CI/CD pipeline (GitHub Actions) and deploy to your hosting
platform of choice.

| Symptom                             | Likely cause / fix                                                          |
| ----------------------------------- | --------------------------------------------------------------------------- |
| Backend fails to start              | Missing `DATABASE_URL` or JWT secrets — `env.js` fails fast. Set them.      |
| CORS error in browser               | `FRONTEND_URL` does not include the origin you are calling from.            |
| Login works but refresh fails       | `COOKIE_SECURE`/`COOKIE_SAME_SITE` mismatch with your HTTPS setup.          |
| Resume upload rejected              | File not PDF or exceeds `STORAGE_MAX_SIZE_BYTES`.                           |
| Prisma can't connect                | `DATABASE_URL` unreachable or migrations not applied (`db:migrate:deploy`). |
| Env var not picked up by Vite build | Vite env vars are inlined at build time — rebuild after changing `.env`.    |
