import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

/**
 * GET /api/about   (public)
 * Returns both shapes so the front end can pick whichever is convenient:
 *   { sections: { history: {...}, mission: {...} }, list: [ ... ] }
 */
router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const [rows] = await pool.query(
      'SELECT id, section_key, title, content, updated_at FROM about_content ORDER BY id ASC'
    );

    const sections = Object.fromEntries(rows.map((r) => [r.section_key, r]));
    res.json({ sections, list: rows });
  })
);

/** GET /api/about/:key   (public) — single section */
router.get(
  '/:key',
  asyncHandler(async (req, res) => {
    const [rows] = await pool.execute(
      'SELECT id, section_key, title, content, updated_at FROM about_content WHERE section_key = ? LIMIT 1',
      [req.params.key]
    );
    if (!rows.length) return res.status(404).json({ error: 'Section not found.' });
    res.json(rows[0]);
  })
);

/**
 * PUT /api/about/:key   (admin)
 * Upsert — creates the section if the admin invents a new section_key.
 * Body: { title, content }
 */
router.put(
  '/:key',
  requireAuth,
  asyncHandler(async (req, res) => {
    const key = String(req.params.key || '').trim();
    const { title = null, content = null } = req.body || {};

    if (!/^[a-z0-9_]{2,100}$/.test(key)) {
      return res
        .status(400)
        .json({ error: 'section_key must be 2–100 chars of lowercase letters, numbers or underscores.' });
    }

    await pool.execute(
      `INSERT INTO about_content (section_key, title, content)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE title = VALUES(title), content = VALUES(content)`,
      [key, title, content]
    );

    const [rows] = await pool.execute(
      'SELECT id, section_key, title, content, updated_at FROM about_content WHERE section_key = ?',
      [key]
    );
    res.json(rows[0]);
  })
);

/** PUT /api/about   (admin) — bulk save the whole page in one request */
router.put(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const items = Array.isArray(req.body?.sections) ? req.body.sections : null;
    if (!items) return res.status(400).json({ error: 'Expected body { sections: [...] }.' });

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      for (const item of items) {
        if (!/^[a-z0-9_]{2,100}$/.test(String(item.section_key || ''))) continue;
        await conn.execute(
          `INSERT INTO about_content (section_key, title, content)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE title = VALUES(title), content = VALUES(content)`,
          [item.section_key, item.title ?? null, item.content ?? null]
        );
      }
      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }

    const [rows] = await pool.query(
      'SELECT id, section_key, title, content, updated_at FROM about_content ORDER BY id ASC'
    );
    res.json({ sections: Object.fromEntries(rows.map((r) => [r.section_key, r])), list: rows });
  })
);

/** DELETE /api/about/:key   (admin) */
router.delete(
  '/:key',
  requireAuth,
  asyncHandler(async (req, res) => {
    await pool.execute('DELETE FROM about_content WHERE section_key = ?', [req.params.key]);
    res.json({ success: true });
  })
);

export default router;
