import { getCollection } from 'astro:content';
import { SITE } from '../config';

export type Kind = 'books' | 'essays';

/** Los dos árboles de contenido. El botón del header elige cuál se ve. */
export type Mode = 'real' | 'demo';

export const MODES: Mode[] = ['real', 'demo'];

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
  mode: Mode;
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

/** Cuántas entradas y cuántas citas sueltas hay con un tag, en un modo. */
export type TagCounts = { entries: number; quotes: number };

export type TagSummary = {
  name: string;
  slug: string;
  kinds: Kind[];
  real: TagCounts;
  demo: TagCounts;
};

export type Quote = {
  text: string;
  mode: Mode;
  page?: string;
  featured: boolean;
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

const DEMO_ROOT = 'content-demo';

/**
 * El `id` que arma el loader arranca con el árbol: `content/books/sapiens` o
 * `content-demo/books/sapiens`. De ahí sale el modo, y el slug del demo va
 * bajo `demo/` para que nunca choque con una entrada real del mismo nombre.
 */
export function parseId(id: string): { mode: Mode; slug: string } {
  const [root, , ...rest] = id.split('/');
  const mode: Mode = root === DEMO_ROOT ? 'demo' : 'real';
  const slug = rest.join('/');

  return { mode, slug: mode === 'demo' ? `demo/${slug}` : slug };
}

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

const byNewest = (a: { publishedAt: Date }, b: { publishedAt: Date }) =>
  b.publishedAt.valueOf() - a.publishedAt.valueOf();

/** Separa una lista en los dos modos, para renderizar ambos y esconder uno. */
export function splitByMode<T extends { mode: Mode }>(items: T[]): Record<Mode, T[]> {
  return {
    real: items.filter((item) => item.mode === 'real'),
    demo: items.filter((item) => item.mode === 'demo'),
  };
}

export async function getPublished(kind: Kind): Promise<ContentItem[]> {
  const entries = await getCollection(kind, ({ data }) => !data.draft);

  return entries
    .map((entry: any) => {
      const { mode, slug } = parseId(entry.id);
      const href = `${KIND_PATH[kind]}/${slug}/`;
      const defaultAttribution = entry.data.author ?? SITE.author;

      return {
        kind,
        mode,
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
          mode,
          page: q.page,
          featured: q.featured,
          publishedAt: entry.data.publishedAt,
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

/** Citas sueltas: viven en su propia colección, sin entrada detrás. */
export async function getStandaloneQuotes(): Promise<Quote[]> {
  const entries = await getCollection('quotes', ({ data }) => !data.draft);

  return entries
    .map((entry: any) => ({
      text: entry.data.text,
      mode: parseId(entry.id).mode,
      featured: false,
      publishedAt: entry.data.publishedAt,
      attribution: entry.data.author,
      origin: entry.data.source,
      originHref: entry.data.url,
      external: Boolean(entry.data.url),
      tags: entry.data.tags,
    }))
    .sort(byNewest);
}

export async function getAllQuotes(): Promise<Quote[]> {
  const [items, standalone] = await Promise.all([
    getAllPublished(),
    getStandaloneQuotes(),
  ]);

  return [...items.flatMap((item) => item.quotes), ...standalone].sort(byNewest);
}

export async function getAllPublished(): Promise<ContentItem[]> {
  const [books, essays] = await Promise.all([
    getPublished('books'),
    getPublished('essays'),
  ]);
  return [...books, ...essays].sort(byNewest);
}

export function tagTotal(tag: TagSummary, mode: Mode): number {
  return tag[mode].entries + tag[mode].quotes;
}

/** true cuando el tag no existe en ese modo y hay que esconderlo entero. */
export function tagEmpty(tag: TagSummary, mode: Mode): boolean {
  return tagTotal(tag, mode) === 0;
}

export async function getAllTags(): Promise<TagSummary[]> {
  const [items, quotes] = await Promise.all([getAllPublished(), getStandaloneQuotes()]);
  const bySlug = new Map<string, TagSummary>();

  const ensure = (tag: string) => {
    const slug = slugifyTag(tag);
    let summary = bySlug.get(slug);

    if (!summary) {
      summary = {
        name: tag,
        slug,
        kinds: [],
        real: { entries: 0, quotes: 0 },
        demo: { entries: 0, quotes: 0 },
      };
      bySlug.set(slug, summary);
    }

    return summary;
  };

  for (const item of items) {
    for (const tag of item.tags) {
      const summary = ensure(tag);
      summary[item.mode].entries += 1;
      if (!summary.kinds.includes(item.kind)) summary.kinds.push(item.kind);
    }
  }

  for (const quote of quotes) {
    for (const tag of quote.tags) ensure(tag)[quote.mode].quotes += 1;
  }

  return [...bySlug.values()].sort(
    (a, b) =>
      tagTotal(b, 'real') + tagTotal(b, 'demo') - (tagTotal(a, 'real') + tagTotal(a, 'demo')) ||
      a.name.localeCompare(b.name, 'es'),
  );
}

export async function getByTag(slug: string): Promise<ContentItem[]> {
  const items = await getAllPublished();
  return items.filter((item) => item.tags.some((tag) => slugifyTag(tag) === slug));
}

export async function getQuotesByTag(slug: string): Promise<Quote[]> {
  const quotes = await getStandaloneQuotes();
  return quotes.filter((quote) => quote.tags.some((tag) => slugifyTag(tag) === slug));
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
