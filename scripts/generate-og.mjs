import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, "..");

const SOURCE_DIRS = [
  { dir: path.join(root, "src", "content", "entries"), lang: "en" },
  { dir: path.join(root, "src", "content", "entries-fr"), lang: "fr" }
];
const OUTPUT_DIR = path.join(root, "public", "og");

const FALLBACK = {
  title: "Open Ordinal Entry",
  category: "Research",
  entry_number: "",
  date: "",
  scope: "",
  description: "",
  key_stat: "",
  dataset: "",
  source_org: ""
};

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function parseScalar(raw) {
  const value = raw.trim();
  if (value === "true") return true;
  if (value === "false") return false;
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function parseFrontmatter(fileText) {
  const match = fileText.match(/^---\s*[\r\n]+([\s\S]*?)\r?\n---/);
  if (!match) return {};

  const frontmatter = {};
  const lines = match[1].split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const entry = trimmed.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!entry) continue;

    const key = entry[1];
    const value = parseScalar(entry[2]);
    frontmatter[key] = value;
  }
  return frontmatter;
}

function truncate(value, max) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, Math.max(0, max - 3)).trimEnd()}...`;
}

function wrapText(text, maxChars, maxLines) {
  const words = String(text || "")
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean);

  if (words.length === 0) return [];

  const lines = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }

    if (current) {
      lines.push(current);
      current = word;
    } else {
      lines.push(word);
      current = "";
    }

    if (lines.length === maxLines) break;
  }

  if (lines.length < maxLines && current) {
    lines.push(current);
  }

  const capped = lines.slice(0, maxLines);
  if (words.join(" ").length > capped.join(" ").length && capped.length > 0) {
    capped[capped.length - 1] = truncate(capped[capped.length - 1], Math.max(10, maxChars - 1));
  }

  return capped;
}

function pickHighlight(frontmatter) {
  const sources = [frontmatter.key_stat, frontmatter.description, frontmatter.scope]
    .filter(Boolean)
    .map((value) => String(value));

  for (const source of sources) {
    const numericMatch = source.match(/[-+]?\d[\d,.]*(?:%|x|k|m|bn|b)?/i);
    if (numericMatch && numericMatch[0]) {
      return numericMatch[0];
    }
  }

  const yearMatches = String(frontmatter.date || "").match(/\b(19|20)\d{2}\b/g);
  if (yearMatches && yearMatches.length > 0) {
    return yearMatches[yearMatches.length - 1];
  }

  return String(frontmatter.category || "DATA").toUpperCase();
}

function highlightSize(value) {
  const len = String(value || "").length;
  if (len <= 5) return 128;
  if (len <= 8) return 112;
  if (len <= 12) return 92;
  return 76;
}

function buildSvg(slug, rawFrontmatter) {
  const frontmatter = { ...FALLBACK, ...rawFrontmatter };

  const category = String(frontmatter.category || "Research").toUpperCase();
  const categoryWidth = Math.max(120, Math.min(280, 30 + category.length * 11));

  const title = truncate(frontmatter.title, 120);
  const titleLines = wrapText(title, 32, 3);
  const resolvedTitleLines = titleLines.length > 0 ? titleLines : ["Open Ordinal Entry"];
  const titleSize = resolvedTitleLines.length >= 3 ? 56 : 66;
  const titleLineHeight = resolvedTitleLines.length >= 3 ? 62 : 74;
  const titleTspans = resolvedTitleLines
    .map((line, index) => `<tspan x="72" dy="${index === 0 ? 0 : titleLineHeight}">${escapeXml(line)}</tspan>`)
    .join("");

  const keyContext =
    truncate(
      frontmatter.key_stat ||
        frontmatter.description ||
        frontmatter.scope ||
        (frontmatter.dataset ? `Dataset: ${frontmatter.dataset}` : "") ||
        (frontmatter.source_org ? `Source: ${frontmatter.source_org}` : ""),
      74
    ) || "Context will be added on publication";

  const highlight = escapeXml(pickHighlight(frontmatter));
  const highlightFontSize = highlightSize(highlight);

  const entryPrefix = frontmatter.entry_number ? `ENTRY ${frontmatter.entry_number}` : "ENTRY";
  const metaRight = frontmatter.date ? `${entryPrefix} | ${frontmatter.date}` : entryPrefix;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="627" viewBox="0 0 1200 627" role="img" aria-label="${escapeXml(
    `${frontmatter.title || slug} OG card`
  )}">
  <rect width="1200" height="627" fill="#f7f6f2"/>
  <rect x="36" y="36" width="1128" height="555" fill="none" stroke="#d8d6d0" stroke-width="1"/>
  <text x="72" y="84" fill="#0f0f0f" font-family="'Geist Mono', 'Courier New', monospace" font-size="12" letter-spacing="3">OPEN ORDINAL</text>
  <line x1="252" y1="78" x2="1128" y2="78" stroke="#d8d6d0" stroke-width="1"/>
  <rect x="72" y="106" width="${categoryWidth}" height="30" fill="none" stroke="#1a3a5c" stroke-width="1"/>
  <text x="86" y="126" fill="#1a3a5c" font-family="'Geist Mono', 'Courier New', monospace" font-size="12" letter-spacing="1.8">${escapeXml(
    category
  )}</text>
  <text x="72" y="246" fill="#0f0f0f" font-family="'EB Garamond', Georgia, serif" font-size="${titleSize}" font-weight="500">${titleTspans}</text>
  <line x1="72" y1="370" x2="1128" y2="370" stroke="#d8d6d0" stroke-width="1"/>
  <text x="72" y="430" fill="#999999" font-family="'Geist Mono', 'Courier New', monospace" font-size="12" letter-spacing="0.9">KEY CONTEXT</text>
  <text x="72" y="466" fill="#999999" font-family="'Geist Mono', 'Courier New', monospace" font-size="12" letter-spacing="0.8">${escapeXml(
    keyContext
  )}</text>
  <text x="1116" y="500" text-anchor="end" fill="#1a3a5c" font-family="'EB Garamond', Georgia, serif" font-size="${highlightFontSize}" font-weight="500">${highlight}</text>
  <line x1="72" y1="536" x2="1128" y2="536" stroke="#d8d6d0" stroke-width="1"/>
  <text x="72" y="562" fill="#999999" font-family="'Geist Mono', 'Courier New', monospace" font-size="11" letter-spacing="1.3">OPENORDINAL.ORG</text>
  <text x="1128" y="562" text-anchor="end" fill="#999999" font-family="'Geist Mono', 'Courier New', monospace" font-size="11" letter-spacing="1.3">${escapeXml(
    metaRight
  )}</text>
</svg>`;
}

