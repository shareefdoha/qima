import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import multer from 'multer';
import { pool } from '../db/pool.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Set UPLOAD_DIR to a persistent volume path on a managed host. Locally the
// repository's server/uploads directory is used.
export const uploadsDir = process.env.UPLOAD_DIR
  ? path.resolve(process.env.UPLOAD_DIR)
  : path.resolve(__dirname, '../uploads');

// The directory is deliberately outside source folders so it can be mounted as
// a static asset directory and persisted separately by production hosts.
fs.mkdirSync(uploadsDir, { recursive: true });

export const imageUpload = multer({
  // Files are persisted in MySQL rather than the deployment filesystem.
  // This keeps admin uploads available after Hostinger redeployments.
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.mimetype)) return cb(null, true);
    return cb(new multer.MulterError('LIMIT_UNEXPECTED_FILE', 'image'));
  },
});

/** Store the image bytes in MySQL and return a portable public media path. */
export async function uploadedPath(file) {
  if (!file) return null;

  const id = randomUUID();
  const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' }[file.mimetype] || 'jpg';
  await pool.execute(
    'INSERT INTO uploaded_media (id, filename, mime_type, data) VALUES (?, ?, ?, ?)',
    [id, `${id}.${extension}`, file.mimetype, file.buffer]
  );
  return `/api/media/${id}`;
}
