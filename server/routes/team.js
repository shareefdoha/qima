import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

const COLUMNS =
  'id, name, designation, role_category, bio, image_url, linkedin_url, email, display_order, created_at';

/**
 * Display order of the four groups on /team.
 * Anything else the admin types falls to the end, alphabetically.
 */
export const CATEGORY_ORDER = [
  'Management Board',
  'Office Bearers',
  'Executive Committee',
  'Advisory Council',
];

/** GET /api/team  (public) -> { grouped: {...}, list: [...], categories: [...] } */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const category = req.query.category;
    const params = [];
    let where = '';
    if (category) {
      where = 'WHERE role_category = ?';
      params.push(category);
    }

    const [rows] = await pool.execute(
      `SELECT ${COLUMNS} FROM team_members ${where} ORDER BY display_order ASC, id ASC`,
      params
    );

    const grouped = {};
    for (const row of rows) {
      const key = row.role_category || 'Executive Committee';
      (grouped[key] ||= []).push(row);
    }

    const categories = Object.keys(grouped).sort((a, b) => {
      const ai = CATEGORY_ORDER.indexOf(a);
      const bi = CATEGORY_ORDER.indexOf(b);
      if (ai === -1 && bi === -1) return a.localeCompare(b);
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });

    res.json({ grouped, list: rows, categories });
  })
);

/** GET /api/team/:id  (public) */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const [rows] = await pool.execute(`SELECT ${COLUMNS} FROM team_members WHERE id = ?`, [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Team member not found.' });
    res.json(rows[0]);
  })
);

function readBody(body = {}) {
  return [
    String(body.name || '').trim(),
    String(body.designation || '').trim(),
    String(body.role_category || 'Executive Committee').trim(),
    body.bio ?? null,
    body.image_url ?? null,
    body.linkedin_url ?? null,
    body.email ?? null,
    Number(body.display_order) || 0,
  ];
}

/** POST /api/team  (admin) */
router.post(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const values = readBody(req.body);
    if (!values[0] || !values[1]) {
      return res.status(400).json({ error: 'Name and designation are required.' });
    }

    const [result] = await pool.execute(
      `INSERT INTO team_members
         (name, designation, role_category, bio, image_url, linkedin_url, email, display_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      values
    );

    const [rows] = await pool.execute(`SELECT ${COLUMNS} FROM team_members WHERE id = ?`, [result.insertId]);
    res.status(201).json(rows[0]);
  })
);

/** PUT /api/team/:id  (admin) */
router.put(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const values = readBody(req.body);
    if (!values[0] || !values[1]) {
      return res.status(400).json({ error: 'Name and designation are required.' });
    }

    const [result] = await pool.execute(
      `UPDATE team_members
          SET name = ?, designation = ?, role_category = ?, bio = ?,
              image_url = ?, linkedin_url = ?, email = ?, display_order = ?
        WHERE id = ?`,
      [...values, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Team member not found.' });

    const [rows] = await pool.execute(`SELECT ${COLUMNS} FROM team_members WHERE id = ?`, [req.params.id]);
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
