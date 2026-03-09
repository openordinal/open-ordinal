import type { CollectionEntry } from "astro:content";

const site = new URL("https://openordinal.org");

type FeedEntry = CollectionEntry<"entries"> | CollectionEntry<"entries-fr">;
type FeedLang = "en" | "fr";

type FeedOptions = {
  description: string;
  entries: FeedEntry[];
  feedPathname: string;
  lang: FeedLang;
  sitePathname: string;
  title: string;
};

const escapeXml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");

const escapeHtml = escapeXml;

const escapeCdata = (value: string) => value.replaceAll("]]>", "]]]]><![CDATA[>");

const getItemTitle = (entry: FeedEntry, lang: FeedLang) =>
  lang === "fr" ? entry.data.title_fr || entry.data.title : entry.data.title;

const getItemDescription = (entry: FeedEntry, lang: FeedLang) => {
  if (entry.data.description) {
    return entry.data.description;
  }

  const scope = lang === "fr" ? entry.data.scope_fr || entry.data.scope : entry.data.scope;

  return lang === "fr"
    ? `Nouvelle entree ${entry.data.category.toLowerCase()} pour ${scope}.`
    : `New ${entry.data.category.toLowerCase()} entry for ${scope}.`;
};

const getItemUrl = (entry: FeedEntry, lang: FeedLang) =>
  new URL(lang === "fr" ? `/fr/entries/${entry.slug}` : `/entries/${entry.slug}`, site).toString();

const buildItemContent = (entry: FeedEntry, lang: FeedLang, url: string) => {
  const description = getItemDescription(entry, lang);
  const scope = lang === "fr" ? entry.data.scope_fr || entry.data.scope : entry.data.scope;
  const copy =
    lang === "fr"
      ? {
          dataset: "Jeu de donnees",
          keyStat: "Chiffre cle",
          readMore: "Lire l'entree complete sur Open Ordinal.",
          scope: "Perimetre",
          source: "Source"
        }
      : {
          dataset: "Dataset",
          keyStat: "Key stat",
          readMore: "Read the full entry on Open Ordinal.",
          scope: "Scope",
          source: "Source"
        };

  const blocks = [`<p>${escapeHtml(description)}</p>`];

  if (entry.data.key_stat) {
    blocks.push(`<p><strong>${copy.keyStat}:</strong> ${escapeHtml(entry.data.key_stat)}</p>`);
  }

  blocks.push(`<p><strong>${copy.scope}:</strong> ${escapeHtml(scope)}</p>`);
  blocks.push(`<p><strong>${copy.dataset}:</strong> ${escapeHtml(entry.data.dataset)}</p>`);
  blocks.push(`<p><strong>${copy.source}:</strong> ${escapeHtml(entry.data.source_org)}</p>`);
  blocks.push(`<p><a href="${escapeHtml(url)}">${escapeHtml(copy.readMore)}</a></p>`);

  return blocks.join("");
};

export const buildFeedXml = ({
  description,
  entries,
  feedPathname,
  lang,
  sitePathname,
  title
}: FeedOptions) => {
  const sortedEntries = [...entries].sort((a, b) => b.data.date.getTime() - a.data.date.getTime());
  const homeUrl = new URL(sitePathname, site).toString();
  const selfUrl = new URL(feedPathname, site).toString();
  const lastBuildDate = sortedEntries[0]?.data.date.toUTCString() ?? new Date().toUTCString();

  const items = sortedEntries
    .map((entry) => {
      const itemTitle = getItemTitle(entry, lang);
      const itemDescription = getItemDescription(entry, lang);
      const itemUrl = getItemUrl(entry, lang);
      const itemContent = buildItemContent(entry, lang, itemUrl);

      return `    <item>
      <title>${escapeXml(itemTitle)}</title>
      <link>${escapeXml(itemUrl)}</link>
      <guid isPermaLink="true">${escapeXml(itemUrl)}</guid>
      <pubDate>${escapeXml(entry.data.date.toUTCString())}</pubDate>
      <description>${escapeXml(itemDescription)}</description>
      <category>${escapeXml(entry.data.category)}</category>
      <content:encoded><![CDATA[${escapeCdata(itemContent)}]]></content:encoded>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(title)}</title>
    <link>${escapeXml(homeUrl)}</link>
    <description>${escapeXml(description)}</description>
    <language>${lang}</language>
    <lastBuildDate>${escapeXml(lastBuildDate)}</lastBuildDate>
    <atom:link href="${escapeXml(selfUrl)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
};
