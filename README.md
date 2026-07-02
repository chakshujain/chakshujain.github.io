# Chakshu Jain — Portfolio

An immersive **3D portfolio** for a backend / fintech engineer — a full-screen
WebGL **particle-wave field** (a dark ocean of light with an emerald glow,
shader-driven so it costs no CPU per frame), with a scroll-eased camera, a
cursor-following ripple, kinetic typography, 3D-tilting glass cards, animated
counters, a custom cursor and buttery smooth scrolling.

Static HTML, CSS and JS — no build step, no `node_modules`. Three.js, GSAP and
Lenis load from CDNs. Live at **https://chakshujain.github.io**

## Structure

```
.
├── index.html         # all content & markup (import map for Three.js)
├── css/styles.css     # dark design system, glass cards, responsive layout
├── js/scene.js        # Three.js scene: shader wave field, dust, scroll camera
├── js/main.js         # preloader, GSAP reveals, counters, tilt, cursor, nav
├── assets/chakshu.jpg # headshot
└── README.md
```

## Run locally

Needs a static server (ES modules don't run from `file://`):

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deploy (any of these, all free)

- **GitHub Pages** — push to the repo, Pages serves the `main` branch root (`.nojekyll` is already there).
- **Netlify / Vercel / Cloudflare Pages** — connect the repo; no build command, publish directory is the root.

## Customize

- **Content** — everything lives in `index.html` (experience, systems, builds, skills, contact).
- **Colors** — edit the CSS variables at the top of `css/styles.css` (`--accent`, `--accent-2`, `--gold`).
- **Counters** — read from `data-count` / `data-decimals` / `data-suffix` attributes on `.count`.
- **3D scene** — tune grid density (`COLS`/`ROWS`), wave shape (vertex shader) and
  camera choreography (the scroll section of `tick()`) in `js/scene.js`.
- **Screenshot/debug hooks** — `?nofx` disables all animations; `?shot=N` shifts
  the page up N px (useful for headless captures).

## Notes

- Fully responsive; mobile gets reduced particle counts and no custom cursor.
- Respects `prefers-reduced-motion` (static scene, no animations) and pauses
  rendering when the tab is hidden.
- Degrades gracefully if a CDN fails: content reveals and counters still render
  without GSAP/Lenis/Three.js.
