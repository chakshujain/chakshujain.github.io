# Chakshu Jain — Portfolio

A fast, dependency-free personal portfolio for a backend / fintech engineer.
Pure HTML, CSS and vanilla JS — no build step, no framework, no `node_modules`.

## Structure

```
.
├── index.html        # all content & markup
├── css/styles.css    # design system + layout + responsive
├── js/main.js        # scroll reveal, stat counters, scrollspy, network canvas
└── README.md
```

## Run locally

Any static server works. For example:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

or just open `index.html` directly in a browser.

## Deploy (any of these, all free)

- **GitHub Pages** — push to a repo, enable Pages on the `main` branch (root).
- **Netlify / Vercel / Cloudflare Pages** — drag-and-drop the folder, or connect the repo. No build command; publish directory is the root.

## Customize

- **Content** — everything lives in `index.html` (experience, projects, skills, contact).
- **Colors** — edit the CSS variables at the top of `css/styles.css` (`--accent`, `--grad`, etc.).
- **Stats** — the hero counters read from `data-count` / `data-suffix` attributes on `.stat__num`.
- **Add a photo** — drop an image in the hero if you want a headshot (the resume has one).

## Notes

- Fully responsive (desktop → mobile), keyboard-accessible nav, respects
  `prefers-reduced-motion`, and pauses the background animation when the tab is hidden.
- Fonts (Inter, Sora, JetBrains Mono) load from Google Fonts; everything else is local.
