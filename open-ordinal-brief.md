# Open Ordinal — Codex Project Brief
*Paste this document at the start of every Codex session. It is the single source of truth for the entire project.*

---

## What You Are Building

**Open Ordinal** is a bilingual (English/French), AI-assisted research archive of structured economic and social data analysis focused on Africa. It is a product of Utopia UGX Group Ltd, a Ghanaian technology company.

It should feel like a quiet research archive — calm, institutional, credible. It should not feel like a blog, a startup, a news site, or a think tank.

The guiding principle: **data > decoration. Content > design. Honesty > authority.**

---

## Tech Stack

| Layer | Tool | Notes |
|---|---|---|
| Framework | Astro | Static, content-first, minimal JS |
| Styling | Tailwind CSS | Utility-first, enforce design system via config |
| Content | MDX | Entries as flat files in `/src/content/entries/` |
| i18n | Astro i18n | English default, French under `/fr/` |
| Charts | Observable Plot / SVG | Code-driven, not drag-and-drop |
| Search | Pagefind | Runs at build time, zero server cost |
| Analytics | Plausible | One script tag in layout |
| Newsletter | Buttondown | RSS-to-email, embedded subscribe form |
| Hosting | Cloudflare Pages | Better Africa CDN, generous free tier |
| Version control | GitHub | Public repo, source of truth |

---

## Repository Setup

- Public repository from day one
- Licence files in root:
  - `LICENSE-code.txt` — MIT licence (covers all code)
  - `LICENSE-content.txt` — CC BY 4.0 licence (covers all content and data)
- `README.md` in root — see README standards below
- `.gitignore` — standard Astro + Node ignores

### README Standards
The README should be written in the same tone as the archive. Include:
- One-sentence description of Open Ordinal
- What the repo contains
- How to run locally
- How entries are structured
- Licence summary (CC BY 4.0 for content, MIT for code)
- Attribution: *"A project of Utopia UGX Group Ltd"*

---

## Folder Structure

```
/
├── public/
│   └── favicon.svg               ← Typographic "O" in EB Garamond
├── src/
│   ├── content/
│   │   ├── entries/              ← MDX entry files (English)
│   │   │   └── [slug].mdx
│   │   ├── entries-fr/           ← MDX entry files (French)
│   │   │   └── [slug].mdx
│   │   └── data/
│   │       ├── [slug].csv        ← Raw data per entry
│   │       └── [slug]-chart.svg  ← Chart per entry
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Layout.astro
│   │   │   ├── Nav.astro
│   │   │   └── Footer.astro
│   │   ├── entry/
│   │   │   ├── EntryCard.astro
│   │   │   ├── EntryHeader.astro
│   │   │   ├── StatBlock.astro
│   │   │   ├── ChartBlock.astro
│   │   │   ├── LimitationsList.astro
│   │   │   └── SourcesList.astro
│   │   └── ui/
│   │       ├── LanguageSwitcher.astro
│   │       ├── TranslationNotice.astro
│   │       └── SubscribeForm.astro
│   ├── pages/
│   │   ├── index.astro            ← Homepage (English)
│   │   ├── entries/
│   │   │   └── [slug].astro
│   │   ├── archive.astro
│   │   ├── data.astro
│   │   ├── method.astro
│   │   ├── about.astro
│   │   ├── 404.astro
│   │   └── fr/                   ← All French pages mirrored here
│   └── styles/
│       └── global.css
├── LICENSE-code.txt
├── LICENSE-content.txt
└── README.md
```

---

## Design System

### Colour Tokens
Define all colours as CSS variables and Tailwind config tokens. Never hardcode hex values in components.

**Light mode (default):**
```css
--paper:      #f7f6f2   /* background */
--ink:        #0f0f0f   /* primary text */
--dim:        #999999   /* secondary text, metadata */
--rule:       #d8d6d0   /* dividers, borders */
--accent:     #1a3a5c   /* category colours, links */
--accent-green: #3a6b50
--accent-brown: #6b4a1a
--accent-purple: #4a2e6b
--negative:   #8b2a2a   /* negative values in charts */
```

