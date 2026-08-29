# Testing

This document describes the testing strategy and infrastructure for the Portfolio project.

## Testing Stack

| Application | Framework | Environment | Utilities |
|-------------|-----------|-------------|-----------|
| Backend | Vitest v4 | Node.js | supertest |
| Frontend | Vitest v4 | happy-dom | @testing-library/react |
| Admin | Vitest v4 | happy-dom | @testing-library/react |

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

## Test Results

| Application | Test Files | Tests |
|-------------|------------|-------|
| Backend | 20 | 205 |
| Frontend | 7 | 100 |
| Admin | 8 | 107 |
| **Total** | **35** | **412** |

## Coverage Thresholds

| Application | Branches | Functions | Lines | Statements |
|-------------|----------|-----------|-------|------------|
| Backend | 50% | 60% | 60% | 60% |
| Frontend | 40% | 50% | 50% | 50% |
| Admin | 40% | 50% | 50% | 50% |

## Test Structure

### Backend Tests

```
backend/tests/
├── setup.js                    # Global test configuration
├── authService.test.js         # Authentication service tests
├── authenticate.test.js        # Auth middleware tests
├── errorHandler.test.js        # Error handling tests
├── security.test.js            # Security regression tests
├── visitorHash.test.js         # Visitor hash utility tests
├── userAgentParser.test.js     # User agent parsing tests
├── spamProtection.test.js      # Spam protection middleware tests
├── projectService.test.js      # Project service tests
├── emailService.test.js        # Email service tests
├── contactValidator.test.js    # Contact validation tests
├── contactService.test.js      # Contact service tests
├── contactRateLimit.test.js    # Contact rate limiting tests
├── cacheHeaders.test.js        # Cache headers middleware tests
├── analyticsRepository.test.js # Analytics repository tests
├── analyticsRateLimit.test.js # Analytics rate limiting tests
├── botDetection.test.js        # Bot detection tests
├── blogValidator.test.js       # Blog validation tests
├── blogService.test.js         # Blog service tests
├── analyticsValidator.test.js  # Analytics validation tests
└── analyticsService.test.js    # Analytics service tests
```

### Frontend Tests

```
frontend/src/
├── services/
│   ├── apiClient.test.js       # API client tests
│   └── analyticsService.test.js # Analytics service tests
├── pages/
│   ├── Blog/
│   │   └── Blog.test.jsx       # Blog page tests
│   ├── BlogPost/
│   │   └── BlogPost.test.jsx   # Blog post page tests
│   ├── Contact/
│   │   └── Contact.test.jsx    # Contact page tests
│   └── ProjectDetailPage/
│       └── ProjectDetailPage.test.jsx # Project detail tests
└── utils/
    └── seo.test.js             # SEO utility tests
```

### Admin Tests

```
admin/src/
├── services/
│   ├── api/
│   │   └── apiClient.test.js   # API client tests
│   └── analyticsService.test.js # Analytics service tests
├── components/
│   ├── common/
│   │   ├── DataTable/
│   │   │   └── DataTable.test.jsx
│   │   └── LineChart/
│   │       └── LineChart.test.jsx
├── pages/
│   ├── ContactMessagesPage/
│   │   └── ContactMessagesPage.test.jsx
│   ├── BlogPostsPage/
│   │   └── BlogPostsPage.test.jsx
│   └── AnalyticsPage/
│       └── AnalyticsPage.test.jsx
└── utils/
    └── validation.test.js      # Validation utility tests
```

## Test Categories

### Unit Tests

Test individual functions and classes in isolation:

- **Services**: Business logic with mocked repositories
- **Utilities**: Pure functions (hashing, parsing, validation)
- **Middleware**: Request processing with mock req/res objects

### Integration Tests

Test multiple layers working together:

- **API Client**: HTTP request/response handling
- **Middleware Stack**: Authentication, validation, error handling

### Component Tests

Test React components:

- **Rendering**: Component renders correctly with props
- **User Interaction**: Clicking, typing, form submission
- **State Management**: Loading, error, success states

### Security Regression Tests

Test security controls:

- **JWT Validation**: Token verification, tampering detection
- **Authorization**: Role-based access control
- **Input Sanitization**: HTML sanitization
- **Password Hashing**: bcrypt verification

## Test Isolation

### Mocked Dependencies

Backend service tests use mocked repositories:

```javascript
vi.mock('../src/repositories/authRepository.js', () => ({
  findUserByEmail: vi.fn(),
  findUserById: vi.fn(),
  // ...
}));
```

### Test Environment

Tests run in isolated environment:

```javascript
// tests/setup.js
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
process.env.JWT_ACCESS_SECRET = 'test-access-secret';
```

### Production Database Protection

Tests never access the production database:

- All repository calls are mocked in service tests
- Test environment uses separate database credentials
- No destructive operations in test suite

## Test Database Strategy

### For Integration Tests

If integration tests requiring a real database are needed:

1. **Local PostgreSQL**: Set `TEST_DATABASE_URL` to a local test database
2. **Docker PostgreSQL**: Use a dedicated test container
3. **Separate Schema**: Use a dedicated test schema

```bash
# Example: Run integration tests with local test database
TEST_DATABASE_URL=postgresql://user:pass@localhost:5432/portfolio_test npm run test:integration
```

## Writing New Tests

### Test File Naming

- Backend: `tests/*.test.js`
- Frontend: `src/**/*.test.{js,jsx}`
- Admin: `src/**/*.test.{js,jsx}`

### Test Structure

```javascript
describe('feature', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle valid input', async () => {
    // Arrange
    const input = { /* ... */ };

    // Act
    const result = await feature(input);

    // Assert
    expect(result).toEqual(/* expected */);
  });

  it('should throw on invalid input', async () => {
    // Arrange
    const input = { /* invalid */ };

    // Act & Assert
    await expect(feature(input)).rejects.toThrow();
  });
});
```

### Mocking Guidelines

1. **Mock external dependencies**: APIs, databases, file system
2. **Don't mock the code under test**: Test actual implementation
3. **Use `vi.fn()` for simple mocks**: Return values, resolve/reject
4. **Use `vi.mock()` for module mocks**: Replace entire modules

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

## CI/CD Integration

Tests run automatically in GitHub Actions:

1. **lint**: ESLint with zero warnings
2. **test-backend**: Backend tests + coverage
3. **test-frontend**: Frontend tests + coverage
4. **test-admin**: Admin tests + coverage

See `.github/workflows/ci.yml` for details.

## Best Practices

1. **Test behavior, not implementation**: Focus on what the code does, not how
2. **Keep tests independent**: Each test should set up its own state
3. **Use descriptive test names**: Explain what the test verifies
4. **Test edge cases**: Empty input, null values, boundary conditions
5. **Mock sparingly**: Only mock what's necessary for isolation
6. **Run tests before committing**: Ensure all tests pass
