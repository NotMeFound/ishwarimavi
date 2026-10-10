<?php
declare(strict_types=1);

namespace Frontend;

require_once __DIR__ . '/../../backend/php/config/config.php';
require_once __DIR__ . '/../../backend/database/data.php';

use App\Data\DataBridge;

class AppKernel {
    public static function run(?string $viewName = null): void {
        $view = $viewName ?? ($_GET['page'] ?? 'home');
        $view = preg_replace('/[^a-zA-Z0-9_-]/', '', (string)$view);
        $viewFile = __DIR__ . '/pages/' . $view . '.php';
        if (!file_exists($viewFile)) {
            $view = 'home';
            $viewFile = __DIR__ . '/pages/home.php';
        }
        $data = DataBridge::get();
        require __DIR__ . '/layouts/app.php';
    }
}
