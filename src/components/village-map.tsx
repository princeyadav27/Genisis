'use client';
// Sunhaven village — tile-based isometric pixel-art canvas renderer.
// Pure presentation layer: every pixel is derived from simulation state (World).
import React,{useRef,useState} from 'react';
import type {World,Resident,Building} from '@/lib/simulation';
import {GRID,TILE_W,TILE_H,ORIGIN,WORLD,iso,foot,unproject,buildTileMap,buildDeco} from './pixel/world';
import {setSurfaceFactory,bakeTiles,bakeNature,bakeBuildings,bakeProps,bakeCharacter,characterHash,type Surface} from './pixel/sprites';
import {drawWorld,drawObserver,setCharacter,setSelected,type Frame,View,Assets} from './pixel/renderer';
import {Check,Compass,Eye,Hammer,Layers,LocateFixed,Minus,Navigation,Plus,X} from 'lucide-react';

export {iso,unproject,ORIGIN,WORLD,TILE_W,TILE_H} from './pixel/world';

const ZOOMS=[.25,.5,1,2,3,4];
const BUILD_ITEMS:[string,string][]=[['House','home-0'],['Farm','farm'],['Well','well'],['Market','market'],['Barn','storage'],['Workshop','workshop']];
const buildIcon=(k:string)=>{
 switch(k){
  case 'house':return <svg viewBox="0 0 20 20" width="17" height="17" aria-hidden="true"><path d="M3 10L10 4l7 6" fill="none" stroke="currentColor" strokeWidth="1.8"/><path d="M5 9.5V16h10V9.5" fill="none" stroke="currentColor" strokeWidth="1.8"/><rect x="8.4" y="11.5" width="3.2" height="4.5" fill="currentColor"/></svg>;
  case 'farm':return <svg viewBox="0 0 20 20" width="17" height="17" aria-hidden="true"><path d="M10 17V6" stroke="currentColor" strokeWidth="1.7"/><path d="M10 8L6.5 5M10 11l3.5-3M10 14l-3.5-3" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/><path d="M4 17h12" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/></svg>;
  case 'well':return <svg viewBox="0 0 20 20" width="17" height="17" aria-hidden="true"><circle cx="10" cy="12.5" r="5" fill="none" stroke="currentColor" strokeWidth="1.7"/><circle cx="10" cy="12.5" r="2" fill="currentColor"/><path d="M5 10L10 4l5 6" fill="none" stroke="currentColor" strokeWidth="1.7"/></svg>;
  case 'market':return <svg viewBox="0 0 20 20" width="17" height="17" aria-hidden="true"><path d="M3 7l1.5-3h11L17 7" fill="none" stroke="currentColor" strokeWidth="1.7"/><path d="M3 7c0 1.5 1.5 2 2.5 2s1.5-.5 2-1 1.5-.5 2 0 2 1 3 1S15 8.5 15 7" fill="none" stroke="currentColor" strokeWidth="1.5"/><path d="M5 9.5V16h10V9.5" fill="none" stroke="currentColor" strokeWidth="1.7"/></svg>;
  case 'barn':return <svg viewBox="0 0 20 20" width="17" height="17" aria-hidden="true"><path d="M3 9L10 4l7 5v8H3Z" fill="none" stroke="currentColor" strokeWidth="1.7"/><path d="M10 8v8M6 9.5l8 7M14 9.5l-8 7" stroke="currentColor" strokeWidth="1.2"/></svg>;
  case 'workshop':return <svg viewBox="0 0 20 20" width="17" height="17" aria-hidden="true"><path d="M4 16V7l6-3 6 3v9" fill="none" stroke="currentColor" strokeWidth="1.7"/><rect x="7" y="11" width="6" height="5" fill="currentColor"/><path d="M14 7V3h2" fill="none" stroke="currentColor" strokeWidth="1.7"/></svg>;
 }
 return null;
};
type Hit={id:string;name:string;text:string};
function clampPan(p:{x:number;y:number},z:number,cw:number,ch:number){
 const sw=cw/z,sh=ch/z;
 let x=p.x,y=p.y;
 if(sw>=WORLD.w)x=WORLD.cx;else x=Math.max(sw/2,Math.min(WORLD.w-sw/2,x));
 if(sh>=WORLD.h)y=WORLD.cy;else y=Math.max(sh/2,Math.min(WORLD.h-sh/2,y));
 return {x,y};
}
const MINI={w:143,h:81,sc:1.06,oy:2};
const miniOx=()=>(MINI.w-GRID*MINI.sc)/2;

