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

### Cita suelta → `src/content/quotes/<slug>.md`

Para frases que no vienen de ningún libro ni ensayo del sitio. Aparecen en `/quotes/` junto
a las demás.

```markdown
---
text: "La simplicidad es un prerrequisito de la confiabilidad."
author: "Edsger W. Dijkstra"
source: "EWD498"        # opcional, la obra
url: "https://..."      # opcional, vuelve la fuente un link externo
publishedAt: 2026-07-31
tags: ["software"]      # opcional
---
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

Tres mecanismos dentro de una entrada, combinables. Ver `src/content-demo/books/sapiens.md`,
que usa los tres.

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

> ⚠️ En la máquina de Juan, `node` sale de miniconda (v20) y tapa al de Homebrew. Prefijar:
> `export PATH="/opt/homebrew/bin:$PATH"`

> ⚠️ `npm run check` **no compila CSS**. Después de tocar `src/styles/global.css` hay que
> correr `npm run build`, que es el único que valida las directivas de Tailwind.

### Verificar en el container

```sh
docker compose up -d --build   # → localhost:8002
```

`docker-compose.override.yml` hace que Compose buildee desde el source en local.
`docker-compose.yml` queda limpio con la imagen de GHCR para que Portainer solo haga pull.

---

## Íconos

`public/favicon.svg` es la fuente de verdad del logo. Los binarios se generan de ahí:

```sh
npm run icons
```

Emite tres archivos:

| Archivo                | Qué es                                                        |
| ---------------------- | ------------------------------------------------------------- |
| `favicon.ico`          | 16/32/48, fallback para navegadores sin favicon vectorial      |
| `apple-touch-icon.png` | 180×180 sin canal alpha — iOS rellena la transparencia solo    |
| `og.png`               | 1200×630, la imagen que aparece al compartir el link           |

Correrlo cada vez que cambie el SVG y commitear los cuatro archivos.

---

## Tipografía

Dos familias, ambas self-hosted vía `@fontsource-variable`: Vite las empaqueta en `/_astro/`
con hash y las sirve el mismo nginx, sin pedidos externos.

- **Crimson Pro** — títulos, citas y todo lo que use `font-serif`
- **Inter** — cuerpo, navegación y metadatos

Se importan las variantes **`wght`**, que traen solo el eje de peso: la mitad de KB que las
`opsz`, cuyo eje óptico no se usa. Primera visita: ~96 KB (48 + 48), cacheados para siempre.

Los stacks del sistema quedan de fallback, así que si la font no carga el sitio sigue legible.

### `src/styles/fonts.css` es generado

fontsource publica un solo CSS por eje con los **ocho** subsets adentro (cyrillic, greek,
vietnamese…). El browser baja solo el que necesita gracias a `unicode-range`, pero los ocho
se emiten igual al bundle.

```sh
npm run fonts    # → src/styles/fonts.css, solo latin y latin-ext
```

Deja 8 `@font-face` en vez de 20 y saca ~200 KB del bundle. El archivo se commitea y **no se
edita a mano**; el CI corre el script y falla si el resultado difiere de lo commiteado, que
es lo que detecta una actualización de fontsource que cambie los `unicode-range`.

`latin` cubre el español entero; `latin-ext` está para los nombres propios (Dvořák, Erdős).

> Cambiar una font toca **tres** lugares: `SOURCES` en `scripts/generate-fonts.mjs`, el
> `@theme` de `global.css` y el `import` del preload en `BaseLayout.astro`. Si se actualiza
> solo el primero, se precarga la font vieja.

---

## Estilos

**Todo el estilo vive en `src/styles/global.css`.** Las páginas componen layout (grid, gaps,
márgenes) y usan las clases del sistema; no llevan utilities de tipografía ni de color.
Cambiar cómo se ve un título en todo el sitio es editar una regla.

| Grupo      | Clases                                                              |
| ---------- | ------------------------------------------------------------------- |
| Chrome     | `skip-link` `main` `mode-chip` `demo-note`                           |
| Marca      | `site-brand` `site-mark`                                             |
| Página     | `page-header` `page-title` `page-intro`                              |
| Sección    | `section-header` `section-title` `section-title-sub` `section-link`  |
| Metadatos  | `meta-row` `meta-kind`                                               |
| Entrada    | `entry` `entry-title` `entry-link` `entry-byline` `entry-summary`    |
| Fila       | `row` `row-title`                                                    |
| Chips      | `chip` `chip-sm` `chip-md` `chip-count`                              |
| Citas      | `quote` `quote-text` `quote-author` `quote-origin`                   |
| Contadores | `stat-band` `stat` `stat-value` `stat-label`                         |
| Nube       | `tag-cloud` `cloud-tag` `cloud-count`                                |
| Tag        | `tag-section` `tag-section-title` `tag-section-name` `tag-section-count` |
| Cuerpo     | `prose-publi`                                                        |

Los colores y las tipografías son tokens en `@theme`: `ink`, `ink-muted`, `paper`, `line`,
`accent`, cada uno con su variante `-dark`.

---

## Contenido real y contenido de pruebas

Hay dos árboles y los dos se buildean:

```
src/content/          ← lo real, lo que se publica
├── books/  essays/  quotes/
└── _templates/       ← plantillas, no se publican

