import type { CollectionEntry } from "astro:content";

export type RelatedEntry = CollectionEntry<"entries"> | CollectionEntry<"entries-fr">;

interface Options {
  limit?: number;
}

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "from",
  "with",
  "that",
  "this",
  "into",
  "across",
  "over",
  "under",
  "dans",
  "avec",
  "pour",
  "entre",
  "vers",
  "dans",
  "des",
  "les",
  "une",
  "sur",
  "par",
  "est",
  "sont",
  "qui",
  "de",
  "du",
  "la",
  "le",
  "et",
  "aux",
  "au"
]);

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ");
}

function toTokenSet(values: Array<string | undefined>): Set<string> {
  const tokens = values
    .filter(Boolean)
    .flatMap((value) => normalizeText(value as string).split(/\s+/))
    .filter((token) => token.length >= 3 && !STOP_WORDS.has(token));

  return new Set(tokens);
}

function overlapRatio(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) {
    return 0;
  }

  let intersection = 0;
  for (const token of a) {
    if (b.has(token)) {
      intersection += 1;
    }
  }

  return intersection / Math.max(1, Math.min(a.size, b.size));
}

function parseEntryNumber(value: string): number | null {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

function isCorrectionPair(current: RelatedEntry, candidate: RelatedEntry): boolean {
  return (
    candidate.data.correction_of === current.slug ||
    current.data.correction_of === candidate.slug
  );
}

function scoreCandidate(current: RelatedEntry, candidate: RelatedEntry): number {
  const currentTopicTokens = toTokenSet([
    current.data.title,
    current.data.title_fr,
    current.data.scope,
    current.data.scope_fr,
    current.data.description,
    current.data.key_stat
  ]);
  const candidateTopicTokens = toTokenSet([
    candidate.data.title,
    candidate.data.title_fr,
    candidate.data.scope,
    candidate.data.scope_fr,
    candidate.data.description,
    candidate.data.key_stat
  ]);

  const currentDataTokens = toTokenSet([current.data.dataset, current.data.source_org]);
  const candidateDataTokens = toTokenSet([candidate.data.dataset, candidate.data.source_org]);

  const currentSourceTokens = toTokenSet([current.data.source_org]);
  const candidateSourceTokens = toTokenSet([candidate.data.source_org]);

  const topicScore = overlapRatio(currentTopicTokens, candidateTopicTokens) * 6;
  const datasetScore = overlapRatio(currentDataTokens, candidateDataTokens) * 2.5;
  const sourceScore = overlapRatio(currentSourceTokens, candidateSourceTokens) * 1.5;
  const categoryScore = candidate.data.category === current.data.category ? 2.5 : 0;

  const currentEntryNo = parseEntryNumber(current.data.entry_number);
  const candidateEntryNo = parseEntryNumber(candidate.data.entry_number);
  const entryDistanceScore =
    currentEntryNo !== null && candidateEntryNo !== null
      ? Math.max(0, 1 - Math.abs(currentEntryNo - candidateEntryNo) / 20) * 0.5
      : 0;

  const dayDelta = Math.abs(
    current.data.date.getTime() - candidate.data.date.getTime()
  ) / (1000 * 60 * 60 * 24);
  const recencyScore = Math.max(0, 1 - dayDelta / 3650) * 0.5;

  return (
    topicScore +
    datasetScore +
    sourceScore +
    categoryScore +
    entryDistanceScore +
    recencyScore
  );
}

export function getRelatedEntries(
  current: RelatedEntry,
  candidates: RelatedEntry[],
  options: Options = {}
): RelatedEntry[] {
  const limit = options.limit ?? 3;

  const ranked = candidates
    .filter((candidate) => candidate.slug !== current.slug)
    .filter((candidate) => !isCorrectionPair(current, candidate))
    .map((candidate) => ({
      entry: candidate,
      score: scoreCandidate(current, candidate)
    }))
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      return b.entry.data.date.getTime() - a.entry.data.date.getTime();
    });

  const aboveFloor = ranked.filter((item) => item.score > 0.5);
  const selected = (aboveFloor.length > 0 ? aboveFloor : ranked).slice(0, limit);

  return selected.map((item) => item.entry);
}
