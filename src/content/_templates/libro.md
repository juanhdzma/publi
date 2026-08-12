---
# Copiar a src/content/books/<slug>.md — el nombre del archivo es la URL.
# Los campos sin comentario "opcional" son obligatorios: si falta uno, el build
# falla nombrando el archivo y el campo.

title: "Título del libro"
author: "Nombre del autor"
summary: "Una línea. Es lo que se lee en los listados y lo que va al feed."
publishedAt: 2026-08-12

rating: 4 # opcional, 1 a 5
tags: ["historia", "biología"] # opcional; los acentos se normalizan solos
draft: false # opcional, default false; en true no sale en ningún lado

# Citas del libro. Opcional.
# La marcada featured va grande entre el título y el cuerpo; el resto queda en
# una sección al final. Todas aparecen además en /quotes/.
quotes:
  - text: "La frase que abre la entrada."
    page: "cap. 2" # opcional
    featured: true # opcional, una sola por entrada
  - text: "Otra frase, esta va al final."
    page: "cap. 5"
  - text: "Una frase de otra persona citada dentro del libro."
    source: "Otro autor" # opcional; por defecto se atribuye al author de arriba

# Fuentes al final de la entrada. Opcional. Solo title es obligatorio.
references:
  - title: "Título de la obra"
    author: "Autor" # opcional
    year: "2011" # opcional
    url: "https://ejemplo.com" # opcional, vuelve el título un link
    note: "Por qué la incluyo." # opcional
---

El resumen en markdown. Los `##` arman la jerarquía de la entrada.

## Una sección

Texto normal. Una afirmación que necesita matiz.[^1]

[^1]: La nota al pie. Se numera y enlaza sola.

> Una cita en bloque dentro del cuerpo.
>
> <cite>Autor, Obra</cite>

## Otra sección

El `<cite>` es opcional y le agrega el guión solo.
