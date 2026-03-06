# Open Ordinal

Open Ordinal is a bilingual research archive of structured economic and social data analysis focused on Africa.

Live site: https://openordinal.org

## Project status

Open Ordinal is in active development. Core architecture and page structure are in place; entry publishing is ongoing.

## What this repository contains

- Astro-based static website source code
- English entries in `src/content/entries/`
- French entries in `src/content/entries-fr/`
- Raw datasets and chart assets in `src/content/data/`
- Shared layout and entry components in `src/components/`

## Prerequisites

- Node.js 20+
- npm 10+

## Scripts

- `npm run dev`: start local development server
- `npm run check`: run Astro type/content checks
- `npm run og:generate`: generate entry OG/LinkedIn cards into `public/og/`
- `npm run build`: generate OG cards, build static site, and build Pagefind index
- `npm run preview`: preview production build locally

## Run locally

```bash
npm install
npm run dev
```

## Environment variables

PostHog web analytics is enabled only in production and only when a key is set.

```bash
PUBLIC_POSTHOG_KEY=phc_your_project_key
PUBLIC_POSTHOG_HOST=https://us.i.posthog.com
```

## Analytics and consent

- PostHog initializes only in production builds and only when `PUBLIC_POSTHOG_KEY` is provided.
- A cookie consent banner controls whether PostHog loads.
- The consent banner appears in production when PostHog is configured, and is also shown in dev for UI testing.
- In dev mode, consent UI is visible but PostHog tracking is not initialized.
- Consent choice is stored in local storage as `oo_cookie_consent_v1`.

Build for production:

```bash
npm run build
npm run preview
```

## Entry structure

Entries are MDX files with shared frontmatter schema, one file per slug:

- English: `src/content/entries/[slug].mdx`
- French: `src/content/entries-fr/[slug].mdx`

Data files and chart assets are stored per entry in `src/content/data/`.

Frontmatter (summary):

```yaml
title: ""
title_fr: ""
category: "" # Economics | Demographics | Technology | Governance | Rankings
date: "" # YYYY-MM-DD
scope: ""
scope_fr: ""
dataset: ""
source_org: ""
entry_number: ""
translated: false
correction_of: ""
description: "" # max 160 chars
key_stat: "" # optional highlight for OG card
draft: false
```

## Deployment

Primary target is Cloudflare Pages.

- Build command: `npm run build`
- Output directory: `dist`

## Bilingual update policy

- Every meaningful content or UI change in English must be mirrored in French in the same update, unless explicitly deferred.
- If one language is temporarily missing a change, leave a clear note and follow up immediately.

## Contributing

- Open an issue for bugs, regressions, or content/data concerns.
- Keep changes narrow and explicit.
- Preserve the archive tone: content-first, minimal UI noise, transparent methods.
- Maintain EN/FR parity for user-facing changes.
- For data corrections, publish a new correction entry instead of silently rewriting the original.

## Licenses

- Code is licensed under MIT (`LICENSE-code.txt`)
- Content and data are licensed under CC BY 4.0 (`LICENSE-content.txt`)

## Attribution

A project of Utopia UGX Group Ltd.
