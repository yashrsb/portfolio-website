/**
 * Wraps successful responses in a consistent envelope.
 */
class ApiResponse {
  /**
   * @param {number} statusCode - HTTP status code.
   * @param {string} message - Success message.
   * @param {*} data - Response payload.
   * @param {object} [meta] - Metadata (timestamp, requestId, etc).
   */
  constructor(statusCode, message, data, meta = {}) {
    this.success = true;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    this.meta = meta;
  }

  /**
   * Sends the response envelope.
   * @param {import('express').Response} res - Express response.
   */
  send(res) {
    return res.status(this.statusCode).json({
      success: this.success,
      message: this.message,
      data: this.data,
      meta: this.meta,
    });
  }
}

export default ApiResponse;
