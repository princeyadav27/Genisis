import { db } from '@/db';
import { worlds, checkpoints, eventJournal } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';
import { applyCommand, createWorld, type Command } from './simulation';

export async function worldCommand(command?: Command, input?: { speed?: number; tick?: number; generation?: number }) {
 return db.transaction(async tx => {
  await tx.execute(sql`select pg_advisory_xact_lock(424220)`);
  const [row]=await tx.select().from(worlds).where(eq(worlds.id,'willowbrook'));
  let state=row?.state ?? createWorld();
  const priorSequence=row?.state.sequence ?? 0;
  const [saved]=await tx.select().from(checkpoints).where(eq(checkpoints.id,'manual'));
  let savedAt=saved?.createdAt.toISOString() ?? null;
  let changed=!row;
  if(command==='load') {
   if(!saved)throw new Error('No checkpoint yet. Save your village first.');
   if(saved.state.version!==1||!Array.isArray(saved.state.residents)||saved.state.residents.length!==20)throw new Error('This checkpoint is incompatible with the current world schema.');
   const generation=state.generation+1;state=structuredClone(saved.state);state.status='paused';state.generation=generation;state.lastAdvance=0;changed=true;
  }else if(command==='reset') {const generation=state.generation+1;state=createWorld();state.generation=generation;changed=true;
  }else if(command==='advance'){
   const interval=1000/state.speed;
   if(Date.now()-state.lastAdvance>=interval && input?.generation===state.generation&&input?.tick===state.tick&&state.status==='running'){
    applyCommand(state,command,undefined,{tick:input.tick,generation:input.generation});state.lastAdvance=Date.now();changed=true;
   }
  }else if(command&&command!=='save') {applyCommand(state,command,input?.speed);changed=true;}
  if(command==='save'||command==='stop'){
   const now=new Date();await tx.insert(checkpoints).values({id:'manual',state:structuredClone(state),createdAt:now}).onConflictDoUpdate({target:checkpoints.id,set:{state:structuredClone(state),createdAt:now}});savedAt=now.toISOString();
  }
  if(changed){
   await tx.insert(worlds).values({id:'willowbrook',state,updatedAt:new Date()}).onConflictDoUpdate({target:worlds.id,set:{state,updatedAt:new Date()}});
   const fresh=command==='reset'?state.events:command==='load'?[]:state.events.filter(e=>e.id> `E${String(priorSequence).padStart(5,'0')}`);
   if(fresh.length)await tx.insert(eventJournal).values(fresh.map(event=>({id:`${state.generation}:${event.id}`,generation:state.generation,event}))).onConflictDoNothing();
  }
  return {world:state,savedAt};
 });
}
