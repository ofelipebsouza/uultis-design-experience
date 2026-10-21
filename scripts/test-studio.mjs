import assert from 'node:assert/strict';
import { register } from 'node:module';
register('./three-loader.mjs',import.meta.url);
const THREE=await import('../dist/assets/vendor/three.module.js');
const {PRODUCTS,PRODUCT_IDS,buildModel,disposeModel}=await import('../dist/room-studio/products.js');
const {readState,stateQuery}=await import('../dist/room-studio/state.js');
const {createRoom}=await import('../dist/room-studio/room.js');
const material=new THREE.MeshStandardMaterial();const materials=Object.fromEntries(['wood','top','metal','darkMetal','glass','stone','fabric','seam'].map(k=>[k,material]));
let variants=0,maxTriangles=0,maxMeshes=0;
for(const id of PRODUCT_IDS)for(const v of PRODUCTS[id].variants){
 const model=buildModel(id,v,materials);const bounds=new THREE.Box3().setFromObject(model);const size=bounds.getSize(new THREE.Vector3());
 for(const [axis,value]of [['x',v.w],['y',v.h],['z',v.d]])assert.ok(Math.abs(size[axis]-value)<1e-6,`${id} ${axis} dimensions`);
 assert.ok(Math.abs(bounds.min.y)<1e-6,'Ground contact');let triangles=0,meshes=0,disposed=0;const geometries=new Set();
 model.traverse(o=>{if(!o.isMesh)return;meshes++;triangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;for(const n of o.geometry.attributes.position.array)assert.ok(Number.isFinite(n),`${id} invalid vertex`);geometries.add(o.geometry);});
 geometries.forEach(g=>g.addEventListener('dispose',()=>disposed++));assert.ok(triangles<20000,`${id} triangle budget`);assert.ok(meshes<30,`${id} mesh budget`);disposeModel(model);assert.equal(disposed,geometries.size);maxTriangles=Math.max(maxTriangles,triangles);maxMeshes=Math.max(maxMeshes,meshes);variants++;
}
const scene=new THREE.Scene();createRoom(scene,true,material);let roomTriangles=0;scene.traverse(o=>{if(o.isMesh)roomTriangles+=(o.geometry.index?.count||o.geometry.attributes.position.count)/3;});assert.ok(roomTriangles<30000);
const state=readState('?product=__proto__&x=Infinity&z=-9&rotation=999&finish=unknown&lighting=golden',PRODUCTS);assert.equal(state.product,'290');assert.equal(state.x,0);assert.equal(state.z,-.5);assert.equal(state.rotation,360);assert.equal(state.finish,'oak');assert.equal(state.lighting,'golden');assert.deepEqual(readState('?'+stateQuery(state),PRODUCTS),state);
const grain=readState('?product=64&fabric=sage&stage=object&dimensions=1',PRODUCTS);assert.equal(grain.variant,'study');assert.equal(grain.dimensions,true);assert.equal(grain.fabric,'sage');assert.equal(grain.stage,'object');
console.log(JSON.stringify({products:PRODUCT_IDS.length,variants,maxProductTriangles:maxTriangles,maxProductMeshes:maxMeshes,roomTriangles,checks:'dimensions, finite geometry, disposal, budgets, URL validation and round-trip passed'}));
