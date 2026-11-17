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
docker rm -f publi; docker build -t publi --build-arg SITE_URL=http://localhost:8002 . \
  && docker run -d --name publi -p 8002:80 publi   # → localhost:8002
```

`docker-compose.yml` no publica puertos: en el server el acceso es por la red de Docker vía
reverse proxy, contra `publi:80`. El `8002` solo existe en el `docker run` local; no hay
override de Compose a propósito, para que ningún puerto pueda viajar al server.

**`add_header` de nginx no se hereda.** Un `location` que declara su propio `add_header`
pierde todos los del `server`. Por eso los headers de seguridad viven en
`docker/nginx-security-headers.conf` y cada `location` hace `include`. Si agregás un `location`,
agregale el include o queda sirviendo sin `nosniff` ni `X-Frame-Options`. Se verifica así:

```sh
curl -sI http://localhost:8002/_astro/<hash>.css | grep -i x-frame
```

El HTML va con `Cache-Control: no-cache` a propósito: es lo único que no puede cachearse,
porque referencia los `/_astro/` hasheados y un deploy nuevo los renombra.

**`npm run check` no alcanza si tocaste `global.css`.** Las directivas inválidas de Tailwind
solo aparecen en `build`. Ya pasó dos veces: `check` daba 0 errores y `build` fallaba.

El container tiene healthcheck. Esperar a que resuelva antes de dar algo por bueno:

```sh
until [ "$(docker inspect publi --format '{{.State.Health.Status}}')" != "starting" ]; do sleep 2; done
```

**Al comparar contra lo que se ve en el browser, forzar recarga.** El HTML recién ahora sale
con `no-cache`; las copias que el browser guardó antes siguen ahí hasta que revalide, y un
render viejo se confunde fácil con un bug. Ya pasó: una captura mostraba un layout que el
container no estaba sirviendo. `curl` no miente, el browser sí.

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

### Dos árboles: `content/` y `content-demo/`

Cada colección se lee de los dos, y **los dos se buildean**. El botón `demo` del header
elige cuál se muestra; el modo sale del `id` que arma el loader (`content/books/x` vs
`content-demo/books/x`) y lo resuelve `parseId()`.

**El patrón para agregar UI que dependa del modo: renderizar las dos versiones y marcar el
contenedor con `data-mode`.** El CSS esconde el que no corresponde. No filtrar en JS por
página — el modo ya está resuelto antes del primer paint por el script inline del head.

```astro
{MODES.map((mode) => <div data-mode={mode}>{/* la versión de ese modo */}</div>)}
```

Marcar el **contenedor** y no cada tarjeta: si se marcan los elementos sueltos, se mezclan
los dos modos dentro de la misma lista y se rompen `:last-child`, el `:has` del borde de
`.row` y el balanceo de las columnas de `/quotes/`.

Ojo con los `id`: al estar los dos modos en el DOM, un `id` por ítem se duplica. En `/tags/`
se resuelve prefijando con el modo (`anchor()`).

Las fichas de prueba **no salen del sitio**: fuera del feed y del sitemap, bajo `/books/demo/`,
con un aviso arriba y con `noindex, nofollow`. El `noindex` hace falta además del sitemap: sus
links viven en el HTML publicado aunque el CSS los esconda, así que un crawler los sigue igual
y el sitemap solo dice "no las sugiero", no "no las indexes". Por lo mismo **no** van a
`robots.txt`: un `Disallow` impediría leer el `noindex`.

Aun así su HTML viaja al visitante.

`src/content/_templates/` son las plantillas de publicación. Astro ignora todo lo que empieza
con `_`, así que no se buildean. Si cambia un schema, actualizar la plantilla que toque.

`src/lib/content.ts` centraliza las queries: filtrado de `draft`, orden por fecha, tags,
citas y reading time. **Las páginas no llaman `getCollection` directo** salvo en
`getStaticPaths`, donde hace falta la entrada cruda para `render()`.

La atribución de una cita se infiere: por defecto el autor del libro, o el del sitio en un
ensayo. `source` solo se usa cuando la frase es de un tercero.

`getAllTags()` recorre entradas **y** citas sueltas, y devuelve los contadores partidos por
modo y por tipo (`tag.real.entries`, `tag.demo.quotes`). Entradas y citas van separadas
porque el filtro del home solo puede esconder entradas: si el chip mostrara el total, el
número no coincidiría con lo que filtra. Para el total de un modo hay `tagTotal(tag, mode)`,
y `tagEmpty()` dice si el tag no existe en ese modo y hay que esconderlo entero.

Si agregás un campo al schema, actualizá también el README — es la referencia de publicación.

---

## Tipografía

Dos familias self-hosted vía `@fontsource-variable`: **Crimson Pro** (serif) e **Inter**
(sans). Se importan las variantes `wght`, no las `opsz` — la mitad de KB y el eje óptico no
se usa.

**`src/styles/fonts.css` es generado, no editarlo.** Sale de `npm run fonts`, que filtra los
CSS de fontsource y deja solo `latin` y `latin-ext` (8 `@font-face` en vez de 20). El CI
corre el script y compara contra lo commiteado, así que una actualización de fontsource que
cambie los `unicode-range` falla en vez de pasar silenciosa.

**Cambiar una font toca tres lugares**: `SOURCES` en `scripts/generate-fonts.mjs`, el
`@theme` de `global.css` y el `import` del preload en `BaseLayout.astro`. Tocar solo el
primero deja precargando la font anterior, y no falla el build ni el check.

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
- **Todo va directo a `main`.** Sin feature branches ni PRs: es repo de una persona y el
  deploy sale de un push a `main`. Un pedido de "commits separados" son varios commits en
  `main`, no una rama.
- **Commitear sí, pushear solo si lo piden.** El push a `main` dispara build de imagen y
  deploy a Portainer.
- Los slugs de tags normalizan acentos (`biología` → `biologia`) vía `slugifyTag`.

---

## Trampas conocidas

- **`astro check` reporta 0 hints ahora.** Si aparece uno, suele ser una API de zod 4
  deprecada (`z.string().url()` → `z.url()`).
- El **filtro de categorías del home** es JS vanilla en `TagFilter.astro`. Usa `aria-pressed`
  como fuente de verdad del estado: el estilo sale del atributo, no de una clase paralela.
  El estado se refleja en `?tags=` con `replaceState` — con `pushState` cada click sería una
  entrada de historial y salir del home costaría N backs.
- El filtro esconde filas con `[hidden]`, y `:last-child` **es estructural**: no salta las
  escondidas. Por eso el borde de la última fila se resuelve con
  `.row:not([hidden]):not(:has(~ .row:not([hidden])))` y no con `last:border-0`.
- **`/quotes/` es multicol (`columns-2`), no grid.** Ahí el margen inferior del último
  elemento de una columna se arrastra al tope de la siguiente y la desalinea, así que el
  separador de `.quote` es `pb-10` y no `mb-10`. Vale para cualquier hijo que se agregue a
  ese contenedor: espaciar con padding.
- **Los headings salen por prop, no fijos.** `ContentCard` y `ContentRow` reciben `level`
  porque cuelgan de encabezados distintos según la página. Si los ponés fijos, alguna página
  salta de `h1` a `h3`.
- **El contenido de `content-demo/` es placeholder.** Las citas incluyen paráfrasis
  atribuidas a autores reales con números de capítulo aproximados. No tratarlas como
  verificadas ni agregar más en ese tono sin avisar. Nada de eso va a `content/`.
- **`textContent` no respeta `display:none`.** Al verificar qué modo se está viendo, medir
  con `innerText` o `offsetParent`: `textContent` devuelve también el texto del modo
  escondido y hace parecer que el toggle no funciona.
- El modo vive en `localStorage` y **persiste entre páginas**. Al testear varias páginas
  seguidas hay que resetearlo por caso, o los resultados salen corridos una posición.
- El **color de la barra del browser** vive en `THEME_COLOR` (`src/config.ts`) y viaja al
  cliente en los `data-light` / `data-dark` del `<meta name="theme-color">`. El toggle lee de
  ahí: no hardcodear los hex en el script, se desincronizan.
- `dist/` local se desactualiza si corrés `check` pero no `build`. Al comparar HTML servido
  contra `dist/`, buildear primero.

---

## Documentación de Astro

https://docs.astro.build — en particular
[content collections](https://docs.astro.build/en/guides/content-collections/),
[routing](https://docs.astro.build/en/guides/routing/) y
[styling](https://docs.astro.build/en/guides/styling/).
