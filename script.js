const video = document.getElementById("video");

const btnStart = document.getElementById("btnStart");
const btnMirror = document.getElementById("btnMirror");
const btnAuto = document.getElementById("btnAuto");
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

const progressBox = document.getElementById("progress");
const bar = document.getElementById("bar");
const progressText = document.getElementById("progressText");

const stripCanvas = document.getElementById("stripCanvas");

const quadCanvases = document.querySelectorAll(".quad-canvas");
const quadCtxs = [...quadCanvases].map(c => c.getContext("2d", { willReadFrequently: true }));

let stream = null;
let mirror = false;
let isAutoRunning = false;
let currentFrame = "korean";

let captured = [];          // dataURL per slot
let frozen = [false,false,false,false];
let rafId = null;

function wait(ms){ return new Promise(res => setTimeout(res, ms)); }

function playShutterSound(){
  try{
    const audio = new Audio("https://www.soundjay.com/camera/sounds/camera-shutter-click-01.mp3");
    audio.volume = 0.6;
    audio.play();
  }catch(e){}
}

function updateHUD(){
  const frameName = currentFrame === "korean" ? "Korean" : currentFrame === "kawaii" ? "Kawaii" : "Neon";
  hudFrame.textContent = `Frame: ${frameName}`;

  const fxNames = {
    none: "None",
    bw: "B&W",
    vintage: "Vintage",
    soft: "Soft Glow",
    grain: "Film Grain",
    cool: "Cool"
  };
  hudFx.textContent = `Effect: ${fxNames[effectSelect.value] || "None"}`;
  hudShots.textContent = `Shots: ${captured.filter(Boolean).length}/4`;

  btnRetake.disabled = captured.filter(Boolean).length === 0 || isAutoRunning;
  btnDownload.disabled = captured.filter(Boolean).length !== 4;
}

segButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    if (isAutoRunning) return;
    currentFrame = btn.dataset.frame;
    segButtons.forEach(b => b.classList.toggle("active", b === btn));
    updateHUD();
  });
});

function clamp(v){ return Math.max(0, Math.min(255, v)); }

function applyCanvasEffect(imageData, fx){
  const d = imageData.data;
  if (fx === "none") return imageData;

  for (let i=0;i<d.length;i+=4){
    let r=d[i], g=d[i+1], b=d[i+2];

    if (fx === "bw"){
      const gray = (r+g+b)/3;
      r=g=b=gray;
    }
    if (fx === "vintage"){
      r = clamp(r*1.1 + 12);
      g = clamp(g*1.05 + 6);
      b = clamp(b*0.9);
    }
    if (fx === "soft"){
      r = clamp(r*1.05 + 10);
      g = clamp(g*1.05 + 10);
      b = clamp(b*1.05 + 10);
    }
    if (fx === "grain"){
      const noise = (Math.random()-0.5)*24;
      r = clamp(r + noise);
      g = clamp(g + noise);
      b = clamp(b + noise);
    }
    if (fx === "cool"){
      r = clamp(r*0.95);
      g = clamp(g*1.02);
      b = clamp(b*1.15 + 10);
    }

    d[i]=r; d[i+1]=g; d[i+2]=b;
  }
  return imageData;
}

function resizeQuadCanvases(){
  quadCanvases.forEach((c) => {
    const rect = c.getBoundingClientRect();
    const w = Math.max(1, Math.floor(rect.width));
    const h = Math.max(1, Math.floor(rect.height));
    if (c.width !== w || c.height !== h){
      c.width = w;
      c.height = h;
    }
  });
}

// draw frame border tipis (biar preview ga kebanyakan putih)
function drawFrameOverlay(ctx, w, h){
  ctx.save();

  const thick = Math.max(6, Math.floor(w * 0.02)); // TIPIS

  if (currentFrame === "korean"){
    ctx.lineWidth = thick;
    ctx.strokeStyle = "rgba(255,255,255,0.60)";
    ctx.strokeRect(0, 0, w, h);
  }

  if (currentFrame === "kawaii"){
    ctx.lineWidth = thick;
    ctx.strokeStyle = "rgba(255, 122, 208, 0.65)";
    ctx.strokeRect(0, 0, w, h);
  }

  if (currentFrame === "neon"){
    ctx.lineWidth = thick;
    ctx.strokeStyle = "rgba(56,189,248,0.45)";
    ctx.strokeRect(0, 0, w, h);

    ctx.lineWidth = Math.max(4, Math.floor(w * 0.012));
    ctx.strokeStyle = "rgba(168,85,247,0.30)";
    ctx.strokeRect(8, 8, w-16, h-16);
  }

  ctx.restore();
}

