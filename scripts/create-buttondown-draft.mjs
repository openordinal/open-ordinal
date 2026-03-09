import { readFile } from "node:fs/promises";
import path from "node:path";

const [, , filePath, ...args] = process.argv;
const isDryRun = args.includes("--dry-run");
const apiKey = process.env.BUTTONDOWN_API_KEY;
const siteUrl = new URL(process.env.BUTTONDOWN_SITE_URL || "https://openordinal.org");

if (!filePath) {
  console.error("Usage: node scripts/create-buttondown-draft.mjs <entry-file> [--dry-run]");
  process.exit(1);
}

if (!isDryRun && !apiKey) {
  console.error("BUTTONDOWN_API_KEY is required unless --dry-run is used.");
  process.exit(1);
}

const parseFrontmatter = (source) => {
  const match = source.match(/^---\n([\s\S]*?)\n---/);

  if (!match) {
    throw new Error(`No frontmatter found in ${filePath}`);
  }

  const frontmatter = {};

  for (const line of match[1].split("\n")) {
    const trimmed = line.trim();

    if (!trimmed) {
      continue;
    }

    const separatorIndex = trimmed.indexOf(":");

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (value === "true") {
      frontmatter[key] = true;
      continue;
    }

    if (value === "false") {
      frontmatter[key] = false;
      continue;
    }

    frontmatter[key] = value;
  }

  return frontmatter;
};

const escapeHtml = (value) =>
  value
    .toString()
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const titleCaseCategory = (value) => value?.toString().trim() || "Analysis";

const buildFallbackDescription = ({ category, scope, lang }) =>
  lang === "fr"
    ? `Nouvelle entree ${category.toLowerCase()} pour ${scope}.`
    : `New ${category.toLowerCase()} entry for ${scope}.`;

