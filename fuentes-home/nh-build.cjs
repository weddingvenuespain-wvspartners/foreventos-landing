// Construye la nueva home de foreventos.com y mueve la actual a /plataforma.
// Uso: node nh-build.cjs <carpeta del repo de la landing>
const fs = require('fs')
const path = require('path')
const repo = process.argv[2]
const S = __dirname
const ORIG = path.join(repo, 'app/page.html')
const PLAT_DIR = path.join(repo, 'app/plataforma')

// La página original se conserva como /plataforma (solo la primera vez)
const platPage = path.join(PLAT_DIR, 'page.html')
if (!fs.existsSync(platPage)) {
  fs.mkdirSync(PLAT_DIR, { recursive: true })
  let p = fs.readFileSync(ORIG, 'utf8')
  p = p.replace(/<title>[^<]*<\/title>/, '<title>La plataforma FOREVENTOS — Solicitudes, propuestas, presupuestos y cobros</title>')
    .replace('<link rel="canonical" href="https://foreventos.com/" />', '<link rel="canonical" href="https://foreventos.com/plataforma" />')
  fs.writeFileSync(platPage, p)
}
const src = fs.readFileSync(platPage, 'utf8') // fuente: la original (estilos, banner, scripts)

const must = (cond, msg) => { if (!cond) { console.error('FALLO:', msg); process.exit(1) } }

