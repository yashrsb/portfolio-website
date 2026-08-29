# Folder Structure

This document describes the repository structure and the purpose of each directory.

## Root Directory

```
portfolio/
├── frontend/              # Public React website
├── admin/                 # Admin dashboard
├── backend/               # Express API server
├── docs/                  # Documentation
├── .github/               # GitHub Actions workflows
├── .env.example           # Environment variable reference
├── .gitignore             # Git ignore rules
├── .prettierrc            # Prettier configuration
├── .prettierignore        # Prettier ignore rules
├── docker-compose.yml     # Docker Compose configuration
├── package.json           # Root package scripts
└── README.md              # Project README
```

## Frontend (Public Website)

```
frontend/
├── src/
│   ├── main.jsx              # Application entry point
│   ├── App.jsx               # Main app component with routes
│   ├── index.css             # Global styles
│   ├── components/           # Reusable UI components
│   │   ├── common/           # Shared primitives (Button, Card, Container, etc.)
│   │   ├── navigation/       # Navbar component
│   │   ├── footer/           # Footer component
│   │   ├── project/          # ProjectCard component
│   │   ├── skills/           # SkillBadge component
│   │   ├── timeline/         # Timeline component
│   │   └── blog/             # BlogPostCard, BlogList, MarkdownRenderer
│   ├── pages/                # Route page components
│   │   ├── Home/             # Home page
│   │   ├── About/            # About page
│   │   ├── Projects/         # Projects listing
│   │   ├── ProjectDetailPage/ # Project detail (lazy-loaded)
│   │   ├── Skills/           # Skills page
│   │   ├── Experience/       # Experience page
│   │   ├── Education/        # Education page
│   │   ├── Contact/          # Contact form page
│   │   ├── Blog/             # Blog listing
│   │   ├── BlogPost/         # Blog post detail (lazy-loaded)
│   │   ├── CategoryPosts/    # Posts by category
│   │   ├── TagPosts/         # Posts by tag
│   │   └── NotFound/         # 404 page
│   ├── services/             # API service layer
│   │   ├── apiClient.js      # HTTP client with caching/retry
│   │   ├── profileService.js
│   │   ├── projectService.js
│   │   ├── blogService.js
│   │   ├── contactService.js
│   │   └── analyticsService.js
│   ├── hooks/                # Data fetching hooks
│   │   ├── useProfile.js
│   │   ├── useProjects.js
│   │   ├── useBlogPosts.js
│   │   ├── useAnalytics.js
│   │   └── ...
│   ├── context/              # React context providers
│   │   └── ThemeContext.jsx  # Dark/light theme
│   ├── utils/                # Utility functions
│   │   ├── seo.js            # SEO meta tag management
│   │   ├── blogSeo.js        # Blog-specific SEO
│   │   └── animation.js      # Animation utilities
│   ├── config/               # Configuration
│   │   └── seo.js            # SEO configuration
│   ├── styles/               # Design tokens
│   │   ├── tokens.css        # CSS custom properties
│   │   └── animations/       # Animation keyframes
│   └── tests/                # Test setup
│       └── setup.js          # Test configuration
├── public/                   # Static assets
├── index.html                # HTML entry point
├── vite.config.js            # Vite configuration
└── package.json              # Dependencies
```

## Admin Dashboard

