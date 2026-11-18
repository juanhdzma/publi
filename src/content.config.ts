import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

const quote = z.object({
  text: z.string(),
  source: z.string().nullable().optional(),
  publish: z.boolean().default(true),
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

/** Los `_templates` quedan afuera: Astro ignora todo lo que empieza con `_`. */
const markdown = (kind: string) => glob({ pattern: `${kind}/**/*.md`, base: './src/content' });

const books = defineCollection({
  loader: markdown('books'),
  schema: z.object({
    ...shared,
    author: z.string(),
    rating: z.number().int().min(1).max(5).optional(),
  }),
});

const essays = defineCollection({
  loader: markdown('essays'),
  schema: z.object(shared),
});

/** Citas sueltas, sin libro ni ensayo detrás: una lista, cada cita con su `id`. */
const quotes = defineCollection({
  loader: file('./src/content/quotes.yml'),
  schema: z.object({
    text: z.string(),
    author: z.string().nullable().optional(),
    source: z.string().optional(),
    url: z.url().optional(),
    publishedAt: z.coerce.date(),
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

export const collections = { books, essays, quotes };
