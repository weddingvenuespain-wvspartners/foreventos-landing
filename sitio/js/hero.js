  /* Hero: entrada al abrirse la web */
  (function(){
    var h = document.querySelector('.hero'); if (!h) return;
    function go(){ requestAnimationFrame(function(){ h.classList.add('on'); }); }
    if (window.FE_LISTO) go(); else document.addEventListener('fe:listo', go, { once:true });
  })();

  /* Así trabajamos. En escritorio (con altura suficiente) la sección se queda fija y los pasos
     pasan de lado al bajar; la línea se llena y cada paso se marca al alcanzarlo.
     En móvil y tablet cada paso se anima cuando entra en pantalla */
  (function(){
    var ol = document.querySelector('[data-pasos]'); if (!ol) return;
    var sec = ol.closest('.como'), pin = sec.querySelector('.como-pin');
    var pasos = [].slice.call(ol.children), tick = false, horiz = false, dist = 0;
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    function medir(){
      horiz = !reduce && innerWidth > 1020 && innerHeight >= 680;
      sec.classList.toggle('como-h', horiz);
      sec.style.height = ''; ol.style.transform = '';
      if (horiz){
        dist = Math.max(0, ol.scrollWidth - pin.clientWidth + parseFloat(getComputedStyle(pin).paddingLeft) * 2);
        // 1,5 px de scroll por cada px de lado: el paso va más pausado
        sec.style.height = (pin.offsetHeight + dist * 1.5) + 'px';
      }
      on();
    }
    function on(){
      tick = false;
      var vh = innerHeight, p;
      if (horiz){
        var r = sec.getBoundingClientRect();
        p = Math.max(0, Math.min(1, -r.top / Math.max(1, r.height - pin.offsetHeight)));
        ol.style.transform = 'translate3d(' + (-p * dist).toFixed(1) + 'px,0,0)';
        ol.style.setProperty('--p', p.toFixed(3));
        pasos.forEach(function(li, i){ li.classList.toggle('hecho', p >= (i === 0 ? 0 : i / (pasos.length - 1) - .12)); });
      } else if (innerWidth > 1020){
        var q = ol.getBoundingClientRect();
        p = Math.max(0, Math.min(1, (vh * .78 - q.top) / (q.height * .7)));
        ol.style.setProperty('--p', p.toFixed(3));
        pasos.forEach(function(li, i){ li.classList.toggle('hecho', p >= (i === 0 ? .02 : i / (pasos.length - 1) - .02)); });
      } else {
        pasos.forEach(function(li){ if (li.getBoundingClientRect().top < vh * .78) li.classList.add('hecho'); });
      }
    }
    addEventListener('scroll', function(){ if (!tick){ tick = true; requestAnimationFrame(on); } }, { passive:true });
    addEventListener('resize', medir);
    addEventListener('load', medir);
    medir();
  })();

  /* Escena del hero: tu calendario de junio se llena. Por cada reserva: en el portátil se enciende el
     canal por el que llega y un punto de luz viaja hasta el día; entran los avisos (solicitud, visita,
     firma, señal), el día espera latiendo y al cobrar la señal se reserva, salta confeti y sube lo
     reservado (y la barra de junio). Cuando se han llenado todos, vuelve a empezar */
  (function(){
    var hm = document.querySelector('[data-hm]'); if (!hm) return;
    var $ = function(s){ return hm.querySelector(s); };
    var avisos = $('.hm-avisos'), grid = $('.hm-dias'), libresEl = $('[data-hm-libres]'), barra = $('[data-hm-barra]'), dot = $('.hm-dot');
    var totales = [].slice.call(hm.querySelectorAll('[data-hm-total]')), canales = [].slice.call(hm.querySelectorAll('[data-canal]'));
    var ico = $('[data-hm-ico]').innerHTML;
    // Junio de 2027 empieza en martes; ya reservados de antes: 5, 11 y 27
    var dias = [], YA = [5, 11, 27], BASE = 41200, BARRA = 40;
    grid.appendChild(document.createElement('i'));
    for (var d = 1; d <= 30; d++){ var c = document.createElement('i'); c.textContent = d; if (YA.indexOf(d) >= 0) c.className = 'ya'; dias[d] = c; grid.appendChild(c); }
    var PAREJAS = [
      { n:'Laura & Marc', ini:'L&M', d:12, amt:16800, canal:'tu web' },
      { n:'Grupo Nexa', ini:'GN', d:4, amt:6900, canal:'Google' },
      { n:'Sophie & Tom', ini:'S&T', d:19, amt:13400, canal:'weddingvenuesspain.com' },
      { n:'Lucía & Pablo', ini:'L&P', d:26, amt:20400, canal:'Instagram' }
    ];
    var eur = function(v){ return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' €'; };
    var sleep = function(ms){ return new Promise(function(r){ setTimeout(r, ms); }); };
    var visible = false, total = BASE, libres = 30 - YA.length, hora = 9 * 60 + 41;
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var ancho = function(){ return innerWidth > 1020; };
    async function listo(){ while (!visible || document.hidden) await sleep(250); }
    async function paso(ms){ await sleep(ms); await listo(); }
    // Posición dentro de la escena sumando offsets (no rects): así no la deforma el giro en 3D
    function pos(el){
      var x = 0, y = 0, e = el;
      while (e && e !== hm){ x += e.offsetLeft; y += e.offsetTop; e = e.offsetParent; }
      return { x:x, y:y, w:el.offsetWidth, h:el.offsetHeight };
    }
    function aviso(titulo, sub, ok){
      [].forEach.call(avisos.children, function(a){ a.dataset.n = +a.dataset.n + 1; if (+a.dataset.n > 3) a.remove(); });
      var a = document.createElement('div'); a.className = 'hm-av' + (ok ? ' ok' : ''); a.dataset.n = 0;
      hora += 1 + Math.floor(Math.random() * 4);
      a.innerHTML = '<span class="ico">' + ico + '</span><span><b></b><small></small></span><em></em>';
      a.querySelector('b').textContent = titulo; a.querySelector('small').textContent = sub;
      a.querySelector('em').textContent = Math.floor(hora / 60) + ':' + ('0' + hora % 60).slice(-2);
      avisos.appendChild(a);
    }
    // Lo reservado sube contando, no de golpe
    function cuenta(de, a){
      var t0 = performance.now(), D = 1000;
      totales.forEach(function(el){ el.classList.remove('sube'); void el.offsetWidth; el.classList.add('sube'); });
      (function f(now){
        var p = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - p, 3), v = eur(Math.round((de + (a - de) * e) / 10) * 10);
        totales.forEach(function(el){ el.textContent = v; });
        if (p < 1) requestAnimationFrame(f);
      })(t0);
    }
    function confeti(cel){
      var cols = ['#3FA868', '#7FC79A', '#D9C7A0', '#16261A', '#F2B84B'], r = pos(cel), x = r.x + r.w / 2, y = r.y + r.h / 2, n = ancho() ? 22 : 16;
      for (var i = 0; i < n; i++){
        var c = document.createElement('i'); c.className = 'hm-conf'; c.style.background = cols[i % cols.length];
        hm.appendChild(c);
        var ang = Math.random() * Math.PI * 2, v = 30 + Math.random() * (ancho() ? 80 : 50), dx = Math.cos(ang) * v, dy = Math.sin(ang) * v - 30;
        c.animate([
          { transform:'translate(' + x + 'px,' + y + 'px) rotate(0)', opacity:1 },
          { transform:'translate(' + (x + dx) + 'px,' + (y + dy) + 'px) rotate(' + (Math.random() * 360) + 'deg)', opacity:1, offset:.5 },
          { transform:'translate(' + (x + dx * 1.2) + 'px,' + (y + dy + 70) + 'px) rotate(' + (Math.random() * 720) + 'deg)', opacity:0 }
        ], { duration:1100 + Math.random() * 300, easing:'cubic-bezier(.2,.7,.4,1)' }).onfinish = (function(el){ return function(){ el.remove(); }; })(c);
      }
    }
    // Portátil: el canal se enciende y un punto de luz viaja en curva hasta el día
    function viaje(canal, cel){
      return new Promise(function(res){
        canales.forEach(function(c){ c.classList.toggle('on', c.dataset.canal === canal); });
        if (!ancho()){ res(); return; }
        var src = canales.filter(function(c){ return c.dataset.canal === canal; })[0];
        var a = pos(src), b = pos(cel), x0 = a.x + a.w, y0 = a.y + a.h / 2, x1 = b.x + b.w / 2, y1 = b.y + b.h / 2;
        var cx = (x0 + x1) / 2, cy = Math.min(y0, y1) - 120, t0 = performance.now(), D = 900;
        dot.style.opacity = 1;
        (function f(now){
          var t = Math.min(1, (now - t0) / D), e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2, u = 1 - e;
          dot.style.transform = 'translate(' + (u * u * x0 + 2 * u * e * cx + e * e * x1) + 'px,' + (u * u * y0 + 2 * u * e * cy + e * e * y1) + 'px)';
          if (t < 1) requestAnimationFrame(f); else { dot.style.opacity = 0; res(); }
        })(t0);
      });
    }
    async function pareja(P){
      var cel = dias[P.d];
      await viaje(P.canal, cel);
      aviso('Nueva solicitud', P.n + ' · desde ' + P.canal);
      cel.classList.add('espera');
      await paso(1200);
      aviso('Visita agendada', P.n + ' · sábado, 11:30');
      await paso(1100);
      aviso('Contrato firmado', P.n + ' · firma online');
      await paso(1100);
      aviso('Señal cobrada', '+' + eur(Math.round(P.amt * .3 / 10) * 10) + ' · ' + P.d + ' de junio reservado', true);
      cel.classList.remove('espera'); cel.classList.add('res'); cel.textContent = P.ini;
      canales.forEach(function(c){ c.classList.remove('on'); });
      confeti(cel);
      cuenta(total, total + P.amt); total += P.amt;
      libresEl.textContent = (--libres) + ' días libres';
      barra.style.setProperty('--h', Math.min(100, BARRA + (total - BASE) / 1000 * .95).toFixed(0) + '%');
      await paso(1500);
    }
    function reinicia(){
      PAREJAS.forEach(function(P){ var c = dias[P.d]; c.classList.remove('res', 'espera'); c.textContent = P.d; });
      total = BASE; totales.forEach(function(el){ el.textContent = eur(BASE); });
      libres = 30 - YA.length; libresEl.textContent = libres + ' días libres';
      barra.style.setProperty('--h', BARRA + '%');
    }
    if (reduce){
      // Sin movimiento: el calendario ya lleno
      PAREJAS.forEach(function(P){ dias[P.d].classList.add('res'); dias[P.d].textContent = P.ini; total += P.amt; libres--; });
      totales.forEach(function(el){ el.textContent = eur(total); }); libresEl.textContent = libres + ' días libres';
      barra.style.setProperty('--h', '92%');
      aviso('Señal cobrada', '+6.120 € · 26 de junio reservado', true);
      return;
    }
    if ('IntersectionObserver' in window) new IntersectionObserver(function(es){ visible = es[0].isIntersecting; }).observe(hm);
    else visible = true;
    async function bucle(){
      await sleep(600);
      for (;;){
        for (var i = 0; i < PAREJAS.length; i++){ await listo(); await pareja(PAREJAS[i]); }
        await paso(2200); reinicia(); await paso(600);
      }
    }
    if (window.FE_LISTO) bucle(); else document.addEventListener('fe:listo', bucle, { once:true });
  })();

  /* Hero vivo: la luz sigue al ratón con retardo; sin ratón (móvil) pasea sola en curvas.
     En el portátil la escena gira con el ratón. Al bajar: el fondo se queda atrás (paralaje),
     la escena se endereza y se acerca, el texto sube y se apaga y la tarjeta verde se encoge */
  (function(){
    var card = document.querySelector('.hero-card'), luz = card && card.querySelector('.hero-bg .luz'), bg = card && card.querySelector('.hero-bg');
    if (!luz || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var hm = card.querySelector('[data-hm]'), txt = card.querySelector('.hero-txt'), mx = 0, my = 0;
    var x = 0, y = 0, tx = null, ty = null, quieto = 0, visible = true, t0 = performance.now();
    card.addEventListener('pointermove', function(e){ if (e.pointerType !== 'mouse') return; var r = card.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top; quieto = performance.now(); });
    function escena(h){
      var p = Math.max(0, Math.min(1, scrollY / (h * .7))), e = p * p * (3 - 2 * p);
      // Ratón: -1…1 desde el centro de la tarjeta (suavizado)
      var gx = tx === null ? 0 : tx / card.clientWidth * 2 - 1, gy = ty === null ? 0 : ty / h * 2 - 1;
      mx += (gx - mx) * .06; my += (gy - my) * .06;
      if (innerWidth > 1020){
        hm.style.setProperty('--ry', ((-9 + mx * 7) * (1 - e)).toFixed(2) + 'deg');
        hm.style.setProperty('--rx', ((4 - my * 5) * (1 - e)).toFixed(2) + 'deg');
        hm.style.setProperty('--z', (1 + e * .08).toFixed(3));
      }
      txt.style.translate = '0 ' + (-e * 60).toFixed(1) + 'px';
      txt.style.opacity = (1 - e * .7).toFixed(3);
      card.style.scale = (1 - e * .06).toFixed(4);
    }
    card.addEventListener('pointerleave', function(){ tx = null; });
    if ('IntersectionObserver' in window) new IntersectionObserver(function(es){ visible = es[0].isIntersecting; }).observe(card);
    (function f(now){
      requestAnimationFrame(f);
      if (!visible || document.hidden) return;
      var w = card.clientWidth, h = card.clientHeight, t = (now - t0) / 1000;
      var gx = tx, gy = ty;
      if (gx === null || now - quieto > 4000){ gx = w * (.55 + .32 * Math.sin(t * .37)); gy = h * (.45 + .3 * Math.sin(t * .53 + 1)); }
      x += (gx - x) * .06; y += (gy - y) * .06;
      luz.style.transform = 'translate(' + x.toFixed(1) + 'px,' + y.toFixed(1) + 'px)';
      bg.style.transform = 'translateY(' + (Math.min(scrollY, h) * .3).toFixed(1) + 'px)';
      if (hm) escena(h);
    })(t0);
  })();

  /* Proyectos: la vitrina pasa sola de un proyecto a otro (cada 6 s, solo mientras se ve) y al pulsar
     una pestaña salta a ese; con el ratón encima se para */
  (function(){
    var vt = document.querySelector('[data-vitrina]'); if (!vt) return;
    var tabs = [].slice.call(vt.querySelectorAll('.vt-tab')), slides = [].slice.call(vt.querySelectorAll('.vt-slide'));
    var cur = 0, T = 6000, quedan = T, t0 = 0, timer = null, visible = false, pausa = false;
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    vt.style.setProperty('--vt-t', T / 1000 + 's');
    function ir(i){
      cur = (i + tabs.length) % tabs.length;
      tabs.forEach(function(t, k){
        var on = k === cur;
        // Reinicia la barra de progreso de la pestaña
        if (on){ t.classList.remove('on'); void t.offsetWidth; }
        t.classList.toggle('on', on); t.setAttribute('aria-selected', on ? 'true' : 'false');
        slides[k].classList.toggle('on', on);
      });
      var tab = tabs[cur], lista = tab.parentNode;
      if (lista.scrollWidth > lista.clientWidth) lista.scrollTo({ left:tab.offsetLeft - 16, behavior:'smooth' });
      quedan = T; arranca();
    }
    function para(){ if (timer){ clearTimeout(timer); timer = null; quedan -= performance.now() - t0; } }
    function arranca(){
      clearTimeout(timer); timer = null;
      if (reduce || !visible || pausa) return;
      t0 = performance.now(); timer = setTimeout(function(){ ir(cur + 1); }, Math.max(0, quedan));
    }
    tabs.forEach(function(t, k){ t.addEventListener('click', function(){ ir(k); }); });
    vt.addEventListener('pointerenter', function(e){ if (e.pointerType !== 'mouse') return; pausa = true; vt.classList.add('pausa'); para(); });
    vt.addEventListener('pointerleave', function(e){ if (e.pointerType !== 'mouse') return; pausa = false; vt.classList.remove('pausa'); arranca(); });
    if ('IntersectionObserver' in window) new IntersectionObserver(function(es){
      visible = es[0].isIntersecting; vt.classList.toggle('pausa', !visible || pausa);
      if (visible) arranca(); else para();
    }, { threshold:.3 }).observe(vt);
    else { visible = true; arranca(); }
  })();

  /* Llamada final: el arco se construye al entrar y luego sube un poco al seguir bajando */
  (function(){
    var c = document.querySelector('[data-cta]'); if (!c) return;
    if (!('IntersectionObserver' in window)){ c.classList.add('in'); return; }
    var io = new IntersectionObserver(function(es){ if (es[0].isIntersecting){ c.classList.add('in'); io.disconnect(); } }, { threshold:.35 });
    io.observe(c);
    var tick = false;
    function on(){ tick = false; var r = c.getBoundingClientRect(); c.style.setProperty('--cp', Math.max(0, Math.min(1, (innerHeight - r.top) / (innerHeight + r.height))).toFixed(3)); }
    addEventListener('scroll', function(){ if (!tick){ tick = true; requestAnimationFrame(on); } }, { passive:true });
    on();
  })();

  /* Qué hacemos: una vista previa sigue al ratón por la lista de servicios */
  (function(){
    var lista = document.querySelector('[data-servicios]'); if (!lista || !matchMedia('(hover: hover)').matches) return;
    var prev = lista.querySelector('.sv-prev'), imgs = [].slice.call(prev.children), rows = [].slice.call(lista.querySelectorAll('.sv'));
    var x = 0, y = 0, tx = 0, ty = 0, raf = null;
    function loop(){ x += (tx - x) * .14; y += (ty - y) * .14; prev.style.transform = 'translate(' + (x + 22) + 'px,' + (y - 70) + 'px) rotate(' + ((tx - x) * .03).toFixed(2) + 'deg)'; raf = requestAnimationFrame(loop); }
    lista.addEventListener('pointermove', function(e){ var r = lista.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top; if (!raf){ x = tx; y = ty; loop(); } });
    rows.forEach(function(row, i){
      row.addEventListener('pointerenter', function(){ lista.classList.add('mira'); imgs.forEach(function(im, k){ im.classList.toggle('on', k === i); }); });
    });
    lista.addEventListener('pointerleave', function(){ lista.classList.remove('mira'); cancelAnimationFrame(raf); raf = null; });
  })();
