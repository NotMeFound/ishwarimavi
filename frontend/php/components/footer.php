<?php
declare(strict_types=1);

namespace App\Components;

use App\Context\AppControl;

$app = AppControl::getInstance();
$school = $app->getData()['school'];
?>
<footer class="w-full bg-slate-950 text-slate-400 border-t border-slate-800 pt-12 pb-8 mt-16 text-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
            <!-- Col 1: Institutional Identity -->
            <div class="space-y-3">
                <div class="flex items-center gap-2">
                    <span class="w-8 h-8 rounded bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-base">ई</span>
                    <h3 class="text-white font-bold text-base tracking-tight"><?= $app->e($app->t($school['name_en'], $school['name_np'])) ?></h3>
                </div>
                <p class="text-xs text-slate-400 leading-relaxed">
                    <?= $app->e($app->t($school['affiliation_en'], $school['affiliation_np'])) ?>
                </p>
                <div class="text-xs text-slate-500 font-mono">
                    <span><?= $app->e($school['code']) ?></span> • 
                    <span><?= $app->t('Estd: ' . $school['estd_ad'], 'स्थापना: ' . $school['estd_bs']) ?></span>
                </div>
                <div class="pt-2">
                    <a href="/ishwari-ma-vi-final.zip" download class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700 transition">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        <span><?= $app->t('Download Full School Source (.ZIP)', 'पूर्ण वेबसाइट स्रोत डाउनलोड (.ZIP)') ?></span>
                    </a>
                </div>
            </div>

            <!-- Col 2: Academic Programs -->
            <div class="space-y-2.5">
                <h4 class="text-white font-semibold text-xs uppercase tracking-wider"><?= $app->t('Academic Streams', 'शैक्षिक तहहरू') ?></h4>
                <ul class="space-y-1.5 text-xs">
                    <li><a href="/academics.php#ecd" class="hover:text-white transition">• <?= $app->t('Early Childhood Development (ECD)', 'प्रारम्भिक बाल विकास (ECD)') ?></a></li>
                    <li><a href="/academics.php#basic" class="hover:text-white transition">• <?= $app->t('Basic Level (Grades 1 to 8)', 'आधारभूत तह (कक्षा १ देखि ८)') ?></a></li>
                    <li><a href="/academics.php#secondary" class="hover:text-white transition">• <?= $app->t('Secondary Education (Grades 9 & 10)', 'माध्यमिक तह (कक्षा ९ र १०)') ?></a></li>
                    <li><a href="/academics.php#higher-secondary" class="hover:text-white transition">• <?= $app->t('Higher Secondary (+2 Science)', 'उच्च माध्यमिक (+२ विज्ञान संकाय)') ?></a></li>
                    <li><a href="/academics.php#higher-secondary" class="hover:text-white transition">• <?= $app->t('Higher Secondary (+2 Management)', 'उच्च माध्यमिक (+२ व्यवस्थापन संकाय)') ?></a></li>
                </ul>
            </div>

            <!-- Col 3: Public Documents & Links -->
            <div class="space-y-2.5">
                <h4 class="text-white font-semibold text-xs uppercase tracking-wider"><?= $app->t('Quick Portals', 'द्रुत लिंकहरू') ?></h4>
                <ul class="space-y-1.5 text-xs">
                    <li><a href="/notices.php" class="hover:text-white transition">• <?= $app->t('Official Notices & Circulars', 'सूचना तथा परिपत्रहरू') ?></a></li>
                    <li><a href="/documents.php" class="hover:text-white transition">• <?= $app->t('Citizen Charter & Downloads', 'नागरिक बडापत्र तथा डाउनलोड') ?></a></li>
                    <li><a href="/events.php" class="hover:text-white transition">• <?= $app->t('Institutional Calendar', 'शैक्षिक क्यालेन्डर') ?></a></li>
                    <li><a href="/staff.php" class="hover:text-white transition">• <?= $app->t('Faculty Directory', 'शिक्षक तथा कर्मचारी सूची') ?></a></li>
                    <li><a href="/admin.php" class="text-amber-400 hover:underline transition">• <?= $app->t('Administrative Portal', 'प्रशासन लगइन पोर्टल') ?></a></li>
                </ul>
            </div>

            <!-- Col 4: Contact & Coordinates -->
            <div class="space-y-2.5">
                <h4 class="text-white font-semibold text-xs uppercase tracking-wider"><?= $app->t('Contact & Visit', 'सम्पर्क तथा ठेगाना') ?></h4>
                <div class="space-y-1.5 text-xs leading-relaxed">
                    <p class="flex items-start gap-1.5">
                        <svg class="w-4 h-4 text-amber-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span><?= $app->e($app->t($school['address_en'], $school['address_np'])) ?></span>
                    </p>
                    <p class="flex items-center gap-1.5">
                        <svg class="w-4 h-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        <span><?= $app->e($school['phone']) ?></span>
                    </p>
                    <p class="flex items-center gap-1.5">
                        <svg class="w-4 h-4 text-amber-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span><?= $app->e($school['email']) ?></span>
                    </p>
                </div>
            </div>
        </div>

        <div class="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
            <p>© <?= date('Y') ?> <?= $app->e($app->t($school['name_en'], $school['name_np'])) ?>. <?= $app->t('All Rights Reserved. Official Government Portal.', 'सबै अधिकार सुरक्षित। नेपाल सरकारको आधिकारिक पोर्टल।') ?></p>
            <div class="flex items-center gap-4">
                <a href="/admin.php" class="text-slate-400 hover:text-amber-400 transition">Admin Portal</a>
                <span>•</span>
                <span>Government Model School</span>
            </div>
        </div>
    </div>
</footer>
