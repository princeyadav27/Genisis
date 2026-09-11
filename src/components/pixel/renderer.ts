// World renderer: isometric tile grid + depth-sorted pixel sprites.
// Strictly downstream of simulation state (World). DOM-independent context.
import {TILE_W, TILE_H, GRID, MARGIN, GX, iso, foot, ORIGIN, WORLD, SHORE, WINDMILL, ANIMALS, BOATS, PROPS, buildTileMap, buildDeco, farmLaborOf, animOf, type TileMap, type Deco} from './world';
import type {World} from '@/lib/simulation';
import type {Surface, Ctx2D, Character} from './sprites';
import {TILE_TYPES} from './sprites';

export interface Assets{tiles:Record<string,Surface>; nature:Record<string,Surface>; buildings:Record<string,Surface>; props:Record<string,Surface>;}
export interface Frame{t:number; water:number; windmill:number; animal:number; boat:number;}
export interface View{tiles:TileMap; deco:Deco[];}

export function buildingSprite(w:World, b:World['buildings'][number]):string[]|null{
 switch(b.type){
  case 'house':return [b.id==='home-0'?'house0':b.id==='home-1'?'house1':'house2'];
  case 'farm':return ['house2'];
  case 'well':return ['well'];
  case 'storage':return ['barn'];
  case 'workshop':return ['workshop'];
  case 'market':return ['market0','market1'];
  case 'project':return [w.project.complete?'storehouse':w.project.labor>20?'project1':'project0'];
 }
 return null;
}
function put(g:Ctx2D,s:Surface,x:number,y:number){g.drawImage(s,0,0,s.width,s.height,Math.round(x),Math.round(y),s.width,s.height);}
function spriteAt(g:Ctx2D,name:string,x:number,y:number,assets:Assets){
 const s=assets.buildings[name]??assets.nature[name]??assets.props[name]??assets.tiles[name];
 if(!s)return;
 put(g,s,x-s.width/2,y-s.height);
}
interface D{depth:number;fn:(g:Ctx2D)=>void;}

