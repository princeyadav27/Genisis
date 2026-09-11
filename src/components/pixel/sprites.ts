// Pixel-art tile and sprite baking. All art is original, built on a 1px grid.
// DOM-independent: a surface factory is injected (document.createElement in the
// browser, @napi-rs/canvas in the node verification harness).
import {PAL, SKINS, HAIRS, PANTS} from './palettes';
import type {Terrain} from './world';

export interface Ctx2D{
 clearRect(x:number,y:number,w:number,h:number):void;
 fillRect(x:number,y:number,w:number,h:number):void;
 moveTo(x:number,y:number):void; lineTo(x:number,y:number):void;
 strokeText(t:string,x:number,y:number):void; textAlign:string;
 drawImage(img:unknown,sx:number,sy:number,sw:number,sh:number,dx:number,dy:number,dw:number,dh:number):void;
 save():void; restore():void; translate(x:number,y:number):void;
 beginPath():void; closePath():void; fill():void; stroke():void;
 fillStyle:string|CanvasGradient|CanvasPattern; strokeStyle:string|CanvasGradient|CanvasPattern; lineWidth:number; globalAlpha:number; imageSmoothingEnabled:boolean;
 fillText(t:string,x:number,y:number):void; font:string;
}
export type Surface={width:number;height:number;getContext(id:'2d'):Ctx2D;toDataURL?(type?:string):string};
let factory:(w:number,h:number)=>Surface=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d') as unknown as Ctx2D;return {width:w,height:h,getContext:()=>g,toDataURL:(t?:string)=>c.toDataURL(t??'image/png')};};
export function setSurfaceFactory(f:(w:number,h:number)=>Surface){factory=f;}
export function makeSurface(w:number,h:number){const c=factory(w,h);c.getContext('2d');return c;}

// ---- pixel primitives -------------------------------------------------
const clampX=(x:number,w:number)=>x<0?0:x>=w?w-1:x;
function diamond(g:Ctx2D, cx:number, cy:number, R:number, y0:number, color:string, wdt:number){
 for(let y=0;y<=2*R;y++){const hw=y<=R?y:2*R-y;g.fillStyle=color;g.fillRect(clampX(cx-2*hw,wdt),y0+y,Math.min(wdt,2*hw)+1,1);}
}
function wallL(g:Ctx2D,cx:number,R:number,H:number,y0:number,color:string,wdt:number){
 g.fillStyle=color;
 for(let y=0;y<R+H;y++){const yA=y0+y;const xl=cx-(y<R?2*y:2*R);const xr=cx-(y<H?0:2*(y-H));if(xr>=xl&&xl<wdt)g.fillRect(Math.max(0,xl),yA,Math.min(wdt-1,xr)-Math.max(0,xl)+1,1);}
}
function wallR(g:Ctx2D,cx:number,R:number,H:number,y0:number,color:string,wdt:number){
 g.fillStyle=color;
 for(let y=0;y<R+H;y++){const yA=y0+y;const xr=cx+(y<R?2*y:2*R);const xl=cx+(y<H?0:2*(H-y));if(xr>=xl&&xl<wdt)g.fillRect(Math.max(0,xl),yA,Math.min(wdt-1,xr)-Math.max(0,xl)+1,1);}
}
function pyramid(g:Ctx2D,cx:number,y0:number,R:number,colorL:string,colorR:string,wdt:number){
 for(let y=0;y<R;y++){g.fillStyle=colorL;g.fillRect(Math.max(0,cx-2*y),y0+y,Math.min(wdt-1,cx)-Math.max(0,cx-2*y)+1,1);g.fillStyle=colorR;g.fillRect(cx+1,y0+y,Math.min(wdt-1,cx+2*y)-(cx+1)+1,1);}
}
// 2:1 slanted 1px rail
function rail(g:Ctx2D,x:number,y:number,dir:number,n:number,color:string,wdt=9999){
 for(let i=0;i<n;i++)g.fillRect(clampX(x+dir*i,wdt),y+Math.floor(i/2),1,1);
}
function rect(g:Ctx2D,x:number,y:number,w:number,h:number,color:string){g.fillStyle=color;g.fillRect(x,y,w,h);}

