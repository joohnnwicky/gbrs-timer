// interaction.js - 点击交互与计时器控制

// 从 window 获取 timerModule
const timerModule = window.timerModule;

// DOM 元素
const canvas = document.getElementById('ringCanvas');
const pauseBtn = document.getElementById('pauseBtn');
const resetBtn = document.getElementById('resetBtn');
const historyBtn = document.getElementById('historyBtn');
const closeBtn = document.getElementById('closeBtn');

// setInterval 引用
let timerInterval = null;

/**
 * 计算点击位置相对于圆环中心的角度
 * @param {MouseEvent} event - 点击事件
 * @returns {number} 角度（弧度），顶部为0，顺时针增加
 */
function calculateAngle(event) {
  const rect = canvas.getBoundingClientRect();
  const x = event.clientX - rect.left - 80; // centerX = 80
  const y = event.clientY - rect.top - 80;  // centerY = 80
  // Math.atan2(x, -y) 使顶部为0，顺时针为正
  let angle = Math.atan2(x, -y);
  if (angle < 0) {
    angle += 2 * Math.PI;
  }
  return angle;
}

/**
 * 将角度转换为分钟数（0-60）
 * @param {number} angle - 角度（弧度）
 * @returns {number} 分钟数
 */
function angleToMinutes(angle) {
  return Math.round((angle / (2 * Math.PI)) * 60);
}

/**
 * 启动计时器
 * @param {number} clickAngle - 点击位置的角度
 */
function startTimer(clickAngle) {
  const state = timerModule.getState();

  // 如果已经在运行且未暂停，则忽略
  if (state.isRunning && !state.isPaused) {
    return;
  }

  // 设置状态
  timerModule.setState({
    startAngle: clickAngle,
    isRunning: true,
    isPaused: false,
    totalSeconds: 3600,
    remainingSeconds: 3600,
    elapsedSeconds: 0
  });

  // 绘制完整圆环
  timerModule.drawRing(2 * Math.PI);

  // 更新时间显示
  timerModule.updateTimeDisplay();

  // 启动定时器
  timerInterval = setInterval(tick, 1000);

  // 重置暂停按钮
  resetPauseButton();
}

/**
 * 计时器滴答函数
 */
function tick() {
  const state = timerModule.getState();

  // 如果暂停，直接返回
  if (state.isPaused) {
    return;
  }

  // 更新时间
  const newRemaining = state.remainingSeconds - 1;
  const newElapsed = state.elapsedSeconds + 1;
  timerModule.setState({
    remainingSeconds: newRemaining,
    elapsedSeconds: newElapsed
  });

  // 更新显示
  timerModule.updateTimeDisplay();

  // 计算填充角度
  const fillAngle = (newRemaining / state.totalSeconds) * 2 * Math.PI;

  // 绘制圆环
  timerModule.drawRing(fillAngle);

  // 如果时间到，完成计时器
  if (newRemaining <= 0) {
    completeTimer();
  }
}

/**
 * 完成计时器
 */
function completeTimer() {
  // 清除定时器
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  // 重置状态
  timerModule.setState({
    isRunning: false,
    isPaused: false,
    remainingSeconds: 0
  });

  // 绘制空心圆环
  timerModule.drawEmptyRing();

  // 显示完成
  timerModule.showComplete();

  // 播放提示音
  async function playCompleteSound() {
    const settings = await window.storageModule.getSettings();
    if (settings.soundEnabled) {
      try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.5);

        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);

        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.5);
      } catch (e) {
        console.log('Sound generation failed:', e);
      }
    }
  }
  playCompleteSound();

  // 添加记录并更新累计显示
  if (window.storageModule) {
    const state = timerModule.getState();
    window.storageModule.addSession(state.elapsedSeconds, state.startAngle);
    window.storageModule.updateTotalDisplay();
  }

  // 重置暂停按钮
  resetPauseButton();
}

/**
 * 切换暂停状态
 */
function togglePause() {
  const state = timerModule.getState();

  if (!state.isRunning) {
    return;
  }

  const newPaused = !state.isPaused;
  timerModule.setState({ isPaused: newPaused });

  // 更新暂停按钮
  pauseBtn.textContent = newPaused ? '继续' : '暂停';
  pauseBtn.classList.toggle('active', newPaused);
}

/**
 * 重置计时器
 */
function resetTimer() {
  // 清除定时器
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  // 重置状态
  timerModule.setState({
    isRunning: false,
    isPaused: false,
    totalSeconds: 3600,
    remainingSeconds: 0,
    elapsedSeconds: 0
  });

  // 绘制空心圆环
  timerModule.drawEmptyRing();

  // 更新时间显示
  timerModule.updateTimeDisplay();

  // 重置暂停按钮
  resetPauseButton();
}

/**
 * 重置暂停按钮状态
 */
function resetPauseButton() {
  pauseBtn.textContent = '暂停';
  pauseBtn.classList.remove('active');
}

// 事件绑定
if (canvas) {
  canvas.addEventListener('click', (event) => {
    const angle = calculateAngle(event);
    const minutes = angleToMinutes(angle);
    console.log(`Clicked at ${minutes} minutes (angle: ${(angle * 180 / Math.PI).toFixed(1)}deg)`);
    startTimer(angle);
  });
}

if (pauseBtn) {
  pauseBtn.addEventListener('click', togglePause);
}

if (resetBtn) {
  resetBtn.addEventListener('click', resetTimer);
}

if (historyBtn) {
  historyBtn.addEventListener('click', () => {
    window.electronAPI.openHistory();
  });
}

if (closeBtn) {
  closeBtn.addEventListener('click', () => {
    window.electronAPI.closeWindow();
  });
}

// 导出函数供其他模块使用
window.interactionModule = {
  calculateAngle,
  angleToMinutes,
  startTimer,
  togglePause,
  resetTimer
};