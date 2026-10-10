<?php
declare(strict_types=1);

/**
 * Frontend Admin Login View
 * Displays institutional authentication interface.
 * Form submits to /backend/php/auth/login.php
 */

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// If already authenticated by backend session, forward to dashboard
if (!empty($_SESSION['is_admin'])) {
    header('Location: dashboard.php');
    exit;
}

$error = isset($_GET['error']) ? htmlspecialchars((string)$_GET['error'], ENT_QUOTES, 'UTF-8') : null;
$message = isset($_GET['message']) ? htmlspecialchars((string)$_GET['message'], ENT_QUOTES, 'UTF-8') : null;
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Admin Login | Ishwari Secondary School</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-slate-900 text-slate-100 min-h-screen flex items-center justify-center p-4">
    <div class="max-w-sm w-full p-8 rounded-lg bg-slate-800 border border-slate-700 shadow-xl space-y-6">
        <div class="text-center space-y-2">
            <div class="w-12 h-12 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center mx-auto text-xl font-bold">
                🔒
            </div>
            <h1 class="text-xl font-bold">Admin Portal</h1>
            <p class="text-xs text-slate-400">Ishwari Secondary School CMS</p>
        </div>

        <?php if ($error): ?>
            <div class="p-3 rounded bg-red-950/60 border border-red-500/40 text-red-300 text-xs">
                <?= $error ?>
            </div>
        <?php endif; ?>

        <?php if ($message): ?>
            <div class="p-3 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs">
                <?= $message ?>
            </div>
        <?php endif; ?>

        <!-- Form action points to backend authentication endpoint -->
        <form action="/backend/php/auth/login.php" method="POST" class="space-y-4 text-xs">
            <div class="space-y-1">
                <label class="text-slate-300 font-semibold">Email</label>
                <input type="email" name="email" value="admin@ishwari.edu.np" required class="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500">
            </div>
            <div class="space-y-1">
                <label class="text-slate-300 font-semibold">Password</label>
                <input type="password" name="password" required class="w-full px-3 py-2 rounded bg-slate-900 border border-slate-700 text-white focus:outline-none focus:border-amber-500">
            </div>
            <button type="submit" class="w-full py-2.5 rounded font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition cursor-pointer">
                Sign In to Dashboard →
            </button>
            <div class="p-2.5 rounded bg-slate-900 border border-slate-700/50 text-[11px] text-slate-400 text-center">
                Contact school IT administration for access credentials.
            </div>
        </form>
    </div>
</body>
</html>
