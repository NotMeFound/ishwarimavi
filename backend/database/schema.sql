-- Ishwari Secondary School Database Schema
-- Compatible with MySQL 5.7+ / 8.0+ / MariaDB 10.3+

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+05:45"; -- Nepal Timezone

CREATE DATABASE IF NOT EXISTS `ishwari_school` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `ishwari_school`;

-- 1. Site Settings Table
CREATE TABLE IF NOT EXISTS `site_settings` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `school_name_en` varchar(255) NOT NULL,
  `school_name_np` varchar(255) NOT NULL,
  `phone` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `address_en` text NOT NULL,
  `address_np` text NOT NULL,
  `principal_name_en` varchar(255) NOT NULL,
  `principal_name_np` varchar(255) NOT NULL,
  `principal_message_en` text NOT NULL,
  `principal_message_np` text NOT NULL,
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `site_settings` (`id`, `school_name_en`, `school_name_np`, `phone`, `email`, `address_en`, `address_np`, `principal_name_en`, `principal_name_np`, `principal_message_en`, `principal_message_np`) VALUES
(1, 'Ishwari Secondary School', 'ईश्वरी माध्यमिक विद्यालय', '+977-01-5542109', 'info@ishwari.edu.np', 'Ward No. 4, Nepal', 'वडा नं. ४, नेपाल', 'Mr. Narayan Prasad Koirala', 'श्री नारायण प्रसाद कोइराला', 'Welcome to Ishwari Secondary School, dedicated to holistic education, scientific inquiry, and character development.', 'ईश्वरी माध्यमिक विद्यालयको आधिकारिक पोर्टलमा हार्दिक स्वागत छ। गुणस्तरीय, प्रविधिमैत्री र नैतिक शिक्षामा हाम्रो प्रतिबद्धता।');

-- 2. Notices Table
CREATE TABLE IF NOT EXISTS `notices` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title_en` varchar(255) NOT NULL,
  `title_np` varchar(255) NOT NULL,
  `category` enum('academic','exam','scholarship','admin','event') NOT NULL DEFAULT 'academic',
  `pinned` tinyint(1) NOT NULL DEFAULT 0,
  `file_name` varchar(255) DEFAULT NULL,
  `description_en` text DEFAULT NULL,
  `description_np` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `notices` (`id`, `title_en`, `title_np`, `category`, `pinned`, `file_name`, `description_en`, `description_np`) VALUES
(1, 'Annual Examination Routine (Grades 1 to 9) Published for Session 2083', 'शैक्षिक सत्र २०८३ को वार्षिक परीक्षा तालिका प्रकाशित गरिएको बारे', 'exam', 1, 'annual_exam_routine_2083.pdf', 'Examinations commence from Chaitra 2nd week.', 'वार्षिक परीक्षा आगामी चैत्र दोस्रो हप्तादेखि सञ्चालन हुनेछ।'),
(2, 'Grade 11 Admission Open for Science & Management Streams', 'कक्षा ११ विज्ञान तथा व्यवस्थापन संकायमा नयाँ भर्ना खुला', 'academic', 1, 'grade11_admission_2083.pdf', 'Entrance application forms available at administration desk.', 'नयाँ भर्ना फारम प्रशासन कक्षबाट प्राप्त गर्न सकिनेछ।');

-- 3. Staff Directory Table
CREATE TABLE IF NOT EXISTS `staff` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name_en` varchar(150) NOT NULL,
  `name_np` varchar(150) NOT NULL,
  `role` enum('principal','teacher','admin','support') NOT NULL DEFAULT 'teacher',
  `designation_en` varchar(150) NOT NULL,
  `designation_np` varchar(150) NOT NULL,
  `experience` varchar(100) DEFAULT NULL,
  `display_order` int(11) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `staff` (`id`, `name_en`, `name_np`, `role`, `designation_en`, `designation_np`, `experience`, `display_order`) VALUES
(1, 'Mr. Narayan Prasad Koirala', 'श्री नारायण प्रसाद कोइराला', 'principal', 'Headmaster (M.Ed, M.A.)', 'प्रधानाध्यापक', '26 Years Experience', 1),
(2, 'Mrs. Sharada Devi Sharma', 'श्रीमती शारदा देवी शर्मा', 'teacher', 'Senior Science Lead (M.Sc)', 'वरिष्ठ विज्ञान संयोजक', '18 Years Experience', 2);

-- 4. Admin Users Table
CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL UNIQUE,
  `password_hash` varchar(255) NOT NULL,
  `full_name` varchar(150) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Initial password is 'admin123'
INSERT INTO `admin_users` (`id`, `username`, `password_hash`, `full_name`) VALUES
(1, 'admin@ishwari.edu.np', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'System Administrator');

COMMIT;
