<?php
declare(strict_types=1);

/**
 * Backend Security and Core Helper Functions
 */

namespace Backend\Utils;

require_once __DIR__ . '/../config/config.php';

function getCsrfToken(): string {
    if (empty($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf_token'];
}

function verifyCsrf(?string $token): bool {
    return !empty($token) && !empty($_SESSION['csrf_token']) && hash_equals($_SESSION['csrf_token'], $token);
}

function sendJsonResponse(bool $success, mixed $dataOrError, int $statusCode = 200): void {
    http_response_code($statusCode);
    header('Content-Type: application/json; charset=utf-8');
    if ($success) {
        echo json_encode([
            'success' => true,
            'data' => $dataOrError,
            'message' => 'Operation completed successfully'
        ], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode([
            'success' => false,
            'error' => is_array($dataOrError) ? $dataOrError : [
                'code' => 'ERROR',
                'message' => (string)$dataOrError
            ]
        ], JSON_UNESCAPED_UNICODE);
    }
    exit;
}

function isJsonRequest(): bool {
    $contentType = $_SERVER['CONTENT_TYPE'] ?? $_SERVER['HTTP_CONTENT_TYPE'] ?? '';
    $accept = $_SERVER['HTTP_ACCEPT'] ?? '';
    return str_contains($contentType, 'application/json') || str_contains($accept, 'application/json');
}
