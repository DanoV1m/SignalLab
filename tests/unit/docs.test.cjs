'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const ignored=new Set(['.git','node_modules','dist','__pycache__','.venv','venv']);
function markdown(dir){
 const out=[];
 for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
  if(ignored.has(entry.name))continue;
  const p=path.join(dir,entry.name);
  if(entry.isDirectory())out.push(...markdown(p));
  else if(entry.isFile()&&/\.md$/i.test(entry.name))out.push(p);
 }
 return out;
}
test('all supplementary Markdown lives under docs',()=>{
 const files=markdown(root).map(p=>path.relative(root,p).split(path.sep).join('/'));
 assert.ok(files.includes('README.md'));
 assert.deepEqual(files.filter(p=>p!=='README.md'&&!p.startsWith('docs/')),[]);
 for(const name of ['CHANGELOG.md','CONTRIBUTING.md','SECURITY.md','reference/WEB.md'])assert.ok(files.includes('docs/'+name),name);
});
test('relative documentation links and image paths resolve',()=>{
 const broken=[];
 for(const file of markdown(root)){
  const body=fs.readFileSync(file,'utf8').replace(/^\s*(`{3,}|~{3,})[^\n]*\n[\s\S]*?^\s*\1\s*$/gm,'');
  const targets=[...body.matchAll(/\]\(\s*<?([^)\s>]+)>?(?:\s+["'][^"']*["'])?\s*\)/g),...body.matchAll(/<img\b[^>]*\bsrc=["']([^"']+)["']/gi)].map(m=>m[1]);
  for(const target of targets){
   if(/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(target))continue;
   const relative=decodeURIComponent(target.split(/[?#]/)[0]);
   if(!relative)continue;
   const resolved=path.resolve(path.dirname(file),relative);
   if(!resolved.startsWith(root+path.sep)&&resolved!==root||!fs.existsSync(resolved))broken.push(path.relative(root,file)+' -> '+target);
  }
 }
 assert.deepEqual(broken,[]);
});
