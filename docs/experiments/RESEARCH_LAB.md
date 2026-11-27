# FIR, IIR and spectral research laboratory

The filter workspace includes a separate synthetic experiment at fs = 4096 Hz, with odd symmetric FIR lengths and four symmetric windows. The windowed-sinc coefficients are normalized to unity DC. The comparison IIR is a fourth-order Butterworth low-pass at the same nominal cutoff, not an equivalent response: FIR cutoff is the ideal sinc transition centre and the IIR cutoff is a half-power point.

For M odd taps, h[k] is proportional to (2fc/fs) sinc((2fc/fs)(k-(M-1)/2)) w[k], with sinc(u)=sin(pi u)/(pi u), normalized by the sum. The FIR delay is (M-1)/2 samples where response is nonzero. Impulse and step traces show 256 samples; the IIR response can continue beyond this finite display.

SNR = 10 log10(sum(clean²)/sum(interference²)). The fixed test uses 128 Hz and 1536 Hz tones with amplitudes 1 and 0.5, separately filters both components and omits the first M-1 samples for all three measurements. It is a known-component ratio, not a blind SNR estimator and not a broadband noise study. Zero energy is reported as undefined.

Leakage uses a 1024-sample real tone at a selectable fractional DFT bin, periodic windows and the fraction of two-sided FFT energy outside ±4 bins of both positive and negative tone centres. A smaller fraction is better only for this specified band. FIR uses symmetric windows, FFT analysis periodic windows; these conventions are deliberately different.

Reference cases compare coefficients, full convolution, step and complex response to SciPy firwin/freqz and NumPy convolution, leakage to independent NumPy FFT with SciPy periodic windows, and SNR to the direct energy ratio. See [scientific validation](../quality/SCIENTIFIC_VALIDATION.md). No arbitrary FIR designer, high-pass FIR or blind audio SNR is claimed.
