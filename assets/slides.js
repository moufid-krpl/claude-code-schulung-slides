/* ============================================================
   CLAUDE-CODE-SCHULUNG — Player-Engine
   Eine Engine für alle Lesson-Decks. Erwartet:
     <div id="fswrap"><div class="stage" data-path="lesson-03" tabindex="0">
       <section class="slide" data-title="Titel">…</section> …
     </div></div>
   Erzeugt selbst: HUD (Pfad + Zähler), Progress-Bar,
   Folien-Übersicht (G), Steuerleiste, Tastatur- & Klick-Navigation,
   Vollbild (F), Deep-Link per #Foliennummer.
   ============================================================ */
(function () {
  var fsw = document.getElementById('fswrap');
  if (!fsw) return;
  var stage = fsw.querySelector('.stage');
  var slides = Array.prototype.slice.call(stage.querySelectorAll('.slide'));
  if (!slides.length) return;
  var cur = 0;

  /* ---------- HUD + Progress ---------- */
  var hud = document.createElement('div');
  hud.className = 'hud';
  var lessonPath = stage.getAttribute('data-path') || 'lesson';
  hud.innerHTML = '<span class="path">claude-code-schulung <span class="chev">❯</span> ' + lessonPath +
    '</span><span class="count">01 / ' + pad(slides.length) + '</span>';
  stage.appendChild(hud);
  var countEl = hud.querySelector('.count');

  var ptrack = document.createElement('div');
  ptrack.className = 'ptrack';
  ptrack.innerHTML = '<div class="pfill"></div>';
  stage.appendChild(ptrack);
  var pfill = ptrack.querySelector('.pfill');

  /* ---------- Folien-Übersicht (Overlay) ---------- */
  var ov = document.createElement('div');
  ov.className = 'ov';
  var ovHtml = '<h4>folien-übersicht — klicken zum springen</h4>';
  slides.forEach(function (s, i) {
    var t = s.getAttribute('data-title') || ('Folie ' + (i + 1));
    ovHtml += '<button data-i="' + i + '"><span class="n">' + pad(i + 1) + '</span> ' + t + '</button>';
  });
  ov.innerHTML = ovHtml;
  stage.appendChild(ov);

  /* ---------- Steuerleiste unter der Bühne ---------- */
  var ctrl = document.createElement('div');
  ctrl.className = 'ctrl';
  ctrl.innerHTML =
    '<button class="btn" data-act="prev" aria-label="Vorherige Folie">‹ Zurück</button>' +
    '<button class="btn primary" data-act="next" aria-label="Nächste Folie">Weiter ›</button>' +
    '<button class="btn" data-act="grid">Übersicht</button>' +
    '<button class="btn" data-act="fs">⛶ Vollbild</button>' +
    '<span class="keys"><b>←</b> <b>→</b> <b>Leertaste</b> navigieren · <b>F</b> Vollbild · <b>G</b> Übersicht</span>';
  fsw.parentNode.insertBefore(ctrl, fsw.nextSibling);

  /* ---------- Kernfunktionen ---------- */
  function pad(n) { return (n < 10 ? '0' : '') + n; }
  function show(i) {
    if (i < 0) i = 0;
    if (i > slides.length - 1) i = slides.length - 1;
    slides[cur].classList.remove('on');
    cur = i;
    slides[cur].classList.add('on');
    countEl.textContent = pad(cur + 1) + ' / ' + pad(slides.length);
    pfill.style.width = ((cur + 1) / slides.length * 100) + '%';
    var btns = ov.querySelectorAll('button');
    for (var b = 0; b < btns.length; b++) btns[b].classList.toggle('cur', b === cur);
    try { history.replaceState(null, '', '#' + (cur + 1)); } catch (e) { /* file:// Edgecases */ }
  }
  function next() { show(cur + 1); }
  function prev() { show(cur - 1); }
  function toggleOv() { ov.classList.toggle('on'); }
  function fs() {
    if (document.fullscreenElement) { document.exitFullscreen(); }
    else if (fsw.requestFullscreen) { fsw.requestFullscreen(); }
    stage.focus();
  }

  /* ---------- Events ---------- */
  ctrl.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var act = b.getAttribute('data-act');
    if (act === 'next') next();
    else if (act === 'prev') prev();
    else if (act === 'grid') toggleOv();
    else if (act === 'fs') fs();
  });
  ov.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    if (b) { show(parseInt(b.getAttribute('data-i'), 10)); ov.classList.remove('on'); }
  });
  stage.addEventListener('click', function (e) {
    if (ov.classList.contains('on')) return;
    var r = stage.getBoundingClientRect();
    (e.clientX - r.left) > r.width * 0.35 ? next() : prev();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); next(); }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); prev(); }
    else if (e.key === 'Home') { e.preventDefault(); show(0); }
    else if (e.key === 'End') { e.preventDefault(); show(slides.length - 1); }
    else if (e.key === 'f' || e.key === 'F') { fs(); }
    else if (e.key === 'g' || e.key === 'G') { toggleOv(); }
    else if (e.key === 'Escape') { ov.classList.remove('on'); }
  });

  /* ---------- Start (Deep-Link #n) ---------- */
  slides.forEach(function (s) { s.classList.remove('on'); });
  var h = parseInt((location.hash || '').replace('#', ''), 10);
  slides[0].classList.add('on');
  show(!isNaN(h) && h >= 1 && h <= slides.length ? h - 1 : 0);
  stage.focus();
})();
