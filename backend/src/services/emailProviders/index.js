import { createSmtpProvider } from './smtpProvider.js';

/**
 * Factory that selects and initialises the appropriate email provider
 * based on the EMAIL_PROVIDER environment variable.
 *
 * Current providers:
 * - 'smtp' (default) — Nodemailer SMTP transport
 *
 * Each provider must implement a `send(options)` method with a compatible
 * signature so the email service can swap providers without changes.
 *
 * @param {object} emailConfig - The `env.email` configuration object.
 * @returns {{ send: (options: object) => Promise<object> }} Email provider instance.
 */
export const createEmailProvider = (emailConfig) => {
  const provider = emailConfig?.provider || 'smtp';

  switch (provider) {
    case 'smtp':
      return createSmtpProvider(emailConfig.smtp);
    default:
      return createSmtpProvider(emailConfig.smtp);
  }
};

export default { createEmailProvider };
