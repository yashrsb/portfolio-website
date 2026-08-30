# Deployment

This guide covers environment configuration and production deployment for the Portfolio project.

## Prerequisites

- Node.js 22+
- PostgreSQL 14+
- npm 9+

## Environment Variables

### Backend

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

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| PORT | Backend server port | No | 5000 |
| NODE_ENV | Environment (development/production/test) | No | development |
| API_PREFIX | Versioned API base path | No | /api/v1 |
| DATABASE_URL | PostgreSQL connection string | Yes | - |
| JWT_ACCESS_SECRET | Access token signing secret | Yes | - |
| JWT_REFRESH_SECRET | Refresh token signing secret | Yes | - |
| JWT_ACCESS_SECRET_TTL | Access token lifetime | No | 15m |
| JWT_REFRESH_SECRET_TTL_DAYS | Refresh token lifetime in days | No | 7 |
| FRONTEND_URL | Comma-separated allowed CORS origins | Production | - |
| REFRESH_TOKEN_COOKIE_NAME | HttpOnly cookie name | No | portfolio_refresh |
| COOKIE_SECURE | Set true over HTTPS | No | false |
| COOKIE_SAME_SITE | Cookie SameSite policy | No | lax |
| ADMIN_NAME | Admin seed name | No | Admin |
| ADMIN_EMAIL | Admin seed email | No | admin@example.com |
| ADMIN_PASSWORD | Admin seed password | No | - |
| STORAGE_PROVIDER | Storage provider: `local` or `supabase` | No | local |
| STORAGE_DRIVER | Storage backend (local) | No | local |
| STORAGE_LOCAL_UPLOAD_DIR | Local upload directory | No | uploads |
| STORAGE_LOCAL_PUBLIC_BASE_URL | Public base URL for uploads | No | - |
| STORAGE_MAX_SIZE_BYTES | Max upload size in bytes | No | 5242880 |
| STORAGE_ALLOWED_MIME_TYPES | Comma-separated allowed MIME types | No | application/pdf |
| SUPABASE_URL | Supabase project URL | When STORAGE_PROVIDER=supabase | - |
| SUPABASE_SECRET_KEY | Supabase server-side secret key | When STORAGE_PROVIDER=supabase | - |
| SUPABASE_STORAGE_BUCKET | Supabase storage bucket name | No | resumes |
| EMAIL_PROVIDER | Email provider (smtp) | No | smtp |
| EMAIL_FROM | Sender email address | No | - |
| CONTACT_NOTIFICATION_EMAIL | Notification recipient | No | - |
| EMAIL_SMTP_HOST | SMTP server host | No | - |
| EMAIL_SMTP_PORT | SMTP server port | No | 587 |
| EMAIL_SMTP_USER | SMTP username | No | - |
| EMAIL_SMTP_PASS | SMTP password | No | - |
| CONTACT_RATE_LIMIT_WINDOW_MS | Contact rate limit window | No | 900000 |
| CONTACT_RATE_LIMIT_MAX | Max contact submissions per window | No | 5 |
| DEFAULT_ANALYTICS_RATE_LIMIT_WINDOW_MS | Analytics rate limit window | No | 60000 |
| DEFAULT_ANALYTICS_RATE_LIMIT_MAX | Max analytics events per window | No | 60 |
| DEFAULT_ANALYTICS_RETENTION_DAYS | Analytics data retention | No | 90 |
| VISITOR_HASH_SECRET | Secret salt for visitor hashing | No | random |

### Frontend

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| VITE_API_BASE_URL | Backend API URL | No | http://localhost:5000/api/v1 |
| VITE_SITE_URL | Public site URL for SEO | No | http://localhost:5173 |

### Admin

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| VITE_API_BASE_URL | Backend API URL | No | http://localhost:5000/api/v1 |

> **Note:** Vite environment variables are inlined at build time. Set them before running `npm run build`.

## Local Development

```bash
# Install all dependencies
npm install
npm run install:all

# Configure backend
cp backend/.env.example backend/.env
# Edit backend/.env with DATABASE_URL and secrets

# Set up database
cd backend
npm run db:migrate      # Apply migrations
npm run db:generate     # Generate Prisma client
npm run db:seed         # Seed portfolio content + admin user
cd ..

# Run all applications
npm run dev             # Frontend :5173
npm run admin           # Admin :5174
npm run server          # Backend :5000
```

## Production Build

### Frontend

```bash
cd frontend
npm run build           # Outputs to frontend/dist
```

### Admin

```bash
cd admin
npm run build           # Outputs to admin/dist
```

### Backend

```bash
cd backend
npm run db:migrate:deploy   # Apply migrations in production
npm run start               # Start with: node src/server.js
```

## Docker Deployment

### Quick Start

```bash
# Build and run all services
docker compose up --build

# Run in detached mode
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down
```

### Docker Services

| Service | Image | Port | Description |
|---------|-------|------|-------------|
| frontend | nginx:1.27-alpine | 3000 | Public website |
| admin | nginx:1.27-alpine | 3001 | Admin dashboard |
| backend | node:22-alpine | 5000 | Express API |
| postgres | postgres:16-alpine | 5432 | PostgreSQL database |

### Docker Volumes

| Volume | Description |
|--------|-------------|
| postgres_data | PostgreSQL data persistence |
| uploads | Resume file uploads |

### Docker Networks

| Network | Description |
|---------|-------------|
| portfolio_network | Internal bridge network |

