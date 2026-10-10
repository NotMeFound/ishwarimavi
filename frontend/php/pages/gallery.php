<?php
declare(strict_types=1);

namespace App\Views;

use App\Context\AppControl;

$app = AppControl::getInstance();

$items = [
    ['title_en' => 'Secondary Science Lab Practical Examination', 'title_np' => 'विज्ञान प्रयोगशालामा विद्यार्थीहरूको प्रयोगात्मक अभ्यास', 'category' => 'Science', 'icon' => '🔬'],
    ['title_en' => 'Annual Inter-House Volleyball Championship', 'title_np' => 'वार्षिक अन्तर-सदन भलिबल प्रतियोगिता', 'category' => 'Sports', 'icon' => '🏐'],
    ['title_en' => 'Digital Smart Classroom Pedagogy Session', 'title_np' => 'डिजिटल स्मार्ट बोर्डबाट पठनपाठन', 'category' => 'Academics', 'icon' => '💻'],
    ['title_en' => 'Saraswati Puja Cultural Celebration', 'title_np' => 'श्रीपञ्चमी तथा सरस्वती पूजा महोत्सव', 'category' => 'Culture', 'icon' => '🌸'],
    ['title_en' => 'Community Cleanliness & Tree Plantation Drive', 'title_np' => 'सामुदायिक सरसफाइ तथा वृक्षारोपण कार्यक्रम', 'category' => 'Community', 'icon' => '🌱'],
    ['title_en' => 'District Robotics Demonstration by Students', 'title_np' => 'रोबोटिक्स परियोजनाको सफल प्रदर्शन', 'category' => 'Science', 'icon' => '🤖']
];
?>
<div class="py-12 bg-white dark:bg-slate-950">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div class="border-b border-slate-200 dark:border-slate-800 pb-6">
            <span class="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400"><?= $app->t('Visual Archive', 'तस्बिर पुस्तिका') ?></span>
            <h1 class="text-3xl font-extrabold text-slate-900 dark:text-white mt-1"><?= $app->t('Campus Life & Activities Gallery', 'शैक्षिक तथा अतिरिक्त क्रियाकलापका झलकहरू') ?></h1>
            <p class="text-sm text-slate-500 mt-2 max-w-3xl leading-relaxed">
                <?= $app->t('Highlights from academic competitions, cultural programs, sports meets, and community engagement at Ishwari Secondary School.', 'विद्यालय परिसरमा सञ्चालित विविध शैक्षिक, सांस्कृतिक र खेलकुद गतिविधिहरूको तस्बिर संग्रह।') ?>
            </p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <?php foreach ($items as $item): ?>
                <div class="rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 shadow-sm flex flex-col">
                    <div class="h-44 bg-slate-800 flex items-center justify-center text-5xl text-slate-300">
                        <?= $item['icon'] ?>
                    </div>
                    <div class="p-4 space-y-1">
                        <span class="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400"><?= $item['category'] ?></span>
                        <h2 class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                            <?= $app->e($app->t($item['title_en'], $item['title_np'])) ?>
                        </h2>
                    </div>
                </div>
            <?php endforeach; ?>
        </div>
    </div>
</div>
