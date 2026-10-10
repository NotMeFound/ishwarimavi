<?php
declare(strict_types=1);

namespace App\Views;

use App\Context\AppControl;

$app = AppControl::getInstance();
?>
<div class="py-12 bg-white dark:bg-slate-950">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div class="border-b border-slate-200 dark:border-slate-800 pb-6">
            <span class="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400"><?= $app->t('Curriculum & Pedagogy', 'पाठ्यक्रम तथा शिक्षण अभ्यास') ?></span>
            <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white mt-1"><?= $app->t('Academic Programs', 'शैक्षिक कार्यक्रमहरू') ?></h1>
            <p class="text-sm text-slate-500 mt-2 max-w-3xl leading-relaxed">
                <?= $app->t('Structured curriculum aligned with CDC (Curriculum Development Centre) and National Examination Board (NEB) standards, enriched by experiential learning.', 'पाठ्यक्रम विकास केन्द्र (CDC) र राष्ट्रिय परीक्षा बोर्ड (NEB) को मापदण्ड अनुसार सञ्चालित स्तरीय कक्षाहरू।') ?>
            </p>
        </div>

        <div class="space-y-8">
            <!-- Program 1: ECD -->
            <div id="ecd" class="p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-3">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">LEVEL 01</span>
                    <span class="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 font-mono">Age 3 - 5 Years</span>
                </div>
                <h2 class="text-xl font-bold text-slate-900 dark:text-white"><?= $app->t('Early Childhood Development (ECD)', 'प्रारम्भिक बाल विकास (ECD)') ?></h2>
                <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    <?= $app->t('Play-based foundational learning focusing on sensory development, language acquisition, social cooperation, and physical motor skills in a joyful child-friendly environment.', 'खेल र क्रियाकलापमा आधारित बालमैत्री सिकाइ, जहाँ बालबालिकाको शारीरिक, मानसिक तथा संवेगात्मक विकासमा विशेष ध्यान दिइन्छ।') ?>
                </p>
            </div>

            <!-- Program 2: Basic Level -->
            <div id="basic" class="p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-3">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">LEVEL 02</span>
                    <span class="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 font-mono">Grades 1 to 8</span>
                </div>
                <h2 class="text-xl font-bold text-slate-900 dark:text-white"><?= $app->t('Basic Education Level (कक्षा १ - ८)', 'आधारभूत तह (कक्षा १ - ८)') ?></h2>
                <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    <?= $app->t('Core competency development in Nepali, English, Mathematics, Science & Technology, Social Studies, Health, and Local Vocational Skills. Continuous Assessment System (CAS) is practiced.', 'नेपाली, अंग्रेजी, गणित, विज्ञान तथा प्रविधि, सामाजिक अध्ययन र स्थानीय विषयहरूमा आधारभूत सीप तथा सिर्जनशीलताको विकास।') ?>
                </p>
            </div>

            <!-- Program 3: Secondary Level -->
            <div id="secondary" class="p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-3">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">LEVEL 03</span>
                    <span class="text-xs px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 font-mono">Grades 9 & 10 (SEE Preparation)</span>
                </div>
                <h2 class="text-xl font-bold text-slate-900 dark:text-white"><?= $app->t('Secondary Level (कक्षा ९ - १० / SEE)', 'माध्यमिक तह (कक्षा ९ - १०)') ?></h2>
                <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    <?= $app->t('Rigorous preparatory coursework for the Secondary Education Examination (SEE) with extra coaching in Science, Compulsory Mathematics, and Optional Mathematics / Computer Science.', 'एसईई (SEE) परीक्षालाई लक्षित गरी विज्ञान, ऐच्छिक गणित तथा कम्प्युटर शिक्षामा विशेष प्रयोगात्मक कक्षा र अतिरिक्त तयारी।') ?>
                </p>
            </div>

            <!-- Program 4: Higher Secondary (+2) -->
            <div id="higher-secondary" class="p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-3">
                <div class="flex items-center justify-between">
                    <span class="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">LEVEL 04</span>
                    <span class="text-xs px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 font-mono">Grades 11 & 12 (+2 Streams)</span>
                </div>
                <h2 class="text-xl font-bold text-slate-900 dark:text-white"><?= $app->t('Higher Secondary Level (+2 Science & Management)', 'उच्च माध्यमिक तह (+२ विज्ञान र व्यवस्थापन संकाय)') ?></h2>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div class="p-4 bg-white dark:bg-slate-800/80 rounded border border-slate-200 dark:border-slate-700">
                        <h3 class="font-bold text-slate-900 dark:text-white text-sm">🧪 <?= $app->t('Science Stream', 'विज्ञान संकाय') ?></h3>
                        <p class="text-xs text-slate-500 mt-1"><?= $app->t('Physics, Chemistry, Biology, Mathematics, and Computer Science with intensive laboratory sessions.', 'भौतिकशास्त्र, रसायनशास्त्र, जीवविज्ञान र गणितका गहन प्रयोगात्मक कक्षाहरू।') ?></p>
                    </div>
                    <div class="p-4 bg-white dark:bg-slate-800/80 rounded border border-slate-200 dark:border-slate-700">
                        <h3 class="font-bold text-slate-900 dark:text-white text-sm">📊 <?= $app->t('Management Stream', 'व्यवस्थापन संकाय') ?></h3>
                        <p class="text-xs text-slate-500 mt-1"><?= $app->t('Accountancy, Economics, Business Studies, Marketing, and Hotel Management.', 'लेखाविधि, अर्थशास्त्र, व्यवसाय अध्ययन तथा कम्प्युटर प्रणाली।') ?></p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
