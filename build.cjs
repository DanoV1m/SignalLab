// Create a dependency-free standalone HTML distribution.
const fs=require('node:fs');const path=require('node:path');const dir=__dirname;
let html=fs.readFileSync(path.join(dir,'index.html'),'utf8');
html=html.replace(/<link\b[^>]*href="workspace\.css"[^>]*>/,()=>'<style>\n'+fs.readFileSync(path.join(dir,'workspace.css'),'utf8')+'\n</style>');
for(const name of ['dsp','advanced','app','academy','academy-ui','workspace'])html=html.replace(`<script src="${name}.js"></script>`,()=>'<script>\n'+fs.readFileSync(path.join(dir,name+'.js'),'utf8')+'\n</script>');
if(/<script src=|href="workspace\.css"/.test(html))throw Error('External asset remains');
const output=process.argv[2]||path.join(dir,'SignalLab.html');fs.writeFileSync(output,html);console.log(output);
