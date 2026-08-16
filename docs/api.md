# API Reference

The API is versioned and mounted under `/api/v1`. The base URL is:

```
http://localhost:5001/api/v1
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

Errors:

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

## Public Endpoints

| Method | Path               | Description                           | Auth |
| ------ | ------------------ | ------------------------------------- | ---- |
| GET    | `/`                | List available endpoints              | No   |
| GET    | `/health`          | Service health status                 | No   |
| GET    | `/profile`         | Profile information                   | No   |
| GET    | `/projects`        | List projects (brief card data)     | No   |
| GET    | `/projects/:slug`  | Get a single project by slug        | No   |
| GET    | `/experience`      | Work experience                     | No   |
| GET    | `/skills`          | Skills grouped by category            | No   |
| GET    | `/education`       | Education, certificates, achievements | No   |
| GET    | `/social`          | Social links                          | No   |
| GET    | `/resume/download` | Download the latest resume            | No   |
| POST   | `/contact`         | Submit a contact message              | No   |

### Contact

`POST /contact` — validated body:

| Field   | Rules                         |
| ------- | ----------------------------- |
| name    | required, 2–100 characters    |
| email   | required, valid email address |
| subject | required, 5–150 characters    |
| message | required, 10–2000 characters  |

### Projects

`GET /projects` — returns a brief card-shaped array of all projects.

`GET /projects/:slug` — returns a single project by its slug. Returns `404 NOT_FOUND` when the slug does not match any project.

The extended project model includes the following fields beyond the original card data:

| Field             | Type          | Nullable | Description                                  |
| ----------------- | ------------- | -------- | -------------------------------------------- |
| title             | string        | no       | Project title                                |
| slug              | string        | no       | URL-friendly unique identifier               |
| description       | string        | no       | Detailed project description                 |
| summary           | string        | yes      | Short one-line summary                       |
| imageUrl          | string(url)   | yes      | Optional project image                       |
| githubUrl         | string(url)   | yes      | GitHub repository URL                        |
| demoUrl           | string(url)   | yes      | Live demo URL (optional)                     |
| status            | enum          | no       | `live`, `wip`, or `archived`                 |
| featured          | boolean       | no       | Whether the project is featured              |
| displayOrder      | integer       | no       | Sort order                                   |
| tags              | string[]      | no       | Technology tags                                |
| features          | string[]      | no       | Key features                                 |
| techStack         | json          | yes      | Grouped tech stack (e.g. `{Frontend: [...]}`)|
| challenges        | string[]      | no       | Engineering challenges                       |
| lessonsLearned    | string[]      | no       | Engineering takeaways                        |
| architecture      | string        | yes      | Architecture description                     |
| architectureImage | string(url)   | yes      | Optional architecture diagram URL            |
| screenshots       | json          | yes      | Array of `{src, alt, caption}` objects        |
| createdAt         | datetime      | no       | Creation timestamp                           |
| updatedAt         | datetime      | no       | Last update timestamp                        |

## Authentication

| Method | Path            | Description                           |
| ------ | --------------- | ------------------------------------- |
| POST   | `/auth/login`   | Log in with email + password          |
| POST   | `/auth/refresh` | Rotate refresh token (cookie)         |
| POST   | `/auth/logout`  | Revoke refresh token, clear cookie    |
| GET    | `/auth/me`      | Return the current authenticated user |

Login request:

```json
{
  "email": "admin@example.com",
  "password": "your-password"
}
```

Successful login returns an access token in the body and sets an HttpOnly
refresh cookie. Clients send the access token as `Authorization: Bearer <token>`.

## Admin Endpoints (authenticated)

All admin routes require a valid access token with `ADMIN` or `EDITOR` role.

| Method                    | Path                      | Description                      |
| ------------------------- | ------------------------- | -------------------------------- |
| GET                       | `/admin/stats`            | Dashboard statistics             |
| GET/POST                  | `/admin/profile`          | Read / update profile            |
| GET/POST/PUT/PATCH/DELETE | `/admin/projects`         | Project CRUD + reorder           |
| GET/POST/PUT/PATCH/DELETE | `/admin/skills`           | Skill CRUD + reorder             |
| GET/POST/PUT/PATCH/DELETE | `/admin/experience`       | Experience CRUD + reorder        |
| GET/POST/PUT/PATCH/DELETE | `/admin/education`        | Education CRUD + reorder         |
| GET/POST/PUT/PATCH/DELETE | `/admin/certificates`     | Certificate CRUD + reorder       |
| GET/POST/PUT/PATCH/DELETE | `/admin/achievements`     | Achievement CRUD + reorder       |
| GET/POST/PUT/PATCH/DELETE | `/admin/social-links`     | Social link CRUD + reorder       |
| GET/PUT/DELETE            | `/admin/contact-messages` | Contact message management       |
| POST/PUT/DELETE           | `/admin/resume`           | Resume upload / replace / delete |

### Reorder

Reorder endpoints accept an array of `{ id, displayOrder }` entries:

```json
{
  "items": [
    { "id": "uuid-1", "displayOrder": 0 },
    { "id": "uuid-2", "displayOrder": 1 }
  ]
}
```

### Resume Upload

`POST /admin/resume` — `multipart/form-data` with a PDF file field. Only
`application/pdf` is accepted by default (see `STORAGE_ALLOWED_MIME_TYPES`),
max size configurable via `STORAGE_MAX_SIZE_BYTES` (default 5 MB).

## HTTP Status Codes

| Code | Meaning                                      |
| ---- | -------------------------------------------- |
| 200  | OK                                           |
| 201  | Created                                      |
| 204  | No Content                                   |
| 400  | Bad Request / validation failure             |
| 401  | Unauthorized (missing/invalid token)         |
| 403  | Forbidden (insufficient role / CORS blocked) |
| 404  | Not Found                                    |
| 422  | Unprocessable Entity                         |
| 429  | Too Many Requests (rate limited)             |
| 500  | Internal Server Error                        |

## Rate Limiting

A global rate limiter applies to all requests (default 100 requests / 15
minutes per IP). Exceeding it returns `429` with the standard error envelope.

## Error Codes

Common error codes returned in the `code` field:

- `VALIDATION_ERROR`
- `UNAUTHORIZED`
- `FORBIDDEN`
- `NOT_FOUND`
- `TOO_MANY_REQUESTS`
- `INTERNAL_ERROR`

See `backend/src/constants/errorCodes.js` for the full list.
