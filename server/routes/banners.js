import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

const COLUMNS =
  'id, title, subtitle, media_type, media_url, cta_text, cta_link, is_active, display_order, created_at';

/** GET /api/banners            (public) — active slides only */
/** GET /api/banners?all=true   (admin)  — everything, for the dashboard */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const showAll = req.query.all === 'true';
    const [rows] = await pool.query(
      `SELECT ${COLUMNS} FROM banners ${showAll ? '' : 'WHERE is_active = TRUE'}
       ORDER BY display_order ASC, id ASC`
    );
    res.json(rows.map((r) => ({ ...r, is_active: Boolean(r.is_active) })));
  })
);

/** POST /api/banners   (admin) */
router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const {
      title = null,
      subtitle = null,
      media_type = 'image',
      media_url = null,
      cta_text = null,
      cta_link = null,
      is_active = true,
      display_order = 0,
    } = req.body || {};

    if (!['image', 'video'].includes(media_type)) {
      return res.status(400).json({ error: "media_type must be 'image' or 'video'." });
    }

    const [result] = await pool.execute(
      `INSERT INTO banners (title, subtitle, media_type, media_url, cta_text, cta_link, is_active, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, subtitle, media_type, media_url, cta_text, cta_link, is_active ? 1 : 0, Number(display_order) || 0]
    );

    const [rows] = await pool.execute(`SELECT ${COLUMNS} FROM banners WHERE id = ?`, [result.insertId]);
    res.status(201).json({ ...rows[0], is_active: Boolean(rows[0].is_active) });
  })
);

/** PUT /api/banners/:id   (admin) */
router.put(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const {
      title = null,
      subtitle = null,
      media_type = 'image',
      media_url = null,
      cta_text = null,
      cta_link = null,
      is_active = true,
      display_order = 0,
    } = req.body || {};

    if (!['image', 'video'].includes(media_type)) {
      return res.status(400).json({ error: "media_type must be 'image' or 'video'." });
    }

    const [result] = await pool.execute(
      `UPDATE banners
          SET title = ?, subtitle = ?, media_type = ?, media_url = ?,
              cta_text = ?, cta_link = ?, is_active = ?, display_order = ?
        WHERE id = ?`,
      [
        title, subtitle, media_type, media_url, cta_text, cta_link,
        is_active ? 1 : 0, Number(display_order) || 0, req.params.id,
      ]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Banner not found.' });

    const [rows] = await pool.execute(`SELECT ${COLUMNS} FROM banners WHERE id = ?`, [req.params.id]);
    res.json({ ...rows[0], is_active: Boolean(rows[0].is_active) });
  })
);

/** PATCH /api/banners/:id/toggle   (admin) */
router.patch(
  '/:id/toggle',
  requireAuth,
  asyncHandler(async (req, res) => {
    await pool.execute('UPDATE banners SET is_active = NOT is_active WHERE id = ?', [req.params.id]);
    const [rows] = await pool.execute(`SELECT ${COLUMNS} FROM banners WHERE id = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Banner not found.' });
    res.json({ ...rows[0], is_active: Boolean(rows[0].is_active) });
  })
);

/** DELETE /api/banners/:id   (admin) */
router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const [result] = await pool.execute('DELETE FROM banners WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Banner not found.' });
    res.json({ success: true });
  })
);

export default router;
