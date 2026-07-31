---
title: "Contra el pronóstico"
summary: "Estimar fechas de software no falla por falta de disciplina. Falla porque estás promediando una distribución sin cola derecha acotada."
publishedAt: 2026-07-14
tags: ["software", "gestión", "decisiones", "riesgo"]
---

Toda estimación de software que vi tiene la misma forma: alguien dice "dos semanas", y
tarda cinco. La respuesta institucional suele ser pedir más rigor —descomponer más fino,
usar story points, mirar la velocity histórica—. Pero el problema no es de disciplina.

## La distribución es asimétrica

Cuando estimás una tarea, el mejor caso está acotado: no la vas a terminar en menos de un
día porque hay un piso de trabajo real. El peor caso no está acotado por nada. Podés
descubrir que la librería no soporta el caso de uso, que el sistema legacy tiene un
comportamiento no documentado, que el equipo que mantiene la API se disolvió.

Entonces la distribución tiene cola derecha larga, y la media queda muy por encima de la
moda. Vos estimás la moda —el caso que imaginás cuando cerrás los ojos— y después vivís
la media.

## Descomponer no arregla la asimetría

El truco estándar es partir la tarea en pedazos chicos y sumar. Ayuda con la ceguera —hay
subtareas que solo ves al descomponer— pero no toca el problema de fondo: cada subtarea
tiene su propia cola derecha, y la suma de asimetrías sigue siendo asimétrica.

Peor: descomponer te da confianza. Una lista de doce ítems estimados individualmente
*parece* más rigurosa que un número al voleo, y esa sensación no está respaldada por
nada.

## Qué hago en cambio

No dejé de estimar —es imposible operar sin alguna noción de tamaño—. Cambié qué prometo:

- **Rangos, no puntos.** "Entre dos y seis semanas" es información honesta. "Cuatro
  semanas" es ficción con una cifra significativa de más.
- **Fecha fija, alcance variable.** Si algo tiene que salir el 15, lo que se negocia es qué
  entra, no cuándo sale.
- **Timeboxear la incertidumbre.** Cuando no sé estimar algo, la tarea deja de ser
  "hacerlo" y pasa a ser "dos días para averiguar cuánto cuesta". Eso sí se puede prometer.

Ninguna de las tres mejora la precisión del pronóstico. Las tres reducen lo que depende de
que el pronóstico acierte, que es un objetivo bastante más alcanzable.