// ---- tiles (32x16) -----------------------------------------------------
const TW=32, TH=16;
function inside(x:number,y:number){return Math.abs(x-16)/16+Math.abs(y-8)/8<=1;}
function speckle(g:Ctx2D,seed:number,colors:string[],count:number,wdt=TW){
 let h=seed*2654435761>>>0;
 for(let i=0;i<count;i++){h=(h*1103515245+12345)>>>0;const x=h%wdt;h=(h*1103515245+12345)>>>0;const y=h%TH;if(inside(x,y)){g.fillStyle=colors[i%colors.length];g.fillRect(x,y,1,1);}}
}
function tileBase(g:Ctx2D,colors:{a:string;b?:string;edge?:string},seed:number,detail:(g:Ctx2D)=>void){
 for(let y=0;y<TH;y++){const hw=y<=8?2*y:2*(15-y);g.fillStyle=colors.a;g.fillRect(16-Math.min(16,hw),y,2*Math.min(16,hw)+1,1);}
 if(colors.edge){for(let y=0;y<TH;y++){const hw=y<=8?2*y:2*(15-y);g.fillStyle=colors.edge;g.fillRect(16-Math.min(16,hw),y,1,1);g.fillRect(16+Math.min(16,hw),y,1,1);}}
 speckle(g,seed,[colors.b??colors.a,colors.b??colors.a,colors.a],16);detail(g);
}
export function bakeTiles(seed=1):Record<string,Surface>{
 const T:Record<string,Surface>={};
 const mk=(name:string,fn:(g:Ctx2D)=>void)=>{const c=makeSurface(TW,TH);const g=c.getContext('2d');fn(g);T[name]=c;};
 mk('grassA',g=>tileBase(g,{a:PAL.grassA,b:PAL.grassB,edge:PAL.grassD},seed,g=>{for(let i=0;i<7;i++){const x=4+((seed*7+i*5)%24),y=2+(i*3+seed)%11;if(inside(x,y)){g.fillStyle=PAL.grassD;g.fillRect(x,y,1,2);}}}));
 mk('grassB',g=>tileBase(g,{a:PAL.grassB,b:PAL.grassC,edge:PAL.grassD},seed+7,g=>{for(let i=0;i<6;i++){const x=6+((seed*5+i*7)%22),y=3+(i*5+seed)%10;if(inside(x,y)){g.fillStyle=PAL.grassC;g.fillRect(x,y,1,2);}}}));
 mk('sand',g=>tileBase(g,{a:PAL.sandA,b:PAL.sandB,edge:PAL.sandB},seed+13,g=>{for(let i=0;i<5;i++){const x=5+((i*7+seed)%22),y=2+(i*3)%12;if(inside(x,y)){g.fillStyle=PAL.sandC;g.fillRect(x,y,1,1);}}}));
 const water=(frame:number)=>mk(`water${frame}`,g=>{g.fillStyle=PAL.waterB;for(let y=0;y<TH;y++){const hw=y<=8?2*y:2*(15-y);g.fillRect(16-Math.min(16,hw),y,2*Math.min(16,hw)+1,1);}
  for(let i=0;i<5;i++){const x=3+((i*7+frame*4+seed)%21),y=2+((i*5+frame*3+seed)%11);if(inside(x,y)){g.fillStyle=PAL.waterC;g.fillRect(x,y,2,1);}}
  for(let i=0;i<4;i++){const x=4+((i*11+frame*2)%18),y=4+((i*7)%8);if(inside(x,y)){g.fillStyle=PAL.waterA;g.fillRect(x,y,1,1);}}});
 water(0);water(1);
 mk('foamTL',g=>{rail(g,15,1,-1,8,PAL.foam);rail(g,14,0,-1,7,PAL.foam);});
 mk('foamTR',g=>{rail(g,16,0,1,8,PAL.foam);rail(g,17,1,1,7,PAL.foam);});
 mk('foamBL',g=>{rail(g,15,15,-1,8,PAL.foam);rail(g,14,14,-1,7,PAL.foam);});
 mk('foamBR',g=>{rail(g,16,14,1,8,PAL.foam);rail(g,17,15,1,7,PAL.foam);});
 mk('plaza',g=>{tileBase(g,{a:PAL.stoneB,b:PAL.stoneA,edge:PAL.stoneB},seed+31,()=>{});
  const stones=[[8,6,4,2],[14,5,5,2],[21,7,4,2],[10,9,5,2],[17,9,5,2],[13,12,4,2]];
  for(const[x,y,w,h]of stones){rect(g,x,y,w,h,PAL.stoneA);rect(g,x,y,w,1,PAL.stoneC);}});
 mk('road',g=>tileBase(g,{a:PAL.pathA,b:PAL.pathB,edge:PAL.pathB},seed+37,()=>{}));
 mk('farm',g=>{tileBase(g,{a:PAL.soilA,b:PAL.soilC,edge:PAL.soilB},seed+41,g=>{for(const y of [4,8,12]){g.fillStyle=PAL.soilB;for(let x=4;x<28;x++)if(inside(x,y))g.fillRect(x,y,1,1);}});});
 mk('dock',g=>{g.fillStyle=PAL.woodA;for(let y=0;y<TH;y++){const hw=y<=8?2*y:2*(15-y);g.fillRect(16-Math.min(16,hw),y,2*Math.min(16,hw)+1,1);}
  for(const x of [8,14,20,25]){g.fillStyle=PAL.woodB;for(let y=1;y<TH-1;y++)if(inside(x,y))g.fillRect(x,y,1,1);}
  g.fillStyle=PAL.woodC;for(let x=6;x<26;x++)if(inside(x,1))g.fillRect(x,1,1,1);
  g.fillStyle=PAL.woodB;g.fillRect(4,7,2,2);g.fillRect(27,7,2,2);});
 // wooden bridge, N-S deck (transparent base: the animated water tile is
 // drawn beneath it by the renderer where a road crosses the river/lake)
 mk('bridge0',g=>{
  const x0=(y:number)=>{const hw=y<=8?2*y:2*(15-y);return Math.max(11,16-hw+2);};
  const x1=(y:number)=>{const hw=y<=8?2*y:2*(15-y);return Math.min(21,16+hw-2);};
  for(let y=0;y<TH;y++){if(x1(y)>=x0(y)){g.fillStyle=PAL.woodA;g.fillRect(x0(y),y,x1(y)-x0(y)+1,1);}}
  g.fillStyle=PAL.woodC;for(let y=2;y<TH-1;y+=3)if(x1(y)>=x0(y))g.fillRect(x0(y),y,x1(y)-x0(y)+1,1);
  g.fillStyle=PAL.woodB;for(let y=0;y<TH;y++)if(x1(y)>=x0(y)){g.fillRect(x0(y),y,1,1);g.fillRect(x1(y),y,1,1);}
  for(const s of [-1,1]){
   for(const py of [3,7,11,13]){const x=16+s*6;g.fillStyle=PAL.woodB;g.fillRect(x-1,py-2,2,3);g.fillStyle=PAL.woodC;g.fillRect(x-1,py-3,2,1);}
   g.fillStyle=PAL.woodC;for(let y=4;y<TH-2;y++)g.fillRect(16+s*6-1,y-2,2,1);
  }
 });
 return T;
}
export const TILE_TYPES:Record<Terrain,string[]>={
 water:['water0','water1'],sand:['sand'],grass:['grassA','grassB'],plaza:['plaza'],farm:['farm'],road:['road'],dock:['dock'],bridge:['bridge0'],
};

