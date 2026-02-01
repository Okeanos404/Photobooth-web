/* =====================================================
   ELEMENTS
===================================================== */
const video = document.getElementById("video");
const canvas = document.getElementById("cameraCanvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

const btnStart = document.getElementById("btnStart");
const btnMirror = document.getElementById("btnMirror");
const btnAuto = document.getElementById("btnAuto");     // legacy (hidden)
const btnShutter = document.getElementById("btnShutter");
const btnRetake = document.getElementById("btnRetake");
const btnReset = document.getElementById("btnReset");
const btnDownload = document.getElementById("btnDownload");

const timerSelect = document.getElementById("timer");
const effectSelect = document.getElementById("effect");

const countdownEl = document.getElementById("countdown");
const countText = document.getElementById("countText");
const flashEl = document.getElementById("flash");

const segButtons = document.querySelectorAll(".seg");
const hudFrame = document.getElementById("hudFrame");
const hudFx = document.getElementById("hudFx");
const hudShots = document.getElementById("hudShots");

const previewGrid = document.getElementById("previewGrid");
const stripCanvas = document.getElementById("stripCanvas");

/* =====================================================
   STATE
===================================================== */
const MAX_SHOTS = 6;
let stream = null;
let mirror = false;
let isRunning = false;
let currentFrame = "korean";
let captured = [];
let rafId = null;

/* =====================================================
   UTILS
===================================================== */
const wait = (ms) => new Promise(res => setTimeout(res, ms));
const clamp = (v) => Math.max(0, Math.min(255, v));

function playShutterSound(){
  try{
    const a = new Audio("https://www.soundjay.com/camera/sounds/camera-shutter-click-01.mp3");
    a.volume = 0.6;
    a.play();
  }catch{}
}

/* =====================================================
   CANVAS SIZE (ANTI HITAM)
===================================================== */
function resizeCanvas(){
  const size = canvas.parentElement.offsetWidth;
  canvas.width = size;
  canvas.height = size;
}
window.addEventListener("resize", resizeCanvas);

/* =====================================================
   EFFECT
===================================================== */
function applyEffect(img, fx){
  if (fx === "none") return img;
  const d = img.data;

  for (let i=0;i<d.length;i+=4){
    let r=d[i], g=d[i+1], b=d[i+2];

    if (fx === "bw"){
      const a=(r+g+b)/3; r=g=b=a;
    }
    if (fx === "vintage"){
      r=clamp(r*1.1+12); g=clamp(g*1.05+6); b=clamp(b*0.9);
    }
    if (fx === "soft"){
      r=clamp(r*1.05+10); g=clamp(g*1.05+10); b=clamp(b*1.05+10);
    }
    if (fx === "grain"){
      const n=(Math.random()-0.5)*24;
      r=clamp(r+n); g=clamp(g+n); b=clamp(b+n);
    }
    if (fx === "cool"){
      r=clamp(r*0.95); g=clamp(g*1.02); b=clamp(b*1.15+10);
    }

    d[i]=r; d[i+1]=g; d[i+2]=b;
  }
  return img;
}

/* =====================================================
   FRAME OVERLAY
===================================================== */
function drawFrameOverlay(w,h){
  const t=Math.max(6,Math.floor(w*0.02));
  ctx.save();

  if (currentFrame==="korean"){
    ctx.strokeStyle="rgba(255,255,255,.6)";
    ctx.lineWidth=t;
    ctx.strokeRect(0,0,w,h);
  }

  if (currentFrame==="kawaii"){
    ctx.strokeStyle="rgba(255,122,208,.65)";
    ctx.lineWidth=t;
    ctx.strokeRect(0,0,w,h);
  }

  if (currentFrame==="neon"){
    ctx.strokeStyle="rgba(56,189,248,.5)";
    ctx.lineWidth=t;
    ctx.strokeRect(0,0,w,h);

    ctx.strokeStyle="rgba(168,85,247,.35)";
    ctx.lineWidth=Math.max(4,t*0.6);
    ctx.strokeRect(10,10,w-20,h-20);
  }

  ctx.restore();
}

/* =====================================================
   DRAW LOOP (LIVE CAMERA)
===================================================== */
function drawLoop(){
  if (!video.videoWidth) {
    rafId = requestAnimationFrame(drawLoop);
    return;
  }

  ctx.clearRect(0,0,canvas.width,canvas.height);

  ctx.save();
  if (mirror){
    ctx.translate(canvas.width,0);
    ctx.scale(-1,1);
  }

  const vw=video.videoWidth, vh=video.videoHeight;
  const r=canvas.width/canvas.height, vr=vw/vh;
  let sx,sy,sw,sh;

  if (vr>r){
    sh=vh; sw=vh*r; sx=(vw-sw)/2; sy=0;
  }else{
    sw=vw; sh=vw/r; sx=0; sy=(vh-sh)/2;
  }

  ctx.drawImage(video,sx,sy,sw,sh,0,0,canvas.width,canvas.height);
  ctx.restore();

  if (effectSelect.value!=="none"){
    let img=ctx.getImageData(0,0,canvas.width,canvas.height);
    img=applyEffect(img,effectSelect.value);
    ctx.putImageData(img,0,0);
  }

  drawFrameOverlay(canvas.width,canvas.height);
  rafId = requestAnimationFrame(drawLoop);
}

/* =====================================================
   HUD & PREVIEW
===================================================== */
function updateHUD(){
  const names={korean:"Korean",kawaii:"Kawaii",neon:"Neon"};
  hudFrame.textContent=`Frame: ${names[currentFrame]}`;
  hudFx.textContent=`Effect: ${effectSelect.value}`;
  hudShots.textContent=`Shots: ${captured.length}/${MAX_SHOTS}`;

  btnRetake.disabled = captured.length===0 || isRunning;
  btnDownload.disabled = captured.length!==MAX_SHOTS;
}

function renderPreview(){
  previewGrid.innerHTML="";
  for(let i=0;i<MAX_SHOTS;i++){
    const d=document.createElement("div");
    d.className="preview-item";

    if(captured[i]){
      const img=document.createElement("img");
      img.src=captured[i];
      d.appendChild(img);
    }else{
      d.classList.add("empty");
      d.textContent=`Slot ${i+1}`;
    }

    const idx=document.createElement("span");
    idx.className="preview-index";
    idx.textContent=i+1;
    d.appendChild(idx);

    previewGrid.appendChild(d);
  }
}

/* =====================================================
   COUNTDOWN & FLASH
===================================================== */
async function runCountdown(sec){
  if(sec<=0) return;
  countdownEl.classList.remove("hidden");
  for(let i=sec;i>0;i--){
    countText.textContent=i;
    await wait(1000);
  }
  countdownEl.classList.add("hidden");
}

async function flash(){
  flashEl.classList.remove("hidden");
  await wait(90);
  flashEl.classList.add("hidden");
}

/* =====================================================
   CAPTURE
===================================================== */
function capture(){
  return canvas.toDataURL("image/png");
}

async function autoCapture(){
  if(!stream || isRunning || captured.length>=MAX_SHOTS) return;

  isRunning=true;
  btnShutter.disabled=true;

  const sec=parseInt(timerSelect.value,10);

  while(captured.length<MAX_SHOTS){
    await runCountdown(sec);
    await flash();
    playShutterSound();

    captured.push(capture());
    updateHUD();
    renderPreview();
    await wait(200);
  }

  isRunning=false;
  btnShutter.disabled=false;
  updateHUD();
}

/* =====================================================
   DOWNLOAD (2x3 STRIP)
===================================================== */
/* =====================================================
   DOWNLOAD (2x3 STRIP + WATERMARK)
===================================================== */
btnDownload.addEventListener("click", async ()=>{
  if(captured.length !== MAX_SHOTS){
    alert("Foto belum lengkap 6/6");
    return;
  }

  const cell = 800;
  const gap  = 24;
  const pad  = 40;
  const footerH = 140;

  const outW = pad*2 + cell*2 + gap;
  const outH = pad*2 + cell*3 + gap*2 + footerH;

  stripCanvas.width  = outW;
  stripCanvas.height = outH;

  const sctx = stripCanvas.getContext("2d");

  /* === BACKGROUND (ikut frame) === */
  if(currentFrame === "korean") sctx.fillStyle = "#ffffff";
  if(currentFrame === "kawaii") sctx.fillStyle = "#fff0f8";
  if(currentFrame === "neon")   sctx.fillStyle = "#0b1022";
  sctx.fillRect(0,0,outW,outH);

  /* === LOAD IMAGES === */
  const imgs = captured.map(src=>{
    const i = new Image();
    i.src = src;
    return i;
  });
  await Promise.all(imgs.map(i=>new Promise(r=>i.onload=r)));

  /* === DRAW PHOTOS (2x3) === */
  imgs.forEach((img,i)=>{
    const x = pad + (i%2)*(cell+gap);
    const y = pad + Math.floor(i/2)*(cell+gap);

    sctx.drawImage(img, x, y, cell, cell);

    // border halus
    sctx.strokeStyle = "rgba(0,0,0,.15)";
    sctx.lineWidth = 6;
    sctx.strokeRect(x+3, y+3, cell-6, cell-6);
  });

  /* === FOOTER LINE === */
  const footerY = pad*2 + cell*3 + gap*2;
  sctx.globalAlpha = 0.15;
  sctx.fillStyle = currentFrame==="neon" ? "#fff" : "#000";
  sctx.fillRect(pad, footerY, outW-pad*2, 2);
  sctx.globalAlpha = 1;

  /* === LOGO === */
  const logo = new Image();
  logo.src = "assets/logo.png";

  let logoLoaded = true;
  await new Promise(res=>{
    logo.onload = res;
    logo.onerror = ()=>{ logoLoaded=false; res(); };
  });

  const textX = pad + (logoLoaded ? 56 : 0);
  const textY = footerY + 48;

  if(logoLoaded){
    sctx.drawImage(logo, pad, footerY + 24, 42, 42);
  }

  /* === TEXT === */
  sctx.fillStyle = currentFrame==="neon" ? "#e5e7eb" : "#111827";
  sctx.font = "900 26px Arial";
  sctx.fillText("PHOTOBOOTH STUDIO", textX, textY);

  sctx.globalAlpha = 0.75;
  sctx.font = "bold 16px Arial";
  sctx.fillText("by Riyan", textX, textY + 26);
  sctx.globalAlpha = 1;

  /* === DATE TIME (KANAN) === */
  const dt = new Date().toLocaleString();
  sctx.font = "14px Arial";
  sctx.globalAlpha = 0.65;
  const dtW = sctx.measureText(dt).width;
  sctx.fillText(dt, outW - pad - dtW, textY + 26);
  sctx.globalAlpha = 1;

  /* === DOWNLOAD === */
  stripCanvas.toBlob(blob=>{
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "photobooth-studio.png";
    a.click();
    URL.revokeObjectURL(a.href);
  }, "image/png");
});


/* =====================================================
   EVENTS
===================================================== */
btnStart.addEventListener("click", async ()=>{
  try{
    stream=await navigator.mediaDevices.getUserMedia({
      video:{facingMode:"user",width:{ideal:1280},height:{ideal:1280}},
      audio:false
    });
    video.srcObject=stream;
    resizeCanvas();
    rafId=requestAnimationFrame(drawLoop);

    btnShutter.disabled=false;
    btnMirror.disabled=false;
  }catch{
    alert("Kamera gagal dibuka. Gunakan Live Server / localhost.");
  }
});

btnMirror.addEventListener("click",()=>{
  mirror=!mirror;
  btnMirror.textContent=`Mirror: ${mirror?"ON":"OFF"}`;
});

segButtons.forEach(btn=>{
  btn.addEventListener("click",()=>{
    if(isRunning) return;
    currentFrame=btn.dataset.frame;
    segButtons.forEach(b=>b.classList.toggle("active",b===btn));
    updateHUD();
  });
});

btnShutter.addEventListener("click",autoCapture);
btnAuto.addEventListener("click",autoCapture);

btnRetake.addEventListener("click",()=>{
  if(isRunning||captured.length===0) return;
  captured.pop();
  updateHUD();
  renderPreview();
});

btnReset.addEventListener("click",()=>{
  captured=[];
  updateHUD();
  renderPreview();
});

effectSelect.addEventListener("change",updateHUD);

/* =====================================================
   INIT
===================================================== */
updateHUD();
renderPreview();
