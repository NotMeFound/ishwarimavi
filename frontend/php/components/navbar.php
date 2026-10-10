<?php
declare(strict_types=1);

namespace App\Components;

use App\Context\AppControl;

$app = AppControl::getInstance();
$isNp = $app->isNepali();

$currentUri = $_SERVER['REQUEST_URI'] ?? '/';
$activePage = basename(parse_url($currentUri, PHP_URL_PATH) ?: 'index.php');
if ($activePage === '' || $activePage === 'index.php') {
    $activePage = 'home';
} else {
    $activePage = str_replace('.php', '', $activePage);
}

$navItems = [
    ['id' => 'home', 'url' => '/', 'en' => 'Home', 'np' => 'गृहपृष्ठ'],
    ['id' => 'about', 'url' => '/about.php', 'en' => 'About Us', 'np' => 'हाम्रो बारेमा'],
    ['id' => 'academics', 'url' => '/academics.php', 'en' => 'Academics', 'np' => 'शैक्षिक कार्यक्रम'],
    ['id' => 'facilities', 'url' => '/facilities.php', 'en' => 'Facilities', 'np' => 'पूर्वाधार'],
    ['id' => 'staff', 'url' => '/staff.php', 'en' => 'Faculty & Staff', 'np' => 'शिक्षक तथा कर्मचारी'],
    ['id' => 'notices', 'url' => '/notices.php', 'en' => 'Notice Board', 'np' => 'सूचना पाटी'],
    ['id' => 'events', 'url' => '/events.php', 'en' => 'Events', 'np' => 'कार्यक्रम'],
    ['id' => 'achievements', 'url' => '/achievements.php', 'en' => 'Achievements', 'np' => 'उपलब्धि'],
    ['id' => 'history', 'url' => '/history.php', 'en' => 'History', 'np' => 'इतिहास'],
    ['id' => 'documents', 'url' => '/documents.php', 'en' => 'Documents', 'np' => 'कागजात'],
    ['id' => 'gallery', 'url' => '/gallery.php', 'en' => 'Gallery', 'np' => 'तस्बिर'],
    ['id' => 'community', 'url' => '/community.php', 'en' => 'Community', 'np' => 'समुदाय'],
    ['id' => 'contact', 'url' => '/contact.php', 'en' => 'Contact', 'np' => 'सम्पर्क'],
];
?>
<nav class="w-full bg-slate-900 border-b border-slate-800 text-slate-200 sticky top-14 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-11">
            <!-- Desktop Navigation Grid -->
            <div class="hidden lg:flex items-center space-x-1 overflow-x-auto no-scrollbar">
                <?php foreach ($navItems as $item): ?>
                    <?php 
                        $isActive = ($activePage === $item['id']) || ($item['id'] === 'home' && ($activePage === 'home' || $activePage === 'index'));
                    ?>
                    <a href="<?= $item['url'] ?>" class="px-2.5 py-1.5 rounded text-[13px] font-medium transition-colors whitespace-nowrap <?= $isActive ? 'bg-amber-500 text-slate-950 font-semibold' : 'text-slate-300 hover:text-white hover:bg-slate-800' ?>">
                        <?= $app->e($app->t($item['en'], $item['np'])) ?>
                    </a>
                <?php endforeach; ?>
            </div>

            <!-- Mobile Menu Toggle Button -->
            <div class="flex items-center lg:hidden w-full justify-between py-1">
                <span class="text-xs font-medium text-amber-400">
                    <?= $app->t('Menu: ' . ucfirst($activePage), 'मेनु: ' . ($navItems[array_search($activePage, array_column($navItems, 'id'))]['np'] ?? 'गृहपृष्ठ')) ?>
                </span>
                <button type="button" onclick="document.getElementById('mobile-drawer').classList.toggle('hidden')" class="p-1.5 rounded-md bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700" aria-label="Open Navigation Menu">
                    <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                </button>
            </div>
        </div>
    </div>

    <!-- Mobile Drawer Dropdown -->
    <div id="mobile-drawer" class="hidden lg:hidden bg-slate-950 border-b border-slate-800 px-4 pt-2 pb-4 space-y-1">
        <?php foreach ($navItems as $item): ?>
            <?php $isActive = ($activePage === $item['id']); ?>
            <a href="<?= $item['url'] ?>" class="block px-3 py-2 rounded text-sm font-medium <?= $isActive ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-300 hover:bg-slate-800 hover:text-white' ?>">
                <?= $app->e($app->t($item['en'], $item['np'])) ?>
            </a>
        <?php endforeach; ?>
        <div class="pt-2 border-t border-slate-800">
            <a href="/admin.php" class="block px-3 py-2 rounded text-sm font-semibold text-amber-400 hover:bg-slate-800">
                🔒 <?= $app->t('Admin Management Portal', 'प्रशासनिक व्यवस्थापन पोर्टल') ?>
            </a>
        </div>
    </div>
</nav>
