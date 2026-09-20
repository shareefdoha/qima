import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { imageUpload, uploadedPath } from '../middleware/upload.js';

const router = Router();

const COLUMNS = `tm.id, tm.name, tm.designation, tc.id AS category_id,
  tc.name AS role_category, tm.bio, tm.image_url, tm.linkedin_url, tm.email,
  tm.display_order, tm.created_at`;
const FROM = 'team_members tm JOIN team_categories tc ON tc.id = tm.category_id';

/** GET /api/team  (public) -> { grouped: {...}, list: [...], categories: [...] } */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const category = Number(req.query.category_id);
    const params = [];
    let where = '';
    if (category) {
      where = 'WHERE tm.category_id = ?';
      params.push(category);
    }

    const [rows] = await pool.execute(
      `SELECT ${COLUMNS} FROM ${FROM} ${where} ORDER BY tc.display_order ASC, tm.display_order ASC, tm.id ASC`,
      params
    );

    const [categoryRows] = await pool.query(`SELECT id, name, display_order FROM team_categories ORDER BY display_order, name, id`);
    const grouped = {};
    for (const row of rows) {
      const key = row.role_category;
      (grouped[key] ||= []).push(row);
    }

    const categories = categoryRows
      .filter((categoryRow) => grouped[categoryRow.name]?.length)
      .map((categoryRow) => ({ ...categoryRow, member_count: grouped[categoryRow.name].length }));

    res.json({ grouped, list: rows, categories });
  })
);

/** GET /api/team/:id  (public) */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const [rows] = await pool.execute(`SELECT ${COLUMNS} FROM ${FROM} WHERE tm.id = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Team member not found.' });
    res.json(rows[0]);
  })
);

function readBody(body = {}, file) {
  return [
    String(body.name || '').trim(),
    String(body.designation || '').trim(),
    Number(body.category_id) || null,
    body.bio ?? null,
    uploadedPath(file) || body.image_url || null,
    body.linkedin_url ?? null,
    body.email ?? null,
    Number(body.display_order) || 0,
  ];
}

/** POST /api/team  (admin) */
router.post(
  '/',
  requireAuth,
  imageUpload.single('image'),
  asyncHandler(async (req, res) => {
    const values = readBody(req.body, req.file);
    if (!values[0] || !values[1]) {
      return res.status(400).json({ error: 'Name and designation are required.' });
    }
    if (!values[2]) return res.status(400).json({ error: 'Choose a team category.' });

    const [result] = await pool.execute(
      `INSERT INTO team_members
         (name, designation, category_id, bio, image_url, linkedin_url, email, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      values
    );

    const [rows] = await pool.execute(`SELECT ${COLUMNS} FROM ${FROM} WHERE tm.id = ?`, [result.insertId]);
    res.status(201).json(rows[0]);
  })
);

/** PUT /api/team/:id  (admin) */
router.put(
  '/:id',
  requireAuth,
  imageUpload.single('image'),
  asyncHandler(async (req, res) => {
    const values = readBody(req.body, req.file);
    if (!values[0] || !values[1]) {
      return res.status(400).json({ error: 'Name and designation are required.' });
    }
    if (!values[2]) return res.status(400).json({ error: 'Choose a team category.' });

    const [result] = await pool.execute(
      `UPDATE team_members
          SET name = ?, designation = ?, category_id = ?, bio = ?,
              image_url = ?, linkedin_url = ?, email = ?, display_order = ?
        WHERE id = ?`,
      [...values, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Team member not found.' });

    const [rows] = await pool.execute(`SELECT ${COLUMNS} FROM ${FROM} WHERE tm.id = ?`, [req.params.id]);
    res.json(rows[0]);
  })
);

/** DELETE /api/team/:id  (admin) */
router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const [result] = await pool.execute('DELETE FROM team_members WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Team member not found.' });
    res.json({ success: true });
  })
);

export default router;
