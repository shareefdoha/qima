CREATE TABLE IF NOT EXISTS `home_about` (
  `id` TINYINT PRIMARY KEY DEFAULT 1,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `image_url` TEXT,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `home_about` (`id`, `title`, `description`, `image_url`)
SELECT 1,
  'Empowering Management Professionals in Qatar',
  'The Qatar Indian Management Association brings together Indian management professionals working across Qatar’s diverse economy.\n\nAs an affiliate of the All India Management Association, QIMA supports learning, leadership development and professional connection.',
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=85'
WHERE NOT EXISTS (SELECT 1 FROM `home_about` WHERE `id` = 1);
