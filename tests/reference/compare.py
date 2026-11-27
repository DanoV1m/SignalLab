"""Independent NumPy/SciPy reference; deterministic vectors, no network or hardware."""
import json
import pathlib
import subprocess
import sys
import numpy as np
import scipy
from scipy import signal

ROOT = pathlib.Path(__file__).resolve().parents[2]
rng = np.random.default_rng(2026)
cases = []
for n in (8, 64, 256, 1024):
    for x in (rng.normal(size=n), np.eye(1, n).ravel(), 1.2 + 0.7*np.sin(2*np.pi*2*np.arange(n)/n)):
        cases.append(dict(kind="fft", fs=4096, x=x.tolist()))
for fs in (1000, 16000):
    x = rng.normal(size=512).tolist()
    freqs = np.linspace(0, fs/2, 129).tolist()
    for order in range(1, 9):
        for mode in ("low", "high"):
            cases.append(dict(kind="filter", fs=fs, mode=mode, fc=fs*.15, fc2=fs*.30, order=order, x=x, freqs=freqs))
    for order in (2, 4, 8):
        cases.append(dict(kind="filter", fs=fs, mode="band", fc=fs*.10, fc2=fs*.30, order=order, x=x, freqs=freqs))
for n, m in ((3, 2), (64, 17), (257, 33)):
    cases.append(dict(kind="convolution", x=rng.normal(size=n).tolist(), h=rng.normal(size=m).tolist()))
for taps in (15, 31, 63):
    for window in ("rect","hann","hamming","blackman"):
        cases.append(dict(kind="fir",fs=4096,fc=512,taps=taps,window=window,x=rng.normal(size=256).tolist(),freqs=np.linspace(0,2048,129).tolist()))
for binpos in (64,64.25,64.5):
    for window in ("rect","hann","hamming","blackman"):
        cases.append(dict(kind="leakage",bin=binpos,window=window,x=np.sin(2*np.pi*binpos*np.arange(1024)/1024).tolist()))
for ratio in (.25,1,4):
    cases.append(dict(kind="snr",x=np.sin(2*np.pi*np.arange(256)/16).tolist(),noise=(ratio*np.cos(2*np.pi*np.arange(256)/8)).tolist()))
raw = subprocess.run(["node", str(ROOT/"tests/reference/bridge.cjs")], input=json.dumps(cases), text=True, capture_output=True, check=True, cwd=ROOT)
results = json.loads(raw.stdout)
assert len(results) == len(cases)
errors = {}
counts = {}
def compare(name, actual, expected, atol, rtol=0):
    actual, expected = np.asarray(actual), np.asarray(expected)
    assert actual.shape == expected.shape, (name, actual.shape, expected.shape)
    assert np.all(np.isfinite(actual)) and np.all(np.isfinite(expected)), name
    err = float(np.max(np.abs(actual-expected)))
    errors[name] = max(errors.get(name, 0), err)
    counts[name] = counts.get(name, 0) + 1
    np.testing.assert_allclose(actual, expected, atol=atol, rtol=rtol, err_msg=name)
for c, r in zip(cases, results):
    x = np.asarray(c["x"])
    if c["kind"] == "fft":
        compare("FFT complex coefficients", np.array(r["re"])+1j*np.array(r["im"]), np.fft.fft(x), 2e-9, 1e-11)
        compare("IFFT real reconstruction", r["inverse"], x, 1e-10)
        compare("IFFT imaginary residual", r["inverseIm"], np.zeros_like(x), 1e-10)
        for w, name in enumerate(("rect", "hann", "hamming", "blackman")):
            window = np.ones(len(x)) if name == "rect" else getattr(signal.windows, name)(len(x), sym=False)
            amp = 2*np.abs(np.fft.rfft(x*window))/window.sum()
            amp[[0,-1]] /= 2
            compare("Spectrum "+name, r["spectra"][w], amp, 1e-10)
    elif c["kind"] == "filter":
        fs, order, fc = c["fs"], c["order"], c["fc"]
        if c["mode"] == "band":
            # Match the implemented cascade, not SciPy's canonical bandpass transform.
            sos = np.vstack([signal.butter(order, fc, fs=fs, btype="highpass", output="sos"),
                             signal.butter(order, c["fc2"], fs=fs, btype="lowpass", output="sos")])
        else:
            sos = signal.butter(order, fc, fs=fs, btype=c["mode"]+"pass", output="sos")
        compare("Filter time response", r["y"], signal.sosfilt(sos,x), 1e-9, 1e-9)
        _, h = signal.sosfreqz(sos, worN=np.array(c["freqs"]), fs=fs)
        measured = np.array([v["magnitude"]*np.exp(1j*v["phase"]) for v in r["response"]])
        compare("Filter complex frequency response", measured, h, 1e-9, 1e-9)
        assert all(np.hypot(p["re"],p["im"]) < 1 for p in r["poles"])
        # Compare section-by-section away from endpoints and deep stopbands, avoiding ill-conditioned high-order polynomials.
        freq = np.array(c["freqs"])
        mask = (freq > 0) & (freq < fs/2) & (np.abs(h) > 1e-6)
        omega = 2*np.pi*freq[mask]/fs
        expected_delay = sum(signal.group_delay((sec[:3],sec[3:]), w=omega)[1] for sec in sos)
        compare("Group delay samples", np.array(r["delay"],dtype=float)[mask], expected_delay, 2e-8, 1e-8)
    elif c["kind"] == "fir":
        window = "boxcar" if c["window"] == "rect" else c["window"]
        h = signal.firwin(c["taps"],c["fc"],fs=c["fs"],window=window)
        compare("FIR coefficients",r["h"],h,1e-12)
        compare("FIR step",r["step"],np.cumsum(h),1e-12)
        _,response=signal.freqz(h,worN=np.array(c["freqs"]),fs=c["fs"])
        compare("FIR complex response",np.array([v["re"]+1j*v["im"] for v in r["response"]]),response,1e-11)
        compare("FIR full convolution",r["y"],np.convolve(x,h),1e-11)
    elif c["kind"] == "leakage":
        window = "boxcar" if c["window"] == "rect" else c["window"]
        p = np.abs(np.fft.fft(x*signal.get_window(window,len(x),fftbins=True)))**2
        k=np.arange(len(x));b=c["bin"]
        mask=np.minimum(np.abs(k-b),np.abs(k-(len(x)-b)))>4
        compare("Leakage fraction",r,p[mask].sum()/p.sum(),1e-12)
    elif c["kind"] == "snr":
        compare("Known component SNR",r,10*np.log10(np.sum(x*x)/np.sum(np.array(c["noise"])**2)),1e-11)
    else:
        compare("Linear convolution", r, np.convolve(x,c["h"]), 1e-10)
report = dict(cases=len(cases), comparisons=sum(counts.values()), numpy=np.__version__, scipy=scipy.__version__, max_absolute_error=errors, comparisons_by_metric=counts)
print(json.dumps(report, indent=2))
out = ROOT/"dist"/"scientific-reference.json"
out.parent.mkdir(exist_ok=True)
out.write_text(json.dumps(report, indent=2)+"\n")
