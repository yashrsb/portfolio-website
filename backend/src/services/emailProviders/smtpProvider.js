import nodemailer from 'nodemailer';
import logger from '../../utils/logger.js';

/**
 * Creates an SMTP email provider backed by Nodemailer.
 *
 * The provider is a thin wrapper around a Nodemailer transporter. It exposes
 * a single `send(options)` method so the email facade never depends on a
 * specific transport library directly.
 *
 * @param {object} config - SMTP transport configuration.
 * @param {string} config.host - SMTP server hostname.
 * @param {number} [config.port] - SMTP server port.
 * @param {boolean} [config.secure] - Use TLS (true) or STARTTLS (false).
 * @param {string} [config.user] - SMTP authentication username.
 * @param {string} [config.pass] - SMTP authentication password.
 * @returns {{ send: (options: object) => Promise<object> }} Email provider instance.
 */
export const createSmtpProvider = (config) => {
  let transporter = null;

  if (config?.host) {
    transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.user,
        pass: config.pass,
      },
    });

    logger.info('SMTP email provider initialised', {
      host: config.host,
      port: config.port,
      secure: config.secure,
    });
  }

  /**
   * Sends an email using the configured SMTP transporter.
   * @param {object} options - Mail options.
   * @param {string} options.from - Sender address.
   * @param {string} options.to - Recipient address.
   * @param {string} options.subject - Email subject.
   * @param {string} [options.text] - Plain-text body.
   * @param {string} [options.html] - HTML body.
   * @param {string} [options.replyTo] - Reply-to address.
   * @returns {Promise<object>} Nodemailer info object.
   */
  const send = async (options) => {
    if (!transporter) {
      throw new Error('SMTP provider is not configured');
    }

    const info = await transporter.sendMail({
      from: options.from,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html,
      replyTo: options.replyTo,
    });

    logger.info('Email sent successfully', {
      messageId: info.messageId,
      to: options.to,
    });

    return info;
  };

  return { send };
};

export default { createSmtpProvider };
