-- Run once for installations created before team_categories existed.
CREATE TABLE IF NOT EXISTS `team_categories` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `display_order` INT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `team_categories` (`name`, `display_order`) VALUES
  ('Management Board', 1),
  ('Office Bearers', 2),
  ('Executive Committee', 3),
  ('Advisory Council', 4)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- If category_id does not exist yet, add it in phpMyAdmin before continuing:
-- ALTER TABLE team_members ADD COLUMN category_id INT NULL AFTER role_category;
UPDATE `team_members` tm
JOIN `team_categories` tc ON tc.name = tm.role_category
SET tm.category_id = tc.id
WHERE tm.category_id IS NULL;

-- Then add the relationship (only once):
-- ALTER TABLE team_members
--   ADD INDEX idx_team_category_id_order (category_id, display_order),
--   ADD CONSTRAINT fk_team_members_category FOREIGN KEY (category_id)
--     REFERENCES team_categories(id) ON UPDATE CASCADE ON DELETE RESTRICT;
