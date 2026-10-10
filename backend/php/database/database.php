<?php
declare(strict_types=1);

/**
 * Backend Database Access Layer
 * Manages PDO MySQL connections and transactions.
 */

namespace Backend\Database;

use PDO;
use PDOException;

require_once __DIR__ . '/../config/config.php';

function getDb(): ?PDO {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $pdo = new PDO($dsn, DB_USER, DB_PASS, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]);
        } catch (PDOException $e) {
            // Log connection error server-side, do not leak credentials to client
            error_log("[Database Connection Error] " . $e->getMessage());
            return null;
        }
    }
    return $pdo;
}
