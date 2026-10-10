<?php
declare(strict_types=1);

/**
 * Ishwari Secondary School - Official Institutional Web Portal
 * Primary Web Root Entry & Front Controller
 */

require_once __DIR__ . '/frontend/php/main.php';

// Dispatch request to Frontend AppKernel
\Frontend\AppKernel::run();