const buildBody = ({
  category,
  dataset,
  date,
  description,
  entryNumber,
  keyStat,
  ogImageUrl,
  scope,
  sourceOrg,
  title,
  url,
  lang
}) => {
  const copy =
    lang === "fr"
      ? {
          attribution: "Open Ordinal est un projet de Utopia UGX Group Ltd.",
          cta: "Lire l'entree complete",
          dataset: "Jeu de donnees",
          keyStat: "Chiffre cle",
          published: "Publie",
          scope: "Perimetre",
          source: "Source"
        }
      : {
          attribution: "Open Ordinal is a project of Utopia UGX Group Ltd.",
          cta: "Read the full entry",
          dataset: "Dataset",
          keyStat: "Key stat",
          published: "Published",
          scope: "Scope",
          source: "Source"
        };

  const formattedDate = new Intl.DateTimeFormat(lang === "fr" ? "fr-FR" : "en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(new Date(date));

  const metaRows = [
    [copy.published, formattedDate],
    [copy.scope, scope],
    [copy.dataset, dataset],
    [copy.source, sourceOrg]
  ]
    .map(
      ([label, value]) => `
              <tr>
                <td style="padding: 11px 0; border-bottom: 1px solid #d8d6d0; vertical-align: top; width: 122px; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 11px; line-height: 1.4; letter-spacing: 0.14em; text-transform: uppercase; color: #777777;">${escapeHtml(label)}</td>
                <td style="padding: 11px 0; border-bottom: 1px solid #d8d6d0; vertical-align: top; font-family: Georgia, 'Times New Roman', serif; font-size: 17px; line-height: 1.55; color: #0f0f0f;">${escapeHtml(value)}</td>
              </tr>`
    )
    .join("");

  const keyStatBlock = keyStat
    ? `
          <div style="margin: 0 0 28px; border-top: 1px solid #0f0f0f; border-bottom: 1px solid #0f0f0f; padding: 14px 0 16px;">
            <div style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 11px; line-height: 1.4; letter-spacing: 0.16em; text-transform: uppercase; color: #777777;">${escapeHtml(copy.keyStat)}</div>
            <div style="margin-top: 8px; font-family: Georgia, 'Times New Roman', serif; font-size: 29px; line-height: 1.24; color: #0f0f0f;">${escapeHtml(keyStat)}</div>
          </div>`
    : "";

  return `<!-- buttondown-editor-mode: fancy -->
<div style="margin: 0; padding: 0; background: #f7f6f2; color: #0f0f0f;">
  <div style="margin: 0 auto; max-width: 640px; border: 1px solid #d8d6d0; background: #f7f6f2;">
    <div style="padding: 28px 28px 0;">
      <div style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 11px; line-height: 1.4; letter-spacing: 0.16em; text-transform: uppercase; color: #777777;">${escapeHtml(entryNumber)} · ${escapeHtml(category)}</div>
      <h1 style="margin: 14px 0 0; font-family: Georgia, 'Times New Roman', serif; font-size: 42px; line-height: 1.02; font-weight: 500; color: #0f0f0f;">${escapeHtml(title)}</h1>
      <div style="margin-top: 14px; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 11px; line-height: 1.4; color: #777777;">${escapeHtml(formattedDate)}</div>
    </div>

    <div style="padding: 24px 28px 0;">
      <img src="${escapeHtml(ogImageUrl)}" alt="${escapeHtml(title)}" style="display: block; width: 100%; height: auto; border: 1px solid #d8d6d0;" />
    </div>

    <div style="padding: 26px 28px 30px;">
      <p style="margin: 0 0 26px; font-family: Georgia, 'Times New Roman', serif; font-size: 22px; line-height: 1.5; color: #0f0f0f;">${escapeHtml(description)}</p>
${keyStatBlock}
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; border-collapse: collapse;">
${metaRows}
      </table>

      <div style="margin-top: 26px; padding-top: 18px; border-top: 1px solid #d8d6d0;">
        <a href="${escapeHtml(url)}" style="display: inline-block; border: 1px solid #0f0f0f; padding: 12px 15px; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 11px; line-height: 1; letter-spacing: 0.14em; text-transform: uppercase; text-decoration: none; color: #0f0f0f;">${escapeHtml(copy.cta)}</a>
      </div>
    </div>
  </div>

  <div style="margin: 14px auto 0; max-width: 640px; padding: 0 4px;">
    <div style="font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 11px; line-height: 1.5; color: #777777;">${escapeHtml(copy.attribution)}</div>
  </div>
</div>`;
};

const buttondownRequest = async (pathname, init = {}) => {
  const response = await fetch(new URL(pathname, "https://api.buttondown.com").toString(), {
    ...init,
    headers: {
      Authorization: `Token ${apiKey}`,
      "Content-Type": "application/json",
      ...(init.headers || {})
    }
  });

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${await response.text()}`);
  }

  return response;
};

const source = await readFile(filePath, "utf8");
const frontmatter = parseFrontmatter(source);

if (frontmatter.draft) {
  console.log(`Skipping ${filePath}: entry is still marked draft.`);
  process.exit(0);
}

const isFrench = filePath.includes(`${path.sep}entries-fr${path.sep}`);
const lang = isFrench ? "fr" : "en";
const slug = frontmatter.slug || path.basename(filePath, path.extname(filePath));
const category = titleCaseCategory(frontmatter.category);
const title = lang === "fr" ? frontmatter.title_fr || frontmatter.title : frontmatter.title;
const scope = lang === "fr" ? frontmatter.scope_fr || frontmatter.scope : frontmatter.scope;
const url = new URL(lang === "fr" ? `/fr/entries/${slug}` : `/entries/${slug}`, siteUrl).toString();
const ogImageUrl = new URL(`/og/${slug}.png`, siteUrl).toString();
const description =
  frontmatter.description || buildFallbackDescription({ category, lang, scope });
const body = buildBody({
  category,
  dataset: frontmatter.dataset,
  date: frontmatter.date,
  description,
  entryNumber: frontmatter.entry_number || "Open Ordinal",
  keyStat: frontmatter.key_stat,
  lang,
  ogImageUrl,
  scope,
  sourceOrg: frontmatter.source_org,
  title,
  url
});

if (!title || !scope || !frontmatter.dataset || !frontmatter.source_org) {
  throw new Error(`Missing required frontmatter for ${filePath}`);
}

if (isDryRun) {
  console.log(JSON.stringify({ body, subject: title, url }, null, 2));
  process.exit(0);
}

const searchParams = new URLSearchParams({
  excluded_fields: "body",
  ordering: "-creation_date",
  subject: title
});

const existingResponse = await buttondownRequest(`/v1/emails?${searchParams.toString()}`, {
  method: "GET",
  headers: {
    "Content-Type": "application/json"
  }
});

const existing = await existingResponse.json();
const matchingEmails = Array.isArray(existing.results)
  ? existing.results.filter((email) => email.subject?.trim() === title.trim())
  : [];
const existingDraft = matchingEmails.find((email) => email.status === "draft");
const hasPublishedMatch = matchingEmails.some((email) => email.status !== "draft");

const payload = {
  body,
  canonical_url: url,
  description,
  image: ogImageUrl,
  metadata: {
    entry_slug: slug,
    language: lang,
    source: "openordinal"
  },
  slug: lang === "fr" ? `${slug}-fr` : slug,
  status: "draft",
  subject: title
};

if (existingDraft) {
  const updateResponse = await buttondownRequest(`/v1/emails/${existingDraft.id}`, {
    body: JSON.stringify(payload),
    method: "PATCH"
  });

  const updated = await updateResponse.json();
  console.log(`Updated Buttondown draft ${updated.id} for "${title}".`);
  process.exit(0);
}

if (hasPublishedMatch) {
  console.log(`Skipping ${title}: Buttondown already has a non-draft email with this subject.`);
  process.exit(0);
}

const createResponse = await buttondownRequest("/v1/emails", {
  body: JSON.stringify(payload),
  method: "POST"
});

const created = await createResponse.json();

console.log(`Created Buttondown draft ${created.id} for "${title}".`);
