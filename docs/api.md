# API Reference

The API is versioned and mounted under `/api/v1`. The base URL is:

```
http://localhost:5000/api/v1
```

## Response Envelope

All responses use a consistent shape:

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

### Error Response

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

## Authentication

### Public Endpoints

No authentication required.

### Authenticated Endpoints

Require a valid access token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### Admin Endpoints

Require a valid access token with ADMIN role.

---

## Health & Discovery

### Health Check

```
GET /api/v1/health
```

Returns service health status.

**Response:**
```json
{
  "success": true,
  "message": "Health check successful",
  "data": {
    "status": "ok",
    "uptime": 125.78,
    "timestamp": "2024-01-01T00:00:00.000Z",
    "environment": "production",
    "version": "v1"
  }
}
```

### API Discovery

```
GET /api/v1/
```

Returns a list of all available API endpoints.

---

## Public Portfolio Endpoints

### Profile

```
GET /api/v1/profile
```

Returns profile information.

### Projects

```
GET /api/v1/projects
GET /api/v1/projects/:slug
```

| Parameter | Type | Description |
|-----------|------|-------------|
| slug | string | Project slug (URL-friendly identifier) |

**Project Response:**
```json
{
  "data": {
    "id": "uuid",
    "slug": "my-project",
    "title": "My Project",
    "description": "Project description",
    "summary": "Short summary",
    "imageUrl": "https://...",
    "githubUrl": "https://github.com/...",
    "demoUrl": "https://...",
    "status": "live",
    "featured": true,
    "displayOrder": 0,
    "tags": ["react", "nodejs"],
    "techStack": { "Frontend": ["React"], "Backend": ["Node.js"] },
    "features": ["Feature 1", "Feature 2"],
    "challenges": ["Challenge 1"],
    "lessonsLearned": ["Lesson 1"],
    "architecture": "Architecture description",
    "architectureImage": "https://...",
    "screenshots": [{ "src": "...", "alt": "...", "caption": "..." }]
  }
}
```

### Experience

```
GET /api/v1/experience
```

Returns work experience entries.

### Skills

```
GET /api/v1/skills
```

Returns skills grouped by category.

### Education

```
GET /api/v1/education
```

Returns education, certificates, and achievements.

### Social Links

```
GET /api/v1/social
```

Returns social links.

### Resume Download

```
GET /api/v1/resume/download
```

Downloads the latest resume file (PDF).

---

## Blog Endpoints

### List Posts

```
GET /api/v1/blog/posts?page=1&limit=10&search=query
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| page | integer | 1 | Page number |
| limit | integer | 10 | Posts per page |
| search | string | - | Search query |

### Get Post

```
GET /api/v1/blog/posts/:slug
```

### Featured Posts

```
GET /api/v1/blog/featured
```

### Categories

```
GET /api/v1/blog/categories
GET /api/v1/blog/categories/:slug/posts
```

### Tags

```
GET /api/v1/blog/tags
GET /api/v1/blog/tags/:slug/posts
```

### Blog Sitemap

```
GET /api/v1/blog/sitemap
```

Returns JSON sitemap of published blog post slugs.

---

## Contact Endpoint

### Submit Contact Message

```
POST /api/v1/contact
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Hello",
  "message": "Your message here"
}
```

| Field | Rules |
|-------|-------|
| name | Required, 2-100 characters |
| email | Required, valid email address |
| subject | Required, 5-150 characters |
| message | Required, 10-2000 characters |

**Rate Limited:** 5 requests per 15 minutes per IP.

---

## Analytics Endpoint

### Record Event

```
POST /api/v1/analytics/events
```

**Request Body:**
```json
{
  "eventType": "PAGE_VIEW",
  "path": "/projects"
}
```

**Rate Limited:** 60 requests per 60 seconds per IP.

---

## Authentication Endpoints

### Login

```
POST /api/v1/auth/login
```

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "your-password"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJ...",
    "refreshToken": "...",
    "maxAge": 604800000,
    "user": {
      "id": "uuid",
      "name": "Admin",
      "email": "admin@example.com",
      "role": "ADMIN"
    }
  }
}
```

Also sets an HttpOnly refresh token cookie.

### Refresh Token

```
POST /api/v1/auth/refresh
```

Reads refresh token from HttpOnly cookie and returns a new access token.

### Logout

```
POST /api/v1/auth/logout
```

Revokes the refresh token and clears the cookie.

### Get Current User

```
GET /api/v1/auth/me
```

**Headers:** `Authorization: Bearer <token>`

Returns the current authenticated user.

---

## Admin Endpoints

All admin endpoints require authentication with ADMIN role.

### Dashboard Stats

```
GET /api/v1/admin/stats
```

Returns dashboard statistics.

### Profile Management

```
GET /api/v1/admin/profile
PUT /api/v1/admin/profile
```

### Project Management

```
GET /api/v1/admin/projects
GET /api/v1/admin/projects/:id
POST /api/v1/admin/projects
PUT /api/v1/admin/projects/:id
DELETE /api/v1/admin/projects/:id
PATCH /api/v1/admin/projects/reorder
```

**Reorder Body:**
```json
{
  "items": [
    { "id": "uuid-1", "displayOrder": 0 },
    { "id": "uuid-2", "displayOrder": 1 }
  ]
}
```

### Skill Management

