-- Persistent image store for managed environments where deployment folders
-- are recreated on each release. Images are served via /api/media/:id.
CREATE TABLE IF NOT EXISTS `uploaded_media` (
  `id`          CHAR(36) PRIMARY KEY,
  `filename`    VARCHAR(255) NOT NULL,
  `mime_type`   VARCHAR(100) NOT NULL,
  `data`        LONGBLOB NOT NULL,
  `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