// 1) <head> y estilos originales + estilos nuevos
const headEnd = src.indexOf('</style>')
must(headEnd > 0, 'fin de estilos')
let head = src.slice(0, headEnd)
head = head
  .replace(/<title>[^<]*<\/title>/, '<title>FOREVENTOS — Tecnología y marketing para vender más eventos</title>')
  .replace(/(<meta name="description" content=")[^"]*(" \/>)/, '$1Webs, plataforma de gestión, desarrollo a medida, SEO y Google Ads para espacios de bodas, wedding planners y caterings. El equipo detrás de weddingvenuesspain.com.$2')
  .replace(/(<meta property="og:title" content=")[^"]*(" \/>)/, '$1FOREVENTOS — Tecnología y marketing para vender más eventos$2')
  .replace('<link rel="canonical" href="https://foreventos.com/plataforma" />', '<link rel="canonical" href="https://foreventos.com/" />')
head += fs.readFileSync(path.join(S, 'nh-style.css'), 'utf8') + fs.readFileSync(path.join(S, 'nh-style2.css'), 'utf8') + fs.readFileSync(path.join(S, 'nh-style3.css'), 'utf8') + fs.readFileSync(path.join(S, 'nh-style4.css'), 'utf8') + fs.readFileSync(path.join(S, 'nh-style5.css'), 'utf8') + fs.readFileSync(path.join(S, 'nh-style6.css'), 'utf8') + fs.readFileSync(path.join(S, 'nh-style7.css'), 'utf8') + '\n</style>\n</head>\n<body>\n'
// El <head> original tiene más cosas tras </style> (cierre de head): se respetan
const afterStyle = src.slice(headEnd + '</style>'.length, src.indexOf('<body>'))
head = head.replace('\n</style>\n</head>\n<body>\n', '\n</style>' + afterStyle + '<body>\n')

// 2) Banner de cookies original
const ckStart = src.indexOf('<!-- ============ BANNER DE CONSENTIMIENTO')
const scriptStart = src.indexOf('<script>', ckStart)
must(ckStart > 0 && scriptStart > ckStart, 'banner')
const banner = src.slice(ckStart, scriptStart)

// 3) Scripts que usa la home: menú móvil, píldora del menú, formulario, datos legales y cookies
const sc = src.slice(scriptStart)
const a = sc.indexOf('/* Menú móvil a pantalla completa */')
const b = sc.indexOf('/* i18n */')
must(a > 0 && b > a, 'bloques de script')
let blocks = sc.slice(a, b)
// El formulario de la home añade teléfono, tipo de negocio e interés al mensaje
const oldBody = "body:JSON.stringify({ name:v('name'), company:v('venue'), email:v('email'), message:v('message'), website:v('website'), lang:lang() }) })"
must(blocks.includes(oldBody), 'cuerpo del formulario de contacto')
blocks = blocks.replace(oldBody, "body:JSON.stringify({ name:v('name'), company:v('venue'), email:v('email'), website:v('website'), lang:lang(),\n          message:['Tipo: '+v('business_type'),'Le interesa: '+v('interest'),v('phone')?'Teléfono: '+v('phone'):'',v('message')].filter(Boolean).join('\\n') }) })")

const script = `<script>
  // ===== Navbar: estado al hacer scroll + barra de progreso =====
  (function(){
    var navbar = document.getElementById('navbar'), bar = document.getElementById('scrollProg');
    function onScroll(){
      var y = window.scrollY;
      if (navbar) navbar.classList.toggle('scrolled', y > 30);
      if (bar){ var h = document.documentElement.scrollHeight - innerHeight; bar.style.transform = 'scaleX(' + (h > 0 ? y / h : 0) + ')'; }
    }
    window.addEventListener('scroll', onScroll, { passive:true }); onScroll();
  })();
  // ===== Entrada suave de las secciones (.reveal → .in) =====
  (function(){
    document.documentElement.classList.add('js');
    var els = document.querySelectorAll('.reveal');
    if (!('IntersectionObserver' in window)) { els.forEach(function(e){ e.classList.add('in') }); return }
    var io = new IntersectionObserver(function(entries){ entries.forEach(function(en){ if (en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target) } }) }, { rootMargin:'0px 0px -8% 0px', threshold:.08 });
    els.forEach(function(e){ io.observe(e) });
  })();
  // ===== Servicios: pestañas con avance automático (se para al tocar) =====
  (function(){
    var box = document.querySelector('[data-tabs]'); if (!box) return;
    var tabs = [].slice.call(box.querySelectorAll('[role=tab]')), panes = tabs.map(function(t){ return document.getElementById(t.getAttribute('aria-controls')) });
    var cur = 0, timer = null, DUR = 8000, auto = true;
    box.style.setProperty('--nh-dur', DUR + 'ms');
    function show(i, focus){
      cur = (i + tabs.length) % tabs.length;
      tabs.forEach(function(t, k){ var on = k === cur; t.setAttribute('aria-selected', on); t.tabIndex = on ? 0 : -1; panes[k].hidden = !on; panes[k].classList.toggle('is-on', on) });
      if (focus) tabs[cur].focus();
      if (auto){ clearTimeout(timer); timer = setTimeout(function(){ show(cur + 1) }, DUR) }
    }
    function stop(){ auto = false; clearTimeout(timer); box.classList.add('is-paused') }
    tabs.forEach(function(t, k){
      t.addEventListener('click', function(){ stop(); show(k) });
      t.addEventListener('keydown', function(e){
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight'){ e.preventDefault(); stop(); show(cur + 1, true) }
        if (e.key === 'ArrowUp' || e.key === 'ArrowLeft'){ e.preventDefault(); stop(); show(cur - 1, true) }
      });
    });
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) stop();
    if ('IntersectionObserver' in window){ var io = new IntersectionObserver(function(es){ if (es[0].isIntersecting){ show(0); io.disconnect() } }, { threshold:.3 }); io.observe(box) } else show(0);
  })();
  ${blocks}
</script>
</body>
</html>
`

// v5: las secciones entre el hero y Planes se sustituyen por nx-mid.html
let body = fs.readFileSync(path.join(S, 'nh-body.html'), 'utf8')
const m1 = body.indexOf('<!-- ============ QUÉ HACEMOS'), m2 = body.indexOf('<!-- ============ PLANES')
must(m1 > 0 && m2 > m1, 'marcas de secciones v5')
const r2 = (n) => Math.round(n * 100) / 100
const sun = '<svg class="nx-geo" viewBox="0 0 100 100" aria-hidden="true"><g stroke="currentColor" stroke-width="1.2" stroke-linecap="round">' +
  Array.from({ length: 28 }, (_, i) => { const a = i * Math.PI * 2 / 28; return `<line x1="${r2(50 + 14 * Math.cos(a))}" y1="${r2(50 + 14 * Math.sin(a))}" x2="${r2(50 + 48 * Math.cos(a))}" y2="${r2(50 + 48 * Math.sin(a))}"/>` }).join('') + '</g></svg>'
const hexPts = (r, dx, dy) => Array.from({ length: 6 }, (_, i) => { const a = Math.PI / 6 + i * Math.PI / 3; return `${r2(50 + dx + r * Math.cos(a))},${r2(50 + dy + r * Math.sin(a))}` }).join(' ')
const hex = '<svg class="nx-geo" viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.2">' +
  [48, 39, 30, 21, 12].map((r, i) => `<polygon points="${hexPts(r, i * 2.2, i * 2.6)}"/>`).join('') + '</g></svg>'
const lat = '<svg class="nx-geo" viewBox="0 0 100 100" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.2">' +
  [[50, 4], [27, 27], [73, 27], [4, 50], [50, 50], [96, 50], [27, 73], [73, 73], [50, 96]].map(([x, y]) => `<polygon points="${x},${y - 23} ${x + 23},${y} ${x},${y + 23} ${x - 23},${y}"/>`).join('') + '</g></svg>'
const mid = fs.readFileSync(path.join(S, 'nx-mid.html'), 'utf8').replace('{{GEO_SUN}}', sun).replace('{{GEO_HEX}}', hex).replace('{{GEO_LAT}}', lat)
body = body.slice(0, m1) + mid + body.slice(m2)
// v6: servicios con fondo que cambia, proyectos en mosaico, planes en cápsulas y FAQ en claro
const cut = (s, a, b, ins) => { const i = s.indexOf(a), j = s.indexOf(b); must(i > 0 && j > i, 'corte ' + a); return s.slice(0, i) + ins + s.slice(j) }
const rd = (f) => fs.readFileSync(path.join(S, f), 'utf8')
body = cut(body, '<!-- ============ SERVICIOS', '<!-- ============ FRANJA', rd('nx-svc2.html'))
{ const i = body.indexOf('<!-- ============ TODO CONECTADO'); must(i > 0, 'todo conectado'); body = body.slice(0, i) + rd('nx-proj.html') + body.slice(i) }
body = cut(body, '<!-- ============ PLANES', '<!-- ============ FAQ', rd('nx-plans.html'))
must(body.includes('<section class="nh-sec dark" id="faq" data-bg="dark">'), 'faq')
body = body.replace('<section class="nh-sec dark" id="faq" data-bg="dark">', '<section class="nh-sec light nx-faq-l" id="faq">')
// v7: estructura de una idea por sección (hero, elige, cómo funciona, WVS, proyectos, cómo trabajamos, FAQ, contacto)
{
  const raw = fs.readFileSync(path.join(S, 'nh-body.html'), 'utf8')
  const navEnd = raw.indexOf('<!-- ============ HERO'), contactStart = raw.indexOf('<!-- ============ CONTACTO')
  must(navEnd > 0 && contactStart > navEnd, 'marcas v7')
  const sw = (s, a, b) => { must(s.includes(a), 'v7 falta: ' + a.slice(0, 60)); return s.split(a).join(b) }
  let top = raw.slice(0, navEnd)
  top = sw(top, '<a href="#servicios">Servicios</a>', '<a href="#como-funciona">Cómo funciona</a>')
  top = sw(top, '<a href="#planes">Planes</a>', '<a href="#proyectos">Proyectos</a>')
  top = sw(top, '<a href="#para-quien"><span class="n">01</span><span>Para quién</span>', '<a href="#que-hacemos"><span class="n">01</span><span>Qué hacemos</span>')
  top = sw(top, '<a href="#servicios"><span class="n">02</span><span>Servicios</span>', '<a href="#como-funciona"><span class="n">02</span><span>Cómo funciona</span>')
  top = sw(top, '<a href="#planes"><span class="n">04</span><span>Planes</span>', '<a href="#proyectos"><span class="n">04</span><span>Proyectos</span>')
  const mid = rd('nx-mid.html')
  const seg = (s, a, b) => { const i = s.indexOf(a), j = b ? s.indexOf(b, i + 1) : s.length; must(i >= 0 && j > i, 'seg ' + a); return s.slice(i, j) }
  let wvs = seg(mid, '<!-- ============ WEDDINGVENUESSPAIN: cifras', '<!-- ============ CÓMO TRABAJAMOS')
  wvs = sw(wvs, '<div class="nx-stats">', '<div class="nx-stats three">')
  wvs = wvs.replace(/\s*<div class="reveal d4"><b><span data-count="49">[\s\S]*?<\/div>/, '')
  must(!wvs.includes('data-count="49"'), 'quitar 49 €')
  const how = seg(mid, '<!-- ============ CÓMO TRABAJAMOS: línea', null)
  let faq = seg(raw, '<!-- ============ FAQ', '<!-- ============ POR QUÉ')
  faq = sw(faq, '<section class="nh-sec dark" id="faq" data-bg="dark">', '<section class="nh-sec light nx-faq-l" id="faq">')
  faq = faq.replace(/Te preparamos un borrador gratis y sin compromiso\. Si te encanta,[^<]*/, 'Te preparamos un borrador gratis y sin compromiso. Si te encanta, te damos un precio cerrado antes de empezar, con el alojamiento, el mantenimiento y el formulario conectado a tu panel incluidos.')
  must(!faq.includes('450'), 'precio en FAQ')
  let bottom = raw.slice(contactStart)
  bottom = bottom.split('href="#servicios"').join('href="#que-hacemos"')
  body = top + rd('nx-hero.html') + rd('nx-elige.html') + rd('nx-flow.html') + wvs + rd('nx-proj.html') + how + faq + bottom
}
const nx = fs.readFileSync(path.join(S, 'nx-script.js'), 'utf8') + fs.readFileSync(path.join(S, 'nx-hero.js'), 'utf8')
const html = head + body + '\n' + banner + script.replace('</script>\n</body>', nx + '</script>\n</body>')
fs.writeFileSync(ORIG, html)
console.log('home', html.length, 'bytes · plataforma', fs.statSync(platPage).size)
