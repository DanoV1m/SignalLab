'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),P=require('../../src/ui/audio-policy.js');
const buf=(data,fs=8000)=>({length:data[0].length,numberOfChannels:data.length,sampleRate:fs,duration:data[0].length/fs,getChannelData:i=>data[i]});
test('encoded file size validation includes boundaries',()=>{for(const size of [0,-1,NaN,P.MAX_FILE+1])a.throws(()=>P.checkFile({size}));P.checkFile({size:P.MAX_FILE});});
test('decoded stereo mix preserves channel average',()=>{const r=P.mix(buf([[1,-1],[.5,.5]]));a.deepEqual(Array.from(r.samples),[.75,-.25]);a.equal(r.fs,8000);});
test('decoded resource caps reject before reading channels',()=>{const base={length:1,numberOfChannels:1,sampleRate:8000,duration:1/8000,getChannelData:()=>{throw Error('read unexpectedly')}};for(const patch of [{numberOfChannels:9},{length:4000000,numberOfChannels:8,duration:500},{duration:601},{length:0},{sampleRate:0},{sampleRate:NaN}])a.throws(()=>P.mix({...base,...patch}),/resource limits/);});
test('invalid channel lengths and nonfinite samples are rejected',()=>{a.throws(()=>P.mix(buf([[1,2],[1]])),/channel length/);a.throws(()=>P.mix(buf([[1,NaN]])),/Nonfinite/);});
test('single-flight gate rejects overlapping decode until released',()=>{const g=P.createGate();a.equal(g.acquire(),true);a.equal(g.busy,true);a.equal(g.acquire(),false);g.release();a.equal(g.busy,false);a.equal(g.acquire(),true);});
