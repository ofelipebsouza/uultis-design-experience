import * as THREE from 'three';
import { OrbitControls } from '../assets/vendor/OrbitControls.js';

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const viewport = $('#viewport');
const products = {
  '290': { name:'Star', designer:'Brunno Jahara', description:'A sculptural center for moments shared.', sizes:[['1.6','Ø 160 × H 74.5 cm'],['1.4','Ø 140 × H 74.5 cm']], spec:'https://uultis.storage.appic.cloud/4161/Ficha-Técnica-MH-9153---Star-IN.pdf' },
  '291': { name:'Talha', designer:'Estúdio Uultis', description:'Wood and metal, in a quiet balance.', sizes:[['0.565','Ø 30 × H 56.5 cm'],['0.465','Ø 30 × H 46.5 cm']], spec:'https://uultis.storage.appic.cloud/4153/Ficha-Técnica-MH-9137---MH-9138---Talha-IN.pdf' }
};
const initial = new URLSearchParams(location.search).get('product');
const state = { product:products[initial] ? initial : '290', size:1.6, finish:'oak', room:'warm' };
const scene = new THREE.Scene();
scene.background = new THREE.Color('#e8e2d8');
const camera = new THREE.PerspectiveCamera(39,1,0.05,50);
const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:false, powerPreference:'low-power' });
renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.25;
renderer.domElement.setAttribute('aria-hidden','true');
viewport.appendChild(renderer.domElement);
const controls = new OrbitControls(camera,renderer.domElement);
controls.enableDamping = false;
controls.enablePan = false;
controls.minDistance = 0.65;
controls.maxDistance = 9;
controls.minPolarAngle = 0.18;
controls.maxPolarAngle = Math.PI / 2 - 0.025;
controls.rotateSpeed = 0.55;
controls.zoomSpeed = 0.7;

