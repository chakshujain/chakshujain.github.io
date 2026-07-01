/* ============================================================
   Chakshu Jain — "Statement of Work" interactions
   ============================================================ */
(function () {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- Live clock (New Delhi, IST) ---------- */
  const clock = document.getElementById('clock');
  const tick = () => {
    try {
      const t = new Intl.DateTimeFormat('en-GB', {
        timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
      }).format(new Date());
      clock.textContent = t + ' IST';
    } catch (e) { clock.textContent = ''; }
  };
  tick(); setInterval(tick, 1000);

  /* ---------- Top bar: hide on scroll-down, progress ---------- */
  const topbar = document.getElementById('topbar');
  const progress = document.getElementById('progress');
  let lastY = 0;
  const onScroll = () => {
    const y = window.scrollY;
    topbar.classList.toggle('hide', y > 240 && y > lastY);
    lastY = y;
    const h = document.documentElement;
    progress.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100 + '%';
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  const burger = document.getElementById('burger');
  const nav = document.querySelector('.topbar__nav');
  burger.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
  });
  nav.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
    nav.classList.remove('open'); burger.classList.remove('open');
  }));

  /* ---------- Headline clip-reveal ---------- */
  const lines = document.querySelectorAll('.reveal-line > span');
  if (reduced) lines.forEach((l) => l.classList.add('in'));
  else {
    // stagger in on load
    window.addEventListener('load', () => {
      lines.forEach((l, i) => setTimeout(() => l.classList.add('in'), 120 + i * 110));
    });
    // fallback if load already fired
    setTimeout(() => lines.forEach((l, i) => { if (!l.classList.contains('in')) setTimeout(() => l.classList.add('in'), i * 110); }), 400);
  }

  /* ---------- Reveal on scroll ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if (reduced || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    reveals.forEach((el) => io.observe(el));
  }

  /* ---------- Count-up figures ---------- */
  const compact = (n) => {
    if (n >= 1e6) return (n / 1e6).toFixed(n % 1e6 === 0 ? 0 : 1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(0) + 'K';
    return String(Math.round(n));
  };
  const render = (el, val) => {
    const dec = parseInt(el.dataset.decimals || '0', 10);
    const suf = el.dataset.suffix || '';
    el.textContent = (el.dataset.format === 'compact' ? compact(val) : val.toFixed(dec)) + suf;
  };
  const run = (el) => {
    const target = parseFloat(el.dataset.count), start = performance.now(), dur = 1500;
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      render(el, target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step); else render(el, target);
    };
    requestAnimationFrame(step);
  };
  const counts = document.querySelectorAll('.count');
  if (reduced || !('IntersectionObserver' in window)) {
    counts.forEach((el) => render(el, parseFloat(el.dataset.count)));
  } else {
    const cio = new IntersectionObserver((entries, obs) => {
      entries.forEach((e) => { if (e.isIntersecting) { run(e.target); obs.unobserve(e.target); } });
    }, { threshold: 0.7 });
    counts.forEach((el) => cio.observe(el));
  }

  /* ---------- Scrollspy ---------- */
  const navLinks = [...document.querySelectorAll('.topbar__nav a')];
  const secs = navLinks.map((a) => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          const id = '#' + e.target.id;
          navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === id));
        }
      });
    }, { rootMargin: '-40% 0px -55% 0px' });
    secs.forEach((s) => spy.observe(s));
  }
})();
