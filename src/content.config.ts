import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const quote = z.object({
  text: z.string(),
  source: z.string().optional(),
  page: z.string().optional(),
});

const reference = z.object({
  title: z.string(),
  author: z.string().optional(),
  year: z.string().optional(),
  url: z.string().url().optional(),
  note: z.string().optional(),
});

const shared = {
  title: z.string(),
  summary: z.string(),
  publishedAt: z.coerce.date(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  quote: quote.optional(),
  references: z.array(reference).default([]),
};

const books = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/books' }),
  schema: z.object({
    ...shared,
    author: z.string(),
    rating: z.number().int().min(1).max(5).optional(),
  }),
});

const essays = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/essays' }),
  schema: z.object(shared),
});

export const collections = { books, essays };