### Environment Configuration

Create `docker/.env` with production values:

```env
DATABASE_URL=postgresql://portfolio:password@postgres:5432/portfolio
JWT_ACCESS_SECRET=your-secure-access-secret
JWT_REFRESH_SECRET=your-secure-refresh-secret
FRONTEND_URL=https://yourdomain.com,https://admin.yourdomain.com
COOKIE_SECURE=true
```

## CI/CD Pipeline

The project uses GitHub Actions for continuous integration.

### Workflow

```mermaid
graph LR
    Lint[ESLint] --> Test[Tests]
    Test --> Prisma[Prisma Validate]
    Prisma --> Build[Build]
```

### GitHub Actions Jobs

1. **lint**: ESLint with `--max-warnings 0`
2. **test-backend**: Backend tests + coverage
3. **test-frontend**: Frontend tests + coverage
4. **test-admin**: Admin tests + coverage
5. **build**: Prisma validation + frontend/admin builds
6. **format-check**: Prettier format check

### Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| DATABASE_URL | Test database connection string |
| JWT_ACCESS_SECRET | Test JWT access secret |
| JWT_REFRESH_SECRET | Test JWT refresh secret |

## Production Hardening Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Set `FRONTEND_URL` to your real public origins (comma-separated)
- [ ] Set `COOKIE_SECURE=true` (HTTPS only)
- [ ] Use strong, unique, random `JWT_ACCESS_SECRET` and `JWT_REFRESH_SECRET`
- [ ] Set a strong `ADMIN_PASSWORD` and rotate admin credentials
- [ ] Point `DATABASE_URL` at a managed PostgreSQL instance
- [ ] Configure `STORAGE_LOCAL_UPLOAD_DIR` to a persistent, non-public volume
- [ ] Ensure the uploads directory is gitignored
- [ ] Terminate TLS at the reverse proxy / load balancer
- [ ] Enable request logging and centralize logs
- [ ] Verify CORS only permits your own origins
- [ ] Confirm the rate limiter is active
- [ ] Schedule the analytics cleanup script via cron
- [ ] Run `npm run lint` and `npm run build` in CI before deploy

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
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 80;
    server_name admin.example.com;

    # Admin dashboard
    location / {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

server {
    listen 80;
    server_name api.example.com;

    # API
    location / {
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
| backend   | node:22-alpine     | 5000  | Express API              |
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

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Backend fails to start | Missing DATABASE_URL or JWT secrets | Set required env vars |
| CORS error in browser | FRONTEND_URL doesn't include origin | Add origin to FRONTEND_URL |
| Login works but refresh fails | COOKIE_SECURE/COOKIE_SAME_SITE mismatch | Match HTTPS setup |
| Resume upload rejected | File not PDF or exceeds size | Check file type and size |
| Prisma can't connect | DATABASE_URL unreachable | Check connection string |
| Resume download returns 404 | Resume file missing from storage | Re-upload resume via admin dashboard |
| Env var not picked up | Vite env vars inlined at build time | Rebuild after changing .env |
| Supabase client not initialized | Missing SUPABASE_URL or SUPABASE_SECRET_KEY | Set Supabase environment variables |

## Render Production Configuration (Supabase Storage)

Render's filesystem is **ephemeral** — uploaded files are deleted when the container
restarts (deployments, scaling, or idle spin-down). The Render Free plan does not
support Persistent Disks. Therefore, production uses **Supabase Storage** for
resume file persistence.

### Supabase Setup

1. Create a Supabase project at https://supabase.com
2. Go to **Storage** → **New Bucket**
3. Name: `resumes`
4. Make bucket **public** (required for public resume downloads)
5. Note your project URL and `service_role` secret key

### Required Render Environment Variables

In Render Dashboard → backend service → **Environment**:

```
STORAGE_PROVIDER=supabase
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SECRET_KEY=your-service-role-secret-key
SUPABASE_STORAGE_BUCKET=resumes
```

### Security Considerations

- The `SUPABASE_SECRET_KEY` is the server-side `service_role` key — never expose it to the frontend
- The `resumes` bucket is public for read access (required for public downloads)
- Uploads only happen through the authenticated Admin backend
- The backend validates file type (PDF only) and size (5 MB limit)

### Resume Flow (Production)

```
Admin Dashboard
  → POST /api/v1/admin/resume
  → ResumeService.uploadResume()
  → SupabaseStorageProvider.upload()
  → Supabase Storage bucket "resumes"
  → ResumeFile metadata stored in Neon
  → Profile.resumeUrl updated with Supabase public URL
  → Frontend opens profile.resumeUrl directly

Public Download
  → Frontend: window.open(profile.resumeUrl, '_blank')
  → Browser fetches directly from Supabase CDN
```

### Verification

```bash
# Should return HTTP 200 with the PDF file
curl -I "https://portfolio-backend-j24o.onrender.com/api/v1/resume/download"

# Check Supabase Storage for uploaded file
# (Use Supabase Dashboard → Storage → resumes bucket)
```

### Why Local Storage Fails on Render

The `LocalStorageProvider` writes files to `STORAGE_LOCAL_UPLOAD_DIR`. On Render's ephemeral filesystem, files survive only until the next container restart. The database records (`ResumeFile` and `Profile.resumeUrl`) persist, but the actual file is gone — causing the download endpoint to return **404**. Supabase Storage solves this by providing persistent, CDN-backed file storage.