// ---- nature ------------------------------------------------------------
export function bakeNature():Record<string,Surface>{
 const N:Record<string,Surface>={};
 const mk=(name:string,w:number,h:number,fn:(g:Ctx2D)=>void)=>{const c=makeSurface(w,h);fn(c.getContext('2d'));N[name]=c;};
 const tree=(name:string,h:number,canopy:(g:Ctx2D)=>void)=>mk(name,26,h,g=>{canopy(g);});
 tree('tree0',34,g=>{
  diamond(g,13,4,10,10,PAL.leafA,26);diamond(g,13,2,8,4,PAL.leafB,26);diamond(g,12,1,5,1,PAL.leafC,26);
  rect(g,11,26,4,8,PAL.woodA);rect(g,13,26,2,8,PAL.woodB);
  for(const[x,y]of[[7,18],[17,20],[11,14],[19,14],[8,22],[15,24],[12,8],[17,7]]){g.fillStyle=PAL.leafD;g.fillRect(x,y,1,1);}
  for(const[x,y]of[[10,6],[13,5],[9,12],[14,10]]){g.fillStyle=PAL.leafC;g.fillRect(x,y,1,1);}
 });
 tree('tree1',32,g=>{
  rect(g,11,26,4,6,PAL.woodA);rect(g,12,26,2,6,PAL.woodB);
  pyramid(g,13,14,8,PAL.leafB,PAL.leafD,26);pyramid(g,13,8,6,PAL.leafA,PAL.leafD,26);pyramid(g,13,2,4,PAL.leafB,PAL.leafD,26);
  for(const[x,y]of[[11,20],[15,16],[13,10],[12,6]]){g.fillStyle=PAL.leafC;g.fillRect(x,y,1,1);}
 });
 tree('tree2',28,g=>{
  diamond(g,13,3,7,7,PAL.leafB,26);diamond(g,12,2,4,2,PAL.leafC,26);
  rect(g,11,20,4,8,PAL.woodA);rect(g,13,20,2,8,PAL.woodB);
  for(const[x,y]of[[9,12],[16,14],[12,9]]){g.fillStyle=PAL.leafD;g.fillRect(x,y,1,1);}
 });
 mk('bush',14,12,g=>{diamond(g,7,1,4,1,PAL.leafB,14);diamond(g,6,1,3,3,PAL.leafC,14);});
 const rock=(name:string)=>mk(name,16,12,g=>{diamond(g,7,1,4,1,PAL.stoneB,16);diamond(g,9,1,3,4,PAL.stoneA,16);rect(g,5,3,1,1,PAL.stoneC);});
 rock('rock0');rock('rock1');
 const flower=(name:string,c1:string)=>mk(name,6,8,g=>{rect(g,2,4,1,4,PAL.grassD);rect(g,1,1,4,3,c1);rect(g,2,2,1,1,PAL.goldB);});
 flower('flower0','#d95f3b');flower('flower1','#f2c14e');flower('flower2','#b68293');
 // crops: 0 sprout, 1 mid, 2 ripe
 mk('crop0',6,7,g=>{rect(g,2,4,1,3,PAL.leafB);rect(g,1,2,1,2,PAL.leafC);rect(g,3,2,1,2,PAL.leafC);});
 mk('crop1',6,9,g=>{rect(g,2,5,1,4,PAL.leafA);rect(g,1,3,1,2,PAL.leafB);rect(g,3,3,1,2,PAL.leafB);rect(g,2,2,1,1,PAL.leafC);});
 mk('crop2',6,11,g=>{rect(g,2,6,1,5,PAL.gold);rect(g,1,4,1,2,PAL.goldB);rect(g,3,4,1,2,PAL.goldB);rect(g,2,2,1,2,PAL.goldB);});
 // fences: 17x12. fTL edge rises right (posts bases y11 left, y7 right); fTR edge falls right (base y7 left, y11 right)
 const fenceUp=(name:string)=>mk(name,17,12,g=>{
  rect(g,0,4,2,8,PAL.woodA);rect(g,15,0,2,8,PAL.woodA);
  for(let x=0;x<=16;x++){g.fillStyle=PAL.woodC;g.fillRect(x,8-Math.round(x/2),1,1);g.fillStyle=PAL.woodB;g.fillRect(x,11-Math.round(x/2),1,1);}
 });
 const fenceDown=(name:string)=>mk(name,17,12,g=>{
  rect(g,0,0,2,8,PAL.woodA);rect(g,15,4,2,8,PAL.woodA);
  for(let x=0;x<=16;x++){g.fillStyle=PAL.woodC;g.fillRect(x,Math.round(x/2),1,1);g.fillStyle=PAL.woodB;g.fillRect(x,3+Math.round(x/2),1,1);}
 });
 fenceUp('fTL');fenceDown('fTR');
 return N;
}

