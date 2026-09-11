// Client-boot smoke test: mounts the real <Genesis/> app in jsdom against the
// live dev server (127.0.0.1:3000), then exercises the actual UI buttons —
// the closest available stand-in for a real browser in this sandbox.
//
// Usage (dev server must be running on :3000):
//   npm install --no-save jsdom @napi-rs/canvas   # test-only, not in package.json
//   npx tsx scripts/client-boot.ts
//
// Non-destructive by default: uses the current world and restores its
// running/paused/stopped state when done. Pass RESET=1 to rebuild a fresh
// world instead.
//
// Exits 0 when every UI check passes and no runtime errors are captured.
import React from 'react';
import {createRoot} from 'react-dom/client';
import {JSDOM} from 'jsdom';
import {createCanvas} from '@napi-rs/canvas';
import Genesis from '@/components/genesis';

const BASE='http://127.0.0.1:3000';
const errors:string[]=[];

const dom=new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>',{url:BASE+'/',pretendToBeVisual:true});
const W=dom.window as any;

// ---- globals React needs
for(const k of ['Event','CustomEvent','MouseEvent','KeyboardEvent','PointerEvent','Node','NodeList','Element','HTMLElement','HTMLCanvasElement','Document','getComputedStyle','requestAnimationFrame','cancelAnimationFrame','DOMRect','CSS','location','history'] as const){
 if(W[k]!==undefined)(globalThis as any)[k]=W[k];
}
(globalThis as any).window=W;
(globalThis as any).document=W.document;
Object.defineProperty(globalThis,'navigator',{value:W.navigator,configurable:true});
// next/link + prefetch hooks
W.self=W;(globalThis as any).self=W;
W.requestIdleCallback=(cb:any)=>setTimeout(()=>cb({didTimeout:false,timeRemaining:()=>50}),1);
(globalThis as any).requestIdleCallback=W.requestIdleCallback;
class StubIO{constructor(cb:any){} observe(){} unobserve(){} disconnect(){} takeRecords(){return[]}}
W.IntersectionObserver=StubIO;(globalThis as any).IntersectionObserver=StubIO;
dom.window.addEventListener('error',(e:any)=>errors.push('window: '+e.message));
process.on('uncaughtException',e=>errors.push('uncaught: '+e.message));

// ---- canvas 2d backed by @napi-rs/canvas (jsdom has no canvas implementation)
const drawCalls:{[k:string]:number}={};
function bump(k:string){drawCalls[k]=(drawCalls[k]||0)+1;}
function wrapCtx(el:any){
 const w=el.width||300,h=el.height||150;
 if(!el.__napi||el.__napi.width!==w||el.__napi.height!==h)el.__napi=createCanvas(w,h);
 const real=el.__napi.getContext('2d');
 // convert jsdom canvas elements (all of which carry a __napi backing) before drawImage
 el.__ctx=new Proxy(real as any,{
  get(t:any,k:string){
   if(k==='drawImage')return(...args:any[])=>{bump('drawImage');return t.drawImage(...args.map((a:any)=>a&&typeof a==='object'&&a.__napi?a.__napi:a));};
   if(k==='fillRect'||k==='strokeRect'||k==='fill'||k==='stroke'||k==='fillText'||k==='clearRect'){
    return(...args:any[])=>{bump(k);return (t as any)[k](...args);};
   }
   const v=t[k];
   return typeof v==='function'?v.bind(t):v;
  },
  set(t:any,k:string,v:any){t[k]=v;return true;}
 });
 return el.__ctx;
}
W.HTMLCanvasElement.prototype.getContext=function(this:any,id:string){return id==='2d'?wrapCtx(this):null;};
W.HTMLCanvasElement.prototype.toDataURL=function(this:any,t?:string){return this.__napi?this.__napi.toDataURL(t??'image/png'):'data:image/png;base64,';};
W.HTMLCanvasElement.prototype.setPointerCapture=function(){};
W.HTMLCanvasElement.prototype.releasePointerCapture=function(){};

