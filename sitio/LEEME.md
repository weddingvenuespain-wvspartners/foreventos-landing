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
- Inglés: `sitio/en/paginas` y `sitio/en/piezas` (menú y pie) son la traducción de cada página; el build genera `/en`, `/en/services`, `/en/platform`, `/en/projects` y `/en/contact`. Rutas, títulos y descripciones en inglés, en el campo `en` de `PAGES`. Al cambiar un texto en español, cámbialo también en `sitio/en/`. Los textos de `base.js` (formularios, menú) se eligen por `<html lang>`. El build pone hreflang es/en y el enlace ES/EN del menú y del pie (`{{otro}}`), y falla si una página en inglés enlaza a una ruta en español.
