import { Router } from 'express';
import bcrypt from 'bcryptjs';
import rateLimit from 'express-rate-limit';
import { pool } from '../db/pool.js';
import { signToken, requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again in a few minutes.' },
});

/** POST /api/auth/login  { email, password } -> { token, user } */
router.post(
  '/login',
  loginLimiter,
  asyncHandler(async (req, res) => {
    const email = String(req.body?.email || '').trim().toLowerCase();
    const password = String(req.body?.password || '');

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const [rows] = await pool.execute(
      'SELECT id, name, email, password_hash, role FROM admin_users WHERE email = ? LIMIT 1',
      [email]
    );
    const user = rows[0];

    // Constant-ish response: same message whether the user or password is wrong.
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    await pool.execute('UPDATE admin_users SET last_login_at = NOW() WHERE id = ?', [user.id]);

    res.json({
      token: signToken(user),
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  })
);

/** GET /api/auth/me — used by the dashboard to validate a stored token */
router.get('/me', requireAuth, (req, res) => {
  res.json({ user: { id: req.user.sub, name: req.user.name, email: req.user.email, role: req.user.role } });
});

/** POST /api/auth/change-password { currentPassword, newPassword } */
router.post(
  '/change-password',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { currentPassword = '', newPassword = '' } = req.body || {};
    if (String(newPassword).length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters.' });
    }

    const [rows] = await pool.execute('SELECT password_hash FROM admin_users WHERE id = ?', [req.user.sub]);
    if (!rows.length || !(await bcrypt.compare(currentPassword, rows[0].password_hash))) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    const hash = await bcrypt.hash(newPassword, 12);
    await pool.execute('UPDATE admin_users SET password_hash = ? WHERE id = ?', [hash, req.user.sub]);
    res.json({ success: true });
  })
);

export default router;
