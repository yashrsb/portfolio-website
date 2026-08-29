# Security

This document describes the security controls implemented in the Portfolio project.

## Authentication

### JWT Access Tokens

- **Lifetime**: 15 minutes (configurable via `JWT_ACCESS_SECRET_TTL`)
- **Storage**: In-memory (admin frontend) + sessionStorage fallback
- **Issuer**: `portfolio-api`
- **Audience**: `portfolio-admin`
- **Algorithm**: HS256

### Refresh Tokens

- **Lifetime**: 7 days (configurable via `JWT_REFRESH_SECRET_TTL_DAYS`)
- **Storage**: HttpOnly cookie
- **Cookie Name**: `portfolio_refresh` (configurable)
- **Secure Flag**: Enabled in production (`COOKIE_SECURE=true`)
- **SameSite**: `lax` (configurable)

### Token Rotation

Refresh tokens are rotated on each use:

1. Client sends refresh token cookie
2. Server verifies token hash exists and is not revoked
3. Server revokes old token
4. Server issues new access token and refresh token
5. Old token's `replacedBy` field tracks the chain

### Reuse Detection

If a revoked refresh token is presented:

1. System detects token was already used
2. All refresh tokens for the user are revoked
3. User must re-authenticate

This prevents token theft and replay attacks.

### Password Security

- **Hashing**: bcrypt with configurable rounds (default: 12)
- **Storage**: Only password hash stored in database
- **Comparison**: Constant-time comparison via bcrypt

## Authorization

### Role-Based Access Control

| Role | Access |
|------|--------|
| ADMIN | Full access to all admin endpoints |
| EDITOR | Limited access (future use) |

### Middleware Chain

```
authenticate → authorize('ADMIN') → controller
```

1. `authenticate`: Validates JWT and attaches user to request
2. `authorize('ADMIN')`: Checks user role has required permission

## Input Validation

### Request Validation

All input is validated using express-validator:

| Endpoint | Validation Rules |
|----------|-----------------|
| Login | Email format, password required |
| Contact | Name (2-100), email, subject (5-150), message (10-2000) |
| Project | Title, slug, description required |
| Blog Post | Title, slug, content required |

### Sanitization

- HTML entities are escaped in user input
- Markdown content is sanitized before rendering
- Filenames are sanitized before storage

## Rate Limiting

### Global Rate Limiter

- **Limit**: 100 requests per 15 minutes per IP
- **Response**: 429 Too Many Requests

### Contact Form

- **Limit**: 5 requests per 15 minutes per IP
- **Purpose**: Prevent spam and abuse

### Analytics

- **Limit**: 60 requests per 60 seconds per IP
- **Purpose**: Prevent event flooding

## CORS

Configure allowed origins via `FRONTEND_URL`:

```env
FRONTEND_URL=https://example.com,https://admin.example.com
```

- Only specified origins are allowed
- Credentials are allowed for authenticated requests

## Security Headers

Helmet middleware sets security headers:

| Header | Description |
|--------|-------------|
| Content-Security-Policy | Prevents XSS |
| X-Content-Type-Options | Prevents MIME sniffing |
| X-Frame-Options | Prevents clickjacking |
| Strict-Transport-Security | Enforces HTTPS |
| X-XSS-Protection | Legacy XSS protection |
| Referrer-Policy | Controls referrer information |

## Spam Protection

### Contact Form

1. **Honeypot Fields**: Hidden fields that bots fill out
2. **Bot Detection**: User-Agent analysis for known bots
3. **Rate Limiting**: Per-IP rate limiting
4. **Input Validation**: Strict validation rules

### Bot Detection

Known crawler patterns are detected and dropped:
- Googlebot, Bingbot, Facebook crawler
- Headless browsers (HeadlessChrome)
- Command-line tools (curl, wget, python-requests)

## File Upload Security

### Resume Uploads

| Control | Implementation |
|---------|---------------|
| File Type | Only `application/pdf` allowed |
| Size Limit | Configurable (default: 5 MB) |
| Filename | Sanitized before storage |
| Storage | Outside web root |

### Storage Configuration

```env
STORAGE_ALLOWED_MIME_TYPES=application/pdf
STORAGE_MAX_SIZE_BYTES=5242880
STORAGE_LOCAL_UPLOAD_DIR=uploads
```

## Error Handling

### Standardized Errors

All errors return a consistent format:

```json
{
  "success": false,
  "message": "Error description",
  "code": "ERROR_CODE",
  "errors": [],
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z",
    "requestId": "..."
  }
}
```

### Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| VALIDATION_ERROR | 400 | Request validation failed |
| UNAUTHENTICATED | 401 | Missing or invalid token |
| FORBIDDEN | 403 | Insufficient permissions |
| NOT_FOUND | 404 | Resource not found |
| CONFLICT | 409 | Unique constraint violation |
| TOO_MANY_REQUESTS | 429 | Rate limit exceeded |
| FILE_TOO_LARGE | 400 | Upload exceeds size limit |
| INVALID_FILE_TYPE | 400 | Upload has invalid MIME type |
| INTERNAL_ERROR | 500 | Unexpected server error |

### Information Disclosure

- Stack traces are never exposed to clients in production
- Internal error details are logged server-only
- Generic messages are shown for unexpected errors

## Docker Security

### Backend Container

- Runs as non-root node user
- Minimal base image (node:22-alpine)
- No unnecessary ports exposed

### Database Container

- Dedicated network isolation
- Persistent volume for data
- Health checks enabled

## Secrets Management

### Environment Variables

All secrets are configured via environment variables:

```env
JWT_ACCESS_SECRET=your-secure-secret
JWT_REFRESH_SECRET=your-secure-secret
ADMIN_PASSWORD=your-secure-password
DATABASE_URL=postgresql://...
```

### Git Ignore

Sensitive files are gitignored:
- `.env`
- `uploads/`
- `node_modules/`
- `dist/`

## Production Security Checklist

- [ ] Use strong, unique JWT secrets (32+ bytes random)
- [ ] Set `COOKIE_SECURE=true` for HTTPS
- [ ] Use strong admin password
- [ ] Configure CORS to allow only your origins
- [ ] Enable rate limiting
- [ ] Use HTTPS for all services
- [ ] Keep dependencies updated
- [ ] Monitor logs for suspicious activity
- [ ] Regular database backups
- [ ] Restrict database access to backend only

## Security Testing

The test suite includes security regression tests:

| Test | Description |
|------|-------------|
| JWT Tampering | Rejects modified tokens |
| Wrong Issuer | Rejects tokens with wrong issuer |
| Wrong Audience | Rejects tokens with wrong audience |
| Password Hashing | Verifies bcrypt hashing |
| Authorization | Tests role-based access |
| Input Sanitization | Tests HTML sanitization |

## Known Limitations

- No OAuth/Social login support
- No two-factor authentication
- No IP-based blocking for failed login attempts
- No audit logging for admin actions
- No Content Security Policy customization

## Reporting Security Issues

If you discover a security vulnerability, please report it responsibly by opening a private issue or contacting the maintainers directly.
