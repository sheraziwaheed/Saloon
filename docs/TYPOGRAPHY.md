# Readable typography

The salon interface uses a balanced medium scale: 18px base body text, 16px supporting text and controls, and proportionate serif headings. Sizes use rem units to respect browser font preferences. The earlier oversized 20–22px minimum is superseded by this scale.

Navigation, captions, service durations, prices, buttons, form labels, newsletter copy, cookie notices and legal links remain readable at 16px or larger. Avoid tiny captions and oversized ordinary body copy when adding components.

Desktop layouts use columns where space permits; narrower layouts stack without squeezing the text. Forms and buttons retain comfortable touch targets. Typography is defined in `app/globals.css`.

`scripts/typography-check.mjs` checks the current stylesheet against the existing preview at 320, 390, 768, 1440 and 1920px on home, account, pricing and booking pages. It checks for visible application text below 16px and document-level horizontal overflow without launching another preview server.
