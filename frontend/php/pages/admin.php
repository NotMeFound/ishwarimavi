<?php
declare(strict_types=1);

namespace App\Views;

use App\Context\AppControl;
use App\Data\DataBridge;

$app = AppControl::getInstance();
$csrfToken = $app->getCsrfToken();

if (session_status() === PHP_SESSION_NONE) {
    @session_start();
}

$isAdmin = !empty($_SESSION['is_admin']);
$loginError = null;
$actionMessage = null;

// Brute-force rate limiting
if (!isset($_SESSION['login_attempts'])) {
    $_SESSION['login_attempts'] = 0;
    $_SESSION['last_attempt_time'] = time();
}

// Reset after 60s
if (time() - $_SESSION['last_attempt_time'] > 60) {
    $_SESSION['login_attempts'] = 0;
}

// Handle Login
if (isset($_POST['action']) && $_POST['action'] === 'login') {
    if ($_SESSION['login_attempts'] >= 5) {
        $loginError = "Too many failed attempts. Security lockout active. Please wait 60 seconds.";
    } elseif (!$app->verifyCsrf($_POST['csrf_token'] ?? '')) {
        $loginError = "Security token mismatch.";
    } else {
        $username = trim((string)($_POST['username'] ?? ''));
        $password = trim((string)($_POST['password'] ?? ''));

        // Default secure credential
        if ($username === 'admin@ishwari.edu.np' && $password === 'admin123') {
            $_SESSION['is_admin'] = true;
            $_SESSION['login_attempts'] = 0;
            $isAdmin = true;
        } else {
            $_SESSION['login_attempts']++;
            $_SESSION['last_attempt_time'] = time();
            $remaining = 5 - $_SESSION['login_attempts'];
            $loginError = "Invalid administrative credentials. ({$remaining} attempts remaining before lockout).";
        }
    }
}

// Handle Logout
if (isset($_GET['act']) && $_GET['act'] === 'logout') {
    $_SESSION['is_admin'] = false;
    $isAdmin = false;
    header('Location: /admin.php');
    exit;
}

// Handle CRUD operations if Admin
if ($isAdmin && $_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    if ($action === 'create_notice' && $app->verifyCsrf($_POST['csrf_token'] ?? '')) {
        $newNotice = [
            'title_en' => trim((string)$_POST['title_en']),
            'title_np' => trim((string)$_POST['title_np']),
            'date_en' => date('M d, Y'),
            'date_np' => '२०८३ भाद्र २०',
            'category' => $_POST['category'] ?? 'academic',
            'pinned' => !empty($_POST['pinned']),
            'file_name' => 'official_circular_' . time() . '.pdf',
            'description_en' => trim((string)$_POST['description_en']),
            'description_np' => trim((string)$_POST['description_np']),
        ];
        DataBridge::addNotice($newNotice);
        $actionMessage = "Notice successfully published to the live public bulletin board!";
    } elseif ($action === 'delete_notice' && $app->verifyCsrf($_POST['csrf_token'] ?? '')) {
        $id = (int)$_POST['notice_id'];
        DataBridge::deleteNotice($id);
        $actionMessage = "Notice ID #{$id} has been permanently removed.";
    } elseif ($action === 'update_settings' && $app->verifyCsrf($_POST['csrf_token'] ?? '')) {
        $updates = [
            'phone' => trim((string)$_POST['phone']),
            'email' => trim((string)$_POST['email']),
            'principal_message_en' => trim((string)$_POST['principal_message_en']),
            'principal_message_np' => trim((string)$_POST['principal_message_np']),
        ];
        DataBridge::updateSchool($updates);
        $actionMessage = "School institutional settings updated in real-time.";
    }
}

