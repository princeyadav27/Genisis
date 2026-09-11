// World geometry + tile classification for the pixel renderer.
// Strictly downstream of simulation state; the sim's 64x64 logical island is unchanged.
import type {World, Point} from '@/lib/simulation';

// Isometric tile base. Configurable: set both constants to 64x32 for a 2x-detail world.
export const TILE_W=32, TILE_H=16;
export const GRID=64;          // logical simulation island
export const MARGIN=6;         // tiles of ocean rendered around the island
export const GX=GRID+MARGIN*2; // rendered grid extent
export const ORIGIN={x:MARGIN*TILE_W+48,y:72}; // canvas px of tile (0,0) top corner
export const WORLD={w:ORIGIN.x*2+MARGIN*TILE_W+48, h:ORIGIN.y+(GX)*(TILE_H)+24, cx:ORIGIN.x, cy:ORIGIN.y+GRID*(TILE_H/2)+8};
export const iso=(u:number,v:number)=>({x:ORIGIN.x+(u-v)*(TILE_W/2), y:ORIGIN.y+(u+v)*(TILE_H/2)});
export const foot=(u:number,v:number)=>({x:ORIGIN.x+(u-v)*(TILE_W/2), y:ORIGIN.y+(u+v)*(TILE_H/2)+TILE_H/2});
export const unproject=(px:number,py:number)=>{const a=(px-ORIGIN.x)/(TILE_W/2), b=(py-ORIGIN.y)/(TILE_H/2);return {u:(a+b)/2, v:(b-a)/2};};

// Island coastline — same 64x64 logical shape the illustrated map used.
export const SHORE:Point[]=[{x:4,y:19},{x:7,y:10},{x:17,y:4},{x:28,y:3},{x:41,y:7},{x:53,y:14},{x:59,y:24},{x:60,y:34},{x:54,y:46},{x:45,y:54},{x:33,y:59},{x:22,y:57},{x:11,y:49},{x:5,y:38},{x:3,y:28}];
export const ROADS:Point[][]=[
 [{x:24,y:14},{x:30,y:20},{x:30,y:43},{x:34,y:47}],
 [{x:19,y:22},{x:38,y:22},{x:45,y:29}],
 [{x:19,y:38},{x:23,y:30},{x:43,y:30}],
 [{x:23,y:44},{x:30,y:40},{x:41,y:40}],
 [{x:38,y:22},{x:38,y:40}],
];
const noise=(x:number,y:number)=>{let h=Math.imul(Math.round(x*1024)^0x9e3779b9,0x85ebca6b)^Math.imul(Math.round(y*1024),0xc2b2ae35);h=Math.imul(h^(h>>>16),0x85ebca6b);h=Math.imul(h^(h>>>13),0x85ebca6b);return ((h^(h>>>16))>>>0)/4294967296;};

function inPoly(p:Point, poly:Point[]){let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const a=poly[i],b=poly[j];if((a.y>p.y)!==(b.y>p.y)&&p.x<(b.x-a.x)*(p.y-a.y)/(b.y-a.y)+a.x)inside=!inside;}return inside;}
const scaled=SHORE.map(p=>({x:31+(p.x-31)*.97, y:31+(p.y-31)*.97}));
function segDist(p:Point, a:Point, b:Point){const dx=b.x-a.x,dy=b.y-a.y;const t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy)));return Math.hypot(p.x-(a.x+dx*t), p.y-(a.y+dy*t));}

// Environmental watercourse (presentation only, deterministic): a forest lake
// drains east and meets the sea at the SE shore. Where it crosses a road the
// tile is classified as a bridge. The watercourse yields to plazas, farm
// plots and building footprints, so it never alters the sim's layout.
export const LAKE={x:12,y:26,rx:3.4,ry:2.7};
export const RIVER:Point[]=[{x:15,y:28.5},{x:20,y:31.5},{x:25,y:33.5},{x:29,y:36},{x:32,y:37.4},{x:36,y:37.8},{x:40,y:39},{x:44,y:41.5},{x:48,y:44.5},{x:51,y:46.5}];
const RIVER_HALF=1.2;
const RIVER_YIELD:[number,number,number][]=[[25,15,1.7],[34,16,1.7],[43,22,1.7],[45,30,1.7],[31,42,1.7],[23,44,1.7],[22,22,2.0],[30,30,3.6],[38,30,2.0],[34,48,2.0],[37,23,3.0],[40,40,2.0],[34,15,2.0]];
const inLake=(p:Point)=>((p.x-LAKE.x)/LAKE.rx)**2+((p.y-LAKE.y)/LAKE.ry)**2<=1;
const inRiver=(p:Point)=>inLake(p)||RIVER.some((a,i)=>i<RIVER.length-1&&segDist(p,a,RIVER[i+1])<RIVER_HALF);
export const isRiverTile=(tx:number,ty:number)=>inRiver({x:tx+.5,y:ty+.5});

export type Terrain='water'|'sand'|'grass'|'plaza'|'farm'|'road'|'dock'|'bridge';
// Farm field plots (tile rects) matching the illustrated farm layout.
const PLOTS:[number,number,number,number][]=[[23,17,29,23],[16,23,22,29]];
const WINDMILL:Point={x:34,y:15};
// Water crossing: no road polyline crosses water in this world (road tiles are
// classified on land only), so a bridge is not applicable. The dock pier below
// is the single land<->water transition and is drawn as dock tiles.
const DOCK:Point[][]=Array.from({length:7},(_,i)=>{const a={x:42+i,y:50+i},b={x:42.9+i,y:50.9+i};return [a,b];});

