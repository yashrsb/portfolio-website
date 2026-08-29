# Personal Portfolio

A full-stack personal portfolio website with a public-facing site, admin dashboard, and REST API. Built with React, Node.js, Express, and PostgreSQL.

## Highlights

- **Public Portfolio**: Responsive React website showcasing projects, experience, skills, education, and blog
- **Admin Dashboard**: Secure content management system with role-based access control
- **Blog Engine**: Custom Markdown-powered blog with categories, tags, and SEO optimization
- **Contact System**: Spam-protected contact form with email notifications
- **Resume Management**: PDF upload and public download functionality
- **Analytics**: Privacy-conscious first-party analytics dashboard
- **SEO**: Dynamic meta tags, Open Graph, Twitter cards, JSON-LD structured data, sitemap, and RSS

## Architecture

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
               ┌───────────┼──────────────┐
               ▼           ▼              ▼
         ┌──────────┐  ┌─────────┐  ┌────────────┐
         │PostgreSQL│  │ Files   │  │  Email     │
         │(Prisma)  │  │(uploads)│  │ (SMTP)     │
         └──────────┘  └─────────┘  └────────────┘
```

The backend follows a layered architecture: Routes → Controllers → Services → Repositories → Prisma → PostgreSQL. Each layer has a single responsibility and depends only on the layer below it.

## Technology Stack

### Frontend / Admin
- **React 18** — UI library
- **Vite** — Build tool and dev server
- **React Router 6** — Client-side routing
- **CSS Modules** — Component-scoped styling
- **Axios** (admin) — HTTP client with retry/cache

### Backend
- **Node.js** & **Express** — HTTP server
- **PostgreSQL** — Database
- **Prisma 7** — ORM and migrations
- **JWT** — Access + refresh tokens
- **bcryptjs** — Password hashing
- **helmet, cors, compression, express-rate-limit** — Security & performance
- **express-validator** — Request validation
- **multer** — File uploads
- **nodemailer** — Email notifications

### DevOps
- **GitHub Actions** — CI/CD
- **Docker** — Containerization (optional)
- **ESLint** — Linting
- **Prettier** — Formatting
- **Vitest** — Testing

## Features

### Public Website
- Home, About, Projects, Skills, Experience, Education, Contact pages
- Blog with categories, tags, search, and pagination
- Dark/light theme with system preference detection
- Responsive design with mobile navigation
- SEO-optimized with dynamic meta tags and structured data
- Accessibility features including reduced-motion support

### Admin Dashboard
- Dashboard with analytics overview
- CRUD management for all portfolio content
- Blog post editor with Markdown preview
- Contact message management
- Resume upload and management
- Analytics dashboard with charts

### API
- RESTful API with versioned endpoints (`/api/v1`)
- Standardized response envelope
- JWT authentication with refresh token rotation
- Role-based access control (ADMIN, EDITOR)
- Rate limiting and spam protection
- File upload support

## Project Structure

```
portfolio/
├── frontend/                 # Public React website (:5173)
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Route pages
│   │   ├── services/         # API client + services
│   │   ├── hooks/            # Data fetching hooks
│   │   ├── context/          # Theme context
│   │   └── styles/           # Design tokens
│   └── index.html
├── admin/                    # Admin dashboard (:5174)
│   ├── src/
│   │   ├── components/       # UI kit + layout
│   │   ├── pages/            # Login, Dashboard, CRUD pages
│   │   ├── services/         # API services
│   │   ├── context/          # Auth, Theme, Toast
│   │   └── hooks/            # useForm, useResource
│   └── index.html
├── backend/                  # Express API (:5000)
│   ├── src/
│   │   ├── config/           # Environment, CORS, security
│   │   ├── controllers/      # HTTP handlers
│   │   ├── middlewares/      # Auth, validation, errors
│   │   ├── repositories/     # Data access (Prisma)
│   │   ├── routes/           # Versioned routes
│   │   ├── services/         # Business logic
│   │   ├── storage/          # File storage abstraction
│   │   ├── utils/            # ApiError, ApiResponse, logger
│   │   └── validators/       # Request validation rules
│   ├── prisma/               # Schema, migrations, seed
│   └── package.json
├── docs/                     # Documentation
├── .github/                  # GitHub Actions workflows
├── docker-compose.yml        # Docker Compose configuration
└── package.json              # Root scripts
```

## Getting Started

- Node.js 22 LTS
- npm 10+
- PostgreSQL 14+ (local or hosted)
- Docker & Docker Compose (optional, for containerized deployment)

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd portfolio

# Install dependencies
npm install
npm run install:all
```

