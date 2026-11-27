/* Independent educational research kernels; no DOM or runtime dependencies. */
(function(root,factory){
 const node=typeof module==='object'&&module.exports;
 const api=factory(node?require('./dsp.js'):root.DSP);
 if(node)module.exports=api;else root.ResearchDSP=api;
})(globalThis,DSP=>{
'use strict';
const windows=['rect','hann','hamming','blackman'];
function weight(w,i,n,periodic=false){
 const a=2*Math.PI*i/(periodic?n:n-1);
 switch(w){case 'rect':return 1;case 'hann':return .5-.5*Math.cos(a);case 'hamming':return .54-.46*Math.cos(a);case 'blackman':return .42-.5*Math.cos(a)+.08*Math.cos(2*a);default:throw Error('Unsupported window');}
}
function firLowpass(fs,fc,taps,w='hamming'){
 if(!Number.isFinite(fs)||fs<=0||!(fc>0&&fc<fs/2)||!Number.isInteger(taps)||taps<3||taps>257||taps%2!==1||!windows.includes(w))throw Error('Invalid FIR parameters');
 const center=(taps-1)/2,ratio=2*fc/fs;
 const h=Float64Array.from({length:taps},(_,i)=>{const k=i-center;return (k===0?ratio:Math.sin(Math.PI*ratio*k)/(Math.PI*k))*weight(w,i,taps);});
 const sum=h.reduce((a,b)=>a+b,0);
 if(!Number.isFinite(sum)||Math.abs(sum)<1e-12)throw Error('Invalid FIR normalization');
 return Float64Array.from(h,v=>v/sum);
}
function firResponse(h,fs,f){
 if(!h.length||!Number.isFinite(fs)||fs<=0||!Number.isFinite(f)||f<0||f>fs/2)throw Error('Invalid response parameters');
 let re=0,im=0;for(let k=0;k<h.length;k++){if(!Number.isFinite(h[k]))throw Error('Nonfinite coefficient');const a=2*Math.PI*f*k/fs;re+=h[k]*Math.cos(a);im-=h[k]*Math.sin(a);}
 return {re,im,magnitude:Math.hypot(re,im)};
}
function step(h){let sum=0;return Float64Array.from(h,v=>sum+=v);}
function snr(clean,noise){
 if(!clean.length||clean.length!==noise.length)throw Error('Mismatched SNR records');
 const power=x=>{let p=0;for(const v of x){if(!Number.isFinite(v))throw Error('Nonfinite SNR input');p+=v*v;}return p;};
 const a=power(clean),b=power(noise);if(a===0||b===0)return null;return 10*Math.log10(a/b);
}
// Fraction of two-sided FFT energy outside a fixed neighbourhood of both tone centres.
function leakage(x,bin,w,guard=4){
 const n=x.length;
 if(!Number.isFinite(bin)||!Number.isInteger(guard)||guard<1||!(bin>guard&&bin<n/2-guard)||!windows.includes(w))throw Error('Invalid leakage configuration');
 const z=DSP.fft(Float64Array.from(x,(v,i)=>v*weight(w,i,n,true)));
 let total=0,out=0;
 for(let k=0;k<n;k++){const p=z.re[k]**2+z.im[k]**2;total+=p;if(Math.min(Math.abs(k-bin),Math.abs(k-(n-bin)))>guard)out+=p;}
 return total>0?out/total:null;
}
return {firLowpass,firResponse,step,snr,leakage,windows};
});
