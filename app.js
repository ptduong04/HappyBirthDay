// ====== CONFIG ======
const EVENT_TITLE = "Sinh nhật Phạm Việt Anh";
const HOST_NAME = "Phạm Việt Anh";
const EVENT_TIME_STR = "2025-10-10T00:00:00+07:00"; // Giờ VN
const VIDEO_SRC = "video/7096043316652.mp4";
const VIDEO_POSTER = "Ảnh/1.jpg";

// ====== Header bindings ======
document.getElementById('guestName').textContent =
  `Happy Birthday, ${HOST_NAME.split(' ')[HOST_NAME.split(' ').length-1]}! ✨`;
const dateFmt = new Date(EVENT_TIME_STR).toLocaleString('vi-VN',
  {hour:'2-digit', minute:'2-digit', day:'2-digit', month:'2-digit', year:'numeric'});
document.getElementById('partyTimeText').textContent = dateFmt;

// ====== Countdown ======
const ids = {d:'d',h:'h',m:'m',s:'s'};
function tick(){
  const now = new Date();
  const target = new Date(EVENT_TIME_STR);
  const diff = Math.max(0, target - now);
  const sec = Math.floor(diff/1000);
  const d = Math.floor(sec/86400);
  const h = Math.floor((sec%86400)/3600);
  const m = Math.floor((sec%3600)/60);
  const s = sec%60;
  document.getElementById(ids.d).textContent = String(d).padStart(2,'0');
  document.getElementById(ids.h).textContent = String(h).padStart(2,'0');
  document.getElementById(ids.m).textContent = String(m).padStart(2,'0');
  document.getElementById(ids.s).textContent = String(s).padStart(2,'0');
}
tick(); setInterval(tick, 1000);

// ====== Share ======
document.getElementById('btnShare').addEventListener('click', async () => {
  const text = `Gửi thiệp chúc mừng ${EVENT_TITLE} – chúc bạn một ngày thật rực rỡ!`;
  try{
    if(navigator.share){
      await navigator.share({title: EVENT_TITLE, text, url: location.href});
    }else{
      await navigator.clipboard.writeText(`${text} ${location.href}`);
      alert('Đã sao chép thiệp vào clipboard!');
    }
  }catch(e){console.log(e)}
});

// ====== Confetti ======
const canvas = document.getElementById('confetti');
const ctx = canvas.getContext('2d');
let W, H; function resize(){W=canvas.width=innerWidth; H=canvas.height=innerHeight}
resize(); addEventListener('resize', resize);
let confs=[];
function add(n=120){for(let i=0;i<n;i++){confs.push({
  x:Math.random()*W,y:-20*Math.random(),r:4+Math.random()*6,
  c:`hsl(${Math.random()*360},90%,60%)`,vY:2+Math.random()*3,
  vX:-1+Math.random()*2,rot:Math.random()*360})}}
function step(){
  ctx.clearRect(0,0,W,H);
  confs = confs.filter(p=>p.y<H+20);
  for(const p of confs){
    p.x+=p.vX; p.y+=p.vY; p.rot+=p.vX*6;
    ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.rot*Math.PI/180);
    ctx.fillStyle=p.c; ctx.fillRect(-p.r/1.2,-p.r,p.r,p.r*1.8); ctx.restore();
  }
  requestAnimationFrame(step)
}
step();
function blast(){add(160)}
document.getElementById('btnConfetti').addEventListener('click', blast);
setTimeout(blast, 600);
setInterval(() => {
  blast();
}, 6000);

if(window.DeviceMotionEvent){
  let lastY=0; window.addEventListener('devicemotion',e=>{
    const y=e.accelerationIncludingGravity?.y||0;
    if(Math.abs(y-lastY)>14){blast()}
    lastY=y
  },{passive:true});
}

