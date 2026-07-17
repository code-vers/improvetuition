# Improve Tuition Library — Deployment Guide for Imran

## What this is

A folder of Maths lesson pages and 100-question papers for Grades 1–3, ready to
put on improvetuition.org. Every page is:

- Standalone valid HTML with its own schema.org JSON-LD (SEO ready)
- Mobile-first, self-contained (no external images, no third-party libs)
- Marked with clear comment tags around the lesson content so you can wrap it
  in the site header and footer without touching the lesson itself

## The URL scheme

```
improvetuition.org/library/                                          → library index
improvetuition.org/library/place-value-grade-1-lesson/               → lesson
improvetuition.org/library/place-value-grade-1-100-questions/        → 100Q paper
improvetuition.org/library/decimals-grade-2-lesson/                  → lesson
... etc
```

All schema JSON-LD blocks and internal links already use these URLs. Just drop
the files at the matching paths on the server.

## Folder structure

```
deploy/
├── library/
│   ├── index.html                                    ← /library/
│   ├── place-value-grade-1-lesson/index.html         ← /library/place-value-grade-1-lesson/
│   ├── place-value-grade-1-100-questions/index.html
│   ├── decimals-grade-2-lesson/index.html
│   ...
└── IMRAN_README.md                                   ← this file
```

Copy the whole `library/` folder into your web root at `/library/`.

## The one thing you need to do — wrap each page in the site header/footer

Every page has these two comment markers around the lesson body:

```html
<body>
<!-- IMPROVETUITION:CONTENT-START -->
   ... lesson content ...
<!-- IMPROVETUITION:CONTENT-END -->
</body>
```

Everything between those two markers is what pupils should see. The site
header/footer wraps around it.

## Three ways to do the wrap — pick the one that matches your setup

### Option A: WordPress with a custom page template (recommended)

1. In your theme, create `page-library-item.php`:

```php
<?php
/* Template Name: Library Item */
get_header();
$html = file_get_contents(get_template_directory() . '/library-content/' . get_query_var('lesson_slug') . '.html');
if (preg_match('/<!-- IMPROVETUITION:CONTENT-START -->(.*?)<!-- IMPROVETUITION:CONTENT-END -->/s', $html, $matches)) {
    echo $matches[1];
}
get_footer();
?>
```

2. In `functions.php`, register the URL structure.

### Option B: Static Apache/Nginx serving with header/footer includes

Simplest: leave the HTML files as-is and let them serve themselves. Then add a
JavaScript snippet that inserts your site header/footer at the top/bottom of
`<body>` on load. Add this to every page (or use a template edit script):

```html
<script>
// Simple client-side site chrome injection
document.addEventListener('DOMContentLoaded', () => {
  const header = document.createElement('div');
  header.innerHTML = '<!-- your site header HTML here -->';
  document.body.prepend(header);
  const footer = document.createElement('div');
  footer.innerHTML = '<!-- your site footer HTML here -->';
  document.body.append(footer);
});
</script>
```

Downsides: slower first paint, requires JS, not great for SEO if header contains
important links.

### Option C: Server-side include (SSI) or PHP passthrough

If your host supports SSI, put an SSI directive at the top of each lesson HTML
that includes your header, and one at the bottom for the footer. Or write a
one-time PHP script that reads the HTML file and outputs:

```
[site header]
[everything between CONTENT-START and CONTENT-END]
[site footer]
```

## Deployment checklist

1. Copy `deploy/library/` folder to your web root at `/library/`
2. Set up URL rewriting so `/library/place-value-grade-1-lesson/` serves
   `library/place-value-grade-1-lesson/index.html`
   (usually automatic if your web server treats folders with `index.html` as the
   default document — most do)
3. Add a link to `/library/` from the main site navigation
4. Test 3–5 pages manually. Make sure:
   - Header/footer show up correctly
   - The lesson content renders (six-facts card, worked examples, practice)
   - Marking works (type in a practice answer, click "Mark all")
   - The "Ready for more" link at the bottom of a lesson leads to the correct
     100Q paper URL
5. Submit the /library/ URL to Google Search Console
6. Add a sitemap entry pointing to every /library/... URL

## What's included in this deployment

**Grade 1 — 10/10 topics complete (lesson + 100Q paper each):**
- Place Value, Ordering Numbers, Rounding, Time, Money
- (5 pre-existing topics from earlier work: column arithmetic, division, etc.)

**Grade 2 — 8/10 topics complete:**
- Decimals, Percentages, Metric Conversions, Estimation, Averages
- (3 pre-existing: Factors/Multiples/Primes, BIDMAS, Fractions)

**Grade 3 — 8/10 topics complete:**
- Sequences, Angles
- (6 pre-existing topics from earlier work)

**Other topic pages** (older, single-file style — no separate paper): Coordinates,
Ratio, Substitution, Linear Equations, and several more.

## Notes on SEO

Every lesson and 100Q page includes a full schema.org JSON-LD block with:

- `LearningResource` markup (educational content signal)
- `FAQPage` on lessons (6 FAQs built from the six-facts card)
- `Quiz` on 100Q papers (marked as 100 questions)
- `EducationalOrganization` + `LocalBusiness` for Improve Tuition
- Canonical URL to `improvetuition.org/library/...`

No AggregateRating in schema (review counts are visible text only, per your
policy).

## If something goes wrong

The pages are self-contained. If you break the wrapper template, the raw HTML
files still work standalone — just visit them directly and they render fine.

Questions: Ask Gulamhusain or the tutor who briefed you on the resource.

---

Built via a stepped design system:
- Navy #242F3A, Coral #D55A3F, Gold #C99A2E, Paper #F7F5F2
- Fraunces (display) + DM Sans (body) via Google Fonts
- All questions British English, all answers hand-verified
- Round-half-up convention throughout (British school standard)
