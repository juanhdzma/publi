import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const quote = z.object({
  text: z.string(),
  source: z.string().optional(),
  page: z.string().optional(),
  featured: z.boolean().default(false),
});

const reference = z.object({
  title: z.string(),
  author: z.string().optional(),
  year: z.string().optional(),
  url: z.url().optional(),
  note: z.string().optional(),
});

const shared = {
  title: z.string(),
  summary: z.string(),
  publishedAt: z.coerce.date(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  quotes: z.array(quote).default([]),
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

/** Citas sueltas, sin libro ni ensayo detrás. */
const quotes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/quotes' }),
  schema: z.object({
    text: z.string(),
    author: z.string(),
    source: z.string().optional(),
    url: z.url().optional(),
    publishedAt: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { books, essays, quotes };
