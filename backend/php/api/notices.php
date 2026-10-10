<?php
declare(strict_types=1);

/**
 * Backend Notices API Endpoint: /backend/php/api/notices.php
 * Handles notice listing, creation, and persistence.
 * Returns consistent JSON response.
 */

namespace Backend\Api;

require_once __DIR__ . '/../config/config.php';
require_once __DIR__ . '/../database/database.php';
require_once __DIR__ . '/../utils/functions.php';

use function Backend\Database\getDb;
use function Backend\Utils\sendJsonResponse;
use function Backend\Utils\isJsonRequest;

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // List notices
    $pdo = getDb();
    if ($pdo !== null) {
        try {
            $stmt = $pdo->query('SELECT * FROM notices ORDER BY published_date DESC, id DESC LIMIT 50');
            $notices = $stmt->fetchAll();
            sendJsonResponse(true, ['notices' => $notices]);
        } catch (\PDOException $e) {
            error_log('[Notices Query Error] ' . $e->getMessage());
        }
    }

    // JSON file fallback
    $jsonPath = __DIR__ . '/../../database/cms_database.json';
    if (file_exists($jsonPath)) {
        $content = json_decode(file_get_contents($jsonPath), true);
        sendJsonResponse(true, ['notices' => $content['notices'] ?? []]);
    }

    sendJsonResponse(true, ['notices' => []]);
}

if ($method === 'POST') {
    // Auth guard check
    if (empty($_SESSION['is_admin'])) {
        if (isJsonRequest()) {
            sendJsonResponse(false, ['code' => 'UNAUTHORIZED', 'message' => 'Admin authentication required.'], 401);
        } else {
            header('Location: /frontend/php/admin/login.php');
            exit;
        }
    }

    $input = isJsonRequest() ? (json_decode(file_get_contents('php://input'), true) ?: []) : $_POST;

    $title = trim((string)($input['title'] ?? ''));
    $titleNp = trim((string)($input['title_np'] ?? $title));
    $content = trim((string)($input['content'] ?? ''));
    $category = trim((string)($input['category'] ?? 'academic'));

    if (empty($title) || empty($content)) {
        if (isJsonRequest()) {
            sendJsonResponse(false, ['code' => 'VALIDATION_ERROR', 'message' => 'Title and content are required.'], 400);
        } else {
            header('Location: /frontend/php/admin/notices.php?error=' . urlencode('Title and content are required.'));
            exit;
        }
    }

    $newNotice = [
        'id' => (string)time(),
        'title' => $title,
        'title_np' => $titleNp,
        'content' => $content,
        'category' => $category,
        'published_date' => date('Y-m-d'),
        'published_date_bs' => '२०८१',
        'is_pinned' => false,
        'status' => 'published'
    ];

    // Persist to database if available
    $pdo = getDb();
    if ($pdo !== null) {
        try {
            $stmt = $pdo->prepare('INSERT INTO notices (title, title_np, content, category, published_date) VALUES (:title, :title_np, :content, :category, :published_date)');
            $stmt->execute([
                'title' => $title,
                'title_np' => $titleNp,
                'content' => $content,
                'category' => $category,
                'published_date' => $newNotice['published_date']
            ]);
        } catch (\PDOException $e) {
            error_log('[Notice Insert Error] ' . $e->getMessage());
        }
    }

    // Persist to JSON DB
    $jsonPath = __DIR__ . '/../../database/cms_database.json';
    if (file_exists($jsonPath)) {
        $data = json_decode(file_get_contents($jsonPath), true) ?: [];
        if (!isset($data['notices']) || !is_array($data['notices'])) {
            $data['notices'] = [];
        }
        array_unshift($data['notices'], $newNotice);
        $data['version'] = ($data['version'] ?? 0) + 1;
        $data['lastModified'] = date('c');
        file_put_contents($jsonPath, json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    }

    if (isJsonRequest()) {
        sendJsonResponse(true, ['notice' => $newNotice, 'message' => 'Notice published successfully.']);
    } else {
        header('Location: /frontend/php/admin/notices.php?msg=' . urlencode('Notice published successfully.'));
        exit;
    }
}

sendJsonResponse(false, ['code' => 'METHOD_NOT_ALLOWED', 'message' => 'Unsupported HTTP method.'], 405);