// ---- buildings ---------------------------------------------------------
export function bakeBuildings():Record<string,Surface>{
 const B:Record<string,Surface>={};
 const mk=(name:string,w:number,h:number,fn:(g:Ctx2D)=>void)=>{const c=makeSurface(w,h);fn(c.getContext('2d'));B[name]=c;};
 const house=(name:string,roof:string,roof2:string,wallA:string,wallB:string)=>mk(name,48,52,g=>{
  // chimney (behind roof)
  rect(g,34,6,5,12,wallB);rect(g,33,5,7,2,wallA);
  pyramid(g,24,4,12,roof,roof2,48);
  wallL(g,24,10,16,16,wallA,48);wallR(g,24,10,16,16,wallB,48);
  // door on left face (vertical band)
  rect(g,10,28,6,11,PAL.woodB);rect(g,11,29,4,10,PAL.woodA);rect(g,14,33,1,1,PAL.white);
  // windows on both faces
  const win=(x:number,y:number)=>{rect(g,x,y,4,4,PAL.white);rect(g,x+1,y+1,2,2,'#9fc6d8');};
  win(14,26);win(30,26);
  // flowerbed
  rect(g,8,40,9,2,PAL.grassD);rect(g,9,39,1,1,'#d95f3b');rect(g,12,39,1,1,PAL.goldB);rect(g,15,39,1,1,'#b68293');
 });
 house('house0',PAL.roofA,PAL.roofB,PAL.wallA,PAL.wallB);
 house('house1','#c8502e','#a03c22',PAL.wallA,'#dccfa6');
 house('house2','#b04526','#8d3a22','#f2e6c8','#dbcda2');
 const bighouse=(name:string,roof:string,roof2:string,wa:string,wb:string,door:string)=>mk(name,48,52,g=>{
  rect(g,34,4,5,12,wb);rect(g,33,3,7,2,wa);
  pyramid(g,24,3,13,roof,roof2,48);
  wallL(g,24,11,17,15,wa,48);wallR(g,24,11,17,15,wb,48);
  rect(g,10,28,8,12,PAL.black);rect(g,11,29,6,11,door);
  g.fillStyle=wa;g.fillRect(11,29,1,11);g.fillRect(16,29,1,11);
  for(let i=0;i<10;i++){g.fillRect(11+i,29+Math.floor(i/2),1,1);g.fillRect(17-i,29+Math.floor(i/2),1,1);}
  rect(g,29,26,5,5,PAL.white);rect(g,30,27,3,3,'#9fc6d8');
 });
 bighouse('barn',PAL.redB,'#7e241a',PAL.red,PAL.redB,PAL.woodA);
 bighouse('storehouse',PAL.roofA,PAL.roofB,PAL.wallA,PAL.wallB,PAL.woodA);
 mk('workshop',48,52,g=>{
  rect(g,34,4,5,14,'#5a616e');rect(g,33,3,7,2,'#454b57');
  pyramid(g,24,4,12,'#4d5563','#3b424e',48);
  wallL(g,24,10,16,16,'#6b7280',48);wallR(g,24,10,16,16,'#565d6b',48);
  rect(g,11,28,7,10,'#313844');rect(g,12,29,5,9,'#3b424e');
  rect(g,28,25,6,5,'#313844');g.fillStyle=PAL.goldB;g.fillRect(29,26,4,3);
 });
 mk('well',28,32,g=>{
  diamond(g,14,6,8,12,PAL.stoneB,28);diamond(g,14,5,8,14,PAL.stoneA,28);
  diamond(g,14,7,5,13,PAL.waterB,28);diamond(g,14,7,3,15,PAL.waterC,28);
  for(const[x,y]of[[8,16],[13,18],[19,16],[10,20],[18,20]]){g.fillStyle=PAL.stoneC;g.fillRect(x,y,1,1);}
  rect(g,5,12,2,14,PAL.woodA);rect(g,21,12,2,14,PAL.woodA);
  pyramid(g,14,1,8,PAL.roofA,PAL.roofB,28);
 });
 const stall=(name:string,main:string)=>mk(name,30,26,g=>{
  rect(g,6,14,18,10,PAL.woodA);rect(g,6,14,18,2,PAL.woodB);rect(g,8,17,5,4,PAL.woodB);
  rect(g,20,17,3,3,'#d95f3b');rect(g,23,18,2,2,PAL.leafC);
  rect(g,4,8,2,16,PAL.woodA);rect(g,24,8,2,16,PAL.woodA);
  diamond(g,15,4,11,4,main,30);
  for(let x=6;x<25;x+=4)diamond(g,x,0,1,4,PAL.white,30);
 });
 stall('market0',PAL.red);stall('market1',PAL.blue);
 const scaffold=(name:string,tall:boolean)=>mk(name,44,40,g=>{
  diamond(g,22,20,11,20,PAL.pathC,44);diamond(g,22,19,11,22,PAL.pathA,44);
  const h1=tall?18:9;
  rect(g,10,24-h1,2,h1,PAL.woodA);rect(g,34,24-h1,2,h1,PAL.woodA);rect(g,22,38-h1,2,h1,PAL.woodA);rect(g,22,20-h1+6,2,h1-4,PAL.woodA);
  if(tall){rail(g,11,24-h1,1,12,PAL.woodC);rail(g,35,24-h1,-1,12,PAL.woodC);
   g.fillStyle=PAL.woodC;g.fillRect(11,24-h1,24,1);g.fillRect(11,29-h1,24,1);}
  diamond(g,33,26,3,26,PAL.stoneB,44);
 });
 scaffold('project0',false);scaffold('project1',true);
 // windmill 4 blade frames
 for(let f=0;f<4;f++)mk(`windmill${f}`,40,56,g=>{
  wallL(g,20,7,22,12,PAL.wallA,40);wallR(g,20,7,22,12,PAL.wallB,40);
  pyramid(g,20,2,9,PAL.roofB,'#8d3a22',40);
  rect(g,15,38,5,5,PAL.woodB);
  rect(g,16,26,3,4,PAL.woodB);
  const hub={x:20,y:14};
  const dirs=f%2===0?[[2,1],[-2,-1],[1,-2],[-1,2]]:[[1,2],[-1,-2],[2,-1],[-2,1]];
  for(const[dx,dy]of dirs){let x=hub.x,y=hub.y;
   for(let i=0;i<9;i++){x+=dx;y+=dy;g.fillStyle=PAL.woodB;g.fillRect(x,y,1,1);
    if(i>2){g.fillStyle='#e8dcc0';g.fillRect(x+(dx>0?1:-3),y-1,3,4);}}
  }
  g.fillStyle=PAL.woodA;g.fillRect(hub.x-1,hub.y-1,3,3);
 });
 return B;
}