```
admin/
├── src/
│   ├── main.jsx              # Application entry point
│   ├── App.jsx               # Main app component with routes
│   ├── components/           # UI components
│   │   ├── layout/           # AdminLayout, Sidebar, Topbar, Footer
│   │   ├── common/           # Reusable components
│   │   │   ├── DataTable/    # Data table component
│   │   │   ├── Modal/        # Modal dialog
│   │   │   ├── ConfirmDialog/
│   │   │   ├── Pagination/
│   │   │   ├── LineChart/    # Chart components
│   │   │   ├── BarChart/
│   │   │   ├── Button/, Badge/
│   │   │   ├── FormField/, TextInput/, TextArea/
│   │   │   ├── Select/, Checkbox/, Toggle/
│   │   │   ├── LoadingSpinner/, LoadingPage/
│   │   │   ├── EmptyState/
│   │   │   └── ErrorBoundary/, ApiErrorBanner/
│   │   ├── blog/             # MarkdownPreview
│   │   └── ProtectedRoute.jsx # Auth guard
│   ├── pages/                # Route page components
│   │   ├── LoginPage/        # Login page
│   │   ├── DashboardPage/    # Dashboard with stats
│   │   ├── ProjectsPage/     # Project CRUD
│   │   ├── SkillsPage/       # Skill CRUD
│   │   ├── ExperiencePage/   # Experience CRUD
│   │   ├── EducationPage/    # Education CRUD
│   │   ├── SocialLinksPage/  # Social link CRUD
│   │   ├── ContactMessagesPage/ # Message management
│   │   ├── BlogPostsPage/    # Blog post CRUD
│   │   ├── BlogCategoriesPage/
│   │   ├── BlogTagsPage/
│   │   ├── AnalyticsPage/    # Analytics dashboard
│   │   ├── ResumePage/       # Resume management
│   │   ├── SettingsPage/     # Settings
│   │   └── NotFoundPage/
│   ├── services/             # API service layer
│   │   ├── api/              # API client
│   │   │   └── apiClient.js  # Axios instance with interceptors
│   │   ├── tokenStore.js     # Access token storage
│   │   ├── authService.js    # Authentication
│   │   ├── crudService.js    # Base CRUD operations
│   │   ├── projectService.js
│   │   ├── blogPostService.js
│   │   └── ...
│   ├── hooks/                # Custom hooks
│   │   ├── useResource.js    # Generic data fetching
│   │   ├── useForm.js        # Form state management
│   │   └── useDirtyForm.js   # Dirty form detection
│   ├── context/              # React context providers
│   │   ├── AuthContext.jsx   # Authentication state
│   │   ├── ThemeContext.jsx  # Theme management
│   │   └── ToastContext.jsx  # Toast notifications
│   ├── utils/                # Utility functions
│   │   ├── validation.js     # Form validation
│   │   ├── apiErrors.js      # API error handling
│   │   └── retry.js          # Retry logic
│   ├── constants/            # Constants
│   │   └── api.js            # API configuration
│   └── tests/                # Test setup
│       └── setup.js          # Test configuration
├── public/                   # Static assets
├── index.html                # HTML entry point
├── vite.config.js            # Vite configuration
└── package.json              # Dependencies
```

## Backend (Express API)

