'use strict';
(()=>{
const a=id=>document.getElementById(id), select=a('labSelect');let completed=new Set(),result=null,answer=null,passed=false;
try{const saved=JSON.parse(localStorage.getItem('signallab-academy-v13')||'[]');if(Array.isArray(saved))completed=new Set(saved.filter(id=>Academy.labs.some(l=>l.id===id)));}catch(e){}
const fmt=v=>Math.abs(v)>0&&Math.abs(v)<.0001?v.toExponential(4):Number(v.toFixed(6)).toString();
const current=()=>Academy.labs.find(l=>l.id===select.value);
function progress(){a('labProgress').textContent=`${completed.size} / ${Academy.labs.length} predictions mastered`;a('labBar').value=completed.size;for(const option of select.options){const l=Academy.labs.find(l=>l.id===option.value);option.textContent=(completed.has(l.id)?'✓ ':'')+l.title;}}
function load(){const l=current();result=null;answer=null;passed=false;for(const [id,value] of Object.entries({labGoal:l.goal,labFormula:l.formula,labConditions:l.conditions,labQuestion:l.question,labHintText:l.hint,labUnit:l.unit}))a(id).textContent=value;a('labAnswer').value='';a('labNotes').value='';a('labHintText').hidden=true;a('labHint').setAttribute('aria-expanded','false');a('labFeedback').textContent='';a('labResults').hidden=true;a('labExport').disabled=true;progress();}
for(const l of Academy.labs){const o=document.createElement('option');o.value=l.id;o.textContent=l.title;select.append(o);}select.onchange=load;
a('labHint').onclick=()=>{a('labHintText').hidden=!a('labHintText').hidden;a('labHint').setAttribute('aria-expanded',String(!a('labHintText').hidden));};
a('labAnswer').addEventListener('input',()=>{answer=null;passed=false;a('labFeedback').textContent='';});
a('labCheck').onclick=()=>{const raw=a('labAnswer').value.trim();if(!raw||!Number.isFinite(Number(raw))){a('labFeedback').textContent='Enter a finite numerical prediction.';return;}answer=Number(raw);passed=Academy.check(current().id,answer);a('labFeedback').textContent=passed?'Correct — prediction mastered.':'Not quite. Use the hint and try again.';if(passed){completed.add(current().id);try{localStorage.setItem('signallab-academy-v13',JSON.stringify([...completed]));}catch(e){}progress();}};
a('labRun').onclick=()=>{const l=current();set({...defaults,...l.preset});result=Academy.run(l.id);a('labExpected').textContent=fmt(result.expected)+' '+result.unit;a('labMeasured').textContent=fmt(result.measured)+' '+result.unit;a('labError').textContent=fmt(result.error)+' '+result.unit;a('labExplanation').textContent=l.explain;a('labResults').hidden=false;a('labExport').disabled=false;};
a('labExport').onclick=()=>{if(!result)return;const blob=new Blob([Academy.report(current().id,result,answer,passed,a('labNotes').value)],{type:'text/markdown;charset=utf-8'});const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download=`signallab-${current().id}-report.md`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};load();
})();
