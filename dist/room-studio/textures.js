import * as THREE from 'three';
// Small deterministic canvas maps: no photographs, HDR downloads or network requests.
export function createTextures(renderer){
 const owned=[];const size=512;
 function canvas(){const c=document.createElement('canvas');c.width=c.height=size;return c;}
 function map(c,color=false,repeat=1){const t=new THREE.CanvasTexture(c);if(color)t.colorSpace=THREE.SRGBColorSpace;t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(repeat,repeat);t.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());owned.push(t);return t;}
 const wood=canvas(),w=wood.getContext('2d');w.fillStyle='#e9dfc9';w.fillRect(0,0,size,size);
 for(let i=0;i<750;i++){
  const x=(i*137.51)%size,alpha=.025+(i%11)*.009;w.strokeStyle=`rgba(83,59,29,${alpha})`;w.lineWidth=.35+(i%4)*.3;w.beginPath();w.moveTo(x,-15);w.bezierCurveTo(x+Math.sin(i*.7)*14,150,x+Math.cos(i*.4)*9,360,x+Math.sin(i)*6,530);w.stroke();
 }
 const radial=canvas(),r=radial.getContext('2d');r.fillStyle='#e9dfc9';r.fillRect(0,0,size,size);
 for(let i=0;i<6;i++){r.save();r.translate(256,256);r.rotate(i*Math.PI/3);r.beginPath();r.moveTo(0,0);r.arc(0,0,365,-Math.PI/6,Math.PI/6);r.closePath();r.clip();r.rotate(Math.PI/2);r.drawImage(wood,-256,-256);r.restore();}
 const fabric=canvas(),f=fabric.getContext('2d');f.fillStyle='#c5c5c5';f.fillRect(0,0,size,size);
 for(let i=0;i<size;i+=6){f.fillStyle='#dedede';f.fillRect(i,0,2,size);f.fillStyle='#a0a0a066';f.fillRect(0,i,size,2);}
 const glass=canvas(),g=glass.getContext('2d'),pixels=g.createImageData(size,size);let seed=371;
 for(let i=0;i<pixels.data.length;i+=4){seed=(seed*1664525+1013904223)>>>0;const v=118+(seed%20);pixels.data[i]=pixels.data[i+1]=pixels.data[i+2]=v;pixels.data[i+3]=255;}g.putImageData(pixels,0,0);
 const cane=canvas(),a=cane.getContext('2d');a.fillStyle='#000';a.fillRect(0,0,size,size);a.fillStyle='#fff';
 for(let i=0;i<size;i+=32){a.fillRect(i,0,8,size);a.fillRect(0,i,size,8);} // Open weave, cut out without extra geometry.
 const shadow=canvas(),c=shadow.getContext('2d'),gradient=c.createRadialGradient(256,256,10,256,256,250);gradient.addColorStop(0,'rgba(34,29,23,.32)');gradient.addColorStop(.4,'rgba(34,29,23,.18)');gradient.addColorStop(1,'rgba(34,29,23,0)');c.fillStyle=gradient;c.fillRect(0,0,size,size);
 return {cane:map(cane,false,4),wood:map(wood,true),grain:map(wood),radial:map(radial,true),weave:map(fabric,false,3),glass:map(glass,false,2),shadow:map(shadow,true),dispose(){owned.forEach(t=>t.dispose());}};
}
