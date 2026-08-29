# Deployment

This guide covers environment configuration and production deployment for the Portfolio project.

## Prerequisites

- Node.js 22+
- PostgreSQL 14+
- npm 9+

## Environment Variables

### Backend

Copy `backend/.env.example` to `backend/.env` and configure:

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
| STORAGE_DRIVER | Storage backend (local) | No | local |
| STORAGE_LOCAL_UPLOAD_DIR | Local upload directory | No | uploads |
| STORAGE_LOCAL_PUBLIC_BASE_URL | Public base URL for uploads | No | - |
| STORAGE_MAX_SIZE_BYTES | Max upload size in bytes | No | 5242880 |
| STORAGE_ALLOWED_MIME_TYPES | Comma-separated allowed MIME types | No | application/pdf |
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

## Reverse Proxy Configuration

### Nginx Example

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

## Health Checks

### Backend Health

```bash
curl http://localhost:5000/api/v1/health
```

### Docker Healthchecks

All Docker services include health checks:

| Service | Health Check |
|---------|--------------|
| backend | `curl http://localhost:5000/api/v1/health` |
| frontend | `curl http://localhost:80` |
| admin | `curl http://localhost:80` |
| postgres | `pg_isready` |

## Rollback Strategy

### Database Migrations

```bash
# Revert last migration (development)
npx prisma migrate resolve --rolled-back "migration_name"

# Reset and reapply (development only)
npx prisma migrate reset
```

### Application Rollback

1. Revert to previous Docker image tag
2. Redeploy previous version
3. Database migrations are backward-compatible by design

## Monitoring

### Logs

```bash
# Docker logs
docker compose logs -f backend

# Application logs
# Backend logs to stdout via morgan
```

### Metrics

- Backend exposes `/api/v1/health` with uptime and status
- Admin dashboard shows analytics metrics

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| Backend fails to start | Missing DATABASE_URL or JWT secrets | Set required env vars |
| CORS error in browser | FRONTEND_URL doesn't include origin | Add origin to FRONTEND_URL |
| Login works but refresh fails | COOKIE_SECURE/COOKIE_SAME_SITE mismatch | Match HTTPS setup |
| Resume upload rejected | File not PDF or exceeds size | Check file type and size |
| Prisma can't connect | DATABASE_URL unreachable | Check connection string |
| Env var not picked up | Vite env vars inlined at build time | Rebuild after changing .env |
