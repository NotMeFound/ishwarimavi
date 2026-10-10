<?php
declare(strict_types=1);

namespace App\Views;

require_once __DIR__ . '/../types.php';
require_once __DIR__ . '/../context/appcontrol.php';
require_once __DIR__ . '/../vite.config.php';

use App\Context\AppControl;
use App\Config\ViteConfig;

$app = AppControl::getInstance();

// Handle search API
if (isset($_GET['api']) && $_GET['api'] === 'search') {
    header('Content-Type: application/json');
    $query = (string)($_GET['q'] ?? '');
    echo json_encode($app->search($query));
    exit;
}

$page = $_GET['page'] ?? $_GET['view'] ?? $view ?? 'home';
$page = preg_replace('/[^a-zA-Z0-9_-]/', '', (string)$page);
$viewFile = __DIR__ . '/' . $page . '.php';

if (!file_exists($viewFile)) {
    $page = 'home';
    $viewFile = __DIR__ . '/home.php';
}

$isDark = $app->isDark();
$school = $app->getData()['school'];
$pageTitle = $app->t($school['name_en'], $school['name_np']) . ' | Official School Portal';
?>
<!DOCTYPE html>
<html lang="<?= $app->isNepali() ? 'ne' : 'en' ?>" class="<?= $isDark ? 'dark' : '' ?>">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= $app->e($pageTitle) ?></title>
    <meta name="description" content="<?= $app->e($app->t($school['tagline_en'], $school['tagline_np'])) ?>">
    <!-- Tailwind CSS & Professional Institutional Styling -->
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        institutional: {
                            50: '#f0f6fc',
                            100: '#e1ecf8',
                            600: '#123b5d',
                            700: '#0f2744',
                            800: '#0b192c',
                            900: '#07101d',
                        }
                    }
                }
            }
        }
    </script>
    <link rel="stylesheet" href="/frontend/php/assets/css/style.css">
    <style>
        body { font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; }
    </style>
</head>
<body class="bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-100 min-h-screen flex flex-col antialiased transition-colors duration-200">

    <!-- Institutional Header -->
    <?php require __DIR__ . '/../components/header.php'; ?>

    <!-- Navigation Grid -->
    <?php require __DIR__ . '/../components/navbar.php'; ?>

    <!-- Main View Content Area -->
    <main class="flex-grow">
        <?php require $viewFile; ?>
    </main>

    <!-- Global Accessible Search Modal -->
    <?php require __DIR__ . '/../components/searchmodal.php'; ?>

    <!-- Institutional Footer -->
    <?php require __DIR__ . '/../components/footer.php'; ?>

    <!-- Live Client JS Engine -->
    <script src="/frontend/php/assets/js/main.js"></script>
</body>
</html>
