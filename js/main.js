/* ============================================================
   Chakshu Jain — Portfolio interactions
   ============================================================ */
(function () {
  'use strict';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Year ---------- */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- Nav: scrolled state + mobile toggle ---------- */
  const nav = document.getElementById('nav');
  const toggle = document.getElementById('nav-toggle');
  const links = document.querySelector('.nav__links');

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 24);
    // scroll progress
    const h = document.documentElement;
    const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
    document.getElementById('scroll-progress').style.width = pct + '%';
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });
  links.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => {
      links.classList.remove('open');
      toggle.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    })
  );

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if (prefersReduced || !('IntersectionObserver' in window)) {
    revealEls.forEach((el) => el.classList.add('in'));
  } else {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: '0px 0px -8% 0px' }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  /* ---------- Animated stat counters ---------- */
  const formatCompact = (n) => {
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(n % 1_000_000 === 0 ? 0 : 1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K';
    return String(Math.round(n));
  };

  const runCounter = (el) => {
    const target = parseFloat(el.dataset.count);
    const decimals = parseInt(el.dataset.decimals || '0', 10);
    const suffix = el.dataset.suffix || '';
    const prefix = (el.dataset.prefix || '').replace('&lt;', '<');
    const compact = el.dataset.format === 'compact';
    const dur = 1600;
    const start = performance.now();

    const tick = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      const val = target * eased;
      el.textContent = prefix + (compact ? formatCompact(val) : val.toFixed(decimals)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = prefix + (compact ? formatCompact(target) : target.toFixed(decimals)) + suffix;
    };
    requestAnimationFrame(tick);
  };

  const stats = document.querySelectorAll('.stat__num');
  if (prefersReduced || !('IntersectionObserver' in window)) {
    stats.forEach((el) => {
      const prefix = (el.dataset.prefix || '').replace('&lt;', '<');
      const suffix = el.dataset.suffix || '';
      const t = parseFloat(el.dataset.count);
      el.textContent =
        prefix + (el.dataset.format === 'compact' ? formatCompact(t) : t.toFixed(parseInt(el.dataset.decimals || '0', 10))) + suffix;
    });
  } else {
    const statIO = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            runCounter(e.target);
            obs.unobserve(e.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    stats.forEach((el) => statIO.observe(el));
  }

  /* ---------- Active nav link on scroll (scrollspy) ---------- */
  const navLinks = [...document.querySelectorAll('.nav__links a')];
  const sections = navLinks
    .map((a) => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const id = '#' + e.target.id;
            navLinks.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === id));
          }
        });
      },
      { threshold: 0.25, rootMargin: '-30% 0px -55% 0px' }
    );
    sections.forEach((s) => spy.observe(s));
  }

  /* ---------- Network / particle canvas ---------- */
  const canvas = document.getElementById('net-canvas');
  if (canvas && !prefersReduced) {
    const ctx = canvas.getContext('2d');
    let w, h, nodes, raf;
    const DPR = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      w = canvas.width = window.innerWidth * DPR;
      h = canvas.height = window.innerHeight * DPR;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      const count = Math.min(70, Math.floor((window.innerWidth * window.innerHeight) / 22000));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.35 * DPR,
        vy: (Math.random() - 0.5) * 0.35 * DPR,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const linkDist = 140 * DPR;
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;

        ctx.beginPath();
        ctx.arc(n.x, n.y, 1.4 * DPR, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,229,168,0.55)';
        ctx.fill();

        for (let j = i + 1; j < nodes.length; j++) {
          const m = nodes[j];
          const dx = n.x - m.x, dy = n.y - m.y;
          const dist = Math.hypot(dx, dy);
          if (dist < linkDist) {
            const alpha = (1 - dist / linkDist) * 0.28;
            ctx.strokeStyle = `rgba(90,180,220,${alpha})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(m.x, m.y);
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };

    resize();
    draw();
    window.addEventListener('resize', () => { cancelAnimationFrame(raf); resize(); draw(); });

    // Pause when tab hidden (saves battery)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else draw();
    });
  }
})();
