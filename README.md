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
summary: "Una línea, aparece en los listados."
publishedAt: 2026-07-30
rating: 4          # opcional, 1-5
tags: ["historia"] # opcional
draft: false       # opcional, default false
---

El resumen en markdown.
```

**Ensayo** → `src/content/essays/<slug>.md` — mismos campos, sin `author` ni `rating`.

### Citas

Hay tres mecanismos, se pueden combinar.

**1. Citas de la entrada** — lista en el frontmatter. La marcada con `featured: true` se
renderiza grande entre el header y el cuerpo; el resto va en una sección al final. Todas
aparecen además en `/quotes/`.

```yaml
quotes:
  - text: "La cita que va grande arriba."
    page: "cap. 2"          # opcional
    featured: true          # opcional, una por entrada
  - text: "Otra cita."
    source: "Otro autor"    # opcional; por defecto es el autor del libro
```

`source` solo hace falta cuando la frase no es del autor de la entrada — por ejemplo si en
un ensayo tuyo citás a otra persona.

**2. Cita en el cuerpo** — blockquote de markdown. El `<cite>` es opcional y agrega el guión
solo.

```markdown
> El texto citado.
>
> <cite>Autor, Obra</cite>
```

**3. Notas al pie** — sintaxis GFM, se numeran y enlazan solas.

```markdown
Una afirmación que necesita matiz.[^1]

[^1]: El matiz.
```

### Referencias

Lista de fuentes al final de la entrada. Solo `title` es obligatorio.

```yaml
references:
  - title: "Thinking, Fast and Slow"
    author: "Daniel Kahneman"
    year: "2011"
    url: "https://..."      # opcional, vuelve el título un link
    note: "Por qué importa"  # opcional
```

`git push` a `main` y el Action buildea y publica la imagen.

Si a un archivo le falta un campo requerido **el build falla** nombrando el archivo y el campo,
así que un `.md` mal formado nunca llega a producción. `draft: true` lo excluye de listados
y rutas.

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

`SITE_URL` define las URLs absolutas del sitemap y los `<link rel="canonical">`.
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
└── pages/               home, listados, [...slug], tags, 404
```
