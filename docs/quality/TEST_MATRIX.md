# Verification strategy

[GitHub Actions run #4](https://github.com/DanoV1m/SignalLab/actions/runs/46005046497) verified the pre-refactor V2.0: 40 numerical tests, 12 hosted Chromium checks, two jobs passed. See [benchmark](../VERIFICATION.md) for the separate local 200-workload test. The restructuring revision adds three layout/build tests and a second browser mode; [Run #11](https://github.com/DanoV1m/SignalLab/actions/runs/46008040139) verified all 43 tests and 24 hosted Chromium checks before merging PR #2. The documentation revision adds two checks for Markdown organization and relative link targets; its CI must be verified independently.

| Risk | Automated check | Scope |
| --- | --- | --- |
| Incorrect FFT sign or scale | Impulse, DFT comparison, coherent amplitude, DC/Nyquist, phase | Numerical |
| Sampling and spectral errors | Aliasing, chirp STFT, invalid window, dB floor | Numerical |
| Incorrect or unstable filter | Cutoff, analytic gain, pole radius, cascade, steady-state response | Numerical |
| Incorrect inverse or convolution | Direct inverse DFT, full-bin reconstruction, convolution fixtures | Numerical |
| Incorrect learning result | Six fixed experiments, invalid prediction, report contents | Numerical |
| Directory relocation | Local asset resolution/order, portable build parity, no external runtime assets | Three structural tests |
| Documentation organization | Root README exception and local Markdown / HTML image link targets | Two documentation tests |
| Public numerical contracts | Invalid samples, rate, window and generator configuration | Five unit tests |
| Independent numerical agreement | NumPy FFT/convolution and SciPy SOS response; 53 seeded cases | Scientific reference job |
| Web behavior | Dashboard, isolation, theme, reports, WAV/CSV, mobile, uncaught JS errors | Hosted Chromium |
| Permissions/persistence | Reload and synthetic microphone start/stop | Hosted Chromium, not physical hardware |

## Run

```sh
npm test
npm run build
npm run benchmark
python -m pip install playwright==1.51.0
python -m playwright install chromium
python tests/e2e/browser_smoke.py --hosted
python tests/e2e/browser_smoke.py --hosted --modular
```

All current jobs must succeed for the current PR head. Do not merge on stale status. CI collects real screenshots as the browser-screenshots artifact. Manual follow-up: physical microphone, Firefox/Safari, prolonged rendering, keyboard/screen-reader audit, and live HTTPS after owner-approved deployment.

See [scientific validation](SCIENTIFIC_VALIDATION.md) for tolerances and the generated reference report.
