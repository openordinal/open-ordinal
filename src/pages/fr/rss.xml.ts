import type { APIRoute } from "astro";
import { getCollection } from "astro:content";
import { buildFeedXml } from "../../utils/rss";

export const GET: APIRoute = async () => {
  const entries = (await getCollection("entries-fr")).filter((entry) => !entry.data.draft);

  const body = buildFeedXml({
    description: "Analyses structurees des donnees africaines sur Open Ordinal.",
    entries,
    feedPathname: "/fr/rss.xml",
    lang: "fr",
    sitePathname: "/fr",
    title: "Open Ordinal FR"
  });

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8"
    }
  });
};
