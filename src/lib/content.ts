import { getCollection } from 'astro:content';
import { SITE } from '../config';

export type Kind = 'books' | 'essays';

export const KIND_LABEL: Record<Kind, string> = {
  books: 'Libro',
  essays: 'Ensayo',
};

export const KIND_PLURAL: Record<Kind, string> = {
  books: 'Libros',
  essays: 'Ensayos',
};

export const KIND_PATH: Record<Kind, string> = {
  books: '/books',
  essays: '/essays',
};

export type ContentItem = {
  kind: Kind;
  id: string;
  href: string;
  title: string;
  summary: string;
  publishedAt: Date;
  tags: string[];
  readingMinutes: number;
  quotes: Quote[];
  author?: string;
  rating?: number;
};

export type TagSummary = {
  name: string;
  slug: string;
  count: number;
  kinds: Kind[];
};

export type Quote = {
  text: string;
  page?: string;
  featured: boolean;
  /** Quién dijo la frase. Por defecto el autor del libro, o el del ensayo. */
  attribution: string;
  /** De dónde salió: título de la entrada que la contiene. */
  origin: string;
  originHref: string;
  kind: Kind;
  tags: string[];
};

export function slugifyTag(tag: string): string {
  return tag
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
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

const byNewest = (a: ContentItem, b: ContentItem) =>
  b.publishedAt.valueOf() - a.publishedAt.valueOf();

export async function getPublished(kind: Kind): Promise<ContentItem[]> {
  const entries = await getCollection(kind, ({ data }: any) => !data.draft);

  return entries
    .map((entry: any) => {
      const href = `${KIND_PATH[kind]}/${entry.id}/`;
      const defaultAttribution = entry.data.author ?? SITE.author;

      return {
        kind,
        id: entry.id,
        href,
        title: entry.data.title,
        summary: entry.data.summary,
        publishedAt: entry.data.publishedAt,
        tags: entry.data.tags,
        readingMinutes: readingMinutes(entry.body),
        author: entry.data.author,
        rating: entry.data.rating,
        quotes: entry.data.quotes.map((q: any) => ({
          text: q.text,
          page: q.page,
          featured: q.featured,
          attribution: q.source ?? defaultAttribution,
          origin: entry.data.title,
          originHref: href,
          kind,
          tags: entry.data.tags,
        })),
      };
    })
    .sort(byNewest);
}

export async function getAllQuotes(): Promise<Quote[]> {
  const items = await getAllPublished();
  return items.flatMap((item) => item.quotes);
}

export async function getAllPublished(): Promise<ContentItem[]> {
  const [books, essays] = await Promise.all([
    getPublished('books'),
    getPublished('essays'),
  ]);
  return [...books, ...essays].sort(byNewest);
}

export async function getAllTags(): Promise<TagSummary[]> {
  const items = await getAllPublished();
  const bySlug = new Map<string, TagSummary>();

  for (const item of items) {
    for (const tag of item.tags) {
      const slug = slugifyTag(tag);
      const existing = bySlug.get(slug);

      if (existing) {
        existing.count += 1;
        if (!existing.kinds.includes(item.kind)) existing.kinds.push(item.kind);
      } else {
        bySlug.set(slug, { name: tag, slug, count: 1, kinds: [item.kind] });
      }
    }
  }

  return [...bySlug.values()].sort(
    (a, b) => b.count - a.count || a.name.localeCompare(b.name, 'es'),
  );
}

export async function getByTag(slug: string): Promise<ContentItem[]> {
  const items = await getAllPublished();
  return items.filter((item) => item.tags.some((tag) => slugifyTag(tag) === slug));
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
