# Architecture decision record

| ID | Decision | Rationale | Trade-off |
| --- | --- | --- | --- |
| ADR-001 | Browser-native HTML, Canvas and JavaScript | No runtime dependency, API key, or server; inspectable numerical core | Manual state and canvas accessibility |
| ADR-002 | Separate numerical modules from DOM | Deterministic unit tests and reuse in Node | Classic script order must be preserved |
| ADR-003 | Radix-2 FFT with explicit normalization | Demonstrates the algorithm and predictable O(N log N) behavior | Power-of-two records; leakage remains possible |
| ADR-004 | SOS Butterworth with prewarped bilinear transform | Stable high-order realization; plotted response uses actual coefficients | Band-pass is a cascade, not a canonical band transform |
| ADR-005 | Fixed academy presets independent of live controls | Reproducible experiments and testable expectations | Not arbitrary lab grading |
| ADR-006 | Lazy instrument-specific analysis | Avoid STFT, response and reconstruction when hidden | Shared metrics still compute; no worker thread |
| ADR-007 | Modular source plus deterministic portable HTML | Static hosting and offline delivery | Tracked example must match generated output |
| ADR-008 | Ubuntu 24.04 pinned in CI | Baseline Playwright 1.51 installation failed on Ubuntu 26.04; fixed run #4 passed | Upgrade runner and Playwright together after validation |

These decisions describe implemented functionality. Alternatives are not represented as complete.

| ADR-009 | Bounded DOM-free session caches and sliding-sum moving average | Eliminate redundant numerical work on unchanged inputs; preserve full linear convolution tail | Immutable sample ownership contract; floating-point rounding can differ; no cross-frame microphone reuse |
