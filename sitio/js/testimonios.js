  /* Testimonio en vídeo: al pulsar se reproduce con sonido y controles */
  (function(){
    [].forEach.call(document.querySelectorAll('.tv'), function(t){
      var v = t.querySelector('video'), b = t.querySelector('.tv-play'); if (!v || !b) return;
      b.addEventListener('click', function(){ v.controls = true; v.muted = false; var p = v.play(); if (p && p.catch) p.catch(function(){}); t.classList.add('suena'); });
      v.addEventListener('ended', function(){ t.classList.remove('suena'); v.controls = false; });
    });
  })();
