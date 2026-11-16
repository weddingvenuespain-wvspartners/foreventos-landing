// Genera las páginas estáticas de foreventos.com a partir de sitio/.
// Uso (desde la raíz del repo): node sitio/build.cjs
//
// Cada página = head + intro + menú + contenido + pie + scripts, todo en un único
// HTML (estilos y scripts en línea, como exige la CSP de next.config.ts).
// El HTML se escribe en app/<ruta>/page.html y lo sirve su route.ts.
const fs = require('fs')
const path = require('path')

const S = __dirname
const ROOT = path.join(S, '..')
const rd = (...p) => fs.readFileSync(path.join(S, ...p), 'utf8')
const must = (cond, msg) => { if (!cond) { console.error('FALLO:', msg); process.exit(1) } }

const PAGES = [
  {
    file: 'inicio.html', dir: '', path: '/',
    title: 'FOREVENTOS · Tecnología y marketing para vender más eventos',
    desc: 'Webs, gestión comercial, Google, redes sociales y desarrollo a medida para espacios de bodas, wedding planners y caterings.',
    css: ['inicio.css'], js: ['hero.js', 'testimonios.js'],
    en: {
      dir: 'en', path: '/en',
      title: 'FOREVENTOS · Technology and marketing to sell more events',
      desc: 'Websites, sales management, Google, social media and custom development for wedding venues, wedding planners and caterers.',
    },
  },
  {
    file: 'servicios.html', dir: 'servicios', path: '/servicios',
    title: 'Servicios · FOREVENTOS',
    desc: 'Webs que traen solicitudes, gestión comercial para cerrar ventas, Google y redes sociales y sistemas a medida para el sector de bodas y eventos.',
    css: ['paginas.css'], js: [],
    en: {
      dir: 'en/services', path: '/en/services',
      title: 'Services · FOREVENTOS',
      desc: 'Websites that bring in enquiries, sales management to close bookings, Google and social media, and custom systems for the wedding and events industry.',
    },
  },
  {
    file: 'plataforma.html', dir: 'plataforma', path: '/plataforma',
    title: 'Gestión comercial para cerrar más ventas · FOREVENTOS',
    desc: 'Solicitudes, visitas, propuestas, presupuestos, contratos y cobros en un solo sitio, conectado a tus canales de venta.',
    css: ['paginas.css'], js: [],
    en: {
      dir: 'en/platform', path: '/en/platform',
      title: 'Sales management to close more bookings · FOREVENTOS',
      desc: 'Enquiries, viewings, proposals, quotes, contracts and payments in one place, connected to your sales channels.',
    },
  },
  {
    file: 'proyectos.html', dir: 'proyectos', path: '/proyectos',
    title: 'Proyectos · FOREVENTOS',
    desc: 'Webs, portales y plataformas que hemos construido para el sector de bodas y eventos.',
    css: ['paginas.css'], js: [],
    en: {
      dir: 'en/projects', path: '/en/projects',
      title: 'Projects · FOREVENTOS',
      desc: 'Websites, portals and platforms we have built for the wedding and events industry.',
    },
  },
  {
    file: 'contacto.html', dir: 'contacto', path: '/contacto',
    title: 'Contacto · FOREVENTOS',
    desc: 'Cuéntanos tu negocio y te decimos por dónde empezar. Te respondemos en menos de 24 horas laborables.',
    css: ['paginas.css'], js: [],
    en: {
      dir: 'en/contact', path: '/en/contact',
      title: 'Contact · FOREVENTOS',
      desc: 'Tell us about your business and we will tell you where to start. We reply within 24 working hours.',
    },
  },
]

// Idiomas: el español lee de sitio/paginas y sitio/piezas; el inglés, de sitio/en/paginas y
// sitio/en/piezas (head.html y los estilos y scripts son comunes). base.js elige sus textos por <html lang>.
const LANGS = {
  es: { src: '', lang: 'es', locale: 'es_ES', saltar: 'Saltar al contenido' },
  en: { src: 'en', lang: 'en', locale: 'en_GB', saltar: 'Skip to content' },
}
const abs = (p) => 'https://foreventos.com' + (p === '/' ? '/' : p)

const ROUTE = (dir) => `import { readFileSync } from 'fs'
import { join } from 'path'
import { NextResponse } from 'next/server'

// Generado por sitio/build.cjs: sirve el HTML estático de la página.
export const dynamic = 'force-static'

export async function GET() {
  const html = readFileSync(join(process.cwd(), 'app/${dir ? dir + '/' : ''}page.html'), 'utf-8')
  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
`

const esc = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
const baseCss = rd('css', 'base.css')
const baseJs = rd('js', 'base.js')
const icons = require('./iconos.cjs')
// Logo (dovelas + FOREVENTOS) en línea: hereda el color del texto, la clave sigue en verde
const logo = fs.readFileSync(path.join(ROOT, 'branding/exports/foreventos-lockup.svg'), 'utf8')
  .replace(/ width="[^"]*" height="[^"]*"/, '')
  .replace('<svg ', '<svg class="logo" role="img" aria-label="FOREVENTOS" ')
  .split('fill="#1A2419"').join('fill="currentColor"')
