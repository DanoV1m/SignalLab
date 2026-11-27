# Development guide

Use Node 22+ for dependency-free numerical tests and Python 3.12 for optional browser tests. No npm install is necessary. Run `npm test`, `npm run build` and both browser modes described in [verification](docs/quality/TEST_MATRIX.md). When runtime code changes, regenerate the portable example with `node scripts/build.cjs web/portable/SignalLab.html`.

Keep numerical functions independent of DOM and browser APIs. Document mathematical assumptions, add regression fixtures and state limitations. Never add unverified performance claims. Submit a PR against main; require current CI success and owner approval. Do not enable hosting or change license as part of unrelated work.
