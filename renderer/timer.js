// timer.js - 圆环Canvas绘制

const canvas = document.getElementById('ringCanvas');
const ctx = canvas ? canvas.getContext('2d') : null;
const centerTime = document.getElementById('centerTime');
const centerStatus = document.getElementById('centerStatus');

const centerX = 80;
const centerY = 80;
const outerRadius = 75;
const innerRadius = 55;
const ringColor = '#D4534A';
const bgColor = '#E8E8E3';

let isRunning = false;
let isPaused = false;
let startAngle = 0;
let totalSeconds = 0;
let remainingSeconds = 0;
let elapsedSeconds = 0;

function drawRing(fillAngle) {
  if (!ctx) return;
  fillAngle = fillAngle || 0;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 背景圆环
  ctx.beginPath();
  ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
  ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2, true);
  ctx.fillStyle = bgColor;
  ctx.fill();

  // 红色弧线
  if (fillAngle > 0.01) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, startAngle, startAngle + fillAngle);
    ctx.arc(centerX, centerY, innerRadius, startAngle + fillAngle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = ringColor;
    ctx.fill();
  }
}

function drawEmptyRing() {
  drawRing(0);
}

function updateTimeDisplay() {
  if (!centerTime) return;
  const m = Math.floor(remainingSeconds / 60);
  const s = remainingSeconds % 60;
  centerTime.textContent = String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
}

function showComplete() {
  if (!centerStatus) return;
  centerStatus.textContent = '完成 ✓';
  centerStatus.style.opacity = '1';
  setTimeout(() => centerStatus.style.opacity = '0', 2000);
}

window.timerModule = {
  drawRing,
  drawEmptyRing,
  updateTimeDisplay,
  showComplete,
  getState: () => ({ isRunning, isPaused, startAngle, totalSeconds, remainingSeconds, elapsedSeconds }),
  setState: (s) => {
    if (s.isRunning !== undefined) isRunning = s.isRunning;
    if (s.isPaused !== undefined) isPaused = s.isPaused;
    if (s.startAngle !== undefined) startAngle = s.startAngle;
    if (s.totalSeconds !== undefined) totalSeconds = s.totalSeconds;
    if (s.remainingSeconds !== undefined) remainingSeconds = s.remainingSeconds;
    if (s.elapsedSeconds !== undefined) elapsedSeconds = s.elapsedSeconds;
  }
};

// 初始化
drawEmptyRing();
updateTimeDisplay();
console.log('timer.js loaded');