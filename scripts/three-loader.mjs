// Node test resolver matching the browser import map; no npm dependency required.
export function resolve(specifier,context,nextResolve){if(specifier==='three')return{url:new URL('../dist/assets/vendor/three.module.js',import.meta.url).href,shortCircuit:true};return nextResolve(specifier,context);}
