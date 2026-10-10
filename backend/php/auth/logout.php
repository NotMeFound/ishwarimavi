<?php
declare(strict_types=1);

/**
 * Backend Authentication Endpoint: /backend/php/auth/logout.php
 * Strictly handles session termination and token invalidation.
 */

namespace Backend\Auth;

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../utils/functions.php';

use function Backend\Utils\sendJsonResponse;
use function Backend\Utils\isJsonRequest;

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

$_SESSION['is_admin'] = false;
unset($_SESSION['is_admin']);
unset($_SESSION['admin_email']);
unset($_SESSION['admin_role']);

if (ini_get("session.use_cookies")) {
    $params = session_get_cookie_params();
    setcookie(
        session_name(),
        '',
        time() - 42000,
        $params["path"],
        $params["domain"],
        $params["secure"],
        $params["httponly"]
    );
}

session_destroy();

if (isJsonRequest()) {
    sendJsonResponse(true, ['logged_out' => true]);
} else {
    header('Location: /frontend/php/admin/login.php?message=' . urlencode('You have been signed out successfully.'));
    exit;
}
