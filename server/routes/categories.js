import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();
const COLUMNS = 'id, name, display_order, created_at';

router.get('/', asyncHandler(async (_req, res) => {
  const [rows] = await pool.query(`SELECT ${COLUMNS} FROM team_categories ORDER BY display_order, name, id`);
  res.json(rows);
}));

router.post('/', requireAuth, asyncHandler(async (req, res) => {
  const name = String(req.body?.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Category name is required.' });
  const [result] = await pool.execute('INSERT INTO team_categories (name, display_order) VALUES (?, ?)', [name, Number(req.body?.display_order) || 0]);
  const [rows] = await pool.execute(`SELECT ${COLUMNS} FROM team_categories WHERE id = ?`, [result.insertId]);
  res.status(201).json(rows[0]);
}));

router.put('/:id', requireAuth, asyncHandler(async (req, res) => {
  const name = String(req.body?.name || '').trim();
  if (!name) return res.status(400).json({ error: 'Category name is required.' });
  const [result] = await pool.execute('UPDATE team_categories SET name = ?, display_order = ? WHERE id = ?', [name, Number(req.body?.display_order) || 0, req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ error: 'Category not found.' });
  const [rows] = await pool.execute(`SELECT ${COLUMNS} FROM team_categories WHERE id = ?`, [req.params.id]);
  res.json(rows[0]);
}));

router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  const [[usage]] = await pool.execute('SELECT COUNT(*) AS total FROM team_members WHERE category_id = ?', [req.params.id]);
  if (usage.total) return res.status(409).json({ error: `This category has ${usage.total} assigned member(s). Move them before deleting it.` });
  const [result] = await pool.execute('DELETE FROM team_categories WHERE id = ?', [req.params.id]);
  if (!result.affectedRows) return res.status(404).json({ error: 'Category not found.' });
  res.json({ success: true });
}));

export default router;
