# SignalLab · Engineering Virtual Labs 01

**An interactive, dependency-free digital signal processing workbench.** Generate, measure, filter and reconstruct sampled signals in your browser, then validate the theory through guided numerical experiments.

## Run locally

Clone this repository and open `index.html` in a modern browser, or open the portable `SignalLab.html`. For microphone access, serve it over localhost or HTTPS:

```sh
python -m http.server 8000
```

Open http://localhost:8000. To regenerate the portable edition, run `node build.cjs SignalLab.html` with Node 22. No npm install, backend or API key is required.

## Engineering features

| Workspace | Capabilities |
| --- | --- |
| Overview | Input source, dominant FFT bin, sample grid, output RMS, learning progress |
| Signal analyzer | Six waveform modes, dual-tone synthesis, seeded noise, FFT magnitude and phase, STFT, cursors, aliasing and Gibbs experiments |
| Filter design | Digital Butterworth low/high-pass (orders 1–8), cascaded band-pass, analytic Bode plots and z-plane stability |
| Signal mathematics | Complex IFFT, energy-ranked spectral reconstruction, full linear convolution |
| Engineering academy | Six reproducible guided experiments, optional hints, prediction checks, theory vs calculation, Markdown reports |

## Numerical design

The independent radix-2 FFT computes the DFT in O(N log N). The one-sided amplitude spectrum uses coherent-gain normalization. Butterworth filters use first- and second-order sections with a prewarped bilinear transform. The plotted response evaluates those same sections. The STFT uses overlapping windows; IFFT preserves conjugate pairs for real signals.

See [engineering notes](docs/ENGINEERING.md), [portfolio case study](docs/PORTFOLIO.md) and [verification report](docs/VERIFICATION.md).

## Verification

```sh
node --test test.cjs
node build.cjs SignalLab.html
node tests/benchmark.cjs
```

40 numerical regression tests passed locally. Chromium smoke checks passed for dashboard, analyzer, filter, mathematics, academy, report download, WAV/CSV, theme switch and five modules at 390 px. The CI workflow runs numerical tests, builds a static-site artifact, and runs a hosted Chromium smoke test including reload persistence and a synthetic microphone. Remote results are pending; the workflow does not deploy.

## Privacy and limitations

Processing is local, including audio decoding and microphone snapshots. Microphone access requires explicit browser permission. No analytics, accounts, network API, or remote audio storage are implemented. The imported file size limit is 25 MiB; decoded audio is checked after decoding, which cannot prevent initial decoder allocation. The UI is an educational instrument, not calibrated laboratory hardware. Filter state resets per record; continuous streaming and audio playback are not implemented. Browser support for compressed audio varies. Physical microphone, cross-browser support, prolonged browser load and formal accessibility/security audits remain unverified.

## Publication

See [release instructions](docs/RELEASE.md). No license has been selected. No public live-demo URL is claimed until deployment is verified.
