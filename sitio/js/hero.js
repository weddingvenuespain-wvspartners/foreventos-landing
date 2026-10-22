  /* Hero: entrada al abrirse la web */
  (function(){
    var h = document.querySelector('.hero'); if (!h) return;
    function go(){ requestAnimationFrame(function(){ h.classList.add('on'); }); }
    if (window.FE_LISTO) go(); else document.addEventListener('fe:listo', go, { once:true });
  })();

  /* Historia del hero. En el móvil, lo que hace tu cliente: te busca en Google, te escribe
     desde tu web, reserva la visita, firma la propuesta y paga la señal. En el panel, esa misma
     solicitud entra, avanza columna a columna (arrastrada por un cursor) y acaba reservada. */
  (function(){
    var pl = document.querySelector('[data-pl]'); if (!pl) return;
    var $ = function(s, r){ return (r || pl).querySelector(s); }, $$ = function(s, r){ return [].slice.call((r || pl).querySelectorAll(s)); };
    var stage = pl.parentNode, canvas = $('.pl-canvas'), scr = $('.ph-screen');
    var lists = $$('.pl-list'), counts = $$('.pl-col h5 em');
    var totalEl = $('[data-total]'), toasts = $('.pl-toasts'), cursor = $('.pl-cursor'), dot = $('.pl-dot'), tap = $('.ph-tap');
    var ficha = $('[data-ficha]'), pasos = $$('.pf-steps li'), pasosOl = $('.pf-steps');
    var SC = { g:$('.ph-sc.g'), w:$('.ph-sc.w'), v:$('.ph-sc.v'), p:$('.ph-sc.p'), s:$('.ph-sc.s') };
    var LEADS = [
      { n:'Laura & Marc', ini:'LM', tipo:'Boda', inv:120, fecha:'12 jun 2027', q:'finca para bodas en Girona', l:[6800, 8400, 1600], c:'#7A5C3E' },
      { n:'Grupo Nexa', ini:'GN', tipo:'Cena de empresa', inv:80, fecha:'14 nov 2026', q:'espacio para cena de empresa', l:[2400, 3600, 900], c:'#3B5B8C' },
      { n:'Sophie & Tom', ini:'ST', tipo:'Boda', inv:90, fecha:'3 jul 2027', q:'wedding venue in Spain', l:[5900, 6300, 1200], c:'#8C4A5B' },
      { n:'Lucía & Pablo', ini:'LP', tipo:'Boda', inv:150, fecha:'18 sep 2027', q:'masía para bodas en el Penedès', l:[7800, 10500, 2100], c:'#4A6B52' }
    ];
    var FONDO = [['Ana Nieto', 'AN', '#6B5B8C'], ['Familia Ruiz', 'FR', '#A0703A'], ['Emma & James', 'EJ', '#2F6F6A'], ['TechCorp', 'TC', '#5C6B3A'],
                 ['Marta & Iker', 'MI', '#8C4A5B'], ['Clara & Javi', 'CJ', '#3B5B8C'], ['Nuria & Dani', 'ND', '#7A5C3E']];
    var n = 0, total = 41200, s = 1, visible = true, compact = false;
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var eur = function(v){ return String(v).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' €'; };
    var sleep = function(ms){ return new Promise(function(r){ setTimeout(r, ms); }); };
    async function listo(){ while (!visible || document.hidden) await sleep(300); }
    // Ritmo de la historia: subir LENTO la hace más pausada
    var LENTO = 1.4;
    async function paso(ms){ await sleep(ms * LENTO); await listo(); }

    /* Escala: el lienzo tiene tamaño fijo y se ajusta al hueco */
    function fit(){
      // En escritorio siempre se ve la escena entera (portátil + móvil); solo en móvil/tablet se queda el teléfono
      compact = innerWidth <= 1020 && stage.clientWidth < 560;
      pl.classList.toggle('compacto', compact);
      var W = compact ? 260 : 840, H = compact ? 470 : 560;
      var hMax = innerWidth > 1020 ? stage.clientHeight : Infinity;
      s = Math.max(.45, Math.min(stage.clientWidth / W, hMax * .9 / H, compact ? 1.2 : .82));
      pl.style.setProperty('--s', s.toFixed(4));
    }
    fit(); addEventListener('resize', fit);

    /* ---------- Panel ---------- */
    function tarjeta(nombre, ini, color){
      var k = document.createElement('div'); k.className = 'k';
      k.style.setProperty('--c', color);
      k.innerHTML = '<span class="av"></span><span></span>';
      k.firstChild.textContent = ini; k.lastChild.textContent = nombre;
      return k;
    }
    function recount(){ lists.forEach(function(l, i){ counts[i].textContent = l.children.length + (i === 0 ? 3 : i === 3 ? 9 : 1); }); }
    function rects(){ var m = new Map(); lists.forEach(function(l){ [].forEach.call(l.children, function(k){ m.set(k, k.getBoundingClientRect()); }); }); return m; }
    function flip(before, skip){
      lists.forEach(function(l){ [].forEach.call(l.children, function(k){
        if (k === skip || !before.has(k)) return;
        var a = before.get(k), b = k.getBoundingClientRect(), dx = (a.left - b.left) / s, dy = (a.top - b.top) / s;
        if (Math.abs(dx) + Math.abs(dy) < .5) return;
        k.animate([{ transform:'translate(' + dx + 'px,' + dy + 'px)' }, { transform:'none' }], { duration:600, easing:'cubic-bezier(.22,1,.36,1)' });
      }); });
    }
    function local(el){ var r = el.getBoundingClientRect(), c = canvas.getBoundingClientRect(); return { x:(r.left - c.left) / s, y:(r.top - c.top) / s, w:r.width / s, h:r.height / s }; }
    async function hueco(i){
      // Cada columna enseña como mucho 3 tarjetas: sale la más antigua
      if (lists[i].children.length < 3) return;
      var old = lists[i].lastElementChild, b0 = rects();
      old.classList.add('sale'); await sleep(420); old.remove(); flip(b0); recount(); await sleep(200);
    }
    async function mover(k, to){
      await hueco(to);
      var a = local(k), useCursor = !compact;
      if (useCursor){
        cursor.style.transition = 'none';
        cursor.style.transform = 'translate(' + (a.x + a.w + 30) + 'px,' + (a.y + 50) + 'px)';
        cursor.getBoundingClientRect();
        cursor.classList.add('on');
        cursor.style.transition = 'transform .55s cubic-bezier(.22,1,.36,1), opacity .3s';
        cursor.style.transform = 'translate(' + (a.x + a.w * .7) + 'px,' + (a.y + a.h * .5) + 'px)';
        await sleep(600);
      }
      var before = rects();
      lists[to].insertBefore(k, lists[to].firstChild);
      var b = local(k), dx = a.x - b.x, dy = a.y - b.y;
      flip(before, k); recount();
      k.classList.add('vuela');
      var D = 900, E = 'cubic-bezier(.65,0,.35,1)';
      k.animate([
        { transform:'translate(' + dx + 'px,' + dy + 'px)' },
        { transform:'translate(' + dx + 'px,' + (dy - 6) + 'px) rotate(-3deg) scale(1.06)', offset:.18 },
        { transform:'translate(0,-6px) rotate(-3deg) scale(1.06)', offset:.82 },
        { transform:'none' }
      ], { duration:D, easing:E });
      if (useCursor){
        cursor.style.transition = 'none';
        cursor.animate([
          { transform:'translate(' + (a.x + a.w * .7) + 'px,' + (a.y + a.h * .5) + 'px)' },
          { transform:'translate(' + (a.x + a.w * .7) + 'px,' + (a.y + a.h * .5 - 6) + 'px)', offset:.18 },
          { transform:'translate(' + (b.x + b.w * .7) + 'px,' + (b.y + b.h * .5 - 6) + 'px)', offset:.82 },
          { transform:'translate(' + (b.x + b.w * .7) + 'px,' + (b.y + b.h * .5) + 'px)' }
        ], { duration:D, easing:E });
        cursor.style.transform = 'translate(' + (b.x + b.w * .7) + 'px,' + (b.y + b.h * .5) + 'px)';
      }
      await sleep(D);
      k.classList.remove('vuela'); cursor.classList.remove('on');
      return b;
    }
    function fichaSet(campo, v, pop){
      $$('[data-f="' + campo + '"]').forEach(function(el){
        el.textContent = v;
        if (pop && el.closest('.pf-nums')){ el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
      });
    }
    function etapa(i){
      // i = paso actual (0 solicitud … 3 señal); 4 = todo hecho
      pasos.forEach(function(li, k){ li.classList.toggle('ok', k < i || (i === 0 && k === 0)); li.classList.toggle('ya', k === i && i > 0); });
      pasosOl.style.setProperty('--p', Math.min(1, i / 3).toFixed(3));
    }
    var bell = $('[data-bell]'), act = $('[data-act]'), reloj = 9 * 60 + 41;
    function sube(el, v){ el.textContent = v; el.classList.remove('sube', 'pop'); void el.offsetWidth; el.classList.add(el === bell ? 'pop' : 'sube'); }
    function kpi(k){ var el = $('[data-kpi="' + k + '"]'); sube(el, (+el.textContent || 0) + 1); }
    function actividad(icon, html, cls){
      reloj += 1 + Math.floor(Math.random() * 3);
      var li = document.createElement('li'); li.className = 'nuevo';
      li.innerHTML = '<span class="ai ' + (cls || '') + '">' + icon + '</span><span>' + html + '</span><small>' + Math.floor(reloj / 60) + ':' + ('0' + reloj % 60).slice(-2) + '</small>';
      act.insertBefore(li, act.firstChild);
      while (act.children.length > 3) act.removeChild(act.lastChild);
      sube(bell, Math.min(9, (+bell.textContent || 0) + 1));
    }
    var esc = function(s){ return s.replace(/&/g, '&amp;'); };
    function toast(icon, title, sub, cls){
      var t = document.createElement('div'); t.className = 'toast';
      t.innerHTML = '<span class="ti ' + (cls || '') + '">' + icon + '</span><span><b></b><small></small></span>';
      t.querySelector('b').textContent = title; t.querySelector('small').textContent = sub;
      toasts.appendChild(t);
      while (toasts.children.length > 2) toasts.removeChild(toasts.firstChild);
      setTimeout(function(){ t.classList.add('fuera'); setTimeout(function(){ t.remove(); }, 460); }, 2800);
    }
    var I = function(d, w){ return '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="' + (w || 2.4) + '" stroke-linecap="round" stroke-linejoin="round">' + d + '</svg>'; };
    var IC = {
      ok:I('<path d="M5 12l5 5 9-10"/>', 3),
      bell:I('<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.7 21a2 2 0 0 1-3.4 0"/>'),
      cal:I('<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>'),
      eye:I('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
      pen:I('<path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>')
    };
    function confeti(x, y){
      var cols = ['#3FA868', '#7FC79A', '#D9C7A0', '#FFFFFF', '#F2B84B'];
      for (var i = 0; i < 20; i++){
        var c = document.createElement('i'); c.className = 'confeti';
        c.style.left = x + 'px'; c.style.top = y + 'px'; c.style.background = cols[i % cols.length];
        canvas.appendChild(c);
        var a = Math.random() * Math.PI * 2, v = 50 + Math.random() * 70, dx = Math.cos(a) * v, dy = Math.sin(a) * v - 40;
        c.animate([
          { transform:'translate(0,0) rotate(0)', opacity:1 },
          { transform:'translate(' + dx + 'px,' + dy + 'px) rotate(' + (Math.random() * 360) + 'deg)', opacity:1, offset:.55 },
          { transform:'translate(' + dx * 1.2 + 'px,' + (dy + 90) + 'px) rotate(' + (Math.random() * 720) + 'deg)', opacity:0 }
        ], { duration:1300 + Math.random() * 400, easing:'cubic-bezier(.2,.7,.4,1)' }).onfinish = (function(el){ return function(){ el.remove(); }; })(c);
      }
    }
    /* La solicitud viaja como un punto de luz del móvil al panel */
    function viaje(from, to){
      return new Promise(function(res){
        if (compact){ res(); return; }
        var x0 = from.x + from.w / 2, y0 = from.y + from.h / 2, x1 = to.x + to.w / 2, y1 = to.y + 14;
        var cx = (x0 + x1) / 2, cy = Math.min(y0, y1) - 90, t0 = performance.now(), D = 800;
        dot.style.opacity = 1;
        (function f(now){
          var t = Math.min(1, (now - t0) / D), e = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2, u = 1 - e;
          dot.style.transform = 'translate(' + (u * u * x0 + 2 * u * e * cx + e * e * x1) + 'px,' + (u * u * y0 + 2 * u * e * cy + e * e * y1) + 'px)';
          if (t < 1) requestAnimationFrame(f); else { dot.style.opacity = 0; res(); }
        })(t0);
      });
    }

    /* ---------- Móvil ---------- */
    function pantalla(id){
      Object.keys(SC).forEach(function(k){
        var el = SC[k];
        if (k === id){ el.classList.remove('fuera'); el.classList.add('on'); }
        else if (el.classList.contains('on')){ el.classList.remove('on'); el.classList.add('fuera'); setTimeout(function(){ el.classList.remove('fuera'); }, 650); }
      });
    }
    async function toque(el){
      var r = el.getBoundingClientRect(), c = scr.getBoundingClientRect();
      tap.style.left = ((r.left - c.left + r.width * .6) / s) + 'px';
      tap.style.top = ((r.top - c.top + r.height / 2) / s) + 'px';
      tap.classList.remove('va'); void tap.offsetWidth; tap.classList.add('va');
      if (el.classList.contains('ph-btn')){ el.classList.add('pulsa'); await sleep(180); el.classList.remove('pulsa'); }
      await sleep(260);
    }
    async function escribe(el, txt, ms){
      el.textContent = '';
      for (var i = 1; i <= txt.length; i++){ el.textContent = txt.slice(0, i); await sleep(ms * 1.2); }
    }
    function boton(sc, ok){
      var b = sc.querySelector('.ph-btn');
      if (!b.dataset.txt) b.dataset.txt = b.textContent;
      b.classList.toggle('ok', !!ok);
      b.textContent = ok ? b.dataset.ok : b.dataset.txt;
      return b;
    }
    // Calendario de visitas
    var dias = [];
    (function(){
      var g = $('.v-grid');
      for (var i = 0; i < 28; i++){
        var c = document.createElement('i'), d = i - 1;
        if (d >= 1){ c.textContent = d; if ([5, 6, 12, 13, 19, 20, 26].indexOf(d) >= 0) c.className = 'lib'; dias[d] = c; }
        g.appendChild(c);
      }
    })();

    function preparar(L){
      var amt = L.l[0] + L.l[1] + L.l[2], dep = Math.round(amt * .3 / 10) * 10;
      L.amt = amt; L.dep = dep;
      // Móvil limpio
      $('[data-type]').textContent = '';
      $$('.g-res').forEach(function(r){ r.classList.remove('in', 'pick'); });
      $$('[data-w]').forEach(function(f){ f.textContent = ''; f.classList.remove('activo'); });
      $$('.v-grid i, .v-slots span').forEach(function(d){ d.classList.remove('sel'); });
      $('.p-firma').classList.remove('firma');
      SC.s.classList.remove('pagado');
      ['w', 'v', 'p', 's'].forEach(function(k){ boton(SC[k], false); });
      $$('[data-l]').forEach(function(b, i){ b.textContent = eur(L.l[i]); });
      fichaSet('inv', L.inv);
      $('.s-amt').textContent = eur(dep);
      fichaSet('fecha', L.fecha);
    }

    async function historia(L){
      preparar(L);
      // 1 · Te busca en Google
      pantalla('g');
      await paso(500);
      await escribe($('[data-type]'), L.q, 45);
      await paso(250);
      var res = $$('.g-res');
      for (var i = 0; i < res.length; i++){ res[i].classList.add('in'); await sleep(140); }
      await paso(500);
      res[0].classList.add('pick'); await toque(res[0]);
      await paso(250);
      // 2 · Te escribe desde tu web
      pantalla('w');
      await paso(700);
      var campos = $$('[data-w]'), vals = [L.n, L.fecha, L.inv + ' invitados'];
      for (i = 0; i < campos.length; i++){ campos[i].classList.add('activo'); await escribe(campos[i], vals[i], 38); campos[i].classList.remove('activo'); await sleep(120); }
      var bw = boton(SC.w); await paso(200); await toque(bw); boton(SC.w, true);
      // La solicitud llega al panel
      var k = tarjeta(L.n, L.ini, L.c);
      await viaje(local(bw), local(lists[0]));
      await hueco(0);
      var before = rects();
      k.classList.add('entra', 'foco'); lists[0].insertBefore(k, lists[0].firstChild);
      flip(before, k); recount();
      ficha.classList.add('cambia'); await sleep(350);
      ficha.style.setProperty('--c', L.c);
      fichaSet('av', L.ini); fichaSet('name', L.n); fichaSet('meta', L.tipo + ' · ' + L.inv + ' invitados · ' + L.fecha);
      fichaSet('src', 'Tu web'); fichaSet('amt', '–'); fichaSet('dep', '–'); fichaSet('est', 'Nueva');
      $('.pf-top .av').style.background = L.c;
      etapa(0); ficha.classList.remove('cambia');
      toast(IC.bell, 'Nueva solicitud', L.n + ' · desde tu web', 'b');
      kpi('sol'); actividad(IC.bell, '<b>' + esc(L.n) + '</b> te ha escrito desde tu web', 'o');
      await paso(1300);
      // 3 · Reserva la visita
      pantalla('v');
      await paso(800);
      dias[13].classList.add('sel'); await toque(dias[13]);
      var slot = $$('.v-slots span')[1]; slot.classList.add('sel'); await toque(slot);
      var bv = boton(SC.v); await paso(200); await toque(bv); boton(SC.v, true);
      await mover(k, 1);
      etapa(1); fichaSet('est', 'Visita');
      toast(IC.cal, 'Visita agendada', 'Sábado 13 · 11:30 · ' + L.n);
      kpi('vis'); actividad(IC.cal, '<b>' + esc(L.n) + '</b> ha reservado visita');
      await paso(1300);
      // 4 · Recibe la propuesta, la abre y firma
      await mover(k, 2);
      etapa(2); fichaSet('amt', eur(L.amt), true); fichaSet('est', 'Propuesta');
      toast(IC.ok, 'Propuesta enviada', eur(L.amt) + ' · ' + L.n);
      pantalla('p');
      await paso(1100);
      toast(IC.eye, L.n.split(' ')[0] + ' está viendo tu propuesta', 'Ha abierto el menú 2 veces', 'b');
      actividad(IC.eye, '<b>' + esc(L.n) + '</b> ha abierto la propuesta');
      await paso(1000);
      var bp = boton(SC.p); await toque($('.p-firma')); $('.p-firma').classList.add('firma');
      await paso(1200);
      await toque(bp); boton(SC.p, true);
      etapa(3); fichaSet('dep', eur(L.dep), true); fichaSet('est', 'Firmado');
      toast(IC.pen, 'Contrato firmado', 'Firma online · ' + L.n, 'b');
      actividad(IC.pen, '<b>' + esc(L.n) + '</b> ha firmado el contrato');
      await paso(900);
      // 5 · Paga la señal
      pantalla('s');
      await paso(1000);
      var bs = boton(SC.s); await toque(bs);
      await sleep(500); SC.s.classList.add('pagado');
      var b = await mover(k, 3);
      etapa(4); fichaSet('est', 'Reservada');
      total += L.amt;
      totalEl.textContent = eur(total);
      sube(totalEl, eur(total));
      toast(IC.ok, 'Señal cobrada', '+' + eur(L.dep) + ' · fecha bloqueada');
      actividad(IC.ok, '<b>' + esc(L.n) + '</b> ha pagado ' + eur(L.dep), 'g');
      if (!compact) confeti(b.x + b.w / 2, b.y + b.h / 2);
      k.classList.remove('foco');
      await paso(2600);
    }

    // Estado inicial del panel y de la ficha
    var reparto = [[0, 1], [2], [3, 4], [5, 6]];
    reparto.forEach(function(ids, col){ ids.forEach(function(i){ lists[col].appendChild(tarjeta(FONDO[i][0], FONDO[i][1], FONDO[i][2])); }); });
    recount();
    var L0 = LEADS[0]; preparar(L0);
    etapa(0);
    if (reduce){
      // Sin movimiento: se enseña el final de la historia
      fichaSet('amt', eur(L0.amt)); fichaSet('dep', eur(L0.dep)); fichaSet('est', 'Reservada'); etapa(4);
      pantalla('s'); SC.s.classList.add('pagado');
      return;
    }
    if ('IntersectionObserver' in window) new IntersectionObserver(function(es){ visible = es[0].isIntersecting; }).observe(pl);
    async function bucle(){
      await sleep(700);
      for (;;){ await listo(); await historia(LEADS[n++ % LEADS.length]); }
    }
    if (window.FE_LISTO) bucle(); else document.addEventListener('fe:listo', bucle, { once:true });
  })();

  /* Así trabajamos: la línea se llena al bajar y cada paso se marca al alcanzarlo */
  (function(){
    var ol = document.querySelector('[data-pasos]'); if (!ol) return;
    var pasos = [].slice.call(ol.children), tick = false;
    function on(){
      tick = false;
      var r = ol.getBoundingClientRect(), vh = innerHeight;
      var p = Math.max(0, Math.min(1, (vh * .78 - r.top) / (r.height * .7)));
      ol.style.setProperty('--p', p.toFixed(3));
      pasos.forEach(function(li, i){ li.classList.toggle('hecho', p >= (i === 0 ? .02 : i / (pasos.length - 1) - .02)); });
    }
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