// ====== Music toggle ======
const bgm = document.getElementById('bgm'); const btnMusic = document.getElementById('btnMusic');
let playing = false;
function updateMusicButton(){
  btnMusic.textContent = playing ? '🔈 Tắt nhạc' : '🔊 Bật nhạc';
}
if(bgm){
  bgm.addEventListener('ended', ()=> { playing=false; updateMusicButton(); });
}
btnMusic.addEventListener('click', async ()=>{
  try{
    if(!playing){ await bgm.play(); playing = true; }
    else { bgm.pause(); playing = false; }
    updateMusicButton();
  }catch(e){
    alert('Trình duyệt chặn auto-play, hãy nhấn vào trang hoặc nút Bật nhạc để phát.');
  }
});
// setTimeout(async ()=>{ try{ await bgm.play(); playing=true; updateMusicButton(); } catch(_){} }, 200);
// ====== Auto play music ======
async function tryAutoplayBGM(){
  try {
    await bgm.play();
    playing = true;
    updateMusicButton();
  } catch(e) {
    console.log("Autoplay blocked, will play on first click", e);
    const unlock = async () => {
      try {
        await bgm.play();
        playing = true;
        updateMusicButton();
      } catch(_) {}
      window.removeEventListener("click", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
    // Khi người dùng tương tác lần đầu → bật nhạc ngay
    window.addEventListener("click", unlock, { once:true });
    window.addEventListener("keydown", unlock, { once:true });
    window.addEventListener("touchstart", unlock, { once:true });
  }
}
// Gọi thử sau 300ms khi trang load
setTimeout(tryAutoplayBGM, 300);

// ====== Video (Poster + Big Play + Exit) ======
const video = document.getElementById('giftVideo');
const source = document.getElementById('videoSource');
const poster = document.getElementById('poster');
const overlay = document.getElementById('overlay');
const exitBtn = document.getElementById('btnExitVideo');
const videoModal = document.getElementById('videoModal');
const modalVideo = document.getElementById('modalVideo');
const modalClose = document.getElementById('modalClose');

// set src & poster
source.src = VIDEO_SRC;
video.setAttribute('poster', VIDEO_POSTER);

// Close modal button
modalClose && modalClose.addEventListener('click', ()=>{
  try{ modalVideo.pause(); modalVideo.currentTime=0; }catch(_){}
  videoModal.style.display='none';
  showPoster();
});

// Inline show/hide helpers
function showVideo(){
  overlay.style.display='none';
  poster.style.display='none';
  video.style.display='block';
  exitBtn.style.display='inline-flex';
}
function showPoster(){
  try{ video.pause(); video.currentTime=0; }catch(_){}
  video.style.display='none';
  poster.style.display='block';
  overlay.style.display='grid';
  exitBtn.style.display='none';
}

// Play handler: ưu tiên modal, fallback inline
async function playVideo(){
  try{
    if(!videoModal || !modalVideo) throw new Error('no modal present');
    videoModal.style.display='grid';
    modalVideo.src = source.src || VIDEO_SRC;
    try{ modalVideo.load(); }catch(_){}
    await modalVideo.play();
  }catch(e){
    // fallback inline
    showVideo();
    try{ video.load(); await video.play(); }catch(err){ console.log('Inline play failed', err); }
  }
}

overlay.addEventListener('click', playVideo);
document.getElementById('btnPlayBig').addEventListener('click', playVideo);
exitBtn.addEventListener('click', showPoster);
video.addEventListener('ended', showPoster);

// Click lên video inline -> thu nhỏ
video.addEventListener('click', ()=>{
  if(!video.paused && video.style.display!=='none'){ showPoster(); }
});

// Modal backdrop click -> đóng
if(videoModal){
  videoModal.addEventListener('click', (e)=>{
    if(e.target===videoModal){
      try{ modalVideo.pause(); modalVideo.currentTime=0; }catch(_){}
      videoModal.style.display='none';
      showPoster();
    }
  });
}

// Esc -> đóng/thu nhỏ
document.addEventListener('keydown', (e)=>{
  if(e.key==='Escape'){
    if(videoModal && videoModal.style.display==='grid'){
      try{ modalVideo.pause(); modalVideo.currentTime=0; }catch(_){}
      videoModal.style.display='none';
    }
    showPoster();
  }
});
/* === BLING BLING: Fireworks & Sparkles === */
const COLORS = ['#a78bfa','#22d3ee','#f472b6','#34d399','#f59e0b','#60a5fa'];

function rand(min,max){return Math.random()*(max-min)+min}
function pick(arr){return arr[Math.floor(Math.random()*arr.length)]}

// Mảng hạt hiệu ứng bổ sung (dùng chung canvas confetti)
let fx = [];

// Tạo pháo hoa tại vị trí (x,y)
function fireworks(x,y, count=28){
  for(let i=0;i<count;i++){
    const a = Math.random()*Math.PI*2;
    const v = rand(2.5,5.2);
    fx.push({
      x, y, vx:Math.cos(a)*v, vy:Math.sin(a)*v,
      life:rand(30,55), r:rand(2,4), c:pick(COLORS)
    });
  }
}

// Vệt lấp lánh khi rê chuột
let lastSparkle = 0;
function sparkles(x,y){
  const now = performance.now();
  if(now - lastSparkle < 22) return; // throttle ~45fps
  lastSparkle = now;
  for(let i=0;i<3;i++){
    fx.push({
      x: x+rand(-6,6), y: y+rand(-6,6),
      vx: rand(-.6,.6), vy: rand(-.6,.4),
      life: rand(12,20), r: rand(1.5,2.2), c: pick(COLORS)
    });
  }
}

// Hook vào vòng vẽ hiện có (step) bằng cách “bọc” lại hàm ctx vẽ hạt phụ
(function hookEffects(){
  const _step = step; // step() đang chạy vòng vẽ confetti của bạn
  window.step = function(){
    // vẽ hệ hạt fx
    ctx.save();
    // update & draw
    for(let i=fx.length-1;i>=0;i--){
      const p = fx[i];
      p.x += p.vx; p.y += p.vy;
      p.vy += 0.05; // nhẹ trọng lực
      p.life--;
      if(p.life<=0 || p.y > H+40){ fx.splice(i,1); continue; }
      ctx.globalAlpha = Math.max(0, p.life/55);
      ctx.fillStyle = p.c;
      ctx.beginPath(); ctx.arc(p.x,p.y,p.r,0,Math.PI*2); ctx.fill();
    }
    ctx.restore();
    // chạy step gốc để vẽ confetti
    _step();
  };
})();

// Sự kiện người dùng
document.addEventListener('click', (e)=>{
  // tránh khi click vào nút điều khiển video → chỉ bắn pháo hoa nếu click nền
  const tag = (e.target.tagName||'').toLowerCase();
  if(['button','a','video','input','textarea'].includes(tag)) return;
  fireworks(e.clientX, e.clientY);
});
document.addEventListener('mousemove', (e)=> sparkles(e.clientX, e.clientY));

// Auto pháo hoa khi vừa mở trang cho vui
setTimeout(()=>fireworks(innerWidth*0.7, innerHeight*0.25, 34), 900);
/* === BLING BLING: Balloons === */
const balloonsLayer = document.getElementById('balloons');
function createBalloon(){
  if(!balloonsLayer) return;
  const b = document.createElement('div');
  b.className = 'balloon';
  const hue = Math.floor(rand(0,360));
  b.style.background = `radial-gradient(60% 60% at 40% 35%, rgba(255,255,255,.6), rgba(255,255,255,.05) 60%), hsl(${hue} 90% 60%)`;
  b.style.left = `${rand(-5, 95)}%`;
  b.style.animationDuration = `${rand(8,14)}s`;
  b.style.filter = 'saturate(1.1)';
  balloonsLayer.appendChild(b);
  // tự xoá khi bay xong
  const ttl = parseFloat(b.style.animationDuration)*1000 + 500;
  setTimeout(()=> b.remove(), ttl);
}
setInterval(()=>{
  if(!balloonsLayer) return;
  const current = balloonsLayer.querySelectorAll('.balloon').length;
  if(current < 20){ // tối đa hiển thị 25 quả
    for(let i=0; i<3; i++) createBalloon();
    // ngẫu nhiên thêm 1–2 quả nữa cho sinh động
    if(Math.random() < 0.7) createBalloon();
    if(Math.random() < 0.5) createBalloon();
  }
}, 2000);
/* === Falling Congrat Text (ít hơn bóng bay) === */
const MESSAGE_STR = "Chúc mừng sinh nhật anh zai";

function createFallingText(){
  if(!balloonsLayer) return;
  const el = document.createElement('div');
  el.className = 'falltext';
  el.textContent = MESSAGE_STR;

  // Vị trí & style ngẫu nhiên nhẹ
  el.style.left = `${rand(8, 75)}%`;
  el.style.fontSize = `${Math.floor(rand(18, 26))}px`;
  el.style.animationDuration = `${rand(7, 11)}s`;

  balloonsLayer.appendChild(el);

  // Tự xoá sau khi rơi xong
  const ttl = parseFloat(el.style.animationDuration) * 1000 + 800;
  setTimeout(()=> el.remove(), ttl);
}

// Thả chữ ít hơn bóng bay: ~mỗi 6–10s, tỉ lệ 40%, tối đa 3 dòng cùng lúc
setInterval(()=>{
  if(!balloonsLayer) return;
  const current = balloonsLayer.querySelectorAll('.falltext').length;
  if(current < 3 && Math.random() < 0.4){
    createFallingText();
  }
  // (tuỳ chọn) thỉnh thoảng thả 2 dòng sát nhau
  if(current < 3 && Math.random() < 0.12){
    setTimeout(createFallingText, 600);
  }
}, Math.floor(rand(6000, 10000)));

// (tuỳ chọn) Rơi chữ lúc mở trang cho vui
setTimeout(()=> createFallingText(), 1500);
