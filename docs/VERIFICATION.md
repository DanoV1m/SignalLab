# V2.0 release-candidate verification

## Executed locally
- Node 22.16.0: 40 numerical regression tests passed, 0 failed.
- Chromium injected HTML: 10 smoke checks passed, including file decoding and CSV contents. No uncaught JS errors.
- 200 repeated numerical workloads, each with 4096 samples, two FFT spectra, order-8-per-edge band-pass, STFT, full-bin IFFT reconstruction and 128-point convolution. All results finite; reconstruction RMS error < 1e-10.

| Benchmark | Result |
|---|---:|
| Workloads | 200 |
| Elapsed | 3967.6 ms |
| Median per workload | 19.26 ms |
| 95th percentile | 23.94 ms |

The benchmark is specific to this execution environment, not a browser latency measurement or a long-duration physical device test.

## Browser smoke test output
```text
PASS dashboard metrics
PASS no hidden DSP work on dashboard
PASS analyzer and isolated STFT
PASS light theme
PASS filter isolation
PASS mathematical tools
PASS prediction, experiment and report
PASS WAV decoding and CSV export
SKIP reload persistence and microphone: --hosted required
PASS five modules at 390px
PASS zero uncaught JS errors
```

## Pending hosted checks
The runtime blocked navigation to a real localhost server (`ERR_BLOCKED_BY_ADMINISTRATOR`). A hosted-mode test has been prepared and configured in GitHub Actions; it asserts reload persistence and starts/stops a **synthetic** microphone on localhost. It has not been executed successfully yet. Physical microphone, cross-browser support, prolonged browser performance, formal accessibility/security audits, remote CI and Pages hosting remain unverified.

## Reproduce
```sh
node --test test.cjs
node tests/benchmark.cjs
python -m pip install playwright==1.51.0
python -m playwright install chromium
python tests/browser_smoke.py --hosted
```
