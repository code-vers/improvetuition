document.addEventListener("DOMContentLoaded", function () {
    const navPlaceholder = document.getElementById('navbar-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');

    if (navPlaceholder) {
        fetch('/navbar.html')
            .then(res => res.text())
            .then(data => {
                navPlaceholder.innerHTML = data;
                // Execute scripts in the loaded HTML
                const scripts = navPlaceholder.querySelectorAll('script');
                scripts.forEach(oldScript => {
                    const newScript = document.createElement('script');
                    Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                    newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                    oldScript.parentNode.replaceChild(newScript, oldScript);
                });
            })
            .catch(err => console.error('Failed to load navbar:', err));
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
