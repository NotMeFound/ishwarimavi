<?php
declare(strict_types=1);

namespace App\Views;

use App\Context\AppControl;

$app = AppControl::getInstance();
$school = $app->getData()['school'];
$notices = array_slice($app->getData()['notices'], 0, 3);
$events = array_slice($app->getData()['events'], 0, 2);
$facilities = array_slice($app->getData()['facilities'], 0, 4);
?>
<!-- SECTION 01: HERO BANNER -->
<section class="relative bg-slate-900 text-white overflow-hidden py-16 md:py-24 border-b border-slate-800">
    <!-- Subtle architectural background grid -->
    <div class="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:3rem_3rem]"></div>

    <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div class="lg:col-span-7 space-y-6">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-400">
                    <span class="w-2 h-2 rounded-full bg-amber-400"></span>
                    <?= $app->t('EDUCATION • COMMUNITY • INTEGRITY', 'शिक्षा • समुदाय • निष्ठा') ?>
                </div>

                <h1 class="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                    <?= $app->t('Empowering Students. Building Tomorrow.', 'विद्यार्थी सशक्तिकरण, समुन्नत भविष्य निर्माण।') ?>
                </h1>

                <p class="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                    <?= $app->e($app->t(
                        "Ishwari Secondary School has stood as a beacon of academic rigor, character development, and public service since 2035 B.S. Providing comprehensive education from ECD through Higher Secondary (+2 Science & Management).",
                        "वि.सं. २०३५ देखि ईश्वरी माध्यमिक विद्यालयले गुणस्तरीय शिक्षा, नैतिक संस्कार र राष्ट्रसेवामा समर्पित विद्यार्थी निर्माण गर्दै आएको छ। प्रारम्भिक बालविकासदेखि कक्षा १२ (विज्ञान तथा व्यवस्थापन) सम्म आधुनिक शिक्षण पद्धति।"
                    )) ?>
                </p>

                <div class="pt-2 flex flex-wrap gap-4">
                    <a href="/notices.php" class="inline-flex items-center gap-2 px-5 py-2.5 rounded font-medium text-sm bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-sm">
                        <span><?= $app->t('View Official Notices', 'आधिकारिक सूचनाहरू') ?></span>
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </a>
                    <a href="/about.php" class="inline-flex items-center gap-2 px-5 py-2.5 rounded font-medium text-sm bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 transition">
                        <span><?= $app->t('About Our Institution', 'हाम्रो विद्यालयको परिचय') ?></span>
                    </a>
                </div>
            </div>

            <!-- Hero Image / Institutional Highlights Card -->
            <div class="lg:col-span-5">
                <div class="bg-slate-800/80 rounded-lg p-6 border border-slate-700 shadow-xl space-y-5">
                    <div class="flex items-center justify-between border-b border-slate-700 pb-3">
                        <span class="text-xs font-semibold text-amber-400 uppercase tracking-wider"><?= $app->t('Institutional Overview', 'संस्थागत विवरण') ?></span>
                        <span class="text-xs text-slate-400 font-mono">NEB Affiliated</span>
                    </div>

                    <div class="space-y-3.5 text-xs text-slate-300">
                        <div class="flex items-start gap-3">
                            <div class="w-7 h-7 rounded bg-slate-700 flex items-center justify-center text-amber-400 shrink-0">🏛️</div>
                            <div>
                                <p class="font-semibold text-white"><?= $app->t('Government Model School', 'नेपाल सरकार नमुना विद्यालय') ?></p>
                                <p class="text-slate-400"><?= $app->t('Designated center of pedagogy and scientific infrastructure.', 'आधुनिक प्रयोगशाला तथा गुणस्तरीय अध्यापन केन्द्र।') ?></p>
                            </div>
                        </div>

                        <div class="flex items-start gap-3">
                            <div class="w-7 h-7 rounded bg-slate-700 flex items-center justify-center text-amber-400 shrink-0">🔬</div>
                            <div>
                                <p class="font-semibold text-white"><?= $app->t('Science & ICT Laboratories', 'विज्ञान तथा आइसिटी प्रयोगशाला') ?></p>
                                <p class="text-slate-400"><?= $app->t('Equipped for physics, chemistry, biology, and computer education.', 'पूर्ण सुसज्जित भौतिक, रसायन र कम्प्युटर ल्याब।') ?></p>
                            </div>
                        </div>

                        <div class="flex items-start gap-3">
                            <div class="w-7 h-7 rounded bg-slate-700 flex items-center justify-center text-amber-400 shrink-0">📚</div>
                            <div>
                                <p class="font-semibold text-white"><?= $app->t('Open E-Pustakalaya & Library', 'पुस्तकालय तथा ई-पुस्तकालय') ?></p>
                                <p class="text-slate-400"><?= $app->t('Over 8,500 cataloged books and free digital reference archives.', '८,५००+ पुस्तकहरू र डिजिटल अध्ययन सामग्री।') ?></p>
                            </div>
                        </div>
                    </div>

                    <div class="pt-2 border-t border-slate-700">
                        <div class="flex items-center justify-between text-xs">
                            <span class="text-slate-400"><?= $app->t('Admissions Open for 2083/84', 'शैक्षिक सत्र २०८३ को नयाँ भर्ना खुला') ?></span>
                            <a href="/documents.php" class="text-amber-400 font-semibold hover:underline"><?= $app->t('Forms →', 'फारम →') ?></a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- SECTION 02: CONFIRMED STATISTICAL STRIP -->
