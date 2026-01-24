const video = document.getElementById("video");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

const strip = document.getElementById("strip");
const slots = strip.querySelectorAll(".slot");

const stripCanvas = document.getElementById("stripCanvas");
const stripCtx = stripCanvas.getContext("2d");

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

const frameOverlay = document.getElementById("frameOverlay");
const segButtons = document.querySelectorAll(".seg");

const hudFrame = document.getElementById("hudFrame");
const hudFx = document.getElementById("hudFx");
const hudShots = document.getElementById("hudShots");

const progressBox = document.getElementById("progress");
const bar = document.getElementById("bar");
const progressText = document.getElementById("progressText");

let stream = null;
let captured = [];
let mirror = false;
let isAutoRunning = false;

let currentFrame = "korean";

// ===== Utils
function wait(ms){ return new Promise(res => setTimeout(res, ms)); }

function playShutterSound(){
  // online sound biar tanpa file tambahan
  try{
    const audio = new Audio("https://www.soundjay.com/camera/sounds/camera-shutter-click-01.mp3");
    audio.volume = 0.6;
    audio.play();
  }catch(e){
    // kalau diblock browser, abaikan
  }
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
  hudShots.textContent = `Shots: ${captured.length}/4`;

  btnRetake.disabled = captured.length === 0 || isAutoRunning;
}

function setFrame(frameKey){
  currentFrame = frameKey;
  frameOverlay.className = `frame-overlay ${frameKey}`;

  segButtons.forEach(btn => {
    btn.classList.toggle("active", btn.dataset.frame === frameKey);
  });

  updateHUD();
}

segButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    if (isAutoRunning) return;
    setFrame(btn.dataset.frame);
  });
});

// Preview effect (CSS)
function applyPreviewEffect(){
  const fx = effectSelect.value;

  const map = {
    none: "none",
    bw: "grayscale(100%) contrast(115%)",
    vintage: "sepia(85%) contrast(110%) saturate(140%)",
    soft: "brightness(112%) contrast(105%) saturate(120%)",
    grain: "contrast(110%) saturate(115%)",
    cool: "contrast(115%) saturate(125%) hue-rotate(180deg)"
  };

  video.style.filter = map[fx] || "none";
  updateHUD();
}

effectSelect.addEventListener("change", applyPreviewEffect);

// ===== Camera Start
btnStart.addEventListener("click", async () => {
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false
    });

    video.srcObject = stream;

    btnAuto.disabled = false;
    btnMirror.disabled = false;

  } catch (err) {
    alert("Kamera gagal dibuka. Jalankan di localhost / Live Server ya.");
    console.error(err);
  }
});

// ===== Mirror
btnMirror.addEventListener("click", () => {
  mirror = !mirror;
  video.style.transform = mirror ? "scaleX(-1)" : "scaleX(1)";
  btnMirror.textContent = mirror ? "Mirror: ON" : "Mirror: OFF";
});

