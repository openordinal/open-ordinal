import { defineCollection, z } from "astro:content";

const entrySchema = z.object({
  title: z.string(),
  title_fr: z.string().optional().default(""),
  category: z.enum([
    "Economics",
    "Demographics",
    "Technology",
    "Governance",
    "Rankings"
  ]),
  date: z.coerce.date(),
  scope: z.string(),
  scope_fr: z.string().optional().default(""),
  dataset: z.string(),
  source_org: z.string(),
  entry_number: z.string(),
  translated: z.boolean().default(false),
  correction_of: z.string().optional().default(""),
  description: z.string().max(160).optional().default(""),
  key_stat: z.string().max(140).optional().default(""),
  draft: z.boolean().default(false)
});

const entries = defineCollection({
  type: "content",
  schema: entrySchema
});

const entriesFr = defineCollection({
  type: "content",
  schema: entrySchema
});

const data = defineCollection({
  type: "content",
  schema: z.object({})
});

export const collections = {
  entries,
  "entries-fr": entriesFr,
  data
};
