import {
  uploadResume,
  replaceResume,
  deleteResumeRecord,
  getResumeMetadata,
  getPublicResume,
} from '../services/resumeService.js';
import ApiResponse from '../utils/ApiResponse.js';
import asyncHandler from '../utils/asyncHandler.js';
import ApiError from '../utils/ApiError.js';
import { HTTP_STATUS } from '../constants/httpStatus.js';
import { ERROR_CODES } from '../constants/errorCodes.js';
import storage from '../storage/index.js';

/**
 * Builds response metadata (timestamp + request id).
 * @param {object} req - Express request.
 * @returns {object} Meta object.
 */
const buildMeta = (req) => ({
  timestamp: new Date().toISOString(),
  requestId: req.id,
});

/**
 * Returns resume metadata for the admin dashboard.
 */
export const getResumeHandler = asyncHandler(async (req, res) => {
  const data = await getResumeMetadata();
  new ApiResponse(
    HTTP_STATUS.OK,
    'Resume fetched successfully',
    data,
    buildMeta(req),
  ).send(res);
});

/**
 * Uploads a new resume (overwrites the previous one).
 */
export const uploadResumeHandler = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'No file was uploaded.',
      ERROR_CODES.EMPTY_FILE,
    );
  }
  const data = await uploadResume(req.file);
  new ApiResponse(
    HTTP_STATUS.CREATED,
    'Resume uploaded successfully',
    data,
    buildMeta(req),
  ).send(res);
});

/**
 * Replaces the existing resume with a new file.
 */
export const replaceResumeHandler = asyncHandler(async (req, res) => {
  if (!req.file) {
    throw new ApiError(
      HTTP_STATUS.BAD_REQUEST,
      'No file was uploaded.',
      ERROR_CODES.EMPTY_FILE,
    );
  }
  const data = await replaceResume(req.file);
  new ApiResponse(
    HTTP_STATUS.OK,
    'Resume replaced successfully',
    data,
    buildMeta(req),
  ).send(res);
});

/**
 * Deletes the resume and clears the profile resume URL.
 */
export const deleteResumeHandler = asyncHandler(async (req, res) => {
  await deleteResumeRecord();
  new ApiResponse(
    HTTP_STATUS.OK,
    'Resume deleted successfully',
    null,
    buildMeta(req),
  ).send(res);
});

/**
 * Public endpoint that streams the latest resume file for download.
 */
export const downloadResumeHandler = asyncHandler(async (req, res) => {
  const resume = await getPublicResume();

  const stream = storage.createReadStream(resume.storageKey);

  res.setHeader('Content-Type', resume.mimeType);
  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${resume.originalName}"`,
  );

  stream.on('error', () => {
    res.status(HTTP_STATUS.NOT_FOUND).json({
      status: 'error',
      statusCode: HTTP_STATUS.NOT_FOUND,
      message: 'Resume file not found.',
      code: ERROR_CODES.FILE_NOT_FOUND,
    });
  });

  stream.pipe(res);
});

export const resumeController = {
  get: getResumeHandler,
  upload: uploadResumeHandler,
  replace: replaceResumeHandler,
  remove: deleteResumeHandler,
  download: downloadResumeHandler,
};
