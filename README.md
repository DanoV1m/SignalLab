<p align="center"><img src="assets/diagrams/banner.svg" alt="SignalLab — Digital signal processing workbench" width="960"></p>

# SignalLab | Engineering Virtual Labs 01

**A browser-native digital signal processing laboratory for electrical engineering.** Explore the relationship between mathematical theory and numerical behavior: synthesize signals, analyze spectra, design digital filters, reconstruct signals and complete reproducible experiments.

[![DSP tests and build](https://github.com/DanoV1m/SignalLab/actions/workflows/test.yml/badge.svg?branch=main)](https://github.com/DanoV1m/SignalLab/actions/workflows/test.yml)

[Architecture](docs/architecture/README.md) · [Engineering theory](docs/ENGINEERING.md) · [Experiments](docs/experiments/README.md) · [Verification](docs/VERIFICATION.md) · [Portfolio case study](docs/PORTFOLIO.md)

## 01 / Project overview

| Instrument | Engineering scope |
| --- | --- |
| Overview dashboard | Sample source, dominant FFT bin, RMS and learning progress |
| Signal analyzer | Waveform synthesis, noise, FFT magnitude/phase, STFT, cursors, aliasing and Gibbs |
| Filter design | Butterworth low/high pass (orders 1–8), cascaded band pass, Bode and z-plane stability |
| Signal mathematics | Complex IFFT, spectral reconstruction, linear convolution and RMSE |
| Engineering academy | Six guided experiments, predictions, hints and exportable reports |

All processing stays in the browser. No runtime package install, external API or account is required. The project is educational rather than a calibrated measurement instrument.

## 02 / Architecture

<img src="assets/diagrams/architecture.svg" alt="Architecture of the numerical core, controller, shared data, and academy" width="960">

The pure numerical modules are reusable in Node. The controller manages input, state and active-workspace drawing. The academy executes fixed experiments independently from live controls. See the [architecture handbook](docs/architecture/README.md) for component, sequence, state and build diagrams, and [design decisions](docs/architecture/DECISIONS.md) for trade-offs.

## 03 / Repository map

```text
SignalLab/
├── .github/workflows/     CI only (no deployment)
├── assets/diagrams/       Versioned SVG artwork and technical diagrams
├── docs/                  Engineering handbook
│   ├── architecture/      Components, sequences and decisions
│   ├── experiments/       Guided lab methodology
│   ├── quality/           Test traceability and acceptance gate
│   └── reference/         Numerical API contracts
├── examples/portable/     Standalone HTML distribution
├── scripts/               Deterministic build
├── src/
│   ├── academy/           Fixed experiments and reports
│   ├── dsp/               Independent numerical engine
│   ├── styles/            Responsive layout and themes
│   └── ui/                App controller and workspace views
├── tests/
│   ├── e2e/               Hosted browser tests
│   ├── performance/       Repeatable numerical workload
│   └── unit/              DSP and build regression tests
├── index.html             Static-site entry point
└── package.json           Developer commands (no runtime dependencies)
```

## 04 / Quick start

```sh
git clone https://github.com/DanoV1m/SignalLab.git
cd SignalLab
python -m http.server 8000
```

Open http://localhost:8000. For offline use, open [the portable HTML source](examples/portable/SignalLab.html) locally. Microphone access requires permission and a secure origin such as localhost or HTTPS. The public live-demo URL is not yet verified.

```sh
npm test          # numerical and structural tests; Node 22+
npm run build     # creates dist/index.html
npm run benchmark # repeated numerical workload
```

## 05 / Mathematical foundation

<img src="assets/diagrams/butterworth-reference.svg" alt="Calculated Butterworth low-pass reference curves for orders one, two, four and eight" width="960">

*Analytic reference, not a screenshot or measured hardware result: digital Butterworth low-pass, 4096 Hz sampling, 300 Hz cutoff.*

The radix-2 FFT implements the DFT with O(N log N) complexity; the one-sided spectrum uses coherent-gain normalization. The Butterworth engine uses prewarped bilinear transformation and cascaded first/second-order sections; Bode plots evaluate those same coefficients. Complex IFFT and conjugate-group selection reconstruct real sampled records. Direct finite convolution has output length N+M-1.

See [equations, assumptions and limitations](docs/ENGINEERING.md) and the [DSP API reference](docs/reference/DSP_API.md).

## 06 / Engineering verification

| Evidence | V2.0 baseline |
| --- | --- |
| Numerical regression | 40/40 passed |
| Hosted Chromium checks | 12/12 passed |
| CI jobs | 2/2 passed |
| Repeated local numerical workloads | 200/200 finite, reconstruction RMS error below 1e-10 |

Baseline remote evidence: [GitHub Actions run #4](https://github.com/DanoV1m/SignalLab/actions/runs/46005046497). Benchmark scope and historical limitations: [verification report](docs/VERIFICATION.md). The repository restructuring adds three build/layout checks and tests both portable and modular browser distributions; see the **current** PR checks before merging. Browser screenshots are generated in CI and collected as artifacts.

## 07 / Documentation and development

Read the [engineering handbook](docs/README.md) for the complete map, [test strategy](docs/quality/TEST_MATRIX.md), [contributing guide](CONTRIBUTING.md), [privacy and security notes](SECURITY.md), [changelog](CHANGELOG.md) and [release checklist](docs/RELEASE.md).

Physical microphone tests, non-Chromium browsers, prolonged browser workloads and formal accessibility/security audits remain open. No license has been selected. No deployment or portfolio changes are performed by CI.
