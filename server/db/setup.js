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

export async function setupDatabase() {
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
  await migrateTeamCategories(conn);
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

async function migrateTeamCategories(conn) {
  await conn.query(`CREATE TABLE IF NOT EXISTS team_categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`);
  await conn.query(`INSERT INTO team_categories (name, display_order) VALUES
    ('Management Board', 1), ('Office Bearers', 2),
    ('Executive Committee', 3), ('Advisory Council', 4)
    ON DUPLICATE KEY UPDATE name = VALUES(name)`);

  const [columns] = await conn.execute(
    `SELECT 1 FROM information_schema.columns
     WHERE table_schema = DATABASE() AND table_name = 'team_members' AND column_name = 'category_id'`
  );
  if (!columns.length) await conn.query('ALTER TABLE team_members ADD COLUMN category_id INT NULL AFTER role_category');

  await conn.query(`UPDATE team_members tm
    JOIN team_categories tc ON tc.name = tm.role_category
    SET tm.category_id = tc.id
    WHERE tm.category_id IS NULL`);

  const [indexes] = await conn.execute(
    `SELECT 1 FROM information_schema.statistics
     WHERE table_schema = DATABASE() AND table_name = 'team_members' AND index_name = 'idx_team_category_id_order'`
  );
  if (!indexes.length) await conn.query('ALTER TABLE team_members ADD INDEX idx_team_category_id_order (category_id, display_order)');

  const [constraints] = await conn.execute(
    `SELECT 1 FROM information_schema.table_constraints
     WHERE constraint_schema = DATABASE() AND table_name = 'team_members' AND constraint_name = 'fk_team_members_category'`
  );
  if (!constraints.length) {
    await conn.query(`ALTER TABLE team_members ADD CONSTRAINT fk_team_members_category
      FOREIGN KEY (category_id) REFERENCES team_categories(id) ON UPDATE CASCADE ON DELETE RESTRICT`);
  }
}

const isDirectRun = process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectRun) {
  setupDatabase().catch((err) => {
    console.error('✗ Database setup failed:', err.message);
    process.exit(1);
  });
}
