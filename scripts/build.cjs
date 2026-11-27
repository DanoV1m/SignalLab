'use strict';
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
const styles=['src/styles/workspace.css'];
const scripts=["src/dsp/dsp.js","src/dsp/advanced.js","src/ui/app.js","src/academy/academy.js","src/ui/academy-ui.js","src/ui/workspace.js"];
function build(){
 let html=fs.readFileSync(path.join(root,'index.html'),'utf8');
 function inline(tag,replacement){if(!html.includes(tag))throw Error('Missing asset: '+tag);html=html.replace(tag,()=>replacement);}
 for(const asset of styles)inline('<link href="'+asset+'" rel="stylesheet"/>','<style>\n'+fs.readFileSync(path.join(root,asset),'utf8')+'\n</style>');
 for(const asset of scripts)inline('<script src="'+asset+'"></script>','<script>\n'+fs.readFileSync(path.join(root,asset),'utf8')+'\n</script>');
 if(/<script\b[^>]*\bsrc=|<link\b[^>]*rel="stylesheet"/i.test(html))throw Error('External asset remains');
 return html;
}
if(require.main===module){const output=process.argv[2]?path.resolve(process.argv[2]):path.join(root,'dist','index.html');fs.mkdirSync(path.dirname(output),{recursive:true});fs.writeFileSync(output,build());console.log(output);}
module.exports={build,scripts,styles};
