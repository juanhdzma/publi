---
title: "La evolución no optimiza, satisface"
summary: "El nervio laríngeo recurrente de la jirafa mide cuatro metros para recorrer quince centímetros. Tu codebase también."
publishedAt: 2026-07-08
tags: ["biología", "software", "evolución"]
---

En la jirafa, el nervio laríngeo recurrente sale del cerebro, baja por el cuello entero,
rodea la aorta y vuelve a subir hasta la laringe: cuatro metros de recorrido para conectar
dos puntos separados por quince centímetros.

Ningún diseñador haría eso. La evolución tampoco lo diseñó: lo heredó. En los peces
ancestrales el trayecto era directo, y a medida que el cuello se alargó el nervio quedó
atrapado detrás de la arteria. Cada generación intermedia era viable, y ninguna pudo
"saltar" a la solución correcta porque el estado intermedio —desconectar el nervio y
volver a ruteando— no sobrevive.

## Óptimos locales

La evolución no busca el mejor diseño posible. Busca cualquier variante que funcione un
poco mejor que la anterior y que se pueda alcanzar con un cambio chico. Es *hill climbing*
sin capacidad de bajar: una vez que estás en una cima, cualquier camino a una cima más alta
exige atravesar un valle, y el valle te mata.

## El mismo mecanismo en un codebase

Mirá cualquier sistema con años encima y vas a encontrar jirafas. Un campo que se llama
`status` pero guarda un tipo. Una tabla de usuarios con dieciocho columnas nullables porque
cada feature agregó la suya. Un servicio que se llama `notifications` y hace facturación,
porque en su momento ahí estaba el cron.

Ninguna de esas decisiones fue estúpida cuando se tomó. Cada una fue el cambio más chico
que funcionaba dado el estado anterior. El resultado agregado no lo diseñó nadie, y por eso
no se puede defender con ningún argumento — solo explicar históricamente.

## Lo que se deduce de esto

Dos cosas, y tiran para lados opuestos.

La primera: dejá de buscar la intención detrás de cada rareza del sistema. Muchas veces no
hay ninguna. Preguntar "¿por qué lo hicieron así?" asume un diseñador que nunca existió.

La segunda: los refactors grandes existen justamente porque el gradiente local no alcanza.
Si solo aceptás cambios que mejoran algo hoy, te quedás en tu cima para siempre. Bajar al
valle a propósito —romper cosas, migrar, aguantar un período peor— es lo único que la
evolución no puede hacer y vos sí.

Esa es toda la ventaja que tenemos sobre el proceso que nos hizo. Vale la pena usarla de
vez en cuando.
