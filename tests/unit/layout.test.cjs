'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const {build,scripts,styles}=require('../../scripts/build.cjs'),root=path.resolve(__dirname,'../..');
test('local runtime assets resolve in dependency order',()=>{const html=fs.readFileSync(path.join(root,'index.html'),'utf8');assert.deepEqual([...html.matchAll(/<script src="([^"]+)"/g)].map(m=>m[1]),scripts);for(const asset of [...scripts,...styles]){assert.ok(fs.statSync(path.join(root,asset)).isFile());assert.ok(html.includes(asset));}});
test('portable example matches deterministic build',()=>assert.equal(build().trimEnd(),fs.readFileSync(path.join(root,'examples/portable/SignalLab.html'),'utf8').trimEnd()));
test('portable build has no external runtime assets',()=>assert.doesNotMatch(build(),/<script\b[^>]*\bsrc=|<link\b[^>]*rel="stylesheet"/i));
