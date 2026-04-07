# Personal Site

Astro + Tailwind CSS, deployed to Cloudflare Pages.

## Commands

```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

## Stack

- **Astro** (server-rendered, `output: "server"`)
- **Tailwind CSS v4** (via `@tailwindcss/vite`)
- **Cloudflare Pages** (via `@astrojs/cloudflare` adapter)

## Key Files

| File | Purpose |
|------|---------|
| `astro.config.mjs` | Astro config with Cloudflare adapter and Tailwind Vite plugin |
| `src/layouts/Layout.astro` | Base HTML layout |
| `src/styles/global.css` | Global styles — imports Tailwind |
| `src/pages/` | Astro pages (all server-rendered) |