// ---- props & animals ---------------------------------------------------
export function bakeProps():Record<string,Surface>{
 const P:Record<string,Surface>={};
 const mk=(name:string,w:number,h:number,fn:(g:Ctx2D)=>void)=>{const c=makeSurface(w,h);fn(c.getContext('2d'));P[name]=c;};
 mk('barrel',10,12,g=>{rect(g,2,2,6,8,PAL.woodA);rect(g,2,2,6,1,PAL.woodC);rect(g,2,9,6,1,PAL.woodB);g.fillStyle=PAL.woodB;g.fillRect(2,4,6,1);g.fillRect(2,7,6,1);});
 mk('cart',26,16,g=>{rect(g,4,4,16,8,PAL.woodA);rect(g,4,4,16,2,PAL.woodC);rect(g,6,2,12,3,PAL.woodB);
  const wheel=(x:number)=>{g.fillStyle=PAL.woodB;g.fillRect(x,10,5,5);g.fillStyle=PAL.woodA;g.fillRect(x+1,11,3,3);g.fillStyle=PAL.woodB;g.fillRect(x+2,12,1,1);};
  wheel(3);wheel(18);rect(g,20,6,5,2,PAL.woodB);});
 mk('sign',12,18,g=>{rect(g,5,6,2,12,PAL.woodB);rect(g,1,1,10,7,PAL.woodA);rect(g,1,1,10,1,PAL.woodC);g.fillStyle=PAL.black;g.fillRect(3,4,1,1);g.fillRect(6,4,1,1);g.fillRect(3,6,3,1);});
 mk('lamp',10,24,g=>{rect(g,4,6,2,18,PAL.black);rect(g,2,1,6,6,PAL.black);rect(g,3,2,4,4,PAL.goldB);g.fillStyle='#fff2c9';g.fillRect(4,3,2,2);});
 const boat=(name:string,lift:number)=>mk(name,30,16,g=>{
  const y0=8+lift;
  rect(g,3,y0,24,2,PAL.woodC);
  rect(g,5,y0+2,20,3,PAL.woodA);rect(g,8,y0+5,14,2,PAL.woodB);
  rect(g,2,y0,4,2,PAL.woodB);rect(g,24,y0,4,2,PAL.woodB);
  rect(g,12,y0-7,7,7,PAL.woodA);rect(g,12,y0-7,7,2,PAL.woodC);rect(g,14,y0-4,3,3,'#9fc6d8');
 });
 boat('boat0',0);boat('boat1',-1);
 const cow=(name:string,headDown:boolean)=>mk(name,20,16,g=>{
  rect(g,4,5,12,7,PAL.white);g.fillStyle=PAL.black;g.fillRect(6,6,3,3);g.fillRect(12,8,3,2);
  rect(g,5,12,2,3,PAL.black);rect(g,8,12,2,3,PAL.black);rect(g,12,12,2,3,PAL.black);rect(g,15,12,2,3,PAL.black);
  if(headDown){rect(g,15,10,4,4,PAL.white);rect(g,18,13,3,2,'#e8c9a0');}
  else{rect(g,15,4,4,4,PAL.white);g.fillStyle='#e8c9a0';g.fillRect(17,7,2,2);g.fillStyle=PAL.black;g.fillRect(16,5,1,1);}
 });
 cow('cow0',false);cow('cow1',true);
 const chicken=(name:string,flip:boolean)=>mk(name,10,9,g=>{
  const o=flip?0:0;
  rect(g,3+o,3,5,4,PAL.white);g.fillStyle=PAL.red;g.fillRect(4+o,1,1,2);
  g.fillStyle=PAL.goldB;g.fillRect(flip?2:7,4,2,1);g.fillStyle=PAL.black;g.fillRect(flip?3:5,3,1,1);
  rect(g,4+o,7,1,2,PAL.goldB);rect(g,6+o,7,1,2,PAL.goldB);
 });
 chicken('chicken0',false);chicken('chicken1',true);
 return P;
}