### Environment Setup

```bash
# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your DATABASE_URL and secrets

# Frontend (optional)
cp frontend/.env.example frontend/.env

# Admin (optional)
cp admin/.env.example admin/.env
```

### Database Setup

```bash
cd backend

# Apply migrations
npm run db:migrate

# Generate Prisma client
npm run db:generate

# Seed database with portfolio content and admin user
npm run db:seed
```

## Running the Applications

```bash
# From the repository root

# Start frontend (public website)
npm run dev              # → http://localhost:5173

# Start admin dashboard
npm run admin            # → http://localhost:5174

# Start backend API
npm run server           # → http://localhost:5000
```

## Admin Dashboard

Access the admin dashboard at `http://localhost:5174/login`. Use the credentials from your seed data (default: `admin@example.com` / `change-me-admin-password`).

## Lint & Format

```bash
npm run lint          # ESLint on all three apps
npm run format        # Prettier write
npm run format:check  # Prettier check
```

## Testing

```bash
# Run all tests
npm test

# Run individual suites
npm run test:backend
npm run test:frontend
npm run test:admin

# Run with coverage
npm run test:coverage
```

See [docs/testing.md](docs/testing.md) for the full testing documentation.

## Database Commands (backend/)

| Command                     | Description                         |
| --------------------------- | ----------------------------------- |
| `npm run db:migrate`        | Apply migrations in development     |
| `npm run db:migrate:deploy` | Apply migrations in production      |
| `npm run db:generate`       | Regenerate the Prisma client        |
| `npm run db:seed`           | Seed portfolio content + admin user |
| `npm run db:studio`         | Open Prisma Studio                  |

## API

The API is available at `http://localhost:5000/api/v1`.

### Response Format

All responses use a consistent envelope:

```json
{
  "success": true,
  "message": "Resource fetched successfully.",
  "data": {},
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "0c1d2e3f-..."
  }
}
```

### Public Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Service health status |
| GET | `/projects` | List all projects |
| GET | `/projects/:slug` | Get project by slug |
| GET | `/experience` | Work experience |
| GET | `/skills` | Skills grouped by category |
| GET | `/education` | Education, certificates, achievements |
| GET | `/profile` | Profile information |
| GET | `/social` | Social links |
| GET | `/resume/download` | Download latest resume |
| POST | `/contact` | Submit contact message |
| GET | `/blog/posts` | List published posts |
| GET | `/blog/posts/:slug` | Get post by slug |
| GET | `/blog/categories` | List categories |
| GET | `/blog/tags` | List tags |

### Authentication

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/login` | Log in with email + password |
| POST | `/auth/refresh` | Rotate refresh token |
| POST | `/auth/logout` | Revoke refresh token |
| GET | `/auth/me` | Get current user |

### Admin Endpoints

All admin endpoints require authentication with ADMIN role. See [docs/api.md](docs/api.md) for the complete API reference.

## Authentication

The application uses JWT-based authentication with access and refresh tokens:

- **Access Tokens**: Short-lived (15 minutes), stored in memory
- **Refresh Tokens**: Long-lived (7 days), stored as HttpOnly cookies
- **Token Rotation**: Refresh tokens are rotated on each use
- **Reuse Detection**: If a revoked token is reused, all tokens for the user are revoked
- **Role-Based Access**: ADMIN and EDITOR roles control access to admin endpoints

## Blog Engine

The blog engine is a custom Markdown-powered system:

- **Markdown Support**: Write posts in Markdown with syntax highlighting
- **Categories & Tags**: Organize posts with categories and tags
- **Search**: Full-text search across post content
- **Pagination**: Configurable posts per page
- **Draft Workflow**: Save as draft, preview, and publish when ready
- **SEO**: Automatic meta tags, Open Graph, and JSON-LD structured data
- **RSS Feed**: `/rss.xml` with published posts
- **Sitemap**: Dynamic sitemap including blog posts

## Contact System

The contact system includes multiple layers of protection:

- **Validation**: Server-side validation of all fields
- **Rate Limiting**: Configurable rate limit per IP (default: 5 per 15 minutes)
- **Spam Protection**: Honeypot fields and bot detection
- **Email Notifications**: Automatic email notifications on submission
- **Status Tracking**: Track email delivery status

## Resume Management

- **PDF Only**: Only PDF files are accepted
- **Size Limit**: Configurable maximum file size (default: 5 MB)
- **Storage Abstraction**: Pluggable storage backend (local by default)
- **Public Download**: Latest resume available at `/api/v1/resume/download`
- **Metadata Tracking**: File metadata stored in database

## SEO

The portfolio implements comprehensive SEO:

- **Dynamic Meta Tags**: Title, description, and canonical URLs
- **Open Graph**: Facebook and LinkedIn sharing
- **Twitter Cards**: Twitter/X sharing
- **JSON-LD**: Person, WebSite, BlogPosting, SoftwareApplication schemas
- **Sitemap**: Dynamic XML sitemap at `/sitemap.xml`
- **Robots.txt**: Configurable at `/robots.txt`
- **RSS Feed**: At `/rss.xml`
- **Draft Handling**: Draft posts get `noindex` meta tag

## Testing

```bash
# Run all tests
npm test

