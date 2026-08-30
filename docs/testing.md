# Testing Documentation

## Overview

This document describes the testing strategy and infrastructure for the portfolio application.

## Testing Stack

| Application | Framework | Environment | Utilities              |
| ----------- | --------- | ----------- | ---------------------- |
| Backend     | Vitest v4 | Node.js     | supertest              |
| Frontend    | Vitest v4 | happy-dom   | @testing-library/react |
| Admin       | Vitest v4 | happy-dom   | @testing-library/react |

## Test Commands

### Run All Tests

```bash
npm test
```

### Run Individual Suites

```bash
npm run test:backend
npm run test:frontend
npm run test:admin
```

### Run with Coverage

```bash
npm run test:coverage
```

### Run Individual Coverage

```bash
npm run test:coverage --prefix backend
npm run test:coverage --prefix frontend
npm run test:coverage --prefix admin
```

### Watch Mode

```bash
npm run test:watch
```

## Test Structure

```
backend/
├── tests/
│   ├── setup.js                    # Global test setup
│   ├── authService.test.js         # Authentication service tests
│   ├── authenticate.test.js        # Auth middleware tests
│   ├── errorHandler.test.js        # Error handling tests
│   ├── localStorageProvider.test.js # Local storage provider tests
│   ├── supabaseStorageProvider.test.js # Supabase storage provider tests
│   └── ...                         # Other test files

frontend/
├── src/
│   ├── tests/
│   │   └── setup.js                # Test setup
│   ├── services/
│   │   └── apiClient.test.js       # API client tests
│   └── pages/
│       └── ...                     # Page component tests

admin/
├── src/
│   ├── tests/
│   │   └── setup.js                # Test setup
│   ├── services/
│   │   └── api/
│   │       └── apiClient.test.js   # API client tests
│   └── utils/
│       └── validation.test.js      # Validation utility tests
```

## Coverage Thresholds

| Application | Branches | Functions | Lines | Statements |
| ----------- | -------- | --------- | ----- | ---------- |
| Backend     | 50%      | 60%       | 60%   | 60%        |
| Frontend    | 40%      | 50%       | 50%   | 50%        |
| Admin       | 40%      | 50%       | 50%   | 50%        |

## Test Database Strategy

### Production Database Safety

**IMPORTANT**: Tests must NEVER mutate the production Neon database.

The test suite uses the following strategies to ensure isolation:

1. **Mocked Dependencies**: Backend service tests mock repository layers using `vi.mock()`
2. **In-Memory Testing**: Middleware tests use in-memory Express apps with supertest
3. **Environment Isolation**: `tests/setup.js` sets test-specific environment variables

### Test Environment Variables

```bash
# Backend test environment (set in tests/setup.js)
NODE_ENV=test
DATABASE_URL=postgresql://test:test@localhost:5432/test
JWT_ACCESS_SECRET=test-access-secret
JWT_REFRESH_SECRET=test-refresh-secret
```

### Integration Tests with Database

For integration tests requiring a real database:

1. **Local PostgreSQL**: Set `TEST_DATABASE_URL` to a local test database
2. **Docker PostgreSQL**: Use a dedicated test container
3. **Separate Schema**: Use a dedicated test schema in an existing database

```bash
# Example: Run integration tests with local test database
TEST_DATABASE_URL=postgresql://user:pass@localhost:5432/portfolio_test npm run test:integration
```

## Test Fixtures

Test fixtures are located in `tests/fixtures/` and are clearly separated from production data:

- `tests/fixtures/users.js` - Test user data
- `tests/fixtures/projects.js` - Test project data
- `tests/fixtures/blog-posts.js` - Test blog post data

**IMPORTANT**: Test fixtures must NOT overwrite or modify production portfolio data.

## Security Testing

The test suite includes security regression tests covering:

- JWT token validation and tampering detection
- Password hashing and verification
- Role-based access control
- Input sanitization
- Rate limiting

## CI/CD Integration

Tests run automatically on:

- Push to `main` or `develop` branches
- Pull requests to `main`

The CI pipeline:

1. Lint check
2. Backend tests + coverage
3. Frontend tests + coverage
4. Admin tests + coverage
5. Build verification
6. Format check

## Debugging Failed Tests

### Run a Single Test File

```bash
npm run test:backend -- tests/authService.test.js
```

### Run a Single Test

```bash
npm run test:backend -- -t "should return user on valid credentials"
```

### Verbose Output

```bash
npm run test:backend -- --reporter=verbose
```

### Debug Mode

```bash
node --inspect-brk node_modules/.bin/vitest run tests/failing-test.js
```

## Portfolio Data Protection

The test suite includes safeguards to protect portfolio content:

1. **Read-Only Verification**: Tests verify data existence without modification
2. **Isolated Fixtures**: Test data is separate from production data
3. **Mocked Repositories**: Service tests use mocked data access layers
4. **Environment Separation**: Test environment uses different database credentials

## Storage Provider Testing

### LocalStorageProvider Tests

`tests/localStorageProvider.test.js` tests the local filesystem storage provider using temporary directories. Tests cover:
- File upload and retrieval
- File deletion (including no-op for missing files)
- File existence checks
- Path traversal prevention
- File validation (size, MIME type, empty files)

### SupabaseStorageProvider Tests

`tests/supabaseStorageProvider.test.js` tests the Supabase Storage provider using a **mocked Supabase client**. Tests never connect to a real Supabase project. Coverage includes:

1. **Successful upload** — file is uploaded to the correct bucket with correct content type
2. **Upload failure** — Supabase errors are converted to ApiError
3. **Successful delete** — file is removed from the bucket
4. **Delete failure** — errors are handled gracefully (no-op for missing files)
5. **Public URL generation** — bucket base URL and file-specific URLs
6. **Correct bucket selection** — provider uses configured bucket name
7. **Correct storage path/key** — unique filenames are generated
8. **Content type handling** — MIME type is preserved during upload
9. **File validation** — empty files, oversized files, and invalid MIME types are rejected

### Mocking Strategy

The Supabase client is fully mocked using `vi.fn()`:

```javascript
const mockClient = {
  storage: {
    from: vi.fn().mockReturnValue({
      upload: vi.fn().mockResolvedValue({ data: {}, error: null }),
      remove: vi.fn().mockResolvedValue({ data: {}, error: null }),
      list: vi.fn().mockResolvedValue({ data: [], error: null }),
      download: vi.fn().mockResolvedValue({ data: new Blob(), error: null }),
      getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: '...' } }),
    }),
  },
};
```
