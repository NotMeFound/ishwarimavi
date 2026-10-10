<?php
declare(strict_types=1);

namespace App\Components;

use App\Context\AppControl;

$app = AppControl::getInstance();
$isNp = $app->isNepali();
$isDark = $app->isDark();
$school = $app->getData()['school'];
$dates = $app->getNepaliDate();
$currentDateStr = $isNp ? $dates['np'] : $dates['en'];
?>
<header class="w-full bg-slate-900 text-slate-100 border-b border-slate-800 shadow-sm sticky top-0 z-50">
    <!-- Top Utility & Information Bar -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex flex-wrap items-center justify-between py-2 border-b border-slate-800 text-xs gap-3">
            <!-- Pinned Circular Ticker -->
            <div class="flex items-center space-x-2 overflow-hidden flex-1 min-w-[260px]">
                <span class="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500 text-slate-950 uppercase tracking-wide shrink-0">
                    <?= $app->t('Latest Notice', 'ताजा सूचना') ?>
                </span>
                <div class="truncate text-slate-300 hover:text-white transition">
                    <a href="/notices.php" class="hover:underline flex items-center gap-1.5">
                        <span class="inline-block w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                        <?= $app->e($app->t($app->getData()['notices'][0]['title_en'], $app->getData()['notices'][0]['title_np'])) ?>
                    </a>
                </div>
            </div>

            <!-- Right Controls: Date/Time + Toggles + Admin Link -->
            <div class="flex items-center space-x-3 shrink-0">
                <!-- Live Bikram Sambat Date & Time Widget -->
                <div id="live-datetime-badge" class="hidden sm:flex items-center gap-2 px-3 py-1 rounded bg-slate-800/80 border border-slate-700/80 text-slate-200 font-mono text-[11px] tabular-nums shadow-inner">
                    <span id="live-bs-date"><?= $app->e($currentDateStr) ?></span>
                </div>

                <!-- Neumorphic Sliding Language Toggle (Flag-only, Same Size Flags) -->
                <div class="flex items-center" title="<?= $app->t('Switch to Nepali', 'Switch to English') ?>">
                    <a href="?lang=<?= $isNp ? 'en' : 'np' ?>" id="lang-toggle-btn" class="relative inline-flex items-center h-7 w-14 rounded-full p-0.5 transition-all duration-300 bg-slate-800 border border-slate-700 shadow-inner group cursor-pointer" role="button" aria-label="Toggle Language">
                        <!-- British Flag 🇬🇧 (Left) -->
                        <span class="w-6 h-6 flex items-center justify-center rounded-full z-10 transition-opacity <?= !$isNp ? 'opacity-100' : 'opacity-40 hover:opacity-80' ?>">
                            <svg class="w-4 h-4 rounded-full object-cover shadow-sm" viewBox="0 0 32 32" fill="none">
                                <clipPath id="uk-flag-clip"><circle cx="16" cy="16" r="16"/></clipPath>
                                <g clip-path="url(#uk-flag-clip)">
                                    <rect width="32" height="32" fill="#012169"/>
                                    <path d="M0 0L32 32M32 0L0 32" stroke="#FFFFFF" stroke-width="4.5"/>
                                    <path d="M0 0L32 32M32 0L0 32" stroke="#C8102E" stroke-width="2.2"/>
                                    <path d="M16 0V32M0 16H32" stroke="#FFFFFF" stroke-width="7.5"/>
                                    <path d="M16 0V32M0 16H32" stroke="#C8102E" stroke-width="4.5"/>
                                </g>
                            </svg>
                        </span>

                        <!-- Nepal Flag 🇳🇵 (Right) -->
                        <span class="w-6 h-6 flex items-center justify-center rounded-full z-10 transition-opacity <?= $isNp ? 'opacity-100' : 'opacity-40 hover:opacity-80' ?>">
                            <svg class="w-4 h-4 rounded-full object-cover shadow-sm" viewBox="0 0 32 32" fill="none">
                                <circle cx="16" cy="16" r="16" fill="#003893"/>
                                <path d="M7 5L24 16L12 16L25 27H7V5Z" fill="#DC143C"/>
                                <circle cx="13" cy="12" r="3" fill="#FFFFFF"/>
                                <circle cx="13" cy="22" r="3.5" fill="#FFFFFF"/>
                            </svg>
                        </span>

                        <!-- Animated Slider Thumb -->
                        <span class="absolute top-0.5 <?= $isNp ? 'left-[29px]' : 'left-0.5' ?> w-6 h-6 rounded-full bg-amber-500 shadow-md transition-all duration-300 transform"></span>
                    </a>
                </div>

                <!-- Flat UI Minimalist Theme Toggle (Dark/Light Switch) -->
                <div class="flex items-center" title="<?= $isDark ? $app->t('Switch to Light Mode', 'लाइट मोडमा जानुहोस्') : $app->t('Switch to Dark Mode', 'डार्क मोडमा जानुहोस्') ?>">
                    <a href="?theme=<?= $isDark ? 'light' : 'dark' ?>" id="theme-toggle-btn" class="relative inline-flex items-center h-7 w-13 rounded-full p-0.5 transition-colors duration-200 <?= $isDark ? 'bg-indigo-950 border border-indigo-700' : 'bg-slate-700 border border-slate-600' ?>" role="button" aria-label="Toggle Theme">
                        <span class="sr-only">Toggle theme</span>
                        <!-- Sun Icon (Light) -->
                        <svg class="w-3.5 h-3.5 text-amber-400 absolute left-1.5 <?= $isDark ? 'opacity-30' : 'opacity-100' ?>" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <!-- Moon Icon (Dark) -->
                        <svg class="w-3.5 h-3.5 text-sky-300 absolute right-1.5 <?= $isDark ? 'opacity-100' : 'opacity-30' ?>" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                        <!-- Sliding Knob -->
                        <span class="inline-block w-5 h-5 rounded-full bg-white shadow transform transition duration-200 <?= $isDark ? 'translate-x-6' : 'translate-x-0' ?>"></span>
                    </a>
                </div>

                <!-- Distinct Link for Admin Portal -->
                <a href="/admin.php" class="inline-flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 hover:text-white border border-slate-700 transition" title="Administrative Access">
                    <svg class="w-3.5 h-3.5 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span><?= $app->t('Admin Login', 'प्रशासन लगइन') ?></span>
                </a>
            </div>
        </div>

        <!-- Main Branding Bar -->
        <div class="py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div class="flex items-center gap-3.5">
                <!-- Nepal Government School Crest -->
                <a href="/" class="shrink-0 flex items-center justify-center w-14 h-14 rounded-full bg-white/10 border border-white/20 text-white shadow">
                    <svg class="w-9 h-9 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 14l9-5-9-5-9 5 9 5z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                    </svg>
                </a>

                <div>
                    <div class="flex items-center gap-2">
                        <span class="text-[10px] uppercase font-semibold tracking-wider text-amber-400">
                            <?= $app->e($app->t($school['affiliation_en'], $school['affiliation_np'])) ?>
                        </span>
                        <span class="text-slate-500">•</span>
                        <span class="text-[10px] text-slate-400 font-mono"><?= $app->e($school['code']) ?></span>
                    </div>
                    <h1 class="text-xl md:text-2xl font-bold tracking-tight text-white">
                        <a href="/"><?= $app->e($app->t($school['name_en'], $school['name_np'])) ?></a>
                    </h1>
                    <p class="text-xs text-slate-400">
                        <?= $app->e($app->t($school['tagline_en'], $school['tagline_np'])) ?> • 
                        <span class="text-slate-300"><?= $app->t('Estd: ' . $school['estd_ad'], 'स्थापना: ' . $school['estd_bs']) ?></span>
                    </p>
                </div>
            </div>

            <!-- Quick Action & Search Trigger (Ctrl+K) -->
            <div class="flex items-center gap-3">
                <button type="button" onclick="document.getElementById('search-modal').classList.remove('hidden')" class="flex items-center gap-2.5 px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-300 transition shadow-sm w-full sm:w-auto">
                    <svg class="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span><?= $app->t('Search notices, events, staff...', 'सूचना, कार्यक्रम, शिक्षक खोज्नुहोस्...') ?></span>
                    <kbd class="hidden md:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-slate-900 text-slate-400 rounded border border-slate-800">Ctrl K</kbd>
                </button>
            </div>
        </div>
    </div>
</header>
