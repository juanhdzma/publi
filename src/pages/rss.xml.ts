import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { getAllPublished, KIND_LABEL } from '../lib/content';
import { SITE } from '../config';

export async function GET(context: APIContext) {
  /* El feed es público: el set de pruebas no sale de la UI del sitio. */
  const items = (await getAllPublished()).filter((item) => item.mode === 'real');

  return rss({
    title: `${SITE.title} — ${SITE.tagline}`,
    description: SITE.description,
    site: context.site ?? context.url.origin,
    trailingSlash: true,
    customData: '<language>es</language>',
    items: items.map((item) => ({
      title: item.author ? `${item.title} — ${item.author}` : item.title,
      description: item.summary,
      pubDate: item.publishedAt,
      link: item.href,
      categories: [KIND_LABEL[item.kind], ...item.tags],
    })),
  });
}
