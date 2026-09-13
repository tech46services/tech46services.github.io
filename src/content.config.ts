import { defineCollection } from "astro:content";
import { glob } from "astro/loaders";
import { z } from "astro/zod";

const baseObject = z.object({
  title: z.string().min(5),
  description: z.string().min(10),
  date: z.coerce.date().optional(),
  publishedAt: z.coerce.date().optional(),
  draft: z.boolean().default(false),
  image: z.string().optional(),
  imageAlt: z.string().optional(),
  category: z.string().optional(),
});

const baseSchema = baseObject.transform((data) => ({
  ...data,
  date: data.date ?? data.publishedAt ?? new Date(),
}));

const realisationsObject = baseObject.extend({
  location: z.string().optional(),
  service: z.string().optional(),
});

const realisationsSchema = realisationsObject.transform((data) => ({
  ...data,
  date: data.date ?? data.publishedAt ?? new Date(),
}));

const conseils = defineCollection({
  loader: glob({
    base: "./src/content/conseils",
    pattern: "**/*.md",
  }),
  schema: baseSchema,
});

const realisations = defineCollection({
  loader: glob({
    base: "./src/content/realisations",
    pattern: "**/*.md",
  }),
  schema: realisationsSchema,
});

const actualites = defineCollection({
  loader: glob({
    base: "./src/content/actualites",
    pattern: "**/*.md",
  }),
  schema: baseSchema,
});

export const collections = { conseils, realisations, actualites };
