/**
 * One-shot database bootstrapper.
 *   npm run db:setup
 *
 * 1. Connects to MySQL WITHOUT selecting a database.
 * 2. Executes db/schema.sql (creates DB, tables and seed rows).
 * 3. Creates / resets the first admin account from SEED_ADMIN_* in .env.
 *
 * Safe to run repeatedly.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const rawSql = await fs.readFile(path.join(__dirname, 'schema.sql'), 'utf8');
  const dbName = process.env.DB_NAME || 'qima_db';
  const sql = rawSql
    .replace(/CREATE DATABASE IF NOT EXISTS `qima_db`[\s\S]*?;/i, '')
    .replace(/USE `qima_db`;/i, '');

  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: dbName,
    multipleStatements: true, // only used here, never in the running API
  });

  console.log('→ Running schema.sql …');
  await conn.query(sql);
  console.log('✓ Schema and seed data applied.');

  const email = (process.env.SEED_ADMIN_EMAIL || 'admin@qima.qa').toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || 'ChangeMe@123';
  const name = process.env.SEED_ADMIN_NAME || 'QIMA Administrator';
  const hash = await bcrypt.hash(password, 12);

  await conn.execute(
    `INSERT INTO admin_users (name, email, password_hash, role)
     VALUES (?, ?, ?, 'admin')
     ON DUPLICATE KEY UPDATE
       name = VALUES(name),
       password_hash = VALUES(password_hash),
       role = VALUES(role)`,
    [name, email, hash]
  );

  console.log(`✓ Admin account synchronized → ${email}`);

  await conn.end();
}

main().catch((err) => {
  console.error('✗ Database setup failed:', err.message);
  process.exit(1);
});
