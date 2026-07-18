(function () {
    'use strict';

    /* ── Accessibility panel: open / close ───────────────────────── */
    var launch = document.getElementById('a11yLaunch');
    var panel = document.getElementById('a11yPanel');

    function openPanel() {
        panel.classList.add('is-open');
        launch.setAttribute('aria-expanded', 'true');
    }
    function closePanel() {
        panel.classList.remove('is-open');
        launch.setAttribute('aria-expanded', 'false');
    }
    if (launch && panel) {
        launch.addEventListener('click', function (e) {
            e.stopPropagation();
            panel.classList.contains('is-open') ? closePanel() : openPanel();
        });
        // Click outside closes the panel.
        document.addEventListener('click', function (e) {
            if (panel.classList.contains('is-open') &&
                !panel.contains(e.target) && !launch.contains(e.target)) {
                closePanel();
            }
        });
        // Escape closes it.
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') closePanel();
        });
    }

    /* ── Text size (zoom) ────────────────────────────────────────── */
    var sizeBtns = document.querySelectorAll('.reading-btn[data-scale]');
    sizeBtns.forEach(function (btn) {
        btn.addEventListener('click', function () {
            sizeBtns.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
            btn.setAttribute('aria-pressed', 'true');
            var scale = parseInt(btn.getAttribute('data-scale'), 10) / 100;
            document.body.style.setProperty('--reading-zoom', scale);
        });
    });

    /* ── Body-class toggles (dyslexia, contrast, motion, calm, ruler) ─ */
    var toggles = document.querySelectorAll('.a11y-toggle[data-mode]');
    toggles.forEach(function (btn) {
        btn.addEventListener('click', function () {
            var mode = btn.getAttribute('data-mode');
            var exclusive = btn.getAttribute('data-exclusive');
            var nowOn = !document.body.classList.contains(mode);

            // High/Comfort contrast are mutually exclusive.
            if (nowOn && exclusive) {
                document.body.classList.remove(exclusive);
                var other = document.querySelector('.a11y-toggle[data-mode="' + exclusive + '"]');
                if (other) other.setAttribute('aria-pressed', 'false');
            }

            document.body.classList.toggle(mode, nowOn);
            btn.setAttribute('aria-pressed', nowOn ? 'true' : 'false');
        });
    });

    /* ── Colour tint ─────────────────────────────────────────────── */
    var tintSelect = document.getElementById('tintSelect');
    if (tintSelect) {
        tintSelect.addEventListener('change', function () {
            if (tintSelect.value === 'none') {
                document.body.removeAttribute('data-tint');
            } else {
                document.body.setAttribute('data-tint', tintSelect.value);
            }
        });
    }

    /* ── Reading ruler — follows the cursor when enabled ─────────── */
    var ruler = document.getElementById('readingRuler');
    if (ruler) {
        document.addEventListener('mousemove', function (e) {
            if (document.body.classList.contains('reading-ruler-on')) {
                ruler.style.top = e.clientY + 'px';
            }
        });
    }

    /* ── Read this page aloud (Web Speech API) ───────────────────── */
    var readPlay = document.getElementById('readPlay');
    var readStop = document.getElementById('readStop');
    var readVoice = document.getElementById('readVoice');
    var readSpeed = document.getElementById('readSpeed');
    var readSpeedOut = document.getElementById('readSpeedOut');
    var readLabel = document.getElementById('readPlayLabel');
    var readRow = document.getElementById('readAloudRow');

    var synth = window.speechSynthesis;
    if (!synth) {
        // No speech support — hide the read-aloud row entirely.
        if (readRow) readRow.style.display = 'none';
    } else {
        var voices = [];
        var utterances = [];
        var idx = 0;

        function loadVoices() {
            voices = synth.getVoices();
            if (!readVoice) return;
            readVoice.innerHTML = '';
            // Prefer English (UK) voices first.
            voices
                .map(function (v, i) { return { v: v, i: i }; })
                .sort(function (a, b) {
                    var au = /en-GB/i.test(a.v.lang) ? 0 : 1;
                    var bu = /en-GB/i.test(b.v.lang) ? 0 : 1;
                    return au - bu;
                })
                .forEach(function (o) {
                    var opt = document.createElement('option');
                    opt.value = o.i;
                    opt.textContent = o.v.name + ' (' + o.v.lang + ')';
                    readVoice.appendChild(opt);
                });
        }
        loadVoices();
        if (typeof synth.onvoiceschanged !== 'undefined') {
            synth.onvoiceschanged = loadVoices;
        }

        // Gather readable text from the main content, chunked by block.
        function buildChunks() {
            var main = document.getElementById('main-content');
            if (!main) return [];
            var nodes = main.querySelectorAll('h1, h2, h3, p, li, summary');
            var out = [];
            nodes.forEach(function (n) {
                var t = (n.innerText || n.textContent || '').trim();
                if (t.length > 1) out.push(t);
            });
            return out;
        }

        function setPlayState(state) {
            readPlay.setAttribute('data-state', state);
            readLabel.textContent = state === 'playing' ? 'Pause' : 'Play';
        }

        function speakFrom(start) {
            var chunks = buildChunks();
            utterances = [];
            idx = start || 0;
            var voice = voices[parseInt(readVoice && readVoice.value, 10)] || null;
            var rate = parseFloat(readSpeed ? readSpeed.value : 1) || 1;

            function speakNext() {
                if (idx >= chunks.length) { setPlayState('idle'); return; }
                var u = new SpeechSynthesisUtterance(chunks[idx]);
                if (voice) u.voice = voice;
                u.rate = rate;
                u.lang = voice ? voice.lang : 'en-GB';
                u.onend = function () { idx++; speakNext(); };
                synth.speak(u);
            }
            setPlayState('playing');
            speakNext();
        }

        readPlay.addEventListener('click', function () {
            if (synth.speaking && !synth.paused) {
                synth.pause();
                setPlayState('idle');
            } else if (synth.paused) {
                synth.resume();
                setPlayState('playing');
            } else {
                speakFrom(0);
            }
        });

        readStop.addEventListener('click', function () {
            synth.cancel();
            setPlayState('idle');
        });

        if (readSpeed && readSpeedOut) {
            readSpeed.addEventListener('input', function () {
                readSpeedOut.textContent = parseFloat(readSpeed.value).toFixed(1) + '×';
            });
        }

        // Stop speech if the user leaves the page.
        window.addEventListener('beforeunload', function () { synth.cancel(); });
    }

    /* ── Reset all reading options ───────────────────────────────── */
    var reset = document.getElementById('a11yReset');
    if (reset) {
        reset.addEventListener('click', function () {
            // Text size
            document.body.style.removeProperty('--reading-zoom');
            sizeBtns.forEach(function (b, i) {
                b.setAttribute('aria-pressed', i === 0 ? 'true' : 'false');
            });
            // Body-class modes
            ['dyslexia-mode', 'high-contrast', 'comfort-contrast',
                'reduce-motion', 'calm-layout', 'reading-ruler-on',
                'focus-dim', 'reading-space', 'highlight-links', 'big-targets'].forEach(function (m) {
                    document.body.classList.remove(m);
                });
            toggles.forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
            // Tint
            document.body.removeAttribute('data-tint');
            if (tintSelect) tintSelect.value = 'none';
            // Speech
            if (window.speechSynthesis) window.speechSynthesis.cancel();
        });
    }
})();

