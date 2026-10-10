<?php
declare(strict_types=1);

namespace App\Views;

use App\Context\AppControl;

$app = AppControl::getInstance();
$school = $app->getData()['school'];
?>
<div class="py-12 bg-white dark:bg-slate-950">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <!-- Header -->
        <div class="border-b border-slate-200 dark:border-slate-800 pb-6">
            <span class="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400"><?= $app->t('Institutional Heritage', 'संस्थागत परिचय') ?></span>
            <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white mt-1"><?= $app->t('About Ishwari Secondary School', 'ईश्वरी माध्यमिक विद्यालयको परिचय') ?></h1>
            <p class="text-sm text-slate-500 mt-2 max-w-3xl leading-relaxed">
                <?= $app->t('A center of educational prestige, committed to delivering holistic academic development, scientific curiosity, and ethical public values.', 'शैक्षिक गरिमाको धरोहर, समग्र शैक्षिक विकास, वैज्ञानिक सोच र नैतिक मूल्य मान्यतामा समर्पित अग्रणी संस्था।') ?>
            </p>
        </div>

        <!-- Mission, Vision, Values Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-3">
                <div class="w-10 h-10 rounded bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-xl">🎯</div>
                <h2 class="text-base font-bold text-slate-900 dark:text-white"><?= $app->t('Our Mission', 'हाम्रो उद्देश्य') ?></h2>
                <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    <?= $app->t('To provide inclusive, equitable, and scientifically oriented high-standard education that enables every student to achieve their utmost potential and become conscientious contributors to society.', 'प्रत्येक विद्यार्थीलाई समतामूलक, वैज्ञानिक तथा जीवनोपयोगी गुणस्तरीय शिक्षा प्रदान गरी राष्ट्रनिर्माणमा सक्षम र जिम्मेवार नागरिक तयार गर्नु।') ?>
                </p>
            </div>

            <div class="p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-3">
                <div class="w-10 h-10 rounded bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold text-xl">🔭</div>
                <h2 class="text-base font-bold text-slate-900 dark:text-white"><?= $app->t('Our Vision', 'हाम्रो दूरदृष्टि') ?></h2>
                <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    <?= $app->t('To emerge as a national benchmark in public education through technology-integrated learning, modern laboratory research, and cultural integrity.', 'आधुनिक सूचना प्रविधि, वैज्ञानिक प्रयोगशाला तथा नैतिक संस्कारयुक्त सिकाइको माध्यमबाट मुलुककै नमुना सामुदायिक विद्यालयको रूपमा स्थापित हुनु।') ?>
                </p>
            </div>

            <div class="p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-3">
                <div class="w-10 h-10 rounded bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold text-xl">⚖️</div>
                <h2 class="text-base font-bold text-slate-900 dark:text-white"><?= $app->t('Core Values', 'हाम्रा मुख्य मूल्यहरू') ?></h2>
                <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    <?= $app->t('Academic Integrity, Inclusivity, Discipline, Critical Thinking, and Deep Respect for National Heritage and Environmental Stewardship.', 'अनुशासन, पारदर्शिता, समावेशिता, रचनात्मकता र राष्ट्रिय मूल्य-मान्यताप्रतिको अगाध निष्ठा।') ?>
                </p>
            </div>
        </div>

        <!-- School Management Committee (SMC) Section -->
        <div class="space-y-6 pt-4">
            <h2 class="text-xl font-bold text-slate-900 dark:text-white"><?= $app->t('School Management Committee (SMC)', 'विद्यालय व्यवस्थापन समिति (वि.व्य.स.)') ?></h2>
            <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                <div class="p-6 border-b border-slate-200 dark:border-slate-800">
                    <p class="text-xs text-slate-500 leading-relaxed">
                        <?= $app->t('The School Management Committee oversees institutional policy formulation, fiscal integrity, infrastructure development, and overall educational governance.', 'विद्यालय व्यवस्थापन समितिले नीतिगत निर्णय, आर्थिक पारदर्शिता, भौतिक पूर्वाधार विकास र समग्र शैक्षिक सुशासनको नेतृत्व गर्दछ।') ?>
                    </p>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6 text-xs">
                    <div class="p-3 bg-slate-50 dark:bg-slate-800/60 rounded">
                        <p class="font-bold text-slate-900 dark:text-white">श्री रामबहादुर थापा</p>
                        <p class="text-amber-600 dark:text-amber-400 font-semibold"><?= $app->t('SMC Chairman', 'अध्यक्ष, विद्यालय व्यवस्थापन समिति') ?></p>
                    </div>
                    <div class="p-3 bg-slate-50 dark:bg-slate-800/60 rounded">
                        <p class="font-bold text-slate-900 dark:text-white"><?= $app->e($app->t($school['principal_en'], $school['principal_np'])) ?></p>
                        <p class="text-amber-600 dark:text-amber-400 font-semibold"><?= $app->t('Member Secretary (Principal)', 'सदस्य सचिव (प्रधानाध्यापक)') ?></p>
                    </div>
                    <div class="p-3 bg-slate-50 dark:bg-slate-800/60 rounded">
                        <p class="font-bold text-slate-900 dark:text-white">श्रीमती देवी श्रेष्ठ</p>
                        <p class="text-slate-500"><?= $app->t('Guardian Representative Member', 'अभिभावक प्रतिनिधि सदस्य') ?></p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
