<?php
declare(strict_types=1);

/**
 * Backend Site Configuration & Database Credentials
 * Ishwari Secondary School - Core Backend Server
 */

namespace Backend\Config;

define('SITE_NAME_EN', 'Ishwari Secondary School');
define('SITE_NAME_NP', 'ईश्वरी माध्यमिक विद्यालय');
define('SITE_CODE', 'EMIS: 48012004');
define('ESTD_BS', '2035 B.S.');
define('ESTD_AD', '1978 A.D.');

// Database Configuration
define('DB_HOST', getenv('DB_HOST') ?: '127.0.0.1');
define('DB_PORT', (int)(getenv('DB_PORT') ?: 3306));
define('DB_NAME', getenv('DB_NAME') ?: 'ishwari_school');
define('DB_USER', getenv('DB_USER') ?: 'root');
define('DB_PASS', getenv('DB_PASS') ?: '');

// Administrative Authentication Baseline
define('ADMIN_EMAIL', getenv('ADMIN_EMAIL') ?: 'admin@ishwari.edu.np');
define('ADMIN_PASS', getenv('ADMIN_PASS') ?: 'admin123');

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}
