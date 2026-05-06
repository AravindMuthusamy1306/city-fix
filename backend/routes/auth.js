import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { body, validationResult } from 'express-validator';
import crypto from 'crypto';
import { sendVerificationEmail, getTransporter } from '../utils/email.js';
import { verifyToken } from '../middleware/auth.js';

const router = Router();
const prisma = new PrismaClient();

// Register (with email verification)
router.post(
  '/register',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 6 }),
    body('name').notEmpty().trim(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, name } = req.body;
    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already in use' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const verificationToken = crypto.randomBytes(32).toString('hex');

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          role: 'citizen',
          verificationToken,
        },
        select: { id: true, email: true, name: true, role: true }
      });

      sendVerificationEmail(email, verificationToken).catch(console.error);

      res.status(201).json({
        message: 'Registration successful. Please check your email to verify your account.',
        user: { email: user.email, name: user.name }
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Verify email
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ error: 'Missing token' });

  try {
    const user = await prisma.user.findFirst({
      where: { verificationToken: token }
    });
    if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
      },
    });

    const jwtToken = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ message: 'Email verified successfully', token: jwtToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login – only if email verified
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    if (!user.emailVerified) {
      return res.status(401).json({ error: 'Please verify your email before logging in' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      token
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Resend verification email
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.emailVerified) return res.status(400).json({ error: 'Email already verified' });

    const newToken = crypto.randomBytes(32).toString('hex');
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken: newToken }
    });
    await sendVerificationEmail(email, newToken);
    res.json({ message: 'Verification email resent' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Forgot password (send reset email)
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.json({ message: 'If that email exists, we have sent a reset link.' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: { resetToken, resetTokenExpiry },
    });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const transporter = await getTransporter();

    const mailOptions = {
      from: '"CityFix" <noreply@cityfix.com>',
      to: email,
      subject: 'Reset your password',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Reset Your Password</h2>
          <p>You requested to reset your password. Click the link below to set a new password. This link expires in 1 hour.</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p>Or copy this link: ${resetUrl}</p>
          <hr />
          <p style="font-size: 12px; color: #6b7280;">CityFix – Report issues, improve your city.</p>
        </div>
      `,
    };
    await transporter.sendMail(mailOptions);
    res.json({ message: 'If that email exists, we have sent a reset link.' });
  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({ error: 'Failed to send reset email' });
  }
});

// Reset password (using token)
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(400).json({ error: 'Token and new password are required' });
  }
  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters' });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });
    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired reset token' });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });
    res.json({ message: 'Password reset successful. You can now log in.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user (protected)
router.get('/me', verifyToken, async (req, res) => {
  res.json(req.user);
});

export default router;