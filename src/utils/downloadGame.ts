/**
 * Utility to generate and download a 100% self-contained, standalone offline HTML file
 * of 'Tangkap Si Jatuh!' so users can play offline on any device (PC, Android, iOS).
 */

export function downloadStandaloneHtmlGame() {
  const htmlContent = `<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">
<title>Tangkap Si Jatuh! (Offline)</title>
<style>
:root{box-sizing:border-box;padding-bottom:env(safe-area-inset-bottom,0px)}
html,body{height:100%;margin:0;overflow:hidden;background:#7fd1ff;font-family:'Arial Rounded MT Bold','Trebuchet MS',Arial,sans-serif;touch-action:none;user-select:none;-webkit-user-select:none}
canvas{display:block;position:fixed;inset:0}
#hud{position:fixed;left:0;right:0;top:0;padding:calc(env(safe-area-inset-top,0px) + 10px) 14px 0;display:flex;justify-content:space-between;align-items:flex-start;pointer-events:none;color:#fff;text-shadow:0 3px 0 #2a6fa0;font-size:clamp(20px,5vw,30px);z-index:10}
#hud small{display:block;font-size:.6em}
.btn-ctrl{pointer-events:auto;border:0;background:#fff;border-radius:50%;width:44px;height:44px;font-size:22px;box-shadow:0 3px 0 #2a6fa0;cursor:pointer;display:inline-flex;align-items:center;justify-content:center}
#ov{position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;text-align:center;background:rgba(30,90,140,.6);color:#fff;padding:20px;text-shadow:0 3px 0 #2a6fa0;z-index:20}
#ov h1{font-size:clamp(30px,8vw,56px);margin:0}
#ov p{font-size:clamp(15px,3.8vw,20px);margin:0;max-width:440px}
#go{border:0;border-radius:60px;padding:16px 38px;font:inherit;font-size:26px;font-weight:bold;background:#ffd23f;color:#7a4b00;box-shadow:0 6px 0 #d49a00;cursor:pointer;text-shadow:none}
#go:active{transform:translateY(4px);box-shadow:0 2px 0 #d49a00}
.touch-bar{position:fixed;bottom:16px;left:16px;right:16px;display:flex;justify-content:space-between;pointer-events:none;z-index:15}
.touch-btn{pointer-events:auto;width:64px;height:64px;border-radius:20px;background:rgba(255,255,255,0.7);border:2px solid #fff;font-size:32px;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 10px rgba(0,0,0,0.15)}
</style>
</head>
<body>
<canvas id="c"></canvas>
<div id="hud">
  <div><span id="sc">Skor: 0</span><small id="bs">Terbaik: 0</small></div>
  <div style="display:flex;align-items:center;gap:10px;">
    <div id="lv">❤️❤️❤️</div>
    <button id="snd" class="btn-ctrl" aria-label="Suara">🔊</button>
  </div>
</div>
<div id="ov">
  <h1>🧒 Tangkap Si Jatuh!</h1>
  <p>Tangkap buah 🍎, sayur 🥕 dan daging 🍗. Hindari 💩 yang bau dan 💣 yang meledak!</p>
  <p><small>Geser layar / mouse, atau pakai tombol panah ⬅️ ➡️</small></p>
  <button id="go">Mulai Main!</button>
</div>
<div class="touch-bar">
  <button id="btnL" class="touch-btn">◀</button>
  <button id="btnR" class="touch-btn">▶</button>
</div>
<script>
const C=document.getElementById('c'),x=C.getContext('2d');
const $=id=>document.getElementById(id);
let S=1,K=1,W,H,tm=0,state='menu',score=0,lives=3,level=0,best=0,mute=false;
let px=0,tx=0,py=0,moodT=0,mood='n',shake=0,flash=0,spawnT=0;
let items=[],parts=[],pops=[];
const keys={};
const clouds=Array.from({length:6},(_,i)=>({x:i*220,y:50+Math.random()*150,s:.7+Math.random()*.8,v:8+Math.random()*12}));
try{best=+localStorage.getItem('tsj_best')||0}catch(e){}
function resize(){const d=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;C.width=W*d;C.height=H*d;x.setTransform(d,0,0,d,0,0);S=Math.max(.65,Math.min(1.15,Math.min(W,H*.75)/520));K=Math.max(.75,Math.min(1.25,H/700));py=H-120*S;if(!px){px=tx=W/2}}
addEventListener('resize',resize);resize();

let A;
function ac(){try{if(!A)A=new(window.AudioContext||window.webkitAudioContext)();if(A.state==='suspended')A.resume()}catch(e){}}
function tone(f1,f2,d,type='sine',v=.15,t0=0){if(mute||!A)return;const t=A.currentTime+t0,o=A.createOscillator(),g=A.createGain();o.type=type;o.frequency.setValueAtTime(f1,t);o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(A.destination);o.start(t);o.stop(t+d)}
function boom(){if(mute||!A)return;const n=A.sampleRate*.5,b=A.createBuffer(1,n,A.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);const s=A.createBufferSource(),f=A.createBiquadFilter(),g=A.createGain();s.buffer=b;f.type='lowpass';f.frequency.value=500;g.gain.value=.35;s.connect(f);f.connect(g);g.connect(A.destination);s.start();tone(120,40,.4,'sine',.25)}
const snd={yummy(){tone(500,900,.12);tone(700,1200,.14,'sine',.15,.1)},eww(){tone(300,70,.55,'sawtooth',.08)},boom,over(){tone(400,150,.6,'triangle',.15)},up(){tone(500,1000,.2,'square',.06)}};
$('snd').onclick=()=>{mute=!mute;$('snd').textContent=mute?'🔇':'🔊'};

const T={fruit:{e:['🍎','🍌','🍓','🍉','🍊','🍇','🍍']},veg:{e:['🥕','🥦','🍅','🌽','🥑']},meat:{e:['🌭','🍗','🥩','🍔','🍕']},poop:{e:['💩']},bomb:{e:['💣']}};
function pick(){const r=Math.random();return r<.28?'fruit':r<.52?'veg':r<.68?'meat':r<.84?'poop':'bomb'}
function spawn(){const k=pick();items.push({k,e:T[k].e[Math.random()*T[k].e.length|0],x:30+Math.random()*(W-60),y:-40,v:(Math.min(130+level*28,420)+Math.random()*40)*K,r:Math.random()*6,w:(Math.random()-.5)*2})}
function pop(t,c){pops.push({t,c,x:px,y:py-60*S,l:1})}
function burst(n,cols,sp,type,life){for(let i=0;i<n;i++){const a=Math.random()*7,s=Math.random()*sp;parts.push({x:px,y:py,vx:Math.cos(a)*s,vy:Math.sin(a)*s-(type==='cloud'?40:0),l:life,m:life,r:5+Math.random()*9,c:cols[i%cols.length],type})}}
function hud(){$('sc').textContent='Skor: '+score;$('bs').textContent='Terbaik: '+best;$('lv').textContent='❤️'.repeat(Math.max(lives,0))+'🖤'.repeat(Math.max(3-lives,0))}
function say(a){return a[Math.random()*a.length|0]}

function hit(it){
  const k=it.k;
  if(k==='fruit'||k==='veg'||k==='meat'){const p=k==='meat'?15:10;score+=p;mood=k==='meat'?'l':'h';moodT=.6;snd.yummy();burst(8,['#ffd23f','#fff'],140,'spark',.5);pop(say(['Yummy!','Hore!','Nyam!','Hebat!'])+' +'+p,'#ff8a00')}
  else if(k==='poop'){score=Math.max(0,score-10);mood='s';moodT=1.4;shake=.5;snd.eww();burst(14,['#8bc34a','#a5d64a','#6fa832'],70,'cloud',1.4);pop(say(['Iiih, bau!','Ewww!','Uwek!'])+' -10','#5a8f1c')}
  else{lives--;mood='b';moodT=1.5;shake=.6;flash=.25;snd.boom();burst(34,['#ff4d4d','#ffa63d','#ffe14d','#ff7bd5','#7bd8ff'],360,'spark',.8);pop('DUAR! 💥','#e53935')}
  const nl=Math.floor(score/100);if(nl>level){level=nl;pop('Level naik! 🚀','#7b3ff2');snd.up()}
  hud();if(lives<=0)end();
}
function end(){state='over';if(score>best){best=score;try{localStorage.setItem('tsj_best',best)}catch(e){}}hud();snd.over();
  $('ov').innerHTML='<h1>Yah, Game Selesai!</h1><p>Skor kamu: <b>'+score+'</b></p><p>Skor terbaik: <b>'+best+'</b></p><p>'+(score>=100?'Kamu hebat sekali! 🎉':'Ayo coba lagi, pasti bisa! 💪')+'</p><button id="go">Main Lagi</button>';
  $('ov').style.display='flex';$('go').onclick=start}
function start(){ac();score=0;lives=3;level=0;items=[];parts=[];pops=[];mood='n';moodT=0;spawnT=0;state='play';$('ov').style.display='none';hud()}
$('go').onclick=start;

addEventListener('pointermove',e=>{if(state==='play')tx=e.clientX});
addEventListener('pointerdown',e=>{if(state==='play')tx=e.clientX});
addEventListener('keydown',e=>{keys[e.key]=1});addEventListener('keyup',e=>{keys[e.key]=0});

let lDown=false,rDown=false;
const setupTouch=(btn,set)=>{
  btn.addEventListener('pointerdown',e=>{e.preventDefault();set(true)});
  btn.addEventListener('pointerup',e=>{e.preventDefault();set(false)});
  btn.addEventListener('pointercancel',e=>{e.preventDefault();set(false)});
};
setupTouch($('btnL'),v=>lDown=v);
setupTouch($('btnR'),v=>rDown=v);

function update(dt){
  tm+=dt;clouds.forEach(c=>{c.x+=c.v*dt;if(c.x>W+120)c.x=-160});
  if(state!=='play')return;
  if(keys.ArrowLeft||keys.a||keys.A||lDown)tx-=680*dt;
  if(keys.ArrowRight||keys.d||keys.D||rDown)tx+=680*dt;
  tx=Math.max(40,Math.min(W-40,tx));px+=(tx-px)*Math.min(1,dt*18);
  moodT-=dt;if(moodT<=0)mood='n';shake-=dt;flash-=dt;
  if(mood==='s'&&Math.random()<dt*20)burst(1,['#8bc34a'],30,'cloud',1);
  spawnT-=dt;if(spawnT<=0){spawn();spawnT=Math.max(.45,.95-level*.05)}
  for(let i=items.length-1;i>=0;i--){const it=items[i];it.y+=it.v*dt;it.r+=it.w*dt;
    if(it.y>py-10*S&&it.y<py+60*S&&Math.abs(it.x-px)<58*S){items.splice(i,1);hit(it);if(state!=='play')return;continue}
    if(it.y>H+50)items.splice(i,1)}
  for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.l-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.type==='cloud')p.vy-=20*dt;if(p.l<=0)parts.splice(i,1)}
  for(let i=pops.length-1;i>=0;i--){const p=pops[i];p.l-=dt*.8;p.y-=45*dt;if(p.l<=0)pops.splice(i,1)}
}

function face(m){
  const bad=m==='b',sick=m==='s',hp=m==='h'||m==='l';
  const skin=bad?'#3a3a3a':sick?'#b5e86a':'#ffd7b0',ink=bad?'#fff':'#3b2314';
  x.lineCap='round';x.lineWidth=3;x.strokeStyle=ink;
  x.fillStyle='#333';[-1,1].forEach(s=>{x.beginPath();x.ellipse(s*12,86,9,5,0,0,7);x.fill()});
  x.fillStyle=bad?'#222':'#ff7043';x.beginPath();x.ellipse(0,58,27,30,0,0,7);x.fill();
  x.fillStyle=skin;[-1,1].forEach(s=>{x.beginPath();x.arc(s*30,hp?36:52,9,0,7);x.fill()});
  if(bad){x.strokeStyle='#000';x.lineWidth=6;for(let i=-2;i<=2;i++){x.beginPath();x.moveTo(i*11,-28);x.lineTo(i*17,-62+Math.abs(i)*5);x.stroke()}x.strokeStyle=ink;x.lineWidth=3}
  else{x.fillStyle='#5b3a29';x.beginPath();x.arc(0,-4,38,0,7);x.fill()}
  x.fillStyle=skin;[-1,1].forEach(s=>{x.beginPath();x.arc(s*34,2,7,0,7);x.fill()});
  x.beginPath();x.arc(0,0,34,0,7);x.fill();
  if(!bad){x.fillStyle='#5b3a29';x.beginPath();x.ellipse(0,-12,34,22,0,Math.PI,2*Math.PI);x.fill();x.beginPath();x.arc(0,-40,8,0,7);x.fill();
    if(!sick){x.fillStyle='rgba(255,105,135,.45)';[-1,1].forEach(s=>{x.beginPath();x.arc(s*20,12,6,0,7);x.fill()})}}
  [-1,1].forEach(s=>{const ex=s*13,ey=0;x.lineWidth=2.5;x.strokeStyle=ink;
    if(hp){x.beginPath();x.arc(ex,ey+3,6,Math.PI*1.1,Math.PI*1.9);x.stroke()}
    else if(sick){x.beginPath();for(let a=0;a<12;a+=.3){const r=a*.6;x.lineTo(ex+Math.cos(a+tm*10)*r,ey+Math.sin(a+tm*10)*r)}x.stroke()}
    else if(bad){x.fillStyle='#fff';x.beginPath();x.arc(ex,ey,8,0,7);x.fill();x.fillStyle='#000';x.beginPath();x.arc(ex,ey,3,0,7);x.fill()}
    else{x.fillStyle=ink;x.beginPath();x.arc(ex,ey,5,0,7);x.fill();x.fillStyle='#fff';x.beginPath();x.arc(ex+1.5,ey-1.5,1.8,0,7);x.fill()}});
  x.strokeStyle=ink;x.lineWidth=3;x.beginPath();
  if(m==='h'){x.fillStyle='#e0405a';x.arc(0,14,11,0,Math.PI);x.closePath();x.fill();x.stroke()}
  else if(m==='l'){x.arc(0,13,9,.2,Math.PI-.2);x.stroke();x.fillStyle='#ff7aa2';x.beginPath();x.ellipse(6,25+Math.sin(tm*20)*1.5,5,7,0,0,7);x.fill()}
  else if(sick){x.moveTo(-11,25);for(let i=1;i<=4;i++)x.lineTo(-11+i*5.5,25+(i%2?-4:4));x.stroke();
    x.fillStyle=skin;x.strokeStyle='#3b2314';x.beginPath();x.arc(0,9,9,0,7);x.fill();x.stroke();x.beginPath();x.moveTo(-5,6);x.lineTo(5,6);x.stroke()}
  else if(bad){x.arc(0,24,6,0,7);x.stroke()}
  else{x.arc(0,10,9,.25,Math.PI-.25);x.stroke()}
}

function draw(){
  const g=x.createLinearGradient(0,0,0,H);g.addColorStop(0,'#5ec2ff');g.addColorStop(1,'#d6f1ff');x.fillStyle=g;x.fillRect(0,0,W,H);
  x.fillStyle='rgba(255,255,255,.85)';clouds.forEach(c=>{[[0,0,34],[34,6,26],[-34,8,24],[12,-14,24]].forEach(([a,b,r])=>{x.beginPath();x.arc(c.x+a*c.s,c.y+b*c.s,r*c.s,0,7);x.fill()})});
  x.fillStyle='#7ed957';x.fillRect(0,H-30*S,W,30*S);
  x.save();if(shake>0)x.translate((Math.random()-.5)*10,(Math.random()-.5)*10);
  x.textAlign='center';x.textBaseline='middle';x.font=(46*S)+'px serif';
  items.forEach(it=>{x.save();x.translate(it.x,it.y);x.rotate(it.r*.3);x.fillText(it.e,0,0);x.restore()});
  x.save();x.translate(px,py+Math.sin(tm*4)*2*S);x.scale(S,S);face(mood);x.restore();x.font=(58*S)+'px serif';x.fillText('🧺',px,py+60*S);
  parts.forEach(p=>{const a=Math.max(p.l/p.m,0);x.globalAlpha=p.type==='cloud'?a*.6:a;x.fillStyle=p.c;x.beginPath();x.arc(p.x,p.y,p.r*(p.type==='cloud'?2-a:1),0,7);x.fill()});x.globalAlpha=1;
  x.font='bold '+Math.round(28*Math.max(S,.85))+'px "Arial Rounded MT Bold",Arial,sans-serif';x.lineWidth=6;x.lineJoin='round';
  pops.forEach(p=>{x.globalAlpha=Math.min(1,p.l*2);x.strokeStyle='#fff';x.strokeText(p.t,p.x,p.y);x.fillStyle=p.c;x.fillText(p.t,p.x,p.y)});x.globalAlpha=1;
  x.restore();
  if(flash>0){x.fillStyle='rgba(255,255,255,'+flash*3+')';x.fillRect(0,0,W,H)}
}
let last=0;
function loop(t){const dt=Math.min((t-last)/1000,.05);last=t;update(dt);draw();requestAnimationFrame(loop)}
hud();requestAnimationFrame(t=>{last=t;loop(t)});
</script>
</body>
</html>`;

  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'Tangkap-Si-Jatuh.html';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
