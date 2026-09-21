import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { imageUpload, uploadedPath } from '../middleware/upload.js';

const router = Router();
const COLUMNS = 'id, title, description, image_url, updated_at';

router.get('/', asyncHandler(async (_req, res) => {
  const [rows] = await pool.query(`SELECT ${COLUMNS} FROM home_about WHERE id = 1`);
  if (!rows.length) return res.status(404).json({ error: 'Home About section has not been configured.' });
  res.json(rows[0]);
}));

router.put('/', requireAuth, imageUpload.single('image'), asyncHandler(async (req, res) => {
  const title = String(req.body?.title || '').trim();
  const description = String(req.body?.description || '').trim();
  if (!title || !description) return res.status(400).json({ error: 'Title and description are required.' });

  const [currentRows] = await pool.query('SELECT image_url FROM home_about WHERE id = 1');
  const imageUrl = (await uploadedPath(req.file)) || currentRows[0]?.image_url || null;
  await pool.execute(`INSERT INTO home_about (id, title, description, image_url)
    VALUES (1, ?, ?, ?)
    ON DUPLICATE KEY UPDATE title = VALUES(title), description = VALUES(description), image_url = VALUES(image_url)`,
    [title, description, imageUrl]);
  const [rows] = await pool.query(`SELECT ${COLUMNS} FROM home_about WHERE id = 1`);
  res.json(rows[0]);
}));

export default router;
