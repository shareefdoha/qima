import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

const submitLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many messages sent. Please try again later.' },
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** POST /api/contact  (public) */
router.post(
  '/',
  submitLimiter,
  asyncHandler(async (req, res) => {
    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim();
    const subject = String(req.body?.subject || '').trim() || null;
    const message = String(req.body?.message || '').trim();
    const honeypot = String(req.body?.website || '').trim(); // hidden field — bots fill it

    if (honeypot) return res.status(201).json({ success: true }); // silently drop

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email and message are required.' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ error: 'Please enter a valid email address.' });
    }
    if (message.length > 5000) {
      return res.status(400).json({ error: 'Message is too long (5000 characters max).' });
    }

    await pool.execute(
      'INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)',
      [name.slice(0, 255), email.slice(0, 255), subject?.slice(0, 255) ?? null, message]
    );

    res.status(201).json({ success: true, message: 'Thank you — your message has been received.' });
  })
);

/** GET /api/contact  (admin) — inbox */
router.get(
  '/',
  requireAuth,
  asyncHandler(async (_req, res) => {
    const [rows] = await pool.query(
      'SELECT id, name, email, subject, message, is_read, created_at FROM contact_messages ORDER BY created_at DESC'
    );
    res.json(rows.map((r) => ({ ...r, is_read: Boolean(r.is_read) })));
  })
);

/** PATCH /api/contact/:id/read  (admin) */
router.patch(
  '/:id/read',
  requireAuth,
  asyncHandler(async (req, res) => {
    await pool.execute('UPDATE contact_messages SET is_read = TRUE WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  })
);

/** DELETE /api/contact/:id  (admin) */
router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const [result] = await pool.execute('DELETE FROM contact_messages WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Message not found.' });
    res.json({ success: true });
  })
);

export default router;
