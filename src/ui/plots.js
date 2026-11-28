/* Canvas presentation layer. Explicit immutable render keys; no numerical state. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;else root.SignalPlots=api;
})(globalThis,()=>{
'use strict';
function sameKey(a,b){return !!a&&!!b&&a.length===b.length&&a.every((v,i)=>Object.is(v,b[i]));}
function createCache(){
 const entries=new WeakMap();
 return {
  matches(canvas,key){return sameKey(entries.get(canvas),key);},
  remember(canvas,key){entries.set(canvas,key.slice());},
  invalidate(canvas){entries.delete(canvas);}
 };
}
const cache=createCache();
function draw(canvas,series,xmax,ymin,ymax,xlabel,ylabel,cursor,formatX,identity){
 const w=canvas.clientWidth,h=canvas.clientHeight,d=Math.max(1,window.devicePixelRatio||1);
 if(w<90||h<90||!(xmax>0)||!(ymax>ymin))return false;
 const width=Math.round(w*d),height=Math.round(h*d);
 const theme=document.documentElement.dataset.theme||'dark';
 const key=identity?[...identity,w,h,d,theme,xmax,ymin,ymax,xlabel,ylabel,cursor]:null;
 if(key&&canvas.width===width&&canvas.height===height&&cache.matches(canvas,key))return false;
 cache.invalidate(canvas);
 if(canvas.width!==width)canvas.width=width;
 if(canvas.height!==height)canvas.height=height;
 const c=canvas.getContext('2d');
 c.setTransform(d,0,0,d,0,0);c.clearRect(0,0,w,h);
 const style=getComputedStyle(document.documentElement);
 const color=k=>style.getPropertyValue('--graph-'+k).trim();
 const l=formatX?65:49,t=12,b=h-36,rt=w-13;
 const px=x=>l+x/xmax*(rt-l),py=y=>b-(y-ymin)/(ymax-ymin)*(b-t);
 c.font='11px system-ui';c.textBaseline='middle';
 // Batch grid lines into one path and resolve theme colors once per draw.
 c.strokeStyle=color('grid');c.lineWidth=1;c.beginPath();
 for(let i=0;i<=5;i++){const x=l+i*(rt-l)/5,y=b-i*(b-t)/5;c.moveTo(x,t);c.lineTo(x,b);c.moveTo(l,y);c.lineTo(rt,y);}
 c.stroke();c.fillStyle=color('text');
 for(let i=0;i<=5;i++){const x=l+i*(rt-l)/5,y=b-i*(b-t)/5;c.textAlign='center';c.fillText(formatX?formatX(xmax*i/5):(xmax*i/5).toFixed(xmax<10?2:1),x,b+12);c.textAlign='right';c.fillText((ymin+(ymax-ymin)*i/5).toFixed(2),l-5,y);}
 c.textAlign='center';c.fillText(xlabel,(l+rt)/2,h-8);c.save();c.translate(10,(t+b)/2);c.rotate(-Math.PI/2);c.fillText(ylabel,0,0);c.restore();
 c.save();c.beginPath();c.rect(l,t,rt-l,b-t);c.clip();
 let seriesIndex=0;
 for(const [data,col] of (typeof series==='function'?series():series)){
  c.setLineDash(seriesIndex%2?[6,4]:[]);
  c.strokeStyle=col;c.lineWidth=1.55;c.beginPath();let first=true;
  for(const p of data){if(p.x>xmax)break;if(!Number.isFinite(p.y)){first=true;continue;}const x=px(p.x),y=py(p.y);first?c.moveTo(x,y):c.lineTo(x,y);first=false;}
  c.stroke();
  if(canvas.id==='phase'){c.fillStyle=col;c.beginPath();for(const p of data){if(p.x>xmax)break;if(Number.isFinite(p.y)){const x=px(p.x),y=py(p.y);if(seriesIndex%2)c.rect(x-2.5,y-2.5,5,5);else{c.moveTo(x+2.5,y);c.arc(x,y,2.5,0,Math.PI*2);}}}c.fill();}
  seriesIndex++;
 }
 c.setLineDash([]);
 if(Number.isFinite(cursor)&&cursor>=0&&cursor<=xmax){c.strokeStyle=color('cursor');c.setLineDash([4,4]);c.beginPath();c.moveTo(px(cursor),t);c.lineTo(px(cursor),b);c.stroke();c.setLineDash([]);}
 c.restore();canvas.plotMax=xmax;
 if(key)cache.remember(canvas,key);
 return true;
}
return {draw,sameKey,createCache,invalidate:canvas=>cache.invalidate(canvas)};
});
