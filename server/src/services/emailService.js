const nodemailer = require('nodemailer');
const env = require('../config/env');

const createTransporter = () => {
  if (env.NODE_ENV === 'test') {
    return {
      sendMail: async (options) => {
        console.log(`[TEST EMAIL SENT] To: ${options.to}, Subject: ${options.subject}`);
        return { messageId: 'test-message-id' };
      }
    };
  }

  return nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS
    }
  });
};

const sendVerificationEmail = async (email, token) => {
  const transporter = createTransporter();
  const verifyUrl = `${env.CLIENT_URL}/verify-email/${token}`;

  const mailOptions = {
    from: env.SMTP_FROM,
    to: email,
    subject: 'Verify your VendorHub AI account',
    html: `
      <h2>Welcome to VendorHub AI</h2>
      <p>Please click the link below to verify your email address. This link is valid for 24 hours.</p>
      <a href="${verifyUrl}" target="_blank" style="padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">Verify Email</a>
      <p>If you did not create an account, please ignore this email.</p>
    `
  };

  return transporter.sendMail(mailOptions);
};

const sendPasswordResetEmail = async (email, token) => {
  const transporter = createTransporter();
  const resetUrl = `${env.CLIENT_URL}/reset-password/${token}`;

  const mailOptions = {
    from: env.SMTP_FROM,
    to: email,
    subject: 'Reset your VendorHub AI password',
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset. Click the link below to set a new password. This link is valid for 1 hour.</p>
      <a href="${resetUrl}" target="_blank" style="padding: 10px 20px; background-color: #dc2626; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
    `
  };

  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail
};
