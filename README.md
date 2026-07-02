# Chakshu Jain — Portfolio

An immersive **3D portfolio** for a backend / fintech engineer, themed as
**"money rails"** — a full-screen WebGL scene of particle streams flowing along
glowing transaction rails, with a scroll-driven camera, mouse parallax, kinetic
typography, 3D-tilting glass cards, animated counters, a custom cursor and
buttery smooth scrolling.

Static HTML, CSS and JS — no build step, no `node_modules`. Three.js, GSAP and
Lenis load from CDNs. Live at **https://chakshujain.github.io**

## Structure

```
.
├── index.html         # all content & markup (import map for Three.js)
├── css/styles.css     # dark design system, glass cards, responsive layout
├── js/scene.js        # Three.js scene: rails, particles, core, scroll camera
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
- **3D scene** — tune rail shapes, particle counts and camera choreography in `js/scene.js`
  (`RAILS`, `PER_RAIL`, and the scroll section of `tick()`).

## Notes

- Fully responsive; mobile gets reduced particle counts and no custom cursor.
- Respects `prefers-reduced-motion` (static scene, no animations) and pauses
  rendering when the tab is hidden.
- Degrades gracefully if a CDN fails: content reveals and counters still render
  without GSAP/Lenis/Three.js.
