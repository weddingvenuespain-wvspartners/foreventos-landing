  var REDUCE = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Intro de marca: el arco se forma dovela a dovela, cae la clave, aparece el nombre y el
     contador llega a 100; el fondo cambia de golpe a verde y la cortina sube en curva.
     Solo la primera vez por sesión (el <head> pone .con-intro). Clic = saltar. */
  (function(){
    var root = document.documentElement, el = document.getElementById('intro');
    if (!el || !root.classList.contains('con-intro')){
      root.classList.remove('con-intro');
      // Con cortina, las entradas esperan a que empiece a abrirse
      if (!root.classList.contains('con-cortina')){ window.FE_LISTO = true; return; }
      setTimeout(function(){ window.FE_LISTO = true; document.dispatchEvent(new Event('fe:listo')); }, 380);
      return;
    }
    try { sessionStorage.setItem('fe_intro', '1'); } catch(e) {}
    [].forEach.call(el.querySelectorAll('.intro-nombre span'), function(s, k){ s.style.setProperty('--k', k); });
    var t = [], cuenta = el.querySelector('[data-cuenta]'), t0 = performance.now(), hecho = false;
    (function cuenta100(now){
      var p = Math.min(1, (now - t0) / 1550);
      cuenta.textContent = Math.round(100 * (p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2));
      if (p < 1 && !hecho) requestAnimationFrame(cuenta100);
    })(t0);
    function fin(){
      if (hecho) return; hecho = true;
      t.forEach(clearTimeout);
      el.classList.add('fin');
      window.FE_LISTO = true;
      document.dispatchEvent(new Event('fe:listo'));
      setTimeout(function(){ el.remove(); root.classList.remove('con-intro'); }, 1000);
    }
    requestAnimationFrame(function(){ el.classList.add('va'); });
    t.push(setTimeout(function(){ el.classList.add('swap'); }, 1650));
    t.push(setTimeout(fin, 2150));
    el.addEventListener('click', fin);
  })();

  /* Cortina entre páginas: al pulsar un enlace interno sube la cortina verde con el arco y luego
     se navega; en la página nueva (head.html pone .con-cortina) se retira hacia arriba */
  (function(){
    var c = document.querySelector('.cortina'), root = document.documentElement; if (!c) return;
    if (root.classList.contains('con-cortina')){
      requestAnimationFrame(function(){ requestAnimationFrame(function(){ c.classList.add('abre'); }); });
      setTimeout(function(){ root.classList.remove('con-cortina'); c.classList.remove('abre'); }, 1100);
    }
    if (REDUCE) return;
    document.addEventListener('click', function(e){
      var a = e.target.closest && e.target.closest('a[href]'); if (!a) return;
      if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || a.target || a.hasAttribute('download')) return;
      var u = new URL(a.href, location.href);
      // Solo otras páginas de esta web (las anclas de la misma página se quedan como están)
      if (u.origin !== location.origin || u.pathname.replace(/\/$/, '') === location.pathname.replace(/\/$/, '')) return;
      e.preventDefault();
      try { sessionStorage.setItem('fe_cortina', '1'); } catch (er) {}
      c.classList.add('cubre');
      setTimeout(function(){ location.href = u.href; }, 560);
    });
    // Al volver atrás desde la caché del navegador, la cortina no puede quedarse puesta
    addEventListener('pageshow', function(e){ if (e.persisted){ c.classList.remove('cubre', 'abre'); root.classList.remove('con-cortina'); } });
  })();

  /* Menú: fondo al hacer scroll */
  (function(){
    var nav = document.getElementById('nav'); if (!nav) return;
    // Con margen (entra a 40 px, sale a 10 px) para que no parpadee al rozar el borde
    var pegado = false, tick = false;
    function on(){ tick = false; var y = window.scrollY; if (!pegado && y > 40){ pegado = true; nav.classList.add('pegado'); } else if (pegado && y < 10){ pegado = false; nav.classList.remove('pegado'); } }
    window.addEventListener('scroll', function(){ if (!tick){ tick = true; requestAnimationFrame(on); } }, { passive:true }); on();
  })();

  /* Menú móvil */
  (function(){
    var b = document.querySelector('.nav-burger'), mm = document.getElementById('menuMovil');
    if (!b || !mm) return;
    function set(v){
      mm.classList.toggle('abierto', v);
      mm.setAttribute('aria-hidden', v ? 'false' : 'true');
      if (v) mm.removeAttribute('inert'); else mm.setAttribute('inert', '');
      b.setAttribute('aria-expanded', v ? 'true' : 'false');
      b.setAttribute('aria-label', v ? 'Cerrar menú' : 'Abrir menú');
      document.body.classList.toggle('mm-on', v);
    }
    b.addEventListener('click', function(){ set(!mm.classList.contains('abierto')); });
    document.addEventListener('keydown', function(e){ if (e.key === 'Escape' && mm.classList.contains('abierto')){ set(false); b.focus(); } });
    mm.querySelectorAll('a').forEach(function(a){ a.addEventListener('click', function(){ set(false); }); });
    var path = location.pathname.replace(/\/$/, '') || '/';
    mm.querySelectorAll('a[href^="/"]').forEach(function(a){ if (a.getAttribute('href') === path) a.setAttribute('aria-current', 'page'); });
  })();

  /* Titulares .split: se parten en palabras para que suban una a una */
  (function(){
    [].forEach.call(document.querySelectorAll('.split'), function(h){
      var i = 0, last = null;
      (function walk(node){
        [].slice.call(node.childNodes).forEach(function(n){
          if (n.nodeType === 3){
            var frag = document.createDocumentFragment(), txt = n.textContent;
            // La puntuación pegada a la palabra anterior («negocio?») no se separa de ella
            var p = txt.match(/^[?!.,:;]+/);
            if (p && last){ last.textContent += p[0]; txt = txt.slice(p[0].length); }
            txt.split(/(\s+)/).forEach(function(part){
              if (!part) return;
              if (/^\s+$/.test(part)){ frag.appendChild(document.createTextNode(part)); return; }
              var w = document.createElement('span'); w.className = 'w';
              var s = document.createElement('span'); s.textContent = part; s.style.setProperty('--i', i++); last = s;
              w.appendChild(s); frag.appendChild(w);
            });
            n.parentNode.replaceChild(frag, n);
          } else if (n.nodeType === 1 && !n.hasAttribute('data-nosplit')) walk(n);
        });
      })(h);
    });
  })();

  /* Entradas al hacer scroll (.rv, .rv-clip, .split → .in) */
  (function(){
    var els = document.querySelectorAll('.rv, .rv-clip, .split');
    function go(){
      if (!('IntersectionObserver' in window)){ [].forEach.call(els, function(e){ e.classList.add('in'); }); return; }
      var io = new IntersectionObserver(function(es){
        es.forEach(function(en){ if (en.isIntersecting){ en.target.classList.add('in'); io.unobserve(en.target); } });
      // Se activa un poco antes de que el elemento entre: al bajar rápido no se ven huecos vacíos
      }, { rootMargin:'0px 0px 8% 0px', threshold:0 });
      [].forEach.call(els, function(e){ io.observe(e); });
    }
    // Con intro, lo de arriba espera a que se abra la web
    if (window.FE_LISTO) go(); else document.addEventListener('fe:listo', go, { once:true });
  })();

  /* Botones: el círculo de la flecha crece lo justo para llenar el botón;
     los [data-mag] además se dejan atraer un poco por el ratón */
  [].forEach.call(document.querySelectorAll('.btn'), function(b){
    b.addEventListener('pointerenter', function(){ b.style.setProperty('--k', Math.ceil(b.offsetWidth * 2.2 / 40)); });
    if (!b.hasAttribute('data-mag') || REDUCE || !matchMedia('(hover: hover)').matches) return;
    b.addEventListener('pointermove', function(e){
      var r = b.getBoundingClientRect();
      b.style.translate = ((e.clientX - r.left - r.width / 2) * .18).toFixed(1) + 'px ' + ((e.clientY - r.top - r.height / 2) * .3).toFixed(1) + 'px';
    });
    b.addEventListener('pointerleave', function(){ b.style.translate = ''; });
  });

  /* Formularios → API de app.foreventos.com (contacto y demo) */
  (function(){
    var FORMS = {
      contactForm: {
        api:'https://app.foreventos.com/api/public/contact',
        ok:'¡Mensaje recibido! Te respondemos en menos de 24 horas laborables.',
        err:'No se ha podido enviar. Te abrimos tu correo para que nos escribas directamente.',
        body:function(v){ return { name:v('name'), company:v('venue'), email:v('email'), website:v('website'), lang:'es',
          message:['Tipo: '+v('business_type'), 'Le interesa: '+v('interest'), v('phone') ? 'Teléfono: '+v('phone') : '', v('message')].filter(Boolean).join('\n') }; },
        mailto:true
      },
      demoForm: {
        api:'https://app.foreventos.com/api/public/demo-request',
        ok:'¡Solicitud recibida! La revisamos y te enviamos por email tu enlace personal a la demo.',
        err:'No se ha podido enviar. Escríbenos a info@foreventos.com y te la enviamos.',
        body:function(v){ return { name:v('name'), email:v('email'), phone:v('phone'), business_type:v('business_type'), venue_name:v('venue_name'),
          company:v('company'), city:v('city'), website_url:v('website_url'), message:v('message'), website:v('website'), lang:'es' }; }
      }
    };
    Object.keys(FORMS).forEach(function(id){
      var f = document.getElementById(id); if (!f) return;
      var cfg = FORMS[id], btn = f.querySelector('button[type=submit]'), st = f.querySelector('.f-status');
      function v(n){ return ((f.elements[n] && f.elements[n].value) || '').trim(); }
      function show(k, m){ if (st){ st.textContent = m; st.className = 'f-status ' + k; } }
      f.addEventListener('submit', function(e){
        e.preventDefault();
        if (!f.reportValidity()) return;
        var label = btn && btn.querySelector('span'), orig = label ? label.textContent : '';
        if (btn) btn.disabled = true; if (label) label.textContent = 'Enviando…';
        fetch(cfg.api, { method:'POST', headers:{ 'Content-Type':'application/json' }, body:JSON.stringify(cfg.body(v)) })
          .then(function(r){ if (!r.ok){ var er = new Error('HTTP ' + r.status); er.status = r.status; throw er; } return r.json(); })
          .then(function(){ show('ok', cfg.ok); f.reset(); })
          .catch(function(er){
            if (er && er.status === 400){ show('err', 'Revisa los datos: falta alguno o el email no parece válido.'); return; }
            if (er && er.status === 429){ show('err', 'Has enviado varios mensajes seguidos. Espera unos minutos o escríbenos a info@foreventos.com.'); return; }
            show('err', cfg.err);
            if (cfg.mailto) setTimeout(function(){
              location.href = 'mailto:info@foreventos.com?subject=' + encodeURIComponent('Contacto FOREVENTOS · ' + v('venue')) +
                '&body=' + encodeURIComponent('Nombre: ' + v('name') + '\nNegocio: ' + v('venue') + '\nEmail: ' + v('email') + '\nLe interesa: ' + v('interest') + '\n\n' + v('message'));
            }, 900);
          })
          .finally(function(){ if (btn) btn.disabled = false; if (label) label.textContent = orig; });
      });
    });
    // /contacto?interes=… preselecciona lo que le interesa
    var sel = document.querySelector('#contactForm select[name=interest]'), q = new URLSearchParams(location.search).get('interes');
    if (sel && q) [].forEach.call(sel.options, function(o){ if (o.getAttribute('data-k') === q) sel.value = o.value; });
  })();

  /* Submenú fijo de servicios: marca la sección en la que estás */
  (function(){
    var nav = document.querySelector('[data-subnav]'); if (!nav) return;
    var links = [].slice.call(nav.querySelectorAll('a')), secs = links.map(function(a){ return document.querySelector(a.getAttribute('href')); });
    var tick = false;
    function on(){
      tick = false;
      var cur = -1;
      secs.forEach(function(s, i){ if (s && s.getBoundingClientRect().top < innerHeight * .45) cur = i; });
      links.forEach(function(a, i){ a.classList.toggle('on', i === cur); });
      if (cur >= 0 && nav.scrollWidth > nav.clientWidth) nav.scrollTo({ left:links[cur].offsetLeft - 20, behavior:'smooth' });
    }
    addEventListener('scroll', function(){ if (!tick){ tick = true; requestAnimationFrame(on); } }, { passive:true });
    on();
  })();

  /* Datos legales (LSSI art. 10) en el pie */
  (function(){
    var L = window.FE_LEGAL || {}, el = document.getElementById('feLegal');
    if (el) el.textContent = [L.company, 'NIF ' + L.cif, L.address].filter(Boolean).join(' · ');
  })();
