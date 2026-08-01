# Publi — guía para Claude Code

Sitio estático de resúmenes de libros, ensayos y citas. Astro 7 + Tailwind v4, servido por
nginx en un container. Publicar es agregar un `.md` al repo.

Ver `README.md` para el frontmatter de cada colección.

---

## Entorno

**`node` sale de miniconda (v20) y tapa al de Homebrew (v26).** Astro 7 pide Node 22+, así
que todo comando npm/npx/node hay que prefijarlo:

```sh
export PATH="/opt/homebrew/bin:$PATH"
```

Sin eso falla con `Node.js v20.17.0 is out-of-date and unsupported!`.

---

## Verificar cambios

```sh
npm run check                  # tipos — NO compila CSS
npm run build                  # lo único que valida Tailwind
docker compose up -d --build   # → localhost:8002
```

`docker-compose.yml` no publica puertos: en el server el acceso es por la red de Docker vía
reverse proxy, contra `publi:80`. El `8002` sale de `docker-compose.override.yml`, que
Compose mergea solo en local.

**`npm run check` no alcanza si tocaste `global.css`.** Las directivas inválidas de Tailwind
solo aparecen en `build`. Ya pasó dos veces: `check` daba 0 errores y `build` fallaba.

El container tiene healthcheck. Esperar a que resuelva antes de dar algo por bueno:

```sh
until [ "$(docker inspect publi --format '{{.State.Health.Status}}')" != "starting" ]; do sleep 2; done
```

---

## Estilos: todo en `global.css`

**Regla dura: las páginas y componentes no llevan utilities de tipografía ni de color.**
Solo layout (grid, flex, gaps, márgenes) más las clases del sistema definidas en
`src/styles/global.css` bajo `@layer components`.

El motivo es concreto: cuando los estilos estaban repartidos como utilities en cada `.astro`,
un rediseño dejó `/tags/` atrás con el diseño viejo porque había que acordarse de tocarla.
Si agregás una variante nueva, va al `@layer components`, no al markup.

Los tokens de color y tipografía están en `@theme`: `ink`, `ink-muted`, `paper`, `line`,
`accent`, cada uno con variante `-dark`.

### Dos límites de Tailwind v4 que el build encuentra y el check no

1. **`group` no se puede usar en `@apply`** — es una clase marcadora, no una utility. No hace
   falta: como el CSS de componente es propio, la relación de hover se escribe con el
   selector padre.

   ```css
   .entry:hover .entry-link { @apply underline decoration-accent/60; }
   ```

2. **`@apply` no acepta clases de componente propias.** No se puede `@apply chip` desde otra
   regla. Componer en el markup (`class="chip chip-md"`) o compartir declaración con una
   lista de selectores.

---

## Contenido

Tres colecciones en `src/content.config.ts`, todas con schema Zod:

- `books` — resúmenes, con `author` y `rating`
- `essays` — ensayos propios
- `quotes` — citas sueltas, una por archivo, sin entrada detrás

`src/lib/content.ts` centraliza las queries: filtrado de `draft`, orden por fecha, tags,
citas y reading time. **Las páginas no llaman `getCollection` directo** salvo en
`getStaticPaths`, donde hace falta la entrada cruda para `render()`.

La atribución de una cita se infiere: por defecto el autor del libro, o el del sitio en un
ensayo. `source` solo se usa cuando la frase es de un tercero.

Si agregás un campo al schema, actualizá también el README — es la referencia de publicación.

---

## Tipografía

Dos familias self-hosted vía `@fontsource-variable`: **Crimson Pro** (serif) e **Inter**
(sans). Se importan las variantes `wght`, no las `opsz` — la mitad de KB y el eje óptico no
se usa.

**Cambiar una font toca dos archivos**: el `@import` en `global.css` y el `import` del
preload en `BaseLayout.astro`. Tocar solo el primero deja precargando la font anterior, y
no falla el build ni el check.

---

## Íconos

`public/favicon.svg` es la fuente; `npm run icons` regenera `favicon.ico`,
`apple-touch-icon.png` y `og.png` desde ahí. No editar los binarios a mano.

El PNG de Apple se aplana sin canal alpha a propósito: iOS rellena cualquier
transparencia con blanco o negro por su cuenta, y el ícono queda con un borde que no
corresponde.

`og.png` es la preview al compartir el link. Su URL en el `<head>` tiene que ser absoluta
—las redes no resuelven rutas relativas— y sale de `Astro.site`, o sea de `SITE_URL`.

---

## Convenciones

- **Código en inglés** (archivos, variables, funciones, slugs de rutas). **Contenido en
  español.**
- **Cero comentarios** salvo que expliquen un porqué no obvio. Los que hay marcan cosas como
  el `scroll-margin-top` por el header sticky.
- Commits en **Conventional Commits**, cuerpo en español explicando el porqué, no el qué.
- Los slugs de tags normalizan acentos (`biología` → `biologia`) vía `slugifyTag`.

---

## Trampas conocidas

- **`astro check` reporta 0 hints ahora.** Si aparece uno, suele ser una API de zod 4
  deprecada (`z.string().url()` → `z.url()`).
- El **filtro de categorías del home** es JS vanilla en `TagFilter.astro`. Usa `aria-pressed`
  como fuente de verdad del estado: el estilo sale del atributo, no de una clase paralela.
- **El contenido de ejemplo es placeholder.** Las 64 citas incluyen paráfrasis atribuidas a
  autores reales con números de capítulo aproximados. No tratarlas como verificadas ni
  agregar más en ese tono sin avisar.
- `dist/` local se desactualiza si corrés `check` pero no `build`. Al comparar HTML servido
  contra `dist/`, buildear primero.

---

## Documentación de Astro

https://docs.astro.build — en particular
[content collections](https://docs.astro.build/en/guides/content-collections/),
[routing](https://docs.astro.build/en/guides/routing/) y
[styling](https://docs.astro.build/en/guides/styling/).