export default function VillageMap({world,selected,onSelect,follow,onFollow}:{world:World;selected:string|null;onSelect:(id:string)=>void;follow:boolean;onFollow:()=>void}){
 const canvasRef=useRef<HTMLCanvasElement>(null);
 const miniRef=useRef<HTMLCanvasElement>(null);
 const [zoomIdx,setZoomIdx]=useState(1);
 const [labels,setLabels]=useState(true);
 const [grid,setGrid]=useState(false);
 const [observer,setObserver]=useState(false);
 const [layerOpen,setLayerOpen]=useState(false);
 const [buildOpen,setBuildOpen]=useState(true);
 const [hover,setHover]=useState<string|null>(null);
 const cam=useRef({x:WORLD.cx,y:WORLD.cy});
 const zoomRef=useRef(ZOOMS[1]);
 const dragRef=useRef<{px:number;py:number;cx:number;cy:number;moved:boolean}|null>(null);
 const stateRef=useRef({world,selected,follow,zoomIdx,labels,grid,observer});
 React.useEffect(()=>{stateRef.current={world,selected,follow,zoomIdx,labels,grid,observer};},[world,selected,follow,zoomIdx,labels,grid,observer]);
 const displayRef=useRef<Map<string,{x:number;y:number}>>(new Map());

 // Renderer setup + animation loop (client only; simulation state drives everything)
 React.useEffect(()=>{
  const canvas=canvasRef.current;if(!canvas)return;
  setSurfaceFactory((w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c as unknown as Surface;});
  const seed0=stateRef.current.world.seed;
  const assets:Assets={tiles:bakeTiles(seed0),nature:bakeNature(),buildings:bakeBuildings(),props:bakeProps()};
  const tiles=buildTileMap();
  const view:View={tiles,deco:buildDeco(tiles)};
  const display=new Map<string,{x:number;y:number}>();
  displayRef.current=display;
  const worldCanvas=document.createElement('canvas');
  worldCanvas.width=WORLD.w;worldCanvas.height=WORLD.h;
  const wg=worldCanvas.getContext('2d')!;
  const ctx=canvas.getContext('2d')!;
  let seed=seed0;
  let lastKey='';
  const setChars=(w:World)=>{for(const v of w.residents)setCharacter(v.id,bakeCharacter(v.id,characterHash(v.id),v.color,v.role));};
  setChars(stateRef.current.world);
  const drawMini=(t:number)=>{
   const mini=miniRef.current;if(!mini)return;
   if(mini.width!==MINI.w||mini.height!==MINI.h){mini.width=MINI.w;mini.height=MINI.h;}
   const s=stateRef.current;
   const mg=mini.getContext('2d')!;mg.imageSmoothingEnabled=false;
   mg.fillStyle='#1d4e6b';mg.fillRect(0,0,MINI.w,MINI.h);
   const ox=miniOx();
   for(let ty=0;ty<GRID;ty++)for(let tx=0;tx<GRID;tx++){
    const tt=tiles.get(tx,ty);
    mg.fillStyle=tt==='water'?'#2e7cb0':tt==='sand'?'#e6cf8f':tt==='plaza'?'#a89f8a':tt==='farm'?'#8a5f33':tt==='road'?'#d8c9a0':tt==='dock'?'#8a6a3a':tt==='bridge'?'#b98a4e':'#7cc24f';
    mg.fillRect(Math.round(ox+tx*MINI.sc),Math.round(MINI.oy+ty*MINI.sc),Math.ceil(MINI.sc),Math.ceil(MINI.sc));
   }
   mg.fillStyle='#3e7a3a';
   for(const d of view.deco)if(d.kind==='tree')mg.fillRect(Math.round(ox+d.x*MINI.sc)-1,Math.round(MINI.oy+d.y*MINI.sc)-1,2,2);
   mg.fillStyle='#f0e3b2';
   for(const b of s.world.buildings)mg.fillRect(Math.round(ox+b.x*MINI.sc)-2,Math.round(MINI.oy+b.y*MINI.sc)-2,4,3);
   mg.fillStyle='#ffffff';
   for(const v of s.world.residents){const d=display.get(v.id);if(d)mg.fillRect(Math.round(ox+d.x*MINI.sc),Math.round(MINI.oy+d.y*MINI.sc),2,2);}
   const z=ZOOMS[s.zoomIdx],cw=canvas.clientWidth||800,ch=canvas.clientHeight||500;
   const vw=cw/z,vh=ch/z;
   const cs=[[cam.current.x-vw/2,cam.current.y-vh/2],[cam.current.x+vw/2,cam.current.y-vh/2],[cam.current.x+vw/2,cam.current.y+vh/2],[cam.current.x-vw/2,cam.current.y+vh/2]];
   mg.strokeStyle='#ffd98a';mg.lineWidth=1;mg.beginPath();
   cs.forEach(([wx,wy],i)=>{const q=unproject(wx,wy);const px=ox+q.u*MINI.sc,py=MINI.oy+q.v*MINI.sc;i?mg.lineTo(px,py):mg.moveTo(px,py);});
   mg.closePath();mg.stroke();
  };
  const drawFrame=(t:number)=>{
   const s=stateRef.current;
   if(s.world.seed!==seed){seed=s.world.seed;assets.tiles=bakeTiles(seed);display.clear();setChars(s.world);lastKey='';}
   setSelected(s.selected);
   let moving=false;
   for(const v of s.world.residents){
    const d=display.get(v.id)??{x:v.x,y:v.y};
    if(d.x===v.x&&d.y===v.y){display.set(v.id,d);continue;}
    d.x+=(v.x-d.x)*.25;d.y+=(v.y-d.y)*.25;
    if(Math.abs(v.x-d.x)+Math.abs(v.y-d.y)<.03){d.x=v.x;d.y=v.y;}else moving=true;
    display.set(v.id,d);
   }
   const z=ZOOMS[s.zoomIdx];zoomRef.current=z;
   const followId=s.follow&&s.selected&&s.selected.startsWith('v')?s.selected:null;
   if(followId){
    const v=s.world.residents.find(r=>r.id===followId);
    if(v){const d=display.get(v.id);if(d){const f=foot(d.x,d.y);cam.current.x+=(f.x-cam.current.x)*.25;cam.current.y+=(f.y-cam.current.y)*.25;}}
   }
   cam.current=clampPan(cam.current,z,canvas.clientWidth||800,canvas.clientHeight||500);
   const frame:Frame={t,water:Math.floor(t/900)%2,windmill:Math.floor(t/240)%4,animal:Math.floor(t/1100)%2,boat:Math.floor(t/750)%2};
   const key=[s.world.tick,frame.water,frame.windmill,frame.animal,frame.boat,Math.floor(t/150)%2,s.selected,s.grid,s.observer,s.labels,z,s.world.project.labor,moving?1:0].join('|');
   if(key!==lastKey){
    lastKey=key;
    drawWorld(wg,s.world,assets,frame,view,display);
    if(s.labels&&z<1.5){
     wg.font='bold 9px Arial';wg.textAlign='center';wg.lineWidth=3;wg.strokeStyle='rgba(66,112,58,.85)';
     const lbl=[{x:19,y:18,t:'SUNFIELD FARM'},{x:35,y:27,t:'SUNHAVEN SQUARE'},{x:39,y:44,t:s.world.project.complete?'COMMUNITY STOREHOUSE':'COMMUNITY PROJECT'}];
     for(const l of lbl){const p=iso(l.x,l.y);wg.strokeText(l.t,p.x,p.y-18);wg.fillStyle='#f8f2d8';wg.fillText(l.t,p.x,p.y-18);}
     wg.textAlign='left';
    }
    if(s.grid){
     wg.strokeStyle='rgba(120,200,255,.28)';wg.lineWidth=1;wg.beginPath();
     for(let i=0;i<=GRID;i+=1){const a=iso(i,0),b=iso(i,GRID),c=iso(0,i),d=iso(GRID,i);wg.moveTo(a.x,a.y);wg.lineTo(b.x,b.y);wg.moveTo(c.x,c.y);wg.lineTo(d.x,d.y);}
     wg.stroke();
    }
    if(s.observer)drawObserver(wg,s.world,frame);
    drawMini(t);
   }
   const cw=canvas.clientWidth,ch=canvas.clientHeight;
   if(canvas.width!==cw||canvas.height!==ch){canvas.width=cw;canvas.height=ch;}
   ctx.clearRect(0,0,cw,ch);ctx.imageSmoothingEnabled=false;
   const sw=cw/z,sh=ch/z;
   let sx=cam.current.x-sw/2,sy=cam.current.y-sh/2;
   if(sw>=WORLD.w)sx=(WORLD.w-sw)/2;else sx=Math.max(0,Math.min(WORLD.w-sw,sx));
   if(sh>=WORLD.h)sy=(WORLD.h-sh)/2;else sy=Math.max(0,Math.min(WORLD.h-sh,sy));
   ctx.drawImage(worldCanvas,sx,sy,sw,sh,0,0,cw,ch);
  };
  let raf=0;
  const loop=(t:number)=>{drawFrame(t);raf=requestAnimationFrame(loop);};
  raf=requestAnimationFrame(loop);
  return ()=>{cancelAnimationFrame(raf);};
 },[]);

 const toWorld=(clientX:number,clientY:number)=>{
  const canvas=canvasRef.current!;
  const rect=canvas.getBoundingClientRect();
  const z=zoomRef.current;
  return {x:cam.current.x+(clientX-rect.left-rect.width/2)/z,y:cam.current.y+(clientY-rect.top-rect.height/2)/z,rect};
 };
 const pick=(wx:number,wy:number):Hit|null=>{
  const s=stateRef.current;
  const display=displayRef.current;
  for(const v of s.world.residents){const d=display.get(v.id);if(!d)continue;const f=foot(d.x,d.y);if(Math.hypot(f.x-wx,f.y-wy)<9)return {id:v.id,name:v.name,text:`${v.name} · ${v.task}`};}
  for(const b of s.world.buildings){const f=foot(b.x,b.y);if(Math.hypot(f.x-wx,f.y-wy)<17)return {id:b.id,name:b.name,text:b.name};}
  return null;
 };
 const zoomTo=(idx:number,ax?:number,ay?:number)=>{
  const canvas=canvasRef.current;if(!canvas)return;
  const s=stateRef.current;
  idx=Math.max(0,Math.min(ZOOMS.length-1,idx));
  const z0=ZOOMS[s.zoomIdx],z1=ZOOMS[idx];
  const rect=canvas.getBoundingClientRect();
  const px=ax??rect.width/2,py=ay??rect.height/2;
  const wx=cam.current.x+(px-rect.width/2)/z0,wy=cam.current.y+(py-rect.height/2)/z0;
  cam.current=clampPan({x:wx-(px-rect.width/2)/z1,y:wy-(py-rect.height/2)/z1},z1,canvas.clientWidth,canvas.clientHeight);
  setZoomIdx(idx);
 };
 const reset=()=>{setZoomIdx(1);cam.current={x:WORLD.cx,y:WORLD.cy};zoomRef.current=ZOOMS[1];if(follow)onFollow();};
 const onMiniClick=(e:React.MouseEvent)=>{
  const mini=miniRef.current;if(!mini)return;
  const rect=mini.getBoundingClientRect();
  const mx=(e.clientX-rect.left)/rect.width*MINI.w,my=(e.clientY-rect.top)/rect.height*MINI.h;
  const q={u:(mx-miniOx())/MINI.sc,v:(my-MINI.oy)/MINI.sc};
  const p=iso(q.u,q.v);
  cam.current=clampPan(p,zoomRef.current,canvasRef.current?.clientWidth||800,canvasRef.current?.clientHeight||500);
  if(follow)onFollow();
 };
 return <div className={`village-canvas ${observer?'observer-mode':''}`}>
  <canvas ref={canvasRef} className="world-canvas" aria-label="Interactive isometric Sunhaven village"
   onWheel={e=>{const r=e.currentTarget.getBoundingClientRect();zoomTo(stateRef.current.zoomIdx+(e.deltaY<0?1:-1),e.clientX-r.left,e.clientY-r.top);}}
   onPointerDown={e=>{dragRef.current={px:e.clientX,py:e.clientY,cx:cam.current.x,cy:cam.current.y,moved:false};e.currentTarget.setPointerCapture(e.pointerId);}}
   onPointerMove={e=>{
    const d=dragRef.current;
    if(d){
     if(Math.abs(e.clientX-d.px)+Math.abs(e.clientY-d.py)>3)d.moved=true;
     if(d.moved){const z=zoomRef.current;cam.current=clampPan({x:d.cx-(e.clientX-d.px)/z,y:d.cy-(e.clientY-d.py)/z},z,e.currentTarget.clientWidth,e.currentTarget.clientHeight);setHover(null);}
     return;
    }
    const w=toWorld(e.clientX,e.clientY);
    const hit=pick(w.x,w.y);
    if(hit)setHover(hit.text);
   }}
   onPointerUp={e=>{
    const d=dragRef.current;dragRef.current=null;
    if(!d||d.moved)return;
    const w=toWorld(e.clientX,e.clientY);
    const hit=pick(w.x,w.y);
    if(hit){onSelect(hit.id);return;}
    const q=unproject(w.x,w.y);
    const tx=Math.floor(q.u),ty=Math.floor(q.v);
    setHover(tx>=0&&tx<GRID&&ty>=0&&ty<GRID?`Terrain · Tile ${tx}, ${ty}`:'Coastal water');
   }}
   onPointerLeave={()=>{setHover(null);dragRef.current=null;}}/>
  <div className="map-location"><span className="live-dot"/><span>SUNHAVEN ISLAND</span><span className="location-divider">/</span><span className="muted">Living Village</span></div>
  <div className="compass"><Compass size={38} strokeWidth={1}/><span>N</span></div>
  {hover&&<div className="map-hover"><Eye size={13}/>{hover}</div>}
  <div className="map-bottom-caption"><span className="live-dot"/>{world.status==='running'?'A living world, unfolding.':'A quiet moment in Sunhaven.'}<span>Seed {world.seed} · 64 × 64 · Tile {TILE_W}×{TILE_H}</span></div>
  <div className="build-menu">
   <button className="build-menu-head" onClick={()=>setBuildOpen(!buildOpen)} aria-expanded={buildOpen}><Hammer size={14}/><span>BUILD</span><ChevronIcon open={buildOpen}/></button>
   {buildOpen&&<div className="build-grid">{BUILD_ITEMS.map(([label,id])=><button key={id} className="build-item" title={`Inspect ${label.toLowerCase()} in the village`} aria-label={`Inspect ${label}`} onClick={()=>onSelect(id)}>{buildIcon(label.toLowerCase())}<span>{label}</span></button>)}</div>}
  </div>
  <div className="map-tools"><button title="Zoom in" aria-label="Zoom in" onClick={()=>zoomTo(zoomIdx+1)}><Plus size={17}/></button><span>{Math.round(ZOOMS[zoomIdx]*100)}%</span><button title="Zoom out" aria-label="Zoom out" onClick={()=>zoomTo(zoomIdx-1)}><Minus size={17}/></button><i/><button title="Reset camera" aria-label="Reset camera" onClick={reset}><LocateFixed size={17}/></button><button title="Map layers" aria-label="Map layers" className={layerOpen?'active':''} onClick={()=>setLayerOpen(!layerOpen)}><Layers size={17}/></button></div>
  {layerOpen&&<div className="layer-menu"><div>Map layers<button onClick={()=>setLayerOpen(false)} aria-label="Close layers"><X size={13}/></button></div><button onClick={()=>setLabels(!labels)}><span>Village labels</span>{labels&&<Check size={14}/>}</button><button onClick={()=>setGrid(!grid)}><span>Terrain grid</span>{grid&&<Check size={14}/>}</button><button onClick={()=>setObserver(!observer)}><span>Observer mode</span>{observer&&<Check size={14}/>}</button></div>}
  <button className="minimap" title="Minimap: center camera" aria-label="Minimap: center camera" onClick={onMiniClick}><canvas ref={miniRef} width={MINI.w} height={MINI.h}/><Navigation size={10}/><span>SUNHAVEN</span></button>
 </div>;
}
function ChevronIcon({open}:{open:boolean}){return <svg viewBox="0 0 12 12" width="11" height="11" aria-hidden="true" style={{transform:open?'none':'rotate(-90deg)',transition:'transform .18s'}}><path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/></svg>;}
