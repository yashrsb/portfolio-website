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

### Prerequisites

- Node.js 22+
- npm 9+
- PostgreSQL 14+

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

The admin dashboard provides:
- Dashboard with analytics overview
- CRUD management for projects, skills, experience, education, certificates, achievements, and social links
- Blog post editor with Markdown preview and publish/unpublish workflow
- Contact message management
- Resume upload and management
- Analytics dashboard with charts and date range selection

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

### Test Coverage

| Application | Test Files | Tests |
|-------------|------------|-------|
| Backend | 20 | 205 |
| Frontend | 7 | 100 |
| Admin | 8 | 107 |
| **Total** | **35** | **412** |

## Docker

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

| Service | Port | Description |
|---------|------|-------------|
| frontend | 3000 | Public website (Nginx) |
| admin | 3001 | Admin dashboard (Nginx) |
| backend | 5000 | Express API |
| postgres | 5432 | PostgreSQL database |

## CI/CD

The project uses GitHub Actions for continuous integration:

1. **Lint**: ESLint with zero warnings
2. **Test**: Run all test suites
3. **Prisma Validation**: Validate Prisma schema
4. **Build**: Build frontend and admin applications

See [.github/workflows/ci.yml](.github/workflows/ci.yml) for details.

## Deployment

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Set `FRONTEND_URL` to your public origins
- [ ] Set `COOKIE_SECURE=true` (HTTPS only)
- [ ] Use strong, unique JWT secrets
- [ ] Set a strong admin password
- [ ] Point `DATABASE_URL` at a managed PostgreSQL instance
- [ ] Configure storage directory
- [ ] Terminate TLS at the reverse proxy
- [ ] Enable request logging
- [ ] Verify CORS settings
- [ ] Run tests and build in CI

See [docs/deployment.md](docs/deployment.md) for detailed deployment instructions.

## Documentation

- [Architecture](docs/architecture.md) — System and code architecture
- [API Reference](docs/api.md) — Complete API documentation
- [Database](docs/database.md) — Database schema and migrations
- [Deployment](docs/deployment.md) — Deployment guide
- [Testing](docs/testing.md) — Testing documentation
- [Security](docs/security.md) — Security considerations

## Security

- JWT authentication with refresh token rotation
- Refresh token reuse detection
- bcrypt password hashing
- HttpOnly cookies for refresh tokens
- Role-based access control
- Input validation and sanitization
- Rate limiting on sensitive endpoints
- Helmet security headers
- CORS configuration
- Spam protection with honeypot

See [docs/security.md](docs/security.md) for detailed security documentation.

## Known Limitations

- No build-time image optimization (WebP/AVIF conversion)
- Frontend cache is per-session (no cross-session caching)
- No real-time features (WebSocket support)
- Analytics data retention is fixed (no UI for configuration)

## Future Improvements

- Multi-language support (i18n)
- Advanced image optimization pipeline
- Content versioning and history
- Advanced analytics with custom events
- Email template customization
- Webhook integrations

## License

MIT
