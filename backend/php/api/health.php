<?php
declare(strict_types=1);

/**
 * Backend Health API Endpoint: /backend/php/api/health.php
 * Strictly returns JSON status for monitors and load balancers.
 */

namespace Backend\Api;

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../database/database.php';
require_once __DIR__ . '/../utils/functions.php';

use function Backend\Database\getDb;
use function Backend\Utils\sendJsonResponse;

$dbConnected = false;
$pdo = getDb();
if ($pdo !== null) {
    try {
        $pdo->query('SELECT 1');
        $dbConnected = true;
    } catch (\Throwable $e) {
        $dbConnected = false;
    }
}

sendJsonResponse(true, [
    'status' => 'ok',
    'service' => 'Ishwari Secondary School PHP Backend',
    'timestamp' => date('c'),
    'database_connected' => $dbConnected
]);
