export type Resource = 'food' | 'water' | 'wood' | 'stone' | 'seeds' | 'tools';
export type Activity = 'Farming' | 'Fetching water' | 'Gathering wood' | 'Building' | 'Resting' | 'Eating' | 'Drinking' | 'Delivering';
export type Point = { x: number; y: number };
export type Resident = Point & { id: string; name: string; age: number; role: string; color: string; home: string; personality: string; goal: string; hunger: number; thirst: number; energy: number; mood: number; coins: number; task: Activity; destination: Point; progress: number; carry: Partial<Record<Resource, number>>; memories: string[]; relationships: Record<string, number>; explanation: string; lastEvent?: string };
export type WorldEvent = { id: string; tick: number; kind: 'production' | 'consumption' | 'movement' | 'decision' | 'social' | 'construction' | 'system'; actor?: string; target?: string; title: string; detail: string; location?: Point; causes: string[]; delta?: Partial<Record<Resource, number>>; flow?: 'source' | 'sink' | 'transfer'; residentChanges?: Pick<Resident,'id'|'x'|'y'|'hunger'|'thirst'|'energy'|'mood'|'progress'|'task'>[] };
export type Building = Point & { id: string; name: string; type: 'house' | 'farm' | 'well' | 'storage' | 'workshop' | 'market' | 'project'; condition: number };
export type Conversation = { id: string; tick: number; speaker: string; recipient: string; text: string; eventId: string; outcome: string };
export type World = { version: 1; seed: number; generation: number; tick: number; status: 'paused' | 'running' | 'stopped'; speed: number; residents: Resident[]; buildings: Building[]; stocks: Record<Resource, number>; forest: number; project: { wood: number; stone: number; labor: number; complete: boolean }; events: WorldEvent[]; conversations: Conversation[]; sequence: number; history: { tick: number; food: number; water: number; wood: number }[]; lastAdvance: number };
export const STATIONS = { farm: { x: 22, y: 22 }, well: { x: 30, y: 30 }, forest: { x: 18, y: 38 }, storage: { x: 38, y: 30 }, project: { x: 40, y: 40 }, rest: { x: 30, y: 22 } };
const names = ['Elara Reed','Oliver Moss','Amelia Hart','Noah Brooks','Isla Bennett','Leo Ashford','Freya Wells','Theo Finch','Hazel Rivers','Finn Oakley','Clara Wood','Arthur Hale','Ivy Green','Oscar Field','Luna Marsh','Jasper Stone','Mila Rowan','Elias Fern','Ada Willow','Felix Hill'];
const roles = ['Farmer','Water carrier','Woodcutter','Builder','Farmer','Farmer','Water carrier','Woodcutter','Builder','Farmer'];
export const colors = ['#e1a65b','#739bac','#b68293','#89aa76','#d7785c','#b9a076'];
export function emit(w: World, event: Omit<WorldEvent, 'id' | 'tick' | 'causes'> & { causes?: string[] }) { const e: WorldEvent = { ...event, causes: event.causes || [], id: `E${String(++w.sequence).padStart(5,'0')}`, tick: w.tick }; w.events.push(e); if(w.events.length > 600) w.events.shift(); if(e.actor) { const v=w.residents.find(r=>r.id===e.actor); if(v) { v.lastEvent=e.id; v.memories=[e.id,...v.memories].slice(0,12); } } return e; }
export function createWorld(seed=42): World {
 const w: World = { version:1, seed, generation:1, tick:0, status:'paused', speed:1, residents:[], buildings:[], stocks:{food:180,water:240,wood:64,stone:40,seeds:120,tools:12}, forest:2400, project:{wood:0,stone:0,labor:0,complete:false}, events:[],conversations:[],sequence:0,history:[],lastAdvance:0 };
 const houses: Point[]=[{x:25,y:15},{x:34,y:16},{x:43,y:22},{x:45,y:30},{x:31,y:42},{x:23,y:44}];
 w.buildings=[...houses.map((p,i)=>({...p,id:`home-${i}`,name:['Willow Cottage','Moss House','Rosewood Home','Brookside House','The Old Homestead','Fern Cottage'][i],type:'house' as const,condition:96})),{...STATIONS.farm,id:'farm',name:'Sunfield Farm',type:'farm',condition:100},{...STATIONS.well,id:'well',name:'Village Well',type:'well',condition:92},{...STATIONS.storage,id:'storage',name:'Granary & Storage',type:'storage',condition:98},{x:34,y:48,id:'workshop',name:'Oak & Iron Workshop',type:'workshop',condition:90},{x:37,y:23,id:'market',name:'Market Square',type:'market',condition:100},{...STATIONS.project,id:'project',name:'Community Storehouse',type:'project',condition:0}];
 w.residents=names.map((name,i)=>{ const role=roles[i%10]; const task:Activity=role==='Farmer'?'Farming':role==='Water carrier'?'Fetching water':role==='Woodcutter'?'Gathering wood':'Building'; return {id:`v${i+1}`,name,age:22+((i*7+seed)%30),role,color:colors[i%colors.length],home:`home-${i%6}`,personality:['Thoughtful & dependable','Curious & sociable','Independent & patient','Practical & generous'][i%4],goal:role==='Builder'?'Make room for our growing village':role==='Farmer'?'Keep the village well fed':'Provide for my household',x:houses[i%6].x-2-Math.floor(i/6)*1.5,y:houses[i%6].y+3+Math.floor(i/6),hunger:18+i%8,thirst:12+i%10,energy:78+i%15,mood:76+i%17,coins:2400,task,destination:{...(task==='Farming'?STATIONS.farm:task==='Fetching water'?STATIONS.well:task==='Building'?STATIONS.project:STATIONS.forest)},progress:0,carry:{},memories:[],relationships:{},explanation:`${role} work supports my household. My immediate needs are met, so I can help.`}; });
 emit(w,{kind:'system',title:'A new chapter in Sunhaven',detail:'20 residents settled with 180 food, 240 drinking water, 64 wood, 40 stone, 120 seeds and 12 tools. Each resident owns 2,400 minor currency units. Seed '+seed+'. These are explicit initial endowments.'});
 for(const v of w.residents) emit(w,{kind:'decision',actor:v.id,title:`${v.name.split(' ')[0]} is ${v.task.toLowerCase()}`,detail:v.explanation,location:{x:v.x,y:v.y}});
 w.history.push({tick:0,food:180,water:240,wood:64}); return w;
}
function setTask(w:World,v:Resident,task:Activity,destination:Point,reason:string){v.task=task;v.destination={...destination};v.progress=0;v.explanation=reason;emit(w,{kind:'decision',actor:v.id,title:`${v.name.split(' ')[0]} chose ${task.toLowerCase()}`,detail:reason,location:{x:v.x,y:v.y},causes:v.lastEvent?[v.lastEvent]:[]});}
// ---- social layer --------------------------------------------------------
// Relationships deepen only from recorded greetings. Friendship is a derived
// tier of the relationship count (3+ shared greetings = friend, 6+ = close
// friend) and adds a small, bounded wellbeing bonus. Crossing-path greetings
// make social life happen on the streets, not only at work sites.
// Everything is deterministic (integer hashes, no Math.random).
const SOCIAL_BONUS_MAX=8;
export const friendshipTier=(n:number)=>n>=6?'close friend':n>=3?'friend':n>=1?'acquaintance':'stranger';
export const socialBonus=(v:Resident)=>Math.min(SOCIAL_BONUS_MAX,Object.values(v.relationships).reduce((a,b)=>a+b,0)/2);
function greet(w:World,v:Resident,other:Resident,context:'nearby'|'passing'){
 const first=v.name.split(' ')[0],second=other.name.split(' ')[0];
 const before=v.relationships[other.id]||0;
 const text=context==='passing'?['Good to run into you, '+second+'.','Careful on the path, '+second+'.','You always seem busy, '+second+'.'][((w.tick+before)%3)]:v.energy<35?'I need a little rest before I can help again.':v.task==='Farming'?'A good harvest. I’m taking this back to the granary.':'Good to see you. How is your day going?';
 const e=emit(w,{kind:'social',actor:v.id,target:other.id,title:`${first} spoke with ${second}`,detail:text,location:{x:v.x,y:v.y}});
 v.relationships[other.id]=before+1;
 other.memories=[e.id,...other.memories].slice(0,12);
 w.conversations.push({id:e.id,tick:w.tick,speaker:v.id,recipient:other.id,text,eventId:e.id,outcome:`Greeting heard (${context}). Shared greetings ${before} → ${before+1}. No contract or transfer.`});
 w.conversations=w.conversations.slice(-80);
 if(before+1===3)emit(w,{kind:'social',actor:v.id,target:other.id,title:`${first} and ${second} became friends`,detail:'Three recorded greetings. Friendships deepen slowly and only from actual encounters.',location:{x:v.x,y:v.y}});
 else if(before+1===6)emit(w,{kind:'social',actor:v.id,target:other.id,title:`${first} and ${second} are now close friends`,detail:'Six recorded greetings. Close bonds add a small wellbeing bonus for both of them.',location:{x:v.x,y:v.y}});
}
function plan(w:World,v:Resident){
 if(Object.values(v.carry).some(n=>n&&n>0)) return setTask(w,v,'Delivering',STATIONS.storage,'My carrying capacity is five units. I need to deliver these goods before working again.');
 if(v.thirst>48&&w.stocks.water>0)return setTask(w,v,'Drinking',STATIONS.storage,'Thirst takes priority over work. Drinking water is available at the granary.');
 if(v.hunger>50&&w.stocks.food>0)return setTask(w,v,'Eating',STATIONS.storage,'I need a meal before I continue working.');
 if(v.energy<28)return setTask(w,v,'Resting',STATIONS.rest,'I am too tired to take more work. I will rest instead.');
 if(v.role==='Farmer')return setTask(w,v,'Farming',STATIONS.farm,'Tend the planted field and bring its harvest to the granary.');
 if(v.role==='Water carrier')return setTask(w,v,'Fetching water',STATIONS.well,'Collect freshwater from the well, never from the sea.');
 if(v.role==='Builder'&&!w.project.complete)return setTask(w,v,'Building',STATIONS.project,'I volunteer to build the community storehouse using shared materials.');
 if(w.forest>0)return setTask(w,v,'Gathering wood',STATIONS.forest,'Gather finite woodland resources and carry them back.');
 setTask(w,v,'Resting',STATIONS.rest,'The woodland is depleted. I will not pretend more timber exists.');
}
function completeTask(w:World,v:Resident){
 const causes=v.lastEvent?[v.lastEvent]:[]; const base={actor:v.id,location:{x:v.x,y:v.y},causes};
 if(v.task==='Delivering'){const goods=Object.entries(v.carry) as [Resource,number][];for(const [r,n]of goods)w.stocks[r]+=n;emit(w,{...base,kind:'production',flow:'transfer',title:`${v.name.split(' ')[0]} delivered ${goods.map(([r,n])=>`${n} ${r}`).join(', ')}`,detail:'Carried goods transferred to shared storage; this is a transfer, not new production.',delta:{...v.carry}});v.carry={};}
 else if(v.task==='Farming'&&w.stocks.seeds>0){w.stocks.seeds--;v.carry={food:5};w.stocks.seeds+=2;emit(w,{...base,kind:'production',flow:'source',title:`${v.name.split(' ')[0]} harvested 5 food`,detail:'Eight labor ticks and one seed produced five food and two recovered seeds. Food is carried, not yet in storage.',delta:{food:5,seeds:1}});}
 else if(v.task==='Fetching water'){v.carry={water:5};emit(w,{...base,kind:'production',flow:'source',title:`${v.name.split(' ')[0]} collected fresh water`,detail:'Five units extracted from the renewable freshwater well after three labor ticks.',delta:{water:5}});}
 else if(v.task==='Gathering wood'&&w.forest>0){const n=Math.min(5,w.forest);w.forest-=n;v.carry={wood:n};emit(w,{...base,kind:'production',flow:'source',title:`${v.name.split(' ')[0]} gathered ${n} wood`,detail:`Finite woodland extraction. ${w.forest} units remain.`,delta:{wood:n}});}
 else if(v.task==='Eating'&&w.stocks.food>0){w.stocks.food--;v.hunger=Math.max(0,v.hunger-65);emit(w,{...base,kind:'consumption',flow:'sink',title:`${v.name.split(' ')[0]} shared a meal`,detail:'Consumed one food from the granary.',delta:{food:-1}});}
 else if(v.task==='Drinking'&&w.stocks.water>0){w.stocks.water--;v.thirst=Math.max(0,v.thirst-70);emit(w,{...base,kind:'consumption',flow:'sink',title:`${v.name.split(' ')[0]} drank fresh water`,detail:'Consumed one unit of stored drinking water.',delta:{water:-1}});}
 else if(v.task==='Resting'){v.energy=Math.min(100,v.energy+50);emit(w,{...base,kind:'decision',title:`${v.name.split(' ')[0]} feels rested`,detail:'Recovered 50 energy through six ticks of rest.'});}
 else if(v.task==='Building'&&!w.project.complete){
  const reservedWood=w.residents.filter(r=>r.task==='Building').reduce((n,r)=>n+(r.carry.wood||0),0);const reservedStone=w.residents.filter(r=>r.task==='Building').reduce((n,r)=>n+(r.carry.stone||0),0);
  const wood=Math.max(0,Math.min(5,30-w.project.wood-reservedWood,w.stocks.wood));const stone=Math.max(0,Math.min(5-wood,18-w.project.stone-reservedStone,w.stocks.stone));
  // Materials must be physically collected before they can reach the site.
  if(wood>0||stone>0){v.carry={wood,stone};w.stocks.wood-=wood;w.stocks.stone-=stone;v.destination={...STATIONS.project};v.progress=0;emit(w,{...base,kind:'construction',flow:'transfer',title:`${v.name.split(' ')[0]} collected building materials`,detail:`Withdrew ${wood} wood and ${stone} stone at storage for site delivery.`,delta:{wood:-wood,stone:-stone}});return;}
  if(w.project.wood>=30&&w.project.stone>=18){w.project.labor=Math.min(60,w.project.labor+4);w.project.complete=w.project.labor===60;emit(w,{...base,kind:'construction',title:w.project.complete?'Community storehouse completed':`${v.name.split(' ')[0]} worked on the storehouse`,detail:`Materials: ${w.project.wood}/30 wood, ${w.project.stone}/18 stone. Labor: ${w.project.labor}/60.`});}
 }
 if(w.tick%3===0){const other=w.residents.find(r=>r.id!==v.id&&Math.abs(r.x-v.x)+Math.abs(r.y-v.y)<3);if(other)greet(w,v,other,'nearby');}
 plan(w,v);
}
export function advance(w:World,force=false){
 if(w.status!=='running'&&!force)return w;
 w.tick++;
 const firstSequence=w.sequence;
 for(const v of w.residents){
  v.hunger=Math.min(100,v.hunger+0.65);v.thirst=Math.min(100,v.thirst+0.85);v.energy=Math.max(0,v.energy-0.25);v.mood=Math.round(Math.max(15,Math.min(100,100-(v.hunger+v.thirst)/5-(100-v.energy)/4+socialBonus(v))));
  if(v.task==='Building'&&!Object.values(v.carry).some(n=>n&&n>0)&&(w.project.wood<30||w.project.stone<18))v.destination={...STATIONS.storage};
  const dx=v.destination.x-v.x,dy=v.destination.y-v.y;
  if(Math.abs(dx)+Math.abs(dy)>0.01){const old={x:v.x,y:v.y};if(Math.abs(dx)>0.01)v.x+=Math.sign(dx)*Math.min(1.5,Math.abs(dx));else v.y+=Math.sign(dy)*Math.min(1.5,Math.abs(dy));emit(w,{kind:'movement',actor:v.id,title:`${v.name.split(' ')[0]} traveled toward ${v.task.toLowerCase()}`,detail:`(${old.x}, ${old.y}) → (${v.x}, ${v.y}); maximum 1.5 tiles per tick.`,location:{x:v.x,y:v.y}});continue;}
  if(v.task==='Building'&&Object.values(v.carry).some(n=>n&&n>0)){const wood=v.carry.wood||0,stone=v.carry.stone||0;w.project.wood+=wood;w.project.stone+=stone;v.carry={};emit(w,{kind:'construction',actor:v.id,title:`${v.name.split(' ')[0]} delivered building materials`,detail:`Delivered ${wood} wood and ${stone} stone to the construction site.`,location:{x:v.x,y:v.y}});plan(w,v);continue;}
  v.progress++;
  const duration=v.task==='Farming'?8:v.task==='Resting'?6:v.task==='Gathering wood'?5:v.task==='Building'?4:v.task==='Fetching water'?3:1;
  if(v.progress>=duration)completeTask(w,v);
 }
 // organic social life: residents whose paths cross may greet. Deterministic
 // gate (integer hash of both ids and the tick), max two per tick, never a
 // repeat of a pair that already spoke this tick.
 const tickSocial=new Set(w.events.filter(e=>e.tick===w.tick&&e.kind==='social').map(e=>`${e.actor}|${e.target}`));
 let passGreeted=0;
 for(let i=0;i<w.residents.length&&passGreeted<2;i++){
  for(let j=i+1;j<w.residents.length&&passGreeted<2;j++){
   const a=w.residents[i],b=w.residents[j];
   const d=Math.abs(a.x-b.x)+Math.abs(a.y-b.y);
   if(d>2.4||d<0.5)continue;
   if(tickSocial.has(`${a.id}|${b.id}`)||tickSocial.has(`${b.id}|${a.id}`))continue;
   const h=(Math.imul(a.id.charCodeAt(1)*73856093,97)+Math.imul(b.id.charCodeAt(1)*19349663,97)+Math.imul(w.tick,104729))>>>0;
   if(h%10<4){const s=h%2?a:b,g=h%2?b:a;greet(w,s,g,'passing');tickSocial.add(`${a.id}|${b.id}`);tickSocial.add(`${b.id}|${a.id}`);passGreeted++;}
  }
 }
 if(w.tick>0&&w.tick%36===0){
  const avg=Math.round(w.residents.reduce((n,v)=>n+v.mood,0)/w.residents.length);
  let best:{x:string,y:string,n:number}|null=null;
  for(let i=0;i<w.residents.length;i++)for(let j=i+1;j<w.residents.length;j++){
   const A=w.residents[i],B=w.residents[j];
   const n=Math.max(A.relationships[B.id]||0,B.relationships[A.id]||0);
   if(n>0&&(!best||n>best.n))best={x:A.name.split(' ')[0],y:B.name.split(' ')[0],n};
  }
  const loners=w.residents.filter(v=>Object.keys(v.relationships).length===0).length;
  emit(w,{kind:'social',title:'Village social report',detail:`Average wellbeing ${avg}/100.`+(loners?`${loners} resident${loners>1?'s':''} without a recorded connection yet.`:'No resident is without a connection.')+(best?` Closest bond: ${best.x} & ${best.y} (${best.n} shared greetings).`:'')});
 }
 emit(w,{kind:'system',title:`Tick ${w.tick} committed`,detail:'Ten simulation minutes elapsed. Recorded position, hunger, thirst, energy, mood, task and work-progress values for every resident. No wall-clock catch-up.',causes:w.events.filter(e=>e.id>`E${String(firstSequence).padStart(5,'0')}`).map(e=>e.id),residentChanges:w.residents.map(({id,x,y,hunger,thirst,energy,mood,progress,task})=>({id,x,y,hunger,thirst,energy,mood,progress,task}))});
 if(w.tick%6===0){w.history.push({tick:w.tick,food:w.stocks.food,water:w.stocks.water,wood:w.stocks.wood});w.history=w.history.slice(-60);}
 return w;
}
export type Command = 'start'|'pause'|'step'|'stop'|'save'|'load'|'reset'|'speed'|'advance';
export function applyCommand(w:World,command:Command,speed?:number,expected?:{tick:number;generation:number}){
 if(command==='advance'){if(!expected||expected.tick!==w.tick||expected.generation!==w.generation||w.status!=='running')return w;advance(w);}
 else if(command==='step'){if(w.status==='running')throw new Error('Pause before single stepping.');advance(w,true);}
 else if(command==='start'){w.status='running';w.generation++;}
 else if(command==='pause'||command==='stop'){w.status=command==='pause'?'paused':'stopped';w.generation++;}
 else if(command==='speed'&&speed&&[1,2,5].includes(speed))w.speed=speed;
 return w;
}
export function timeLabel(tick:number){const m=480+tick*10;return {day:Math.floor(m/1440)+1,time:`${String(Math.floor(m/60)%24).padStart(2,'0')}:${String(m%60).padStart(2,'0')}`};}
export const supervisors=[['Town Planner','Plans a better tomorrow','Housing and settlement layout for the 20 starting residents. Project progress and household count are tracked here.'],['Resource Manager','Keeps resources in balance','Tracks storage, finite woodland and carried materials. Every unit has a recorded source or sink.'],['Farmer','Grows food, grows happiness','Harvests consume seeds and labor. Compare production with meals in the recorded food history.'],['Builder','Builds, improves, maintains','The storehouse needs 30 wood, 18 stone and 60 labor. Materials must be physically delivered to the site.'],['Researcher','Discovers new possibilities','The causal journal records every committed decision and event. Replayable evidence, never invented outcomes.'],['Citizen Support','Listens, helps, cares','Only nearby residents hear recorded greetings. Each one logs a witnessed memory for the listener.'],['Security','Keeps the village safe','Dispute and incident mechanics are not implemented in this slice. Zero conflicts are recorded to date.'],['Trade & Economy','Moves value, creates opportunity','Initial currency is strictly conserved. Inventory-backed trading is deferred in this slice.'],['Environment','A cleaner, greener village','Woodland is finite; the village well is a documented renewable freshwater source.'],['Advisor','Analyzes, guides, suggests','Read-only summaries of committed events. Display text never changes authoritative state.']];
