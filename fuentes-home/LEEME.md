# Fuentes de la home de foreventos.com

`app/page.html` se genera con estos archivos. Para cambiar la home: edita aquí y ejecuta, desde la raíz del repo:

    node fuentes-home/nh-build.cjs .

- `nh-body.html`: menú, contacto y pie (y secciones antiguas que el script sustituye).
- `nx-hero.html`, `nx-elige.html`, `nx-flow.html`, `nx-proj.html`: secciones actuales.
- `nh-style*.css`: estilos (se cargan en orden; el 7 es el último).
- `nx-script.js`, `nx-hero.js`: efectos (scroll, animación del hero).
- `app/plataforma/page.html` es la home anterior y sirve de base para el `<head>`, el banner de cookies y los scripts.
- Capturas de proyectos reales en `public/proyectos/`.