function material(color, extras={}) { return new THREE.MeshStandardMaterial({ color, roughness:0.8, ...extras }); }
function mesh(geometry, mat, parent, x=0,y=0,z=0) {
  const obj = new THREE.Mesh(geometry,mat); obj.position.set(x,y,z); obj.castShadow=true; obj.receiveShadow=true; parent.add(obj); return obj;
}
function box(w,h,d,mat,parent,x=0,y=0,z=0) { return mesh(new THREE.BoxGeometry(w,h,d),mat,parent,x,y,z); }
function cylinder(rt,rb,h,mat,parent,x=0,y=0,z=0,segments=72) { return mesh(new THREE.CylinderGeometry(rt,rb,h,segments),mat,parent,x,y,z); }
let randomSeed = 22;
function random() { randomSeed=(randomSeed*1664525+1013904223)>>>0; return randomSeed/4294967296; }
function woodTexture(radial=false) {
  const canvas=document.createElement('canvas');canvas.width=canvas.height=512;
  const c=canvas.getContext('2d');c.fillStyle='#d9c7a6';c.fillRect(0,0,512,512);
  const grain=() => { for(let i=0;i<950;i++){const x=random()*600-44;c.beginPath();c.strokeStyle=`rgba(75,42,19,${0.025+random()*0.16})`;c.lineWidth=0.3+random()*1.3;c.moveTo(x,-30);c.bezierCurveTo(x+Math.sin(i)*17,150,x+Math.cos(i)*20,350,x+Math.sin(i*2)*13,550);c.stroke();} };
  if(radial){for(let i=0;i<6;i++){c.save();c.translate(256,256);c.rotate(i*Math.PI/3);c.beginPath();c.moveTo(0,0);c.arc(0,0,380,-Math.PI/6,Math.PI/6);c.closePath();c.clip();c.translate(-256,-256);c.rotate(Math.PI/3);grain();c.restore();}} else grain();
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;texture.anisotropy=Math.min(8,renderer.capabilities.getMaxAnisotropy());return texture;
}
const woodMap=woodTexture(), topMap=woodTexture(true);
const wood=material('#be965f',{map:woodMap,roughness:.46});
const topWood=material('#be965f',{map:topMap,roughness:.42});
const brass=material('#b9a377',{metalness:.62,roughness:.36});
const wall=material('#e4ddd0'), floor=material('#bbaa8e'), trim=material('#d8cbb6');
const textile=material('#d3c7b5'), cushion=material('#dfd6c7'), rug=material('#cbc0ac');
const room=new THREE.Group();scene.add(room);
box(7,.08,7,floor,room,0,-.055,0);
box(7,3.35,.12,wall,room,0,1.62,-2.8);
box(.12,3.35,5.6,wall,room,-3.5,1.62,0);
box(7,.06,.03,trim,room,0,.04,-2.73);
// Architectural window opening represented by luminous panels and timber mullions.
const windowLight=new THREE.MeshBasicMaterial({color:'#f6f1df'});
box(.025,2.35,2.1,windowLight,room,-3.425,1.88,-.35);
for(const z of [-1.42,-.35,.72])box(.07,2.48,.025,trim,room,-3.39,1.88,z);
box(.07,.025,2.2,trim,room,-3.39,1.88,-.35);
// A large tonal artwork keeps the background quiet.
box(1.15,1.5,.035,material('#88795f'),room,.35,1.85,-2.71);
box(1.08,1.43,.04,material('#c7baa0'),room,.35,1.85,-2.68);
const art=mesh(new THREE.CircleGeometry(.36,64),material('#978c74'),room,.35,1.93,-2.65);art.scale.set(1,1.4,1);
const artLine=box(.1,1.14,.02,material('#dfd6c4'),room,.53,1.87,-2.62);artLine.rotation.z=.4;
// Generic context furniture: these are room props, not additional catalog products.
const sofa=new THREE.Group();room.add(sofa);sofa.position.set(-1.1,0,-1.72);
box(1.95,.28,.78,textile,sofa,0,.31,0);
box(1.95,.55,.19,textile,sofa,0,.65,-.34);
for(const x of [-.89,.89])box(.18,.49,.85,textile,sofa,x,.51,.01);
for(const x of [-.43,.43]){box(.82,.13,.62,cushion,sofa,x,.51,.08);const pillow=box(.72,.36,.14,cushion,sofa,x,.73,-.2);pillow.rotation.x=-.15;}
for(const x of [-.78,.78])for(const z of [-.27,.27])cylinder(.026,.022,.18,wood,sofa,x,.09,z,12);
const rugMesh=cylinder(1.58,1.58,.015,rug,room,0,.003,.1,100);rugMesh.scale.set(1.2,1,.9);rugMesh.castShadow=false;
// A ceramic vessel and a restrained branch silhouette.
const plant=new THREE.Group();room.add(plant);plant.position.set(2.3,0,-2.0);
cylinder(.19,.13,.42,material('#afa089'),plant,0,.21,0);
const stemMat=material('#5a5140'), leafMat=material('#69715a',{side:THREE.DoubleSide});
for(let i=0;i<7;i++){
  const branch=new THREE.Group();plant.add(branch);branch.position.y=.3;branch.rotation.z=(i-3)*.095;branch.rotation.y=i*2.4;
  cylinder(.008,.013,1.15,stemMat,branch,0,.55,0,8);
  for(let j=0;j<6;j++){const leaf=mesh(new THREE.SphereGeometry(1,8,6),leafMat,branch,Math.sin(j*2)*.12,.3+j*.14,Math.cos(j*2)*.12);leaf.scale.set(.07,.02,.17);leaf.rotation.set(.3,j*2,.5);}
}
scene.add(new THREE.HemisphereLight('#fff4dc','#8a806d',2.5));
const sun=new THREE.DirectionalLight('#fff0d2',4.0);sun.position.set(-3,5,3);sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-4,right:4,top:4,bottom:-4,near:.1,far:14});sun.shadow.bias=-.0004;sun.shadow.normalBias=.015;sun.shadow.radius=3;scene.add(sun);
const fill=new THREE.DirectionalLight('#e5edff',1.0);fill.position.set(4,3,2);scene.add(fill);
// Soft directional light patches across the rear wall.
const patchMat=new THREE.MeshBasicMaterial({color:'#f4e6cc',transparent:true,opacity:.25,depthWrite:false});
for(let i=0;i<3;i++){const patch=box(.45,2.0,.005,patchMat,room,-2.6+i*.65,1.55,-2.728);patch.rotation.z=-.28;patch.castShadow=false;}
let productGroup=new THREE.Group();scene.add(productGroup);
function disposeGroup(group){group.traverse(o=>{if(o.isMesh)o.geometry.dispose();});scene.remove(group);}
function flutedCone(rt,rb,height){
  const geometry=new THREE.CylinderGeometry(rt,rb,height,144,1,false);const pos=geometry.attributes.position;
  for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i),r=Math.hypot(x,z);if(r<.01)continue;const angle=Math.atan2(z,x),delta=.012*(.5+.5*Math.cos(angle*36));pos.setX(i,x*(r+delta)/r);pos.setZ(i,z*(r+delta)/r);}
  geometry.computeVertexNormals();return geometry;
}
function buildProduct(){
  disposeGroup(productGroup);productGroup=new THREE.Group();scene.add(productGroup);
  if(state.product==='290'){
    const radius=state.size/2;
    mesh(flutedCone(.205,.345,.705),wood,productGroup,0,.3525,0);
    cylinder(.40,.37,.02,wood,productGroup,0,.707,0);
    cylinder(radius-.005,radius,.025,topWood,productGroup,0,.7325,0);
  }else{
    const height=state.size, baseH=height-.185;
    cylinder(.061,.09,baseH,wood,productGroup,0,baseH/2,0);
    cylinder(.10,.10,.004,brass,productGroup,0,baseH+.002,0);
    const sphere=mesh(new THREE.SphereGeometry(.059,40,24,0,Math.PI*2,0,Math.PI/2),wood,productGroup,0,baseH+.004,0);
    const strap=new THREE.CylinderGeometry(.108,.108,.17,40,1,true,-.60,1.2);
    const side=mesh(strap,brass,productGroup,0,height-.085,0);side.material=brass;
    // A narrow curved metal blade supports the top, leaving the wood sphere exposed.
    cylinder(.15,.15,.006,brass,productGroup,0,height-.019,0);
  }
  productGroup.position.set(Number($('#placement').value),.013,.42);
  productGroup.rotation.y=Number($('#rotation').value)*Math.PI/180;
  render();
}
function render(){renderer.render(scene,camera);}
controls.addEventListener('change',render);
function fitView(mode='room'){
  const x=Number($('#placement').value),isSmall=state.product==='291';
  if(mode==='detail'){
    const target=new THREE.Vector3(x,isSmall?state.size*.52:.4,.42);
    controls.target.copy(target);camera.position.copy(target).add(isSmall?new THREE.Vector3(.62,.41,.85):new THREE.Vector3(1.8,1.15,2.1));
  }else{
    controls.target.set(0,.8,-.2);camera.position.set(3.8,2.65,4.7);
    if(innerWidth<721){controls.target.set(0,.95,-.15);camera.position.set(3.8,3.1,5.9);}
  }
  controls.update();render();
}
function selectProduct(id,updateUrl=true){
  state.product=id;const p=products[id];state.size=Number(p.sizes[0][0]);
  $('#product-name').textContent=p.name;$('#product-designer').textContent=`BY ${p.designer.toUpperCase()}`;$('#product-description').textContent=p.description;
  $('#size').replaceChildren(...p.sizes.map(([value,label])=>{const o=document.createElement('option');o.value=value;o.textContent=label;return o;}));
  $('#product-link').href=`/#product/${id}`;$('#product-link').innerHTML=`Discover ${p.name} <span aria-hidden="true">↗</span>`;$('#spec-link').href=p.spec;
  $('#fallback-image').src=`../assets/${id}-thumb.webp`;$('#fallback-image').alt=`${p.name} product photograph`;
  $$('[data-product]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.product===id)));
  $('#placement').value='0';$('#rotation').value='0';$('#placement-value').textContent='0.00 m';$('#rotation-value').textContent='0°';
  buildProduct();fitView(id==='291'?'detail':'room');
  $('#announcement').textContent=`${p.name} selected. ${p.sizes[0][1]}.`;
  if(updateUrl){const u=new URL(location.href);u.searchParams.set('product',id);history.replaceState(null,'',u);}
}
$$('[data-product]').forEach(b=>b.onclick=()=>selectProduct(b.dataset.product));
$('#size').onchange=()=>{state.size=Number($('#size').value);buildProduct();$('#announcement').textContent=`Dimensions changed to ${$('#size').selectedOptions[0].textContent}.`;};
const finishes={oak:['#be965f','Natural oak'],walnut:['#815136','Warm walnut'],dark:['#4d4438','Smoked wood']};
$$('[data-finish]').forEach(b=>b.onclick=()=>{state.finish=b.dataset.finish;const[color,name]=finishes[state.finish];wood.color.set(color);topWood.color.set(color);$('#finish-label').textContent=name;$$('[data-finish]').forEach(el=>el.setAttribute('aria-pressed',String(el===b)));render();});
$$('[data-room]').forEach(b=>b.onclick=()=>{
  state.room=b.dataset.room;const light=state.room==='light';wall.color.set(light?'#efeee7':'#e4ddd0');floor.color.set(light?'#d7d4c9':'#bbaa8e');rug.color.set(light?'#dcd9cd':'#cbc0ac');scene.background.set(light?'#eeede6':'#e8e2d8');sun.color.set(light?'#fffaf1':'#fff0d2');
  $('#scene-caption').textContent=light?'02 / THE LIGHT GALLERY':'01 / THE WARM GALLERY';$$('[data-room]').forEach(el=>el.setAttribute('aria-pressed',String(el===b)));render();
});
$('#placement').oninput=()=>{productGroup.position.x=Number($('#placement').value);$('#placement-value').textContent=`${Number($('#placement').value).toFixed(2)} m`;render();};
$('#rotation').oninput=()=>{productGroup.rotation.y=Number($('#rotation').value)*Math.PI/180;$('#rotation-value').textContent=`${$('#rotation').value}°`;render();};
function zoom(factor){const offset=camera.position.clone().sub(controls.target);offset.setLength(THREE.MathUtils.clamp(offset.length()*factor,controls.minDistance,controls.maxDistance));camera.position.copy(controls.target).add(offset);controls.update();render();}
$('#zoom-in').onclick=()=>zoom(.8);$('#zoom-out').onclick=()=>zoom(1.25);$('#view-detail').onclick=()=>fitView('detail');$('#view-room').onclick=()=>fitView('room');$('#reset-camera').onclick=()=>fitView(state.product==='291'?'detail':'room');
viewport.addEventListener('keydown',event=>{
  if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','=','-'].includes(event.key))return;
  event.preventDefault();if(['+','=','-'].includes(event.key)){zoom(event.key==='-'?1.15:.87);return;}
  const spherical=new THREE.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
  if(event.key==='ArrowLeft')spherical.theta-=.12;if(event.key==='ArrowRight')spherical.theta+=.12;if(event.key==='ArrowUp')spherical.phi-=.09;if(event.key==='ArrowDown')spherical.phi+=.09;
  spherical.phi=THREE.MathUtils.clamp(spherical.phi,controls.minPolarAngle,controls.maxPolarAngle);camera.position.copy(controls.target).add(new THREE.Vector3().setFromSpherical(spherical));controls.update();render();
});
const observer=new ResizeObserver(()=>{const {width,height}=viewport.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();render();});observer.observe(viewport);
renderer.domElement.addEventListener('webglcontextlost',event=>{event.preventDefault();viewport.hidden=true;$('#fallback').hidden=false;$$('aside button,aside select,aside input,.view-tools button').forEach(el=>el.disabled=true);});
window.addEventListener('pagehide',()=>{observer.disconnect();controls.dispose();renderer.dispose();},{once:true});
selectProduct(state.product,false);$('#load-status').hidden=true;
