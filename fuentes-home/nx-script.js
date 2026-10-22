
  // ===== v5: efectos de scroll =====
  (function(){
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var clamp = function(v){ return v < 0 ? 0 : v > 1 ? 1 : v };

    // Frase grande: cada palabra se «enciende» al avanzar el scroll
    var big = document.querySelector('[data-fill]'), words = [];
    if (big){
      big.innerHTML = big.textContent.trim().split(/\s+/).map(function(w){ return '<span class="w">' + w + '</span>' }).join(' ');
      words = [].slice.call(big.querySelectorAll('.w'));
    }

    // Servicios: scroll fijo que cambia panel y pantalla
    var story = document.querySelector('[data-story]');
    var navs = story ? [].slice.call(story.querySelectorAll('.nx-nav button')) : [];
    var sps = story ? [].slice.call(story.querySelectorAll('.nx-sp')) : [];
    var scrs = story ? [].slice.call(story.querySelectorAll('.nx-scr')) : [];
    var cur = -1;
    var url = story && story.querySelector('.nx-dbar .u');
    var urls = ['weddingvenuesspain.com', 'app.foreventos.com', 'app.foreventos.com/visita', 'app.foreventos.com'];
    var bgs = story ? [].slice.call(story.querySelectorAll('.nx-bg')) : [];
    var caps = story ? [].slice.call(story.querySelectorAll('.nx-cap span')) : [];
    function setStep(i){
      if (i === cur) return; cur = i;
      navs.forEach(function(b, k){ b.classList.toggle('on', k === i); b.setAttribute('aria-selected', k === i) });
      sps.forEach(function(p, k){ p.classList.toggle('on', k === i) });
      scrs.forEach(function(s, k){ s.classList.toggle('on', k === i) });
      bgs.forEach(function(s, k){ s.classList.toggle('on', k === i) });
      caps.forEach(function(s, k){ s.classList.toggle('on', k === i) });
      if (url) url.textContent = urls[i];
    }
    var sticky = function(){ return story && getComputedStyle(story.querySelector('.nx-sticky')).position === 'sticky' };
    navs.forEach(function(b, k){
      b.addEventListener('click', function(){
        if (sticky()){
          var top = story.getBoundingClientRect().top + scrollY, h = story.offsetHeight - innerHeight;
          scrollTo({ top: top + h * (k + .5) / navs.length, behavior: reduce ? 'auto' : 'smooth' });
        } else setStep(k);
      });
    });
    if (story) setStep(0);

    // Cómo trabajamos: línea que se rellena
    var line = document.querySelector('[data-line]');
    var pts = line ? [].slice.call(line.querySelectorAll('.nx-pt')) : [];

    function onScroll(){
      var vh = innerHeight;
      if (words.length){
        var r = big.getBoundingClientRect();
        var p = reduce ? 1 : clamp((vh * .82 - r.top) / (r.height + vh * .3));
        var n = Math.round(p * words.length);
        words.forEach(function(w, k){ w.classList.toggle('on', k < n) });
      }
      if (story && sticky()){
        var rs = story.getBoundingClientRect();
        var ps = clamp(-rs.top / (rs.height - vh));
        setStep(Math.min(navs.length - 1, Math.floor(ps * navs.length)));
        story.style.setProperty('--sp', ps.toFixed(3));
      }
      if (line){
        var rl = line.getBoundingClientRect();
        var pl = reduce ? 1 : clamp((vh * .75 - rl.top) / (rl.height));
        line.style.setProperty('--p', pl.toFixed(3));
        pts.forEach(function(pt, k){ pt.classList.toggle('on', pl >= (k + .02) / pts.length || pl >= .98) });
      }
      offers.forEach(function(o){
        var ro = o.getBoundingClientRect();
        if (reduce || ro.top < vh * .82) o.classList.add('full');
      });
    }
    var offers = [].slice.call(document.querySelectorAll('.nx-off'));
    addEventListener('scroll', onScroll, { passive:true });
    addEventListener('resize', onScroll);
    onScroll();

    // Para quién: píldoras
    var pills = [].slice.call(document.querySelectorAll('.nx-pill'));
    function pick(i, focus){
      pills.forEach(function(p, k){
        var on = k === i; p.setAttribute('aria-selected', on); p.tabIndex = on ? 0 : -1;
        var pane = document.getElementById(p.getAttribute('aria-controls'));
        pane.hidden = !on; pane.classList.toggle('on', on);
      });
      if (focus) pills[i].focus();
    }
    pills.forEach(function(p, k){
      p.addEventListener('click', function(){ pick(k) });
      p.addEventListener('keydown', function(e){
        if (e.key === 'ArrowRight'){ e.preventDefault(); pick((k + 1) % pills.length, true) }
        if (e.key === 'ArrowLeft'){ e.preventDefault(); pick((k - 1 + pills.length) % pills.length, true) }
      });
    });
    // El enlace de cada tipo deja el formulario ya elegido
    [].slice.call(document.querySelectorAll('.nx-wd a[data-type]')).forEach(function(a){
      a.addEventListener('click', function(){
        var sel = document.querySelector('#contactForm select[name="business_type"]'); if (!sel) return;
        [].slice.call(sel.options).forEach(function(o){ if (o.text === a.dataset.type || o.value === a.dataset.type) sel.value = o.value });
      });
    });

    // Cifras que cuentan al aparecer
    var nums = [].slice.call(document.querySelectorAll('[data-count]'));
    if (nums.length && 'IntersectionObserver' in window && !reduce){
      var io = new IntersectionObserver(function(es){
        es.forEach(function(e){
          if (!e.isIntersecting) return; io.unobserve(e.target);
          var el = e.target, to = +el.dataset.count, t0 = performance.now();
          if (!to) return;
          (function tick(t){ var k = clamp((t - t0) / 1400); el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick) })(t0);
        });
      }, { threshold:.6 });
      nums.forEach(function(n){ if (+n.dataset.count) n.textContent = '0'; io.observe(n) });
    }

    // Planes: la cápsula deja elegido el interés en el formulario
    offers.forEach(function(a){
      a.addEventListener('click', function(){
        var sel = document.querySelector('#contactForm select[name="interest"]'); if (!sel) return;
        [].slice.call(sel.options).forEach(function(o){ if (o.text === a.dataset.interest) sel.value = o.value });
      });
    });

    // Objeto 3D: se inclina con el ratón
    var tilt = document.querySelector('[data-tilt]');
    if (tilt && !reduce && matchMedia('(hover: hover)').matches){
      var card = tilt.closest('.nx-card');
      card.addEventListener('mousemove', function(e){
        var r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        tilt.style.setProperty('--ry', (x * 30).toFixed(1) + 'deg'); tilt.style.setProperty('--rx', (-y * 24).toFixed(1) + 'deg');
      });
      card.addEventListener('mouseleave', function(){ tilt.style.setProperty('--ry', '0deg'); tilt.style.setProperty('--rx', '0deg') });
    }

    // Entrada desenfocada
    var blurs = [].slice.call(document.querySelectorAll('.blur-in'));
    if ('IntersectionObserver' in window){
      var bio = new IntersectionObserver(function(es){ es.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add('in'); bio.unobserve(e.target) } }) }, { threshold:.15 });
      blurs.forEach(function(b){ bio.observe(b) });
    } else blurs.forEach(function(b){ b.classList.add('in') });
  })();