(function () {
    'use strict';
    var toggle = document.getElementById('menuToggle');
    var drawer = document.getElementById('drawer');
    var overlay = document.getElementById('drawerOverlay');
    var closeBtn = document.getElementById('drawerClose');
    var header = document.getElementById('siteHeader');
    var body = document.body;

    if (toggle && drawer && overlay && closeBtn) {
        function openDrawer() {
            drawer.classList.add('is-open');
            overlay.classList.add('is-open');
            drawer.setAttribute('aria-hidden', 'false');
            overlay.setAttribute('aria-hidden', 'false');
            toggle.setAttribute('aria-expanded', 'true');
            body.classList.add('drawer-open');
            setTimeout(function () { closeBtn.focus(); }, 50);
        }
        function closeDrawer() {
            drawer.classList.remove('is-open');
            overlay.classList.remove('is-open');
            drawer.setAttribute('aria-hidden', 'true');
            overlay.setAttribute('aria-hidden', 'true');
            toggle.setAttribute('aria-expanded', 'false');
            body.classList.remove('drawer-open');
            toggle.focus();
        }
        toggle.addEventListener('click', openDrawer);
        closeBtn.addEventListener('click', closeDrawer);
        overlay.addEventListener('click', closeDrawer);
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeDrawer();
        });
        // In-page links close the drawer before scrolling.
        drawer.querySelectorAll('a[href^="#"]').forEach(function (a) {
            a.addEventListener('click', closeDrawer);
        });
        // Tuition-options accordion (one open at a time) — old format-card style.
        drawer.querySelectorAll('.format-card').forEach(function (card) {
            card.addEventListener('click', function () {
                var group = card.parentElement;
                var isOpen = group.classList.contains('is-open');
                drawer.querySelectorAll('.format-group').forEach(function (g) {
                    g.classList.remove('is-open');
                    var btn = g.querySelector('.format-card');
                    if (btn) btn.setAttribute('aria-expanded', 'false');
                });
                if (!isOpen) { group.classList.add('is-open'); card.setAttribute('aria-expanded', 'true'); }
            });
        });
        // New accordion-style drawer menu (.acc-head buttons).
        drawer.querySelectorAll('.acc-head').forEach(function (btn) {
            btn.addEventListener('click', function () {
                var acc = btn.closest('.acc');
                var open = acc.classList.toggle('open');
                btn.setAttribute('aria-expanded', open ? 'true' : 'false');
            });
        });
    }

    // Category strip chevron — scrolls the strip and hides itself at the end.
    var catInner = document.getElementById('catNavInner');
    var catNext = document.getElementById('catNext');
    if (catInner && catNext) {
        function updateCatNav() {
            var atEnd = catInner.scrollLeft + catInner.clientWidth >= catInner.scrollWidth - 4;
            catNext.classList.toggle('is-hidden', atEnd);
            catInner.classList.toggle('is-end', atEnd);
        }
        catNext.addEventListener('click', function () {
            catInner.scrollBy({ left: Math.round(catInner.clientWidth * 0.7), behavior: 'smooth' });
        });
        catInner.addEventListener('scroll', updateCatNav, { passive: true });
        window.addEventListener('resize', updateCatNav);
        updateCatNav();
    }

    // Header gains a shadow once the page is scrolled.
    if (header) {
        function onHeaderScroll() { header.classList.toggle('is-scrolled', window.scrollY > 10); }
        window.addEventListener('scroll', onHeaderScroll, { passive: true });
        onHeaderScroll();
    }
})();