function drawLoop(){
  resizeQuadCanvases();

  const fx = effectSelect.value;

  quadCanvases.forEach((canvas, i) => {
    if (frozen[i]) return;

    const ctx = quadCtxs[i];
    const w = canvas.width;
    const h = canvas.height;

    if (!video.videoWidth) return;

    ctx.save();

    if (mirror){
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }

    // cover crop
    const vw = video.videoWidth;
    const vh = video.videoHeight;
    const cr = w / h;
    const vr = vw / vh;

    let sx, sy, sw, sh;

    if (vr > cr){
      sh = vh;
      sw = vh * cr;
      sx = (vw - sw) / 2;
      sy = 0;
    } else {
      sw = vw;
      sh = vw / cr;
      sx = 0;
      sy = (vh - sh) / 2;
    }

    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, w, h);
    ctx.restore();

    if (fx !== "none"){
      let img = ctx.getImageData(0, 0, w, h);
      img = applyCanvasEffect(img, fx);
      ctx.putImageData(img, 0, 0);
    }

    drawFrameOverlay(ctx, w, h);
  });

  rafId = requestAnimationFrame(drawLoop);
}

async function runCountdown(seconds){
  if (seconds <= 0) return;
  countdownEl.classList.remove("hidden");
  for (let i=seconds; i>0; i--){
    countText.textContent = i;
    await wait(1000);
  }
  countdownEl.classList.add("hidden");
}

async function flash(){
  flashEl.classList.remove("hidden");
  await wait(90);
  flashEl.classList.add("hidden");
}

function captureCell(index){
  const canvas = quadCanvases[index];
  frozen[index] = true;
  return canvas.toDataURL("image/png");
}

// ===== Start
btnStart.addEventListener("click", async () => {
  try{
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false
    });

    video.srcObject = stream;

    btnAuto.disabled = false;
    btnMirror.disabled = false;

    captured = [];
    frozen = [false,false,false,false];
    updateHUD();

    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(drawLoop);

  }catch(err){
    alert("Kamera gagal dibuka. Jalankan via Live Server / localhost ya.");
    console.error(err);
  }
});

// ===== Mirror
btnMirror.addEventListener("click", () => {
  mirror = !mirror;
  btnMirror.textContent = mirror ? "Mirror: ON" : "Mirror: OFF";
});

// ===== Auto
btnAuto.addEventListener("click", async () => {
  if (!stream || isAutoRunning) return;

  isAutoRunning = true;

  btnAuto.disabled = true;
  btnStart.disabled = true;
  btnMirror.disabled = true;
  btnRetake.disabled = true;

  effectSelect.disabled = true;
  timerSelect.disabled = true;
  segButtons.forEach(b => b.disabled = true);

  captured = [];
  frozen = [false,false,false,false];
  updateHUD();

  progressBox.classList.remove("hidden");
  bar.style.width = "0%";

  const seconds = parseInt(timerSelect.value, 10);

  for (let i=0; i<4; i++){
    progressText.textContent = `Photo ${i+1}/4`;
    bar.style.width = `${i * 25}%`;

    await runCountdown(seconds);
    await flash();
    playShutterSound();

    const url = captureCell(i);
    captured[i] = url;
    updateHUD();

    await wait(250);
  }

  bar.style.width = "100%";
  progressText.textContent = "Done ✅";

  await wait(600);
  progressBox.classList.add("hidden");

  isAutoRunning = false;

  btnStart.disabled = false;
  btnMirror.disabled = false;
  btnAuto.disabled = false;

  effectSelect.disabled = false;
  timerSelect.disabled = false;
  segButtons.forEach(b => b.disabled = false);

  updateHUD();
});

// ===== Retake Last
btnRetake.addEventListener("click", async () => {
  if (!stream || isAutoRunning) return;

  let last = -1;
  for (let i=3; i>=0; i--){
    if (captured[i]) { last = i; break; }
  }
  if (last === -1) return;

  frozen[last] = false;
  captured[last] = null;
  updateHUD();

  const seconds = parseInt(timerSelect.value, 10);

  await runCountdown(seconds);
  await flash();
  playShutterSound();

  const url = captureCell(last);
  captured[last] = url;
  updateHUD();
});

