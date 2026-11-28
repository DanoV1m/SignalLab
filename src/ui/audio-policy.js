/* Browser-independent audio resource policy. Post-decode checks cannot bound decoder allocation. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.AudioPolicy=api;})(globalThis,()=>{
'use strict';
const MAX_FILE=25*1024*1024,MAX_TOTAL=30000000,MAX_CHANNELS=8,MAX_SECONDS=600;
function checkFile(file){if(!file||!Number.isSafeInteger(file.size)||file.size<=0||file.size>MAX_FILE)throw Error('Choose a nonempty audio file up to 25 MiB.');}
function mix(buffer){
 const {length,numberOfChannels:channels,sampleRate:fs,duration}=buffer;
 if(!Number.isSafeInteger(length)||length<1||!Number.isSafeInteger(channels)||channels<1||channels>MAX_CHANNELS||!Number.isFinite(fs)||fs<100||fs>384000||!Number.isFinite(duration)||duration<=0||duration>MAX_SECONDS||length/fs>MAX_SECONDS||length*channels>MAX_TOTAL)throw Error('Decoded audio exceeds format or resource limits (600 s, 8 channels, 30 million total channel samples).');
 const samples=new Float32Array(length);
 for(let ch=0;ch<channels;ch++){const data=buffer.getChannelData(ch);if(data.length!==length)throw Error('Invalid audio channel length');for(let i=0;i<length;i++){if(!Number.isFinite(data[i]))throw Error('Nonfinite decoded audio');samples[i]+=data[i]/channels;}}
 if(!samples.every(Number.isFinite))throw Error('Nonfinite mixed audio');
 return {samples,fs};
}
function createGate(){let busy=false;return {acquire(){if(busy)return false;busy=true;return true;},release(){busy=false;},get busy(){return busy;}};}
return {checkFile,mix,createGate,MAX_FILE,MAX_TOTAL};
});
