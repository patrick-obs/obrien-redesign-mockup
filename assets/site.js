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

/* mobile menu */
(function(){
  var burger = document.querySelector('.burger'), panel = document.getElementById('mnav');
  if (!burger || !panel) return;
  burger.addEventListener('click', function(){
    var open = panel.classList.toggle('open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  });
})();

/* before/after compare slider */
(function(){
  var frame = document.querySelector('.ba-frame');
  if (!frame) return;
  var range = frame.querySelector('.ba-range'), top = frame.querySelector('.ba-top'), handle = frame.querySelector('.ba-handle');
  var set = function(v){
    top.style.clipPath = 'inset(0 0 0 ' + v + '%)';
    handle.style.left = v + '%';
  };
  range.addEventListener('input', function(){ set(range.value); });
  set(range.value);
})();

/* industry showcase */
(function(){
  var list = document.querySelector('.sc-list');
  if (!list) return;
  var items = [].slice.call(list.querySelectorAll('.sc-item'));
  var stage = document.querySelector('.sc-stage');
  var imgA = stage.querySelector('.sc-img.a'), imgB = stage.querySelector('.sc-img.b');
  var capK = stage.querySelector('.sc-cap .k'), capT = stage.querySelector('.sc-cap .t');
  var front = imgA, back = imgB, current = 0, interacted = false, timer = null;
  items.forEach(function(a){ new Image().src = a.dataset.img; });
  function show(idx){
    if (idx === current) return;
    current = idx;
    var a = items[idx];
    items.forEach(function(x,i){ x.classList.toggle('on', i===idx); });
    back.style.backgroundImage = "url('" + a.dataset.img + "')";
    back.classList.remove('hide');
    front.classList.add('hide');
    var t = front; front = back; back = t;
    capK.textContent = a.dataset.name;
    capT.textContent = a.dataset.short + '.';
    stage.href = a.href;
  }
  items.forEach(function(a, idx){
    a.addEventListener('mouseenter', function(){ interacted = true; stopAuto(); show(idx); });
    a.addEventListener('focus', function(){ interacted = true; stopAuto(); show(idx); });
    a.addEventListener('touchstart', function(){ interacted = true; stopAuto(); }, {passive:true});
  });
  function stopAuto(){ if (timer) { clearInterval(timer); timer = null; } }
  /* gentle auto-advance until the visitor takes over; skipped for reduced motion */
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches && 'IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if (e.isIntersecting && !interacted && !timer) {
          timer = setInterval(function(){ show((current + 1) % items.length); }, 3500);
        } else if (!e.isIntersecting) { stopAuto(); }
      });
    }, {threshold:.4});
    io.observe(stage);
  }
})();
