import * as THREE from 'three';
import { OrbitControls } from '../assets/vendor/OrbitControls.js';
import { RoomEnvironment } from '../assets/vendor/RoomEnvironment.js';
import { buildModel, disposeModel, FINISHES, FABRICS } from './products.js';
import { createRoom } from './room.js';

export function createStudio(viewport,onLost){
 const lowPower=matchMedia('(pointer: coarse)').matches||navigator.connection?.saveData;
 const renderer=new THREE.WebGLRenderer({antialias:!lowPower,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,lowPower?1.25:1.75));
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
 renderer.domElement.setAttribute('aria-hidden','true');viewport.append(renderer.domElement);
 const scene=new THREE.Scene();scene.background=new THREE.Color('#e8e2d8');
 const camera=new THREE.PerspectiveCamera(39,1,.04,40);
 const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=false;controls.enablePan=false;controls.minDistance=.35;controls.maxDistance=10;controls.minPolarAngle=.04;controls.maxPolarAngle=Math.PI/2-.025;controls.rotateSpeed=.55;
 const envScene=new RoomEnvironment();const pmrem=new THREE.PMREMGenerator(renderer);const environment=pmrem.fromScene(envScene,.04);scene.environment=environment.texture;scene.environmentIntensity=.35;envScene.dispose();pmrem.dispose();
 const textures=[];
 function texture(kind){
  const canvas=document.createElement('canvas');canvas.width=canvas.height=256;const c=canvas.getContext('2d');c.fillStyle='#bfbfbf';c.fillRect(0,0,256,256);
  if(kind==='fabric'){
   for(let i=0;i<256;i+=4){c.fillStyle=i%8?'#aaaaaa':'#dedede';c.fillRect(i,0,2,256);c.fillStyle='#93939388';c.fillRect(0,i,256,1);}
  }else{
   for(let i=0;i<380;i++){const x=(i*71)%280-12;c.strokeStyle=`rgba(50,50,50,${.04+(i%7)*.017})`;c.lineWidth=.4+(i%3)*.3;c.beginPath();c.moveTo(x,0);c.bezierCurveTo(x+9*Math.sin(i),90,x+7*Math.cos(i),170,x,256);c.stroke();}
  }
  const t=new THREE.CanvasTexture(canvas);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(kind==='fabric'?5:1,kind==='fabric'?5:1);t.anisotropy=Math.min(4,renderer.capabilities.getMaxAnisotropy());textures.push(t);return t;
 }
 const grain=texture('wood'),weave=texture('fabric');
 const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.6,...extra});
 const m={wood:mat(FINISHES.oak[0],{bumpMap:grain,bumpScale:.0015,roughness:.43}),top:mat(FINISHES.oak[0],{bumpMap:grain,bumpScale:.0007,roughness:.35}),metal:mat('#c4a77b',{metalness:.85,roughness:.28,side:THREE.DoubleSide}),darkMetal:mat('#3c3830',{metalness:.8,roughness:.35}),glass:new THREE.MeshPhysicalMaterial({color:'#bc8e56',roughness:.12,metalness:0,transmission:lowPower?0:.75,transparent:true,opacity:lowPower?.48:1,thickness:.018,ior:1.48,depthWrite:false}),stone:mat('#b2a18a',{roughness:.8}),fabric:mat(FABRICS.linen[0],{bumpMap:weave,bumpScale:.0017,roughness:.92}),seam:mat('#b9ad98',{roughness:1})};
 const interior=createRoom(scene,lowPower,m.wood);
 const platform=new THREE.Mesh(new THREE.PlaneGeometry(30,30),mat('#e8e2d8'));platform.rotation.x=-Math.PI/2;platform.position.y=-.001;platform.receiveShadow=true;scene.add(platform);platform.visible=false;
 let model=null,variant=null,state=null,helper=null,frame=0,auto=false,lastFrame=0,disposed=false;
 function render(){if(disposed||document.hidden)return;renderer.render(scene,camera);}
 function request(){if(!frame&&!disposed&&!document.hidden)frame=requestAnimationFrame(tick);}
 function tick(now){frame=0;if(disposed||document.hidden)return;if(auto){if(now-lastFrame>=33){controls.autoRotate=true;controls.autoRotateSpeed=.6;controls.update(Math.min((now-lastFrame)/1000,.05));lastFrame=now;render();}request();}else render();}
 function shadows(){renderer.shadowMap.needsUpdate=true;request();}
 controls.addEventListener('change',request);
 controls.addEventListener('start',()=>{controls.autoRotate=false;});
 function dimensions(show){if(helper){helper.geometry.dispose();helper.material.dispose();scene.remove(helper);helper=null;}if(show&&model){helper=new THREE.BoxHelper(model,'#7c6847');helper.material.depthTest=false;helper.material.transparent=true;helper.material.opacity=.6;scene.add(helper);}request();}
 function update(next,v,rebuild=false){
  state=next;variant=v;
  if(rebuild||!model){if(model)disposeModel(model);model=buildModel(state.product,v,m);scene.add(model);}
  model.position.set(state.x,.013,state.z+.42);model.rotation.y=THREE.MathUtils.degToRad(state.rotation);
  m.wood.color.set(FINISHES[state.finish][0]);m.top.color.copy(m.wood.color);m.fabric.color.set(FABRICS[state.fabric][0]);m.seam.color.copy(m.fabric.color).multiplyScalar(.8);
  const light=state.room==='light';interior.wall.color.set(light?'#efeee7':'#e4ddd0');interior.floor.color.set(light?'#d7d4c9':'#bbaa8e');interior.rug.color.set(light?'#dcd9cd':'#cbc0ac');scene.background.set(light?'#eeede6':'#e8e2d8');platform.material.color.copy(scene.background);
  interior.room.visible=state.stage==='room';platform.visible=state.stage==='object';
  const lighting={day:['#fff3dd',3.6,[-3,5,3],1.15],golden:['#ffd09a',3,[-4,2.3,2],1.1],evening:['#ffd7ae',1.5,[-2,3,-1],1.05]}[state.lighting];
  interior.sun.color.set(lighting[0]);interior.sun.intensity=lighting[1];interior.sun.position.set(...lighting[2]);renderer.toneMappingExposure=lighting[3];interior.fill.intensity=state.lighting==='evening'?.6:1;
  dimensions(state.dimensions);shadows();
 }
 function fit(mode='room'){
  const target=new THREE.Vector3(state.x,variant.h*.5,state.z+.42);const span=Math.max(variant.w,variant.d,variant.h);
  if(mode==='room'&&state.stage==='room'){controls.target.set(0,.8,-.2);camera.position.set(3.8,2.65,innerWidth<721?5.9:4.7);}
  else{controls.target.copy(target);const distance=span*(camera.aspect<1?3.4:2.5);camera.position.copy(target).add(mode==='top'?new THREE.Vector3(.01,distance,.04):new THREE.Vector3(.65,.45,.9).normalize().multiplyScalar(distance));}
  controls.update();request();
 }
 function zoom(f){const offset=camera.position.clone().sub(controls.target);offset.setLength(THREE.MathUtils.clamp(offset.length()*f,controls.minDistance,controls.maxDistance));camera.position.copy(controls.target).add(offset);controls.update();request();}
 const resize=new ResizeObserver(()=>{const {width,height}=viewport.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();request();});resize.observe(viewport);
 function visibility(){if(document.hidden){cancelAnimationFrame(frame);frame=0;}else{lastFrame=performance.now();request();}}document.addEventListener('visibilitychange',visibility);
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();auto=false;cancelAnimationFrame(frame);frame=0;onLost();});
 viewport.addEventListener('keydown',e=>{
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-'].includes(e.key))return;e.preventDefault();if(['+','=','-'].includes(e.key)){zoom(e.key==='-'?1.15:.87);return;}
  const s=new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));if(e.key==='ArrowLeft')s.theta-=.12;if(e.key==='ArrowRight')s.theta+=.12;if(e.key==='ArrowUp')s.phi-=.09;if(e.key==='ArrowDown')s.phi+=.09;s.phi=THREE.MathUtils.clamp(s.phi,controls.minPolarAngle,controls.maxPolarAngle);camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(s));controls.update();request();
 });
 return {update,fit,zoom,setAuto(value){auto=value;controls.autoRotate=value;lastFrame=performance.now();request();},capture(){render();return new Promise((resolve,reject)=>renderer.domElement.toBlob(b=>b?resolve(b):reject(Error('Capture unavailable')),'image/png'));},dispose(){disposed=true;cancelAnimationFrame(frame);resize.disconnect();document.removeEventListener('visibilitychange',visibility);controls.dispose();const geometries=new Set(),materials=new Set(Object.values(m));scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material);});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());environment.dispose();renderer.dispose();renderer.domElement.remove();}};
}
