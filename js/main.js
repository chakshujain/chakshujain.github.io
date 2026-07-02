/* ============================================================
   CHAKSHU JAIN — UI interactions
   Preloader, smooth scroll, reveals, counters, tilt, cursor.
   ============================================================ */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var hasGsap = typeof gsap !== 'undefined';
  if (hasGsap && typeof ScrollTrigger !== 'undefined') gsap.registerPlugin(ScrollTrigger);

  /* ---------- preloader ---------- */
  function formatCount(el, v) {
    if (el.dataset.format === 'compact') {
      return new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(Math.round(v));
    }
    return v.toFixed(parseInt(el.dataset.decimals || '0', 10));
  }

  var loader = document.getElementById('loader');
  var loaderBar = document.getElementById('loaderBar');
  var loaderPct = document.getElementById('loaderPct');
  var progress = { v: 0 };
  var loaderDone = false;

  function finishLoader() {
    if (loaderDone) return;
    loaderDone = true;
    loader.classList.add('done');
    document.body.classList.add('loaded');
    playIntro();
  }

  if (hasGsap && !reduceMotion) {
    gsap.to(progress, {
      v: 100,
      duration: 1.6,
      ease: 'power2.inOut',
      onUpdate: function () {
        var p = Math.round(progress.v);
        loaderBar.style.width = p + '%';
        loaderPct.textContent = (p < 10 ? '0' : '') + p;
      },
      onComplete: finishLoader,
    });
    // safety: never hold the page hostage
    setTimeout(finishLoader, 4000);
  } else {
    finishLoader();
  }

  /* ---------- intro (hero) ---------- */
  function playIntro() {
    if (!hasGsap || reduceMotion) {
      document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('shown'); });
      document.querySelectorAll('.count').forEach(function (el) {
        el.textContent = formatCount(el, parseFloat(el.dataset.count)) + (el.dataset.suffix || '');
      });
      return;
    }
    var tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
    tl.from('.hero__title .word', { yPercent: 120, duration: 1.1, stagger: 0.12 }, 0.1)
      .to('.hero .reveal', {
        opacity: 1, y: 0, duration: 1, stagger: 0.1,
        onComplete: function () {
          document.querySelectorAll('.hero .reveal').forEach(function (el) { el.classList.add('shown'); });
        },
      }, 0.5);
    initScrollAnimations();
  }

  /* ---------- smooth scroll (Lenis) ---------- */
  var lenis = null;
  if (typeof Lenis !== 'undefined' && !reduceMotion) {
    lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1.0 });
    function rafLenis(time) {
      lenis.raf(time);
      requestAnimationFrame(rafLenis);
    }
    requestAnimationFrame(rafLenis);
    if (hasGsap && typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
    }
  }

  // anchor links through lenis
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      closeMenu();
      if (lenis) lenis.scrollTo(target, { offset: -20, duration: 1.4 });
      else target.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  });

  /* ---------- scroll-driven animations ---------- */
  function initScrollAnimations() {
    if (!hasGsap || typeof ScrollTrigger === 'undefined') return;

    // reveals outside the hero
    document.querySelectorAll('.reveal').forEach(function (el) {
      if (el.closest('.hero')) return;
      gsap.to(el, {
        opacity: 1, y: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        onComplete: function () { el.classList.add('shown'); },
      });
    });

    // contact big title words
    gsap.from('.contact__title .word', {
      yPercent: 120, duration: 1, stagger: 0.1, ease: 'power4.out',
      scrollTrigger: { trigger: '.contact__title', start: 'top 80%', once: true },
    });

    // top scroll progress bar
    gsap.to('#scrollProgress', {
      scaleX: 1, ease: 'none',
      scrollTrigger: { trigger: document.body, start: 'top top', end: 'bottom bottom', scrub: 0.3 },
    });

    // counters
    document.querySelectorAll('.count').forEach(function (el) {
      var target = parseFloat(el.dataset.count);
      var suffix = el.dataset.suffix || '';
      var obj = { v: 0 };
      gsap.to(obj, {
        v: target, duration: 2, ease: 'power2.out',
        scrollTrigger: { trigger: el, start: 'top 92%', once: true },
        onUpdate: function () { el.textContent = formatCount(el, obj.v) + suffix; },
        onComplete: function () { el.textContent = formatCount(el, target) + suffix; },
      });
    });

    // nav active link
    document.querySelectorAll('main section[id]').forEach(function (sec) {
      ScrollTrigger.create({
        trigger: sec, start: 'top 40%', end: 'bottom 40%',
        onToggle: function (self) {
          if (!self.isActive) return;
          document.querySelectorAll('.nav__links a').forEach(function (a) {
            a.classList.toggle('active', a.getAttribute('href') === '#' + sec.id);
          });
        },
      });
    });
  }
  if (reduceMotion) {
    document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('shown'); });
  }

  /* ---------- nav ---------- */
  var nav = document.getElementById('nav');
  var navLinks = document.getElementById('navLinks');
  var burger = document.getElementById('burger');

  function onScroll() {
    nav.classList.toggle('scrolled', window.scrollY > 30);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function closeMenu() {
    navLinks.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
  }
  burger.addEventListener('click', function () {
    var open = navLinks.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });

  /* ---------- IST clock ---------- */
  var clockEl = document.getElementById('clock');
  function tickClock() {
    clockEl.textContent = new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Kolkata',
    }).format(new Date());
  }
  tickClock();
  setInterval(tickClock, 30000);

  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---------- custom cursor ---------- */
  if (finePointer && !reduceMotion) {
    var cursor = document.getElementById('cursor');
    var ring = document.getElementById('cursorRing');
    var cx = -100, cy = -100, rx = -100, ry = -100;

    window.addEventListener('pointermove', function (e) {
      cx = e.clientX; cy = e.clientY;
      cursor.style.transform = 'translate(' + (cx - 4) + 'px,' + (cy - 4) + 'px)';
    }, { passive: true });

    (function animateRing() {
      rx += (cx - rx) * 0.16;
      ry += (cy - ry) * 0.16;
      ring.style.transform = 'translate(' + (rx - ring.offsetWidth / 2) + 'px,' + (ry - ring.offsetHeight / 2) + 'px)';
      requestAnimationFrame(animateRing);
    })();

    document.querySelectorAll('[data-hover]').forEach(function (el) {
      el.addEventListener('pointerenter', function () { ring.classList.add('is-hover'); });
      el.addEventListener('pointerleave', function () { ring.classList.remove('is-hover'); });
    });
  }

  /* ---------- 3D tilt cards ---------- */
  if (finePointer && !reduceMotion) {
    document.querySelectorAll('[data-tilt]').forEach(function (card) {
      var bounds = null;
      card.addEventListener('pointerenter', function () {
        bounds = card.getBoundingClientRect();
      });
      card.addEventListener('pointermove', function (e) {
        if (!bounds) bounds = card.getBoundingClientRect();
        var px = (e.clientX - bounds.left) / bounds.width - 0.5;
        var py = (e.clientY - bounds.top) / bounds.height - 0.5;
        card.style.transform =
          'perspective(900px) rotateX(' + (-py * 7) + 'deg) rotateY(' + (px * 9) + 'deg) translateZ(6px)';
      });
      card.addEventListener('pointerleave', function () {
        card.style.transition = 'transform .6s cubic-bezier(.16,1,.3,1)';
        card.style.transform = 'perspective(900px) rotateX(0) rotateY(0) translateZ(0)';
        setTimeout(function () { card.style.transition = ''; }, 600);
        bounds = null;
      });
    });
  }

  /* ---------- magnetic buttons ---------- */
  if (finePointer && !reduceMotion && hasGsap) {
    document.querySelectorAll('.magnetic').forEach(function (el) {
      var strength = 26;
      el.addEventListener('pointermove', function (e) {
        var b = el.getBoundingClientRect();
        var x = e.clientX - (b.left + b.width / 2);
        var y = e.clientY - (b.top + b.height / 2);
        gsap.to(el, { x: (x / b.width) * strength, y: (y / b.height) * strength, duration: 0.4, ease: 'power3.out' });
      });
      el.addEventListener('pointerleave', function () {
        gsap.to(el, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.4)' });
      });
    });
  }
})();
