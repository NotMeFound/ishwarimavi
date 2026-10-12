<?php
declare(strict_types=1);

namespace App\Views;

use App\Context\AppControl;

$app = AppControl::getInstance();
$history = $app->getData()['history'];
?>
<div class="py-12 bg-white dark:bg-slate-950">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div class="border-b border-slate-200 dark:border-slate-800 pb-6">
            <span class="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400"><?= $app->t('A Legacy of Educational Service', 'शैक्षिक सेवाको गौरवमय यात्रा') ?></span>
            <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white mt-1"><?= $app->t('Institutional History & Heritage', 'विद्यालयको गौरवमय इतिहास') ?></h1>
            <p class="text-sm text-slate-500 mt-2 leading-relaxed">
                <?= $app->t('Established in 2028 B.S., Ishwari Secondary School is committed to providing accessible education and supporting students in their learning and development.', 'वि.सं. २०२८ मा स्थापित ईश्वरी माध्यमिक विद्यालय गुणस्तरीय शिक्षा प्रदान गर्न र विद्यार्थीहरूको सिकाइ तथा विकासमा सहयोग गर्न प्रतिबद्ध छ।') ?>
            </p>
        </div>

        <!-- Vertical Timeline -->
        <div class="relative border-l-2 border-amber-500/40 ml-4 space-y-8 pb-4">
            <?php foreach ($history as $h): ?>
                <div class="relative pl-6">
                    <!-- Dot -->
                    <div class="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-amber-500 border-2 border-white dark:border-slate-900"></div>
                    <div class="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-1">
                        <span class="text-xs font-mono font-bold text-amber-600 dark:text-amber-400"><?= $h['year'] ?></span>
                        <h2 class="text-base font-bold text-slate-900 dark:text-white">
                            <?= $app->e($app->t($h['title_en'], $h['title_np'])) ?>
                        </h2>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</div>
