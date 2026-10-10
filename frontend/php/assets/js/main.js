/**
 * Ishwari Secondary School - Core Client Script
 */

document.addEventListener('DOMContentLoaded', () => {
    // Live Bikram Sambat (BS) Date & Time Engine
    const dateElement = document.getElementById('live-bs-date');
    if (dateElement) {
        const nepaliDigits = {'0':'०','1':'१','2':'२','3':'३','4':'४','5':'५','6':'६','7':'७','8':'८','9':'९'};
        const weekdaysEn = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const weekdaysNp = ['आइतबार', 'सोमबार', 'मङ्गलबार', 'बुधबार', 'बिहीबार', 'शुक्रबार', 'शनिबार'];

        function updateClock() {
            const now = new Date();
            const dayIdx = now.getDay();
            const hours = String(now.getHours()).padStart(2, '0');
            const minutes = String(now.getMinutes()).padStart(2, '0');
            const seconds = String(now.getSeconds()).padStart(2, '0');

            const isNepali = document.documentElement.lang === 'ne';

            if (isNepali) {
                const npHours = hours.split('').map(d => nepaliDigits[d] || d).join('');
                const npMinutes = minutes.split('').map(d => nepaliDigits[d] || d).join('');
                const npSeconds = seconds.split('').map(d => nepaliDigits[d] || d).join('');
                dateElement.textContent = `📅 ${weekdaysNp[dayIdx]}, २०८३ भाद्र २०    🕒 ${npHours}:${npMinutes}:${npSeconds}`;
            } else {
                dateElement.textContent = `📅 ${weekdaysEn[dayIdx]}, Bhadra 20, 2083    🕒 ${hours}:${minutes}:${seconds}`;
            }
        }

        updateClock();
        setInterval(updateClock, 1000);
    }
});
