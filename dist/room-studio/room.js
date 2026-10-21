import * as THREE from 'three';
import { rounded } from './products.js';
export function createRoom(scene,lowPower,wood){
const material=(color,extras={})=>new THREE.MeshStandardMaterial({color,roughness:.8,...extras});
function mesh(g,m,p,x=0,y=0,z=0){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;p.add(o);return o;}
const box=(w,h,d,m,p,x,y,z)=>mesh(new THREE.BoxGeometry(w,h,d),m,p,x,y,z);
const cylinder=(rt,rb,h,m,p,x,y,z,n=48)=>mesh(new THREE.CylinderGeometry(rt,rb,h,n),m,p,x,y,z);
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
rounded(1.95,.28,.78,textile,sofa,0,.31,0);
rounded(1.95,.55,.19,textile,sofa,0,.65,-.34);
for(const x of [-.89,.89])rounded(.18,.49,.85,textile,sofa,x,.51,.01);
for(const x of [-.43,.43]){rounded(.82,.13,.62,cushion,sofa,x,.51,.08);const pillow=rounded(.72,.36,.14,cushion,sofa,x,.73,-.2);pillow.rotation.x=-.15;}
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
scene.add(new THREE.HemisphereLight('#fff4dc','#8a806d',1.25));
const sun=new THREE.DirectionalLight('#fff0d2',4.0);sun.position.set(-3,5,3);sun.castShadow=true;
sun.shadow.mapSize.set(lowPower?1024:2048,lowPower?1024:2048);Object.assign(sun.shadow.camera,{left:-4,right:4,top:4,bottom:-4,near:.1,far:14});sun.shadow.bias=-.0001;sun.shadow.normalBias=.003;sun.shadow.radius=3;scene.add(sun);
const fill=new THREE.DirectionalLight('#e5edff',1.0);fill.position.set(4,3,2);scene.add(fill);
// Soft directional light patches across the rear wall.
const patchMat=new THREE.MeshBasicMaterial({color:'#f4e6cc',transparent:true,opacity:.25,depthWrite:false});
for(let i=0;i<3;i++){const patch=box(.45,2.0,.005,patchMat,room,-2.6+i*.65,1.55,-2.728);patch.rotation.z=-.28;patch.castShadow=false;}

return {room,wall,floor,rug,sun,fill};
}
