import { NextRequest, NextResponse } from 'next/server';
import { worldCommand } from '@/lib/world-store';
import type { Command } from '@/lib/simulation';
export const dynamic='force-dynamic';
export async function GET(){try{return NextResponse.json(await worldCommand());}catch(error){console.error(error);return NextResponse.json({error:'Village storage is unavailable. Please try again.'},{status:503});}}
export async function POST(req:NextRequest){
 try{
  const origin=req.headers.get('origin');if(origin&&new URL(origin).host!==req.headers.get('host'))return NextResponse.json({error:'Cross-origin commands are not allowed.'},{status:403});
  const body=await req.json();
  const allowed:Command[]=['start','pause','step','stop','save','load','reset','speed','advance'];
  if(!body||!allowed.includes(body.command)|| (body.command==='speed'&&![1,2,5].includes(body.speed)) || (body.command==='advance'&&(!Number.isInteger(body.tick)||!Number.isInteger(body.generation))))return NextResponse.json({error:'Invalid simulation command.'},{status:400});
  return NextResponse.json(await worldCommand(body.command,{speed:body.speed,tick:body.tick,generation:body.generation}));
 }catch(error){return NextResponse.json({error:error instanceof Error?error.message:'Unable to apply command.'},{status:400});}
}
