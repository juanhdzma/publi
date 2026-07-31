---
title: "El costo de la configurabilidad"
summary: "Cada flag que agregás duplica los estados posibles de tu sistema. Nadie testea 2^12 combinaciones."
publishedAt: 2026-07-27
tags: ["software", "diseño", "decisiones"]
---

Un flag de configuración parece gratis. Es una línea en un YAML, un `if` en el código, y
resuelve la discusión de una vez: que cada quien lo prenda si lo necesita.

El problema es que los flags no se suman, se multiplican. Doce booleanos son 4.096 estados
posibles. Vos testeás dos: todo en default y la combinación que usás en tu ambiente. Los
otros 4.094 son territorio no explorado que igual va a producción.

## La configurabilidad es deuda diferida

Un flag suele ser una decisión que no quisiste tomar. En vez de definir cuál es el
comportamiento correcto, exponés ambos y delegás la elección al usuario — que tiene menos
contexto que vos para decidir.

A veces eso está bien: hay diferencias reales de entorno que ningún default cubre. Pero la
mayoría de los flags que vi nacieron de una discusión empatada en un PR, no de una necesidad
del usuario. El flag no resolvió el desacuerdo: lo congeló en el código y le puso costo de
mantenimiento perpetuo.

## Lo que cuesta de verdad

- **Testing**: cada combinación es un camino que nadie recorre hasta que rompe.
- **Soporte**: un bug reportado ahora empieza con "¿qué configuración tenés?".
- **Borrado**: sacar un flag exige demostrar que nadie lo usa, y casi nunca tenés esa
  telemetría.

Ese último punto es el que lo vuelve irreversible en la práctica. Agregar un flag toma
cinco minutos; sacarlo, meses de coordinación.

## Un criterio

Antes de agregar una opción, la pregunta útil no es *"¿alguien podría querer lo contrario?"*
—la respuesta es siempre sí— sino *"¿tengo un usuario concreto, hoy, que se bloquea sin
esto?"*. Si no lo tenés, elegí un default y bancalo.

Y si aparece el caso, cambiar un default es mucho más barato que borrar un flag que doce
equipos ya adoptaron.
