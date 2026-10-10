<?php
declare(strict_types=1);

namespace App\Views;

use App\Context\AppControl;

$app = AppControl::getInstance();
$staff = $app->getData()['staff'];
?>
<div class="py-12 bg-white dark:bg-slate-950">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div class="border-b border-slate-200 dark:border-slate-800 pb-6">
            <span class="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400"><?= $app->t('Faculty Directory', 'शिक्षक तथा कर्मचारी विवरण') ?></span>
            <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white mt-1"><?= $app->t('Our Leadership & Educators', 'हाम्रा शिक्षक तथा नेतृत्व') ?></h1>
            <p class="text-sm text-slate-500 mt-2 max-w-3xl leading-relaxed">
                <?= $app->t('Meet our experienced and dedicated team of certified education officers, department heads, and instructors shaping young minds.', 'दक्ष, अनुभवी र समर्पित शिक्षक तथा प्रशासनिक कर्मचारीहरूको नेतृत्वमा अनुशासित शैक्षिक यात्रा।') ?>
            </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <?php foreach ($staff as $member): ?>
                <div class="p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-center space-y-3">
                    <div class="w-20 h-20 mx-auto rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-amber-500 flex items-center justify-center text-3xl shadow">
                        <?= $member['role'] === 'principal' ? '👨‍🏫' : '👩‍🏫' ?>
                    </div>
                    <div>
                        <h2 class="text-sm font-bold text-slate-900 dark:text-white"><?= $app->e($app->t($member['name_en'], $member['name_np'])) ?></h2>
                        <p class="text-xs font-semibold text-amber-600 dark:text-amber-400 mt-0.5"><?= $app->e($app->t($member['designation_en'], $member['designation_np'])) ?></p>
                    </div>
                    <div class="text-[11px] text-slate-500 border-t border-slate-200 dark:border-slate-800 pt-2 font-mono">
                        <?= $app->e($member['experience']) ?>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</div>
