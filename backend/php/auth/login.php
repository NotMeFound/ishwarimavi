<?php
declare(strict_types=1);

/**
 * Backend Authentication Endpoint: /backend/php/auth/login.php
 * Strictly handles authentication processing, credential verification, and session creation.
 * Returns consistent JSON response for API calls, or redirects for traditional form submissions.
 */

namespace Backend\Auth;

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../database/database.php';
require_once __DIR__ . '/../utils/functions.php';

use function Backend\Database\getDb;
use function Backend\Utils\sendJsonResponse;
use function Backend\Utils\isJsonRequest;
use function Backend\Utils\verifyCsrf;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(false, [
        'code' => 'METHOD_NOT_ALLOWED',
        'message' => 'Only POST requests are supported for authentication.'
    ], 405);
}

if (!isJsonRequest() && !verifyCsrf($_POST['csrf_token'] ?? null)) {
    header('Location: /frontend/php/admin/login.php?error=' . urlencode('Security token mismatch.'));
    exit;
}

// Extract credentials from JSON or POST body
$input = [];
if (isJsonRequest()) {
    $raw = file_get_contents('php://input');
    $input = json_decode($raw ?: '{}', true) ?: [];
} else {
    $input = $_POST;
}

$email = trim((string)($input['email'] ?? $input['username'] ?? ''));
$password = trim((string)($input['password'] ?? ''));

if (empty($email) || empty($password)) {
    if (isJsonRequest()) {
        sendJsonResponse(false, [
            'code' => 'VALIDATION_ERROR',
            'message' => 'Email/username and password are required.'
        ], 400);
    } else {
        header('Location: /frontend/php/admin/login.php?error=' . urlencode('Please enter both email and password.'));
        exit;
    }
}

// Authenticate against the configured database only; never fall back to published credentials.
$authenticated = false;
$userRole = 'admin';

$pdo = getDb();
if ($pdo !== null) {
    try {
        $stmt = $pdo->prepare('SELECT id, username, password_hash, full_name FROM admin_users WHERE username = :username LIMIT 1');
        $stmt->execute(['username' => $email]);
        $user = $stmt->fetch();
        if ($user && password_verify($password, $user['password_hash'])) {
            $authenticated = true;
            $userRole = 'admin';
        }
    } catch (\PDOException $e) {
        error_log("[Auth DB Query Error] " . $e->getMessage());
    }
}

if ($authenticated) {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    $_SESSION['is_admin'] = true;
    $_SESSION['admin_email'] = $email;
    $_SESSION['admin_role'] = $userRole;
    $_SESSION['auth_time'] = time();

    if (isJsonRequest()) {
        sendJsonResponse(true, [
            'authenticated' => true,
            'role' => $userRole,
            'email' => $email,
            'redirect' => '/frontend/php/admin/dashboard.php'
        ]);
    } else {
        header('Location: /frontend/php/admin/dashboard.php');
        exit;
    }
} else {
    if (isJsonRequest()) {
        sendJsonResponse(false, [
            'code' => 'INVALID_CREDENTIALS',
            'message' => 'Invalid email or password.'
        ], 401);
    } else {
        header('Location: /frontend/php/admin/login.php?error=' . urlencode('Invalid administrative credentials.'));
        exit;
    }
}
