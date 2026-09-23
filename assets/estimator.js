(function(){
  var f = document.getElementById('est'); if (!f) return;
  var out = document.getElementById('est-out');
  function num(id){ var v = parseFloat(f.elements[id].value); return isFinite(v) && v > 0 ? v : 0; }
  function ftin(inches){ var ft = Math.floor(inches / 12), inch = inches - ft * 12; inch = Math.round(inch * 16) / 16; if (inch === 12) { ft++; inch = 0; } return ft + "' " + (inch ? inch + '"' : '0"'); }
  function draw(svg, faces, depth, aisle, width, mobile){
    var W = 400, H = 170, sx = W / width, g = '', x = 0, used = 0;
    var row = function(w, cls){ g += '<rect x="' + (x * sx).toFixed(2) + '" y="18" width="' + Math.max(w * sx - 1, 1).toFixed(2) + '" height="' + (H - 36) + '" class="' + cls + '"/>'; x += w; };
    var gap = function(w){ g += '<rect x="' + (x * sx).toFixed(2) + '" y="18" width="' + (w * sx).toFixed(2) + '" height="' + (H - 36) + '" class="est-aisle"/>'; x += w; };
    if (mobile) { var half = Math.floor(faces / 2); for (var i = 0; i < half; i++) row(depth, 'est-u'); gap(aisle); for (var j = half; j < faces; j++) row(depth, 'est-u'); }
    else { var k = (faces - 2) / 2; row(depth, 'est-u'); for (var r = 0; r < k; r++) { gap(aisle); row(depth * 2, 'est-u'); } gap(aisle); row(depth, 'est-u'); }
    svg.innerHTML = '<rect x="0" y="10" width="' + W + '" height="' + (H - 20) + '" class="est-room"/>' + g;
  }
  function calc(){
    var W = num('w') * 12 + num('wi'), L = num('l') * 12 + num('li'), d = num('d'), a = num('a'), c = num('c'), lv = num('lv') || 1;
    if (!W || !L || !d || !a) { out.hidden = true; return; }
    var usable = L - c; if (usable <= 0) { out.hidden = true; return; }
    var k = Math.floor((W - 2 * d - a) / (2 * d + a)); var fixedFaces = k >= 0 ? 2 + 2 * k : (W >= d + a ? 1 : 0);
    var mobileFaces = Math.max(0, Math.floor((W - a) / d));
    var lfFixed = fixedFaces * usable / 12 * lv, lfMobile = mobileFaces * usable / 12 * lv;
    var gain = fixedFaces ? Math.round((mobileFaces / fixedFaces - 1) * 100) : 0;
    out.hidden = false;
    out.querySelector('[data-o=ff]').textContent = fixedFaces;
    out.querySelector('[data-o=mf]').textContent = mobileFaces;
    out.querySelector('[data-o=lff]').textContent = lfFixed.toLocaleString('en-US', {maximumFractionDigits:1});
    out.querySelector('[data-o=lfm]').textContent = lfMobile.toLocaleString('en-US', {maximumFractionDigits:1});
    out.querySelector('[data-o=gain]').textContent = gain > 0 ? '+' + gain + '%' : gain + '%';
    out.querySelector('[data-o=room]').textContent = ftin(W) + ' x ' + ftin(L);
    draw(document.getElementById('est-svg-f'), fixedFaces, d, a, W, false);
    draw(document.getElementById('est-svg-m'), mobileFaces, d, a, W, true);
    var summary = 'My room is ' + ftin(W) + ' wide by ' + ftin(L) + ' long, with ' + d + '" deep shelving, ' + a + '" aisles and ' + lv + ' shelf levels. The estimator shows ' + fixedFaces + ' fixed shelving faces vs ' + mobileFaces + ' on mobile carriages. What would you recommend?';
    document.getElementById('est-ask').setAttribute('data-chat-ask', summary);
    document.getElementById('est-book').href = 'contact.html?topic=assessment&room=' + encodeURIComponent(ftin(W) + ' x ' + ftin(L)) + '&faces=' + fixedFaces + '-' + mobileFaces;
  }
  f.addEventListener('input', calc); calc();
})();