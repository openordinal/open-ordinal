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

const titleCaseCategory = (value) => value?.toString().trim() || "Analysis";

const buildFallbackDescription = ({ category, scope, lang }) =>
  lang === "fr"
    ? `Nouvelle entree ${category.toLowerCase()} pour ${scope}.`
    : `New ${category.toLowerCase()} entry for ${scope}.`;

const buildBody = ({ description, keyStat, scope, dataset, sourceOrg, url, lang }) => {
  if (lang === "fr") {
    return [
      description,
      keyStat ? `**Chiffre cle:** ${keyStat}` : "",
      `**Perimetre:** ${scope}`,
      `**Jeu de donnees:** ${dataset}`,
      `**Source:** ${sourceOrg}`,
      "",
      `[Lire l'entree complete sur Open Ordinal.](${url})`
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  return [
    description,
    keyStat ? `**Key stat:** ${keyStat}` : "",
    `**Scope:** ${scope}`,
    `**Dataset:** ${dataset}`,
    `**Source:** ${sourceOrg}`,
    "",
    `[Read the full entry on Open Ordinal.](${url})`
  ]
    .filter(Boolean)
    .join("\n\n");
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
const description =
  frontmatter.description || buildFallbackDescription({ category, lang, scope });
const body = buildBody({
  dataset: frontmatter.dataset,
  description,
  keyStat: frontmatter.key_stat,
  lang,
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
const hasExistingSubject = Array.isArray(existing.results)
  ? existing.results.some((email) => email.subject?.trim() === title.trim())
  : false;

if (hasExistingSubject) {
  console.log(`Skipping ${title}: Buttondown already has an email with this subject.`);
  process.exit(0);
}

const createResponse = await buttondownRequest("/v1/emails", {
  body: JSON.stringify({
    body,
    status: "draft",
    subject: title
  }),
  method: "POST"
});

const created = await createResponse.json();

console.log(`Created Buttondown draft ${created.id} for "${title}".`);
