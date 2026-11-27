'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),R=require('../../src/dsp/research.js'),D=require('../../src/dsp/dsp.js'),A=require('../../src/dsp/advanced.js');
const near=(x,y,t=1e-10)=>a.ok(Math.abs(x-y)<t,`${x} != ${y}`);
test('FIR coefficients symmetric and unity DC for all four windows',()=>{for(const w of R.windows){const h=R.firLowpass(4096,512,31,w);near(h.reduce((s,v)=>s+v,0),1);for(let i=0;i<h.length;i++)near(h[i],h[h.length-1-i]);near(R.firResponse(h,4096,0).magnitude,1);}});
test('FIR impulse and step match direct convolution',()=>{const h=R.firLowpass(4096,512,31),x=Float64Array.from({length:64},(_,i)=>i===0?1:0);a.deepEqual(Array.from(A.convolve(x,h).slice(0,31)),Array.from(h));near(R.step(h)[30],1);});
test('FIR lowpass separates low and high test tones',()=>{const h=R.firLowpass(4096,512,63);a.ok(R.firResponse(h,4096,128).magnitude>.95);a.ok(R.firResponse(h,4096,1536).magnitude<.01);});
test('FIR invalid parameters rejected',()=>{for(const args of [[0,512,31],[4096,2048,31],[4096,512,32],[4096,512,31,'bad']])a.throws(()=>R.firLowpass(...args));});
test('known component SNR uses energy ratio and handles zero energy',()=>{near(R.snr([1,-1],[.5,-.5]),10*Math.log10(4));a.equal(R.snr([0,0],[1,1]),null);a.equal(R.snr([1,1],[0,0]),null);a.throws(()=>R.snr([1],[1,2]));});
test('off-bin leakage comparison is bounded; coherent rectangular energy concentrated',()=>{const x=D.generate({n:1024,fs:4096,f:258}),coherent=D.generate({n:1024,fs:4096,f:256});a.ok(R.leakage(coherent,64,'rect')<1e-20);for(const w of R.windows){const v=R.leakage(x,64.5,w);a.ok(v>=0&&v<=1);}a.ok(R.leakage(x,64.5,'hann')<R.leakage(x,64.5,'rect'));});
