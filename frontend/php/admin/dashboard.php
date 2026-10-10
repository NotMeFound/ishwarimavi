<?php
declare(strict_types=1);

/**
 * Frontend Admin Dashboard View
 * Displays institutional overview and navigation.
 * Auth verification handled via session check.
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

if (empty($_SESSION['is_admin'])) {
    header('Location: login.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Dashboard | Ishwari Secondary School</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen">
    <nav class="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div class="flex items-center space-x-3">
            <span class="w-8 h-8 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-bold">ई</span>
            <span class="font-bold text-sm">Ishwari School CMS</span>
        </div>
        <div class="flex items-center space-x-4 text-xs">
            <a href="notices.php" class="text-slate-300 hover:text-white">Manage Notices</a>
            <a href="settings.php" class="text-slate-300 hover:text-white">Settings</a>
            <a href="/index.php" class="text-amber-400 hover:underline">View Live Site</a>
            <!-- Sign out links to backend auth logout handler -->
            <a href="/backend/php/auth/logout.php" class="text-red-400 hover:underline">Sign Out</a>
        </div>
    </nav>

    <div class="max-w-7xl mx-auto px-6 py-8 space-y-8">
        <div class="border-b border-slate-800 pb-4">
            <h1 class="text-2xl font-bold">Institutional Overview</h1>
            <p class="text-xs text-slate-400 mt-1">Real-time content management & portal status</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center">
            <div class="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div class="text-3xl font-bold text-amber-400">12</div>
                <div class="text-xs text-slate-400 mt-1">Live Notices</div>
            </div>
            <div class="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div class="text-3xl font-bold text-amber-400">52</div>
                <div class="text-xs text-slate-400 mt-1">Staff Profiles</div>
            </div>
            <div class="p-6 rounded-lg bg-slate-800 border border-slate-700">
                <div class="text-3xl font-bold text-amber-400">100%</div>
                <div class="text-xs text-slate-400 mt-1">System Operational</div>
            </div>
        </div>

        <div class="p-6 rounded-lg bg-slate-800 border border-slate-700 space-y-3">
            <h2 class="text-base font-bold">Quick Administrative Actions</h2>
            <div class="flex flex-wrap gap-3 text-xs">
                <a href="notices.php" class="px-4 py-2 rounded bg-amber-500 text-slate-950 font-semibold hover:bg-amber-400 transition">
                    + Publish Circular Notice
                </a>
                <a href="settings.php" class="px-4 py-2 rounded bg-slate-700 text-white hover:bg-slate-600 transition">
                    ⚙ Edit School Metadata & Contacts
                </a>
            </div>
        </div>
    </div>
</body>
</html>
