'use strict';
const fs=require('node:fs'),D=require('../../src/dsp/dsp.js'),A=require('../../src/dsp/advanced.js');
const request=JSON.parse(fs.readFileSync(0,'utf8'));
const result=request.map(c=>{
 if(c.kind==='fft'){const z=D.fft(c.x),inv=A.ifft(z.re,z.im);return {re:Array.from(z.re),im:Array.from(z.im),inverse:Array.from(inv.re),inverseIm:Array.from(inv.im),spectra:['rect','hann','hamming','blackman'].map(w=>D.spectrum(c.x,c.fs,w).map(v=>v.a))};}
 if(c.kind==='filter'){const s=A.design(c.fs,c.mode,c.fc,c.fc2,c.order);return {y:Array.from(A.apply(c.x,s)),response:c.freqs.map(f=>A.response(s,c.fs,f)),poles:A.poleZero(s).poles};}
 if(c.kind==='convolution')return Array.from(A.convolve(c.x,c.h));
 throw Error('Unknown reference case');
});
process.stdout.write(JSON.stringify(result));
