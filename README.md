# Open Ordinal

Open Ordinal is a bilingual research archive of structured economic and social data analysis focused on Africa.

## What this repository contains

- Astro-based static website source code
- English entries in `src/content/entries/`
- French entries in `src/content/entries-fr/`
- Raw datasets and chart assets in `src/content/data/`
- Shared layout and entry components in `src/components/`

## Run locally

```bash
npm install
npm run dev
```

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

## Bilingual update policy

- Every meaningful content or UI change in English must be mirrored in French in the same update, unless explicitly deferred.
- If one language is temporarily missing a change, leave a clear note and follow up immediately.

## Licenses

- Code is licensed under MIT (`LICENSE-code.txt`)
- Content and data are licensed under CC BY 4.0 (`LICENSE-content.txt`)

## Attribution

A project of Utopia UGX Group Ltd.
