# Portfolio

A modern, production-ready personal portfolio website showcasing experience, projects, skills, and blog.

## Tech Stack

### Frontend

- **React 18** — UI library
- **Vite** — Build tool and dev server
- **React Router 6** — Client-side routing
- **CSS** — Styling (no framework)

### Backend

- **Node.js** — JavaScript runtime
- **Express** — Web framework
- **Helmet** — Security headers
- **CORS** — Cross-origin resource sharing
- **Compression** — gzip response compression
- **Morgan** — HTTP request logging
- **express-rate-limit** — API rate limiting
- **express-validator** — Request validation
- **dotenv** — Environment variable loading

### Tooling

- **ESLint** — Code linting
- **Prettier** — Code formatting
- **npm** — Package manager

## Folder Structure

```
portfolio/
│
├── frontend/               # React application
│   ├── public/             # Static assets
│   ├── src/                # Application source code
│   │   ├── App.jsx         # Root component with routing
│   │   ├── main.jsx        # Application entry point
│   │   └── index.css       # Global styles
│   ├── index.html          # HTML template
│   ├── vite.config.js      # Vite configuration
│   ├── .eslintrc.cjs       # ESLint configuration
│   └── package.json        # Frontend dependencies
│
├── backend/                # Express API server
│   ├── src/
│   │   ├── app.js          # Express app factory
│   │   ├── server.js       # Server entry point (listens + graceful shutdown)
│   │   ├── config/         # Environment validation, CORS, Helmet, rate limit
│   │   ├── constants/      # HTTP status codes, error codes, messages
│   │   ├── controllers/    # Thin HTTP handlers (validate → call service → respond)
│   │   ├── data/           # Mock data (moved from frontend)
│   │   ├── middlewares/    # requestId, requestLogger, validateRequest, errorHandler, notFound
│   │   ├── repositories/   # Data access layer (mock now, PostgreSQL later)
│   │   ├── routes/         # API route definitions (versioned under routes/v1)
│   │   ├── services/       # Business logic layer
│   │   ├── utils/          # ApiError, ApiResponse, asyncHandler, logger
│   │   └── validators/     # express-validator rules
│   ├── .eslintrc.cjs       # ESLint configuration
│   └── package.json        # Backend dependencies
│
├── docs/                   # Documentation
├── .github/                # GitHub templates and workflows
├── .prettierrc             # Prettier configuration
├── .prettierignore         # Files Prettier should ignore
├── .gitignore              # Git ignore rules
├── package.json            # Root workspace scripts
└── README.md               # Project documentation
```

## Architecture

The backend follows a layered architecture:

```
Request → Middleware stack → Routes → Validators → Controllers → Services → Repositories → Data
```

- **Routes** define URL-to-handler mappings and mount validation rules.
- **Controllers** are thin — they validate the request, call a service, and send a standardized response. No business logic.
- **Services** contain business logic. They are async so they can later query PostgreSQL without changing controllers.
- **Repositories** isolate data access. Currently they return mock data; later they will query the database.
- **Data** holds all mock JSON payloads.
- **Middlewares** handle cross-cutting concerns (security, logging, rate limiting, error handling).

## API

All endpoints are versioned under `/api/v1`.

### Endpoints

| Method | Path                 | Description                                  |
| ------ | -------------------- | -------------------------------------------- |
| GET    | `/api/v1`            | List all available endpoints and API version |
| GET    | `/api/v1/health`     | Service health status                        |
| GET    | `/api/v1/projects`   | List all projects                            |
| GET    | `/api/v1/experience` | Work experience entries                      |
| GET    | `/api/v1/skills`     | Skills grouped by category                   |
| GET    | `/api/v1/education`  | Education, certificates, and achievements    |
| GET    | `/api/v1/profile`    | Profile information                          |
| GET    | `/api/v1/social`     | Social links                                 |
| POST   | `/api/v1/contact`    | Submit a contact message (mock, returns 202) |

### Response Format

All successful responses use a consistent envelope:

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

Error responses:

```json
{
  "success": false,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "errors": [
    {
      "field": "email",
      "message": "A valid email address is required"
    }
  ],
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "0c1d2e3f-..."
  }
}
```

### Example Requests

```bash
# Health check
curl http://localhost:5000/api/v1/health

# List projects
curl http://localhost:5000/api/v1/projects

# List experience
curl http://localhost:5000/api/v1/experience

# List skills
curl http://localhost:5000/api/v1/skills

# List education
curl http://localhost:5000/api/v1/education

# Profile
curl http://localhost:5000/api/v1/profile

# Social links
curl http://localhost:5000/api/v1/social

# Submit a contact message (validated)
curl -X POST http://localhost:5000/api/v1/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@example.com","subject":"Hello there","message":"This is a test message with enough length."}'
```

### Contact Validation Rules

| Field   | Rules                         |
| ------- | ----------------------------- |
| name    | required, 2–100 characters    |
| email   | required, valid email address |
| subject | required, 5–150 characters    |
| message | required, 10–2000 characters  |

## Setup

### Prerequisites

- Node.js 18+
- npm 9+

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd portfolio

# Install all dependencies (root, frontend, and backend)
npm install
npm run install:all
```

### Environment Variables

Copy the example environment files and adjust as needed:

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Backend variables:

| Variable       | Description                         | Default                 |
| -------------- | ----------------------------------- | ----------------------- |
| `PORT`         | Server port                         | `5000`                  |
| `NODE_ENV`     | `development`, `production`, `test` | `development`           |
| `API_PREFIX`   | Versioned API base path             | `/api/v1`               |
| `FRONTEND_URL` | Allowed CORS origin(s)              | `http://localhost:5173` |

### Development

Start both frontend and backend simultaneously:

```bash
# Start the frontend dev server (http://localhost:5173)
npm run dev

# Start the backend server (http://localhost:5000)
npm run server
```

### Linting

```bash
# Lint both frontend and backend
npm run lint
```

### Formatting

```bash
# Format all files with Prettier
npm run format

# Check formatting without making changes
npm run format:check
```

## Development Commands

| Command                | Description                            |
| ---------------------- | -------------------------------------- |
| `npm run dev`          | Start frontend dev server on port 5173 |
| `npm run server`       | Start backend server on port 5000      |
| `npm run lint`         | Run ESLint on both projects            |
| `npm run format`       | Format all files with Prettier         |
| `npm run format:check` | Check formatting without modifying     |
| `npm run install:all`  | Install dependencies for all projects  |

## License

MIT
