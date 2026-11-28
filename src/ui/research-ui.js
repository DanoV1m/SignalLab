/* Fixed synthetic research experiment, isolated from live input and academy state. */
(function(){
'use strict';
let previous=null,result=null;
function calculate(taps,fc,w,bin){
 const fs=4096,n=1024,h=ResearchDSP.firLowpass(fs,fc,taps,w),iir=AdvancedDSP.design(fs,'low',fc,0,4);
 const freq=Array.from({length:257},(_,i)=>i*fs/512);
 const fir=freq.map(f=>({x:f,y:DSP.db(ResearchDSP.firResponse(h,fs,f).magnitude,1,-100)}));
 const butter=freq.map(f=>({x:f,y:DSP.db(AdvancedDSP.response(iir,fs,f).magnitude,1,-100)}));
 const length=256,impulse=new Float64Array(length);impulse[0]=1;
 const hi=AdvancedDSP.apply(impulse,iir),hf=new Float64Array(length);hf.set(h);
 const clean=DSP.generate({n,fs,f:128}),noise=DSP.generate({n,fs,f:1536,amp:.5});
 // Compare separate filtered components after the longest FIR startup interval.
 const filter=(x)=>AdvancedDSP.convolve(x,h).slice(taps-1,n);
 const iirFilter=x=>AdvancedDSP.apply(x,iir).slice(taps-1,n);
 const tone=DSP.generate({n,fs,f:bin*fs/n});
 const leak=ResearchDSP.windows.map(name=>({name,value:ResearchDSP.leakage(tone,bin,name)}));
 return {fs,h,hi,hf,si:ResearchDSP.step(hi),sf:ResearchDSP.step(hf),fir,butter,leak,input:ResearchDSP.snr(clean.slice(taps-1),noise.slice(taps-1)),firSNR:ResearchDSP.snr(filter(clean),filter(noise)),iirSNR:ResearchDSP.snr(iirFilter(clean),iirFilter(noise))};
}
function show(){
 if(!visible('filter'))return;
 const taps=num('firTaps'),fc=num('firCutoff'),w=$('firWindow').value,bin=num('leakBin');
 const key=[taps,fc,w,bin].join('|');
 if(key!==previous){result=calculate(taps,fc,w,bin);previous=key;}
 const r=result;
 const trace=x=>Array.from(x,(y,i)=>({x:i,y}));
 const bounds=(a,b)=>{let lo=0,hi=.01;for(const x of [a,b])for(const v of x){lo=Math.min(lo,v);hi=Math.max(hi,v);}return [lo-.05*(hi-lo),hi+.05*(hi-lo)];};
 const pair=(a,b)=>[[trace(a),graphColor('input')],[trace(b),graphColor('output')]];
 plot($('firMagnitude'),()=>[[r.fir,graphColor('input')],[r.butter,graphColor('output')]],r.fs/2,-100,5,'Frequency (Hz)','Gain (dB)',undefined,undefined,[r]);
 const [il,ih]=bounds(r.hf,r.hi),[sl,sh]=bounds(r.sf,r.si);
 plot($('firImpulse'),()=>pair(r.hf,r.hi),255,il,ih,'Sample index','Amplitude',undefined,undefined,[r]);
 plot($('firStep'),()=>pair(r.sf,r.si),255,sl,sh,'Sample index','Amplitude',undefined,undefined,[r]);
 $('firInfo').textContent=taps+' taps · FIR order '+(taps-1)+' · linear-phase delay '+((taps-1)/2)+' samples ('+(1000*(taps-1)/2/r.fs).toFixed(3)+' ms)';
 const fmt=v=>v===null?'undefined':v.toFixed(2)+' dB';
 $('snrInput').textContent=fmt(r.input);$('snrFIR').textContent=fmt(r.firSNR);$('snrIIR').textContent=fmt(r.iirSNR);
 for(const {name,value} of r.leak){$('leak-'+name).textContent=value===null?'undefined':(100*value).toPrecision(4)+'%';}
}
for(const id of ['firTaps','firCutoff','firWindow','leakBin'])$(id).addEventListener('change',show);
globalThis.drawResearch=show;
})();
