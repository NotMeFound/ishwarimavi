<?php
declare(strict_types=1);

namespace App\Views;

use App\Context\AppControl;

$app = AppControl::getInstance();
?>
<div class="py-12 bg-white dark:bg-slate-950">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div class="border-b border-slate-200 dark:border-slate-800 pb-6">
            <span class="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400"><?= $app->t('Social Engagement', 'समुदाय र सहकार्य') ?></span>
            <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white mt-1"><?= $app->t('Community, PTA & Alumni Network', 'अभिभावक-शिक्षक संघ तथा पूर्व विद्यार्थी समाज') ?></h1>
            <p class="text-sm text-slate-500 mt-2 max-w-3xl leading-relaxed">
                <?= $app->t('Education thrives in close collaboration with parents, local leaders, and alumni who continually give back to the school.', 'अभिभावक, स्थानीय समुदाय र पूर्व विद्यार्थीहरूको सक्रिय सहभागितामा अगाडि बढिरहेको हाम्रो विद्यालय।') ?>
            </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-3">
                <div class="w-10 h-10 rounded bg-blue-500/10 text-blue-500 flex items-center justify-center text-xl font-bold">🤝</div>
                <h2 class="text-base font-bold text-slate-900 dark:text-white"><?= $app->t('Parent-Teacher Association (PTA)', 'अभिभावक-शिक्षक संघ') ?></h2>
                <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    <?= $app->t('Ensures constructive dialogue between guardians and teachers regarding learning outcomes, nutrition, and psychological support.', 'विद्यार्थीको सिकाइ स्तर, अनुशासन र मानसिक विकासबारे नियमित परामर्श तथा त्रैमासिक अभिभावक भेला।') ?>
                </p>
            </div>

            <div class="p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-3">
                <div class="w-10 h-10 rounded bg-amber-500/10 text-amber-500 flex items-center justify-center text-xl font-bold">🎓</div>
                <h2 class="text-base font-bold text-slate-900 dark:text-white"><?= $app->t('Ishwari Alumni Association', 'पूर्व विद्यार्थी मञ्च') ?></h2>
                <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    <?= $app->t('Graduates across civil service, engineering, medicine, and entrepreneurship who sponsor merit scholarships and career mentoring.', 'विगत चार दशकका पूर्व विद्यार्थीहरूद्वारा जेहेन्दार विद्यार्थीहरूलाई छात्रवृत्ति तथा करियर काउन्सिलिङ।') ?>
                </p>
            </div>

            <div class="p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-3">
                <div class="w-10 h-10 rounded bg-red-500/10 text-red-500 flex items-center justify-center text-xl font-bold">❤️</div>
                <h2 class="text-base font-bold text-slate-900 dark:text-white"><?= $app->t('Junior Red Cross & Scout Troop', 'जुनियर रेडक्रस तथा स्काउट') ?></h2>
                <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    <?= $app->t('Training students in first-aid, disaster preparedness, civic hygiene, blood donation drives, and emergency leadership.', 'प्राथमिक उपचार, विपद् व्यवस्थापन र सामाजिक सेवामा विद्यार्थीहरूलाई सक्षम बनाउन क्रियाशील।') ?>
                </p>
            </div>
        </div>
    </div>
</div>
