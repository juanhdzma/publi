---
title: "El mítico hombre-mes"
author: "Frederick P. Brooks Jr."
summary: "Agregar gente a un proyecto atrasado lo atrasa más. Cincuenta años después seguimos sin aprenderlo."
publishedAt: 2026-07-18
rating: 5
tags: ["software", "gestión", "clásicos"]
quotes:
  - text: "Agregar gente a un proyecto de software atrasado lo atrasa más."
    page: "cap. 2"
    featured: true
  - text: "Todos los programadores son optimistas. Todo va a andar bien, piensan, y esta vez sí."
    page: "cap. 2"
  - text: "El hombre-mes como unidad para medir el tamaño de un trabajo es un mito peligroso y engañoso."
    page: "cap. 2"
  - text: "El segundo es el sistema más peligroso que un hombre diseña en su vida."
    page: "cap. 5"
  - text: "Muéstrame tus diagramas de flujo y escondeme tus tablas, y voy a seguir sin entender nada. Muéstrame tus tablas y por lo general no voy a necesitar tus diagramas: van a ser obvios."
    page: "cap. 9"
  - text: "No hay una sola novedad, ni en tecnología ni en técnica de gestión, que por sí sola prometa siquiera un orden de magnitud de mejora en productividad, confiabilidad o simplicidad."
    page: "No Silver Bullet"
references:
  - title: "The Mythical Man-Month"
    author: "Frederick P. Brooks Jr."
    year: "1975"
    note: "La edición aniversario de 1995 suma No Silver Bullet."
  - title: "No Silver Bullet — Essence and Accident in Software Engineering"
    author: "Frederick P. Brooks Jr."
    year: "1986"
    url: "https://worrydream.com/refs/Brooks_1986_-_No_Silver_Bullet.pdf"
---

## La ley de Brooks

*Adding manpower to a late software project makes it later.* Es la frase que todos citan
y casi nadie aplica.

El razonamiento es simple: el trabajo se puede dividir, pero la **comunicación** no.
Con `n` personas, los canales de comunicación crecen como `n(n-1)/2`. Sumar el quinto
integrante no agrega un quinto de capacidad: agrega cuatro relaciones nuevas que hay que
mantener, más el tiempo que los otros cuatro pierden en entrenarlo.

## Hombre-mes es una unidad falsa

El título ataca la métrica misma. Hombres y meses solo son intercambiables cuando las
tareas no requieren comunicación entre sí — cosechar trigo, sí; parir un bebé, no. El
software está mucho más cerca del segundo caso.

## El segundo sistema

El sistema más peligroso que un arquitecto diseña es el **segundo**. En el primero es
cauto porque no sabe. En el tercero ya aprendió a contenerse. En el segundo mete todas
las ideas que dejó afuera la primera vez, y el resultado se hunde por sobrediseño.

## Lo que me quedó

Que casi todos los problemas del libro son de comunicación humana, no técnicos — y por
eso no envejecieron. Cambiaron los lenguajes, los deploys y las herramientas; no cambió
que un equipo de veinte necesita más coordinación de la que cualquiera presupuesta.

## Crítica

Los ejemplos son del OS/360 y hoy suenan arqueológicos: tarjetas perforadas, manuales
impresos, equipos de cientos de personas. Hay que traducir cada anécdota al presente, lo
cual pide paciencia. El ensayo *No Silver Bullet*, agregado en la edición aniversario, es
el capítulo que más rinde por página.
