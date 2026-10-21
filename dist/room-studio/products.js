import * as THREE from 'three';
import { RoundedBoxGeometry } from '../assets/vendor/RoundedBoxGeometry.js';

// Modeling studies. Only dimensions explicitly marked verified come from the technical sheets.
export const PRODUCTS = {
 '290':{name:'Star',designer:'Brunno Jahara',category:'Dining table',description:'A sculptural center for moments shared.',verified:true,variants:[{key:'160',label:'Ø 160 × H 74.5 cm',w:1.6,d:1.6,h:.745},{key:'140',label:'Ø 140 × H 74.5 cm',w:1.4,d:1.4,h:.745}]},
 '291':{name:'Talha',designer:'Estúdio Uultis',category:'Occasional table',description:'Wood and metal, in a quiet balance.',verified:true,variants:[{key:'56',label:'Ø 30 × H 56.5 cm',w:.3,d:.3,h:.565},{key:'46',label:'Ø 30 × H 46.5 cm',w:.3,d:.3,h:.465}]},
 '289':{name:'Sintonia',designer:'Estúdio Uultis',category:'Coffee table',description:'Glass, timber and the light between them.',verified:true,variants:[{key:'180',label:'180 × 70 × H 37 cm',w:1.8,d:.7,h:.37},{key:'160',label:'160 × 70 × H 37 cm',w:1.6,d:.7,h:.37}]},
 '82':{name:'Like',designer:'Sérgio Batista',category:'Occasional table',description:'A light silhouette with a distinctive gesture.',verified:false,variants:[{key:'study',label:'Single piece · study proportions',w:.4,d:.4,h:.75}]},
 '64':{name:'Grain',designer:'Stúdio+A!',category:'Stool',description:'Sculpted wood meets a softly upholstered seat.',verified:false,fabric:true,variants:[{key:'study',label:'Stool · study proportions',w:.51,d:.54,h:1.02}]},
 '100':{name:'New',designer:'Sérgio Batista',category:'Ottoman',description:'Soft volume. A versatile place to pause.',verified:false,fabric:true,variants:[{key:'square',label:'Square · study proportions',w:.55,d:.55,h:.45},{key:'wide',label:'Wide · study proportions',w:.85,d:.55,h:.45}]}
};
export const PRODUCT_IDS = ['290','291','289','82','64','100'];
export const FINISHES = {oak:['#c5a57a','Natural oak'],walnut:['#8b6247','Warm walnut'],dark:['#51483e','Smoked wood']};
export const FABRICS = {linen:['#d9cfbc','Natural linen'],sage:['#899180','Sage weave'],clay:['#af7963','Clay weave']};
export function addMesh(g,m,parent,x=0,y=0,z=0){const o=new THREE.Mesh(g,m);o.position.set(x,y,z);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;}
export function rounded(w,h,d,m,parent,x=0,y=0,z=0,r=.02){return addMesh(new RoundedBoxGeometry(w,h,d,5,Math.min(r,w/2,h/2,d/2)),m,parent,x,y,z);}
export function cylinder(rt,rb,h,m,parent,x=0,y=0,z=0,n=96){return addMesh(new THREE.CylinderGeometry(rt,rb,h,n),m,parent,x,y,z);}
function rod(a,b,r,m,parent,r2=r){const start=new THREE.Vector3(...a),end=new THREE.Vector3(...b);const o=cylinder(r,r2,start.distanceTo(end),m,parent);o.position.copy(start).add(end).multiplyScalar(.5);o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),end.sub(start).normalize());return o;}
function tube(points,r,m,parent){return addMesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(p=>new THREE.Vector3(...p))),56,r,12,false),m,parent);}
function flutedCone(rt,rb,h){const g=new THREE.CylinderGeometry(rt,rb,h,288,4);const pos=g.attributes.position;for(let i=0;i<pos.count;i++){const x=pos.getX(i),z=pos.getZ(i),r=Math.hypot(x,z);if(r<.01)continue;const delta=.009*(.5+.5*Math.cos(Math.atan2(z,x)*36));pos.setX(i,x*(r+delta)/r);pos.setZ(i,z*(r+delta)/r);}g.computeVertexNormals();return g;}

