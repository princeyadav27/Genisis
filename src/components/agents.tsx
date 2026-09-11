'use client';
// Original robot illustrations for the ten read-only supervisor agents.
// Palette rows: [skin, belly, accent, glow, dark]
const P:[string,string,string,string,string][]=[
 ['#e9f2fa','#d5e6f3','#3f8fd2','#79d6ff','#9db8cc'],
 ['#eef7ef','#dcebdd','#58a55c','#93f0a0','#a8c4a8'],
 ['#f4ecd9','#e9dcc0','#c89a4b','#ffd166','#c4ad84'],
 ['#f6ecd6','#ecddc0','#e2a33c','#ffd166','#c9b58d'],
 ['#f0e7f6','#e3d5ef','#7a4fd0','#cfa4ff','#b4a3c9'],
 ['#fde9f1','#f7d4e3','#e2558f','#ff9cc0','#d8a9bd'],
 ['#454e5e','#333b49','#c0392b','#ff6a55','#2c3340'],
 ['#f3e7cd','#eadbb8','#b98a4a','#ffd166','#c2ab84'],
 ['#eff7f0','#e0efdd','#4f9e6b','#93f0a0','#a4c2ac'],
 ['#eaf2fb','#d9e7f6','#3f6fd2','#79d6ff','#a3b6cc'],
];
function Hat({i,accent,glow,dark}:{i:number;accent:string;glow:string;dark:string}){
 switch(i){
  case 0:return <g><path d="M32 26Q32 7 60 7 88 7 88 26 74 19 60 19 46 19 32 26Z" fill={accent}/><rect x="58" y="21" width="33" height="6" rx="3" fill={accent}/><rect x="50" y="11" width="14" height="9" rx="2" fill="#ffffff" opacity=".55"/><path d="M53 15h8M57 13v5" stroke="#123" strokeWidth="1" opacity=".5"/></g>;
  case 1:return <g><path d="M46 14Q44 5 37 3" stroke="#3f8f4f" strokeWidth="2" fill="none"/><ellipse cx="35" cy="3" rx="6" ry="3.2" fill="#6cbf72" transform="rotate(-28 35 3)"/><path d="M60 13V3" stroke="#3f8f4f" strokeWidth="2"/><ellipse cx="55" cy="4" rx="5.5" ry="3" fill="#7ccf84" transform="rotate(-30 55 4)"/><ellipse cx="65" cy="3" rx="5.5" ry="3" fill="#5cb56c" transform="rotate(28 65 3)"/><path d="M72 14Q75 6 81 5" stroke="#3f8f4f" strokeWidth="2" fill="none"/><ellipse cx="83" cy="4" rx="5" ry="2.8" fill="#6cbf72" transform="rotate(24 83 4)"/></g>;
  case 2:return <g><ellipse cx="60" cy="18" rx="34" ry="8.5" fill="#d9a94f"/><path d="M41 18Q41 1 60 1 79 1 79 18Z" fill="#e6bc63"/><path d="M41 15h38" stroke="#b9853d" strokeWidth="4"/><path d="M60 1v15" stroke="#b9853d" strokeWidth="2" opacity=".6"/></g>;
  case 3:return <g><path d="M38 21Q38 5 60 5 82 5 82 21Z" fill="#f0b53c"/><rect x="31" y="19" width="58" height="7" rx="3.5" fill="#d99a2e"/><rect x="56" y="5" width="8" height="14" rx="3" fill="#f6c95c"/></g>;
  case 4:return <g><path d="M60 0Q53 12 37 24L85 24Q69 12 63 2 61 -2 60 0Z" fill="#6b3fc4"/><rect x="39" y="19" width="44" height="6" rx="3" fill="#8a5fe0"/><path d="M60 7l2 4 4 1-4 1-2 4-2-4-4-1 4-1Z" fill="#ffd166"/></g>;
  case 5:return <g><circle cx="88" cy="14" r="7" fill="#ffffff" opacity=".9"/><path d="M88 17c-1-2.6-5-2.6-5 .4 0 2 3.4 3.4 5 5.2 1.6-1.8 5-3.2 5-5.2 0-3-4-3-5-.4Z" fill="#e2558f"/></g>;
  case 6:return <g><rect x="30" y="11" width="60" height="10" rx="5" fill={dark}/><path d="M60 3v10" stroke={accent} strokeWidth="3" strokeLinecap="round"/><circle cx="60" cy="3" r="3" fill={accent}/></g>;
  case 7:return <g><path d="M30 24Q30 9 60 9 90 9 90 24Z" fill={accent}/><rect x="55" y="12" width="10" height="7" rx="2" fill="#f2c14e" stroke="#b9853d"/></g>;
  case 8:return <g><path d="M48 14Q45 6 39 4" stroke="#3f8f4f" strokeWidth="2" fill="none"/><ellipse cx="37" cy="4" rx="5.5" ry="3" fill="#6cbf72" transform="rotate(-26 37 4)"/><path d="M74 13Q79 7 85 7" stroke="#3f8f4f" strokeWidth="2" fill="none"/><ellipse cx="87" cy="6" rx="5" ry="2.8" fill="#7ccf84" transform="rotate(20 87 6)"/></g>;
  case 9:return <g><rect x="57" y="4" width="6" height="10" rx="3" fill={accent}/><circle cx="60" cy="4" r="3" fill={glow}/></g>;
 }
}
function Chest({i,accent,glow,dark}:{i:number;accent:string;glow:string;dark:string}){
 switch(i){
  case 0:return <path d="M52 82l8-7 8 7v-4h-16Z M54 82h12v-2H54Z M54 79h12v-2H54Z" fill={accent}/>;
  case 1:return <g><circle cx="52" cy="76" r="3.4" fill="#d9a94f"/><path d="M60 71c2.4 3.4 3.4 5 3.4 6.6a3.4 3.4 0 1 1-6.8 0c0-1.6 1-3.2 3.4-6.6Z" fill="#58a5c8"/><rect x="64" y="72" width="8" height="8" rx="1.5" fill="#a97c3f"/></g>;
  case 2:return <g><path d="M60 84V70" stroke="#8a6a3a" strokeWidth="2"/><path d="M60 74l-4-3M60 78l4-3M60 81l-4-3" stroke="#c9a24f" strokeWidth="2.4" strokeLinecap="round"/></g>;
  case 3:return <path d="M62 70l-8 9h5l-3 9 9-10h-5l3-8Z" fill={accent}/>;
  case 4:return <g><path d="M56 71h8v4l4 9a3 3 0 0 1-3 4H55a3 3 0 0 1-3-4l4-9Z" fill="#cfa4ff" opacity=".85"/><circle cx="60" cy="82" r="2" fill="#f0e7f6"/></g>;
  case 5:return <path d="M60 84c-2-6.5-12.5-6.5-12.5 1 0 6.5 8.5 9.5 12.5 13.5 4-4 12.5-7 12.5-13.5 0-7.5-10.5-7.5-12.5-1Z" fill="#e2558f"/>;
  case 6:return <g><path d="M60 70l9 3v7c0 6-4.5 8.5-9 11-4.5-2.5-9-5-9-11v-7Z" fill="#8f2d23" stroke="#d98a5a" strokeWidth="1.5"/><path d="M60 74v12M55 79h10" stroke="#f4f0e4" strokeWidth="2"/></g>;
  case 7:return <g><circle cx="60" cy="77" r="7.5" fill="#f2c14e" stroke="#d9a12e" strokeWidth="1.5"/><circle cx="60" cy="77" r="4" fill="none" stroke="#d9a12e" strokeWidth="1.2"/></g>;
  case 8:return <g><circle cx="60" cy="77" r="8" fill="#4f9e6b"/><path d="M54 73q4-3 8 0t4 5q-5 3-9 0-3-2-3-5Z" fill="#8fd69a"/><path d="M55 82q5 2 9-1" stroke="#3f8f4f" strokeWidth="1.5" fill="none"/></g>;
  case 9:return <path d="M57 70h6l-1.5 6 3 10-4.5-3-4.5 3 3-10Z" fill={accent}/>;
 }
}
function Props({i,accent,glow,dark,skin}:{i:number;accent:string;glow:string;dark:string;skin:string}){
 switch(i){
  case 0:return <g><rect x="88" y="62" width="24" height="9" rx="4.5" fill="#f4f8fc"/><ellipse cx="112" cy="66.5" rx="3" ry="4.5" fill="#d5e6f3"/><rect x="94" y="38" width="21" height="19" rx="2.5" fill="#eef6fd" stroke={accent} strokeWidth="1.5"/><path d="M98 44h6M98 48h13M105 44v8M109 50l4 3" stroke={accent} strokeWidth="1.3" fill="none"/><rect x="90" y="58" width="14" height="5" rx="2" fill={skin}/></g>;
  case 1:return <g><rect x="2" y="84" width="24" height="20" rx="3" fill="#a97c3f"/><path d="M2 91h24M2 98h24" stroke="#8a5f33" strokeWidth="1.5"/><ellipse cx="14" cy="82" rx="8" ry="4" fill="#6cbf72"/><path d="M14 82V74" stroke="#3f8f4f" strokeWidth="2"/></g>;
  case 2:return <g><rect x="95" y="46" width="4.5" height="54" rx="2" fill="#8a6a3a"/><path d="M89 48v-13M97 48v-17M105 48v-13" stroke="#5a6472" strokeWidth="3" strokeLinecap="round"/><path d="M88 37h19" stroke="#5a6472" strokeWidth="3" strokeLinecap="round"/><path d="M82 112h30l-4 14H86Z" fill="#a97c3f"/><path d="M84 117h26M86 121h22" stroke="#8a5f33" strokeWidth="1.4"/><circle cx="89" cy="109" r="3.6" fill="#d95f3b"/><circle cx="97" cy="107" r="3.6" fill="#7ccf84"/><circle cx="105" cy="109" r="3.6" fill="#e2a33c"/></g>;
  case 3:return <g><rect x="92" y="50" width="5" height="36" rx="2.5" fill="#8a6a3a"/><rect x="85" y="40" width="22" height="13" rx="3" fill="#5a6472"/><rect x="85" y="40" width="22" height="4" rx="2" fill="#78828f"/><rect x="4" y="102" width="20" height="9" rx="1.5" fill="#c0603f"/><rect x="8" y="93" width="20" height="9" rx="1.5" fill="#d97a52"/><rect x="4" y="111" width="20" height="9" rx="1.5" fill="#a34c31"/></g>;
  case 4:return <g><path d="M2 74Q15 67 26 74L26 92Q15 85 2 92Z" fill="#f6f1fb" stroke={accent} strokeWidth="1.5"/><path d="M50 74Q37 67 26 74L26 92Q37 85 50 92Z" fill="#efe7f8" stroke={accent} strokeWidth="1.5"/><path d="M6 79l12-3M6 84l12-3M44 76l-12 3M44 81l-12 3" stroke={accent} strokeWidth="1" opacity=".6"/><path d="M96 34l2.4 4.6 4.6 2.4-4.6 2.4-2.4 4.6-2.4-4.6-4.6-2.4 4.6-2.4Z" fill={glow}/><circle cx="104" cy="62" r="6" fill="none" stroke={accent} strokeWidth="2.4"/><circle cx="104" cy="62" r="2" fill={accent}/></g>;
  case 5:return <g><path d="M88 88c-1.6-5-9.5-5-9.5.8 0 4.8 6.5 7.1 9.5 10.1 3-3 9.5-5.3 9.5-10.1 0-5.8-7.9-5.8-9.5-.8Z" fill="#e2558f"/><circle cx="97" cy="52" r="8" fill="#ffffff" opacity=".9"/><path d="M97 55c-1-2.4-4.4-2.4-4.4.4 0 1.8 2.9 3.1 4.4 4.7 1.5-1.6 4.4-2.9 4.4-4.7 0-2.8-3.4-2.8-4.4-.4Z" fill="#e2558f"/></g>;
  case 6:return <g><path d="M10 60l14 4v16c0 9-7 13-14 17-7-4-14-8-14-17V64Z" fill="#8f2d23" stroke="#d98a5a" strokeWidth="2"/><path d="M10 66v20M3 74h14" stroke="#f4f0e4" strokeWidth="2.6"/><rect x="94" y="26" width="4.5" height="72" rx="2" fill="#6b5433"/><path d="M96.2 26L90 14l6.2-6 6.2 6Z" fill="#c8ccd4"/></g>;
  case 7:return <g><circle cx="90" cy="82" r="10" fill="#f2c14e" stroke="#d9a12e" strokeWidth="2"/><circle cx="90" cy="82" r="5.5" fill="none" stroke="#d9a12e" strokeWidth="1.6"/><path d="M-2 74h30v7l-3.5 4h-23L-2 81Z" fill="#c0392b"/><rect x="1" y="74" width="4" height="11" fill="#f4f0e4"/><rect x="10" y="74" width="4" height="11" fill="#f4f0e4"/><rect x="19" y="74" width="4" height="11" fill="#f4f0e4"/><rect x="1" y="86" width="26" height="14" rx="1.5" fill="#a97c3f"/><circle cx="8" cy="92" r="2.6" fill="#d95f3b"/><circle cx="16" cy="94" r="2.6" fill="#7ccf84"/></g>;
  case 8:return <g><ellipse cx="88" cy="50" rx="8" ry="5.5" fill="#7fb8d8"/><circle cx="94" cy="46" r="4" fill="#7fb8d8"/><path d="M97.5 45.5l5 1.5-5 1.5Z" fill="#e2a33c"/><path d="M86 48q4 3 8 1" stroke="#5a92b8" strokeWidth="1.6" fill="none"/><path d="M14 90V78" stroke="#3f8f4f" strokeWidth="2.4"/><ellipse cx="9" cy="76" rx="6" ry="3.4" fill="#7ccf84" transform="rotate(-30 9 76)"/><ellipse cx="19" cy="75" rx="6" ry="3.4" fill="#5cb56c" transform="rotate(28 19 75)"/></g>;
  case 9:return <g><circle cx="49" cy="34" r="8.5" fill="none" stroke="#20294a" strokeWidth="2.6"/><circle cx="71" cy="34" r="8.5" fill="none" stroke="#20294a" strokeWidth="2.6"/><path d="M57.5 34h5" stroke="#20294a" strokeWidth="2.6"/><path d="M40.5 32l-8-3M79.5 32l8-3" stroke="#20294a" strokeWidth="2.4"/><rect x="92" y="44" width="27" height="21" rx="3.5" fill="#0e2547" stroke={accent} strokeWidth="1.6"/><rect x="96" y="56" width="4.5" height="6" fill={glow}/><rect x="103" y="52" width="4.5" height="10" fill={glow}/><rect x="110" y="48" width="4.5" height="14" fill={glow}/><path d="M105.5 40a4 4 0 0 1 6 0M108.5 33v-2" stroke={glow} strokeWidth="1.6" fill="none" strokeLinecap="round"/></g>;
 }
}
export default function AgentBot({variant,size=48}:{variant:number;size?:number}){
 const i=((variant%10)+10)%10;const[skin,belly,accent,glow,dark]=P[i];
 return <svg viewBox="0 0 120 132" width={size} height={Math.round(size*1.1)} aria-hidden="true" style={{display:'inline-block',flexShrink:0}}>
  {i===9&&<><path d="M36 58Q17 88 26 114l13-6-3-24Z" fill="#2c4a8c"/><path d="M84 58Q103 88 94 114l-13-6 3-24Z" fill="#24407a"/></>}
  <ellipse cx="60" cy="125" rx="32" ry="5" fill="#060d18" opacity=".5"/>
  <rect x="45" y="98" width="11" height="16" rx="5" fill={dark}/>
  <rect x="64" y="98" width="11" height="16" rx="5" fill={dark}/>
  <ellipse cx="50" cy="116" rx="8.5" ry="4.5" fill={dark}/>
  <ellipse cx="70" cy="116" rx="8.5" ry="4.5" fill={dark}/>
  <rect x="26" y="60" width="11" height="26" rx="5.5" fill={skin}/>
  <rect x="83" y="60" width="11" height="26" rx="5.5" fill={skin}/>
  <circle cx="31.5" cy="89" r="5.5" fill={skin}/>
  <circle cx="88.5" cy="89" r="5.5" fill={skin}/>
  <rect x="35" y="55" width="50" height="45" rx="13" fill={skin}/>
  <rect x="44" y="63" width="32" height="27" rx="8" fill={belly}/>
  <rect x="57" y="49" width="6" height="8" fill={dark}/>
  <rect x="30" y="13" width="60" height="42" rx="15" fill={skin}/>
  <rect x="37" y="21" width="46" height="28" rx="10" fill="#0b1424" stroke={accent} strokeWidth="1.2"/>
  <rect x="44" y="28" width="11" height="14" rx="5" fill={glow} opacity=".3"/>
  <rect x="65" y="28" width="11" height="14" rx="5" fill={glow} opacity=".3"/>
  <rect x="47" y="30" width="5" height="10" rx="2.5" fill={glow}/>
  <rect x="68" y="30" width="5" height="10" rx="2.5" fill={glow}/>
  <Hat i={i} accent={accent} glow={glow} dark={dark}/>
  <Chest i={i} accent={accent} glow={glow} dark={dark}/>
  <Props i={i} accent={accent} glow={glow} dark={dark} skin={skin}/>
 </svg>;
}
