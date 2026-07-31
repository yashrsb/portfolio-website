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
- **Morgan** — HTTP request logging

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
│   │   ├── config/         # Application configuration
│   │   ├── controllers/    # Route handlers (future)
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API route definitions
│   │   ├── utils/          # Utility functions
│   │   └── server.js       # Server entry point
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