// ===== Reset
btnReset.addEventListener("click", () => {
  if (isAutoRunning) return;

  captured = [];
  frozen = [false,false,false,false];
  updateHUD();
});

// ===== Download (FIX: tidak gepeng, square 2x2)
btnDownload.addEventListener("click", async () => {
  if (captured.filter(Boolean).length !== 4) {
    alert("Foto belum lengkap 4/4 😄");
    return;
  }

  // === ukuran output (2x2 4:3)
  const cellW = 900;
  const cellH = 675; // 4:3
  const gap = 24;
  const pad = 40;
  const footerH = 120;

  const outW = pad*2 + cellW*2 + gap;
  const outH = pad*2 + cellH*2 + gap + footerH;

  stripCanvas.width = outW;
  stripCanvas.height = outH;

  const ctx = stripCanvas.getContext("2d");

  // BG
  if (currentFrame === "korean") ctx.fillStyle = "#ffffff";
  if (currentFrame === "kawaii") ctx.fillStyle = "#fff0f8";
  if (currentFrame === "neon") ctx.fillStyle = "#0b1022";
  ctx.fillRect(0, 0, outW, outH);

  // helper cover (anti gepeng)
  function drawImageCover(ctx, img, x, y, w, h){
    const iw = img.width;
    const ih = img.height;
    const ir = iw / ih;
    const r = w / h;

    let sx, sy, sw, sh;
    if (ir > r){
      sh = ih;
      sw = ih * r;
      sx = (iw - sw) / 2;
      sy = 0;
    } else {
      sw = iw;
      sh = iw / r;
      sx = 0;
      sy = (ih - sh) / 2;
    }

    ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  }

  // load images
  const imgs = captured.map(src => {
    const im = new Image();
    im.src = src;
    return im;
  });
  await Promise.all(imgs.map(im => new Promise(res => im.onload = res)));

  const pos = [
    [pad, pad],
    [pad + cellW + gap, pad],
    [pad, pad + cellH + gap],
    [pad + cellW + gap, pad + cellH + gap],
  ];

  pos.forEach(([x, y], i) => {
    ctx.fillStyle = "rgba(0,0,0,.06)";
    ctx.fillRect(x-5, y-5, cellW+10, cellH+10);

    drawImageCover(ctx, imgs[i], x, y, cellW, cellH);

    ctx.strokeStyle = "rgba(255,255,255,.75)";
    ctx.lineWidth = 6;
    ctx.strokeRect(x+3, y+3, cellW-6, cellH-6);
  });

  // footer
  const footerY = pad*2 + cellH*2 + gap;

  ctx.globalAlpha = 0.15;
  ctx.fillStyle = currentFrame === "neon" ? "#ffffff" : "#000000";
  ctx.fillRect(pad, footerY + 10, outW - pad*2, 2);
  ctx.globalAlpha = 1;

  // === watermark logo (jika gagal load, tetap lanjut)
  let logoLoaded = false;
  const wmLogo = new Image();
  wmLogo.src = "assets/logo.png";

  await new Promise((res) => {
    wmLogo.onload = () => { logoLoaded = true; res(); };
    wmLogo.onerror = () => { logoLoaded = false; res(); };
  });

  const wmX = pad;
  const wmY = footerY + 30;

  if (logoLoaded){
    const wmSize = 42;
    ctx.globalAlpha = 0.95;
    ctx.drawImage(wmLogo, wmX, wmY, wmSize, wmSize);
    ctx.globalAlpha = 1;
  }

  // text footer
  ctx.fillStyle = currentFrame === "neon" ? "#e5e7eb" : "#111827";
  ctx.font = "900 26px Arial";
  ctx.fillText("PHOTOBOOTH STUDIO", wmX + 56, wmY + 28);

  ctx.globalAlpha = 0.75;
  ctx.font = "bold 16px Arial";
  ctx.fillText("by Riyan", wmX + 56, wmY + 52);

  // datetime kanan
  ctx.globalAlpha = 0.65;
  ctx.font = "14px Arial";
  const dt = new Date().toLocaleString();
  const dtWidth = ctx.measureText(dt).width;
  ctx.fillText(dt, outW - pad - dtWidth, wmY + 52);
  ctx.globalAlpha = 1;
// ✅ download (pakai Blob - lebih kuat daripada dataURL)
stripCanvas.toBlob((blob) => {
  if (!blob) {
    alert("Gagal membuat file. Coba ulang ya.");
    return;
  }

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "photobooth-studio.png";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url);
}, "image/png");
});
