# publi

Sitio estático de resúmenes de libros y ensayos. Publicar = agregar un `.md` y pushear.

Astro + Tailwind v4 → HTML estático servido por nginx en un container.

## Publicar

Un archivo markdown en la carpeta que corresponda. El nombre del archivo es la URL.

**Libro** → `src/content/books/<slug>.md`

```markdown
---
title: "Sapiens"
author: "Yuval Noah Harari"
summary: "Una línea, aparece en el listado y en el RSS."
publishedAt: 2026-07-30
rating: 4          # opcional, 1-5
tags: ["historia"] # opcional
draft: false       # opcional, default false
---

El resumen en markdown.
```

**Ensayo** → `src/content/essays/<slug>.md` — mismos campos, sin `author` ni `rating`.

`git push` a `main` y el Action buildea y publica la imagen.

Si a un archivo le falta un campo requerido **el build falla** nombrando el archivo y el campo,
así que un `.md` mal formado nunca llega a producción. `draft: true` lo excluye de listados,
rutas y RSS.

## Desarrollo

Requiere Node 22+.

```sh
npm install
npm run dev      # localhost:4321
npm run build    # → dist/
npm run preview
```

## Deploy

Push a `main` → GitHub Action buildea la imagen y la sube a `ghcr.io/juanhdzma/publi:latest`
→ Portainer hace pull.

```sh
docker build -t publi --build-arg SITE_URL=https://tu-dominio .
docker run -p 8080:80 publi
```

`SITE_URL` define las URLs absolutas del RSS, el sitemap y los `<link rel="canonical">`.
En GitHub se configura como **repository variable** (`Settings → Secrets and variables →
Actions → Variables`), no como secret. Sin ese valor el build usa `http://localhost:4321`.

## Estructura

```
src/
├── content.config.ts    schemas de books y essays
├── config.ts            título, descripción, autor
├── lib/content.ts       queries, filtrado de drafts, orden por fecha
├── content/
│   ├── books/           ← resúmenes
│   └── essays/          ← ensayos
├── layouts/             BaseLayout (chrome) · ProseLayout (lectura)
├── components/          ContentCard · ThemeToggle
└── pages/               home, listados, [...slug], rss.xml, 404
```
