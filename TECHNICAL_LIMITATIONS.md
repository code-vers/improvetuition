# Technical Limitations

During the performance optimization process, certain hard limitations were identified based on the current architecture of the site. These items cannot be fully resolved without fundamental changes to the tech stack (e.g., introducing a static site generator or build pipeline).

## 1. Client-Side Header Injection (`fetch()`)
- **The Issue**: The `header.html` and `footer.html` components are injected into the page at runtime using JavaScript `fetch()` inside `app.js`.
- **The Impact**: The browser must first download the HTML, download and execute `app.js`, make a network request for `header.html`, and *then* parse/render the header and the logo. This creates an unavoidable delay for the Largest Contentful Paint (LCP) element (the logo).
- **The Fix**: The ultimate fix would be using a templating engine (like PHP, Eleventy, Next.js, or Astro) to bake the header directly into the HTML on the server.

## 2. Inline `<style>` Blocks (No Shared CSS)
- **The Issue**: The `assets/css/style.css` file is empty. The CSS for every page is written as inline `<style>` blocks within each HTML file (often duplicating thousands of lines of CSS).
- **The Impact**: The browser cannot cache the CSS across different pages. Users must download the CSS payload over and over again on every new page they visit, increasing transfer size (e.g., `index.html` is 148 KB).
- **The Fix**: Requires manually extracting all the inline `<style>` tags into a shared `main.css` file, which is out of scope for automated find-and-replace tools without a build pipeline.

## 3. Large `logo.png` Reference in Schema
- **The Issue**: The file `logo.png` in `/assets/images/` is **4.6 MB** in size.
- **The Impact**: Negligible. Fortunately, this image is only referenced as a string inside `<script type="application/ld+json">` tags (for Google Search Schema). Browsers do not download this file when rendering the page, so it does not hurt performance.
- **The Fix**: Left untouched to prevent breaking SEO schema, but the file could be downsized manually on the server.

## 4. OpenDyslexic Font CDN
- **The Issue**: The accessibility panel relies on `open-dyslexic.min.css` served from `cdnjs.cloudflare.com`.
- **The Impact**: Adds an external DNS lookup and render-blocking CSS request.
- **The Fix**: We updated it to a non-blocking `<link rel="preload">` pattern to mitigate the FCP delay while keeping the accessibility tools functional.