function softCylinder(rt,rb,h,m,parent,x=0,y=0,z=0){
 const bevel=Math.min(.004,h*.12),points=[new THREE.Vector2(0,-h/2),new THREE.Vector2(rb-bevel,-h/2),new THREE.Vector2(rb,-h/2+bevel),new THREE.Vector2(rt,h/2-bevel),new THREE.Vector2(rt-bevel,h/2),new THREE.Vector2(0,h/2)];
 const g=new THREE.LatheGeometry(points,96),uv=g.attributes.uv,pos=g.attributes.position,normal=g.attributes.normal;for(let i=0;i<pos.count;i++)if(Math.abs(normal.getY(i))>.8)uv.setXY(i,pos.getX(i)/(Math.max(rt,rb)*2)+.5,pos.getZ(i)/(Math.max(rt,rb)*2)+.5);return addMesh(g,m,parent,x,y,z);
}
function slab(w,d,h,r,m,parent,x=0,y=0,z=0){
 const shape=new THREE.Shape();const a=-w/2,b=-d/2;
 shape.moveTo(a+r,b);shape.lineTo(a+w-r,b);shape.quadraticCurveTo(a+w,b,a+w,b+r);shape.lineTo(a+w,b+d-r);shape.quadraticCurveTo(a+w,b+d,a+w-r,b+d);shape.lineTo(a+r,b+d);shape.quadraticCurveTo(a,b+d,a,b+d-r);shape.lineTo(a,b+r);shape.quadraticCurveTo(a,b,a+r,b);
 const g=new THREE.ExtrudeGeometry(shape,{depth:h,bevelEnabled:false,curveSegments:12,steps:1});g.rotateX(-Math.PI/2);g.translate(0,-h/2,0);g.computeVertexNormals();return addMesh(g,m,parent,x,y,z);
}
function cushion(w,h,d,m,parent,x,y,z,exponent=.45,saddle=false){
 const g=new THREE.SphereGeometry(1,48,32),p=g.attributes.position;
 const power=v=>Math.sign(v)*Math.pow(Math.abs(v),exponent);
 for(let i=0;i<p.count;i++){const px=power(p.getX(i))*w/2,pz=power(p.getZ(i))*d/2;let py=power(p.getY(i))*h/2;if(saddle)py+=.022*Math.pow(px/(w/2),2)-.008*Math.pow(pz/(d/2),2);p.setXYZ(i,px,py,pz);}
 g.computeVertexNormals();return addMesh(g,m,parent,x,y,z);
}
function arcBlade(radius,thickness,height,m,parent,y){
 const points=[new THREE.Vector2(radius,-height/2),new THREE.Vector2(radius+thickness,-height/2),new THREE.Vector2(radius+thickness,height/2),new THREE.Vector2(radius,height/2),new THREE.Vector2(radius,-height/2)];
 return addMesh(new THREE.LatheGeometry(points,40,-.6,1.2),m,parent,0,y,0);
}