src/content-demo/     ← set de pruebas
└── books/  essays/  quotes/
```

El botón **demo** del header alterna cuál se muestra. El estado queda en `localStorage`, así
que sobrevive la navegación y la recarga.

Sirve para ver cómo queda el sitio lleno mientras el contenido real está vacío o corto, y
para probar un cambio de diseño contra material variado sin publicar nada.

**El set de pruebas no se publica en ningún lado:** queda fuera del feed y del sitemap, sus
fichas viven bajo `/books/demo/...`, llevan un aviso arriba y van con `noindex`. Sin JavaScript el sitio muestra
solo lo real. Aun así, el HTML de las fichas de prueba viaja al visitante — no poner ahí nada
que no pueda verse.

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

El workflow también corre en PRs contra `main`, sin publicar imagen, por si alguna vez hace
falta validar algo antes de mergear.

```sh
docker build -t publi --build-arg SITE_URL=https://tu-dominio .
docker run -p 8002:80 publi
```

### Detrás de un reverse proxy

Nginx escucha en el **80** dentro del container, así que un proxy en la misma red de Docker
apunta a `publi:80`. `docker-compose.yml` no publica puertos al host: el acceso es solo por
la red de Docker. El `8002` vive en `docker-compose.override.yml`, que Compose mergea únicamente
en local.

El proxy tiene que compartir red con el container. Si corre en otro stack, agregarle a este
la red externa que use:

```yaml
services:
  publi:
    networks: [proxy]

networks:
  proxy:
    external: true
```

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
├── lib/content.ts       queries, drafts, tags, citas, modo, reading time
├── content/             ← lo real
│   ├── books/           ← resúmenes
│   ├── essays/          ← ensayos
│   ├── quotes/          ← citas sueltas, una por archivo
│   └── _templates/      ← plantillas para copiar, no se publican
├── content-demo/        ← set de pruebas, mismo layout que content/
├── layouts/             BaseLayout (chrome) · ProseLayout (lectura)
├── components/          tarjetas, filas, citas, chips, filtro
├── pages/               home, listados, [...slug], tags, quotes, 404
│   ├── rss.xml.ts       feed
│   └── robots.txt.ts    robots + link al sitemap
└── styles/global.css    ← el sistema de estilos completo

public/                  servido tal cual desde la raíz
├── favicon.svg          ← fuente de verdad del logo
├── favicon.ico          generado
├── apple-touch-icon.png generado
└── og.png               generado

scripts/
├── generate-icons.mjs   npm run icons
└── generate-fonts.mjs   npm run fonts

nginx.conf                     server block
nginx-security-headers.conf    snippet que cada location incluye
```

---

## Pendientes

- **Las citas de ejemplo están sin verificar.** Varias son paráfrasis y los números de
  capítulo son aproximados. Contrastar contra el original antes de publicar.
- TLS y exposición a internet del server casero. Mientras sea LAN no hace falta.
