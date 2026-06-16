document.addEventListener("DOMContentLoaded", function () {
    const headerPlaceholder = document.getElementById('header-placeholder');
    const headerPhonePlaceholder = document.getElementById('header-phone-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');

    function injectHTML(placeholder, url) {
        fetch(url)
            .then(res => res.text())
            .then(data => {
                placeholder.innerHTML = data;
                // Re-execute any scripts inside the loaded HTML
                const scripts = placeholder.querySelectorAll('script');
                scripts.forEach(oldScript => {
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
        fetch('/footer.html')
            .then(res => res.text())
            .then(data => {
                footerPlaceholder.innerHTML = data;
            })
            .catch(err => console.error('Failed to load footer:', err));
    }
});
