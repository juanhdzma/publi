import { getCollection } from 'astro:content';

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
  author?: string;
  rating?: number;
};

const byNewest = (a: ContentItem, b: ContentItem) =>
  b.publishedAt.valueOf() - a.publishedAt.valueOf();

export async function getPublished(kind: Kind): Promise<ContentItem[]> {
  const entries = await getCollection(kind, ({ data }: any) => !data.draft);

  return entries
    .map((entry: any) => ({
      kind,
      id: entry.id,
      href: `${KIND_PATH[kind]}/${entry.id}/`,
      title: entry.data.title,
      summary: entry.data.summary,
      publishedAt: entry.data.publishedAt,
      tags: entry.data.tags,
      author: entry.data.author,
      rating: entry.data.rating,
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

export function formatDate(date: Date): string {
  return date.toLocaleDateString('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
}
