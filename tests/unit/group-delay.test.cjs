'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),A=require('../../src/dsp/advanced.js');
const near=(x,y,e=1e-10)=>a.ok(Math.abs(x-y)<e,`${x} != ${y}`);
test('bypass has zero group delay',()=>near(A.groupDelay([],4000,123),0));
test('symmetric FIR moving average has constant group delay away from nulls',()=>{const s=[{a:[1],b:[.25,.5,.25]}];for(const f of [0,100,1000,1900])near(A.groupDelay(s,4000,f),1);a.equal(A.groupDelay(s,4000,2000),null);});
test('first-order lowpass delay at DC matches bilinear formula',()=>{const fs=4000,fc=350;near(A.groupDelay(A.design(fs,'low',fc,0,1),fs,0),1/(2*Math.tan(Math.PI*fc/fs)));});
test('cascade group delay is additive and singular endpoints are omitted',()=>{const fs=4000,h=A.design(fs,'high',200,0,4),l=A.design(fs,'low',900,0,4);near(A.groupDelay([...h,...l],fs,500),A.groupDelay(h,fs,500)+A.groupDelay(l,fs,500));a.equal(A.groupDelay(h,fs,0),null);a.equal(A.groupDelay(l,fs,fs/2),null);});
test('group delay rejects frequencies outside Nyquist and invalid sample rate',()=>{for(const [fs,f] of [[0,0],[4000,-1],[4000,2001],[4000,NaN]])a.throws(()=>A.groupDelay([],fs,f));});
