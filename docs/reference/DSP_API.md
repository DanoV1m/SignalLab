# Numerical module reference

Frequencies are in Hz, time in seconds, and digital filter gains dimensionless. Arrays are real-valued samples unless specified. Amplitude ratios in dB are not calibrated sound-pressure levels.

| Function | Input | Output / condition |
| --- | --- | --- |
| DSP.fft(real) | Finite real power-of-two record, N >= 2 | {re, im} DFT coefficient arrays |
| DSP.spectrum(x, fs, window) | Finite real record, positive finite sample rate, rect, hann, hamming or blackman | One-sided bins with f, a, phase; coherent-gain normalization |
| DSP.generate(options) | n, fs, f, amp, type, noise, f2, amp2, h, seed | Deterministic Float64Array for given seed; n 2–1,048,576, h 1–4095, finite parameters, nonnegative noise, known waveform |
| DSP.stft(x, fs, size, hop, window) | Power-of-two window fitting record, positive hop | Frames with center time and spectrum |
| DSP.metrics(x), DSP.rms(x) | Nonempty finite record | Statistics and RMS |
| DSP.alias(f, fs) | Positive sample rate | Folded frequency in [0, fs/2] |
| DSP.db(a, ref, floor) | Amplitude and positive reference | Clipped amplitude dB |
| AdvancedDSP.design(fs, mode, fc, fc2, order) | none/low/high/band; valid edges below Nyquist; order 1–8 | Cascaded section coefficients |
| AdvancedDSP.apply(x, sections) | Record and sections | Filtered record, zero initial state |
| AdvancedDSP.response(sections, fs, f) | Sections and frequency | Complex response, magnitude and phase |
| AdvancedDSP.poleZero(sections) | Section coefficients | Pole and zero coordinates |
| AdvancedDSP.ifft(re, im) | Equal-length power-of-two spectra | Complex inverse DFT arrays |
| AdvancedDSP.reconstruct(x, keep) | Real record, 1 to N/2+1 groups | Reconstructed samples and retained bins |
| AdvancedDSP.convolve(x, h) | Two nonempty sequences | N+M-1 output samples |

Invalid FFT/spectrum/STFT input and invalid generator configuration throw explicit errors. Above-Nyquist frequencies remain valid for aliasing experiments. DSP.peak excludes the DC bin; the dashboard label reflects this. Window leakage may still populate non-DC bins.

DSP.filter is an earlier first-order filter retained in the core and regression suite; the application uses AdvancedDSP for Butterworth design. See [engineering notes](../ENGINEERING.md).

## Example (Node)

```js
const D = require('./src/dsp/dsp.js');
const A = require('./src/dsp/advanced.js');
const x = D.generate({n:1024, fs:4096, f:256, amp:1.5});
const sections = A.design(4096,'low',300,0,4);
console.log(D.peak(D.spectrum(x,4096,'rect')));
console.log(A.response(sections,4096,300).magnitude);
```

The coherent sine has a 256 Hz peak with amplitude 1.5. The filter's theoretical cutoff gain is 1/sqrt(2).
