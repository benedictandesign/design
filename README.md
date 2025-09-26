# Web Portfolio

## Overview
This repository hosts an experimental portfolio site that combines a Three.js point cloud scene with interactive overlay panels for project highlights and biography content. A floating navigation bar lets visitors toggle between the live 3D background and curated sections, while individual project pages live under `works/` and reuse shared layout styles.

## Features
- WebGL-powered landing experience built with Three.js point clouds and orbital camera controls.
- Overlay navigation for Works and About sections, including note cards, project tiles, and profile imagery driven by `overlayData.js`.
- Modular project detail pages with hero imagery, Glide.js carousels, and embedded media.
- Shared styling in `workstyle.css` and `styles.css` to keep typography and layout consistent across the site.
- Import map loads Three.js from the CDN (unpkg), no bundler required.

## Run A Static Server (Local Preview)
- ES modules and import maps require HTTP(S). Opening `index.html` directly with `file://` will fail due to browser module security.
- Any simple static server works. Pick one of the options below from the project root:

1) Python 3 (cross‑platform)
   ```bash
   # macOS/Linux
   python3 -m http.server 8000
   # Windows (either of these)
   py -m http.server 8000
   python -m http.server 8000
   ```

2) Node.js (no install, via npx)
   ```bash
   npx http-server . -p 8000
   # or
   npx serve -p 8000 .
   ```

3) VS Code Live Server (GUI)
- Install the "Live Server" extension, right‑click `index.html` → "Open with Live Server".

Then open:
- `http://localhost:8000/` (landing page) or any URL under `works/` for standalone project views.

Notes:
- The site loads Three.js from unpkg; an internet connection is required for local preview. For offline dev, vendor the files or map imports to local copies.
- GitHub Pages can host this repo as‑is; no build step is required.

## Project Structure
- `index.html` — landing page with navigation, overlay container, and module entry point.
- `main.js` — bootstraps the Three.js scene, manages overlays, and handles navigation state.
- `scene.js`, `grid.js`, `pointCloudLoader.js`, `animation.js` — helper modules for initializing and animating the 3D environment.
- `overlayData.js` & `overlayRenderer.js` — data definitions and DOM helpers for Works/About overlays.
- `styles.css`, `workstyle.css` — global and project-specific styling.
- `works/` — individual project pages (each optional standalone entry point).
- `assets/portfolio/` — imagery referenced by project pages and overlays.

## Development Notes
- Use the definitions in `overlayData.js` to add or reposition note cards and project tiles without touching layout logic.
- When adding new media, optimize image dimensions and file sizes; all assets are loaded directly without lazy‑loading.
- For custom scripting, stick to ES modules so imports remain compatible with the static import map setup.

## Maintenance Checklist
- [ ] reduce image sizes
- [ ] add image for neural palate kueh
- [ ] check for phone compatibility

## Useful Commands
- `python -m http.server 8000` — quick local preview without additional tooling.
- `npx http-server . -p 8000` — alternative static server with directory listing control.
- `npx serve -p 8000 .` — another simple static server.

## License
The repository keeps the default ISC license from `package.json`. Update this section if the project should use a different license.
