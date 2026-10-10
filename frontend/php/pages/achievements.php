<?php
declare(strict_types=1);

namespace App\Views;

use App\Context\AppControl;

$app = AppControl::getInstance();
$achievements = $app->getData()['achievements'];
?>
<div class="py-12 bg-white dark:bg-slate-950">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div class="border-b border-slate-200 dark:border-slate-800 pb-6">
            <span class="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400"><?= $app->t('Student Honors', 'हाम्रा गौरवमय उपलब्धिहरू') ?></span>
            <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white mt-1"><?= $app->t('Academic & Co-Curricular Recognitions', 'शैक्षिक तथा अतिरिक्त क्रियाकलापका सफलता') ?></h1>
            <p class="text-sm text-slate-500 mt-2 max-w-3xl leading-relaxed">
                <?= $app->t('Celebrating our students consistently leading district board examinations, sports tournaments, and innovation challenges.', 'एसईई परीक्षामा जिल्ला प्रथम, राष्ट्रपति रनिङ शिल्ड तथा विज्ञान प्रदर्शनीहरूमा हाम्रा विद्यार्थीहरूको उत्कृष्ट नतिजा।') ?>
            </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <?php foreach ($achievements as $ach): ?>
                <div class="p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-3">
                    <span class="text-xs font-mono font-bold text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded bg-amber-500/10">
                        🏆 <?= $ach['year'] ?>
                    </span>
                    <h2 class="text-lg font-bold text-slate-900 dark:text-white">
                        <?= $app->e($app->t($ach['title_en'], $ach['title_np'])) ?>
                    </h2>
                    <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        <?= $app->e($ach['desc_en']) ?>
                    </p>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</div>
