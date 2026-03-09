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
category: "" # Economics | Demographics | Technology | Governance | Health | Education
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

Category taxonomy:

- `Economics`: Money, resources, and markets across African economies. Use for GDP, inflation, trade, debt, remittances, currency, investment, cost of living, and labour markets. Do not use for health spending or education budgets when the piece is mainly about sector outcomes.
- `Demographics`: Population structure and change. Use for births, fertility, mortality, migration, urbanisation, age structure, and household composition. Do not use for economic consequences of demographic change when the main claim is about markets or incomes.
- `Technology`: Digital and technical infrastructure and adoption. Use for internet access, mobile money, digital gaps, STEM participation, and tech sector growth. Do not use for technology regulation or state control of tech systems.
- `Governance`: How states and institutions function. Use for corruption, elections, rule of law, regulatory quality, public service delivery, and press freedom. Do not use for economic policy outcomes when the main claim is macroeconomic or market-facing.
- `Health`: Physical wellbeing and health system conditions. Use for disease burden, life expectancy, maternal and child mortality, nutrition, healthcare access, and system capacity. Do not use for health spending when the entry is mainly about fiscal burden or macro allocation.
- `Education`: Learning and human capital development. Use for enrollment, attainment, literacy, learning outcomes, teacher capacity, and school-to-work pipelines. Do not use for STEM careers when the entry is mainly about technology participation or the tech sector.

Classification rule:

- Classify by the primary claim of the entry, not just the dataset being used.

## Deployment

Primary target is Cloudflare Pages.

- Build command: `npm run build`
- Output directory: `dist`

## Buttondown draft automation

The repo includes a GitHub Actions workflow that creates Buttondown draft emails for newly added English entries on pushes to `main`.

- Required GitHub Actions secret: `BUTTONDOWN_API_KEY`
- Workflow file: `.github/workflows/buttondown-drafts.yml`
- Draft generator: `scripts/create-buttondown-draft.mjs`
- Scope: new files under `src/content/entries/` only
- Safety checks: skips `draft: true` entries and skips subjects that already exist in Buttondown

This is a Free-plan workaround for Buttondown when built-in RSS-to-email is unavailable.

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
