<?php
declare(strict_types=1);

namespace App\Components;

use App\Context\AppControl;

$app = AppControl::getInstance();
?>
<div id="search-modal" class="fixed inset-0 z-50 hidden bg-slate-950/80 backdrop-blur-sm flex items-start justify-center pt-20 px-4" onclick="if(event.target === this) this.classList.add('hidden')">
    <div class="w-full max-w-xl bg-white dark:bg-slate-900 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div class="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <svg class="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="text" id="modal-search-input" placeholder="<?= $app->t('Type to search notices, programs, staff, events...', 'सूचना, कार्यक्रम, शिक्षक, पूर्वाधार खोज्न टाइप गर्नुहोस्...') ?>" class="w-full bg-transparent border-none text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-0" autofocus />
            <button type="button" onclick="document.getElementById('search-modal').classList.add('hidden')" class="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 font-mono">ESC</button>
        </div>

        <div id="search-modal-results" class="max-h-80 overflow-y-auto p-4 divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            <p class="text-slate-500 text-center py-6"><?= $app->t('Start typing to see instant institutional records...', 'खोज्नको लागि कम्तिमा २ अक्षर टाइप गर्नुहोस्...') ?></p>
        </div>

        <div class="p-2.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 flex justify-between px-4">
            <span><?= $app->t('Press ESC to close', 'बन्द गर्न ESC थिच्नुहोस्') ?></span>
            <span>Ishwari Secondary School Directory</span>
        </div>
    </div>
</div>

<script>
document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        const modal = document.getElementById('search-modal');
        if (modal) {
            modal.classList.toggle('hidden');
            if (!modal.classList.contains('hidden')) {
                setTimeout(() => document.getElementById('modal-search-input')?.focus(), 50);
            }
        }
    }
    if (e.key === 'Escape') {
        document.getElementById('search-modal')?.classList.add('hidden');
    }
});

document.getElementById('modal-search-input')?.addEventListener('input', function(e) {
    const q = e.target.value.trim();
    const resultsContainer = document.getElementById('search-modal-results');
    if (!resultsContainer) return;
    if (q.length < 1) {
        resultsContainer.innerHTML = '<p class="text-slate-500 text-center py-6">Start typing to see instant institutional records...</p>';
        return;
    }

    fetch('/views/app.php?api=search&q=' + encodeURIComponent(q))
        .then(res => res.json())
        .then(data => {
            if (!data || data.length === 0) {
                resultsContainer.innerHTML = '<p class="text-slate-500 text-center py-6">No matching records found.</p>';
                return;
            }
            resultsContainer.innerHTML = data.map(item => `
                <a href="${item.url}" class="block py-2.5 px-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition flex items-center justify-between">
                    <div>
                        <span class="text-[10px] font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded mr-2">${item.type}</span>
                        <span class="text-slate-800 dark:text-slate-200 font-medium">${item.title}</span>
                    </div>
                    <span class="text-slate-400 text-[10px]">View →</span>
                </a>
            `).join('');
        })
        .catch(() => {
            resultsContainer.innerHTML = '<p class="text-red-500 text-center py-4">Search service unavailable.</p>';
        });
});
</script>
