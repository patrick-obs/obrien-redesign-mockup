document.documentElement.classList.add('js');
(function(){
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hdr = document.querySelector('header');
  addEventListener('scroll', function(){ if (hdr) hdr.classList.toggle('scrolled', scrollY > 8); }, {passive:true});
  if (reduce || !('IntersectionObserver' in window)) return;

  /* scroll-reveal: fade-up as tiles enter the viewport */
  var els = document.querySelectorAll('.card,.proj,a.pt,.dlc,.steps>div,.stats .grid>div,.sb-badge,.gallery img,.ccard,.team>div');
  els.forEach(function(el,i){ el.classList.add('rv'); el.style.transitionDelay = Math.min((i%6)*60,300)+'ms'; });
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if (!e.isIntersecting) return;
      var el = e.target;
      el.classList.add('in');
      io.unobserve(el);
      /* hand transforms back to the hover styles once the reveal finishes */
      setTimeout(function(){ el.classList.remove('rv','in'); el.style.transitionDelay=''; }, 1000);
    });
  }, {rootMargin:'0px 0px -8% 0px', threshold:.08});
  els.forEach(function(el){ io.observe(el); });

  /* count-up on numeric stats */
  document.querySelectorAll('.stats b').forEach(function(b){
    var txt = b.textContent.trim();
    if (!/^\d{1,4}$/.test(txt)) return;
    var target = parseInt(txt,10), done = false;
    var cio = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if (!e.isIntersecting || done) return;
        done = true; cio.disconnect();
        var t0 = performance.now(), dur = 1100;
        (function tick(now){
          var p = Math.min(((now||performance.now())-t0)/dur, 1);
          p = 1-Math.pow(1-p,3);
          b.textContent = Math.round(target*p);
          if (p<1) requestAnimationFrame(tick);
        })(t0);
      });
    }, {threshold:.6});
    cio.observe(b);
  });
})();
