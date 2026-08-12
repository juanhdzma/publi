---
# Copiar a src/content/essays/<slug>.md — el nombre del archivo es la URL.
# Mismos campos que un libro, sin author ni rating: el autor es el del sitio.

title: "Título del ensayo"
summary: "Una línea. Es lo que se lee en los listados y lo que va al feed."
publishedAt: 2026-08-12

tags: ["software", "decisiones"] # opcional
draft: false # opcional, default false

# Opcional. Acá source sí suele hacer falta: en un ensayo propio, una cita sin
# source se atribuye a vos.
quotes:
  - text: "Una frase tuya que resume el ensayo."
    featured: true # opcional, una sola por entrada
  - text: "Algo que dijo otra persona."
    source: "Quien lo dijo"

references:
  - title: "Título de la obra"
    author: "Autor" # opcional
    year: "2011" # opcional
    url: "https://ejemplo.com" # opcional
    note: "Por qué la incluyo." # opcional
---

El ensayo en markdown.

## Una sección

Texto normal, con una nota al pie si hace falta.[^1]

[^1]: La nota.