function readEntryFiles() {
  const bySlug = new Map();

  for (const source of SOURCE_DIRS) {
    if (!fs.existsSync(source.dir)) continue;
    const files = fs
      .readdirSync(source.dir)
      .filter((file) => file.endsWith(".mdx"))
      .sort((a, b) => a.localeCompare(b));

    for (const file of files) {
      const slug = path.basename(file, ".mdx");
      const fullPath = path.join(source.dir, file);
      const raw = fs.readFileSync(fullPath, "utf8");
      const frontmatter = parseFrontmatter(raw);
      if (frontmatter.draft === true || frontmatter.draft === "true") continue;

      const existing = bySlug.get(slug);
      // Prefer English entry metadata when both languages exist for the same slug.
      if (!existing || source.lang === "en") {
        bySlug.set(slug, frontmatter);
      }
    }
  }

  return bySlug;
}

function ensureOutputDir() {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function writeCard(slug, frontmatter) {
  const svgPath = path.join(OUTPUT_DIR, `${slug}.svg`);
  const pngPath = path.join(OUTPUT_DIR, `${slug}.png`);
  const svg = buildSvg(slug, frontmatter);
  fs.writeFileSync(svgPath, svg, "utf8");

  const svgBuffer = Buffer.from(svg, "utf8");
  await sharp(svgBuffer)
    .resize(1200, 627, { fit: "fill" })
    .png({ compressionLevel: 9 })
    .toFile(pngPath);
}

async function main() {
  ensureOutputDir();
  const entries = readEntryFiles();

  if (entries.size === 0) {
    console.log("No published entries found. Skipping OG generation.");
    return;
  }

  let count = 0;
  for (const [slug, frontmatter] of entries.entries()) {
    await writeCard(slug, frontmatter);
    count += 1;
  }

  console.log(`Generated ${count} OG cards in ${path.relative(root, OUTPUT_DIR)}`);
}

await main();
