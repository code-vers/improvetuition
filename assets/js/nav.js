(function () {
    'use strict';

    var header = document.getElementById('siteHeader');
    var menuToggle = document.getElementById('menuToggle');
    var drawer = document.getElementById('mobileDrawer');
    var overlay = document.getElementById('mobileOverlay');
    var drawerClose = document.getElementById('drawerClose');

    function onScroll() {
        header.classList.toggle('is-scrolled', window.scrollY > 10);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    function openDrawer() {
        drawer.classList.add('is-open');
        overlay.classList.add('is-open');
        menuToggle.setAttribute('aria-expanded', 'true');
        document.body.style.overflow = 'hidden';
    }
    function closeDrawer() {
        drawer.classList.remove('is-open');
        overlay.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
    }
    menuToggle.addEventListener('click', openDrawer);
    drawerClose.addEventListener('click', closeDrawer);
    overlay.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeDrawer();
    });

    document.querySelectorAll('.m-item[data-accordion] > .m-link').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var item = btn.parentElement;
            var isOpen = item.classList.contains('is-open');
            document.querySelectorAll('.m-item[data-accordion].is-open').forEach(function (other) {
                if (other !== item) other.classList.remove('is-open');
            });
            item.classList.toggle('is-open', !isOpen);
        });
    });

})();