import { getCollection, type CollectionEntry } from 'astro:content';
import { SITE, UNKNOWN_AUTHOR } from '../config';
import { resolveAttribution } from './attribution';

export type Kind = 'books' | 'essays';

export const KIND_LABEL: Record<Kind, string> = {
  books: 'Libro',
  essays: 'Ensayo',
};

export const KIND_PLURAL: Record<Kind, string> = {
  books: 'Libros',
  essays: 'Ensayos',
};

export const KIND_INTRO: Record<Kind, { description: string; intro: string }> = {
  books: { description: 'Resúmenes de libros.', intro: 'Resúmenes de lo que voy leyendo.' },
  essays: { description: 'Ensayos.', intro: 'Textos propios, cuando tengo algo que decir.' },
};

export const KIND_PATH: Record<Kind, string> = {
  books: '/books',
  essays: '/essays',
};

export type ContentItem = {
  kind: Kind;
  slug: string;
  href: string;
  title: string;
  summary: string;
  publishedAt: Date;
  tags: string[];
  readingMinutes: number;
  quotes: Quote[];
  author?: string;
  rating?: number;
  entry: CollectionEntry<Kind>;
};

export type TagSummary = {
  name: string;
  slug: string;
  /** Entradas y citas sueltas van separadas: el filtro del home solo esconde entradas. */
  entries: number;
  quotes: number;
};

export type Quote = {
  text: string;
  page?: string;
  featured: boolean;
  /** false: la cita se queda en su entrada y no sale en /quotes/. */
  publish: boolean;
  publishedAt: Date;
  /** Quién dijo la frase. Por defecto el autor del libro, o el del ensayo. */
  attribution: string;
  /** De dónde salió: la entrada que la contiene, o la obra en una cita suelta. */
  origin?: string;
  originHref?: string;
  /** true cuando originHref apunta fuera del sitio. */
  external?: boolean;
  /** undefined en las citas sueltas, que no pertenecen a ninguna entrada. */
  kind?: Kind;
  tags: string[];
};

export function slugifyTag(tag: string): string {
  return tag
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function tagHref(tag: string): string {
  return `/tags/${slugifyTag(tag)}/`;
}

const WORDS_PER_MINUTE = 220;

function readingMinutes(body: string | undefined): number {
  const words = (body ?? '').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

const byNewest = (a: { publishedAt: Date }, b: { publishedAt: Date }) =>
  b.publishedAt.valueOf() - a.publishedAt.valueOf();

export async function getPublished(kind: Kind): Promise<ContentItem[]> {
  const entries = await getCollection(kind, ({ data }) => !data.draft);

  return entries
    .map((entry: any) => {
      const slug = entry.id.slice(kind.length + 1);
      const href = `${KIND_PATH[kind]}/${slug}/`;
      const defaultAttribution = entry.data.author ?? SITE.author;

      return {
        kind,
        slug,
        href,
        title: entry.data.title,
        summary: entry.data.summary,
        publishedAt: entry.data.publishedAt,
        tags: entry.data.tags,
        readingMinutes: readingMinutes(entry.body),
        author: entry.data.author,
        rating: entry.data.rating,
        entry,
        quotes: entry.data.quotes.map((q: any) => ({
          text: q.text,
          page: q.page,
          featured: q.featured,
          publish: q.publish,
          publishedAt: entry.data.publishedAt,
          attribution: resolveAttribution(q.source, defaultAttribution, UNKNOWN_AUTHOR),
          origin: entry.data.title,
          originHref: href,
          kind,
          tags: entry.data.tags,
        })),
      };
    })
    .sort(byNewest);
}

/** Citas sueltas: viven en su propia colección, sin entrada detrás. */
async function getStandaloneQuotes(): Promise<Quote[]> {
  const entries = await getCollection('quotes', ({ data }) => !data.draft);

  return entries
    .map(({ data }) => ({
      text: data.text,
      featured: false,
      publish: true,
      publishedAt: data.publishedAt,
      attribution: data.author ?? UNKNOWN_AUTHOR,
      origin: data.source,
      originHref: data.url,
      external: Boolean(data.url),
      tags: data.tags,
    }))
    .sort(byNewest);
}

export async function getAllPublished(): Promise<ContentItem[]> {
  const [books, essays] = await Promise.all([
    getPublished('books'),
    getPublished('essays'),
  ]);
  return [...books, ...essays].sort(byNewest);
}

export async function getAllQuotes(): Promise<Quote[]> {
  const [items, standalone] = await Promise.all([getAllPublished(), getStandaloneQuotes()]);

  return [...items.flatMap((item) => item.quotes.filter((q) => q.publish)), ...standalone].sort(byNewest);
}

export const tagTotal = (tag: TagSummary) => tag.entries + tag.quotes;

export async function getAllTags(): Promise<TagSummary[]> {
  const [items, quotes] = await Promise.all([getAllPublished(), getStandaloneQuotes()]);
  const bySlug = new Map<string, TagSummary>();

  const ensure = (tag: string) => {
    const slug = slugifyTag(tag);
    let summary = bySlug.get(slug);

    if (!summary) {
      summary = { name: tag, slug, entries: 0, quotes: 0 };
      bySlug.set(slug, summary);
    }

    return summary;
  };

  for (const item of items) for (const tag of item.tags) ensure(tag).entries += 1;
  for (const quote of quotes) for (const tag of quote.tags) ensure(tag).quotes += 1;

  return [...bySlug.values()].sort(
    (a, b) => tagTotal(b) - tagTotal(a) || a.name.localeCompare(b.name, 'es'),
  );
}

const hasTag = (item: { tags: string[] }, slug: string) =>
  item.tags.some((tag) => slugifyTag(tag) === slug);

export async function getByTag(slug: string): Promise<ContentItem[]> {
  return (await getAllPublished()).filter((item) => hasTag(item, slug));
}

export async function getQuotesByTag(slug: string): Promise<Quote[]> {
  return (await getStandaloneQuotes()).filter((quote) => hasTag(quote, slug));
}

export function uniqueTags(items: { tags: string[] }[]): string[] {
  return [...new Set(items.flatMap((item) => item.tags))].sort((a, b) =>
    a.localeCompare(b, 'es'),
  );
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

/** "2 entradas · 1 cita", sin las partes en cero. */
export function countLabel(entries: number, quotes: number): string {
  return [
    entries > 0 && plural(entries, 'entrada', 'entradas'),
    quotes > 0 && plural(quotes, 'cita', 'citas'),
  ]
    .filter(Boolean)
    .join(' · ');
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