**Dark mode (`prefers-color-scheme: dark`):**
```css
--paper:      #0f0f0f
--ink:        #f0ede6
--dim:        #555555
--rule:       #2a2a2a
--accent:     #4a7ab5
--negative:   #c0392b
```

### Typography
```css
/* Headline / prose */
font-family: 'EB Garamond', serif;

/* Labels, metadata, code, UI */
font-family: 'Geist Mono', monospace;
```

Load via Google Fonts:
```
https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;1,400;1,500&family=Geist+Mono:wght@300;400&display=swap
```

### Spacing
- Base unit: 8px
- Section padding: 48px horizontal, 64px vertical
- Max content width: 740px, centred
- Nav height: 48px, fixed

### Rules
- Thin 1px dividers using `--rule` colour only
- No gradients
- No hero images
- No decorative elements
- Charts carry colour — the UI does not
- Dark mode: system default via `prefers-color-scheme` — no manual toggle

---

## Pages

### Homepage
Four sections in order:
1. **Fold** — Deming quote, site name large, tagline, entry counter, latest entry preview. Full viewport height.
2. **Latest entries** — Single column list, most recent 5 entries
3. **Browse by category** — Five category rows with entry counts
4. **Method statement** — Short prose + tags + subscribe form

### Archive
Full list of all entries. Filterable by category. Paginated at 20 entries. Searchable via Pagefind.

### Data
List of all downloadable data files. Empty at launch with a note: *"Data downloads coming soon. Raw data files are stored in the project repository."* Link to GitHub repo.

### Method
Full methodology page. Include:
- Data sources and priority order
- AI-assisted workflow transparency
- Interpretation principles
- Corrections policy
- Link to GitHub repo

### About
- What Open Ordinal is
- Why it exists
- *"Open Ordinal is a project of Utopia UGX Group Ltd, a Ghanaian technology company."*
- Contact email
- Link to Utopia UGX Group website

### 404
Custom, on-brand. Minimal. One line:
- English: *"This entry doesn't exist — or not yet."*
- French: *"Cette entrée n'existe pas — ou pas encore."*
Link back to archive.

---

## Navigation

```
Open Ordinal    Archive  Data  Method  About    EN | FR
```

- Wordmark: EB Garamond, links to homepage
- Nav links: Geist Mono, 10px, uppercase, letter-spaced, muted until hover
- Language switcher: `EN | FR` — current language in ink, other in `--dim`
- Fixed top, 48px height, 1px bottom border in `--rule`
- On mobile: hamburger menu

---

## i18n (Bilingual)

- English is the default language — no prefix in URLs
- French lives under `/fr/` prefix
- Same slug in both languages:
  - `openordinal.org/entries/gdp-subsaharan-africa-2023`
  - `openordinal.org/fr/entries/gdp-subsaharan-africa-2023`
- Language switcher in nav toggles between the two on any page
- If a French user lands on an untranslated entry: show English version with a quiet notice banner below the nav:
  - *"Cette entrée n'est pas encore disponible en français. Vous lisez la version anglaise."*
  - Muted grey, dismissible, not apologetic

---

## Entry MDX Frontmatter Schema

```yaml
---
title: ""
title_fr: ""
slug: ""
category: ""           # Economics | Demographics | Technology | Governance | Rankings
date: ""               # YYYY-MM-DD
scope: ""              # e.g. "Sub-Saharan Africa · 2010–2023"
scope_fr: ""
dataset: ""            # Primary dataset name
source_org: ""         # e.g. World Bank
entry_number: ""       # e.g. 038
translated: false      # true when French version exists
correction_of: ""      # slug of entry being corrected, if applicable
---
```

---

## Chart Standards