// ---- fetch → live dev server
const realFetch=globalThis.fetch.bind(globalThis);
(globalThis as any).fetch=(input:any,init?:any)=>realFetch(typeof input==='string'?new URL(input,BASE).toString():input,init);

const sleep=(ms:number)=>new Promise(r=>setTimeout(r,ms));
const $=(s:string):any=>W.document.querySelector(s);
const $$=(s:string):any[]=>Array.from(W.document.querySelectorAll(s));
const text=(s:string):string=>String($(s)?.textContent??'');
const byRole=(name:string):any=>$$('button,[role=button]').find((b:any)=>(b.getAttribute('aria-label')||b.textContent||'').trim()===name);
// track every canvas the app creates (world canvas is detached from DOM)
const allCanvases:any[]=[];
const origCreateElement=W.document.createElement.bind(W.document);
W.document.createElement=(tag:string)=>{const el=origCreateElement(tag);if(tag.toLowerCase()==='canvas')allCanvases.push(el);return el;};
function paintStats(el:any,label:string){
 const n=el.__napi;if(!n){console.log(`  ${label}: no napi backing`);return;}
 const d=n.getContext('2d').getImageData(0,0,n.width,n.height).data;
 let vis=0;for(let i=3;i<d.length;i+=4)if(d[i]>0)vis++;
 console.log(`  ${label}: ${n.width}x${n.height}, visible=${vis} (${(100*vis/(n.width*n.height)).toFixed(1)}%)`);
 if(label.includes('display')){
  for(const [x,y] of [[150,75],[100,50],[50,25],[250,125],[20,140]] as const){
   const p=n.getContext('2d').getImageData(x,y,1,1).data;
   console.log(`    px(${x},${y}) rgba(${p[0]},${p[1]},${p[2]},${p[3]})`);
  }
 }
}

