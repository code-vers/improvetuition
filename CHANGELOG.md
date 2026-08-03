# Changelog — Frontend Performance Optimization
**Date:** July 30, 2026

## Phase 1: Backup
- Created a complete backup archive: `../improvetuition_backup_20260730.zip` (6.0 MB)

## Phase 2: Font Self-Hosting Setup
- Created `/assets/css/fonts.css` with `@font-face` rules for `Caveat`, `DM Sans`, `Fraunces`, `Lora`, and `Nunito Sans`.
- Pointed the `@font-face` sources to the downloaded `.woff2` files.
- Added `font-display: swap` to all font declarations to prevent invisible text during load.
- Deleted the old `.ttf` font folders (`Caveat`, `DM_Sans`, `Fraunces`, `Lora`, `Nunito`, `Nunito_Sans`) to save ~15MB of disk space.

## Phase 3: Shared Component Optimization
- Modified `header.html`:
  - Replaced Google Fonts preconnect and stylesheet links with local `/assets/css/fonts.css`.
  - Added `dns-prefetch` for Web3Forms API.
  - Replaced `<img src="/assets/images/logo_3.png">` with a `<picture>` tag serving `logo_3.webp` fallback to `.png`.
  - Added `width="1300" height="433"` to the logo.
  - Added `fetchpriority="high"` and `decoding="async"` to the logo image.
  - Updated generic `alt="Logo"` to descriptive `alt="Improve Tuition logo"`.
- Modified `header_with_phone.html`:
  - Applied the exact same font and logo picture tag replacements as `header.html` (including the secondary logo in the drawer).
- Modified `navbar.html`:
  - Replaced Google Fonts with local `/assets/css/fonts.css`.

## Phase 4: Script Defer & Fonts (All 48 Pages)
- Bulk updated all 48 `.html` pages.
- Replaced `<script src="/assets/js/app.js"></script>` with `<script src="/assets/js/app.js" defer></script>` across 46 files that were missing it.
- Replaced standalone Google Fonts blocks with `<link rel="stylesheet" href="/assets/css/fonts.css">` across 49 instances to ensure consistency.

## Phase 5: Image Optimization
- Converted `logo_3.png` (240 KB) to `logo_3.webp`.
- Converted `logo-2.png` (53 KB) to `logo-2.webp`.
- Converted `logo_full.png` (320 KB) to `logo_full.webp`.
- Verified all other images had correct `loading="lazy"` and dimension attributes.

## Phase 6: Documentation
- Generated `CHANGELOG.md`.
- Generated `PAGESPEED_REPORT.md`.
- Generated `TECHNICAL_LIMITATIONS.md`.
