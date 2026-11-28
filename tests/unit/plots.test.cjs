'use strict';
const {test}=require('node:test'),a=require('node:assert/strict'),P=require('../../src/ui/plots.js');
test('plot keys compare identity and scalar values, including NaN',()=>{const x={};a.ok(P.sameKey([x,3,NaN],[x,3,NaN]));a.equal(P.sameKey([x,3],[{},3]),false);a.equal(P.sameKey([x,3],[x,4]),false);a.equal(P.sameKey([x],[x,3]),false);});
test('per-canvas cache keys are copied, independent and invalidatable',()=>{const c=P.createCache(),one={},two={},key=[1,'dark'];c.remember(one,key);key[0]=2;a.ok(c.matches(one,[1,'dark']));a.equal(c.matches(two,[1,'dark']),false);c.remember(two,[2]);c.invalidate(one);a.equal(c.matches(one,[1,'dark']),false);a.ok(c.matches(two,[2]));});
