# Independent scientific validation

The JavaScript runtime remains dependency-free. NumPy and SciPy are test-only reference implementations. The reference harness passes deterministic input vectors to the same Node-importable modules used by the browser and compares outputs with independent libraries. It is not another copy of the JavaScript algorithm.

| Model | Cases | Acceptance |
| --- | ---: | --- |
| FFT/IFFT and normalized spectra | 12 | Complex coefficients, real reconstruction, imaginary residual, rectangular and periodic Hann, Hamming and Blackman amplitude |
| Butterworth low/high | 32 | Orders 1–8 at two sample rates; time-domain SOS output and complex response |
| Cascaded band-pass | 6 | Orders 2, 4 and 8 per edge; reference is a high-pass then low-pass cascade, not canonical bandpass |
| Linear convolution | 3 | Finite full convolution including the tail |

The harness uses fixed seed 2026, checks shapes and finite values, compares 163 output groups (84 FFT, 76 filter, 3 convolution), and separately checks all digital filter poles are inside the unit circle. Absolute tolerances range from 1e-10 to 2e-9; specified relative tolerance applies to FFT and filters. Actual maximum errors and dependency versions are generated in the JSON artifact. Do not claim results until the corresponding commit's CI has passed.

## Reproduce

```sh
python -m pip install -r tests/reference/requirements.txt
npm run reference
```

This is a selected numerical verification grid, not exhaustive validation, instrument calibration, or a claim of equivalence for every possible input. See [API contracts](../reference/DSP_API.md) and [verification strategy](TEST_MATRIX.md).