# Run individual suites
npm run test:backend
npm run test:frontend
npm run test:admin

# Run with coverage
npm run test:coverage
```

## Docker Deployment

The application can be run locally using Docker Compose for a production-like
environment without installing Node.js or PostgreSQL locally.

### Quick Start

```bash
# 1. Clone the repository
git clone <repository-url>
cd portfolio

# 2. Create environment file
cp docker/.env.example .env

# 3. Build and start all services
docker compose up --build

# 4. Access the application
# Public frontend: http://localhost:3000
# Admin dashboard:  http://localhost:3001
# Backend API:      http://localhost:5000
```

### Docker Architecture

```
Browser
   │
   ├── localhost:3000 → Frontend (Nginx)
   │
   └── localhost:3001 → Admin (Nginx)
                         │
                         ▼
                   localhost:5000 (Backend API)
                         │
                         ▼
                    PostgreSQL (Docker Volume)
                         │
                         └── Named Volume: postgres_data
```

### Ports

| Service   | Host Port | Container Port |
|-----------|-----------|----------------|
| Frontend  | 3000      | 3000           |
| Admin     | 3001      | 3001           |
| Backend   | 5000      | 5000           |
| PostgreSQL| 5432      | 5432           |

### Docker Commands

| Command                          | Description                          |
|----------------------------------|--------------------------------------|
| `docker compose up --build`      | Build and start all services         |
| `docker compose up -d --build`   | Start in detached mode               |
| `docker compose down`            | Stop services (preserves data)       |
| `docker compose down -v`         | Stop and remove volumes (erases data)|
| `docker compose logs -f`         | Follow logs                          |
| `docker compose logs -f backend` | Follow backend logs                  |
| `docker compose ps`              | List running services                |
| `docker compose build --no-cache`| Rebuild without cache                |

### Environment Variables

Docker-specific environment variables are configured in `.env` (see
`docker/.env.example`). Key variables:

| Variable              | Description                          |
|-----------------------|--------------------------------------|
| `POSTGRES_DB`         | PostgreSQL database name             |
| `POSTGRES_USER`       | PostgreSQL username                  |
| `POSTGRES_PASSWORD`   | PostgreSQL password                  |
| `JWT_ACCESS_SECRET`   | JWT access token secret              |
| `JWT_REFRESH_SECRET`  | JWT refresh token secret             |
| `ADMIN_PASSWORD`      | Admin user password                  |
| `VITE_API_BASE_URL`   | Backend API URL (browser-facing)     |

### Database Persistence

PostgreSQL data is stored in a named Docker volume (`postgres_data`). Data
survives `docker compose down` but is removed with `docker compose down -v`.

### Production Notes

- Docker provides a reproducible development/staging environment
- For production deployments, use the existing CI/CD pipeline (GitHub Actions)
- The frontend and admin are served via Nginx with SPA fallback
- The backend runs Prisma migrations automatically on startup

## Documentation

- [docs/architecture.md](docs/architecture.md) — system and code architecture
- [docs/api.md](docs/api.md) — API reference
- [docs/deployment.md](docs/deployment.md) — environment, build, and deployment
- [docs/runtime-verification.md](docs/runtime-verification.md) — manual verification checklist

## CI/CD

The project includes GitHub Actions workflows for continuous integration and
deployment:

- **CI** — runs lint, tests, Prisma validation, and builds on every PR and push to `main`
- **Deploy** — deploys to production after CI passes on `main`; checks out the exact CI-validated commit, applies migrations, runs smoke tests

See [docs/architecture.md#ci-cd-flow-hardened](docs/architecture.md#ci-cd-flow-hardened)
for full documentation of the CI/CD architecture, required GitHub secrets, migration
strategy, persistent file safety, SSH host verification, and rollback procedure.

See [docs/deployment.md](docs/deployment.md) for detailed deployment instructions and
[docs/runtime-verification.md](docs/runtime-verification.md) for the manual verification checklist.

## License

MIT
