# Publi

Sitio estático de resúmenes de libros, ensayos y citas. **Publicar = agregar un `.md` y
pushear.** Sin CMS, sin base de datos, sin panel de admin: el contenido vive versionado en git.

Astro 7 + Tailwind v4 → HTML estático servido por nginx en un container.

---

## Publicar

Un archivo markdown en la carpeta que corresponda. El nombre del archivo es la URL.

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

### Red de seguridad

Si a un archivo le falta un campo requerido **el build falla** nombrando el archivo y el
campo, con exit code 1. Un `.md` mal formado no llega a producción.

`draft: true` lo excluye de listados, rutas, filtros y de la página de citas.

---

## Citas y referencias

Tres mecanismos dentro de una entrada, combinables. Ver `src/content/books/sapiens.md`, que
usa los tres.

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

## Estilos

**Todo el estilo vive en `src/styles/global.css`.** Las páginas componen layout (grid, gaps,
márgenes) y usan las clases del sistema; no llevan utilities de tipografía ni de color.
Cambiar cómo se ve un título en todo el sitio es editar una regla.

| Grupo      | Clases                                                          |
| ---------- | --------------------------------------------------------------- |
| Página     | `page-header` `page-title` `page-intro`                          |
| Sección    | `section-header` `section-title` `section-title-sub` `section-link` |
| Metadatos  | `meta-row` `meta-kind`                                           |
| Entrada    | `entry` `entry-title` `entry-link` `entry-byline` `entry-summary` |
| Fila       | `row` `row-title` `row-name` `row-aside` `row-count`             |
| Chips      | `chip` `chip-sm` `chip-md` `chip-count`                          |
| Citas      | `quote` `quote-text` `quote-author` `quote-origin`               |
| Contadores | `stat-band` `stat` `stat-value` `stat-label`                     |
| Nube       | `tag-cloud` `cloud-tag` `cloud-count` `tag-section*`             |
| Cuerpo     | `prose-publi`                                                    |

Los colores y las tipografías son tokens en `@theme`: `ink`, `ink-muted`, `paper`, `line`,
`accent`, cada uno con su variante `-dark`.

---

## Deploy

Push a `main` → el Action corre `astro check`, buildea la imagen y la sube a
`ghcr.io/juanhdzma/publi:latest` → Portainer hace pull.

```sh
docker build -t publi --build-arg SITE_URL=https://tu-dominio .
docker run -p 8002:80 publi
```

`SITE_URL` define las URLs absolutas del sitemap y los `<link rel="canonical">`. Se configura
en GitHub como **repository variable** (`Settings → Secrets and variables → Actions →
Variables`), no como secret. Sin ese valor el build usa `http://localhost:4321`.

---

## Estructura

```
src/
├── content.config.ts    schemas de las 3 colecciones
├── config.ts            título, tagline, descripción, autor
├── lib/content.ts       queries, drafts, tags, citas, reading time
├── content/
│   ├── books/           ← resúmenes
│   ├── essays/          ← ensayos
│   └── quotes/          ← citas sueltas, una por archivo
├── layouts/             BaseLayout (chrome) · ProseLayout (lectura)
├── components/          tarjetas, filas, citas, chips, filtro
├── pages/               home, listados, [...slug], tags, quotes, 404
└── styles/global.css    ← el sistema de estilos completo
```

---

## Pendientes

- **Las citas de ejemplo están sin verificar.** Varias son paráfrasis y los números de
  capítulo son aproximados. Contrastar contra el original antes de publicar.
- El tag `literatura` (de la cita de Borges) no tiene página: `/tags/` solo recorre libros y
  ensayos, no las citas sueltas.
- TLS y exposición a internet del server casero. Mientras sea LAN no hace falta.
