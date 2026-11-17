# Publi

Sitio estático de resúmenes de libros, ensayos y citas. **Publicar = agregar un `.md` y
pushear.** Sin CMS, sin base de datos, sin panel de admin: el contenido vive versionado en git.

Astro 7 + Tailwind v4 → HTML estático servido por nginx en un container.

---

## Publicar

Un archivo markdown en la carpeta que corresponda. El nombre del archivo es la URL.

**Hay plantillas listas en `src/content/_templates/`** — `libro.md`, `ensayo.md` y `cita.md`,
con todos los campos y un comentario en cada uno. Copiar la que toque a su carpeta, borrar
los comentarios y escribir. Astro ignora todo lo que empieza con `_`, así que las plantillas
no se publican.

```sh
cp src/content/_templates/libro.md src/content/books/sapiens.md
```

### Libro → `src/content/books/<slug>.md`

```markdown
---
title: "Sapiens"
author: "Yuval Noah Harari"
summary: "Una línea, aparece en los listados."
publishedAt: 2026-07-30
rating: 4               # opcional, 1-5
tags: ["historia"]      # opcional
draft: false            # opcional, default false
---

El resumen en markdown.
```

### Ensayo → `src/content/essays/<slug>.md`

Mismos campos, sin `author` ni `rating`.

### Cita suelta → `src/content/quotes.yml`

Para frases que no vienen de ningún libro ni ensayo del sitio. Aparecen en `/quotes/` junto
a las demás.

```yaml
- id: dijkstra-simplicidad          # único dentro del archivo
  text: "La simplicidad es un prerrequisito de la confiabilidad."
  author: "Edsger W. Dijkstra"
  source: "EWD498"                  # opcional, la obra
  url: "https://..."                # opcional, vuelve la fuente un link externo
  publishedAt: 2026-07-31
  tags: ["software"]                # opcional
```

Los `tags` de una cita cuentan igual que los de una entrada: aparecen como chips en
`/quotes/`, suman en `/tags/` y la cita se lista en la página de cada categoría. Un tag que
solo existe en citas igual tiene su página.

### Red de seguridad

Si a un archivo le falta un campo requerido **el build falla** nombrando el archivo y el
campo, con exit code 1. Un `.md` mal formado no llega a producción.

`draft: true` lo excluye de listados, rutas, filtros y de la página de citas.

---

## Citas y referencias

Tres mecanismos dentro de una entrada, combinables entre sí.

**1. Citas de la entrada** — lista en el frontmatter. La marcada `featured: true` se
renderiza grande entre el header y el cuerpo; el resto va en una sección al final. Todas
aparecen además en `/quotes/`.

```yaml
quotes:
  - text: "La cita que va grande arriba."
    page: "cap. 2"        # opcional
    featured: true        # opcional, una por entrada
  - text: "Otra cita."
    source: "Otro autor"  # opcional; por defecto es el autor del libro
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

**Referencias** — lista de fuentes al final de la entrada. Solo `title` es obligatorio.

```yaml
references:
  - title: "Thinking, Fast and Slow"
    author: "Daniel Kahneman"
    year: "2011"
    url: "https://..."       # opcional, vuelve el título un link
    note: "Por qué importa"  # opcional
```

---

## Desarrollo

Requiere **Node 22+**.

```sh
npm install
npm run dev      # localhost:4321
npm run build    # → dist/
npm run check    # astro check (tipos)
npm run preview
```

Para verificar contra nginx, ver el `docker build` / `docker run` de la sección Deploy.

---

---

## Íconos y tipografía

`public/favicon.svg` es el logo; `favicon.ico`, `apple-touch-icon.png` (180×180, sin alpha) y
`og.png` (1200×630, la imagen al compartir el link) se hacen a mano a partir de él.

Dos familias self-hosted vía `@fontsource-variable`, variantes `wght`: **Crimson Pro**
(títulos y citas) e **Inter** (cuerpo y navegación). `src/styles/fonts.css` es el CSS de fontsource
recortado a `latin` y `latin-ext`.

---

## Estilos

Todo el estilo vive en `src/styles/global.css`, bajo `@layer components`. Las páginas
componen layout (grid, gaps, márgenes) y usan esas clases; no llevan utilities de tipografía
ni de color. Los colores son tokens en `@theme`: `ink`, `ink-muted`, `paper`, `line`,
`accent`, cada uno con su variante `-dark`.

---

## Rutas generadas aparte del contenido

| Ruta                 | Qué es                                                          |
| -------------------- | --------------------------------------------------------------- |
| `/rss.xml`           | Feed de libros y ensayos, más nuevo primero                      |
| `/robots.txt`        | Apunta al sitemap; la URL absoluta sale de `SITE_URL`             |
| `/sitemap-index.xml` | Lo genera `@astrojs/sitemap`                                     |
| `/404.html`          | Lo sirve nginx vía `error_page`                                  |

Las tres primeras son endpoints (`src/pages/*.ts`), no archivos en `public/`: necesitan
`Astro.site` para armar URLs absolutas y eso solo se conoce al buildear.

---

## Deploy

El flujo es commit directo a `main` — sin ramas ni PRs. Push a `main` → el Action corre
`astro check` + `astro build` + el chequeo de `fonts.css`, buildea la imagen y la sube a
`ghcr.io/juanhdzma/publi:latest` → Portainer hace pull.

**Pushear es deployar.** No hay paso intermedio ni aprobación.

```sh
docker build -t publi --build-arg SITE_URL=https://tu-dominio .
docker run -p 8002:80 publi
```

`docker-compose.yml` es solo para el server: imagen de GHCR, sin puertos, Portainer solo hace
pull.

### Detrás de un reverse proxy

Nginx escucha en el **80** dentro del container, así que un proxy en la misma red de Docker
apunta a `publi:80`. `docker-compose.yml` no publica puertos al host: el acceso es solo por
la red de Docker.

El proxy tiene que compartir red con el container; si corre en otro stack, agregarle a este
la red externa que use.

### SITE_URL

No afecta el ruteo: define las URLs absolutas que se hornean en el HTML al buildear
(`og:image`, `<link rel="canonical">` y el sitemap). Sin ese valor el build usa
`http://localhost:4321`.

Para un sitio interno da igual. Solo importa si lo exponés a internet y querés que la
preview al compartir el link cargue y que los buscadores lo indexen bien. En ese caso se
configura en GitHub como **repository variable** (`Settings → Secrets and variables →
Actions → Variables`), no como secret.

---

## Estructura

```
src/
├── content.config.ts    schemas de las 3 colecciones
├── config.ts            título, tagline, descripción, autor
├── lib/content.ts       queries, drafts, tags, citas, reading time
├── content/             books/, essays/, quotes.yml, _templates/
├── layouts/             BaseLayout (chrome) · ProseLayout (lectura)
├── components/          tarjetas, filas, citas, chips, filtro
├── pages/               home, [kind] (listado y entrada), tags, quotes, 404, rss, robots
└── styles/global.css    el sistema de estilos completo
public/                  favicon.svg y los íconos derivados
docker/nginx.conf        server block, headers y cache
```

---

## Pendientes

- **Las citas de ejemplo están sin verificar.** Varias son paráfrasis y los números de
  capítulo son aproximados. Contrastar contra el original antes de publicar.
- TLS y exposición a internet del server casero. Mientras sea LAN no hace falta.
