# Portfolio

A modern, production-ready personal portfolio website showcasing experience,
projects, skills, and blog — with an admin dashboard for content management.

## Overview

This repository is a full-stack monorepo with three applications:

- **frontend** — the public portfolio website (React + Vite, port 5173)
- **admin** — the admin dashboard for content management (React + Vite, port 5174)
- **backend** — the Express API + PostgreSQL database (port 5000)

## Features

- Public portfolio pages: Home, About, Projects, Skills, Experience, Education, Contact
- Dark/light theme with design tokens and reduced-motion support
- Admin dashboard with role-based access (`ADMIN`, `EDITOR`)
- Full authentication: login, refresh-token rotation, logout, reuse detection
- CRUD + reorder for Projects, Skills, Experience, Education, Certificates, Achievements, Social Links
- Contact message submission and management
- Resume upload / replace / delete / download (local file storage)
- Dashboard statistics
- Versioned REST API with a consistent response envelope
- Standardized error handling, request IDs, rate limiting, and security headers

## Tech Stack

### Frontend / Admin

- **React 18** — UI library
- **Vite** — build tool and dev server
- **React Router 6** — client-side routing
- **CSS Modules** — component-scoped styling
- **Axios** (admin) — HTTP client with retry/cache helpers

### Backend

- **Node.js** & **Express** — HTTP server
- **PostgreSQL** — database
- **Prisma 7** — ORM and migrations
- **JWT** — access + refresh tokens
- **bcryptjs** — password hashing
- **helmet, cors, compression, express-rate-limit** — security & performance
- **express-validator** — request validation
- **multer** — file uploads (resume)
- **zod / yaml** — portfolio data import validation

### Tooling

- **ESLint** — linting (`--max-warnings 0`)
- **Prettier** — formatting
- **npm** — package manager

## Architecture

The backend follows a clean layered architecture:

```
Request → Middleware → Routes → Validators → Controllers → Services → Repositories → Database
                                                                              └→ StorageService
```

See [docs/architecture.md](docs/architecture.md) for the full design,
including the authentication flow, resume management, and CRUD architecture.

## Folder Structure

```
portfolio/
├── frontend/                 # Public React website (:5173)
│   ├── src/
│   │   ├── components/       # Reusable UI
│   │   ├── pages/            # Route pages
│   │   ├── services/         # API client + services
│   │   ├── hooks/            # Data hooks
│   │   ├── context/          # Theme context
│   │   ├── data/             # Static copy
│   │   └── styles/           # Design tokens
│   └── index.html
├── admin/                    # Admin dashboard (:5174)
│   ├── src/
│   │   ├── components/       # UI kit + layout
│   │   ├── pages/            # Login, Dashboard, CRUD pages, Resume
│   │   ├── services/         # apiClient, auth, CRUD services
│   │   ├── context/          # Auth, Theme, Toast
│   │   └── hooks/            # useForm, useResource, useDirtyForm
│   └── index.html
├── backend/                  # Express API (:5000)
│   ├── src/
│   │   ├── config/           # Env, CORS, helmet, rate-limit
│   │   ├── constants/        # Status codes, error codes, messages
│   │   ├── controllers/      # Thin HTTP handlers
│   │   ├── middlewares/      # Auth, error, logging, validation
│   │   ├── repositories/     # Data access (Prisma)
│   │   ├── routes/           # Versioned routes (v1)
│   │   ├── services/         # Business logic
│   │   ├── storage/          # StorageService + providers
│   │   ├── utils/            # ApiError, ApiResponse, logger
│   │   └── validators/       # express-validator rules
│   ├── prisma/               # Schema, migrations, seed
│   └── package.json
├── docs/                     # Architecture, API, deployment docs
├── .env.example              # Central env reference
└── package.json              # Root scripts
```

## Prerequisites

- Node.js 18+
- npm 9+
- PostgreSQL 14+ (local or hosted)

## Setup

```bash
# 1. Clone and navigate
git clone <repository-url>
cd portfolio

# 2. Install all dependencies
npm install
npm run install:all

# 3. Configure environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
cp admin/.env.example admin/.env
# Fill in DATABASE_URL, JWT secrets, and admin password.

# 4. Set up the database (from backend/)
cd backend
npm run db:migrate    # apply migrations (dev)
npm run db:seed       # seed content + admin user
npm run db:generate   # regenerate Prisma client
cd ..
```

## Development

From the repository root:

```bash
npm run dev        # frontend  → http://localhost:5173
npm run admin      # admin     → http://localhost:5174
npm run server     # backend   → http://localhost:5000
```

## Build

```bash
npm run build --prefix frontend   # → frontend/dist
npm run build --prefix admin      # → admin/dist
```

## Lint & Format

```bash
npm run lint          # ESLint on all three apps
npm run format        # Prettier write
npm run format:check  # Prettier check
```

## Database Commands (backend/)

| Command                     | Description                         |
| --------------------------- | ----------------------------------- |
| `npm run db:migrate`        | Apply migrations in development     |
| `npm run db:migrate:deploy` | Apply migrations in production      |
| `npm run db:generate`       | Regenerate the Prisma client        |
| `npm run db:seed`           | Seed portfolio content + admin user |
| `npm run db:studio`         | Open Prisma Studio                  |

## API

The API is available at `http://localhost:5001/api/v1`. See
[docs/api.md](docs/api.md) for the full reference.

Quick examples:

```bash
# Health check
curl http://localhost:5001/api/v1/health

# List projects
curl http://localhost:5001/api/v1/projects

# Download the latest resume
curl http://localhost:5001/api/v1/resume/download
```

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
