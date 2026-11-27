'use strict';
const {test}=require('node:test'),a=require('node:assert/strict');
const D=require('../../src/dsp/dsp.js');
test('FFT rejects non-finite and nonnumeric samples',()=>{for(const x of [[0,NaN],[Infinity,0],['1',2]])a.throws(()=>D.fft(x),/finite real/);});
test('spectrum rejects invalid rate and window',()=>{for(const fs of [0,-1,NaN,Infinity])a.throws(()=>D.spectrum([0,1],fs),/Sample rate/);a.throws(()=>D.spectrum([0,1],1000,'unknown'),/window/);});
test('spectrum and STFT reject invalid samples',()=>{a.throws(()=>D.spectrum([0,Infinity],1000));a.throws(()=>D.stft([1,2,3,NaN],1000,2,1));a.throws(()=>D.stft([1,2,3,4],1000,2,1,'unknown'));});
test('generator rejects degenerate records and invalid parameters',()=>{const base={n:8,fs:1000,f:50};for(const v of [{n:1,type:'chirp'},{n:2.5},{n:1048577},{fs:0},{f:NaN},{noise:-1},{h:Infinity},{h:4096},{type:'typo'}])a.throws(()=>D.generate({...base,...v}),/Invalid signal/);});
test('valid short chirp stays finite and preserves alias experiments',()=>{a.ok(D.generate({n:2,fs:1000,f:50,f2:250,type:'chirp'}).every(Number.isFinite));a.ok(D.generate({n:8,fs:1000,f:750}).every(Number.isFinite));});
