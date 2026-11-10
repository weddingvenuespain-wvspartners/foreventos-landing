  /* Hero: entrada al abrirse la web */
  (function(){
    var h = document.querySelector('.hero'); if (!h) return;
    function go(){ requestAnimationFrame(function(){ h.classList.add('on'); }); }
    if (window.FE_LISTO) go(); else document.addEventListener('fe:listo', go, { once:true });
  })();

  /* Así trabajamos: pasos en columna. Cada uno se monta al llegar al centro de la pantalla (.hecho) y el
     índice fijo de la izquierda marca en cuál estás */
  (function(){
    var ol = document.querySelector('[data-pasos]'); if (!ol) return;
    var pasos = [].slice.call(ol.children), idx = [].slice.call(document.querySelectorAll('.como-indice li'));
    function marca(k){ idx.forEach(function(l, j){ l.classList.toggle('on', j === k); l.classList.toggle('ya', j < k); }); }
    if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)){ pasos.forEach(function(p){ p.classList.add('hecho'); }); return; }
    var io = new IntersectionObserver(function(es){
      es.forEach(function(en){ if (en.isIntersecting){ en.target.classList.add('hecho'); marca(pasos.indexOf(en.target)); } });
    }, { rootMargin:'-42% 0px -42% 0px' });
    pasos.forEach(function(p){ io.observe(p); });
  })();


  /* Hero vivo: la luz sigue al ratón con retardo; sin ratón (móvil) pasea sola en curvas.
     Al bajar, el fondo se queda atrás (paralaje) y, en el portátil, el texto sube y se apaga
     y la tarjeta verde se encoge un poco */
  (function(){
    var card = document.querySelector('.hero-card'), luz = card && card.querySelector('.hero-bg .luz'), bg = card && card.querySelector('.hero-bg');
    if (!luz || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var hm = card.querySelector('[data-escena]'), txt = card.querySelector('.hero-txt');
    var x = 0, y = 0, tx = null, ty = null, quieto = 0, visible = true, t0 = performance.now();
    card.addEventListener('pointermove', function(e){ if (e.pointerType !== 'mouse') return; var r = card.getBoundingClientRect(); tx = e.clientX - r.left; ty = e.clientY - r.top; quieto = performance.now(); });
    // Salida al bajar, solo en el portátil: en el móvil, encoger la tarjeta mientras la barra del
    // navegador aparece y desaparece daba tirones
    function escena(h){
      if (innerWidth <= 1020){ if (card.style.scale){ card.style.scale = ''; txt.style.translate = ''; txt.style.opacity = ''; } return; }
      var p = Math.max(0, Math.min(1, scrollY / (h * .7))), e = p * p * (3 - 2 * p);
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

  /* Trabajo real: la tira se duplica una vez para que el bucle (CSS, de 0 a -50 %) no tenga corte.
     Las copias no se leen ni se anuncian */
  (function(){
    var pista = document.querySelector('[data-casos]'); if (!pista) return;
    [].slice.call(pista.children).forEach(function(c){
      var d = c.cloneNode(true); d.setAttribute('aria-hidden', 'true');
      [].forEach.call(d.querySelectorAll('img'), function(im){ im.alt = ''; });
      pista.appendChild(d);
    });
  })();