export function drawWorld(g:Ctx2D, world:World, a:Assets, f:Frame, view:View, display?:Map<string,{x:number;y:number}>){
 const {tiles,deco}=view;
 // --- tile pass (painter's algorithm by diagonal) ---
 for(let s=0;s<=2*(GX-1);s++){
  for(let u=Math.max(0,s-(GX-1));u<=Math.min(GX-1,s);u++){
   const v=s-u;const tx=u-MARGIN,ty=v-MARGIN;
   const t=tiles.get(tx,ty);const X=ORIGIN.x+(u-v)*(TILE_W/2),Y=ORIGIN.y+(u+v)*(TILE_H/2);
   let name:string;
   if(t==='water'||t==='bridge')name=f.water?'water1':'water0';
   else if(t==='grass')name=((tx*7+ty*13)&1)?'grassA':'grassB';
   else name=TILE_TYPES[t][0];
   const tile=a.tiles[name];if(tile)put(g,tile,X,Y);
   if(t==='bridge')put(g,a.tiles.bridge0,X,Y);
   if(t==='water'){
    const land=(x:number,y:number)=>tiles.land(x,y);
    if(land(tx,ty-1))put(g,a.tiles.foamTR,X,Y);
    if(land(tx-1,ty))put(g,a.tiles.foamTL,X,Y);
    if(land(tx+1,ty))put(g,a.tiles.foamBR,X,Y);
    if(land(tx,ty+1))put(g,a.tiles.foamBL,X,Y);
   }
   if(t==='farm'){
    const notFarm=(x:number,y:number)=>tiles.get(x,y)!=='farm';
    if(notFarm(tx,ty-1))put(g,a.nature.fTR,X,Y-7);
    if(notFarm(tx-1,ty))put(g,a.nature.fTL,X-16,Y-3);
    if(notFarm(tx+1,ty))put(g,a.nature.fTL,X,Y+5);
    if(notFarm(tx,ty+1))put(g,a.nature.fTR,X-16,Y+1);
    const stage=Math.min(2,Math.floor(farmLaborOf(world)/3));
    const offs=[[5,5],[13,8],[22,5],[9,12]][(tx*3+ty*5)&3];
    const offs2=[[12,5],[5,10],[20,11]][(tx*5+ty*3)&2];
    spriteAt(g,`crop${stage}`,X+offs[0],Y+offs[1],a);
    spriteAt(g,`crop${stage}`,X+offs2[0],Y+offs2[1],a);
   }
  }
 }
 // --- objects ---
 const Ds:D[]=[];
 const add=(depth:number,fn:(g:Ctx2D)=>void)=>Ds.push({depth,fn});
 for(const d of deco){
  const fpt=foot(d.x,d.y);
  if(d.kind==='tree')add(d.x+d.y,g=>spriteAt(g,`tree${d.variant%3}`,fpt.x,fpt.y,a));
  else if(d.kind==='bush')add(d.x+d.y,g=>spriteAt(g,'bush',fpt.x,fpt.y,a));
  else if(d.kind==='rock')add(d.x+d.y,g=>spriteAt(g,`rock${d.variant%2}`,fpt.x,fpt.y,a));
  else add(d.x+d.y,g=>spriteAt(g,`flower${d.variant%3}`,fpt.x,fpt.y,a));
 }
 for(const p of PROPS){const fpt=foot(p.x,p.y);add(p.x+p.y,g=>spriteAt(g,p.kind,fpt.x,fpt.y,a));}
 const wf=foot(WINDMILL.x,WINDMILL.y);
 add(WINDMILL.x+WINDMILL.y,g=>spriteAt(g,`windmill${f.windmill}`,wf.x,wf.y,a));
 for(const an of ANIMALS){const fpt=foot(an.x,an.y);const name=an.kind==='cow'?`cow${f.animal}`:`chicken${f.animal}`;add(an.x+an.y,g=>spriteAt(g,name,fpt.x,fpt.y,a));}
 for(const b of BOATS){const fpt=iso(b.x,b.y);const name=`boat${f.boat}`;add(b.x+b.y+1,g=>{const s=a.props[name];put(g,s,fpt.x-14,fpt.y-(s.height-4)+(b.flip?0:0));});}
 for(const b of world.buildings){
  const names=buildingSprite(world,b);if(!names)continue;
  const fpt=foot(b.x,b.y);
  add(b.x+b.y,g=>{
   if(worldSelected===b.id)selectionRing(g,fpt.x,fpt.y,16);
   if(names.length===2){put(g,a.buildings[names[0]],fpt.x-29,fpt.y-26);put(g,a.buildings[names[1]],fpt.x-1,fpt.y-18);}
   else spriteAt(g,names[0],fpt.x,fpt.y,a);
  });
 }
 // residents (simulation-driven sprites & animation)
 for(const v of world.residents){
  const pos=display?.get(v.id)??{x:v.x,y:v.y};
  const fpt=foot(pos.x,pos.y);
  const anim=animOf(v);
  add(v.x+v.y+0.3,g=>{
   const ch=chars.get(v.id);if(!ch)return;
   const frame=anim==='walk'?(Math.floor(f.t/150)%2?ch.walkB:ch.walkA):anim==='work'?(Math.floor(f.t/300)%2?ch.work1:ch.work0):anim==='rest'?ch.rest:(Math.floor(f.t/600)%2?ch.idle1:ch.idle0);
   if(worldSelected===v.id)selectionRing(g,fpt.x,fpt.y);
   put(g,frame,fpt.x-6,fpt.y-16);
   if(worldSelected===v.id){
    g.font='bold 9px Arial';g.textAlign='center';g.lineWidth=3;g.strokeStyle='rgba(20,56,49,.9)';
    g.strokeText(v.name,fpt.x,fpt.y+13);g.fillStyle='#ffd98a';g.fillText(v.name,fpt.x,fpt.y+13);g.textAlign='left';
   }
   if(Object.keys(v.carry).length){g.fillStyle='#b8945d';g.fillRect(fpt.x+5,fpt.y-9,3,4);g.fillStyle='#755f3e';g.fillRect(fpt.x+5,fpt.y-9,3,1);}
   const talking=world.conversations.findLast(c=>c.speaker===v.id&&world.tick-c.tick<3);
   if(talking){const bx=fpt.x-5,by=fpt.y-30;g.fillStyle='#f7f3e2';g.fillRect(bx,by,11,8);g.fillRect(bx+4,by+8,3,2);g.fillStyle='#42685b';g.fillRect(bx+2,by+3,1,1);g.fillRect(bx+5,by+3,1,1);g.fillRect(bx+8,by+3,1,1);}
  });
 }
 Ds.sort((p,q)=>p.depth-q.depth);
 for(const d of Ds)d.fn(g);
}
let worldSelected:string|null=null;
function selectionRing(g:Ctx2D,x:number,y:number,r=10){
 const gold='#ffd166';g.fillStyle=gold;
 for(let i=0;i<=r;i++){const p=Math.round(i*0.5);g.fillRect(x-i,y-5+p,1,1);g.fillRect(x+i,y-5+p,1,1);}
 for(let i=0;i<=r;i++){const p=Math.round(i*0.5);g.fillRect(x-r+i,y+p,1,1);g.fillRect(x+r-i,y+p,1,1);}
}
const chars=new Map<string,Character>();
export function setCharacter(id:string,c:Character){chars.set(id,c);}
export function setSelected(id:string|null){worldSelected=id;}

