import assert from 'node:assert/strict';
import { test } from 'node:test';
import { createWorld, advance, applyCommand } from '../src/lib/simulation';

test('seeded 1000-tick continuation is deterministic and respects physical invariants',()=>{
 const a=createWorld(42),b=createWorld(42);a.status=b.status='running';let completed=false;
 for(let t=0;t<1000;t++){
  const before=a.residents.map(v=>({x:v.x,y:v.y}));advance(a);advance(b);
  for(const n of Object.values(a.stocks))assert.ok(Number.isInteger(n)&&n>=0);
  assert.equal(a.residents.reduce((n,v)=>n+v.coins,0),48000);
  a.residents.forEach((v,i)=>{assert.ok(Math.abs(v.x-before[i].x)+Math.abs(v.y-before[i].y)<=1.5001);assert.ok(Object.values(v.carry).reduce((n,x)=>n+(x||0),0)<=5);assert.ok(v.hunger>=0&&v.hunger<=100);});
  if(a.project.complete){completed=true;assert.ok(a.project.wood>=30&&a.project.stone>=18&&a.project.labor===60);}
 }
 assert.deepEqual(a,b);assert.ok(completed,'material and labor backed construction completes');assert.ok(a.conversations.length>0);assert.ok(a.stocks.food>0&&a.stocks.water>0,'baseline retains food and water');
 console.log(JSON.stringify({ticks:a.tick,food:a.stocks.food,water:a.stocks.water,wood:a.stocks.wood,project:a.project,events:a.sequence,maxHunger:Math.max(...a.residents.map(v=>v.hunger)),maxThirst:Math.max(...a.residents.map(v=>v.thirst))}));
});
test('pause is stable; stale generation and duplicate observations cannot advance',()=>{const w=createWorld();const snapshot=JSON.stringify(w);advance(w);assert.equal(JSON.stringify(w),snapshot);applyCommand(w,'start');const old={tick:w.tick,generation:w.generation};applyCommand(w,'advance',undefined,old);assert.equal(w.tick,1);applyCommand(w,'advance',undefined,old);assert.equal(w.tick,1);applyCommand(w,'pause');const paused=JSON.stringify(w);applyCommand(w,'advance',undefined,{tick:w.tick,generation:old.generation});assert.equal(JSON.stringify(w),paused);applyCommand(w,'step');assert.equal(w.tick,2);assert.equal(w.status,'paused');});
test('serialized checkpoint restores deterministic continuation',()=>{const a=createWorld();a.status='running';for(let i=0;i<75;i++)advance(a);const b=JSON.parse(JSON.stringify(a));for(let i=0;i<50;i++){advance(a);advance(b);}assert.deepEqual(a,b);});
test('finite extraction, nearby communication, and food source accounting',()=>{const w=createWorld();w.status='running';w.forest=0;for(let i=0;i<100;i++)advance(w);assert.equal(w.forest,0);assert.ok(!w.events.some(e=>e.kind==='production'&&e.title.includes('gathered')));for(const c of w.conversations){const e=w.events.find(e=>e.id===c.eventId);if(e){assert.equal(e.target,c.recipient);assert.ok(e.location);}}});

test('resource ledgers reconcile sources, sinks, carried stocks and project materials',()=>{
 const w=createWorld();w.status='running';const balances={food:180,water:240,seeds:120};
 for(let t=0;t<1000;t++){const seq=w.sequence;advance(w);const fresh=w.events.filter(e=>Number(e.id.slice(1))>seq);for(const e of fresh)if(e.flow==='source'||e.flow==='sink')for(const r of ['food','water','seeds'] as const)balances[r]+=e.delta?.[r]||0;
 for(const r of ['food','water','seeds'] as const)assert.equal(w.stocks[r]+w.residents.reduce((n,v)=>n+(v.carry[r]||0),0),balances[r]);
 assert.equal(w.forest+w.stocks.wood+w.project.wood+w.residents.reduce((n,v)=>n+(v.carry.wood||0),0),2464);
 assert.equal(w.stocks.stone+w.project.stone+w.residents.reduce((n,v)=>n+(v.carry.stone||0),0),40);
 }
});
