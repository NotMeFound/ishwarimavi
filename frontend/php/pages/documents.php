<?php
declare(strict_types=1);

namespace App\Views;

use App\Context\AppControl;

$app = AppControl::getInstance();
$docs = $app->getData()['documents'];
?>
<div class="py-12 bg-white dark:bg-slate-950">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div class="border-b border-slate-200 dark:border-slate-800 pb-6">
            <span class="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400"><?= $app->t('Public Repository', 'सार्वजनिक अभिलेख') ?></span>
            <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white mt-1"><?= $app->t('Official Documents & Citizen Charter', 'आधिकारिक कागजात तथा नागरिक बडापत्र') ?></h1>
            <p class="text-sm text-slate-500 mt-2 max-w-3xl leading-relaxed">
                <?= $app->t('Download certified admission applications, scholarship forms, social audit publications, and institutional charters.', 'भर्ना फारम, छात्रवृत्ति निवेदन, सामाजिक परीक्षण प्रतिवेदन तथा विद्यालयको नागरिक बडापत्र यहाँबाट डाउनलोड गर्नुहोस्।') ?>
            </p>
        </div>

        <div class="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
            <?php foreach ($docs as $doc): ?>
                <div class="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                    <div class="flex items-start gap-3">
                        <div class="w-10 h-10 rounded bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center font-bold shrink-0">
                            📄
                        </div>
                        <div>
                            <h2 class="text-sm font-bold text-slate-900 dark:text-white">
                                <?= $app->e($app->t($doc['title_en'], $doc['title_np'])) ?>
                            </h2>
                            <div class="flex items-center gap-2 text-[11px] text-slate-500 font-mono mt-0.5">
                                <span><?= $doc['type'] ?></span>
                                <span>•</span>
                                <span><?= $doc['size'] ?></span>
                                <span>•</span>
                                <span><?= $doc['date'] ?></span>
                            </div>
                        </div>
                    </div>

                    <a href="#" onclick="alert('Downloading: <?= $app->e($app->t($doc['title_en'], $doc['title_np'])) ?> (PDF Document)'); return false;" class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 transition shrink-0">
                        <svg class="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span><?= $app->t('Download File', 'डाउनलोड गर्नुहोस्') ?></span>
                    </a>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</div>