// ---- villagers ---------------------------------------------------------
type CharMap=Record<string,string>;
const charMap=(skin:string,hair:string,shirt:string,pants:string):CharMap=>({
 O:'#241f1a',S:skin,H:hair,C:shirt,P:pants,W:PAL.white,B:'#3a3f4a',T:'#8a6a3a',
});
const FRAME_IDLE0=[
 '............',
 '...OOOOOO...',
 '..OHHHHHHO..',
 '.OHHHHHHHHO.',
 '.OHSSSSSSHO.',
 '.OSSDSSDSSO.',
 '.OSSSSSSSSO.',
 '..OSSSSSSO..',
 '..OCCCCCCO..',
 '.OSCCCCCCSO.',
 '.OSCCCCCCSO.',
 '..OPPPPPPO..',
 '..OPPPPPPO..',
 '..OPPOOPPO..',
 '..OBBOOBBO..',
 '............'];
const FRAME_WALK_A=[...FRAME_IDLE0];
FRAME_WALK_A[12]='..OPPO.OPPO.';FRAME_WALK_A[13]='..OPPO..OPO.';FRAME_WALK_A[14]='.OBBO...OBBO';
const FRAME_WALK_B=[...FRAME_IDLE0];
FRAME_WALK_B[12]='...OPPPPO...';FRAME_WALK_B[13]='...OPPOPO...';FRAME_WALK_B[14]='...OBBBBO...';
const FRAME_WORK0=[...FRAME_IDLE0];
FRAME_WORK0[9]='.OSCCCCCCSO.';FRAME_WORK0[10]='.OSTCCCCSTO.';
const FRAME_WORK1=[...FRAME_IDLE0];
FRAME_WORK1[7]='..OSSSSSTO..';FRAME_WORK1[8]='..OCCCCCSTO.';FRAME_WORK1[9]='.OSCCCCCSTO.';
const FRAME_REST=[
 '............',
 '...OOOOOO...',
 '..OHHHHHHO..',
 '.OHHHHHHHHO.',
 '.OHSSSSSSHO.',
 '.OSSDSSDSSO.',
 '.OSSSSSSSSO.',
 '..OSSSSSSO..',
 '..OCCCCCCO..',
 '.OSCCCCCCSO.',
 '..OCCCCCCO..',
 '..OPPPPPPO..',
 '.OPPPPPPPPO.',
 '.OOOOOOOOOO.',
 '............',
 '............'];
