'use strict';
// Repeated numerical workload at the largest exposed record size. No UI timing claims.
const {performance}=require('node:perf_hooks');
const assert=require('node:assert/strict');
const DSP=require('../dsp.js'), A=require('../advanced.js');
const n=4096,fs=16000,iterations=200;
const x=DSP.generate({n,fs,f:125,f2:1500,amp2:.6,noise:.1});
const sections=A.design(fs,'band',200,1800,8), h=new Float64Array(128).fill(1/128);
const times=[];
function workload(){
 const y=A.apply(x,sections),s=DSP.spectrum(x,fs),sy=DSP.spectrum(y,fs),frames=DSP.stft(y,fs,64,16),rec=A.reconstruct(x,n/2+1),c=A.convolve(x,h);
 assert.ok(y.every(Number.isFinite)&&c.every(Number.isFinite)&&frames.every(f=>f.bins.every(v=>Number.isFinite(v.a)))&&s.every(v=>Number.isFinite(v.a))&&sy.every(v=>Number.isFinite(v.a)));
 assert.ok(DSP.rms(Float64Array.from(x,(v,i)=>v-rec.samples[i]))<1e-10);
}
for(let i=0;i<5;i++)workload();
const start=performance.now();
for(let i=0;i<iterations;i++){const t=performance.now();workload();times.push(performance.now()-t);}
const elapsed=performance.now()-start;times.sort((a,b)=>a-b);
console.log(JSON.stringify({iterations,n,fs,elapsed_ms:+elapsed.toFixed(2),median_ms:+times[Math.floor(iterations/2)].toFixed(2),p95_ms:+times[Math.ceil(iterations*.95)-1].toFixed(2),node:process.version,scope:'numerical workload, not UI or physical microphone'},null,2));
