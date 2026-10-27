const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const settings = {
  name: "Fajar",
  birthday: "28 Oct 2005",
  letter: "You are a very special girl. Today, I wish you all the best, lots of health, lots of joy, and countless reasons to smile. May every dream close to your heart come true. Keep shining in your own beautiful way — you deserve all the happiness in the world. 💗"
};

const happyText = $("#happyText");
const birthdayText = $("#birthdayText");
const birthdayLine = $("#birthdayLine");
const partyHat = $("#partyHat");
const birthdayDate = $("#birthdayDate");
const openLetterButton = $("#openLetterButton");
const letterModal = $("#letterModal");
const closeLetterButton = $("#closeLetterButton");
const toYouText = $("#toYouText");
const letterMessage = $("#letterMessage");
const letterSignoff = $("#letterSignoff");
const messageCaret = $("#messageCaret");
const heartLayer = $("#heartLayer");
const announcement = $("#announcement");

$("#girlName").textContent = settings.name;
$("#birthdayDate").children[1].textContent = settings.birthday;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function typeText(element, text, speed = 115) {
  element.textContent = "";
  for (const char of text) {
    element.textContent += char;
    await sleep(speed + Math.random() * 36);
  }
}

async function runOpeningSequence() {
  await sleep(1000); // Let the curtain and pink grid reveal first.
  $$(".bunting").forEach((item) => item.classList.add("ready"));
  await sleep(650); // Ropes are visible before the heading begins.

  await typeText(happyText, "Happy", 135);
  await sleep(200);
  await typeText(birthdayText, "Birthday", 115);

  partyHat.classList.add("visible");
  birthdayDate.classList.add("visible");
  openLetterButton.classList.add("visible");
  $("#animationButtons").classList.add("visible");
  $(".tiny-love-note").classList.add("visible");

  await sleep(250);
  $(".portrait-frame").classList.add("visible");
  $(".name-ribbon").classList.add("visible");
  $(".smiley-sticker").classList.add("visible");
  $(".small-birthday-seal").classList.add("visible");

  // Balloons rise one after another from below the page.
  await sleep(150);
  $$(".balloon").forEach((balloon, index) => {
    setTimeout(() => balloon.classList.add("rise"), index * 210);
  });
  $$(".sparkle").forEach((sparkle) => sparkle.classList.add("visible"));
  announcement.textContent = `Happy Birthday, ${settings.name}`;
}

// CSS classes are applied dynamically, so this helper provides a clear opening order.
runOpeningSequence();

// A small trail of hearts follows the cursor/touch, rather than leaving permanent marks.
let lastHeartTime = 0;
function makeCursorHeart(x, y) {
  const now = performance.now();
  if (now - lastHeartTime < 42) return;
  lastHeartTime = now;

  const heart = document.createElement("span");
  heart.className = "cursor-heart";
  heart.textContent = Math.random() > 0.35 ? "♥" : "♡";
  heart.style.left = `${x}px`;
  heart.style.top = `${y}px`;
  heart.style.fontSize = `${10 + Math.random() * 12}px`;
  heart.style.setProperty("--drift", `${-15 + Math.random() * 30}px`);
  heartLayer.appendChild(heart);
  heart.addEventListener("animationend", () => heart.remove(), { once: true });
}

document.addEventListener("pointermove", (event) => {
  if (event.pointerType === "touch") return;
  makeCursorHeart(event.clientX, event.clientY);
}, { passive: true });
document.addEventListener("pointerdown", (event) => {
  for (let i = 0; i < 5; i++) {
    setTimeout(() => makeCursorHeart(event.clientX + (Math.random() - 0.5) * 34, event.clientY + (Math.random() - 0.5) * 34), i * 35);
  }
}, { passive: true });
document.addEventListener("touchmove", (event) => {
  const touch = event.touches[0];
  if (touch) makeCursorHeart(touch.clientX, touch.clientY);
}, { passive: true });

// Remote GIFs are used when available; local illustrated fallbacks keep the card working offline.
$$("img[data-fallback]").forEach((image) => {
  image.addEventListener("error", () => {
    if (image.dataset.fallback && image.src !== new URL(image.dataset.fallback, location.href).href) {
      image.src = image.dataset.fallback;
    }
  }, { once: true });
});

