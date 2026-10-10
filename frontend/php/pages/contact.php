<?php
declare(strict_types=1);

namespace App\Views;

use App\Context\AppControl;

$app = AppControl::getInstance();
$school = $app->getData()['school'];
$csrfToken = $app->getCsrfToken();

$messageSent = false;
$error = null;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $submittedCsrf = $_POST['csrf_token'] ?? '';
    $honeypot = $_POST['website_url'] ?? '';

    if (!empty($honeypot)) {
        // Honeypot triggered
        $error = "Spam detected.";
    } elseif (!$app->verifyCsrf($submittedCsrf)) {
        $error = "Security token invalid. Please refresh and try again.";
    } else {
        $name = trim((string)($_POST['name'] ?? ''));
        $email = trim((string)($_POST['email'] ?? ''));
        $subject = trim((string)($_POST['subject'] ?? ''));
        $message = trim((string)($_POST['message'] ?? ''));

        if ($name === '' || $email === '' || $message === '') {
            $error = $app->t('Please complete all required fields.', 'कृपया सबै अनिवार्य विवरणहरू भर्नुहोस्।');
        } else {
            $messageSent = true;
        }
    }
}
?>
<div class="py-12 bg-white dark:bg-slate-950">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div class="border-b border-slate-200 dark:border-slate-800 pb-6">
            <span class="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400"><?= $app->t('Official Coordinates', 'सम्पर्क विवरण') ?></span>
            <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white mt-1"><?= $app->t('Contact & Visit Our Campus', 'विद्यालय प्रशासनसँग सम्पर्क गर्नुहोस्') ?></h1>
            <p class="text-sm text-slate-500 mt-2 max-w-3xl leading-relaxed">
                <?= $app->t('Our administration and admission inquiry desk is open Sunday through Friday from 9:30 AM to 4:30 PM.', 'विद्यालय प्रशासन तथा भर्ना परामर्श कक्ष आइतबारदेखि शुक्रबारसम्म बिहान ९:३० देखि अपराह्न ४:३० सम्म खुला रहनेछ।') ?>
            </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
            <!-- Left Info Panel (5 cols) -->
            <div class="lg:col-span-5 space-y-6">
                <div class="p-6 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-4">
                    <h2 class="text-base font-bold text-slate-900 dark:text-white"><?= $app->t('Institutional Address', 'कार्यालयको ठेगाना') ?></h2>
                    
                    <div class="space-y-3 text-xs text-slate-600 dark:text-slate-300">
                        <p class="flex items-start gap-2">
                            <span class="text-base">📍</span>
                            <span><strong><?= $app->t('Location:', 'स्थान:') ?></strong> <?= $app->e($app->t($school['address_en'], $school['address_np'])) ?></span>
                        </p>
                        <p class="flex items-center gap-2">
                            <span class="text-base">📞</span>
                            <span><strong><?= $app->t('Phone:', 'फोन:') ?></strong> <?= $app->e($school['phone']) ?></span>
                        </p>
                        <p class="flex items-center gap-2">
                            <span class="text-base">✉️</span>
                            <span><strong><?= $app->t('Official Email:', 'इमेल:') ?></strong> <?= $app->e($school['email']) ?></span>
                        </p>
                        <p class="flex items-center gap-2">
                            <span class="text-base">🕒</span>
                            <span><strong><?= $app->t('Office Hours:', 'समय:') ?></strong> <?= $app->t('Sunday – Friday: 9:30 AM – 4:30 PM', 'आइतबार – शुक्रबार: बिहान ९:३० – अपराह्न ४:३०') ?></span>
                        </p>
                    </div>
                </div>

                <div class="p-5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-500 space-y-2">
                    <p class="font-semibold text-slate-900 dark:text-white"><?= $app->t('Public Transport Directions', 'यातायात तथा मार्ग निर्देशन') ?></p>
                    <p><?= $app->t('Direct public bus connectivity from the main city highway junction. School buses ply across all major feeder routes.', 'सहरको मुख्य चोकबाट सिधा बस तथा माइक्रो सुविधा। साथै विद्यालयको आफ्नै बस सेवा उपलब्ध।') ?></p>
                </div>
            </div>

            <!-- Right Form Panel (7 cols) -->
            <div class="lg:col-span-7">
                <div class="p-8 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm space-y-6">
                    <h2 class="text-lg font-bold text-slate-900 dark:text-white"><?= $app->t('Send an Institutional Inquiry', 'सोधपुछ वा गुनासो पठाउनुहोस्') ?></h2>

                    <?php if ($messageSent): ?>
                        <div class="p-4 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 text-xs">
                            ✓ <?= $app->t('Thank you. Your inquiry has been dispatched to the administration office.', 'धन्यवाद। तपाईंको सोधपुछ विद्यालय प्रशासनमा दर्ता भएको छ।') ?>
                        </div>
                    <?php endif; ?>

                    <?php if ($error): ?>
                        <div class="p-4 rounded bg-red-50 dark:bg-red-950/40 border border-red-500/30 text-red-800 dark:text-red-300 text-xs">
                            ⚠ <?= $app->e($error) ?>
                        </div>
                    <?php endif; ?>

                    <form action="/contact.php" method="POST" class="space-y-4 text-xs">
                        <input type="hidden" name="csrf_token" value="<?= $app->e($csrfToken) ?>">
                        <!-- Honeypot anti-spam field -->
                        <div class="hidden" aria-hidden="true">
                            <input type="text" name="website_url" tabindex="-1" autocomplete="off">
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div class="space-y-1">
                                <label class="font-semibold text-slate-700 dark:text-slate-300"><?= $app->t('Full Name *', 'पुरा नाम *') ?></label>
                                <input type="text" name="name" required class="w-full px-3 py-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500" />
                            </div>
                            <div class="space-y-1">
                                <label class="font-semibold text-slate-700 dark:text-slate-300"><?= $app->t('Email Address *', 'इमेल ठेगाना *') ?></label>
                                <input type="email" name="email" required class="w-full px-3 py-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500" />
                            </div>
                        </div>

                        <div class="space-y-1">
                            <label class="font-semibold text-slate-700 dark:text-slate-300"><?= $app->t('Subject *', 'विषय *') ?></label>
                            <input type="text" name="subject" required placeholder="e.g. Admission Inquiry Grade 11" class="w-full px-3 py-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500" />
                        </div>

                        <div class="space-y-1">
                            <label class="font-semibold text-slate-700 dark:text-slate-300"><?= $app->t('Your Message *', 'सन्देश विवरण *') ?></label>
                            <textarea name="message" rows="4" required class="w-full px-3 py-2 rounded bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"></textarea>
                        </div>

                        <button type="submit" class="px-5 py-2.5 rounded font-semibold bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-sm">
                            <?= $app->t('Submit Inquiry →', 'पठाउनुहोस् →') ?>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </div>
</div>
