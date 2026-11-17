import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
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

/**
 * Cada colección se lee de dos árboles: `content/` es lo real y `content-demo/`
 * el set de pruebas. Los dos se buildean y el botón del header elige cuál se
 * muestra, así que el `id` arranca con el directorio y de ahí sale el modo.
 * Los `_templates` quedan afuera: Astro ignora todo lo que empieza con `_`.
 */
const bothTrees = (kind: string) =>
  glob({
    pattern: [`content/${kind}/**/*.md`, `content-demo/${kind}/**/*.md`],
    base: './src',
  });

const books = defineCollection({
  loader: bothTrees('books'),
  schema: z.object({
    ...shared,
    author: z.string(),
    rating: z.number().int().min(1).max(5).optional(),
  }),
});

const essays = defineCollection({
  loader: bothTrees('essays'),
  schema: z.object(shared),
});

/** Citas sueltas, sin libro ni ensayo detrás: una lista por árbol, cada cita con su `id`. */
const quoteSchema = z.object({
  text: z.string(),
  author: z.string(),
  source: z.string().optional(),
  url: z.url().optional(),
  publishedAt: z.coerce.date(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
});

const quotes = defineCollection({ loader: file('./src/content/quotes.yml'), schema: quoteSchema });
const quotesDemo = defineCollection({
  loader: file('./src/content-demo/quotes.yml'),
  schema: quoteSchema,
});

export const collections = { books, essays, quotes, quotesDemo };
