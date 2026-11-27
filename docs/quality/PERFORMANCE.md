# Performance engineering

Baseline research snapshot d7385de, [run 46011558585](https://github.com/DanoV1m/SignalLab/actions/runs/46011558585). Median of ten synchronous render calls (ms), fixed synthetic default record, 1280 × 900 CI viewport:

| Workspace | Chromium | Firefox | WebKit |
| --- | ---: | ---: | ---: |
| Dashboard | 1.05 | 0.5 | 1 |
| Analyzer | 3.1 | 6 | 10 |
| Filter | 1.2 | 2.5 | 4 |
| Mathematics | 2.8 | 20.5 | 21 |
| Academy | 0.6 | 0.5 | 1.5 |

These are synchronous calls, excluding paint, input latency and hardware. Do not treat separate runners as controlled benchmarks. The new candidate separates a bounded session model from DOM presentation, reuses unchanged sample/analysis records, independently caches math operations and uses a sliding sum for the moving-average convolution. Six unit tests and browser cache assertions verify correctness and invalidation. Compare current CI compatibility artifacts to this baseline only as indicative measurements; no speedup is asserted until measured. Physical microphone, memory profiling, long sessions and real-device latency remain open.

Run `python tests/e2e/compatibility.py --browser chromium` (or firefox/webkit) with Playwright 1.51 installed, or use current CI artifacts.

The compatibility suite additionally records 20 paired cache-cold and cache-warm mathematics calls on the same runner and browser. Each cold call clears all session caches, then its paired warm call reuses identical inputs. The pair measures the benefit of reuse within this candidate; it is not an isolated comparison with the previous commit, and includes canvas drawing but not paint. The browser smoke suite now also collects actual filter and mathematics screenshots in both distributions.
