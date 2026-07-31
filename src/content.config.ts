import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const shared = {
  title: z.string(),
  summary: z.string(),
  publishedAt: z.coerce.date(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
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
