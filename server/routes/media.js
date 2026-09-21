import { Router } from 'express';
import { pool } from '../db/pool.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();

router.get('/:id', asyncHandler(async (req, res) => {
  const id = String(req.params.id || '');
  if (!/^[0-9a-f-]{36}$/i.test(id)) return res.status(404).json({ error: 'Image not found.' });

  const [rows] = await pool.execute(
    'SELECT filename, mime_type, data FROM uploaded_media WHERE id = ? LIMIT 1',
    [id]
  );
  if (!rows.length) return res.status(404).json({ error: 'Image not found.' });

  res.set({
    'Content-Type': rows[0].mime_type,
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Content-Disposition': `inline; filename="${rows[0].filename}"`,
  });
  res.send(rows[0].data);
}));

export default router;
