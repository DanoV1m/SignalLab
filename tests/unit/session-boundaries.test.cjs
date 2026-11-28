'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),S=require('../../src/dsp/session.js');
test('omitted optional generator parameters never mask invalid null or NaN input',()=>{
 const s=S.createSession(),p={n:64,fs:4096,f:256};const x=s.input(p);
 for(const v of [null,NaN,Infinity])for(const key of ['amp','noise','f2','amp2','h','seed'])a.throws(()=>s.input({...p,[key]:v}),/Invalid signal/);
 a.equal(s.input(p),x);
});
test('cache does not retain a superseded synthetic record as the current source',()=>{
 const s=S.createSession(),p={n:64,fs:4096,f:256};const x=s.input(p);s.input({...p,f:512});a.notEqual(s.input(p),x);
});