```
GET /api/v1/admin/skills
GET /api/v1/admin/skills/:id
POST /api/v1/admin/skills
PUT /api/v1/admin/skills/:id
DELETE /api/v1/admin/skills/:id
PATCH /api/v1/admin/skills/reorder
```

### Experience Management

```
GET /api/v1/admin/experience
GET /api/v1/admin/experience/:id
POST /api/v1/admin/experience
PUT /api/v1/admin/experience/:id
DELETE /api/v1/admin/experience/:id
PATCH /api/v1/admin/experience/reorder
```

### Education Management

```
GET /api/v1/admin/education
GET /api/v1/admin/education/:id
POST /api/v1/admin/education
PUT /api/v1/admin/education/:id
DELETE /api/v1/admin/education/:id
PATCH /api/v1/admin/education/reorder
```

### Certificate Management

```
GET /api/v1/admin/certificates
GET /api/v1/admin/certificates/:id
POST /api/v1/admin/certificates
PUT /api/v1/admin/certificates/:id
DELETE /api/v1/admin/certificates/:id
PATCH /api/v1/admin/certificates/reorder
```

### Achievement Management

```
GET /api/v1/admin/achievements
GET /api/v1/admin/achievements/:id
POST /api/v1/admin/achievements
PUT /api/v1/admin/achievements/:id
DELETE /api/v1/admin/achievements/:id
PATCH /api/v1/admin/achievements/reorder
```

### Social Link Management

```
GET /api/v1/admin/social-links
GET /api/v1/admin/social-links/:id
POST /api/v1/admin/social-links
PUT /api/v1/admin/social-links/:id
DELETE /api/v1/admin/social-links/:id
PATCH /api/v1/admin/social-links/reorder
```

### Contact Message Management

```
GET /api/v1/admin/contact-messages
GET /api/v1/admin/contact-messages/:id
PUT /api/v1/admin/contact-messages/:id
DELETE /api/v1/admin/contact-messages/:id
```

### Resume Management

```
GET /api/v1/admin/resume
POST /api/v1/admin/resume
PUT /api/v1/admin/resume
DELETE /api/v1/admin/resume
```

**Upload/Replace:** `multipart/form-data` with a PDF file field named `resume`.

### Blog Management

#### Posts

```
GET /api/v1/admin/blog/posts
GET /api/v1/admin/blog/posts/:id
POST /api/v1/admin/blog/posts
PUT /api/v1/admin/blog/posts/:id
DELETE /api/v1/admin/blog/posts/:id
POST /api/v1/admin/blog/posts/:id/publish
POST /api/v1/admin/blog/posts/:id/unpublish
```

#### Categories

```
GET /api/v1/admin/blog/categories
POST /api/v1/admin/blog/categories
PUT /api/v1/admin/blog/categories/:id
DELETE /api/v1/admin/blog/categories/:id
```

#### Tags

```
GET /api/v1/admin/blog/tags
POST /api/v1/admin/blog/tags
PUT /api/v1/admin/blog/tags/:id
DELETE /api/v1/admin/blog/tags/:id
```

### Analytics Dashboard

```
GET /api/v1/admin/analytics/dashboard?days=30
GET /api/v1/admin/analytics/overview?days=30
GET /api/v1/admin/analytics/timeseries?days=30
GET /api/v1/admin/analytics/pages?days=30
GET /api/v1/admin/analytics/countries?days=30
GET /api/v1/admin/analytics/devices?days=30
GET /api/v1/admin/analytics/browsers?days=30
GET /api/v1/admin/analytics/projects?days=30
GET /api/v1/admin/analytics/referrers?days=30
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| days | integer | 30 | Number of days to analyze |

---

## SEO Endpoints

### Sitemap

```
GET /sitemap.xml
```

Returns XML sitemap with all public pages, projects, and published blog posts.

### Robots.txt

```
GET /robots.txt
```

Returns robots.txt with sitemap reference and disallowed paths.

### RSS Feed

```
GET /rss.xml
```

Returns RSS 2.0 feed of published blog posts.

---

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK |
| 201 | Created |
| 202 | Accepted (analytics) |
| 204 | No Content |
| 400 | Bad Request / Validation Error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 422 | Unprocessable Entity |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

## Error Codes

| Code | Description |
|------|-------------|
| VALIDATION_ERROR | Request validation failed |
| UNAUTHENTICATED | Missing or invalid token |
| FORBIDDEN | Insufficient permissions |
| NOT_FOUND | Resource not found |
| CONFLICT | Unique constraint violation |
| TOO_MANY_REQUESTS | Rate limit exceeded |
| FILE_TOO_LARGE | Upload exceeds size limit |
| INVALID_FILE_TYPE | Upload has invalid MIME type |
| INTERNAL_ERROR | Unexpected server error |

## Rate Limiting

| Endpoint | Limit | Window |
|----------|-------|--------|
| Global | 100 requests | 15 minutes |
| Contact | 5 requests | 15 minutes |
| Analytics | 60 requests | 60 seconds |

## CORS

Configure allowed origins via `FRONTEND_URL` environment variable (comma-separated).

## Cache Headers

| Endpoint | Cache-Control |
|----------|---------------|
| Profile, Projects, Experience, Skills, Education, Social | public, max-age=600 |
| Blog posts, Categories, Tags | public, max-age=300 |
| Resume download | public, max-age=3600 |
| Sitemap, Robots | public, max-age=3600 |
| RSS | public, max-age=300 |
| Admin/Authenticated | No cache |