```
backend/
├── src/
│   ├── server.js             # Server entry point
│   ├── app.js                # Express app configuration
│   ├── config/               # Configuration
│   │   ├── env.js            # Environment validation
│   │   ├── cors.js           # CORS configuration
│   │   ├── helmet.js         # Security headers
│   │   └── rateLimit.js      # Rate limiting
│   ├── constants/            # Constants
│   │   ├── httpStatus.js     # HTTP status codes
│   │   ├── errorCodes.js     # Error codes
│   │   └── messages.js       # User messages
│   ├── controllers/          # HTTP handlers
│   │   ├── portfolioController.js
│   │   ├── blogController.js
│   │   ├── adminController.js
│   │   ├── authController.js
│   │   ├── analyticsController.js
│   │   └── resumeController.js
│   ├── services/             # Business logic
│   │   ├── portfolioService.js
│   │   ├── blogService.js
│   │   ├── adminService.js
│   │   ├── authService.js
│   │   ├── tokenService.js
│   │   ├── analyticsService.js
│   │   ├── resumeService.js
│   │   ├── emailService.js
│   │   └── emailProviders/
│   │       └── smtpProvider.js
│   ├── repositories/         # Data access layer
│   │   ├── portfolioRepository.js
│   │   ├── blogRepository.js
│   │   ├── adminRepository.js
│   │   ├── authRepository.js
│   │   ├── analyticsRepository.js
│   │   └── resumeRepository.js
│   ├── routes/               # Route definitions
│   │   ├── index.js          # Root routes (sitemap, RSS, robots)
│   │   └── v1/
│   │       ├── index.js      # V1 route registration
│   │       ├── authRoutes.js
│   │       ├── adminRoutes.js
│   │       └── analyticsRoutes.js
│   ├── middlewares/          # Middleware functions
│   │   ├── authenticate.js   # JWT authentication
│   │   ├── authorize.js      # Role-based access
│   │   ├── validateRequest.js
│   │   ├── errorHandler.js   # Global error handler
│   │   ├── cacheHeaders.js
│   │   ├── spamProtection.js
│   │   ├── contactRateLimit.js
│   │   ├── analyticsRateLimit.js
│   │   ├── requestId.js
│   │   ├── requestLogger.js
│   │   ├── notFound.js
│   │   └── upload.js         # Multer configuration
│   ├── validators/           # Request validation rules
│   │   ├── contactValidator.js
│   │   ├── projectValidator.js
│   │   ├── skillValidator.js
│   │   ├── experienceValidator.js
│   │   ├── educationValidator.js
│   │   ├── certificateValidator.js
│   │   ├── achievementValidator.js
│   │   ├── socialLinkValidator.js
│   │   ├── blogValidator.js
│   │   ├── authValidator.js
│   │   ├── analyticsValidator.js
│   │   ├── reorderValidator.js
│   │   ├── idValidator.js
│   │   └── common.js
│   ├── storage/              # File storage abstraction
│   │   ├── StorageService.js
│   │   └── LocalStorageProvider.js
│   ├── utils/                # Utility functions
│   │   ├── ApiError.js       # Custom error class
│   │   ├── ApiResponse.js    # Response wrapper
│   │   ├── asyncHandler.js   # Async error wrapper
│   │   ├── logger.js         # Logging utility
│   │   ├── visitorHash.js    # Visitor hashing
│   │   ├── userAgentParser.js
│   │   ├── botDetection.js
│   │   └── rss.js            # RSS feed generation
│   └── import/               # Portfolio data import
│       ├── index.js
│       ├── normalizer.js
│       └── validator.js
├── prisma/                   # Prisma configuration
│   ├── schema.prisma         # Database schema
│   ├── migrations/           # Database migrations
│   └── seed.js               # Seed script
├── tests/                    # Test files
│   ├── setup.js              # Test configuration
│   ├── authService.test.js
│   ├── authenticate.test.js
│   ├── errorHandler.test.js
│   ├── security.test.js
│   └── ...
├── uploads/                  # File uploads (gitignored)
├── .env.example              # Environment reference
├── prisma.config.ts          # Prisma configuration
├── Dockerfile                # Docker configuration
└── package.json              # Dependencies
```

## Documentation

```
docs/
├── architecture.md           # System architecture
├── api.md                    # API reference
├── database.md               # Database documentation
├── deployment.md             # Deployment guide
├── testing.md                # Testing documentation
├── security.md               # Security documentation
├── folder-structure.md       # This file
├── analytics.md              # Analytics documentation
├── runtime-verification.md   # Runtime verification
└── my-portfolio-data.md      # Portfolio data reference
```

## Docker

```
docker-compose.yml            # Docker Compose configuration
frontend/Dockerfile           # Frontend container
admin/Dockerfile              # Admin container
backend/Dockerfile            # Backend container
```

## GitHub Actions

```
.github/
└── workflows/
    └── ci.yml                # CI workflow
```

## Key Files

| File | Purpose |
|------|---------|
| `package.json` | Root package with scripts for all apps |
| `docker-compose.yml` | Docker Compose for local development |
| `backend/prisma/schema.prisma` | Database schema definition |
| `backend/src/config/env.js` | Environment variable validation |
| `frontend/src/services/apiClient.js` | Frontend HTTP client |
| `admin/src/services/api/apiClient.js` | Admin API client |
