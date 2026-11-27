/* SignalLab session model: DOM-free, bounded memoization of immutable sample records. */
(function(root,factory){
 const node=typeof module==='object'&&module.exports;
 const api=factory(node?require('./dsp.js'):root.DSP,node?require('./advanced.js'):root.AdvancedDSP);
 if(node)module.exports=api;else root.SignalSession=api;
})(globalThis,(DSP,AdvancedDSP)=>{
'use strict';
// Zero-extended causal moving average, including the complete convolution tail.
function movingAverageFull(x,m){
 if(!x||!x.length||!Number.isInteger(m)||m<1||m>4096)throw Error('Invalid moving-average input');
 const y=new Float64Array(x.length+m-1);
 let sum=0;
 for(let i=0;i<y.length;i++){
  if(i<x.length){if(!Number.isFinite(x[i]))throw Error('Nonfinite sample');sum+=x[i];}
  if(i>=m&&i-m<x.length)sum-=x[i-m];
  y[i]=sum/m;
 }
 return y;
}
function createSession(){
 let source=null,record=null,reconstruction=null,convolution=null;
 // Arrays returned by this model are immutable by contract. Do not mutate in the UI.
 function input(options,audio=null,offset=0){
  const key=audio?JSON.stringify([options.n,offset]):JSON.stringify([options.n,options.fs,options.f,options.amp,options.type,options.noise,options.f2,options.amp2,options.h,options.seed]);
  if(source&&source.key===key&&source.audio===audio)return source.x;
  let x;
  if(audio){x=new Float64Array(options.n);x.set(audio.samples.subarray(offset,offset+options.n));}
  else x=DSP.generate(options);
  source={key,audio,x};return x;
 }
 function analyze(x,fs,mode,fc,fc2,order,window){
  const key=JSON.stringify([fs,mode,fc,fc2,order,window]);
  if(record&&record.x===x&&record.key===key)return record.value;
  const sections=AdvancedDSP.design(fs,mode,fc,fc2,order);
  const y=AdvancedDSP.apply(x,sections),s=DSP.spectrum(x,fs,window),sy=DSP.spectrum(y,fs,window);
  const value={x,y,fs,s,sy,sections,peak:DSP.peak(s),rms:DSP.rms(y)};
  record={x,key,value};return value;
 }
 function reconstruct(x,k){
  if(reconstruction&&reconstruction.x===x&&reconstruction.k===k)return reconstruction.value;
  const rec=AdvancedDSP.reconstruct(x,k),rms=DSP.rms(x);
  const value={samples:rec.samples,error:DSP.rms(Float64Array.from(x,(v,i)=>v-rec.samples[i])),energy:rms>0?Math.min(100,100*(DSP.rms(rec.samples)/rms)**2):null};
  reconstruction={x,k,value};return value;
 }
 function convolve(x,m){
  if(convolution&&convolution.x===x&&convolution.m===m)return convolution.value;
  const value=movingAverageFull(x,m);convolution={x,m,value};return value;
 }
 function clear(){source=record=reconstruction=convolution=null;}
 return {input,analyze,reconstruct,convolve,clear};
}
return {createSession,movingAverageFull};
});