$data = DataBridge::get();
$notices = $data['notices'];
$school = $data['school'];
?>
<div class="py-12 bg-white dark:bg-slate-950">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <?php if (!$isAdmin): ?>
            <!-- Login Form -->
            <div class="max-w-md mx-auto p-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-md space-y-6">
                <div class="text-center space-y-2">
                    <div class="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 mx-auto flex items-center justify-center text-2xl font-bold">
                        🔒
                    </div>
                    <h1 class="text-xl font-bold text-slate-900 dark:text-white"><?= $app->t('Administrative Management Portal', 'प्रशासनिक व्यवस्थापन पोर्टल लगइन') ?></h1>
                    <p class="text-xs text-slate-500"><?= $app->t('Authorized staff authentication only. All attempts are monitored.', 'अधिकृत विद्यालय प्रशासनका लागि मात्र सुरक्षित पहुँच।') ?></p>
                </div>

                <?php if ($loginError): ?>
                    <div class="p-3 rounded bg-red-50 dark:bg-red-950/40 border border-red-500/30 text-red-700 dark:text-red-300 text-xs">
                        <?= $app->e($loginError) ?>
                    </div>
                <?php endif; ?>

                <form action="/admin.php" method="POST" class="space-y-4 text-xs">
                    <input type="hidden" name="action" value="login">
                    <input type="hidden" name="csrf_token" value="<?= $app->e($csrfToken) ?>">

                    <div class="space-y-1">
                        <label class="font-semibold text-slate-700 dark:text-slate-300">Admin Email</label>
                        <input type="email" name="username" value="admin@ishwari.edu.np" required class="w-full px-3 py-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500">
                    </div>

                    <div class="space-y-1">
                        <label class="font-semibold text-slate-700 dark:text-slate-300">Master Password</label>
                        <input type="password" name="password" value="admin123" required class="w-full px-3 py-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500">
                    </div>

                    <div class="pt-2">
                        <button type="submit" class="w-full py-2.5 rounded font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-sm">
                            Authenticate to Dashboard →
                        </button>
                    </div>

                    <div class="p-3 rounded bg-slate-100 dark:bg-slate-800 text-[11px] text-slate-500">
                        <p class="font-semibold text-slate-700 dark:text-slate-300">Demo Administrative Credentials:</p>
                        <p>User: <code>admin@ishwari.edu.np</code></p>
                        <p>Pass: <code>admin123</code></p>
                    </div>
                </form>
            </div>
        <?php else: ?>
            <!-- Authenticated Admin Dashboard -->
            <div class="space-y-8">
                <div class="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4">
                    <div>
                        <span class="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">Authenticated CMS Session</span>
                        <h1 class="text-2xl font-bold text-slate-900 dark:text-white">Admin Control Dashboard</h1>
                    </div>
                    <div class="flex items-center gap-3">
                        <a href="/ishwari-ma-vi-final.zip" download class="px-3 py-1.5 rounded text-xs font-semibold bg-slate-800 text-white hover:bg-slate-700 transition">
                            📦 Download Project (.ZIP)
                        </a>
                        <a href="/admin.php?act=logout" class="px-3 py-1.5 rounded text-xs font-semibold bg-red-600 text-white hover:bg-red-500 transition">
                            Sign Out
                        </a>
                    </div>
                </div>

                <?php if ($actionMessage): ?>
                    <div class="p-4 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs">
                        ✓ <?= $app->e($actionMessage) ?>
                    </div>
                <?php endif; ?>

                <!-- Admin Metrics -->
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div class="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <div class="text-2xl font-bold text-slate-900 dark:text-white"><?= count($notices) ?></div>
                        <div class="text-xs text-slate-500">Published Notices</div>
                    </div>
                    <div class="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <div class="text-2xl font-bold text-slate-900 dark:text-white"><?= count($data['staff']) ?></div>
                        <div class="text-xs text-slate-500">Faculty Profiles</div>
                    </div>
                    <div class="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <div class="text-2xl font-bold text-slate-900 dark:text-white"><?= count($data['facilities']) ?></div>
                        <div class="text-xs text-slate-500">Campus Facilities</div>
                    </div>
                    <div class="p-4 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <div class="text-2xl font-bold text-slate-900 dark:text-white"><?= count($data['events']) ?></div>
                        <div class="text-xs text-slate-500">Scheduled Events</div>
                    </div>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <!-- Create Notice Form (6 cols) -->
                    <div class="lg:col-span-6 p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                        <h2 class="text-base font-bold text-slate-900 dark:text-white">Publish New Public Notice</h2>
                        <form action="/admin.php" method="POST" class="space-y-3 text-xs">
                            <input type="hidden" name="action" value="create_notice">
                            <input type="hidden" name="csrf_token" value="<?= $app->e($csrfToken) ?>">

                            <div class="space-y-1">
                                <label class="font-semibold text-slate-700 dark:text-slate-300">Notice Title (English)</label>
                                <input type="text" name="title_en" required placeholder="e.g. Science Exhibition Results Announced" class="w-full px-3 py-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                            </div>

                            <div class="space-y-1">
                                <label class="font-semibold text-slate-700 dark:text-slate-300">Notice Title (नेपाली)</label>
                                <input type="text" name="title_np" required placeholder="उदा: विज्ञान प्रदर्शनीको नतिजा प्रकाशित गरिएको सम्बन्धमा" class="w-full px-3 py-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                            </div>

                            <div class="grid grid-cols-2 gap-3">
                                <div class="space-y-1">
                                    <label class="font-semibold text-slate-700 dark:text-slate-300">Category</label>
                                    <select name="category" class="w-full px-3 py-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                                        <option value="academic">Academic</option>
                                        <option value="exam">Examination</option>
                                        <option value="scholarship">Scholarship</option>
                                        <option value="admin">Administrative</option>
                                    </select>
                                </div>
                                <div class="flex items-center gap-2 pt-6">
                                    <input type="checkbox" id="pinned" name="pinned" value="1" class="rounded">
                                    <label for="pinned" class="font-semibold text-slate-700 dark:text-slate-300">Pin to Top Ticker</label>
                                </div>
                            </div>

                            <div class="space-y-1">
                                <label class="font-semibold text-slate-700 dark:text-slate-300">Notice Description (English)</label>
                                <textarea name="description_en" rows="2" required class="w-full px-3 py-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"></textarea>
                            </div>

                            <div class="space-y-1">
                                <label class="font-semibold text-slate-700 dark:text-slate-300">Notice Description (नेपाली)</label>
                                <textarea name="description_np" rows="2" required class="w-full px-3 py-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"></textarea>
                            </div>

                            <button type="submit" class="px-4 py-2 rounded font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition">
                                Publish Notice Instantly →
                            </button>
                        </form>
                    </div>

                    <!-- Manage Existing Notices (6 cols) -->
                    <div class="lg:col-span-6 p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                        <h2 class="text-base font-bold text-slate-900 dark:text-white">Active Notices (CRUD)</h2>
                        <div class="divide-y divide-slate-200 dark:divide-slate-800 max-h-96 overflow-y-auto pr-2 text-xs">
                            <?php foreach ($notices as $n): ?>
                                <div class="py-3 flex items-center justify-between gap-3">
                                    <div class="truncate">
                                        <p class="font-semibold text-slate-900 dark:text-white truncate"><?= $app->e($n['title_en']) ?></p>
                                        <p class="text-[11px] text-slate-400"><?= $app->e($n['date_en']) ?> • <?= strtoupper($n['category']) ?></p>
                                    </div>
                                    <form action="/admin.php" method="POST" onsubmit="return confirm('Are you sure you want to delete this notice?');">
                                        <input type="hidden" name="action" value="delete_notice">
                                        <input type="hidden" name="csrf_token" value="<?= $app->e($csrfToken) ?>">
                                        <input type="hidden" name="notice_id" value="<?= $n['id'] ?>">
                                        <button type="submit" class="text-red-500 hover:text-red-700 font-semibold px-2 py-1 bg-red-50 dark:bg-red-950/40 rounded">
                                            Delete
                                        </button>
                                    </form>
                                </div>
                            <?php endforeach; ?>
                        </div>
                    </div>
                </div>

                <!-- Update School Coordinates & Message -->
                <div class="p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4 text-xs">
                    <h2 class="text-base font-bold text-slate-900 dark:text-white">Update School Coordinates & Principal's Message</h2>
                    <form action="/admin.php" method="POST" class="space-y-4">
                        <input type="hidden" name="action" value="update_settings">
                        <input type="hidden" name="csrf_token" value="<?= $app->e($csrfToken) ?>">

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div class="space-y-1">
                                <label class="font-semibold text-slate-700 dark:text-slate-300">Official Phone</label>
                                <input type="text" name="phone" value="<?= $app->e($school['phone']) ?>" class="w-full px-3 py-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                            </div>
                            <div class="space-y-1">
                                <label class="font-semibold text-slate-700 dark:text-slate-300">Official Email</label>
                                <input type="email" name="email" value="<?= $app->e($school['email']) ?>" class="w-full px-3 py-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
                            </div>
                        </div>

                        <div class="space-y-1">
                            <label class="font-semibold text-slate-700 dark:text-slate-300">Principal's Message (English)</label>
                            <textarea name="principal_message_en" rows="3" class="w-full px-3 py-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"><?= $app->e($school['principal_message_en']) ?></textarea>
                        </div>

                        <div class="space-y-1">
                            <label class="font-semibold text-slate-700 dark:text-slate-300">Principal's Message (नेपाली)</label>
                            <textarea name="principal_message_np" rows="3" class="w-full px-3 py-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700"><?= $app->e($school['principal_message_np']) ?></textarea>
                        </div>

                        <button type="submit" class="px-5 py-2.5 rounded font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition">
                            Save Institutional Settings
                        </button>
                    </form>
                </div>
            </div>
        <?php endif; ?>
    </div>
</div>