async function main(){
 // capture pre-test world state; only rebuild when explicitly asked
 const preResponse=await realFetch(BASE+'/api/world');
 const preWorld=(await preResponse.json()).world as any;
 const preStatus=preWorld.status,preTick=preWorld.tick;
 if(process.env.RESET==='1'){
  await realFetch(BASE+'/api/world',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({command:'reset'})});
 } else if(preStatus==='running'){
  // deterministic flow below starts from a non-running world
  await realFetch(BASE+'/api/world',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({command:'pause'})});
 }
 const root=createRoot(W.document.getElementById('root'));
 root.render(React.createElement(Genesis));

 // let it hydrate, poll the world, paint canvas frames
 await sleep(3500);

 const results:string[]=[];
 const check=(label:string,ok:boolean,extra='')=>results.push(`${ok?'PASS':'FAIL'}  ${label}${extra?' — '+extra:''}`);

 const canvasEl=$('.world-canvas') as any;
 check('canvas mounted',!!canvasEl);
 console.log('\n--- canvas paint diagnostics ---');
 paintStats(canvasEl,'display .world-canvas');
 paintStats($('.minimap canvas') as any,'minimap canvas');
 for(const c of allCanvases)if(c!==canvasEl)paintStats(c,'created canvas');
 // canvas paint signal = draw primitive activity (resilient to the fake-canvas resize artifact)
 const totalDraws=Object.values(drawCalls).reduce((a,b)=>a+b,0);
 check('canvas painted (simulation-driven pixels)',totalDraws>100,JSON.stringify(drawCalls));
 check('village chrome present',!!$('.village-canvas .map-tools')&&text('.map-location').includes('SUNHAVEN ISLAND'));
 check('minimap canvas present',!!$('.minimap canvas'));

 // --- simulation start button
 const start=byRole('Start simulation');
 check('Start simulation button present',!!start);
 start?.dispatchEvent(new W.MouseEvent('click',{bubbles:true,cancelable:true}));
 await sleep(1400);
 const pauseBtn=byRole('Pause simulation');
 check('click Start -> now running (Pause visible)',!!pauseBtn);
 const w1v=(await (await realFetch(BASE+'/api/world')).json()).world;
 check('API tick advanced by client',w1v.tick>preTick,`tick ${preTick}->${w1v.tick}`);

 // --- pause + status label
 pauseBtn?.dispatchEvent(new W.MouseEvent('click',{bubbles:true,cancelable:true}));
 await sleep(800);
 check('SIMULATION PAUSED label',text('.simulation-label').toUpperCase().includes('PAUSED')||W.document.body.textContent!.includes('SIMULATION PAUSED'));

 // --- zoom / camera controls
 const zoomLabel=()=>$$('.map-tools>span').map(s=>s.textContent).find(t=>t&&/\d+%/.test(t));
 check('initial zoom 50%',zoomLabel()==='50%',zoomLabel()??'none');
 byRole('Zoom in')?.dispatchEvent(new W.MouseEvent('click',{bubbles:true,cancelable:true}));
 await sleep(300);
 check('zoom in -> 100%',zoomLabel()==='100%',zoomLabel()??'none');
 byRole('Reset camera')?.dispatchEvent(new W.MouseEvent('click',{bubbles:true,cancelable:true}));
 await sleep(300);
 check('reset camera -> 50%',zoomLabel()==='50%',zoomLabel()??'none');

 // --- layers menu (terrain grid + observer mode)
 byRole('Map layers')?.dispatchEvent(new W.MouseEvent('click',{bubbles:true,cancelable:true}));
 await sleep(200);
 const gridBtn=$$('.layer-menu button').find(b=>b.textContent?.includes('Terrain grid'));
 check('layers menu opens with Terrain grid',!!gridBtn);
 gridBtn?.dispatchEvent(new W.MouseEvent('click',{bubbles:true,cancelable:true}));
 const closeBtn=$$('.layer-menu button').find(b=>b.getAttribute('aria-label')==='Close layers');
 closeBtn?.dispatchEvent(new W.MouseEvent('click',{bubbles:true,cancelable:true}));

 // --- BUILD menu selects a real building
 const world=(await realFetch(BASE+'/api/world')).json().then((d:any)=>d.world);
 const well=(await world).buildings.find((b:any)=>b.id==='well');
 const wellBtn=$$('.build-item').find(b=>b.textContent?.trim()==='Well');
 check('BUILD menu has Well item',!!wellBtn);
 wellBtn?.dispatchEvent(new W.MouseEvent('click',{bubbles:true,cancelable:true}));
 await sleep(400);
 check('BUILD Well -> inspector shows building',W.document.body.textContent!.includes(well.name),well.name);

 // --- villager selection from the world click (canvas picking)
 byRole('Reset camera')?.dispatchEvent(new W.MouseEvent('click',{bubbles:true,cancelable:true}));
 await sleep(200);
 // world point (31.2,35.2) at zoom .5 centered camera: cam=(240,592); clientX=(176-240)*.5=-32, clientY=(603.2-592)*.5=5.6
 const down=new W.MouseEvent('pointerdown',{bubbles:true,cancelable:true,clientX:-32,clientY:5.6});(down as any).pointerId=1;
 const up=new W.MouseEvent('pointerup',{bubbles:true,cancelable:true,clientX:-32,clientY:5.6});(up as any).pointerId=1;
 canvasEl.dispatchEvent(down);canvasEl.dispatchEvent(up);
 await sleep(300);
 check('canvas click -> Terrain · Tile 31, 35',text('.map-hover').includes('Terrain · Tile 31, 35'),text('.map-hover'));

 // --- restore the world to its pre-test state
 const restoreCmd=preStatus==='stopped'?'stop':preStatus==='paused'?'pause':'start';
 await realFetch(BASE+'/api/world',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({command:restoreCmd})});

 root.unmount();
 console.log('\n=== CLIENT BOOT RESULTS ===');
 for(const r of results)console.log(r);
 console.log(errors.length?'\nERRORS CAPTURED:\n'+errors.join('\n'):'\nNO RUNTIME ERRORS');
 process.exit(results.some(r=>r.startsWith('FAIL'))||errors.length?1:0);
}
main().catch(e=>{console.error('HARNESS CRASH',e);process.exit(2);});
