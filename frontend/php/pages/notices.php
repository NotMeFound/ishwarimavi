<?php
declare(strict_types=1);

namespace App\Views;

use App\Context\AppControl;

$app = AppControl::getInstance();
$notices = $app->getData()['notices'];

$selectedCategory = $_GET['cat'] ?? 'all';
$selectedId = isset($_GET['id']) ? (int)$_GET['id'] : null;

$filteredNotices = $notices;
if ($selectedCategory !== 'all') {
    $filteredNotices = array_values(array_filter($notices, fn($n) => $n['category'] === $selectedCategory));
}

$categories = [
    'all' => ['en' => 'All Notices', 'np' => 'सबै सूचनाहरू'],
    'academic' => ['en' => 'Academic', 'np' => 'शैक्षिक'],
    'exam' => ['en' => 'Examinations', 'np' => 'परीक्षा'],
    'scholarship' => ['en' => 'Scholarships', 'np' => 'छात्रवृत्ति'],
    'admin' => ['en' => 'Administrative', 'np' => 'प्रशासनिक'],
];
?>
<div class="py-12 bg-white dark:bg-slate-950">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div class="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
                <span class="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400"><?= $app->t('Public Circulars', 'सार्वजनिक सूचना पाटी') ?></span>
                <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white mt-1"><?= $app->t('Official Bulletin & Notices', 'आधिकारिक सूचना तथा परिपत्रहरू') ?></h1>
            </div>
            <!-- Category Pills -->
            <div class="flex items-center gap-1.5 flex-wrap">
                <?php foreach ($categories as $k => $c): ?>
                    <a href="?cat=<?= $k ?>" class="px-3 py-1.5 rounded text-xs font-medium transition <?= $selectedCategory === $k ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700' ?>">
                        <?= $app->e($app->t($c['en'], $c['np'])) ?>
                    </a>
                <?php endforeach; ?>
            </div>
        </div>

        <!-- Notices Listing -->
        <div class="space-y-4">
            <?php if (empty($filteredNotices)): ?>
                <div class="p-12 text-center text-slate-500 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <?= $app->t('No notices published under this category.', 'यस विधामा कुनै सूचना प्रकाशित गरिएको छैन।') ?>
                </div>
            <?php else: ?>
                <?php foreach ($filteredNotices as $notice): ?>
                    <article class="p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-3">
                        <div class="flex flex-wrap items-center justify-between gap-2">
                            <div class="flex items-center gap-2">
                                <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                                    <?= strtoupper($notice['category']) ?>
                                </span>
                                <?php if ($notice['pinned']): ?>
                                    <span class="text-[10px] bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400 px-1.5 py-0.5 rounded font-bold uppercase">PINNED NOTICE</span>
                                <?php endif; ?>
                            </div>
                            <span class="text-xs text-slate-500 font-mono">📅 <?= $app->e($app->t($notice['date_en'], $notice['date_np'])) ?></span>
                        </div>

                        <h2 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-snug">
                            <?= $app->e($app->t($notice['title_en'], $notice['title_np'])) ?>
                        </h2>

                        <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                            <?= $app->e($app->t($notice['description_en'], $notice['description_np'])) ?>
                        </p>

                        <div class="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs">
                            <span class="text-slate-400 font-mono text-[11px]">Attachment: <?= $app->e($notice['file_name']) ?></span>
                            <a href="#" onclick="alert('Downloading official certified document: <?= $app->e($notice['file_name']) ?>'); return false;" class="inline-flex items-center gap-1 font-semibold text-amber-600 dark:text-amber-400 hover:underline">
                                <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                <span><?= $app->t('Download PDF', 'कागजात डाउनलोड') ?></span>
                            </a>
                        </div>
                    </article>
                <?php endforeach; ?>
            <?php endif; ?>
        </div>
    </div>
</div>
