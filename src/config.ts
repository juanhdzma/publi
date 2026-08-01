export const SITE = {
  title: 'Publi',
  tagline: 'Resúmenes de libros y ensayos',
  description: 'Resúmenes de libros y ensayos que voy leyendo y escribiendo.',
  author: 'Juan Hernández',
} as const;

/* El color de la barra del browser. Va acá y no en `global.css` porque lo
   consume el `<meta>`, que no puede leer una custom property de CSS. */
export const THEME_COLOR = {
  light: '#fdfaf4',
  dark: '#120f0c',
} as const;
