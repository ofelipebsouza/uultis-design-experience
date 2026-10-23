import { PRODUCTS, FINISHES, FABRICS } from './products.js';
import { RESOURCES } from './resources.js';
import { readState, stateQuery } from './state.js';
const studioHeader=document.querySelector('header');
if(studioHeader){studioHeader.className='studio-header';studioHeader.innerHTML='<a href="/" aria-label="Uultis home"><img src="../assets/logo-black.svg" alt="Uultis" width="108" height="34"></a><nav class="studio-nav" aria-label="Primary navigation"><a href="/#collection">Products</a><a href="/#essence">Our Essence</a><a href="/blog/">Journal</a><a href="/stores/">Stores</a><a href="/corporate/">Trade / Dealers</a></nav><a class="back" href="/#collection">Back to collection <span aria-hidden="true">↗</span></a>';}
if(studioHeader){studioHeader.insertAdjacentHTML('beforeend','<details class="studio-mobile-menu"><summary>Menu</summary><nav aria-label="Mobile navigation"><a href="/#collection">Products</a><a href="/#essence">Our Essence</a><a href="/blog/">Journal</a><a href="/stores/">Stores</a><a href="/corporate/">Trade / Dealers</a></nav></details>');}
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const state=readState(location.search,PRODUCTS);let studio=null,auto=false;
const variant=()=>PRODUCTS[state.product].variants.find(v=>v.key===state.variant);
function syncURL(){history.replaceState(null,'',`${location.pathname}?${stateQuery(state)}`);}
function announce(message){$('#action-status').textContent=message;}
function pressed(attr,value){$$(`[data-${attr}]`).forEach(b=>b.setAttribute('aria-pressed',String(b.dataset[attr]===value)));}
function update(rebuild=false){
 for(const key of ['finish','fabric','room','stage'])pressed(key,state[key]);
 $('#finish-label').textContent=FINISHES[state.finish][1];$('#fabric-label').textContent=FABRICS[state.fabric][1];$('#lighting').value=state.lighting;$('#quality').value=state.quality;
 for(const [id,key,suffix] of [['placement','x',' m'],['depth','z',' m'],['rotation','rotation','°']]){$('#'+id).value=state[key];$('#'+id+'-value').textContent=(key==='rotation'?state[key]:state[key].toFixed(2))+suffix;}
 $('#dimensions').setAttribute('aria-pressed',String(state.dimensions));$('#dimension-readout').hidden=!state.dimensions;
 const v=variant(),p=PRODUCTS[state.product];$('#dimension-readout').textContent=`${p.verified?'Overall dimensions':'Approximate study dimensions'} · W ${(v.w*100).toFixed(1)} × D ${(v.d*100).toFixed(1)} × H ${(v.h*100).toFixed(1)} cm`;
 $('#scene-caption').textContent=state.stage==='object'?'OBJECT / MATERIAL STUDY':state.room==='light'?'02 / THE LIGHT GALLERY':'01 / THE WARM GALLERY';
 studio?.update({...state},v,rebuild);syncURL();
}
function selectProduct(id,initial=false){
 state.product=id;const p=PRODUCTS[id];if(!initial){state.variant=p.variants[0].key;state.x=0;state.z=0;state.rotation=0;}
 pressed('product',id);$('#product-name').textContent=p.name;$('#product-designer').textContent=`BY ${p.designer.toUpperCase()}`;$('#product-description').textContent=p.description;
 $('#size').replaceChildren(...p.variants.map(v=>{const o=document.createElement('option');o.value=v.key;o.textContent=v.label;return o;}));$('#size').value=state.variant;
 $('#dimension-source').textContent=p.verified?'FROM THE TECHNICAL SHEET':'APPROXIMATE STUDY PROPORTIONS';$('#fabric-field').hidden=!p.fabric;
 $('#product-link').href=`/#product/${id}`;$('#product-link').textContent=`Discover ${p.name} ↗`;$('#spec-link').href=RESOURCES[id].spec;
 $('#fallback-image').src=`../assets/${id}-thumb.webp`;$('#fallback-image').alt=`${p.name} product photograph`;$('#reference-image').src=`../assets/${id}-thumb.webp`;$('#reference-image').alt=`${p.name} reference photograph`;$('#reference-description').textContent=RESOURCES[id].description;
 $('#announcement').textContent=`${p.name} selected. ${variant().label}.`;update(true);studio?.fit(state.stage==='object'||id==='291'||id==='82'||id==='64'?'detail':'room');
}
function fallback(){studio?.setAuto(false);studio?.dispose();studio=null;auto=false;$('#auto-rotate').setAttribute('aria-pressed','false');$('#viewport').hidden=true;$('#fallback').hidden=false;$('.scene-section').classList.add('photo-mode');$$('[data-render-control] button,[data-render-control] input,[data-render-control] select,.view-tools button').forEach(e=>e.disabled=true);announce('Photo mode is active. Product selection and technical sheets remain available.');}
$$('[data-product]').forEach(b=>b.onclick=()=>selectProduct(b.dataset.product));
for(const key of ['finish','fabric','room','stage'])$$(`[data-${key}]`).forEach(b=>b.onclick=()=>{state[key]=b.dataset[key];update();if(key==='stage')studio?.fit(state.stage==='object'?'detail':'room');});
$('#size').onchange=()=>{state.variant=$('#size').value;$('#announcement').textContent=`${PRODUCTS[state.product].name}: ${variant().label}.`;update(true);studio?.fit('detail');};$('#quality').onchange=()=>{state.quality=$('#quality').value;update();};$('#lighting').onchange=()=>{state.lighting=$('#lighting').value;update();};
for(const[id,key]of [['placement','x'],['depth','z'],['rotation','rotation']])$('#'+id).oninput=()=>{state[key]=Number($('#'+id).value);update();};
$('#dimensions').onclick=()=>{state.dimensions=!state.dimensions;update();};
$('#auto-rotate').onclick=()=>{auto=!auto;studio?.setAuto(auto);$('#auto-rotate').setAttribute('aria-pressed',String(auto));};
$('#zoom-in').onclick=()=>studio?.zoom(.8);$('#zoom-out').onclick=()=>studio?.zoom(1.25);
for(const mode of ['detail','room','top'])$('#view-'+mode).onclick=()=>studio?.fit(mode);$('#reset-camera').onclick=()=>studio?.fit(state.stage==='object'?'detail':'room');
$('#capture').onclick=async()=>{try{const blob=await studio.capture();const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`uultis-${PRODUCTS[state.product].name.toLowerCase()}-study.png`;a.click();setTimeout(()=>URL.revokeObjectURL(url),30000);announce('Scene image saved. This is an illustrative design study.');}catch{announce('The image could not be saved. Please try again.');}};
$('#fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('.scene-section').requestFullscreen();}catch{announce('Full screen is unavailable in this browser.');}};
$('#share').onclick=async()=>{syncURL();try{await navigator.clipboard.writeText(location.href);announce('Studio link copied, including your product, materials and room settings.');}catch{$('#share-url').hidden=false;$('#share-url').value=location.href;$('#share-url').select();announce('Copy this link to share your studio settings.');}};
selectProduct(state.product,true);
try{const {createStudio}=await import('./renderer.js');studio=createStudio($('#viewport'),fallback);update(true);studio.fit(state.stage==='object'||state.product==='291'?'detail':'room');$('#load-status').hidden=true;if(!document.fullscreenEnabled)$('#fullscreen').hidden=true;}catch(error){console.warn('Room Studio: photo mode active.',error.message);fallback();}
window.addEventListener('pagehide',()=>{studio?.dispose();studio=null;},{once:true});window.addEventListener('pageshow',e=>{if(e.persisted)location.reload();});
