/* SignalLab DSP core — real-valued sampled signals, no dependencies. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.DSP=api;})(globalThis,()=>{
'use strict';
function fft(real){const n=real.length;if(n<2||(n&(n-1)))throw Error('FFT length must be a power of two >= 2');const re=Float64Array.from(real),im=new Float64Array(n);for(let i=1,j=0;i<n;i++){let bit=n>>1;for(;j&bit;bit>>=1)j^=bit;j^=bit;if(i<j)[re[i],re[j]]=[re[j],re[i]];}for(let len=2;len<=n;len*=2){for(let i=0;i<n;i+=len){for(let j=0;j<len/2;j++){const a=-2*Math.PI*j/len,c=Math.cos(a),s=Math.sin(a),p=i+j,q=p+len/2,tr=c*re[q]-s*im[q],ti=s*re[q]+c*im[q];re[q]=re[p]-tr;im[q]=im[p]-ti;re[p]+=tr;im[p]+=ti;}}}return {re,im};}
function spectrum(x,fs,window='hann'){const n=x.length,w=Float64Array.from(x,(_,i)=>window==='hann'?0.5-0.5*Math.cos(2*Math.PI*i/n):1),sum=w.reduce((a,b)=>a+b,0);const {re,im}=fft(Float64Array.from(x,(v,i)=>v*w[i]));return Array.from({length:n/2+1},(_,k)=>({f:k*fs/n,a:Math.hypot(re[k],im[k])*(k===0||k===n/2?1:2)/sum,phase:Math.atan2(im[k],re[k])}));}
function wave(type,p,h=9){switch(type){case 'square':return Math.sin(p)>=0?1:-1;case 'triangle':return 2/Math.PI*Math.asin(Math.sin(p));case 'saw':return 2*(p/(2*Math.PI)-Math.floor(p/(2*Math.PI)+0.5));case 'fourier':{let s=0;for(let k=1;k<=h;k+=2)s+=Math.sin(k*p)/k;return 4*s/Math.PI;}default:return Math.sin(p);}}
function generate({n,fs,f,amp=1,type='sine',noise=0,f2=0,amp2=0,h=9,seed=2026}){let state=seed>>>0;function rand(){state=(Math.imul(1664525,state)+1013904223)>>>0;return state/4294967296;}return Float64Array.from({length:n},(_,i)=>amp*wave(type==='chirp'?'sine':type,type==='chirp'?2*Math.PI*(f*i/fs+(f2-f)*(i/fs)**2/(2*((n-1)/fs))):2*Math.PI*f*i/fs,h)+(type==='chirp'?0:amp2)*Math.sin(2*Math.PI*f2*i/fs)+noise*(2*rand()-1));}
function low(x,fs,fc){const a=1-Math.exp(-2*Math.PI*fc/fs);let y=0;return Float64Array.from(x,v=>y+=a*(v-y));}
function high(x,fs,fc){const a=Math.exp(-2*Math.PI*fc/fs);let prev=0,y=0;return Float64Array.from(x,v=>{y=a*(y+v-prev);prev=v;return y;});}
function filter(x,fs,mode,fc,fc2){if(mode==='low')return low(x,fs,fc);if(mode==='high')return high(x,fs,fc);if(mode==='band')return low(high(x,fs,fc),fs,fc2);return Float64Array.from(x);}
function rms(x){return Math.sqrt(x.reduce((s,v)=>s+v*v,0)/x.length);}
function alias(f,fs){return Math.abs(((f+fs/2)%fs+fs)%fs-fs/2);}
function peak(s){return s.slice(1).reduce((p,v)=>v.a>p.a?v:p,{f:0,a:0});}
// Windowed short-time spectra; time coordinate is the centre of each frame.
function stft(x,fs,size=256,hop=size/4,window='hann'){
 if(!Number.isInteger(size)||size<2||(size&(size-1))||size>x.length||!Number.isInteger(hop)||hop<1||!Number.isFinite(fs)||fs<=0)throw Error('Invalid STFT parameters');
 const frames=[];for(let i=0;i+size<=x.length;i+=hop){frames.push({t:(i+(size-1)/2)/fs,bins:spectrum(x.slice(i,i+size),fs,window)});}return frames;
}
function db(a,ref=1,floor=-80){return Math.max(floor,20*Math.log10(Math.max(a,Number.MIN_VALUE)/ref));}
function metrics(x){let min=Infinity,max=-Infinity,sum=0;for(const v of x){min=Math.min(min,v);max=Math.max(max,v);sum+=v;}return {min,max,mean:sum/x.length,pp:max-min,rms:rms(x)};}
return {fft,spectrum,wave,generate,filter,rms,alias,peak,stft,db,metrics};});