// --- observer mode: dark technical view of the same world ---
export function drawObserver(g:Ctx2D, world:World, f:Frame){
 g.save();
 g.fillStyle='rgba(6,13,23,0.68)';g.fillRect(0,0,WORLD.w,WORLD.h);
 g.strokeStyle='rgba(90,180,220,0.16)';g.lineWidth=1;g.beginPath();
 for(let i=0;i<=GRID;i+=2){
  const a1=iso(i,0),a2=iso(i,GRID),b1=iso(0,i),b2=iso(GRID,i);
  g.moveTo(a1.x,a1.y);g.lineTo(a2.x,a2.y);g.moveTo(b1.x,b1.y);g.lineTo(b2.x,b2.y);
 }
 g.stroke();
 // shoreline
 g.strokeStyle='rgba(140,220,255,0.5)';g.beginPath();
 SHORE.forEach((p,i)=>{const q=foot(p.x,p.y);i?g.lineTo(q.x,q.y):g.moveTo(q.x,q.y);});g.closePath();g.stroke();
 g.font='9px monospace';
 // residents: position, vector to destination, task
 for(const v of world.residents){
  const p=foot(v.x,v.y),d=foot(v.destination.x,v.destination.y);
  g.strokeStyle='rgba(120,220,255,0.55)';g.beginPath();g.moveTo(p.x,p.y);g.lineTo(d.x,d.y);g.stroke();
  g.fillStyle='rgba(120,220,255,0.9)';g.fillRect(p.x-1,p.y-1,3,3);g.fillRect(d.x-1,d.y-1,2,2);
  g.fillStyle='#9fd8ff';g.fillText(`${v.id} ${v.task} [${v.x.toFixed(1)},${v.y.toFixed(1)}]`,p.x+4,p.y-6);
 }
 // recent committed events with locations
 for(const e of world.events.filter(ev=>ev.location&&ev.kind!=='movement').slice(-8)){
  const p=iso(e.location!.x,e.location!.y);
  const r=3+((f.t/400)%1)*7;
  g.strokeStyle='rgba(255,209,102,0.8)';g.beginPath();
  g.moveTo(p.x,p.y-r/2);g.lineTo(p.x+r,p.y);g.lineTo(p.x,p.y+r/2);g.lineTo(p.x-r,p.y);g.closePath();g.stroke();
  g.fillStyle='#ffd166';g.fillText(e.id,p.x+r+2,p.y+3);
 }
 // stocks at storage
 const s=foot(38,30);
 g.fillStyle='#93f0a0';
 g.fillText(`storage: food ${world.stocks.food} / water ${world.stocks.water} / wood ${world.stocks.wood} / stone ${world.stocks.stone} / seeds ${world.stocks.seeds}`,s.x-70,s.y-46);
 g.fillStyle='#79d6ff';
 g.fillText(`tick ${world.tick} · gen ${world.generation} · speed ${world.speed}x · status ${world.status} · forest ${world.forest} · seq ${world.sequence}`,8,14);
 g.restore();
}
