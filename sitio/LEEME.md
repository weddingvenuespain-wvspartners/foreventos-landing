# Fuentes de foreventos.com

Las páginas (`app/**/page.html`) se generan desde esta carpeta. No edites los `page.html` a mano: cambia aquí y ejecuta, desde la raíz del repo:

    node sitio/build.cjs            # todas las páginas
    node sitio/build.cjs inicio     # solo una (por nombre de archivo)

- `paginas/`: contenido de cada página (`inicio`, `servicios`, `plataforma`, `proyectos`, `contacto`). Títulos y descripciones, en `PAGES` de `build.cjs`.
- `piezas/`: `head.html`, `menu.html` (logo en el centro), `pie.html` e `intro.html` (solo en la home, una vez por sesión).
- `css/base.css` va en todas; `inicio.css` solo en la home y `paginas.css` en las interiores.
- `js/base.js`: menú, entradas al hacer scroll, intro y formularios (contacto y demo → API de app.foreventos.com). `hero.js` es la animación del pipeline; `testimonios.js`, el carrusel.
- Marcadores: `{{logo}}` (logo en línea) y `{{i:nombre}}` (iconos de `iconos.cjs`).
- Tipografías en `public/fonts` (sin Google Fonts ni Fontshare, por eso no hay banner de cookies).
- Testimonios: cada tarjeta con `data-pendiente` es un hueco. El build avisa mientras quede alguno; no publicar con huecos.
- `/en` sirve la versión antigua de la landing (`app/en/page.html`), traducida en el navegador.
