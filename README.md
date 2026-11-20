# CoFlow marketing website

Static site published by the existing Render `coflow-web` service from the `site/` directory on `main`. Pushing `main` automatically deploys; do not trigger a duplicate manual deployment.

## Preview and check

```sh
python3 -m http.server 8765 --directory site
python3 scripts/check_site.py
git diff --check
```

The integrity check verifies all HTML pages, local assets and links, fragment anchors, IDs, landmarks and JSON-LD. No build dependencies or bundling are required.

## Design and content

The November 2026 launch refresh uses CoFlow's own converging-path logo, cobalt palette, peach accents, product illustrations and responsive layouts. Design references: [BugHerd](https://bugherd.com/) for an approachable explanation and clear conversion paths; [Linear](https://linear.app/) for hierarchy and product-focused composition; [Graphite](https://www.graphite.com/) for code review storytelling and a demo-led experience. No reference branding or visual assets were copied.

- `site/refresh.css`: shared launch design system, homepage layouts and responsive overrides.
- `site/site.css`: underlying layouts for the detailed product and documentation pages.
- `site/site.js`: navigation, example tabs and pilot email preparation.
- `site/playground.js`: existing scripted interactive examples, not live model output.
- `site/logos/coflow.svg` and `site/favicon.svg`: editable vector brand mark.
- `site/icon-512.png` and `site/og.png`: matching app icon and social preview.

Product status remains **private build**, pricing remains **planned**, and the new product UI is explicitly an **illustrative preview**. Existing detailed product claims, documentation and legacy URL redirects remain in place. This is a marketing-site refresh, not a feature release of the CoFlow application.

## Pilot enquiries

The form validates input and prepares a `mailto:` draft to the site's public support address, `support@getcoflow.ai`. The visitor opens, reviews and sends it using their own email app. It does not submit to a backend or store the details. A direct email link is available without JavaScript. Email delivery and inbox handling are outside the static site and should be checked operationally.

## Launch follow-ups

1. Replace the illustrative UI with approved screenshots and a 90-second recording of the actual product.
2. Add real design-partner results once measured; avoid placeholder customer logos or numerical proof.
3. Connect a first-party enquiry endpoint or scheduling destination if needed; keep the visitor confirmation accurate.
4. Resolve existing policy placeholders on support, privacy and terms pages before a broad launch. Confirm status-page, legal-entity and data-processing details.
5. Verify the `getcoflow.ai` custom domain before promoting it; existing canonical metadata still targets that domain.
6. Measure playground-to-pilot conversion and activation once an approved analytics plan is in place.
