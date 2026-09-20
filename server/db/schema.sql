-- ============================================================================
--  Qatar Indian Management Association (QIMA)
--  MySQL 8.0+ schema + seed data
--
--  Usage:  mysql -u root -p < db/schema.sql
--  (or)    npm run db:setup      -- runs this file, then seeds the admin user
-- ============================================================================

CREATE DATABASE IF NOT EXISTS `qima_db`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `qima_db`;

-- ---------------------------------------------------------------------------
-- 1. about_content — every editable block on the /about page
--    section_key: history | mission | vision | values | objectives |
--                 president_message | leadership_pillars
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `about_content` (
  `id`          INT AUTO_INCREMENT PRIMARY KEY,
  `section_key` VARCHAR(100) UNIQUE NOT NULL,
  `title`       VARCHAR(255),
  `content`     TEXT,
  `created_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 2. banners — hero slides (image or video background)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `banners` (
  `id`            INT AUTO_INCREMENT PRIMARY KEY,
  `title`         VARCHAR(255),
  `subtitle`      TEXT,
  `media_type`    ENUM('image','video') DEFAULT 'image',
  `media_url`     TEXT,
  `cta_text`      VARCHAR(100),
  `cta_link`      VARCHAR(255),
  `is_active`     BOOLEAN DEFAULT TRUE,
  `display_order` INT DEFAULT 0,
  `created_at`    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_banners_active_order` (`is_active`, `display_order`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 3. team_categories — admin-managed groups for the public team page
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `team_categories` (
  `id`            INT AUTO_INCREMENT PRIMARY KEY,
  `name`          VARCHAR(100) NOT NULL UNIQUE,
  `display_order` INT DEFAULT 0,
  `created_at`    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 4. home_about — single editable overview block displayed on the home page
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `home_about` (
  `id`          TINYINT PRIMARY KEY DEFAULT 1,
  `title`       VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `image_url`   TEXT,
  `updated_at`  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 4. team_members — each member belongs to one managed category
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `team_members` (
  `id`            INT AUTO_INCREMENT PRIMARY KEY,
  `name`          VARCHAR(255) NOT NULL,
  `designation`   VARCHAR(255) NOT NULL,
  `role_category` VARCHAR(100) DEFAULT 'Executive Committee',
  `category_id`   INT NULL,
  `bio`           TEXT,
  `image_url`     TEXT,
  `linkedin_url`  VARCHAR(255),
  `email`         VARCHAR(255),
  `display_order` INT DEFAULT 0,
  `created_at`    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_team_category_order` (`role_category`, `display_order`),
  INDEX `idx_team_category_id_order` (`category_id`, `display_order`),
  CONSTRAINT `fk_team_members_category`
    FOREIGN KEY (`category_id`) REFERENCES `team_categories`(`id`)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 5. events — seminars / conferences, each with its own Google Form
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `events` (
  `id`              INT AUTO_INCREMENT PRIMARY KEY,
  `title`           VARCHAR(255) NOT NULL,
  `event_date`      DATE NOT NULL,
  `event_time`      VARCHAR(50),
  `location`        VARCHAR(255),
  `description`     TEXT,
  `image_url`       TEXT,
  `google_form_url` TEXT,
  `created_at`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_events_date` (`event_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 6. settings — global key/value config (membership form URL, socials, …)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `settings` (
  `id`            INT AUTO_INCREMENT PRIMARY KEY,
  `setting_key`   VARCHAR(100) UNIQUE NOT NULL,
  `setting_value` TEXT NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 7. gallery — photos and embedded videos
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `gallery` (
  `id`              INT AUTO_INCREMENT PRIMARY KEY,
  `title`           VARCHAR(255) NOT NULL,
  `type`            ENUM('photo','video') DEFAULT 'photo',
  `url`             TEXT,
  `video_embed_url` TEXT,
  `created_at`      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_gallery_type` (`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 8. contact_messages — submissions from /contact
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `contact_messages` (
  `id`         INT AUTO_INCREMENT PRIMARY KEY,
  `name`       VARCHAR(255) NOT NULL,
  `email`      VARCHAR(255) NOT NULL,
  `subject`    VARCHAR(255),
  `message`    TEXT NOT NULL,
  `is_read`    BOOLEAN DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_messages_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- 9. admin_users — /admin authentication (bcrypt hashes, JWT sessions)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id`            INT AUTO_INCREMENT PRIMARY KEY,
  `name`          VARCHAR(255) NOT NULL,
  `email`         VARCHAR(255) UNIQUE NOT NULL,
  `password_hash` VARCHAR(255) NOT NULL,
  `role`          VARCHAR(50) DEFAULT 'admin',
  `last_login_at` TIMESTAMP NULL DEFAULT NULL,
  `created_at`    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


-- ===========================================================================
--  SEED DATA  (safe to re-run: INSERT ... ON DUPLICATE KEY UPDATE / guards)
-- ===========================================================================

INSERT INTO `team_categories` (`name`, `display_order`) VALUES
('Management Board', 1),
('Office Bearers', 2),
('Executive Committee', 3),
('Advisory Council', 4)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

INSERT INTO `home_about` (`id`, `title`, `description`, `image_url`)
SELECT 1,
  'Empowering Management Professionals in Qatar',
  'The Qatar Indian Management Association brings together Indian management professionals working across Qatar’s diverse economy. We create a trusted space for people to learn, exchange ideas and build meaningful professional relationships.\n\nAs an affiliate of the All India Management Association, QIMA connects members with knowledge, leadership development and a community committed to contributing positively to Qatar’s future.',
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=85'
WHERE NOT EXISTS (SELECT 1 FROM `home_about` WHERE `id` = 1);

-- --- About Us content -------------------------------------------------------
INSERT INTO `about_content` (`section_key`, `title`, `content`) VALUES
('history', 'Our History',
 'The Qatar Indian Management Association (QIMA) was formed by a group of Indian management professionals working across Doha''s energy, construction, banking and technology sectors, who saw the need for a single professional forum connecting Indian managers in Qatar.\n\nWhat began as an informal monthly roundtable of a few dozen practitioners has grown into a structured association with an elected Executive Committee, an Advisory Council of senior industry leaders, and a calendar of seminars, leadership workshops and networking forums held throughout the year.\n\nQIMA operates as a non-political, non-profit professional body. Its work is carried out entirely by volunteer members who contribute their time to build management capability within the Indian professional community in Qatar, while strengthening ties with the wider Qatari business ecosystem.'),

('mission', 'Our Mission',
 'To build a connected, capable and credible community of Indian management professionals in Qatar — by creating platforms for knowledge exchange, supporting the career growth of our members, upholding the highest standards of professional ethics, and contributing meaningfully to Qatar''s economic and social development in line with Qatar National Vision 2030.'),

('vision', 'Our Vision',
 'To be the most respected professional management association in Qatar — a first point of contact for Indian professionals seeking growth, and a trusted partner to institutions, businesses and government bodies seeking management expertise from within the community.'),

('values', 'Core Values',
 'Integrity — We hold ourselves to the highest ethical standards in every professional and association activity.\nInclusivity — Membership is open to management professionals across every industry, function, seniority and region of origin.\nExcellence — We pursue quality in every seminar, publication and initiative we put our name to.\nService — We give back to the community in Qatar and to the country we come from.\nCollaboration — We grow by sharing knowledge freely, mentoring openly, and partnering widely.\nRespect — We honour the laws, culture and traditions of the State of Qatar.'),

('objectives', 'Our Objectives',
 'Provide a structured professional platform for Indian management practitioners across Qatar.\nOrganise seminars, conferences, workshops and certification support in core management disciplines.\nFacilitate mentorship between senior leaders and early-career professionals.\nPublish insights, case studies and industry briefings relevant to the Qatar market.\nBuild bridges with Qatari institutions, chambers of commerce and other professional bodies.\nSupport members in career transitions, entrepreneurship and continuing education.\nPromote corporate social responsibility and community service initiatives across Qatar.'),

('president_message', 'Message from the President',
 'It gives me great pleasure to welcome you to the Qatar Indian Management Association.\n\nQatar is home to a remarkable community of Indian professionals who hold management responsibility across almost every sector of this country''s economy — energy, infrastructure, aviation, healthcare, banking, retail and technology. QIMA exists so that this collective experience does not sit in silos, but becomes a shared resource.\n\nOur association is built on a simple idea: that professionals grow fastest when they learn from one another. Through our seminars, leadership forums, mentorship circles and networking events, we try to make that exchange happen deliberately and regularly.\n\nI invite you to join us, participate actively, and help shape the next chapter of this association.'),

('leadership_pillars', 'Leadership Pillars',
 'Professional Development — Year-round seminars, workshops and certification guidance.\nNetworking & Community — Structured forums connecting members across industries and seniority levels.\nMentorship — Pairing experienced leaders with emerging managers for guided career growth.\nIndustry Engagement — Partnerships with corporates, chambers and institutions across Qatar.\nSocial Responsibility — Volunteer-led initiatives serving the wider community in Qatar.')
ON DUPLICATE KEY UPDATE
  `title` = VALUES(`title`);
-- NOTE: `content` is intentionally NOT overwritten on re-run, so re-running
-- this script never destroys copy the admin has edited in the panel.

-- --- Hero banners -----------------------------------------------------------
INSERT INTO `banners` (`title`, `subtitle`, `media_type`, `media_url`, `cta_text`, `cta_link`, `is_active`, `display_order`)
SELECT * FROM (
  SELECT
    'Qatar Indian Management Association' AS t,
    'A professional forum for Indian management practitioners building their careers — and Qatar''s future.' AS s,
    'image' AS mt,
    'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1920&q=80' AS mu,
    'Become a Member' AS ct, '/membership' AS cl, TRUE AS ia, 1 AS dor
  UNION ALL SELECT
    'Learn. Connect. Lead.',
    'Seminars, leadership forums and mentorship circles running throughout the year in Doha.',
    'image',
    'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1920&q=80',
    'View Events', '/events', TRUE, 2
  UNION ALL SELECT
    'Aligned with Qatar National Vision 2030',
    'Contributing management expertise to the human and economic development pillars of the national vision.',
    'image',
    'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?auto=format&fit=crop&w=1920&q=80',
    'About QIMA', '/about', TRUE, 3
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM `banners`);

-- --- Management team --------------------------------------------------------
INSERT INTO `team_members` (`name`, `designation`, `role_category`, `bio`, `image_url`, `linkedin_url`, `email`, `display_order`)
SELECT * FROM (
  SELECT 'Rajeev Menon' AS n, 'President' AS d, 'Management Board' AS rc,
         'Thirty years in energy-sector project management across the Gulf. Leads QIMA''s strategic direction and institutional partnerships.' AS b,
         'https://ui-avatars.com/api/?name=Rajeev+Menon&size=512&background=0f2740&color=ffffff' AS iu,
         'https://www.linkedin.com/' AS li, 'president@qima.qa' AS e, 1 AS o
  UNION ALL SELECT 'Anita Krishnan', 'Vice President', 'Management Board',
         'Banking and financial services leader based in Doha. Oversees QIMA''s professional development portfolio.',
         'https://ui-avatars.com/api/?name=Anita+Krishnan&size=512&background=0f2740&color=ffffff',
         'https://www.linkedin.com/', 'vp@qima.qa', 2
  UNION ALL SELECT 'Suresh Nair', 'General Secretary', 'Office Bearers',
         'Runs the association''s day-to-day operations, membership records and committee coordination.',
         'https://ui-avatars.com/api/?name=Suresh+Nair&size=512&background=0f2740&color=ffffff',
         'https://www.linkedin.com/', 'secretary@qima.qa', 3
  UNION ALL SELECT 'Fathima Rasheed', 'Treasurer', 'Office Bearers',
         'Chartered accountant with a background in Gulf corporate finance. Custodian of QIMA''s accounts and annual audit.',
         'https://ui-avatars.com/api/?name=Fathima+Rasheed&size=512&background=0f2740&color=ffffff',
         'https://www.linkedin.com/', 'treasurer@qima.qa', 4
  UNION ALL SELECT 'Vikram Desai', 'Joint Secretary', 'Office Bearers',
         'Supply chain professional in aviation logistics. Supports event operations and volunteer coordination.',
         'https://ui-avatars.com/api/?name=Vikram+Desai&size=512&background=0f2740&color=ffffff',
         'https://www.linkedin.com/', 'jointsecretary@qima.qa', 5
  UNION ALL SELECT 'Priya Balakrishnan', 'Chair — Programmes Committee', 'Executive Committee',
         'Learning and development specialist. Designs QIMA''s seminar calendar and workshop curriculum.',
         'https://ui-avatars.com/api/?name=Priya+Balakrishnan&size=512&background=0f2740&color=ffffff',
         'https://www.linkedin.com/', 'programmes@qima.qa', 6
  UNION ALL SELECT 'Arun Thomas', 'Chair — Membership Committee', 'Executive Committee',
         'HR business partner in the construction sector. Leads member recruitment, onboarding and retention.',
         'https://ui-avatars.com/api/?name=Arun+Thomas&size=512&background=0f2740&color=ffffff',
         'https://www.linkedin.com/', 'membership@qima.qa', 7
  UNION ALL SELECT 'Neha Srivastava', 'Chair — Communications Committee', 'Executive Committee',
         'Corporate communications lead. Manages QIMA''s publications, digital presence and media relations.',
         'https://ui-avatars.com/api/?name=Neha+Srivastava&size=512&background=0f2740&color=ffffff',
         'https://www.linkedin.com/', 'media@qima.qa', 8
  UNION ALL SELECT 'Dr. Mohan Iyer', 'Advisory Council Chair', 'Advisory Council',
         'Former managing director of a Qatari industrial group. Advises the board on governance and long-term strategy.',
         'https://ui-avatars.com/api/?name=Mohan+Iyer&size=512&background=0f2740&color=ffffff',
         'https://www.linkedin.com/', 'advisory@qima.qa', 9
  UNION ALL SELECT 'Sunita Pillai', 'Advisory Council Member', 'Advisory Council',
         'Healthcare administration leader in Doha. Advises on CSR initiatives and community outreach.',
         'https://ui-avatars.com/api/?name=Sunita+Pillai&size=512&background=0f2740&color=ffffff',
         'https://www.linkedin.com/', 'council@qima.qa', 10
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM `team_members`);

-- --- Events -----------------------------------------------------------------
INSERT INTO `events` (`title`, `event_date`, `event_time`, `location`, `description`, `image_url`, `google_form_url`)
SELECT * FROM (
  SELECT 'QIMA Annual Management Conference' AS t, DATE_ADD(CURDATE(), INTERVAL 45 DAY) AS dt,
         '09:00 AM – 05:00 PM' AS tm, 'Doha Exhibition & Convention Centre, West Bay' AS loc,
         'Our flagship full-day conference bringing together management practitioners from across Qatar for keynotes, panel discussions and structured networking.' AS descr,
         'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80' AS img,
         'https://docs.google.com/forms/d/e/REPLACE_WITH_YOUR_FORM_ID/viewform' AS gf
  UNION ALL SELECT 'Leadership Masterclass: Managing Multicultural Teams',
         DATE_ADD(CURDATE(), INTERVAL 21 DAY), '06:30 PM – 09:00 PM', 'QIMA Hall, Al Sadd, Doha',
         'A practical evening workshop on leading teams that span a dozen nationalities — communication norms, feedback culture and conflict resolution in Gulf workplaces.',
         'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=80',
         'https://docs.google.com/forms/d/e/REPLACE_WITH_YOUR_FORM_ID/viewform'
  UNION ALL SELECT 'Monthly Networking Forum — October Edition',
         DATE_ADD(CURDATE(), INTERVAL 10 DAY), '07:00 PM – 09:30 PM', 'The Torch Doha, Aspire Zone',
         'Our recurring members-and-guests evening: short member spotlights, an open floor, and unstructured networking over dinner.',
         'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80',
         'https://docs.google.com/forms/d/e/REPLACE_WITH_YOUR_FORM_ID/viewform'
  UNION ALL SELECT 'Seminar: Project Finance in the Qatari Market',
         DATE_SUB(CURDATE(), INTERVAL 30 DAY), '06:00 PM – 08:30 PM', 'Movenpick Hotel, West Bay',
         'A past seminar covering capital structuring, lender expectations and risk allocation on large Qatari infrastructure projects.',
         'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80',
         'https://docs.google.com/forms/d/e/REPLACE_WITH_YOUR_FORM_ID/viewform'
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM `events`);

-- --- Gallery ----------------------------------------------------------------
INSERT INTO `gallery` (`title`, `type`, `url`, `video_embed_url`)
SELECT * FROM (
  SELECT 'Annual Conference 2025 — Opening Session' AS t, 'photo' AS ty,
         'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80' AS u,
         NULL AS v
  UNION ALL SELECT 'Leadership Masterclass — Group Session', 'photo',
         'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80', NULL
  UNION ALL SELECT 'Networking Forum at The Torch', 'photo',
         'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80', NULL
  UNION ALL SELECT 'Executive Committee Meeting', 'photo',
         'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=1200&q=80', NULL
  UNION ALL SELECT 'Community Volunteering Drive', 'photo',
         'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=1200&q=80', NULL
  UNION ALL SELECT 'Members'' Iftar Gathering', 'photo',
         'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?auto=format&fit=crop&w=1200&q=80', NULL
  UNION ALL SELECT 'QIMA Annual Highlights', 'video', NULL,
         'https://www.youtube.com/embed/ScMzIvxBSi4'
  UNION ALL SELECT 'President''s Address — Annual General Meeting', 'video', NULL,
         'https://www.youtube.com/embed/aqz-KE-bpKQ'
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM `gallery`);

-- --- Settings ---------------------------------------------------------------
INSERT INTO `settings` (`setting_key`, `setting_value`) VALUES
('membership_google_form_url', 'https://docs.google.com/forms/d/e/REPLACE_WITH_YOUR_FORM_ID/viewform'),
('membership_intro',           'Membership is open to management professionals of Indian origin working in Qatar, across every industry and level of seniority.'),
('home_about_image_url',       'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=85'),
('contact_email',              'info@qima.qa'),
('contact_phone',              '+974 4000 0000'),
('contact_address',            'QIMA Secretariat, Al Sadd, Doha, State of Qatar'),
('contact_map_embed',          'https://www.google.com/maps?q=Al%20Sadd%2C%20Doha%2C%20Qatar&output=embed'),
('social_linkedin',            'https://www.linkedin.com/'),
('social_instagram',           'https://www.instagram.com/'),
('social_facebook',            'https://www.facebook.com/'),
('social_youtube',             'https://www.youtube.com/'),
('stat_members',               '850'),
('stat_events_per_year',       '24'),
('stat_industries',            '18'),
('stat_founded_year',          '2016')
ON DUPLICATE KEY UPDATE `setting_key` = `settings`.`setting_key`;
-- (no-op update: existing values are preserved on re-run)
