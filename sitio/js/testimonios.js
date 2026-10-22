  /* Testimonios: carrusel horizontal con flechas, arrastre con ratón y vídeos al tocar */
  (function(){
    var track = document.querySelector('[data-testi]'); if (!track) return;
    var btns = [].slice.call(document.querySelectorAll('.testi-nav .tn'));
    function estado(){
      var max = track.scrollWidth - track.clientWidth - 2;
      btns[0].disabled = track.scrollLeft <= 2;
      btns[1].disabled = track.scrollLeft >= max;
    }
    btns.forEach(function(b){
      b.addEventListener('click', function(){
        track.scrollBy({ left:+b.getAttribute('data-dir') * Math.max(280, track.clientWidth * .7), behavior:'smooth' });
      });
    });
    track.addEventListener('scroll', function(){ requestAnimationFrame(estado); }, { passive:true });
    addEventListener('resize', estado); estado();

    // Arrastrar con el ratón (en táctil ya se desliza solo)
    var down = false, moved = false, x0 = 0, s0 = 0;
    track.addEventListener('pointerdown', function(e){
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = false; x0 = e.clientX; s0 = track.scrollLeft;
    });
    addEventListener('pointermove', function(e){
      if (!down) return;
      var dx = e.clientX - x0;
      if (!moved && Math.abs(dx) > 5){ moved = true; track.classList.add('arrastra'); }
      if (moved) track.scrollLeft = s0 - dx;
    });
    addEventListener('pointerup', function(){
      if (!down) return; down = false;
      if (moved) setTimeout(function(){ track.classList.remove('arrastra'); }, 0);
    });

    // Vídeos: <video> dentro de .t-media; el botón lo reproduce con sonido
    [].forEach.call(track.querySelectorAll('.t-play'), function(b){
      var t = b.closest('.t'), v = t.querySelector('video');
      if (!v){ b.disabled = true; return; }
      b.addEventListener('click', function(){
        if (v.paused){ v.muted = false; v.play(); t.classList.add('sonando'); }
        else { v.pause(); t.classList.remove('sonando'); }
      });
      v.addEventListener('click', function(){ v.pause(); t.classList.remove('sonando'); });
      v.addEventListener('ended', function(){ t.classList.remove('sonando'); });
    });
  })();