// {{logo}} y {{i:nombre}} (icono SVG en línea). Los botones .btn llevan el texto duplicado
// (data-t) para que ruede al pasar el ratón, y dos flechas que se relevan.
const fill = (s) => s
  .replace(/(class="btn[^"]*"[^>]*>)<span>([^<]+)<\/span>/g, (_, a, t) => a + '<span><b data-t="' + t + '">' + t + '</b></span>')
  .split('<i>{{i:flecha}}</i>').join('<i>{{i:flecha}}{{i:flecha}}</i>')
  .split('{{logo}}').join(logo)
  .replace(/\{\{i:([a-z0-9-]+)\}\}/g, (_, n) => { must(icons[n], 'icono ' + n); return icons[n] })

const solo = process.argv[2] // opcional: construir solo una página (p. ej. "inicio")
const BUILD = []
for (const pg of PAGES) {
  const alt = { es: pg.path, en: pg.en.path }
  BUILD.push({ ...pg, L: LANGS.es, alt, otro: pg.en.path })
  BUILD.push({ ...pg, ...pg.en, L: LANGS.en, alt, otro: pg.path })
}
for (const p of BUILD) {
  if (solo && !p.file.startsWith(solo)) continue
  const L = p.L
  const src = (...f) => rd(L.src, ...f)
  must(fs.existsSync(path.join(S, L.src, 'paginas', p.file)), 'falta la traducción ' + L.src + '/paginas/' + p.file)
  let body = src('paginas', p.file)
  // Los testimonios no se publican mientras tengan huecos sin contenido real
  // (para verlos en local: MOSTRAR_PENDIENTES=1 node sitio/build.cjs)
  if (!process.env.MOSTRAR_PENDIENTES && body.includes('data-pendiente')) {
    body = body.replace(/<!-- ============ TESTIMONIOS[\s\S]*?<\/section>\s*/, '')
  }
  let nav = src('piezas', 'menu.html')
  // Marca la página actual en el menú
  nav = nav.split(`href="${p.path}"`).join(`href="${p.path}" aria-current="page"`)
  // Enlace al otro idioma (misma página) y hreflang en el head
  const otro = (s) => s.split('{{otro}}').join(p.otro)
  const alternates = [
    `<link rel="alternate" hreflang="es" href="${abs(p.alt.es)}" />`,
    `<link rel="alternate" hreflang="en" href="${abs(p.alt.en)}" />`,
    `<link rel="alternate" hreflang="x-default" href="${abs(p.alt.es)}" />`,
  ].join('\n')
  const head = rd('piezas', 'head.html')
    .replace('{{lang}}', L.lang)
    .replace('{{locale}}', L.locale)
    .replace('{{locale_alt}}', L.lang === 'es' ? LANGS.en.locale : LANGS.es.locale)
    .replace('{{saltar}}', L.saltar)
    .replace('{{alternates}}', alternates)
    .replace(/\{\{title\}\}/g, esc(p.title))
    .replace(/\{\{desc\}\}/g, esc(p.desc))
    .replace(/\{\{url\}\}/g, abs(p.path))
    .replace('{{css}}', baseCss + p.css.map((f) => rd('css', f)).join('\n'))
  const js = baseJs + p.js.map((f) => rd('js', f)).join('\n')
  const html = head
    + fill(otro(nav))
    + '<main id="contenido">\n' + fill(body) + '\n</main>\n'
    + fill(otro(src('piezas', 'pie.html')))
    + '<script>\n' + js + '\n</script>\n</body>\n</html>\n'
  must(!html.includes('{{'), 'marcador sin sustituir en ' + p.path)
  must(!/—/.test(body), 'guion largo en ' + p.path)
  // En inglés, los enlaces internos tienen que quedarse en /en (salvo el enlace al español, {{otro}})
  if (L.lang === 'en') {
    const malos = ((nav + body + src('piezas', 'pie.html')).match(/href="\/(?!en\b|#)[a-z][^"]*"/g) || [])
    must(!malos.length, 'enlaces en español dentro de ' + p.path + ': ' + malos.join(' '))
  }
  const outDir = path.join(ROOT, 'app', p.dir)
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, 'page.html'), html)
  if (p.dir) fs.writeFileSync(path.join(outDir, 'route.ts'), ROUTE(p.dir))
  const pend = (body.match(/data-pendiente/g) || []).length
  const oculto = !pend && src('paginas', p.file).includes('data-pendiente')
  console.log(`${p.path.padEnd(12)} ${(html.length / 1024).toFixed(0)} KB${pend ? `  ·  AVISO: ${pend} hueco(s) pendientes de contenido real` : ''}${oculto ? '  ·  testimonios ocultos (faltan los reales)' : ''}`)
}
