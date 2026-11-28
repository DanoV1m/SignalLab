'use strict';
// Long repeated synthetic workload; heap snapshots are diagnostic, not leak certification.
const assert=require('node:assert/strict'),{performance}=require('node:perf_hooks');
const D=require('../../src/dsp/dsp.js'),A=require('../../src/dsp/advanced.js'),S=require('../../src/dsp/session.js'),R=require('../../src/dsp/research.js');
if(typeof global.gc!=='function')throw Error('Run with node --expose-gc');
const session=S.createSession(),iterations=300,n=4096,fs=16000,times=[],memory=[];
const snapshot=iteration=>{global.gc();global.gc();const m=process.memoryUsage();memory.push({iteration,heapUsed_bytes:m.heapUsed,arrayBuffers_bytes:m.arrayBuffers,rss_bytes:m.rss});};
function workload(i){
 const f=125+(i%12)*125,window=R.windows[i%4],mode=['none','low','high','band'][i%4];
 const p={n,fs,f,amp:1,noise:.05,seed:i};
 const x=session.input(p),rec=session.analyze(x,fs,mode,200,1800,1+i%8,window);
 assert.equal(session.input({...p}),x);assert.equal(session.analyze(x,fs,mode,200,1800,1+i%8,window),rec);
 const full=session.reconstruct(x,n/2+1),c=session.convolve(x,1+i%128),frames=D.stft(rec.y,fs,256,64,window);
 assert.ok(D.rms(Float64Array.from(x,(v,k)=>v-full.samples[k]))<1e-10);
 assert.equal(c.length,n+i%128);assert.ok(c.every(Number.isFinite)&&rec.y.every(Number.isFinite));
 assert.ok(frames.every(q=>q.bins.every(v=>Number.isFinite(v.a))));
 const h=R.firLowpass(fs,1500,31+2*(i%49),window);assert.ok(Math.abs(R.firResponse(h,fs,0).magnitude-1)<1e-12);
 assert.ok(A.poleZero(rec.sections).poles.every(p=>Math.hypot(p.re,p.im)<1));
}
for(let i=0;i<10;i++)workload(i);
session.clear();snapshot(0);
const start=performance.now();
for(let i=0;i<iterations;i++){const t=performance.now();workload(i);times.push(performance.now()-t);if((i+1)%50===0){session.clear();snapshot(i+1);}}
times.sort((a,b)=>a-b);const report={iterations,n,fs,elapsed_ms:performance.now()-start,median_ms:(times[149]+times[150])/2,p95_ms:times[284],node:process.version,memory,scope:'Node synthetic repeated workload; post-explicit-GC process snapshots; not a browser or proof of no leaks'};
console.log(JSON.stringify(report,null,2));