<section class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-10">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x-0 md:divide-x divide-slate-200 dark:divide-slate-800">
            <?php foreach ($school['stats'] as $stat): ?>
                <div class="px-4 py-2">
                    <div class="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 dark:text-white tabular-nums tracking-tight">
                        <?= $stat['value'] ?>
                    </div>
                    <div class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                        <?= $app->e($app->t($stat['label_en'], $stat['label_np'])) ?>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>

<!-- SECTION 03: PRINCIPAL'S DESK & EDITORIAL MESSAGE -->
<section class="py-16 bg-white dark:bg-slate-950">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-slate-50 dark:bg-slate-900/60 rounded-lg p-8 sm:p-10 border border-slate-200 dark:border-slate-800 shadow-sm">
            <div class="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                <div class="md:col-span-4 flex flex-col items-center text-center border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 pb-6 md:pb-0 md:pr-8">
                    <div class="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-slate-200 dark:bg-slate-800 border-2 border-amber-500 flex items-center justify-center text-4xl shadow-md mb-4 text-slate-500">
                        👨‍🏫
                    </div>
                    <h3 class="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                        <?= $app->e($app->t($school['principal_en'], $school['principal_np'])) ?>
                    </h3>
                    <p class="text-xs text-amber-600 dark:text-amber-400 font-medium">
                        <?= $app->t('Headmaster / Principal', 'प्रधानाध्यापक') ?>
                    </p>
                    <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Ishwari Secondary School
                    </p>
                </div>

                <div class="md:col-span-8 space-y-4">
                    <div class="text-xs uppercase tracking-widest text-amber-600 dark:text-amber-400 font-semibold">
                        <?= $app->t("Message From the Headmaster's Desk", "प्रधानाध्यापकको सन्देश") ?>
                    </div>
                    <blockquote class="text-sm sm:text-base text-slate-700 dark:text-slate-300 leading-relaxed italic">
                        "<?= $app->e($app->t($school['principal_message_en'], $school['principal_message_np'])) ?>"
                    </blockquote>
                    <div class="pt-2">
                        <a href="/about.php" class="text-xs font-semibold text-slate-900 dark:text-white hover:text-amber-500 transition inline-flex items-center gap-1">
                            <span><?= $app->t('Read full administrative report →', 'पूर्ण संस्थागत विवरण हेर्नुहोस् →') ?></span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- SECTION 04: LATEST NOTICES & UPCOMING EVENTS -->