export function buildModel(id,variant,m){
 const group=new THREE.Group();const {w,d,h}=variant;
 if(id==='290'){
  addMesh(flutedCone(.205,.345,.705),m.wood,group,0,.3525,0);
  cylinder(.4,.37,.02,m.wood,group,0,.707,0);
  // A slim bevel separates the sunburst veneer from its edge.
  softCylinder(w/2,w/2,.025,m.radial||m.top,group,0,.7325,0);
 }else if(id==='291'){
  const base=h-.185;softCylinder(.061,.09,base,m.wood,group,0,base/2,0);
  cylinder(.10,.10,.004,m.metal,group,0,base+.002,0);
  addMesh(new THREE.SphereGeometry(.059,32,16,0,Math.PI*2,0,Math.PI/2),m.wood,group,0,base+.004,0);
  arcBlade(.104,.0025,.17,m.metal,group,h-.085);
  softCylinder(.15,.15,.006,m.metal,group,0,h-.019,0);
 }else if(id==='289'){
  const trayX=-w*.22;rounded(.36,.30,.42,m.wood,group,trayX,.15,0,.035);rounded(.25,.30,.29,m.wood,group,w*.27,.15,0,.04);
  const glass=slab(w,d,.012,.045,m.glass,group,0,.306,0);glass.castShadow=false;
  rounded(.36,.014,.42,m.stone,group,trayX,.316,0,.006);
  for(const x of [-.18,.18])rounded(.018,.055,.44,m.wood,group,trayX+x,.3425,0,.008);
  for(const z of [-.22,.22])rounded(.36,.055,.018,m.wood,group,trayX,.3425,z,.008);
 }else if(id==='82'){
  softCylinder(.2,.197,.018,m.top,group,0,.574,0);
  tube([[-.15,.014,.14],[.07,.014,.09],[.11,.065,.03],[.10,.30,-.04],[.09,.57,-.12],[.08,.65,-.12],[.04,.71,-.15]],.01,m.darkMetal,group);
  rod([-.17,.014,-.12],[.17,.014,-.12],.012,m.darkMetal,group);rod([.05,.02,-.12],[.10,.065,.03],.01,m.darkMetal,group);
  rod([.04,.71,-.15],[-.006,.77,-.19],.012,m.wood,group);
  rod([-.15,.014,.14],[-.18,.014,.15],.012,m.wood,group);
  for(const x of [-.17,.17])rod([x,.014,-.12],[x+(x>0?.025:-.025),.014,-.12],.013,m.wood,group);
 }else if(id==='64'){
  // Splayed solid-wood frame, cushioned saddle and softened backrest.
  for(const x of [-1,1]){
   rod([x*.23,.018,.23],[x*.20,.69,.18],.025,m.wood,group,.017);
   rod([x*.22,.018,-.23],[x*.205,.956,-.18],.024,m.wood,group,.017);
   rod([x*.20,.64,.18],[x*.20,.64,-.18],.024,m.wood,group);
   rod([x*.225,.29,.22],[x*.22,.29,-.22],.014,m.wood,group);
  }
  rod([-.22,.29,.22],[.22,.29,.22],.015,m.wood,group);
  rod([-.20,.65,.18],[.20,.65,.18],.026,m.wood,group);
  cushion(.50,.09,.47,m.fabric,group,0,.695,.015,.42,true);
  rod([-.25,.948,-.18],[.25,.948,-.18],.025,m.wood,group);
  for(const x of [-.25,.25])addMesh(new THREE.SphereGeometry(.025,24,16),m.wood,group,x,.948,-.18);
  const back=cushion(.40,.145,.105,m.fabric,group,0,.95,-.176,.85);back.rotation.x=-.12;
  rod([-.20,.29,.18],[.20,.29,-.18],.013,m.wood,group);
 }else if(id==='100'){
  cushion(w-.015,h-.045,d-.015,m.fabric,group,0,(h-.045)/2+.045,0,.24);
  for(const x of [-w*.30,w*.30])rounded(.08,.045,d*.64,m.wood,group,x,.0225,0,.006);
  // Fine upholstery welt follows the vertical sides.
  for(const x of [-1,1])for(const z of [-1,1])tube([[x*(w/2-.035),.075,z*(d/2-.04)],[x*(w/2-.01),h*.5,z*(d/2-.025)],[x*(w/2-.04),h-.065,z*(d/2-.04)]],.0025,m.seam,group);
 }
 // Overall dimensions are deliberate; study dimensions are labelled as estimates in the UI.
 const bounds=new THREE.Box3().setFromObject(group),actual=bounds.getSize(new THREE.Vector3());
 group.scale.set(w/actual.x,h/actual.y,d/actual.z);
 group.position.y=-bounds.min.y*group.scale.y;
 const root=new THREE.Group();root.add(group);root.userData={id,variant:variant.key,dimensions:{w,d,h}};return root;
}
export function disposeModel(group){const geometries=new Set();group.traverse(o=>{if(o.geometry)geometries.add(o.geometry);});geometries.forEach(g=>g.dispose());group.removeFromParent();}
