---
title: "Sobre la abstracción prematura"
summary: "Toda abstracción es una apuesta sobre el futuro. La mayoría se pierde."
publishedAt: 2026-07-30
tags: ["software", "diseño"]
quotes:
  - text: "Código repetido que es fácil de borrar le gana a código compartido que es imposible de mover."
    featured: true
  - text: "Abstraer con un punto es dibujar una recta con un solo dato."
  - text: "Duplication is far cheaper than the wrong abstraction."
    source: "Sandi Metz"
  - text: "Si la respuesta honesta a \"¿van a cambiar juntos siempre?\" es \"no sé\", la respuesta es no."
references:
  - title: "The Wrong Abstraction"
    author: "Sandi Metz"
    year: "2016"
    url: "https://sandimetz.com/blog/2016/1/20/the-wrong-abstraction"
---

Escribir una abstracción es predecir. Decís: *esto va a cambiar de esta forma y no de
otra*. Si acertás, los cambios futuros cuestan una línea. Si errás, cuestan una
reescritura más el trabajo de desarmar lo que construiste.

El problema es que la predicción se hace en el peor momento posible: al principio, cuando
tenés un solo caso de uso y cero evidencia sobre cómo va a variar.

## La duplicación es información

Tres copias casi iguales de un bloque de código no son un problema a resolver de
inmediato. Son datos. Cada copia te muestra un eje real de variación, y recién con tres
puntos podés ver la forma de la curva. Abstraer con un punto es dibujar una recta con
un solo dato.

La duplicación tiene un costo visible y acotado: si cambia la regla, tocás tres lugares.
La abstracción equivocada tiene un costo invisible y creciente: cada caso nuevo que no
encaja se mete a la fuerza con un parámetro más, un flag, un caso especial. El resultado
es una función con siete argumentos booleanos que nadie quiere tocar.

## El test

Antes de extraer algo, la pregunta útil no es *"¿se repite?"* sino *"¿estos dos lugares
van a cambiar juntos, siempre, por la misma razón?"*. Si la respuesta honesta es "no sé",
la respuesta es no.

Código repetido que es fácil de borrar le gana a código compartido que es imposible de
mover. La mejor línea sigue siendo la que no escribí — pero la segunda mejor es la que
puedo borrar sin pedirle permiso a nadie.
