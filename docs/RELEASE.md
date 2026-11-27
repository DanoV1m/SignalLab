# Release checklist

## V2.0 baseline
- [x] Dedicated repository and numerical engine.
- [x] 40 numerical tests and 12 hosted Chromium checks in [run #4](https://github.com/DanoV1m/SignalLab/actions/runs/46005046497).
- [x] Owner-approved [PR #1](https://github.com/DanoV1m/SignalLab/pull/1) merged as c5cd3e8.

## Repository engineering revision
- [x] Review restructuring [PR #2](https://github.com/DanoV1m/SignalLab/pull/2) and [CI run #11](https://github.com/DanoV1m/SignalLab/actions/runs/46008040139).
- [x] Verify both browser modes (24 checks) and all 43 numerical/structural tests before merge.
- [x] Owner-approved merge of PR #2 as 09d5b39.
- [ ] Verify documentation organization revision and merge with owner approval.
- [ ] Decide license with owner.
- [ ] Obtain approval before activating public hosting. Suggested Pages source: GitHub Actions publishing the generated dist/ directory. All tracked HTML lives in web/; the build creates dist/index.html at the site root. No deploy workflow is enabled. Verify live URL and HTTPS microphone permissions; integrate into portfolio with separate approval.
- [ ] Physical microphone, cross-browser and prolonged UI validation.

CI builds a static artifact and screenshots, not a deployment.
