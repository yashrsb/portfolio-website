import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('errorHandler middleware', () => {
  let errorHandler;
  let mockReq, mockRes;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    mockReq = {
      id: 'test-request-id',
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    const mod = await import('../src/middlewares/errorHandler.js');
    errorHandler = mod.default;
  });

  it('returns structured error response for ApiError', async () => {
    const { default: ApiError } = await import('../src/utils/ApiError.js');
    const error = new ApiError(400, 'Bad request', 'VALIDATION_ERROR');

    errorHandler(error, mockReq, mockRes, vi.fn());

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: false,
      message: 'Bad request',
      code: 'VALIDATION_ERROR',
      errors: [],
      meta: expect.objectContaining({ requestId: 'test-request-id' }),
    });
  });

  it('returns 500 for non-operational errors', () => {
    const error = new Error('Something broke');

    errorHandler(error, mockReq, mockRes, vi.fn());

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'An unexpected error occurred.' }),
    );
  });

  it('maps Prisma unique constraint error to 409', () => {
    const error = { code: 'P2002', message: 'Unique constraint failed' };

    errorHandler(error, mockReq, mockRes, vi.fn());

    expect(mockRes.status).toHaveBeenCalledWith(409);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'A record with the same unique value already exists.',
      }),
    );
  });

  it('maps Prisma record not found error to 404', () => {
    const error = { code: 'P2025', message: 'Record not found' };

    errorHandler(error, mockReq, mockRes, vi.fn());

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'The requested record was not found.',
      }),
    );
  });

  it('maps Prisma connection errors to 503', () => {
    const error = { code: 'P1001', message: 'Database unavailable' };

    errorHandler(error, mockReq, mockRes, vi.fn());

    expect(mockRes.status).toHaveBeenCalledWith(503);
  });

  it('maps multer file size error to 400', () => {
    const error = { code: 'LIMIT_FILE_SIZE' };

    errorHandler(error, mockReq, mockRes, vi.fn());

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'The uploaded file exceeds the maximum allowed size of 5 MB.',
      }),
    );
  });

  it('maps multer unexpected file error to 400', () => {
    const error = { code: 'LIMIT_UNEXPECTED_FILE' };

    errorHandler(error, mockReq, mockRes, vi.fn());

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Exactly one file must be uploaded.',
      }),
    );
  });

  it('maps JSON parse error to 400', () => {
    const error = { type: 'entity.parse.failed' };

    errorHandler(error, mockReq, mockRes, vi.fn());

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Invalid request payload. Please check the request body.',
      }),
    );
  });

  it('maps unknown errors to 500', () => {
    const error = new Error('Something unexpected');

    errorHandler(error, mockReq, mockRes, vi.fn());

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'An unexpected error occurred.' }),
    );
  });

  it('handles ECONNREFUSED as 503', () => {
    const error = { code: 'ECONNREFUSED' };

    errorHandler(error, mockReq, mockRes, vi.fn());

    expect(mockRes.status).toHaveBeenCalledWith(503);
  });
});

describe('asyncHandler', () => {
  let asyncHandler;

  beforeEach(async () => {
    vi.clearAllMocks();
    vi.resetModules();

    const mod = await import('../src/utils/asyncHandler.js');
    asyncHandler = mod.default;
  });

  it('wraps async handler and forwards resolved value', async () => {
    const handler = vi.fn().mockResolvedValue('result');
    const wrapped = asyncHandler(handler);

    const mockReq = {};
    const mockRes = {};
    const mockNext = vi.fn();

    await wrapped(mockReq, mockRes, mockNext);

    expect(handler).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('catches errors and calls next with error', async () => {
    const error = new Error('Async error');
    const handler = vi.fn().mockRejectedValue(error);
    const wrapped = asyncHandler(handler);

    const mockReq = {};
    const mockRes = {};
    const mockNext = vi.fn();

    await wrapped(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(error);
  });
});

describe('ApiError', () => {
  it('creates error with default code', async () => {
    const { default: ApiError } = await import('../src/utils/ApiError.js');
    const error = new ApiError(400, 'Bad request');

    expect(error.statusCode).toBe(400);
    expect(error.message).toBe('Bad request');
    expect(error.code).toBe('INTERNAL_SERVER_ERROR');
    expect(error.errors).toEqual([]);
    expect(error.isOperational).toBe(true);
  });

  it('creates error with custom code and errors', async () => {
    const { default: ApiError } = await import('../src/utils/ApiError.js');
    const error = new ApiError(422, 'Validation failed', 'VALIDATION_ERROR', [
      { field: 'email', message: 'Invalid email' },
    ]);

    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.errors).toEqual([
      { field: 'email', message: 'Invalid email' },
    ]);
  });
});

describe('ApiResponse', () => {
  it('sends success response with data', async () => {
    const { default: ApiResponse } =
      await import('../src/utils/ApiResponse.js');
    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    const response = new ApiResponse(200, 'Success', { id: 1 });
    response.send(mockRes);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(mockRes.json).toHaveBeenCalledWith({
      success: true,
      message: 'Success',
      data: { id: 1 },
      meta: {},
    });
  });

  it('sends success response with meta', async () => {
    const { default: ApiResponse } =
      await import('../src/utils/ApiResponse.js');
    const mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };

    const response = new ApiResponse(200, 'Success', [], {
      page: 1,
      total: 10,
    });
    response.send(mockRes);

    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({ meta: { page: 1, total: 10 } }),
    );
  });
});
