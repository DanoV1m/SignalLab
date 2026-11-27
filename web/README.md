# Web entry points

- `index.html`: modular browser application, with local scripts and styles in `../src/`.
- `portable/SignalLab.html`: standalone HTML snapshot, without external runtime assets.

From the repository root, run `npm run serve` and open http://localhost:8000/web/. Alternatively open the portable HTML directly. To regenerate it, run `node scripts/build.cjs web/portable/SignalLab.html`. The default `npm run build` emits the deployment-ready `dist/index.html` (ignored by Git). No hosting is activated by this build.
