'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),D=require('../../src/dsp/dsp.js');
test('coherent tone amplitude across four periodic windows',()=>{const fs=4096,n=256,x=D.generate({n,fs,f:512,amp:1.7});for(const w of ['rect','hann','hamming','blackman'])a.ok(Math.abs(D.spectrum(x,fs,w)[32].a-1.7)<1e-10,w);});
test('DC normalization for added windows',()=>{for(const w of ['hamming','blackman'])a.ok(Math.abs(D.spectrum(new Float64Array(128).fill(2),1000,w)[0].a-2)<1e-10);});
test('STFT supports both new windows',()=>{for(const w of ['hamming','blackman']){const x=D.generate({n:512,fs:4096,f:512});const frames=D.stft(x,4096,128,32,w);a.equal(frames.length,13);for(const frame of frames)a.ok(Math.abs(D.peak(frame.bins).a-1)<1e-10);}});
