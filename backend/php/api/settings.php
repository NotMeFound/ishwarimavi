<?php
declare(strict_types=1);

/**
 * Backend Settings API Endpoint: /backend/php/api/settings.php
 * Handles updating institutional contact metadata and settings.
 * Returns consistent JSON response.
 */

namespace Backend\Api;

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../database/database.php';
require_once __DIR__ . '/../utils/functions.php';

use function Backend\Database\getDb;
use function Backend\Utils\sendJsonResponse;
use function Backend\Utils\isJsonRequest;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    sendJsonResponse(false, ['code' => 'METHOD_NOT_ALLOWED', 'message' => 'Only POST requests supported.'], 405);
}

if (empty($_SESSION['is_admin'])) {
    if (isJsonRequest()) {
        sendJsonResponse(false, ['code' => 'UNAUTHORIZED', 'message' => 'Admin authentication required.'], 401);
    } else {
        header('Location: /frontend/php/admin/login.php');
        exit;
    }
}

$input = isJsonRequest() ? (json_decode(file_get_contents('php://input'), true) ?: []) : $_POST;

$phone = trim((string)($input['phone'] ?? ''));
$email = trim((string)($input['email'] ?? ''));
$principalMsg = trim((string)($input['principal_message'] ?? ''));

// Update JSON state
$jsonPath = __DIR__ . '/../../database/cms_database.json';
if (file_exists($jsonPath)) {
    $data = json_decode(file_get_contents($jsonPath), true) ?: [];
    if (!isset($data['school']) || !is_array($data['school'])) {
        $data['school'] = [];
    }
    if ($phone) $data['school']['phone'] = $phone;
    if ($email) $data['school']['email'] = $email;
    if ($principalMsg) $data['school']['principal_message_en'] = $principalMsg;
    $data['version'] = ($data['version'] ?? 0) + 1;
    $data['lastModified'] = date('c');
    file_put_contents($jsonPath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
}

if (isJsonRequest()) {
    sendJsonResponse(true, ['message' => 'Institutional settings updated successfully.']);
} else {
    header('Location: /frontend/php/admin/settings.php?msg=' . urlencode('Settings successfully saved.'));
    exit;
}
