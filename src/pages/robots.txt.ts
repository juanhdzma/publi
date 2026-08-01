import type { APIContext } from 'astro';

/* Endpoint y no `public/robots.txt`: la URL del sitemap es absoluta y sale de
   SITE_URL, que solo se conoce al buildear. */
export function GET(context: APIContext) {
  const base = context.site ?? new URL(context.url.origin);
  const body = `User-agent: *
Allow: /

Sitemap: ${new URL('sitemap-index.xml', base).href}
`;

  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
