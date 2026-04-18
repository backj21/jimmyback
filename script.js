/* ============================================================
   script.js — Jimmy Back Portfolio
   ============================================================ */

(function() {
    // ---------- Footer year ----------
    const footerYear = document.getElementById('footer-year');
    if (footerYear) {
        footerYear.textContent = new Date().getFullYear();
    }

    // ---------- Scroll reveal (IntersectionObserver) ----------
    const observerOptions = {
        root: null,
        rootMargin: '0px 0px -20px 0px',
        threshold: 0
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // ---------- Fallback for immediate visibility ----------
    // Ensures elements above the fold are shown if observer delays
    setTimeout(() => {
        document.querySelectorAll('.reveal').forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight) {
                el.classList.add('visible');
            }
        });
    }, 150);
})();
