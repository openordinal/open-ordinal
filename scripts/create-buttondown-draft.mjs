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

const buildBody = ({ dataset, description, keyStat, ogImageUrl, scope, sourceOrg, url, lang }) => {
  const copy =
    lang === "fr"
      ? {
          cta: "Lire l'entree complete",
          dataset: "Jeu de donnees",
          keyStat: "Chiffre cle",
          scope: "Perimetre",
          source: "Source"
        }
      : {
          cta: "Read the full entry",
          dataset: "Dataset",
          keyStat: "Key stat",
          scope: "Scope",
          source: "Source"
        };

  const metaRows = [
    [copy.scope, scope],
    [copy.dataset, dataset],
    [copy.source, sourceOrg]
  ]
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding: 8px 0 2px; vertical-align: top; width: 118px; font-family: 'EB Garamond', Georgia, 'Times New Roman', serif; font-size: 16px; line-height: 1.35; font-weight: 600; color: #0f0f0f;">${escapeHtml(label)}</td>
        <td style="padding: 8px 0 2px; vertical-align: top; font-family: 'EB Garamond', Georgia, 'Times New Roman', serif; font-size: 16px; line-height: 1.55; color: #0f0f0f;">${escapeHtml(value)}</td>
      </tr>`
    )
    .join("");

  const keyStatBlock = keyStat
    ? `
      <p style="margin: 0 0 22px; font-family: 'EB Garamond', Georgia, 'Times New Roman', serif; font-size: 18px; line-height: 1.55; color: #0f0f0f;"><strong>${escapeHtml(copy.keyStat)}:</strong> ${escapeHtml(keyStat)}</p>`
    : "";

  return `<div style="margin: 0; padding: 0; color: #0f0f0f;">
  <div style="margin: 0 auto; max-width: 640px;">
    <img src="${escapeHtml(ogImageUrl)}" alt="${escapeHtml(description)}" style="display: block; width: 100%; height: auto; margin: 0 0 22px;" />
    <p style="margin: 0 0 22px; font-family: 'EB Garamond', Georgia, 'Times New Roman', serif; font-size: 22px; line-height: 1.5; color: #0f0f0f;">${escapeHtml(description)}</p>
${keyStatBlock}
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="width: 100%; margin: 0 0 24px; border-collapse: collapse;">
${metaRows}
    </table>
    <p style="margin: 0 0 22px; font-family: 'EB Garamond', Georgia, 'Times New Roman', serif; font-size: 18px; line-height: 1.5;">
      <a href="${escapeHtml(url)}" style="color: #0f0f0f; text-decoration: underline;">${escapeHtml(copy.cta)}</a>
    </p>
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
  dataset: frontmatter.dataset,
  description,
  keyStat: frontmatter.key_stat,
  lang,
  ogImageUrl,
  scope,
  sourceOrg: frontmatter.source_org,
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
