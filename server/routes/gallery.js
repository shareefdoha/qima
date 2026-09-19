import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

const COLUMNS = 'id, title, type, url, video_embed_url, created_at';

/** GET /api/gallery?type=photo|video  (public) */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const type = req.query.type;
    const params = [];
    let where = '';
    if (type === 'photo' || type === 'video') {
      where = 'WHERE type = ?';
      params.push(type);
    }
    const [rows] = await pool.execute(
      `SELECT ${COLUMNS} FROM gallery ${where} ORDER BY created_at DESC, id DESC`,
      params
    );
    res.json(rows);
  })
);

/** POST /api/gallery  (admin) */
router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { title = '', type = 'photo', url = null, video_embed_url = null } = req.body || {};
    if (!String(title).trim()) return res.status(400).json({ error: 'Title is required.' });
    if (!['photo', 'video'].includes(type)) {
      return res.status(400).json({ error: "type must be 'photo' or 'video'." });
    }
    if (type === 'photo' && !url) return res.status(400).json({ error: 'A photo needs a url.' });
    if (type === 'video' && !video_embed_url) {
      return res.status(400).json({ error: 'A video needs a video_embed_url (use the YouTube /embed/ URL).' });
    }

    const [result] = await pool.execute(
      'INSERT INTO gallery (title, type, url, video_embed_url) VALUES (?, ?, ?, ?)',
      [String(title).trim(), type, url, video_embed_url]
    );
    const [rows] = await pool.execute(`SELECT ${COLUMNS} FROM gallery WHERE id = ?`, [result.insertId]);
    res.status(201).json(rows[0]);
  })
);

/** PUT /api/gallery/:id  (admin) */
router.put(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { title = '', type = 'photo', url = null, video_embed_url = null } = req.body || {};
    if (!String(title).trim()) return res.status(400).json({ error: 'Title is required.' });
    if (!['photo', 'video'].includes(type)) {
      return res.status(400).json({ error: "type must be 'photo' or 'video'." });
    }

    const [result] = await pool.execute(
      'UPDATE gallery SET title = ?, type = ?, url = ?, video_embed_url = ? WHERE id = ?',
      [String(title).trim(), type, url, video_embed_url, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Gallery item not found.' });

    const [rows] = await pool.execute(`SELECT ${COLUMNS} FROM gallery WHERE id = ?`, [req.params.id]);
    res.json(rows[0]);
  })
);

/** DELETE /api/gallery/:id  (admin) */
router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const [result] = await pool.execute('DELETE FROM gallery WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Gallery item not found.' });
    res.json({ success: true });
  })
);

export default router;
