'use strict';
(()=>{
 const modules=['dashboard','analyze','filter','math','academy'];
 const nav=[...document.querySelectorAll('[data-nav]')];
 const theme=document.getElementById('themeToggle');
 const get=id=>document.getElementById(id);
 function read(key){try{return localStorage.getItem(key)}catch{return null}}
 function write(key,value){try{localStorage.setItem(key,value)}catch{}}
 function summary(){get('dashSource').textContent=get('source').textContent;get('dashProgress').textContent=get('labProgress').textContent;}
 function redraw(){requestAnimationFrame(()=>{if(last)drawAnalysis();summary();});}
 function show(id,focus=false){if(!modules.includes(id))id='dashboard';for(const m of modules)get('module-'+m).hidden=m!==id;for(const b of nav){if(b.dataset.nav===id)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');}const full=id==='dashboard'||id==='academy';get('signalControls').hidden=full;document.querySelector('.layout').classList.toggle('full',full);get('workspace').setAttribute('aria-label','Workspace: '+({dashboard:'Overview',analyze:'Signal analyzer',filter:'Filter design',math:'Signal mathematics',academy:'Engineering academy'}[id]));if(focus){get('workspace').focus({preventScroll:true});get('workspace').scrollIntoView({block:'start'});}redraw();}
 function setTheme(value){const light=value==='light';document.documentElement.dataset.theme=light?'light':'dark';theme.textContent='Light theme';theme.setAttribute('aria-pressed',String(light));write('signallab-theme',light?'light':'dark');redraw();}
 for(const b of nav)b.addEventListener('click',()=>show(b.dataset.nav,true));for(const b of document.querySelectorAll('[data-open]'))b.addEventListener('click',()=>show(b.dataset.open,true));
 document.querySelector('.skip').addEventListener('click',e=>{e.preventDefault();get('workspace').focus();get('workspace').scrollIntoView({block:'start'});});
 theme.addEventListener('click',()=>setTheme(document.documentElement.dataset.theme==='light'?'dark':'light'));
 new MutationObserver(summary).observe(get('source'),{childList:true,characterData:true,subtree:true});new MutationObserver(summary).observe(get('labProgress'),{childList:true,characterData:true,subtree:true});
 setTheme(read('signallab-theme'));show('dashboard');
})();
