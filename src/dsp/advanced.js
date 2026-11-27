/* SignalLab V1.2: digital Butterworth sections and spectral experiments. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./dsp.js'):root.DSP);if(typeof module==='object'&&module.exports)module.exports=api;else root.AdvancedDSP=api;})(globalThis,DSP=>{
'use strict';
function design(fs,mode,fc,fc2,order=2){
 if(!Number.isFinite(fs)||fs<=0||!Number.isInteger(order)||order<1||order>8||!['none','low','high','band'].includes(mode))throw Error('Invalid filter configuration');
 if(mode==='none')return [];
 if(!(fc>0&&fc<fs/2)||mode==='band'&&!(fc2>fc&&fc2<fs/2))throw Error('Cutoffs must be ordered inside Nyquist interval');
 function edge(type,f){const k=Math.tan(Math.PI*f/fs),sections=[];const hp=type==='high';
 if(order%2){const g=1/(1+k),b=hp?g:k*g;sections.push({b:[b,hp?-b:b],a:[1,(k-1)*g]});}
 for(let j=0;j<Math.floor(order/2);j++){const q=1/(2*Math.sin(Math.PI*(2*j+1)/(2*order))),g=1/(1+k/q+k*k),b=hp?g:k*k*g;sections.push({b:[b,hp?-2*b:2*b,b],a:[1,2*(k*k-1)*g,(1-k/q+k*k)*g]});}return sections;}
 return mode==='band'?[...edge('high',fc),...edge('low',fc2)]:edge(mode,fc);
}
function apply(x,sections){let y=Float64Array.from(x);for(const {a,b} of sections){let z1=0,z2=0;y=Float64Array.from(y,v=>{const out=b[0]*v+z1;z1=b[1]*v-a[1]*out+z2;z2=(b[2]||0)*v-(a[2]||0)*out;return out;});}return y;}
function response(sections,fs,f){const w=2*Math.PI*f/fs;let re=1,im=0;for(const {a,b} of sections){const evalP=p=>p.reduce((s,v,i)=>[s[0]+v*Math.cos(w*i),s[1]-v*Math.sin(w*i)],[0,0]);const [br,bi]=evalP(b),[ar,ai]=evalP(a),den=ar*ar+ai*ai,rr=(br*ar+bi*ai)/den,ri=(bi*ar-br*ai)/den;[re,im]=[re*rr-im*ri,re*ri+im*rr];}return {f,magnitude:Math.hypot(re,im),phase:Math.atan2(im,re)};}
function roots(p){if(p.length===2)return [{re:-p[1]/p[0],im:0}];const b=p[1]/p[0],c=p[2]/p[0],d=b*b-4*c;return d>=0?[{re:(-b+Math.sqrt(d))/2,im:0},{re:(-b-Math.sqrt(d))/2,im:0}]:[{re:-b/2,im:Math.sqrt(-d)/2},{re:-b/2,im:-Math.sqrt(-d)/2}];}
function poleZero(s){return {poles:s.flatMap(v=>roots(v.a)),zeros:s.flatMap(v=>roots(v.b))};}
// Inverse complex DFT using two real forward FFTs; conjugate trick.
function ifft(re,im){if(re.length!==im.length)throw Error('Mismatched spectra');const a=DSP.fft(re),b=DSP.fft(im),n=re.length;return {re:Float64Array.from(re,(_,i)=>(a.re[i]+b.im[i])/n),im:Float64Array.from(im,(_,i)=>(b.re[i]-a.im[i])/n)};}
function reconstruct(x,keep){const n=x.length;if(!Number.isInteger(keep)||keep<1||keep>n/2+1)throw Error('Invalid retained bin count');const {re,im}=DSP.fft(x);const bins=Array.from({length:n/2+1},(_,k)=>({k,energy:(re[k]**2+im[k]**2)*(k===0||k===n/2?1:2)})).sort((a,b)=>b.energy-a.energy||a.k-b.k);const selected=new Set(bins.slice(0,keep).map(v=>v.k));for(let k=0;k<n;k++)if(!selected.has(Math.min(k,n-k)))re[k]=im[k]=0;return {samples:ifft(re,im).re,bins:[...selected].sort((a,b)=>a-b)};}
function convolve(x,h){if(!x.length||!h.length)throw Error('Empty convolution input');const y=new Float64Array(x.length+h.length-1);for(let i=0;i<x.length;i++)for(let j=0;j<h.length;j++)y[i+j]+=x[i]*h[j];return y;}
return {design,apply,response,poleZero,ifft,reconstruct,convolve};});
