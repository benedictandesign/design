# Web Portfolio

## Overview
This repository hosts an experimental portfolio site that combines a Three.js point cloud scene with interactive overlay panels for project highlights and biography content. A floating navigation bar lets visitors toggle between the live 3D background and curated sections, while individual project pages live under `works/` and reuse shared layout styles.

## Features
- WebGL-powered landing experience built with Three.js point clouds and orbital camera controls.
- Overlay navigation for Works and About sections, including note cards, project tiles, and profile imagery driven by `overlayData.js`.
- Modular project detail pages with hero imagery, Glide.js carousels, and embedded media.
- Shared styling in `workstyle.css` and `styles.css` to keep typography and layout consistent across the site.
- Import map setup so Three.js loads directly from `node_modules` without bundling.

## Getting Started
1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Run a static server from the project root** (any option below works):
   ```bash
   # Python
   python -m http.server 8000

   # or npx
   npx http-server . -p 8000

   # or serve
   npx serve .
   ```
3. **Open the site**
   Navigate to `http://localhost:8000/index.html` for the 3D landing page, or directly to any file under `works/` for standalone project views.

> **Note:** The import map in `index.html` expects `node_modules/three/` to exist, so ensure `npm install` runs before serving the site.

## Project Structure
- `index.html` � landing page with navigation, overlay container, and module entry point.
- `main.js` � bootstraps the Three.js scene, manages overlays, and handles navigation state.
- `scene.js`, `grid.js`, `pointCloudLoader.js`, `animation.js` � helper modules for initializing and animating the 3D environment.
- `overlayData.js` & `overlayRenderer.js` � data definitions and DOM helpers for Works/About overlays.
- `styles.css`, `workstyle.css` � global and project-specific styling.
- `works/` � individual project pages (each optional standalone entry point).
- `assets/portfolio/` � imagery referenced by project pages and overlays.

## Development Notes
- Use the definitions in `overlayData.js` to add or reposition note cards and project tiles without touching layout logic.
- Each `<glide-gallery>` custom element inside `works/` pages parses the `images` attribute (JSON array) and mounts a Glide.js carousel�keep the attribute valid JSON to avoid fallback parsing.
- When adding new media, optimise image dimensions and file sizes; all assets are loaded directly without lazy-loading.
- For custom scripting, stick to ES modules so imports remain compatible with the static import map setup.

## Maintenance Checklist
- [ ] reduce image sizes
- [ ] add image for neural palate kueh
- [ ] check for phone compatibility

## Useful Commands
- `npm install` � install dependencies (currently only Three.js).
- `python -m http.server 8000` � quick local preview without additional tooling.
- `npx http-server . -p 8000` � alternative static server with directory listing control.

## License
The repository keeps the default ISC license from `package.json`. Update this section if the project should use a different license.
