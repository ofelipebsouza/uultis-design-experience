import * as THREE from 'three';
import { OrbitControls } from '../assets/vendor/OrbitControls.js';
import { RoomEnvironment } from '../assets/vendor/RoomEnvironment.js';
import { buildModel, disposeModel, FINISHES, FABRICS } from './products.js';
import { createRoom } from './room.js';
import { createTextures } from './textures.js';

export function createStudio(viewport,onLost){
 const lowPower=matchMedia('(pointer: coarse)').matches||navigator.connection?.saveData;
 const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,lowPower?1.5:2));
 renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;
 renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 renderer.domElement.setAttribute('aria-hidden','true');viewport.append(renderer.domElement);
 const scene=new THREE.Scene();scene.background=new THREE.Color('#e8e2d8');
 const camera=new THREE.PerspectiveCamera(39,1,.04,40);
 const controls=new OrbitControls(camera,renderer.domElement);controls.enableDamping=false;controls.enablePan=false;controls.minDistance=.35;controls.maxDistance=10;controls.minPolarAngle=.04;controls.maxPolarAngle=Math.PI/2-.025;controls.rotateSpeed=.55;
 const envScene=new RoomEnvironment();const pmrem=new THREE.PMREMGenerator(renderer);const environment=pmrem.fromScene(envScene,.04);scene.environment=environment.texture;scene.environmentIntensity=.65;envScene.dispose();pmrem.dispose();
 const maps=createTextures(renderer),grain=maps.grain,weave=maps.weave;
 const mat=(color,extra={})=>new THREE.MeshStandardMaterial({color,roughness:.6,...extra});
 const m={wood:mat(FINISHES.oak[0],{map:maps.wood,bumpMap:grain,bumpScale:.00065,roughness:.46}),top:mat(FINISHES.oak[0],{map:maps.wood,bumpMap:grain,bumpScale:.00035,roughness:.4}),radial:mat(FINISHES.oak[0],{map:maps.radial,bumpMap:grain,bumpScale:.00025,roughness:.4}),metal:mat('#c4b294',{metalness:.78,roughness:.4,side:THREE.DoubleSide}),darkMetal:mat('#68635a',{metalness:.8,roughness:.35}),glass:new THREE.MeshPhysicalMaterial({color:'#c79f68',bumpMap:maps.glass,bumpScale:.00045,roughness:.23,metalness:0,transmission:lowPower?0:.72,transparent:true,opacity:lowPower?.65:1,thickness:.018,ior:1.48,depthWrite:false}),stone:mat('#b2a18a',{roughness:.8}),fabric:new THREE.MeshPhysicalMaterial({color:FABRICS.linen[0],bumpMap:weave,bumpScale:.0007,roughness:.92,sheen:.35,sheenRoughness:.85,sheenColor:'#eee9de'}),seam:mat('#b9ad98',{roughness:1})};
 m.steel=mat('#dadcdb',{metalness:.95,roughness:.23});
 m.mirror=mat('#eeeeea',{metalness:1,roughness:.08});
 m.cane=mat('#ded2ad',{alphaMap:maps.cane,alphaTest:.5,side:THREE.DoubleSide,roughness:.9});
 m.clearGlass=new THREE.MeshPhysicalMaterial({color:'#ffffff',roughness:.08,transmission:lowPower?0:.92,transparent:true,opacity:lowPower?.18:1,thickness:.006,ior:1.48,depthWrite:false});
 const interior=createRoom(scene,lowPower,m.wood);
 const contact=new THREE.Mesh(new THREE.PlaneGeometry(1,1),new THREE.MeshBasicMaterial({map:maps.shadow,transparent:true,depthWrite:false,toneMapped:false,opacity:.65}));contact.rotation.x=-Math.PI/2;scene.add(contact);
 let currentQuality='';
 function sizeCanvas(){const {width,height}=viewport.getBoundingClientRect();if(!width||!height)return;const high=currentQuality==='high';const budget=high?5000000:3000000;const cap=high?2.5:(lowPower?1.5:2);renderer.setPixelRatio(Math.min(Math.max(devicePixelRatio,high?1.5:1),cap,Math.sqrt(budget/(width*height))));renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();}
 function quality(value){if(value===currentQuality)return;currentQuality=value;sizeCanvas();const n=Math.min(renderer.capabilities.maxTextureSize,value==='high'?4096:2048);interior.sun.shadow.mapSize.set(n,n);interior.sun.shadow.map?.dispose();interior.sun.shadow.map=null;}
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
  state=next;variant=v;quality(state.quality);
  if(rebuild||!model){if(model)disposeModel(model);model=buildModel(state.product,v,m);scene.add(model);}
  model.position.set(state.x,.013,state.z+.42);model.rotation.y=THREE.MathUtils.degToRad(state.rotation);contact.position.set(state.x,.014,state.z+.42);contact.scale.set(v.w*1.3,v.d*1.3,1);contact.rotation.z=-model.rotation.y;
  m.wood.color.set(FINISHES[state.finish][0]);m.top.color.copy(m.wood.color);m.radial.color.copy(m.wood.color);m.fabric.color.set(FABRICS[state.fabric][0]);m.seam.color.copy(m.fabric.color).multiplyScalar(.8);
  const light=state.room==='light';interior.wall.color.set(light?'#efeee7':'#e4ddd0');interior.floor.color.set(light?'#d7d4c9':'#bbaa8e');interior.rug.color.set(light?'#dcd9cd':'#cbc0ac');scene.background.set(light?'#eeede6':'#e8e2d8');platform.material.color.copy(scene.background);
  interior.room.visible=state.stage==='room';platform.visible=state.stage==='object';
  const lighting={day:['#fff5e7',2.5,[-3,5,3],1.05],golden:['#ffdbb5',2.2,[-4,2.8,2],1.0],evening:['#ffd7ae',1.35,[-2,3,-1],1.0]}[state.lighting];
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
 const resize=new ResizeObserver(()=>{sizeCanvas();request();});resize.observe(viewport);
 function visibility(){if(document.hidden){cancelAnimationFrame(frame);frame=0;}else{lastFrame=performance.now();request();}}document.addEventListener('visibilitychange',visibility);
 renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();auto=false;cancelAnimationFrame(frame);frame=0;onLost();});
 viewport.addEventListener('keydown',e=>{
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-'].includes(e.key))return;e.preventDefault();if(['+','=','-'].includes(e.key)){zoom(e.key==='-'?1.15:.87);return;}
  const s=new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));if(e.key==='ArrowLeft')s.theta-=.12;if(e.key==='ArrowRight')s.theta+=.12;if(e.key==='ArrowUp')s.phi-=.09;if(e.key==='ArrowDown')s.phi+=.09;s.phi=THREE.MathUtils.clamp(s.phi,controls.minPolarAngle,controls.maxPolarAngle);camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(s));controls.update();request();
 });
 return {update,fit,zoom,setAuto(value){auto=value;controls.autoRotate=value;lastFrame=performance.now();request();},capture(){render();return new Promise((resolve,reject)=>renderer.domElement.toBlob(b=>b?resolve(b):reject(Error('Capture unavailable')),'image/png'));},dispose(){disposed=true;cancelAnimationFrame(frame);resize.disconnect();document.removeEventListener('visibilitychange',visibility);controls.dispose();const geometries=new Set(),materials=new Set(Object.values(m));scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material);});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());maps.dispose();interior.sun.shadow.dispose();environment.dispose();renderer.dispose();renderer.domElement.remove();}};
}
