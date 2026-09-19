import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

/**
 * GET /api/settings  (public)
 * Returns a flat key/value map — the shape the front end consumes:
 *   { membership_google_form_url: "https://…", contact_email: "…", … }
 */
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const [rows] = await pool.query('SELECT setting_key, setting_value FROM settings ORDER BY setting_key');
    res.json(Object.fromEntries(rows.map((r) => [r.setting_key, r.setting_value])));
  })
);

/** GET /api/settings/:key  (public) */
router.get(
  '/:key',
  asyncHandler(async (req, res) => {
    const [rows] = await pool.execute(
      'SELECT setting_key, setting_value FROM settings WHERE setting_key = ? LIMIT 1',
      [req.params.key]
    );
    if (!rows.length) return res.status(404).json({ error: 'Setting not found.' });
    res.json(rows[0]);
  })
);

/** PUT /api/settings/:key  (admin) — body { value } */
router.put(
  '/:key',
  requireAuth,
  asyncHandler(async (req, res) => {
    const key = String(req.params.key || '').trim();
    const value = req.body?.value ?? req.body?.setting_value ?? '';

    if (!/^[a-z0-9_]{2,100}$/.test(key)) {
      return res.status(400).json({ error: 'setting_key must be lowercase letters, numbers or underscores.' });
    }

    await pool.execute(
      `INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
      [key, String(value)]
    );
    res.json({ setting_key: key, setting_value: String(value) });
  })
);

/** PUT /api/settings  (admin) — bulk save, body { settings: { key: value, … } } */
router.put(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const map = req.body?.settings;
    if (!map || typeof map !== 'object') {
      return res.status(400).json({ error: 'Expected body { settings: { key: value } }.' });
    }

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      for (const [key, value] of Object.entries(map)) {
        if (!/^[a-z0-9_]{2,100}$/.test(key)) continue;
        await conn.execute(
          `INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)
           ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
          [key, String(value ?? '')]
        );
      }
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }

    const [rows] = await pool.query('SELECT setting_key, setting_value FROM settings ORDER BY setting_key');
    res.json(Object.fromEntries(rows.map((r) => [r.setting_key, r.setting_value])));
  })
);

export default router;