export interface TileMap{get(tx:number,ty:number):Terrain;land(tx:number,ty:number):boolean;}
export function buildTileMap():TileMap{
 const grid=new Map<string,Terrain>();
 for(let ty=-MARGIN;ty<GRID+MARGIN;ty++)for(let tx=-MARGIN;tx<GRID+MARGIN;tx++){
  const p={x:tx+.5,y:ty+.5};let t:Terrain;
  if(!inPoly(p,SHORE))t='water';
  else if(!inPoly(p,scaled))t='sand';
  else t='grass';
  if(t==='grass'){
   if(Math.hypot(p.x-30,p.y-30)<3.4||Math.hypot(p.x-37,p.y-23)<2.7)t='plaza';
   if(PLOTS.some(([x0,y0,x1,y1])=>tx>=x0&&tx<=x1&&ty>=y0&&ty<=y1))t='farm';
  }
  const isRoad=t==='grass'&&ROADS.some(r=>r.some((a,i)=>i<r.length-1&&segDist(p,a,r[i+1])<0.9));
  const river=isRiverTile(tx,ty)&&!RIVER_YIELD.some(([x,y,r])=>Math.hypot(p.x-x,p.y-y)<r);
  if(river&&(t==='grass'||t==='sand'))t=isRoad?'bridge':'water';
  else if(isRoad)t='road';
  grid.set(`${tx},${ty}`,t);
 }
 for(const [a,b] of DOCK){for(let tx=Math.floor(a.x);tx<=Math.floor(b.x);tx++)for(let ty=Math.floor(a.y);ty<=Math.floor(b.y);ty++)grid.set(`${tx},${ty}`,'dock');}
 return {get:(tx,ty)=>grid.get(`${tx},${ty}`)??'water', land:(tx,ty)=>{const t=grid.get(`${tx},${ty}`);return t!=='water'&&t!=='dock';}};
}
export {WINDMILL};

// Deterministic vegetation — identical placement to the illustrated map (stable world).
export interface Deco{x:number;y:number;kind:'tree'|'bush'|'rock'|'flower';variant:number;}
export function buildDeco(tiles:TileMap):Deco[]{
 const out:Deco[]=[];
 for(let x=7;x<59;x+=2.6)for(let y=7;y<57;y+=2.8){const n=noise(x,y);if(((x-31)/28)**2+((y-30)/26)**2<.93 && (x<17||y<12||x>49||y>51||(x<23&&y>30&&y<43))&&n>.27&&tiles.land(Math.floor(x),Math.floor(y)))out.push({x:x+n*1.6,y:y+n,kind:'tree',variant:Math.floor(n*10)});}
 const scattered=[{x:19,y:15},{x:33,y:12},{x:45,y:17},{x:47,y:37},{x:42,y:48},{x:26,y:49},{x:19,y:46},{x:26,y:34},{x:35,y:36},{x:21,y:29}];
 scattered.forEach((p,i)=>{if(tiles.land(Math.floor(p.x),Math.floor(p.y)))out.push({x:p.x,y:p.y,kind:'tree',variant:i});});
 for(let x=8;x<58;x+=1.9)for(let y=8;y<56;y+=1.9){const n=noise(x+40,y+90);if(n>.86&&tiles.get(Math.floor(x),Math.floor(y))==='grass')out.push({x,y,kind:n>.93?'bush':'flower',variant:Math.floor(n*7)});}
 if(tiles.land(9,9))out.push({x:9.5,y:9.5,kind:'rock',variant:2});
 out.push({x:11,y:11,kind:'rock',variant:0},{x:36,y:44,kind:'rock',variant:1},{x:44,y:14,kind:'rock',variant:0});
 return out;
}

// Environmental livestock (matches the reference scene's pasture; not sim entities).
export const ANIMALS=[{x:18.2,y:25.6,kind:'cow'},{x:20.8,y:28.2,kind:'cow'},{x:23.6,y:24.2,kind:'chicken'},{x:24.8,y:22.6,kind:'chicken'},{x:21.2,y:23.8,kind:'chicken'}];
export const BOATS=[{x:50,y:58,s:1,flip:false},{x:54,y:53,s:.85,flip:true}];
// Static props anchored to real buildings.
export const PROPS=[{x:40.4,y:29.2,kind:'barrel'},{x:38.6,y:31.6,kind:'barrel'},{x:38.9,y:22.1,kind:'cart'},{x:31.4,y:27.8,kind:'sign'},{x:29.3,y:31.8,kind:'lamp'},{x:38.3,y:26.2,kind:'lamp'},{x:30.8,y:38.4,kind:'lamp'}];

export function farmLaborOf(w:World){return Math.max(0,...w.residents.filter(v=>v.task==='Farming'&&v.x===v.destination.x&&v.y===v.destination.y).map(v=>v.progress));}
export type Anim='idle'|'walk'|'work'|'rest';
export function animOf(v:{x:number;y:number;destination:Point;task:string;progress:number;carry?:Record<string,number>}):Anim{
 const d=Math.abs(v.x-v.destination.x)+Math.abs(v.y-v.destination.y);
 if(d>0.05)return 'walk';
 if(v.task==='Resting')return 'rest';
 if(v.progress>0&&v.progress<20)return 'work';
 if(Object.keys(v.carry||{}).some(k=>(v.carry as Record<string,number>)[k]))return 'work';
 return 'idle';
}
