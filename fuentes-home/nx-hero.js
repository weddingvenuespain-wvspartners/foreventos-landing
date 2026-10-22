
  // ===== v7: hero, el recorrido de una reserva en 4 escenas =====
  (function(){
    var box = document.querySelector('[data-hx]'); if (!box) return;
    var stage = box.querySelector('.hx-stage');
    var steps = [].slice.call(box.querySelectorAll('.hx-steps li'));
    var DUR = 4200, cur = -1, timer = null, typer = null, visible = true;
    var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    box.style.setProperty('--hx-dur', DUR + 'ms');
    function scenes(){ return [].slice.call(stage.querySelectorAll('.hx-sc')) }
    function type(sc){
      var el = sc.querySelector('.hx-type'); if (!el) return;
      var txt = el.getAttribute('data-text'), i = 0; el.textContent = '';
      clearInterval(typer);
      typer = setInterval(function(){ i++; el.textContent = txt.slice(0, i); if (i >= txt.length) clearInterval(typer) }, 42);
    }
    function show(i){
      cur = i % 4;
      var list = scenes();
      // Se sustituye la escena por una copia para que sus animaciones empiecen de cero
      var fresh = list[cur].cloneNode(true);
      stage.replaceChild(fresh, list[cur]);
      scenes().forEach(function(s, k){ s.classList.toggle('on', k === cur) });
      steps.forEach(function(li, k){ li.classList.toggle('on', k === cur); li.classList.toggle('done', k < cur) });
      if (cur === 0) type(fresh);
      clearTimeout(timer);
      timer = setTimeout(function(){ if (visible && !document.hidden) show(cur + 1); else waitVisible() }, cur === 3 ? DUR + 1200 : DUR);
    }
    function waitVisible(){ clearTimeout(timer); timer = setTimeout(function(){ if (visible && !document.hidden) show(cur + 1); else waitVisible() }, 600) }
    if (reduce){
      var all = scenes(); all.forEach(function(s, k){ s.classList.toggle('on', k === 3) });
      steps.forEach(function(li){ li.classList.add('done') });
      return;
    }
    if ('IntersectionObserver' in window){
      new IntersectionObserver(function(es){ visible = es[0].isIntersecting }, { threshold:.2 }).observe(box);
    }
    show(0);
  })();