// ===== Countdown & Flash
async function runCountdown(seconds){
  if (seconds <= 0) return;
  countdownEl.classList.remove("hidden");

  for (let i = seconds; i > 0; i--){
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

// ===== Effects (canvas processing ringan)
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

// ===== Capture One Photo
function captureOne(){
  const w = video.videoWidth;
  const h = video.videoHeight;
  if (!w || !h) return null;

  canvas.width = w;
  canvas.height = h;

  ctx.save();
  if (mirror){
    ctx.translate(w, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, 0, 0, w, h);
  ctx.restore();

  let imgData = ctx.getImageData(0, 0, w, h);
  imgData = applyCanvasEffect(imgData, effectSelect.value);
  ctx.putImageData(imgData, 0, 0);

  return canvas.toDataURL("image/png");
}

function updateSlots(){
  slots.forEach((slot, i) => {
    slot.innerHTML = "";
    if (captured[i]){
      const img = document.createElement("img");
      img.src = captured[i];
      slot.appendChild(img);
    } else {
      slot.textContent = i + 1;
    }
  });
}

// ===== Retake Last (ulang foto terakhir)
btnRetake.addEventListener("click", async () => {
  if (isAutoRunning) return;
  if (!stream) return;
  if (captured.length === 0) return;

  captured.pop();
  updateSlots();
  updateHUD();
  btnDownload.disabled = true;

  const seconds = parseInt(timerSelect.value, 10);

  await runCountdown(seconds);
  await flash();
  playShutterSound();

  const photo = captureOne();
  if (photo){
    captured.push(photo);
    updateSlots();
    updateHUD();
  }

  btnDownload.disabled = captured.length !== 4;
});

// ===== Auto 4x Capture
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

  progressBox.classList.remove("hidden");
  bar.style.width = "0%";
  progressText.textContent = "Taking photos...";

  // selalu reset strip supaya bersih
  captured = [];
  updateSlots();
  btnDownload.disabled = true;
  updateHUD();

  const seconds = parseInt(timerSelect.value, 10);

  for (let i=1; i<=4; i++){
    progressText.textContent = `Photo ${i}/4`;
    bar.style.width = `${(i-1) * 25}%`;

    await runCountdown(seconds);
    await flash();
    playShutterSound();

    const photo = captureOne();
    if (photo){
      captured.push(photo);
      updateSlots();
      updateHUD();
    }

    await wait(350);
  }

  bar.style.width = "100%";
  progressText.textContent = "Done ✅";

  btnDownload.disabled = captured.length !== 4;

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

// ===== Reset
btnReset.addEventListener("click", () => {
  if (isAutoRunning) return;

  captured = [];
  updateSlots();
  updateHUD();
  btnDownload.disabled = true;
});

// ===== Download strip + theme frame
btnDownload.addEventListener("click", async () => {
  if (captured.length !== 4) return;

  const stripW = 760;
  const pad = 30;

  const photoW = stripW - pad*2;
  const photoH = Math.floor(photoW * 0.75);

  const stripH = pad + 60 + (photoH + pad)*4;

  stripCanvas.width = stripW;
  stripCanvas.height = stripH;

  // background by template
  if (currentFrame === "korean"){
    stripCtx.fillStyle = "#ffffff";
  } else if (currentFrame === "kawaii"){
    stripCtx.fillStyle = "#fff0f8";
  } else {
    stripCtx.fillStyle = "#0b1022";
  }
  stripCtx.fillRect(0,0,stripW,stripH);

  // title
  stripCtx.fillStyle = currentFrame === "neon" ? "#e5e7eb" : "#111827";
  stripCtx.font = "900 20px Arial";
  stripCtx.fillText("PHOTOBOOTH", pad, 34);

  stripCtx.font = "14px Arial";
  stripCtx.globalAlpha = 0.8;
  stripCtx.fillText(new Date().toLocaleString(), pad, 56);
  stripCtx.globalAlpha = 1;

  const imgs = captured.map(src => {
    const im = new Image();
    im.src = src;
    return im;
  });

  await Promise.all(imgs.map(im => new Promise(res => im.onload = res)));

  let y = 74;
  for (const im of imgs){
    // border highlight by template
    if (currentFrame === "neon"){
      stripCtx.fillStyle = "rgba(56,189,248,.35)";
      stripCtx.fillRect(pad-3, y-3, photoW+6, photoH+6);
    } else {
      stripCtx.fillStyle = "rgba(0,0,0,.06)";
      stripCtx.fillRect(pad-2, y-2, photoW+4, photoH+4);
    }

    stripCtx.drawImage(im, pad, y, photoW, photoH);
    y += photoH + pad;
  }

  // footer
  stripCtx.fillStyle = currentFrame === "neon" ? "#e5e7eb" : "#111827";
  stripCtx.globalAlpha = 0.85;
  stripCtx.font = "bold 14px Arial";
  stripCtx.fillText("Made by Riyan ✨", pad, stripH - 14);
  stripCtx.globalAlpha = 1;

  const a = document.createElement("a");
  a.download = "photobooth-strip.png";
  a.href = stripCanvas.toDataURL("image/png");
  a.click();
});

// init
setFrame("korean");
applyPreviewEffect();
updateSlots();
updateHUD();
