import { test, expect } from '@playwright/test';
import {mkdir} from 'node:fs/promises';

test('authoritative API lifecycle, validation, checkpoint and concurrent tick protection',async({request})=>{
 const command=async(command:string,extra={})=>{const r=await request.post('/api/world',{data:{command,...extra}});expect(r.ok()).toBeTruthy();return r.json();};
 await command('reset');let data=await command('step');expect(data.world.tick).toBe(1);expect(data.world.residents).toHaveLength(20);
 await command('save');const saved=JSON.stringify(data.world.residents);await command('step');data=await command('load');expect(data.world.tick).toBe(1);expect(data.world.status).toBe('paused');expect(JSON.stringify(data.world.residents)).toBe(saved);
 const frozen=JSON.stringify(data.world);await new Promise(r=>setTimeout(r,500));const after=await (await request.get('/api/world')).json();expect(JSON.stringify(after.world)).toBe(frozen);
 data=await command('start');const envelope={tick:data.world.tick,generation:data.world.generation};const results=await Promise.all([command('advance',envelope),command('advance',envelope)]);expect(Math.max(...results.map(r=>r.world.tick))).toBe(2);
 await command('pause');data=await command('advance',{tick:2,generation:envelope.generation});expect(data.world.tick).toBe(2);
 expect((await request.post('/api/world',{data:{command:'spawn_money'}})).status()).toBe(400);
 expect((await request.post('/api/world',{data:{command:'speed',speed:100}})).status()).toBe(400);
 await command('reset');
});
test('village overview, resident follow, lifecycle controls and inspectors',async({page,request})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 await request.post('/api/world',{data:{command:'reset'}});await page.goto('/');
 await expect(page.getByText('Connected to village',{exact:true})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Sunhaven'})).toBeVisible();
 await expect(page.getByRole('heading',{name:'Elara Reed',exact:true})).toBeVisible();
 await mkdir('artifacts',{recursive:true});await page.screenshot({path:'artifacts/overview-1366.png'});
 await page.getByRole('button',{name:'Start simulation',exact:true}).click();await expect(page.getByRole('button',{name:'Pause simulation',exact:true})).toBeVisible();
 await expect.poll(async()=>((await (await request.get('/api/world')).json()).world.tick)).toBeGreaterThan(0);
 await page.getByRole('button',{name:'Pause simulation',exact:true}).click();await expect(page.getByText('SIMULATION PAUSED',{exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Save world',exact:true}).click();await expect(page.getByText('Checkpoint saved to PostgreSQL')).toBeVisible();
 await page.getByRole('button',{name:'Single step',exact:true}).click();await page.getByRole('button',{name:'Load checkpoint',exact:true}).click();await expect(page.getByText('Checkpoint restored · village paused')).toBeVisible();
 await page.getByRole('button',{name:'Follow villager',exact:true}).click();await expect(page.getByRole('button',{name:'Following Elara',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Zoom in',exact:true}).click();await page.getByRole('button',{name:'Zoom in',exact:true}).click();await page.screenshot({path:'artifacts/resident-inspection-1366.png'});
 await page.getByRole('button',{name:'Reset camera',exact:true}).click();
 // Canvas camera: default zoom 0.5 centered on the world; the zoom-in button steps to 1.0 (camera stays centered).
 for(const z of [.5,1]){if(z>1)await page.getByRole('button',{name:'Zoom in',exact:true}).click();const point=await page.locator('.world-canvas').evaluate((el,z)=>{const c=el as HTMLCanvasElement;const r=c.getBoundingClientRect();const TW=32,TH=16,MARGIN=6;const ORX=MARGIN*TW+48,ORY=72;const wx=ORX+(31.2-35.2)*(TW/2),wy=ORY+(31.2+35.2)*(TH/2);const cx=ORX,cy=ORY+64*(TH/2)+8;return{x:r.left+(wx-cx)*z+r.width/2,y:r.top+(wy-cy)*z+r.height/2};},z);await page.mouse.click(point.x,point.y);await expect(page.getByText('Terrain · Tile 31, 35',{exact:true})).toBeVisible();}
 await page.getByRole('button',{name:'Reset camera',exact:true}).click();await page.getByRole('button',{name:'Map layers',exact:true}).click();await page.getByRole('button',{name:'Terrain grid',exact:true}).click();await page.getByRole('button',{name:'Close layers',exact:true}).click();
 await page.getByRole('button',{name:'Projects',exact:true}).click();await expect(page.getByText('Building, together')).toBeVisible();await expect(page.getByText('Wood delivered')).toBeVisible();
 await page.getByRole('button',{name:'Economy',exact:true}).click();await expect(page.getByText('The village economy')).toBeVisible();
 await page.getByRole('button',{name:'Agents',exact:true}).click();await expect(page.getByRole('button',{name:/Advisor Analyzes, guides, suggests/})).toBeVisible();
 await page.getByRole('button',{name:'Village',exact:true}).click();await page.getByRole('button',{name:'All events',exact:true}).click();await page.locator('.event-row').first().click();await expect(page.getByRole('dialog',{name:'Causal event inspector'})).toBeVisible();await page.getByRole('button',{name:'Close event',exact:true}).click();
 await page.setViewportSize({width:1920,height:1080});await page.screenshot({path:'artifacts/overview-1920.png'});await page.getByRole('button',{name:'Zoom in',exact:true}).click();await page.getByRole('button',{name:'Zoom in',exact:true}).click();await page.getByRole('button',{name:'Zoom in',exact:true}).click();await page.screenshot({path:'artifacts/street-1920.png'});
 expect(errors).toEqual([]);await request.post('/api/world',{data:{command:'reset'}});
});

test('actual nearby conversation remains inspectable after save and load',async({page,request})=>{
 await request.post('/api/world',{data:{command:'reset'}});
 for(let i=0;i<80;i++)await request.post('/api/world',{data:{command:'step'}});
 const before=await (await request.get('/api/world')).json();expect(before.world.conversations.length).toBeGreaterThan(0);
 await request.post('/api/world',{data:{command:'save'}});await request.post('/api/world',{data:{command:'step'}});
 const after=await (await request.post('/api/world',{data:{command:'load'}})).json();expect(after.world.conversations).toEqual(before.world.conversations);
 await page.goto('/');await page.getByRole('button',{name:'Conversations',exact:true}).click();await expect(page.locator('.event-row').first()).toBeVisible();await page.locator('.event-row').first().click();
 await expect(page.getByText('Grounded outcome',{exact:true})).toBeVisible();await expect(page.getByText('Greeting heard nearby. Speaker familiarity +1. No contract or transfer.',{exact:true})).toBeVisible();
 await page.screenshot({path:'artifacts/conversation-1366.png'});await request.post('/api/world',{data:{command:'reset'}});
});
