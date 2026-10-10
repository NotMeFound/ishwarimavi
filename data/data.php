<?php
declare(strict_types=1);

namespace App\Data;

class DataBridge {
    private static ?array $cachedData = null;

    public static function get(): array {
        if (self::$cachedData === null) {
            $dataFile = __DIR__ . '/initialdata.php';
            if (file_exists($dataFile)) {
                self::$cachedData = require $dataFile;
            } else {
                self::$cachedData = [];
            }
        }
        return self::$cachedData;
    }

    public static function updateSchool(array $newFields): bool {
        $data = self::get();
        foreach ($newFields as $k => $v) {
            $data['school'][$k] = $v;
        }
        self::$cachedData = $data;
        $export = "<?php\ndeclare(strict_types=1);\n\nnamespace App\Data;\n\nreturn " . var_export($data, true) . ";\n";
        return file_put_contents(__DIR__ . '/initialdata.php', $export) !== false;
    }

    public static function addNotice(array $notice): bool {
        $data = self::get();
        $notice['id'] = time();
        array_unshift($data['notices'], $notice);
        self::$cachedData = $data;
        $export = "<?php\ndeclare(strict_types=1);\n\nnamespace App\Data;\n\nreturn " . var_export($data, true) . ";\n";
        return file_put_contents(__DIR__ . '/initialdata.php', $export) !== false;
    }

    public static function deleteNotice(int $id): bool {
        $data = self::get();
        $data['notices'] = array_values(array_filter($data['notices'], fn($n) => (int)$n['id'] !== $id));
        self::$cachedData = $data;
        $export = "<?php\ndeclare(strict_types=1);\n\nnamespace App\Data;\n\nreturn " . var_export($data, true) . ";\n";
        return file_put_contents(__DIR__ . '/initialdata.php', $export) !== false;
    }
}
