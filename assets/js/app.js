document.addEventListener("DOMContentLoaded", function () {
    const headerPlaceholder = document.getElementById('header-placeholder');
    const headerPhonePlaceholder = document.getElementById('header-phone-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');
    const assessFormPlaceholder = document.getElementById('free-assessment-form-placeholder');

    function injectHTML(placeholder, url) {
        fetch(url)
            .then(res => res.text())
            .then(data => {
                placeholder.innerHTML = data;
                // Re-execute any scripts/styles inside the loaded HTML
                placeholder.querySelectorAll('script').forEach(oldScript => {
                    const newScript = document.createElement('script');
                    Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                    newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                    oldScript.parentNode.replaceChild(newScript, oldScript);
                });
            })
            .catch(err => console.error('Failed to load ' + url + ':', err));
    }

    if (headerPlaceholder) {
        injectHTML(headerPlaceholder, '/header.html');
    }

    if (headerPhonePlaceholder) {
        injectHTML(headerPhonePlaceholder, '/header_with_phone.html');
    }

    if (footerPlaceholder) {
        injectHTML(footerPlaceholder, '/footer.html');
    }

    if (assessFormPlaceholder) {
        injectHTML(assessFormPlaceholder, '/free-assessment-request-form.html');
    }

    // ── Sticky Contact Bar — injected directly into body so it always renders ──
    var style = document.createElement('style');
    style.textContent = [
        '.global-contact-bar{position:fixed;bottom:0;left:0;right:0;z-index:2000;display:grid;grid-template-columns:1fr 1fr 1fr;box-shadow:0 -4px 16px rgba(36,47,58,.18)}',
        '.global-contact-bar-btn{display:flex;align-items:center;justify-content:center;gap:10px;padding:16px 12px;font-family:"Nunito Sans",system-ui,sans-serif;font-size:15px;font-weight:700;letter-spacing:.02em;color:#fff;text-decoration:none;transition:background-color .15s ease;min-height:60px;text-align:center}',
        '.global-contact-bar-btn--book{background:#D55A3F}.global-contact-bar-btn--book:hover{background:#B14526}',
        '.global-contact-bar-btn--call{background:#242F3A}.global-contact-bar-btn--call:hover{background:#1a2530}',
        '.global-contact-bar-btn--whatsapp{background:#25D366;color:#04391d}.global-contact-bar-btn--whatsapp:hover{background:#1ebe57}',
        '.global-contact-bar-btn svg{width:20px;height:20px;flex-shrink:0}',
        'body{padding-bottom:60px}',
        '@media(min-width:700px){.global-contact-bar-btn{font-size:16px;padding:18px 14px;min-height:64px}body{padding-bottom:64px}}',
        '@media(max-width:420px){.global-contact-bar-btn{font-size:12.5px;padding:14px 6px;gap:5px;letter-spacing:0}.global-contact-bar-btn svg{width:16px;height:16px}}'
    ].join('');
    document.head.appendChild(style);

    var bar = document.createElement('nav');
    bar.className = 'global-contact-bar';
    bar.setAttribute('aria-label', 'Quick contact');
    bar.innerHTML = [
        '<a class="global-contact-bar-btn global-contact-bar-btn--book" href="#start">',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 6L9 17l-5-5"/></svg>',
        'Free assessment</a>',
        '<a class="global-contact-bar-btn global-contact-bar-btn--call" href="tel:+447951918152">',
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>',
        'Call us</a>',
        '<a class="global-contact-bar-btn global-contact-bar-btn--whatsapp" href="https://wa.me/447951918152" target="_blank" rel="noopener">',
        '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38a9.9 9.9 0 0 0 4.79 1.22h.01c5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm5.8 14.17c-.24.68-1.42 1.31-1.95 1.36-.5.05-.96.24-3.23-.67-2.72-1.07-4.46-3.84-4.6-4.02-.13-.18-1.1-1.47-1.1-2.8 0-1.33.7-1.99.95-2.26.24-.27.53-.34.71-.34l.5.01c.16.01.38-.06.59.45.24.58.81 2 .88 2.14.07.14.12.31.02.49-.09.18-.14.3-.27.46-.13.16-.28.36-.4.48-.13.13-.27.28-.12.54.16.27.7 1.15 1.5 1.86 1.04.93 1.91 1.21 2.18 1.35.27.13.43.11.59-.07.16-.18.68-.79.86-1.06.18-.27.36-.22.6-.13.25.09 1.57.74 1.84.87.27.14.45.2.51.31.07.11.07.65-.17 1.32z"/></svg>',
        'WhatsApp</a>'
    ].join('');
    document.body.appendChild(bar);

    // ── Global Web3Forms Submission Handler ──
    document.addEventListener('submit', function (e) {
        if (e.target && e.target.tagName === 'FORM' && e.target.getAttribute('action') === 'https://api.web3forms.com/submit') {
            e.preventDefault();
            const form = e.target;

            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const submitBtn = form.querySelector('button[type="submit"]') || form.querySelector('input[type="submit"]');
            const originalBtnText = submitBtn ? (submitBtn.innerHTML || submitBtn.value) : '';
            if (submitBtn) {
                submitBtn.disabled = true;
                if (submitBtn.tagName === 'BUTTON') {
                    submitBtn.innerHTML = 'Sending...';
                } else {
                    submitBtn.value = 'Sending...';
                }
            }

            const formData = new FormData(form);

            // Check for Web3Forms access key, if not set, maybe it's in the form already.
            const object = Object.fromEntries(formData);
            const json = JSON.stringify(object);

            fetch('https://api.web3forms.com/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: json
            })
                .then(async (response) => {
                    let jsonResponse = await response.json();
                    if (response.status == 200) {
                        form.innerHTML = '<div style="grid-column: 1 / -1; width: 100%; box-sizing: border-box; padding: 24px; text-align: center; background: #f0fdf4; color: #15803d; border: 1px solid #bbf7d0; border-radius: 8px; font-weight: 600; font-family: var(--font-ui, system-ui, sans-serif); margin-top: 1rem;"><svg style="width: 48px; height: 48px; margin-bottom: 12px; display: inline-block; color: #22c55e;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg><br><h3 style="margin:0 0 8px; color:#166534; font-size:1.25rem;">Thank you!</h3><p style="margin:0; font-weight:400; color:#15803d;">Your enquiry has been received. We will be in touch within 1 working day.</p></div>';
                    } else {
                        console.error(response);
                        alert(jsonResponse.message || "Something went wrong!");
                        if (submitBtn) {
                            submitBtn.disabled = false;
                            if (submitBtn.tagName === 'BUTTON') {
                                submitBtn.innerHTML = originalBtnText;
                            } else {
                                submitBtn.value = originalBtnText;
                            }
                        }
                    }
                })
                .catch(error => {
                    console.error(error);
                    alert("Something went wrong! Please try again later.");
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        if (submitBtn.tagName === 'BUTTON') {
                            submitBtn.innerHTML = originalBtnText;
                        } else {
                            submitBtn.value = originalBtnText;
                        }
                    }
                });
        }
    });
});