let letterTypingRun = 0;
async function openLetter() {
  letterTypingRun++;
  const runId = letterTypingRun;
  letterModal.classList.add("open");
  letterModal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  closeLetterButton.focus({ preventScroll: true });

  toYouText.textContent = "";
  letterMessage.textContent = "";
  letterSignoff.classList.remove("visible");
  messageCaret.style.display = "inline-block";
  letterMessage.style.minHeight = "118px";

  await sleep(320);
  if (runId !== letterTypingRun) return;
  await typeText(toYouText, "To you", 160);
  if (runId !== letterTypingRun) return;
  await sleep(350);

  for (const char of settings.letter) {
    if (runId !== letterTypingRun) return;
    letterMessage.textContent += char;
    await sleep(char === "." || char === "," || char === "—" ? 180 : 26 + Math.random() * 20);
  }

  if (runId === letterTypingRun) {
    messageCaret.style.display = "none";
    letterSignoff.classList.add("visible");
  }
}

function closeLetter() {
  letterTypingRun++;
  letterModal.classList.remove("open");
  letterModal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
  openLetterButton.focus({ preventScroll: true });
}

openLetterButton.addEventListener("click", openLetter);
closeLetterButton.addEventListener("click", closeLetter);
letterModal.addEventListener("click", (event) => {
  if (event.target === letterModal) closeLetter();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && letterModal.classList.contains("open")) closeLetter();
});


// ─── Animation Modals ─────────────────────────────────────────────────────────
const heartAnimationModal = $("#heartAnimationModal");
const secondAnimationModal = $("#secondAnimationModal");
const heartCanvas = $("#heartCanvas");
const cakeCanvas = $("#cakeCanvas");

