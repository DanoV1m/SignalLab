# Reliability and stress verification

## Verified baseline
Research snapshot 81dfd1e passed [CI run #34](https://github.com/DanoV1m/SignalLab/actions/runs/46014783105): 72 Node tests, 80 scientific cases and 264 independent numerical comparisons, 42 Chromium smoke checks across modular and portable distributions, and synthetic Chromium/Firefox/WebKit compatibility. These results belong to that commit.

## New stress protocol

| Test | Workload | Correctness gates | Diagnostic observations |
| --- | --- | --- | --- |
| Node | 300 workloads, 4096 samples, changing frequency, filter, FFT window, seed, FIR length | Finite outputs, reconstruction RMSE below 1e-10, stable poles, FIR DC gain and cache reuse | elapsed time, median/p95 workload time, post-GC heap/ArrayBuffer/RSS snapshots every 50 workloads |
| Chromium | 30 cycles after warmup, 150 workspace visits, 4096 samples, changing signal, filters, windows and lab controls | visible workspaces, updated metrics, finite records, no uncaught JS exceptions | elapsed time, post-GC JS heap and DOM counters every 10 cycles |

```sh
npm run stress
python -m pip install playwright==1.51.0
python -m playwright install chromium
python tests/e2e/stress.py
```

The reliability job uploads JSON reports and an actual dashboard capture. The current revision must pass on its exact commit. Heap snapshots are diagnostics: RSS includes allocator behavior; CDP JS heap excludes native/Canvas/GPU memory. No universal threshold, no claim of zero memory leaks, no physical microphone stress or all-day soak test. Explicit GC is a measurement tool, not production behavior.

## Cache contract
Session keys compare scalar values without JSON coercion; omitted parameters must not collide with null or NaN. One entry per cache; identity-based arrays are immutable by contract. The new regressions verify invalid inputs cannot hit a cached valid result and a superseded source is not reused as the current record. See [architecture](../architecture/README.md).
