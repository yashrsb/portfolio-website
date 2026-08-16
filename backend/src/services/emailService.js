import { env } from '../config/env.js';
import { createEmailProvider } from './emailProviders/index.js';

/**
 * Email service facade.
 *
 * Provides a stable interface for sending email notifications without
 * depending on a specific provider implementation. The underlying provider
 * is lazily initialised on first use and cached for subsequent calls.
 */
let cachedProvider = null;

/**
 * Returns the configured email provider, creating it on first call.
 * @returns {{ send: (options: object) => Promise<object> }} Email provider.
 */
const getProvider = () => {
  if (!cachedProvider) {
    cachedProvider = createEmailProvider(env.email);
  }
  return cachedProvider;
};

/**
 * Escapes user-controlled content for safe inclusion in HTML.
 * @param {string} text - Untrusted input.
 * @returns {string} HTML-escaped string.
 */
const escapeHtml = (text) =>
  String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

/**
 * Formats an ISO date string into a human-readable string.
 * @param {string} iso - ISO date string.
 * @returns {string} Human-readable date.
 */
const formatDate = (iso) =>
  new Date(iso).toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  });

/**
 * Builds the plain-text body for a contact notification email.
 * @param {object} message - Contact message record.
 * @returns {string} Plain-text email body.
 */
const buildTextBody = (message) =>
  [
    'New Portfolio Contact Message',
    '',
    'You received a new message through your portfolio website contact form.',
    '',
    `Name: ${message.name}`,
    `Email: ${message.email}`,
    `Subject: ${message.subject}`,
    '',
    'Message:',
    message.message,
    '',
    `Submission time: ${formatDate(message.createdAt)}`,
    `IP address: ${message.ipAddress || 'not recorded'}`,
    '',
    'Please reply directly to the sender\'s email address.',
    '',
    '— Portfolio Contact System',
  ].join('\n');

/**
 * Builds a minimal HTML body for a contact notification email.
 * All user-controlled content is HTML-escaped before interpolation.
 * @param {object} message - Contact message record.
 * @returns {string} HTML email body.
 */
const buildHtmlBody = (message) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>New Portfolio Contact Message</title>
</head>
<body style="font-family: system-ui, -apple-system, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
  <h1 style="color: #2563eb;">New Portfolio Contact Message</h1>
  <p>You received a new message through your portfolio website contact form.</p>
  <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
    <tr><td style="padding: 4px 0; font-weight: 600;">Name:</td><td style="padding: 4px 8px;">${escapeHtml(message.name)}</td></tr>
    <tr><td style="padding: 4px 0; font-weight: 600;">Email:</td><td style="padding: 4px 8px;">${escapeHtml(message.email)}</td></tr>
    <tr><td style="padding: 4px 0; font-weight: 600;">Subject:</td><td style="padding: 4px 8px;">${escapeHtml(message.subject)}</td></tr>
  </table>
  <h2 style="font-size: 16px; margin-top: 24px;">Message</h2>
  <p style="white-space: pre-wrap; background: #f9fafb; padding: 16px; border-radius: 8px; border: 1px solid #e5e7eb;">${escapeHtml(message.message)}</p>
  <p style="font-size: 14px; color: #6b7280; margin-top: 24px;">
    Submitted at: ${escapeHtml(formatDate(message.createdAt))}<br>
    IP address: ${escapeHtml(message.ipAddress || 'not recorded')}
  </p>
  <p style="font-size: 14px; color: #6b7280;">
    Please reply directly to the sender's email address.
  </p>
  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;">
  <p style="font-size: 12px; color: #9ca3af;">— Portfolio Contact System</p>
</body>
</html>`;

/**
 * Sends a notification email for a new contact message.
 *
 * @param {object} message - The persisted contact message record.
 * @param {string} message.name - Visitor's name.
 * @param {string} message.email - Visitor's email address.
 * @param {string} message.subject - Message subject.
 * @param {string} message.message - Message body.
 * @param {string} message.createdAt - ISO timestamp of submission.
 * @param {string} [message.ipAddress] - Visitor's IP address.
 * @returns {Promise<object>} Provider send result.
 */
export const sendContactNotification = async (message) => {
  const provider = getProvider();

  return provider.send({
    from: env.email.from,
    to: env.email.contactNotificationEmail,
    subject: `New message from ${message.name} via portfolio contact form`,
    text: buildTextBody(message),
    html: buildHtmlBody(message),
    replyTo: message.email,
  });
};

/**
 * Sends a raw email. Convenience method exposed for future use.
 * @param {object} options - Mail options (from, to, subject, text, html, replyTo).
 * @returns {Promise<object>} Provider send result.
 */
export const sendMail = async (options) => {
  const provider = getProvider();
  return provider.send(options);
};

export default { sendContactNotification, sendMail };