// ─── Seeded PRNG ──────────────────────────────────────────────────────────────
function makeRng(seed) {
  let s = (seed >>> 0) + 0x9e3779b9;
  return function () {
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
    s = Math.imul(s ^ (s >>> 16), 0x45d9f3b);
    s ^= s >>> 16;
    return (s >>> 0) / 4294967296;
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// HEART ANIMATION  — recreation of love.py
// A heart shape packed with multilingual "I love you" phrases that drop in.
// ═══════════════════════════════════════════════════════════════════════════════
const LOVE_PHRASES = [
  "I love you","Seni seviyorum","Te amo","Je t'aime",
  "Ich liebe dich","Ti amo","Eu te amo","Я тебя люблю",
  "사랑해","愛してる","我爱你","मैं तुमसे प्यार करता हूँ",
  "Σ' αγαπώ","Ik hou van jou","Jag älskar dig","Kocham cię",
  "ฉันรักเธอ","Anh yêu em","Aku cinta kamu","Я тебе кохаю",
];

const HEART_SC   = 21;
const HEART_OY   = 20;
const HEART_ANIM = 42;
const HEART_LIFT = 34;
const HEART_GAP  = 7;
const HEART_DUR  = 10;   // seconds to spawn everything
const HEART_TICK = 16;   // ms per frame
const HEART_BG   = "#060208";

let heartAnimFrame    = 0;
let heartAnimRunning  = false;
let heartItems        = null;
let heartState        = "idle";
let heartActiveItems  = [];
let heartSpawnAcc     = 0;
let heartSpawnIdx     = 0;
let heartShimmerTimer = 0;
let heartRng;

function heartCurve(a) {
  const x = 16 * Math.pow(Math.sin(a), 3);
  const y = 13*Math.cos(a) - 5*Math.cos(2*a) - 2*Math.cos(3*a) - Math.cos(4*a);
  return [x * HEART_SC, y * HEART_SC + HEART_OY];
}

function buildHeartItems(rng) {
  const phrases = [...LOVE_PHRASES];
  const SIZES = [9,10,11,12];
  const N = 720;
  const poly = Array.from({length: N}, (_, i) => heartCurve(2*Math.PI*i/N));
  const edges = poly.map((p, i) => [p, poly[(i+1)%N]]);
  const ymax = Math.max(...poly.map(p=>p[1]));
  const ymin = Math.min(...poly.map(p=>p[1]));
  const CY = (ymax+ymin)/2;

  function hSpans(y) {
    const xs = [];
    for (const [[x1,y1],[x2,y2]] of edges) {
      if ((y1<=y&&y<y2)||(y2<=y&&y<y1)) xs.push(x1+(y-y1)*(x2-x1)/(y2-y1));
    }
    xs.sort((a,b)=>a-b);
    const out=[];
    for (let i=0;i<xs.length-1;i+=2) out.push([xs[i],xs[i+1]]);
    return out;
  }
  function intersect(A,B) {
    const out=[];
    for(const a of A) for(const b of B){const lo=Math.max(a[0],b[0]),hi=Math.min(a[1],b[1]);if(hi-lo>14)out.push([lo,hi]);}
    return out;
  }

  const mc=document.createElement("canvas").getContext("2d");
  const measure=(text,size)=>{mc.font=`bold ${size}px Arial`;return mc.measureText(text).width;};

  let pi=0;
  function nextP(){
    if(pi%phrases.length===0){for(let i=phrases.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[phrases[i],phrases[j]]=[phrases[j],phrases[i]];}}
    return phrases[(pi++)%phrases.length];
  }

  const ROW_H=18, half=ROW_H/2;
  const placed=[];
  let y=ymax-half;
  while(y>ymin+half){
    const row=intersect(hSpans(y+half),hSpans(y-half));
    for(let [lo,hi] of row){
      lo+=4;hi-=4;
      let cur=lo+rng()*8;
      const line=[];
      while(true){
        let fit=null;
        for(let t=0;t<10;t++){const text=nextP();const size=SIZES[Math.floor(rng()*SIZES.length)];const w=measure(text,size);if(cur+w<=hi){fit={text,size,w};break;}}
        if(!fit)break;
        line.push({cx:cur+fit.w/2,text:fit.text,size:fit.size,w:fit.w});
        cur+=fit.w+HEART_GAP;
      }
      if(!line.length)continue;
      if(line.length>1){const slack=hi-(line[line.length-1].cx+line[line.length-1].w/2);line.forEach((it,i)=>{it.cx+=slack*i/(line.length-1);});}
      else line[0].cx=(lo+hi)/2;
      line.forEach((it,i)=>{
        const edge=i===0||i===line.length-1;
        const dist=Math.min(1,Math.hypot(it.cx/(16*HEART_SC),(y-CY)/(14.5*HEART_SC)));
        const mix=(a,b,k)=>a.map((v,i)=>v+(b[i]-v)*k);
        const wine=[0.58,0,0.09],crimson=[0.9,0.05,0.14],blood=[0.98,0.10,0.16];
        let col=mix(wine,crimson,0.25+0.75*dist);
        col=mix(col,blood,Math.min(1,rng()*0.35+(edge?0.3:0)));
        placed.push({x:it.cx,y,text:it.text,size:it.size,edge,color:col.map(v=>Math.min(1,v)),rad:dist});
      });
    }
    y-=ROW_H;
  }
  const CY2=(ymax+ymin)/2;
  const ep=placed.filter(p=>p.edge);
  const ip=placed.filter(p=>!p.edge);
  ep.sort((a,b)=>(Math.atan2(a.x,a.y-CY2)%(2*Math.PI))-(Math.atan2(b.x,b.y-CY2)%(2*Math.PI)));
  ip.sort((a,b)=>(b.rad-rng()*0.08)-(a.rad-rng()*0.08));
  return ep.concat(ip);
}

function startHeartAnimation() {
  heartRng      = makeRng(99);
  heartItems    = buildHeartItems(makeRng(11));
  heartState    = "spawning";
  heartActiveItems=[];
  heartSpawnAcc=0;
  heartSpawnIdx=0;
  heartShimmerTimer=0;
  const RATE=heartItems.length/(HEART_DUR*1000/HEART_TICK);
  const BGC=[6/255,2/255,8/255];
  const FLASH=[1,0.78,0.78];
  const mix=(a,b,k)=>a.map((v,i)=>v+(b[i]-v)*k);
  const dim=(c,k)=>c.map(v=>v*k);
  const clamp=v=>Math.max(0,Math.min(1,v));
  const hex=c=>"#"+c.map(v=>Math.round(clamp(v)*255).toString(16).padStart(2,"0")).join("");

  // Pre-compute item bounds so we can scale to fit any canvas size.
  const hXR  = Math.max(...heartItems.map(p=>Math.abs(p.x))) + 16;
  const hYArr= heartItems.map(p=>p.y);
  const hYMax= Math.max(...hYArr) + 16;
  const hYMin= Math.min(...hYArr) - 16;
  const hMidY= (hYMax+hYMin)/2;
  const hHalfH=(hYMax-hYMin)/2;

  function frame() {
    if(!heartAnimRunning)return;
    const canvas=heartCanvas;
    if(!canvas)return;
    const rect=canvas.getBoundingClientRect();
    const dpr=Math.min(window.devicePixelRatio||1,2);
    const W=Math.max(1,rect.width),H=Math.max(1,rect.height);
    if(canvas.width!==Math.round(W*dpr)||canvas.height!==Math.round(H*dpr)){canvas.width=Math.round(W*dpr);canvas.height=Math.round(H*dpr);}
    const ctx=canvas.getContext("2d");
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.fillStyle=HEART_BG;ctx.fillRect(0,0,W,H);

    // Compute scale so the entire heart fits inside the canvas with padding.
    const PAD=10;
    const sc=Math.min((W/2-PAD)/hXR, (H/2-PAD)/hHalfH);
    const ox=W/2, oy=H/2;
    // toC maps heart-item coords → canvas pixels, centred & scaled.
    const toC=(px,py)=>[ox+px*sc, oy-(py-hMidY)*sc];
    const lift=HEART_LIFT*sc;

    // Spawn
    if(heartState==="spawning"){
      heartSpawnAcc+=RATE;
      while(heartSpawnAcc>=1&&heartSpawnIdx<heartItems.length){
        heartSpawnAcc-=1;
        const p=heartItems[heartSpawnIdx++];
        p.f=0;p.dx=(heartRng()-0.5)*20;
        heartActiveItems.push(p);
      }
      if(heartSpawnIdx>=heartItems.length)heartState="shimmering";
    }

    // Active (drop-in)
    const still=[];
    for(const p of heartActiveItems){
      p.f++;
      const u=clamp(p.f/HEART_ANIM);
      const e=1-Math.pow(1-u,3);
      const hover=(1-e)*lift;
      const [cx,cy2]=toC(p.x+p.dx*(1-e),p.y);
      const py2=cy2-hover;
      const flash=0.75*Math.sin(Math.PI*clamp((u-0.55)/0.45));
      const col=mix(mix(BGC,p.color,Math.pow(e,1.5)),FLASH,flash);
      const fs=Math.max(6,Math.round(p.size*sc));
      ctx.font=`bold ${fs}px Arial`;ctx.textAlign="center";ctx.textBaseline="middle";
      ctx.fillStyle=hex(mix(BGC,dim(p.color,0.3),e));ctx.fillText(p.text,cx+2*sc,py2+3*sc);
      ctx.fillStyle=hex(col);ctx.fillText(p.text,cx,py2);
      if(u<1)still.push(p);else p.settled=true;
    }
    heartActiveItems=still;

    // Settled
    for(const p of heartItems){
      if(!p.settled)continue;
      const [cx,cy2]=toC(p.x,p.y);
      const fs=Math.max(6,Math.round(p.size*sc));
      ctx.font=`bold ${fs}px Arial`;ctx.textAlign="center";ctx.textBaseline="middle";
      ctx.fillStyle=hex(dim(p.color,0.3));ctx.fillText(p.text,cx+2*sc,cy2+3*sc);
      ctx.fillStyle=p.shimmer?hex(mix(p.color,FLASH,0.6)):hex(p.color);
      ctx.fillText(p.text,cx,cy2);
    }

    // Shimmer
    if(heartState==="shimmering"&&heartActiveItems.length===0){
      heartShimmerTimer++;
      if(heartShimmerTimer%9===0){
        const settled=heartItems.filter(p=>p.settled);
        if(settled.length){const t=settled[Math.floor(heartRng()*settled.length)];t.shimmer=true;setTimeout(()=>{t.shimmer=false;},260);}
      }
    }
    heartAnimFrame=requestAnimationFrame(frame);
  }

  heartAnimRunning=true;
  cancelAnimationFrame(heartAnimFrame);
  heartAnimFrame=requestAnimationFrame(frame);
}

function stopHeartAnimation() {
  heartAnimRunning=false;
  cancelAnimationFrame(heartAnimFrame);
  if(heartItems)heartItems.forEach(p=>{delete p.settled;delete p.shimmer;delete p.f;delete p.dx;});
  heartItems=null;heartState="idle";
}

// ═══════════════════════════════════════════════════════════════════════════════
// CAKE ANIMATION  — recreation of bday.py
// Birthday cake packed with multilingual "Happy Birthday" phrases +
// 5 flickering candles that blow out one by one, then cake gets eaten.
// ═══════════════════════════════════════════════════════════════════════════════
const BDAY_PHRASES = [
  "Happy Birthday","İyi ki doğdun","Feliz cumpleaños",
  "Joyeux anniversaire","Alles Gute zum Geburtstag",
  "Buon compleanno","Feliz aniversário","С днём рождения",
  "생일 축하해요","お誕生日おめでとう","生日快乐","जन्मदिन मुबारक हो",
  "Χρόνια πολλά","Gefeliciteerd","Grattis på födelsedagen",
  "Wszystkiego najlepszego","สุขสันต์วันเกิด","Chúc mừng sinh nhật",
  "Selamat ulang tahun","З днем народження","عيد ميلاد سعيد",
  "تولدت مبارک","יום הולדת שמח","Tillykke med fødselsdagen","Všechno nejlepší",
];

const CAKE_PARTS=[
  {name:"plate",W:350,y1:-302,y2:-262,Rt:18,Rb:18},
  {name:"base", W:300,y1:-262,y2:-110,Rt:22,Rb:10},
  {name:"mid",  W:225,y1:-110,y2:-5,  Rt:22,Rb:0 },
  {name:"top",  W:150,y1:-5,  y2:85,  Rt:20,Rb:0 },
];
const CAKE_OY=56;
const CAKE_CX=[-100,-50,0,50,100];
const CAKE_CY0=96,CAKE_CY1=166,CAKE_FY=170;
const CAKE_TICK=16;
const CAKE_INTRO=120,CAKE_BLOW_GAP=40,CAKE_BLOW_N=26,CAKE_BITE_GAP=46;
const CAKE_BG="#060208";
const CAKE_PAL={plate:[0.95,0.72,0.30],base:[0.80,0.12,0.42],mid:[0.95,0.30,0.55],top:[1.00,0.55,0.70]};
const CAKE_CREAM=[1.0,0.90,0.93];
const CAKE_FILL=[1.0,0.80,0.55];
const CAKE_FLASH2=[1.0,0.78,0.78];
const CAKE_PHASE={base:0,mid:1.7,top:3.1};

let cakeAnimFrame=0,cakeAnimRunning=false;
let cakeItems=null,cakeFr=0,cakeRemovals=[],cakeSmoke=[],cakeEatDone=false,cakeRng;

function cakeHW(part,y){
  const{W,y1,y2,Rt,Rb}=part;let w=W;
  if(Rt&&y>y2-Rt){const d=y-(y2-Rt);w=W-Rt+Math.sqrt(Math.max(0,Rt*Rt-d*d));}
  else if(Rb&&y<y1+Rb){const d=(y1+Rb)-y;w=W-Rb+Math.sqrt(Math.max(0,Rb*Rb-d*d));}
  return w;
}
function cakeSpans(y){
  for(const p of CAKE_PARTS)if(p.y1<=y&&y<p.y2){const w=cakeHW(p,y);return w>0?[[-w,w]]:[];}
  return[];
}
function cakeIsect(A,B){const out=[];for(const a of A)for(const b of B){const lo=Math.max(a[0],b[0]),hi=Math.min(a[1],b[1]);if(hi-lo>14)out.push([lo,hi]);}return out;}
function cakePartOf(y){for(const p of CAKE_PARTS)if(p.y1<=y&&y<p.y2)return p.name;return"base";}
function cakeDrip(nm,x){const ph=CAKE_PHASE[nm]||0;return 22+26*(0.5+0.5*Math.sin(x/15+ph))*(0.5+0.5*Math.sin(x/38+ph*2));}

function cakeColor(partNm,y,x,edge,rng){
  const mix=(a,b,k)=>a.map((v,i)=>v+(b[i]-v)*k);
  let base=[...CAKE_PAL[partNm]];
  const tops={};CAKE_PARTS.forEach(p=>{tops[p.name]=p.y2;});
  const bots={};CAKE_PARTS.forEach(p=>{bots[p.name]=p.y1;});
  if(partNm==="plate"){base=mix(base,[1,1,1],rng()*0.35);}
  else{
    if(y>tops[partNm]-cakeDrip(partNm,x))base=mix(CAKE_CREAM,base,rng()*0.18);
    else if(partNm!=="base"&&y<bots[partNm]+16)base=mix(CAKE_FILL,base,rng()*0.25);
    else base=mix(base,[1,1,1],rng()*0.18+(edge?0.15:0));
  }
  return base.map(v=>Math.min(1,v));
}

function buildCakeItems(rng){
  const phrases=[...BDAY_PHRASES];
  const SIZES=[9,10,11,12];
  const mc=document.createElement("canvas").getContext("2d");
  const measure=(t,s)=>{mc.font=`bold ${s}px Arial`;return mc.measureText(t).width;};
  let pi=0;
  function nextP(){if(pi%phrases.length===0){for(let i=phrases.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[phrases[i],phrases[j]]=[phrases[j],phrases[i]];}}return phrases[(pi++)%phrases.length];}

  const YMAX=Math.max(...CAKE_PARTS.map(p=>p.y2));
  const YMIN=Math.min(...CAKE_PARTS.map(p=>p.y1));
  const ROW_H=18,half=ROW_H/2;
  const placed=[];
  let y=YMAX-half;
  while(y>YMIN+half){
    const row=cakeIsect(cakeSpans(y+half),cakeSpans(y-half));
    for(let[lo,hi]of row){
      lo+=4;hi-=4;let cur=lo+rng()*8;const line=[];
      while(true){let fit=null;for(let t=0;t<12;t++){const text=nextP();const size=SIZES[Math.floor(rng()*SIZES.length)];const w=measure(text,size);if(cur+w<=hi){fit={text,size,w};break;}}if(!fit)break;line.push({cx:cur+fit.w/2,text:fit.text,size:fit.size,w:fit.w});cur+=fit.w+7;}
      if(!line.length)continue;
      if(line.length>1){const slack=hi-(line[line.length-1].cx+line[line.length-1].w/2);line.forEach((it,i)=>{it.cx+=slack*i/(line.length-1);});}else line[0].cx=(lo+hi)/2;
      line.forEach((it,i)=>{const edge=i===0||i===line.length-1;const part=cakePartOf(y);const color=cakeColor(part,y,it.cx,edge,rng);const kind=part==="plate"?"plate":"body";placed.push({x:it.cx,y,text:it.text,size:it.size,edge,color,kind,alive:true});});
    }
    y-=ROW_H;
  }
  // cherries
  for(const cx of[-75,-25,25,75])placed.push({x:cx,y:CAKE_PARTS[3].y2-2,text:"●",size:13,edge:false,color:[0.92,0.04,0.12],kind:"cherry",alive:true});
  // candles
  for(let ci=0;ci<CAKE_CX.length;ci++){const cx=CAKE_CX[ci];let k=0;for(let yy=CAKE_CY0;yy<=CAKE_CY1;yy+=13){const col=k%2===0?[1.0,0.92,0.95]:[0.45,0.80,1.0];placed.push({x:cx,y:yy,text:"|",size:12,edge:false,color:col,kind:"candle",ci,alive:true});k++;}}
  return placed;
}

function startCakeAnimation(){
  cakeRng=makeRng(11);
  cakeItems=buildCakeItems(makeRng(11));
  cakeFr=0;cakeRemovals=[];cakeSmoke=[];cakeEatDone=false;

  const BGC=[6/255,2/255,8/255];
  const mix=(a,b,k)=>a.map((v,i)=>v+(b[i]-v)*k);
  const dim=(c,k)=>c.map(v=>v*k);
  const clamp=v=>Math.max(0,Math.min(1,v));
  const hex=c=>"#"+c.map(v=>Math.round(clamp(v)*255).toString(16).padStart(2,"0")).join("");
  const RED=[0.95,0.10,0.05],ORANGE=[1.00,0.55,0.05],YELLOW=[1.00,0.80,0.25],EMBER=[0.30,0.04,0.02];

  const flames=CAKE_CX.map(x=>({x,ph:cakeRng()*Math.PI*2,blown:false}));
  const EAT_START=CAKE_INTRO+(CAKE_CX.length-1)*CAKE_BLOW_GAP+CAKE_BLOW_N+40;

  // Pre-compute item bounds (including flame tops) so we can scale-to-fit any canvas.
  const ckXR  = Math.max(...cakeItems.map(p=>Math.abs(p.x))) + 20;
  const ckYArr= cakeItems.map(p=>p.y);
  // top of drawing = highest candle-flame tip, bottom = plate bottom
  const ckYTop= Math.max(CAKE_FY+36, Math.max(...ckYArr)) + 20;
  const ckYBot= Math.min(...ckYArr) - 20;
  const ckMidY=(ckYTop+ckYBot)/2;
  const ckHalfH=(ckYTop-ckYBot)/2;

  function frame(){
    if(!cakeAnimRunning)return;
    const canvas=cakeCanvas;if(!canvas)return;
    const rect=canvas.getBoundingClientRect();
    const dpr=Math.min(window.devicePixelRatio||1,2);
    const CW=Math.max(1,rect.width),CH=Math.max(1,rect.height);
    if(canvas.width!==Math.round(CW*dpr)||canvas.height!==Math.round(CH*dpr)){canvas.width=Math.round(CW*dpr);canvas.height=Math.round(CH*dpr);}
    const ctx=canvas.getContext("2d");
    ctx.setTransform(dpr,0,0,dpr,0,0);
    ctx.fillStyle=CAKE_BG;ctx.fillRect(0,0,CW,CH);

    // Compute scale so the entire cake (plate→flame) fits the canvas.
    const PAD=10;
    const ck=Math.min((CW/2-PAD)/ckXR, (CH/2-PAD)/ckHalfH);
    const ox=CW/2, oy=CH/2;
    // toC maps cake coords → canvas pixels, centred & scaled.
    const toC=(x,y)=>[ox+x*ck, oy-(y-ckMidY)*ck];

    cakeFr++;

    // Draw text items
    for(const p of cakeItems){
      if(!p.alive||p._rm)continue;
      const[px,py]=toC(p.x,p.y);
      const fs=Math.max(6,Math.round(p.size*ck));
      ctx.font=`bold ${fs}px Arial`;ctx.textAlign="center";ctx.textBaseline="middle";
      ctx.fillStyle=hex(dim(p.color,0.3));ctx.fillText(p.text,px+2*ck,py+3*ck);
      ctx.fillStyle=p.shimmer?hex(mix(p.color,CAKE_FLASH2,0.6)):hex(p.color);
      ctx.fillText(p.text,px,py);
    }

    // Removals
    cakeRemovals=cakeRemovals.filter(rm=>{
      rm.f++;if(rm.f<=0)return true;
      const p=rm.p;const u=clamp(rm.f/rm.N);
      const off=rm.dy>0?rm.dy*u*u:rm.dy*(1-Math.pow(1-u,2));
      const[bpx,bpy]=toC(p.x,p.y);const rx=bpx+rm.dx*ck*u,ry=bpy-off*ck;
      const fs=Math.max(6,Math.round(p.size*ck));
      ctx.font=`bold ${fs}px Arial`;ctx.textAlign="center";ctx.textBaseline="middle";
      ctx.fillStyle=hex(mix(BGC,dim(p.color,0.3),1-u));ctx.fillText(p.text,rx+2*ck,ry+3*ck);
      ctx.fillStyle=hex(mix(p.color,BGC,u));ctx.fillText(p.text,rx,ry);
      if(u>=1){p._rm=true;return false;}return true;
    });

    // Smoke
    cakeSmoke=cakeSmoke.filter(sm=>{
      sm.f++;if(sm.f<=0)return true;
      const u=clamp(sm.f/sm.N);
      const[sx,sy0]=toC(sm.x,CAKE_FY);
      const x=sx+sm.drift*ck*u+5*Math.sin(u*7+sm.ph);
      const y=sy0-60*ck*u;const rad=(2+8*u)*ck;
      ctx.beginPath();ctx.arc(x,y,Math.max(1,rad),0,Math.PI*2);
      ctx.fillStyle=hex(mix(BGC,[0.62,0.62,0.68],0.75*Math.pow(1-u,1.3)));ctx.fill();
      return u<1;
    });

    // Flames
    for(let i=0;i<flames.length;i++){
      const f=flames[i];if(f.blown)continue;
      const t0=CAKE_INTRO+i*CAKE_BLOW_GAP;
      const[fx,fy]=toC(f.x,CAKE_FY);
      if(cakeFr<t0){
        if(cakeFr%5===0)f.ph+=cakeRng()*0.4;
        const k=cakeRng();
        const h=(22+7*(0.5+0.5*Math.sin(f.ph)))*ck;
        const w=(8+cakeRng()*2)*ck;
        const sway=Math.sin(f.ph*1.3)*2*ck;
        const glow=26*ck;
        // glow
        const grd=ctx.createRadialGradient(fx+sway,fy,2,fx+sway,fy,glow);
        grd.addColorStop(0,hex(dim(mix(RED,ORANGE,k),0.22)));grd.addColorStop(1,"rgba(0,0,0,0)");
        ctx.fillStyle=grd;ctx.beginPath();ctx.ellipse(fx+sway,fy-10*ck,glow,glow,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle=hex(mix(RED,ORANGE,k));ctx.beginPath();ctx.ellipse(fx+sway,fy-h/2,w,h,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle=hex(mix(ORANGE,YELLOW,cakeRng()*0.7+0.3));ctx.beginPath();ctx.ellipse(fx+sway*0.6,fy-h*0.3,w*0.45,h*0.55,0,0,Math.PI*2);ctx.fill();
      }else if(cakeFr<t0+CAKE_BLOW_N){
        const u=(cakeFr-t0)/CAKE_BLOW_N;
        const lean=14*ck*Math.pow(u,1.4);const h=Math.max(1,(24*Math.pow(1-u,1.2)+2)*ck);const w=(8*(1-0.55*u))*ck;
        ctx.fillStyle=hex(mix(mix(RED,ORANGE,0.4),EMBER,u));ctx.beginPath();ctx.ellipse(fx+lean,fy-h/2,Math.max(1,w),h,0,0,Math.PI*2);ctx.fill();
        ctx.fillStyle=hex(mix(YELLOW,RED,clamp(u*1.6)));ctx.beginPath();ctx.ellipse(fx+lean*0.6,fy-h*0.3,Math.max(1,w*0.45),Math.max(1,h*0.55),0,0,Math.PI*2);ctx.fill();
      }else if(!f.blown){
        f.blown=true;
        for(const p of cakeItems)if(p.kind==="candle"&&p.ci===i&&p.alive){p.alive=false;cakeRemovals.push({p,f:0,N:24,dx:0,dy:-36});}
        for(let s=0;s<4;s++)cakeSmoke.push({x:f.x+8,f:-Math.floor(cakeRng()*14),N:55+Math.floor(cakeRng()*25),ph:cakeRng()*6,drift:6+cakeRng()*10});
      }
    }

    // Shimmer
    if(cakeFr%16===0&&!cakeEatDone){
      const alive=cakeItems.filter(p=>p.alive&&p.kind!=="candle");
      if(alive.length){const t=alive[Math.floor(cakeRng()*alive.length)];t.shimmer=true;setTimeout(()=>{t.shimmer=false;},260);}
    }

    // Bite
    if(cakeFr>=EAT_START&&!cakeEatDone&&(cakeFr-EAT_START)%CAKE_BITE_GAP===0){
      const pool=cakeItems.filter(p=>p.alive&&(p.kind==="body"||p.kind==="cherry"));
      if(pool.length<=5){
        pool.forEach(p=>{p.alive=false;cakeRemovals.push({p,f:-Math.floor(cakeRng()*10),N:18+Math.floor(cakeRng()*8),dx:(cakeRng()-0.5)*16,dy:16+cakeRng()*26});});
        cakeEatDone=true;
        cakeItems.filter(p=>p.alive&&p.kind==="plate").forEach(p=>{
          const delay=((p.x+350)/700*40)|0;
          setTimeout(()=>{p.alive=false;cakeRemovals.push({p,f:0,N:20+Math.floor(cakeRng()*8),dx:(cakeRng()-0.5)*12,dy:20+cakeRng()*20});},delay*CAKE_TICK);
        });
      }else{
        const th=cakeRng()*Math.PI*2;const vx=Math.cos(th),vy=Math.sin(th);
        const ext=pool.reduce((b,p)=>p.x*vx+p.y*vy>b.x*vx+b.y*vy?p:b,pool[0]);
        const R=85+cakeRng()*30;
        pool.forEach(p=>{const d=Math.hypot((p.x-ext.x)/1.6,(p.y-ext.y)*1.2)+(cakeRng()-0.5)*20;if(d<=R){p.alive=false;cakeRemovals.push({p,f:-Math.floor(cakeRng()*8),N:18+Math.floor(cakeRng()*8),dx:(cakeRng()-0.5)*16,dy:16+cakeRng()*26});}});
      }
    }

    cakeAnimFrame=requestAnimationFrame(frame);
  }
  cakeAnimRunning=true;
  cancelAnimationFrame(cakeAnimFrame);
  cakeAnimFrame=requestAnimationFrame(frame);
}

function stopCakeAnimation(){
  cakeAnimRunning=false;cancelAnimationFrame(cakeAnimFrame);
  cakeItems=null;cakeFr=0;cakeRemovals=[];cakeSmoke=[];cakeEatDone=false;
}

// ─── Modal open/close ─────────────────────────────────────────────────────────
function openAnimationModal(modal) {
  [letterModal,heartAnimationModal,secondAnimationModal].forEach(item=>{
    if(item!==modal){item.classList.remove("open");item.setAttribute("aria-hidden","true");}
  });
  letterTypingRun++;
  document.body.classList.add("modal-open");
  modal.classList.add("open");modal.setAttribute("aria-hidden","false");
  const close=$("[data-close-animation]",modal);
  if(close)close.focus({preventScroll:true});
  if(modal===heartAnimationModal)startHeartAnimation();
  if(modal===secondAnimationModal)startCakeAnimation();
}

function closeAnimationModal(modal) {
  modal.classList.remove("open");modal.setAttribute("aria-hidden","true");
  if(modal===heartAnimationModal)stopHeartAnimation();
  if(modal===secondAnimationModal)stopCakeAnimation();
  if(![letterModal,heartAnimationModal,secondAnimationModal].some(item=>item.classList.contains("open"))){
    document.body.classList.remove("modal-open");
  }
}

$("#openHeartAnimation").addEventListener("click",()=>openAnimationModal(heartAnimationModal));
$("#openSecondAnimation").addEventListener("click",()=>openAnimationModal(secondAnimationModal));
$$("[data-close-animation]").forEach(button=>{
  button.addEventListener("click",()=>closeAnimationModal($("#"+button.dataset.closeAnimation)));
});
[heartAnimationModal,secondAnimationModal].forEach(modal=>{
  modal.addEventListener("click",event=>{if(event.target===modal)closeAnimationModal(modal);});
});
document.addEventListener("keydown",event=>{
  if(event.key!=="Escape")return;
  [heartAnimationModal,secondAnimationModal].forEach(modal=>{if(modal.classList.contains("open"))closeAnimationModal(modal);});
});
