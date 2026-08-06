import multer from 'multer';
import { env } from '../config/env.js';
import ApiError from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ERROR_CODES } from '../constants/errorCodes.js';

/**
 * Multer middleware configured for in-memory resume uploads.
 * The payload is validated again by the storage provider, but Multer
 * rejects oversized uploads and unsupported MIME types eagerly to avoid
 * buffering large payloads in memory.
 */
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.storage.maxSizeBytes,
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    if (!env.storage.allowedMimeTypes.includes(file.mimetype)) {
      cb(
        new ApiError(
          HTTP_STATUS.BAD_REQUEST,
          `Invalid file type. Allowed: ${env.storage.allowedMimeTypes.join(', ')}.`,
          ERROR_CODES.INVALID_FILE_TYPE,
        ),
      );
      return;
    }
    cb(null, true);
  },
});

export default upload;
