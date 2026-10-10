<?php
declare(strict_types=1);

namespace App\Views;

use App\Context\AppControl;

$app = AppControl::getInstance();
$facilities = $app->getData()['facilities'];
?>
<div class="py-12 bg-white dark:bg-slate-950">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div class="border-b border-slate-200 dark:border-slate-800 pb-6">
            <span class="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400"><?= $app->t('Infrastructure & Equipment', 'पूर्वाधार तथा प्रविधि') ?></span>
            <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white mt-1"><?= $app->t('Campus Facilities', 'विद्यालयका भौतिक पूर्वाधारहरू') ?></h1>
            <p class="text-sm text-slate-500 mt-2 max-w-3xl leading-relaxed">
                <?= $app->t('Designed to meet national Model School guidelines, prioritizing experiential scientific experiments, computer literacy, and physical wellness.', 'नेपाल सरकारको नमुना विद्यालय मापदण्ड बमोजिम निर्मित अत्याधुनिक प्रयोगशाला, सूचना प्रविधि केन्द्र र खेलकुद पूर्वाधारहरू।') ?>
            </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
            <?php foreach ($facilities as $fac): ?>
                <div class="p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-4">
                    <div class="flex items-center gap-3">
                        <div class="w-12 h-12 rounded bg-amber-500/10 text-amber-500 flex items-center justify-center text-2xl font-bold">
                            🏛️
                        </div>
                        <div>
                            <h2 class="text-lg font-bold text-slate-900 dark:text-white"><?= $app->e($app->t($fac['title_en'], $fac['title_np'])) ?></h2>
                            <span class="text-[11px] text-amber-600 dark:text-amber-400 font-medium"><?= $app->t('Verified Campus Facility', 'सत्यापित पूर्वाधार') ?></span>
                        </div>
                    </div>
                    <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                        <?= $app->e($app->t($fac['desc_en'], $fac['desc_np'])) ?>
                    </p>
                </div>
            <?php endforeach; ?>
        </div>

        <!-- Additional Amenities Strip -->
        <div class="p-6 rounded-lg bg-slate-900 text-slate-200 space-y-4">
            <h3 class="text-base font-bold text-white"><?= $app->t('Health, Safety & Sustainable Amenities', 'स्वास्थ्य, सुरक्षा तथा दिगो पूर्वाधार') ?></h3>
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div class="p-3 bg-slate-800/80 rounded border border-slate-700">
                    <p class="font-bold text-amber-400">💧 <?= $app->t('UV Purified Drinking Water', 'शुद्ध पिउने पानी') ?></p>
                    <p class="text-slate-400 mt-1"><?= $app->t('Automated multi-stage filtration system accessible in all blocks.', 'प्रत्येक भवनमा युरोगार्ड र फिल्टरयुक्त पिउने पानीको व्यवस्था।') ?></p>
                </div>
                <div class="p-3 bg-slate-800/80 rounded border border-slate-700">
                    <p class="font-bold text-amber-400">🔋 <?= $app->t('Solar Power & UPS Backup', 'सौर्य ऊर्जा तथा ब्याकअप') ?></p>
                    <p class="text-slate-400 mt-1"><?= $app->t('Continuous electric power for computer labs and digital boards.', 'कम्प्युटर ल्याब र डिजिटल बोर्डका लागि २४सै घण्टा विद्युत् सुविधा।') ?></p>
                </div>
                <div class="p-3 bg-slate-800/80 rounded border border-slate-700">
                    <p class="font-bold text-amber-400">🛡️ <?= $app->t('CCTV Security Surveillance', 'सीसीटिभी सुरक्षा निगरानी') ?></p>
                    <p class="text-slate-400 mt-1"><?= $app->t('Comprehensive campus boundary monitoring for student safety.', 'विद्यार्थीहरूको सुरक्षाका लागि क्याम्पस परिसरभर क्यामेरा निगरानी।') ?></p>
                </div>
            </div>
        </div>
    </div>
</div>
