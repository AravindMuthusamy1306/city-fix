import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

let transporter = null;

export const getTransporter = async () => {
  if (transporter) return transporter;

  // Real SMTP is mandatory – no fallback to Ethereal
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.error('❌ SMTP credentials missing. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env');
    throw new Error('SMTP credentials not configured');
  }

  console.log('✅ Configuring real SMTP (Brevo)');
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Verify connection (optional but recommended)
  await transporter.verify();
  console.log('✅ SMTP connection verified');
  return transporter;
};

export const sendVerificationEmail = async (email, token) => {
  const transporter = await getTransporter();
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
  const mailOptions = {
    from: '"CityFix" <cityfix26@gmail.com>',
    to: email,
    subject: 'Verify your email address',
    html: `
      <!DOCTYPE html>
      <html>
      <body>
        <h2>Welcome to CityFix!</h2>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>Or copy this link: ${verificationUrl}</p>
        <p>This link expires in 24 hours.</p>
        <hr />
        <p>CityFix – Report issues, improve your city.</p>
      </body>
      </html>
    `,
  };
  const info = await transporter.sendMail(mailOptions);
  console.log('Verification email sent to', email);
  return info;
};

export const sendPasswordResetEmail = async (email, token) => {
  const transporter = await getTransporter();
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
  const mailOptions = {
    from: '"CityFix" <cityfix26@gmail.com>',
    to: email,
    subject: 'Reset your password',
    html: `
      <!DOCTYPE html>
      <html>
      <body>
        <h2>Reset Your Password</h2>
        <p>Click the link below to reset your password (valid for 1 hour):</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>Or copy this link: ${resetUrl}</p>
        <hr />
        <p>CityFix – Report issues, improve your city.</p>
      </body>
      </html>
    `,
  };
  const info = await transporter.sendMail(mailOptions);
  console.log('Password reset email sent to', email);
  return info;
};