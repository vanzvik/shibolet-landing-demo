/* Shibolet demo — interactions (no dependencies) */
(function () {
  'use strict';
  var doc = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var clamp = function (v, a, b) { return Math.min(b, Math.max(a, v)); };

  /* ---------- deterministic random ---------- */
  function rng(seed) { return function () { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }
  var SRC_COLORS = ['#7a2e2a', '#1f3a4d', '#2f4a3a', '#b5552f', '#5a4a6b', '#3b2f2a', '#8a6a2a', '#24323a', '#6b2f45'];
  function spine(kind, r, opts) {
    opts = opts || {};
    var el = document.createElement('span');
    el.className = 'spine ' + kind;
    var lbl = document.createElement('span');
    lbl.className = 'lbl';
    if (kind === 'tr') { lbl.textContent = opts.label === false ? '' : 'שיבולת'; el.style.setProperty('--h', (opts.hMin + r() * (opts.hMax - opts.hMin)).toFixed(0) + (opts.unit || 'px')); }
    else if (kind === 'mag') { lbl.textContent = opts.label === false ? '' : 'השילוח'; el.style.setProperty('--h', (opts.hMax * 0.98).toFixed(0) + (opts.unit || 'px')); }
    else { el.style.setProperty('--c', SRC_COLORS[Math.floor(r() * SRC_COLORS.length)]); el.style.setProperty('--h', (opts.hMin + r() * (opts.hMax - opts.hMin)).toFixed(0) + (opts.unit || 'px')); }
    if (opts.flex) { el.style.flex = (kind === 'mag' ? 0.5 : 0.9 + r() * 0.35).toFixed(2) + ' 1 0'; el.style.width = 'auto'; el.style.minWidth = '0'; }
    else { el.style.setProperty('--w', (kind === 'mag' ? 12 : 22 + Math.round(r() * 8)) + 'px'); }
    el.style.setProperty('--rot', ((r() - 0.5) * 24).toFixed(1) + 'deg');
    el.appendChild(lbl);
    return el;
  }
  function quarterSet(r) { // 2 translated (Shibolet series) + 2 source + magazine, shuffled lightly
    var a = ['tr', 'src', 'tr', 'src'];
    if (r() > 0.5) a = ['src', 'tr', 'tr', 'src'];
    a.splice(Math.floor(r() * 5), 0, 'mag');
    return a;
  }

  /* ---------- HERO noise → quiet ---------- */
  var hero = $('#hero');
  var heroTimer;
  function aimCards() {
    var book = $('.book-wrap', hero).getBoundingClientRect();
    var h = hero.getBoundingClientRect();
    var cx = book.left + book.width / 2 - h.left, cy = book.top + book.height * 0.55 - h.top;
    $$('.ncard', hero).forEach(function (c) {
      var x = c.offsetLeft + c.offsetWidth / 2, y = c.offsetTop + c.offsetHeight / 2;
      c.style.setProperty('--tx', (cx - x).toFixed(0) + 'px');
      c.style.setProperty('--ty', (cy - y).toFixed(0) + 'px');
    });
  }
  function toQuiet() {
    clearTimeout(heroTimer);
    if (hero.dataset.state === 'quiet') return;
    aimCards();
    hero.dataset.state = 'quiet';
    doc.classList.add('hero-quiet');
  }
  function toNoise() {
    hero.dataset.state = 'noise';
    doc.classList.remove('hero-quiet');
    clearTimeout(heroTimer);
    heroTimer = setTimeout(toQuiet, 2300);
  }
  if (reduce) { hero.dataset.state = 'quiet'; doc.classList.add('hero-quiet'); }
  else {
    toNoise();
    ['wheel', 'touchstart', 'keydown'].forEach(function (ev) {
      window.addEventListener(ev, function once() { setTimeout(toQuiet, 350); window.removeEventListener(ev, once); }, { passive: true });
    });
  }
  $('.replay', hero).addEventListener('click', function () { window.scrollTo(0, 0); toNoise(); });
  window.addEventListener('resize', function () { if (hero.dataset.state === 'quiet') aimCards(); });

  /* ---------- build block 3 bookcase ---------- */
  var bookcase = $('#bookcase');
  var r3 = rng(7);
  var rows = $$('.plank-row', bookcase);
  var shelfSpines = [];
  var mobile = window.innerWidth < 760;
  for (var q = 1; q <= 4; q++) {
    var row = rows[q <= 2 ? 0 : 1];
    quarterSet(r3).forEach(function (k, i) {
      var s = spine(k, r3, { hMin: mobile ? 76 : 100, hMax: mobile ? 104 : 136 });
      if (!mobile) s.style.setProperty('--w', (k === 'mag' ? 16 : 32 + Math.round(r3() * 10)) + 'px');
      s.dataset.q = q;
      s.style.setProperty('--dl', (i * 0.09) + 's');
      row.appendChild(s);
      shelfSpines.push(s);
    });
  }
  // lean the very last book for a physical feel, add bookends
  shelfSpines[shelfSpines.length - 1].classList.add('lean');
  rows.forEach(function (row, idx) {
    var end = document.createElement('span');
    end.className = 'bookend';
    end.setAttribute('aria-hidden', 'true');
    end.innerHTML = idx === 0
      ? '<svg viewBox="0 0 40 70" width="34" height="60"><path d="M10 70h20l-3-26H13z" fill="#c8962e"/><g stroke="#d8a845" stroke-width="2" fill="none" stroke-linecap="round"><path d="M20 44V8M14 40c-6-8-8-18-6-26M26 40c6-8 8-18 6-26"/></g><g fill="#d8a845"><ellipse cx="20" cy="10" rx="3" ry="6"/><ellipse cx="9" cy="16" rx="2.5" ry="5" transform="rotate(-20 9 16)"/><ellipse cx="31" cy="16" rx="2.5" ry="5" transform="rotate(20 31 16)"/></g></svg>'
      : '<svg viewBox="0 0 50 40" width="46" height="36"><rect x="2" y="28" width="46" height="10" fill="#efe3c8"/><rect x="5" y="18" width="40" height="10" fill="#7a2e2a"/><rect x="3" y="8" width="44" height="10" fill="#1f3a4d"/><rect x="2" y="28" width="46" height="2" fill="#b98a2c"/></svg>';
    row.appendChild(end);
  });

  var shelfScroll = $('#shelfScroll'), parcel = $('#parcel'), qNum = $('#qNum'), qNote = $('#qNote'), hint = $('.shelf-hint');
  var lastQ = -1;
  var NOTES = ['4 ספרים + מגזין השילוח', 'החבילה הראשונה על המדף', 'רבעון אחרי רבעון', 'המדף מתמלא', 'שנה על המדף'];
  function setQuarter(qv) {
    if (qv === lastQ) return;
    if (qv > lastQ && qv > 1 && !reduce) { parcel.classList.remove('deliver'); void parcel.offsetWidth; parcel.classList.add('deliver'); }
    lastQ = qv;
    qNum.textContent = qv;
    qNote.textContent = NOTES[qv];
    shelfSpines.forEach(function (s) { s.classList.toggle('in', +s.dataset.q <= qv); });
    hint.style.opacity = qv >= 4 ? 0 : 1;
  }

  /* ---------- build block 5 library case ---------- */
  var caseEl = $('#case'), growth = $('#growth');
  var r5 = rng(42);
  var caseRows = $$('.case-row', caseEl);
  var caseSpines = [];
  caseRows.forEach(function (row, ri) {
    var n = 0;
    for (var qq = 0; qq < 4; qq++) {
      quarterSet(r5).forEach(function (k) {
        var s = spine(k, r5, { hMin: 70, hMax: 96, unit: '%', flex: true, label: false });
        s.dataset.year = ri + 1;
        s.style.setProperty('--dl', (n++ * 0.025) + 's');
        row.appendChild(s);
        caseSpines.push(s);
      });
    }
  });
  var userPicked = false;
  function setYears(y) {
    growth.dataset.y = y;
    caseEl.dataset.years = y;
    $$('.seg button', growth).forEach(function (b) { var on = +b.dataset.years === y; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
    caseSpines.forEach(function (s) { s.classList.toggle('in', +s.dataset.year <= y); });
  }
  $$('.seg button', growth).forEach(function (b) { b.addEventListener('click', function () { userPicked = true; setYears(+b.dataset.years); }); });
  growth.dataset.y = 1;

  /* ---------- reveal on scroll ---------- */
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    $$('.reveal').forEach(function (el) { io.observe(el); });
    var gio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) {
          gio.unobserve(e.target);
          setYears(1);
          setTimeout(function () { if (!userPicked) setYears(3); }, 2400);
        }
      });
    }, { threshold: 0.45 });
    gio.observe(caseEl);
  } else {
    $$('.reveal').forEach(function (el) { el.classList.add('in'); });
    setYears(3);
  }

  /* ---------- scroll loop ---------- */
  var steps = $('#steps'), stepItems = $$('li', steps);
  var bookWrap = $('.book-wrap', hero), heroCopy = $('.hero-copy', hero);
  var sticky = $('#stickyCta'), foot = $('.site-foot');
  var ticking = false;
  var visibleCtas = 0;
  if ('IntersectionObserver' in window) {
    var cio = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var was = e.target._vis || false;
        if (e.isIntersecting !== was) { e.target._vis = e.isIntersecting; visibleCtas += e.isIntersecting ? 1 : -1; }
      });
      onScroll();
    }, { threshold: 0.6 });
    $$('main .cta-pair .btn, .plan .btn, .duo-card .btn').forEach(function (b) { if (!b.closest('#hero')) cio.observe(b); });
  }
  function onScroll() {
    ticking = false;
    var vh = window.innerHeight, y = window.scrollY;
    doc.classList.toggle('scrolled', y > 40);
    if (y > 30 && hero.dataset.state !== 'quiet') toQuiet();

    // hero parallax (quiet depth)
    var hp = clamp(y / vh, 0, 1);
    if (!reduce) {
      bookWrap.style.transform = 'translateY(' + (hp * -40).toFixed(1) + 'px) scale(' + (1 + hp * 0.18).toFixed(3) + ')';
      heroCopy.style.transform = 'translateY(' + (hp * 60).toFixed(1) + 'px)';
      heroCopy.style.opacity = (1 - hp * 0.9).toFixed(3);
    }

    // steps progress
    var sr = steps.getBoundingClientRect();
    var fill = clamp((vh * 0.6 - sr.top) / sr.height, 0, 1);
    steps.style.setProperty('--fill', fill.toFixed(3));
    stepItems.forEach(function (li) { li.classList.toggle('on', li.getBoundingClientRect().top < vh * 0.62); });

    // package → shelf
    var rr = shelfScroll.getBoundingClientRect();
    var p = clamp(-rr.top / (rr.height - vh), 0, 1);
    parcel.classList.toggle('open', p > 0.04 || rr.top < vh * 0.15);
    var qv = p < 0.12 ? 0 : Math.min(4, Math.floor((p - 0.12) / 0.18) + 1);
    if (rr.top > vh) qv = 0;
    setQuarter(qv);

    // sticky CTA (mobile)
    var fr = foot.getBoundingClientRect();
    sticky.classList.toggle('show', y > vh * 0.85 && fr.top > vh - 40 && visibleCtas === 0);
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll);
  setQuarter(0);
  onScroll();
})();