<section class="py-12 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <!-- Notices List (8 cols) -->
            <div class="lg:col-span-7 space-y-4">
                <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div>
                        <h2 class="text-lg font-bold text-slate-900 dark:text-white">
                            <?= $app->t('Latest Notices & Circulars', 'ताजा सूचना तथा परिपत्रहरू') ?>
                        </h2>
                        <p class="text-xs text-slate-500"><?= $app->t('Official announcements and examination schedules', 'विद्यालय प्रशासनका महत्त्वपूर्ण घोषणाहरू') ?></p>
                    </div>
                    <a href="/notices.php" class="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline">
                        <?= $app->t('View All (4) →', 'सबै हेर्नुहोस् →') ?>
                    </a>
                </div>

                <div class="divide-y divide-slate-100 dark:divide-slate-800">
                    <?php foreach ($notices as $notice): ?>
                        <div class="py-4 space-y-1.5 hover:bg-slate-50 dark:hover:bg-slate-900/40 px-2 rounded transition">
                            <div class="flex items-center gap-2 text-xs text-slate-500">
                                <span class="font-mono text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded">
                                    <?= strtoupper($notice['category']) ?>
                                </span>
                                <span>•</span>
                                <span><?= $app->e($app->t($notice['date_en'], $notice['date_np'])) ?></span>
                                <?php if ($notice['pinned']): ?>
                                    <span class="text-[10px] bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400 px-1.5 py-0.2 rounded font-semibold uppercase">PINNED</span>
                                <?php endif; ?>
                            </div>
                            <h3 class="text-sm font-semibold text-slate-900 dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition">
                                <a href="/notices.php"><?= $app->e($app->t($notice['title_en'], $notice['title_np'])) ?></a>
                            </h3>
                            <p class="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                                <?= $app->e($app->t($notice['description_en'], $notice['description_np'])) ?>
                            </p>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>

            <!-- Events List (5 cols) -->
            <div class="lg:col-span-5 space-y-4">
                <div class="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                    <div>
                        <h2 class="text-lg font-bold text-slate-900 dark:text-white">
                            <?= $app->t('Upcoming Events', 'आगामी कार्यक्रमहरू') ?>
                        </h2>
                        <p class="text-xs text-slate-500"><?= $app->t('Academic and co-curricular calendar', 'शैक्षिक तथा अतिरिक्त क्रियाकलाप') ?></p>
                    </div>
                    <a href="/events.php" class="text-xs font-semibold text-amber-600 dark:text-amber-400 hover:underline">
                        <?= $app->t('All Events →', 'सबै कार्यक्रम →') ?>
                    </a>
                </div>

                <div class="space-y-3">
                    <?php foreach ($events as $event): ?>
                        <div class="p-4 rounded border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2">
                            <div class="text-xs font-semibold text-amber-600 dark:text-amber-400">
                                📅 <?= $app->e($app->t($event['date_en'], $event['date_np'])) ?> • 🕒 <?= $event['time'] ?>
                            </div>
                            <h3 class="text-sm font-bold text-slate-900 dark:text-white">
                                <?= $app->e($app->t($event['title_en'], $event['title_np'])) ?>
                            </h3>
                            <p class="text-xs text-slate-600 dark:text-slate-400">
                                <?= $app->e($app->t($event['desc_en'], $event['desc_np'])) ?>
                            </p>
                            <div class="text-[11px] text-slate-500 flex items-center gap-1">
                                <span>📍 <?= $app->e($app->t($event['venue_en'], $event['venue_np'])) ?></span>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- SECTION 05: CAMPUS FACILITIES -->
<section class="py-16 bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <h2 class="text-2xl font-bold text-slate-900 dark:text-white">
                <?= $app->t('Campus Infrastructure & Facilities', 'भौतिक पूर्वाधार तथा शैक्षिक सुविधाहरू') ?>
            </h2>
            <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                <?= $app->t('State-of-the-art educational facilities promoting holistic, practical pedagogy.', 'प्रयोगात्मक र प्रविधिमैत्री सिकाइका लागि आवश्यक सम्पूर्ण पूर्वाधारहरू।') ?>
            </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <?php foreach ($facilities as $fac): ?>
                <div class="p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm hover:shadow transition space-y-3">
                    <div class="w-10 h-10 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-lg text-amber-500">
                        🏛️
                    </div>
                    <h3 class="text-sm font-bold text-slate-900 dark:text-white">
                        <?= $app->e($app->t($fac['title_en'], $fac['title_np'])) ?>
                    </h3>
                    <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        <?= $app->e($app->t($fac['desc_en'], $fac['desc_np'])) ?>
                    </p>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</section>
