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
  },
  {
    file: 'servicios.html', dir: 'servicios', path: '/servicios',
    title: 'Servicios · FOREVENTOS',
    desc: 'Webs que traen solicitudes, gestión comercial para cerrar ventas, Google y redes sociales y sistemas a medida para el sector de bodas y eventos.',
    css: ['paginas.css'], js: [],
  },
  {
    file: 'plataforma.html', dir: 'plataforma', path: '/plataforma',
    title: 'Gestión comercial para cerrar más ventas · FOREVENTOS',
    desc: 'Solicitudes, visitas, propuestas, presupuestos, contratos y cobros en un solo sitio, conectado a tus canales de venta.',
    css: ['paginas.css'], js: [],
  },
  {
    file: 'proyectos.html', dir: 'proyectos', path: '/proyectos',
    title: 'Proyectos · FOREVENTOS',
    desc: 'Webs, portales y plataformas que hemos construido para el sector de bodas y eventos.',
    css: ['paginas.css'], js: [],
  },
  {
    file: 'contacto.html', dir: 'contacto', path: '/contacto',
    title: 'Contacto · FOREVENTOS',
    desc: 'Cuéntanos tu negocio y te decimos por dónde empezar. Te respondemos en menos de 24 horas laborables.',
    css: ['paginas.css'], js: [],
  },
]

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
for (const p of PAGES) {
  if (solo && !p.file.startsWith(solo)) continue
  let body = rd('paginas', p.file)
  // Los testimonios no se publican mientras tengan huecos sin contenido real
  // (para verlos en local: MOSTRAR_PENDIENTES=1 node sitio/build.cjs)
  if (!process.env.MOSTRAR_PENDIENTES && body.includes('data-pendiente')) {
    body = body.replace(/<!-- ============ TESTIMONIOS[\s\S]*?<\/section>\s*/, '')
  }
  let nav = rd('piezas', 'menu.html')
  // Marca la página actual en el menú
  nav = nav.split(`href="${p.path}"`).join(`href="${p.path}" aria-current="page"`)
  const head = rd('piezas', 'head.html')
    .replace(/\{\{title\}\}/g, esc(p.title))
    .replace(/\{\{desc\}\}/g, esc(p.desc))
    .replace(/\{\{url\}\}/g, 'https://foreventos.com' + (p.path === '/' ? '/' : p.path))
    .replace('{{css}}', baseCss + p.css.map((f) => rd('css', f)).join('\n'))
  const js = baseJs + p.js.map((f) => rd('js', f)).join('\n')
  const html = head
    + (p.path === '/' ? rd('piezas', 'intro.html') : '')
    + fill(nav)
    + '<main id="contenido">\n' + fill(body) + '\n</main>\n'
    + fill(rd('piezas', 'pie.html'))
    + '<script>\n' + js + '\n</script>\n</body>\n</html>\n'
  must(!html.includes('{{'), 'marcador sin sustituir en ' + p.file)
  must(!/—/.test(body), 'guion largo en ' + p.file)
  const outDir = path.join(ROOT, 'app', p.dir)
  fs.mkdirSync(outDir, { recursive: true })
  fs.writeFileSync(path.join(outDir, 'page.html'), html)
  if (p.dir) fs.writeFileSync(path.join(outDir, 'route.ts'), ROUTE(p.dir))
  const pend = (body.match(/data-pendiente/g) || []).length
  const oculto = !pend && rd('paginas', p.file).includes('data-pendiente')
  console.log(`${p.path.padEnd(12)} ${(html.length / 1024).toFixed(0)} KB${pend ? `  ·  AVISO: ${pend} hueco(s) pendientes de contenido real` : ''}${oculto ? '  ·  testimonios ocultos (faltan los reales)' : ''}`)
}
