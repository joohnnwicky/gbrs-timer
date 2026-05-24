// timer.js - 圆环Canvas绘制与动画

const canvas = document.getElementById('ringCanvas');
const ctx = canvas.getContext('2d');
const centerTime = document.getElementById('centerTime');
const centerStatus = document.getElementById('centerStatus');

// 圆环参数
const centerX = 80;
const centerY = 80;
const outerRadius = 75;
const innerRadius = 55;
const ringWidth = outerRadius - innerRadius;
const ringColor = '#D4534A';
const bgColor = '#E8E8E3';

// 状态
let isRunning = false;
let isPaused = false;
let startAngle = 0; // 点击位置对应的角度（弧度）
let totalSeconds = 3600; // 60分钟 = 3600秒
let remainingSeconds = 0;
let elapsedSeconds = 0;

/**
 * 绘制圆环
 * @param {number} fillAngle - 填充弧度（从startAngle开始，顺时针）
 */
function drawRing(fillAngle = 0) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 绘制背景圆环（灰色轨道）
  ctx.beginPath();
  ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
  ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2, true);
  ctx.fillStyle = bgColor;
  ctx.fill();

  // 绘制填充弧线（红色）
  if (fillAngle > 0) {
    const endAngle = startAngle + fillAngle;

    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, startAngle, endAngle);
    ctx.arc(centerX, centerY, innerRadius, endAngle, startAngle, true);
    ctx.closePath();
    ctx.fillStyle = ringColor;
    ctx.fill();
  }
}

/**
 * 绘制空心圆环（初始状态）
 */
function drawEmptyRing() {
  drawRing(0);
}

/**
 * 更新时间显示
 */
function updateTimeDisplay() {
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  centerTime.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * 显示完成状态
 */
function showComplete() {
  centerStatus.textContent = '完成 ✓';
  centerStatus.style.opacity = '1';
  setTimeout(() => {
    centerStatus.style.opacity = '0';
  }, 2000);
}

// 导出函数供其他模块使用
window.timerModule = {
  drawRing,
  drawEmptyRing,
  updateTimeDisplay,
  showComplete,
  getState: () => ({ isRunning, isPaused, startAngle, totalSeconds, remainingSeconds, elapsedSeconds }),
  setState: (state) => {
    if (state.isRunning !== undefined) isRunning = state.isRunning;
    if (state.isPaused !== undefined) isPaused = state.isPaused;
    if (state.startAngle !== undefined) startAngle = state.startAngle;
    if (state.totalSeconds !== undefined) totalSeconds = state.totalSeconds;
    if (state.remainingSeconds !== undefined) remainingSeconds = state.remainingSeconds;
    if (state.elapsedSeconds !== undefined) elapsedSeconds = state.elapsedSeconds;
  },
  getCanvas: () => canvas
};

// 初始化：绘制空心圆环
if (canvas && ctx) {
  drawEmptyRing();
  updateTimeDisplay();
}