- Format: SVG (inline in MDX or separate file in `/src/content/data/`)
- Monochrome bars by default
- Colour only to encode meaning:
  - Positive values: `#1a3a5c`
  - Negative values: `#8b2a2a`
  - Category colours used sparingly for multi-series charts
- Font: Geist Mono for all labels and axes
- Subtle dashed horizontal grid rules only — no vertical rules
- No legend unless strictly necessary — label bars directly
- Every chart includes:
  - Title (italic EB Garamond)
  - Subtitle (source · year · scope, Geist Mono 10px)
  - Chart note below (caveats, selection criteria)
- Negative values always go below baseline — never clipped or hidden
- Dark mode: chart colours adjust via CSS `prefers-color-scheme`

---

## LinkedIn Image Card

Every entry generates a LinkedIn image card. Dimensions: 1200×627px SVG or PNG.

Card layout:
- Background: `--paper` colour
- Top-left: `OPEN ORDINAL` in Geist Mono, 11px, uppercase
- Category tag below wordmark
- Entry title in EB Garamond, large, centred vertically
- One key data point or stat — Geist Mono, muted
- Bottom: entry number + date, right-aligned
- No photos, no gradients, no colour fills — same aesthetic as the site

---

## SEO & Metadata

Every page and entry must auto-generate:
```html
<title>{entry title} — Open Ordinal</title>
<meta name="description" content="{lead summary, max 160 chars}">
<meta property="og:title" content="{entry title}">
<meta property="og:description" content="{lead summary}">
<meta property="og:image" content="{LinkedIn card image URL}">
<meta property="og:type" content="article">
<link rel="canonical" href="{full URL}">
<script type="application/ld+json">{structured data}</script>
```

Hreflang tags for bilingual pages:
```html
<link rel="alternate" hreflang="en" href="https://openordinal.org/entries/[slug]">
<link rel="alternate" hreflang="fr" href="https://openordinal.org/fr/entries/[slug]">
```

---

## Performance

- Target: Lighthouse score 95+ on mobile
- No unnecessary JavaScript — Astro static output
- Fonts: preconnect + display=swap
- Images: none by default — charts are SVG
- Pagefind search index built at deploy time

---

## Print Stylesheet

Every entry page includes a print stylesheet:
- Remove nav, footer, subscribe form, language switcher
- Expand content to full width
- Show full source URLs
- EB Garamond 12pt body, black on white
- Charts print in greyscale

---

## Favicon

Typographic. The letter "O" set in EB Garamond, `--ink` on `--paper`. SVG format. No icon, no symbol — the typeface is the brand.

---

## Analytics & Newsletter

**Plausible:**
- One script tag in `Layout.astro`
- Domain: openordinal.org
- No cookies, no GDPR banner needed

**Buttondown:**
- Embedded subscribe form on homepage (Section 4) and footer
- English and French subscriber lists
- RSS-to-email: every new entry auto-sends to subscribers
- Form label: *"New entries by email. No commentary. No frequency."*
- French: *"Nouvelles entrées par email. Sans commentaire. Sans fréquence."*

---

## Corrections Policy

Entries are dated snapshots. The data was accurate at time of publication.

If an error is discovered:
- Do not silently edit the original entry
- Publish a new correction entry
- Set `correction_of: [original-slug]` in the new entry's frontmatter
- The original entry displays a quiet notice linking to the correction

---

## Open Source & Licensing

- GitHub repo: public from day one
- Code: MIT licence
- Content & data: CC BY 4.0 — free to reuse with attribution
- Attribution format: *"Open Ordinal / openordinal.org (CC BY 4.0)"*
- README included from day one

---

## Attribution

Open Ordinal is a project of **Utopia UGX Group Ltd**, a Ghanaian technology company.

This appears quietly on the About page and in the site footer. It does not appear in the nav, on entry pages, or in the wordmark.

---

*Open Ordinal · openordinal.org · structured analysis of African data*
*A project of Utopia UGX Group Ltd*