export interface Character{idle0:Surface;idle1:Surface;walkA:Surface;walkB:Surface;work0:Surface;work1:Surface;rest:Surface;portrait:string;}
const portraitCache=new Map<string,string>();
export function bakeCharacter(id:string,seedHash:number,shirt:string,role:string,hatColor?:string):Character{
 const skin=SKINS[seedHash%SKINS.length], hair=HAIRS[(seedHash>>2)%HAIRS.length], pants=PANTS[(seedHash>>4)%PANTS.length];
 const hat=role==='Builder'?PAL.goldB:role==='Farmer'?'#d9a94f':role==='Water carrier'?'#3f6fd2':hatColor;
 const map=charMap(skin,hair,shirt,pants);
 const mk=(rows:string[])=>{const c=makeSurface(12,16);const g=c.getContext('2d');
  rows.forEach((row,y)=>{for(let x=0;x<row.length;x++){let col=map[row[x]];if(!col)continue;
   if(col===map.H&&hat&&y<=2)col=hat;
   g.fillStyle=col;g.fillRect(x,y,1,1);}});return c;};
 const idle0=mk(FRAME_IDLE0);
 const idle1=mk([...FRAME_IDLE0.slice(0,8),FRAME_IDLE0[9],FRAME_IDLE0[10],FRAME_IDLE0[11],FRAME_IDLE0[12],FRAME_IDLE0[13],'............']);
 const walkA=mk(FRAME_WALK_A), walkB=mk(FRAME_WALK_B), work0=mk(FRAME_WORK0), work1=mk(FRAME_WORK1), rest=mk(FRAME_REST);
 const portrait=portraitCache.get(id)??bakePortrait(id,map,role,hat);
 return {idle0,idle1,walkA,walkB,work0,work1,rest,portrait};
}
function bakePortrait(id:string,map:CharMap,role:string,hat?:string){
 const w=96,h=128,c=makeSurface(w,h),g=c.getContext('2d');
 g.fillStyle='#1c3631';g.fillRect(0,0,w,h);
 for(let y=0;y<120;y++)for(let x=0;x<88;x++){if((x-44)*(x-44)+(y-40)*(y-40)<42*42)g.fillRect(x+4,y+4,1,1);}
 // draw the 12x16 character at 7x centered, on a small ground
 for(let y=0;y<16;y++)for(let x=0;x<12;x++){const col=map[FRAME_IDLE0[y][x]];if(col){g.fillStyle=col;g.fillRect(24+x*7,16+y*7,7,7);}}
 g.fillStyle='#173530';g.fillRect(0,118,96,10);
 const url=c.toDataURL?c.toDataURL('image/png'):'';
 portraitCache.set(id,url);return url;
}
export function characterHash(id:string){let h=0;for(const ch of id)h=(h*31+ch.charCodeAt(0))>>>0;return h;}
// Client-only pixel portrait for the inspector (cached per resident).
export function residentPortrait(v:{id:string;color:string;role:string}):string{
 if(typeof window==='undefined')return '';
 return bakeCharacter(v.id,characterHash(v.id),v.color,v.role).portrait;
}
