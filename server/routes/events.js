import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { imageUpload, uploadedPath } from '../middleware/upload.js';

const router = Router();

const COLUMNS =
  'id, title, event_date, event_time, location, description, image_url, google_form_url, created_at';

/**
 * GET /api/events
 *   ?scope=upcoming | past | all   (default: all)
 *   ?limit=3                        (used by the Home page preview)
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const scope = req.query.scope || 'all';
    const limit = Math.min(Number(req.query.limit) || 0, 100);

    let where = '';
    let order = 'event_date DESC';
    if (scope === 'upcoming') {
      where = 'WHERE event_date >= CURDATE()';
      order = 'event_date ASC';
    } else if (scope === 'past') {
      where = 'WHERE event_date < CURDATE()';
    }

    // LIMIT can't be a prepared placeholder in MySQL — it is clamped to an int above.
    const limitSql = limit > 0 ? `LIMIT ${limit}` : '';
    const [rows] = await pool.query(`SELECT ${COLUMNS} FROM events ${where} ORDER BY ${order} ${limitSql}`);

    res.json(rows);
  })
);

/** GET /api/events/grouped — upcoming + past in one call (used by /events) */
router.get(
  '/grouped',
  asyncHandler(async (_req, res) => {
    const [upcoming] = await pool.query(
      `SELECT ${COLUMNS} FROM events WHERE event_date >= CURDATE() ORDER BY event_date ASC`
    );
    const [past] = await pool.query(
      `SELECT ${COLUMNS} FROM events WHERE event_date < CURDATE() ORDER BY event_date DESC`
    );
    res.json({ upcoming, past });
  })
);

/** GET /api/events/:id */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const [rows] = await pool.execute(`SELECT ${COLUMNS} FROM events WHERE id = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Event not found.' });
    res.json(rows[0]);
  })
);

async function readBody(body = {}, file) {
  return [
    String(body.title || '').trim(),
    body.event_date || null,
    body.event_time ?? null,
    body.location ?? null,
    body.description ?? null,
    (await uploadedPath(file)) || body.image_url || null,
    body.google_form_url ?? null,
  ];
}

/** POST /api/events  (admin) */
router.post(
  '/',
  requireAuth,
  imageUpload.single('image'),
  asyncHandler(async (req, res) => {
    const values = await readBody(req.body, req.file);
    if (!values[0] || !values[1]) {
      return res.status(400).json({ error: 'Title and event_date (YYYY-MM-DD) are required.' });
    }

    const [result] = await pool.execute(
      `INSERT INTO events (title, event_date, event_time, location, description, image_url, google_form_url)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      values
    );
    const [rows] = await pool.execute(`SELECT ${COLUMNS} FROM events WHERE id = ?`, [result.insertId]);
    res.status(201).json(rows[0]);
  })
);

/** PUT /api/events/:id  (admin) */
router.put(
  '/:id',
  requireAuth,
  imageUpload.single('image'),
  asyncHandler(async (req, res) => {
    const values = await readBody(req.body, req.file);
    if (!values[0] || !values[1]) {
      return res.status(400).json({ error: 'Title and event_date (YYYY-MM-DD) are required.' });
    }

    const [result] = await pool.execute(
      `UPDATE events
          SET title = ?, event_date = ?, event_time = ?, location = ?,
              description = ?, image_url = ?, google_form_url = ?
        WHERE id = ?`,
      [...values, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Event not found.' });

    const [rows] = await pool.execute(`SELECT ${COLUMNS} FROM events WHERE id = ?`, [req.params.id]);
    res.json(rows[0]);
  })
);

/** DELETE /api/events/:id  (admin) */
router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const [result] = await pool.execute('DELETE FROM events WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Event not found.' });
    res.json({ success: true });
  })
);

export default router;
