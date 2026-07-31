import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getAllPublished, KIND_LABEL } from '../lib/content';
import { SITE } from '../config';

export async function GET(context: APIContext) {
  const items = await getAllPublished();

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site ?? SITE.title,
    items: items.map((item) => ({
      title: item.title,
      description: item.summary,
      pubDate: item.publishedAt,
      link: item.href,
      categories: [KIND_LABEL[item.kind], ...item.tags],
    })),
  });
}
