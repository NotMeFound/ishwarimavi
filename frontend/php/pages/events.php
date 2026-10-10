<?php
declare(strict_types=1);

namespace App\Views;

use App\Context\AppControl;

$app = AppControl::getInstance();
$events = $app->getData()['events'];
?>
<div class="py-12 bg-white dark:bg-slate-950">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div class="border-b border-slate-200 dark:border-slate-800 pb-6">
            <span class="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400"><?= $app->t('Academic Calendar', 'वार्षिक शैक्षिक क्यालेन्डर') ?></span>
            <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white mt-1"><?= $app->t('Institutional Events & Routines', 'कार्यक्रम तथा अतिरिक्त क्रियाकलाप') ?></h1>
            <p class="text-sm text-slate-500 mt-2 max-w-3xl leading-relaxed">
                <?= $app->t('Key dates for examinations, cultural assemblies, athletics championships, and community exhibitions.', 'परीक्षा, सांस्कृतिक कार्यक्रम, खेलकुद सप्ताह र अभिभावक भेलाहरूको कार्यतालिका।') ?>
            </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <?php foreach ($events as $event): ?>
                <div class="p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-3">
                    <div class="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-semibold">
                        <span>📅 <?= $app->e($app->t($event['date_en'], $event['date_np'])) ?></span>
                        <span class="font-mono">🕒 <?= $event['time'] ?></span>
                    </div>
                    <h2 class="text-base font-bold text-slate-900 dark:text-white">
                        <?= $app->e($app->t($event['title_en'], $event['title_np'])) ?>
                    </h2>
                    <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        <?= $app->e($app->t($event['desc_en'], $event['desc_np'])) ?>
                    </p>
                    <div class="text-[11px] text-slate-500 pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-1.5">
                        <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span><?= $app->e($app->t($event['venue_en'], $event['venue_np'])) ?></span>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</div>
