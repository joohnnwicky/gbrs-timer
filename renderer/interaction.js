// interaction.js

let timerInterval = null;
let currentAudio = null;

function handleClick(event) {
  const canvas = document.getElementById('ringCanvas');
  const rect = canvas.getBoundingClientRect();

  // 点击位置相对于圆心
  const x = event.clientX - rect.left - 80;
  const y = event.clientY - rect.top - 80;

  // Canvas角度：右侧=0，顺时针增加
  // atan2(y, x) 给出标准角度
  let angle = Math.atan2(y, x);

  console.log('Click at canvas angle:', angle, 'degrees:', angle * 180 / Math.PI);

  // 计算从点击位置顺时针到顶部(-90度)的弧长
  // 顶部在Canvas中是 -π/2
  const topAngle = -Math.PI / 2;

  // 从点击位置顺时针到顶部的弧度
  let arcToTop = topAngle - angle;
  if (arcToTop <= 0) {
    arcToTop += 2 * Math.PI;
  }

  // 弧度转分钟
  const minutes = Math.round((arcToTop / (2 * Math.PI)) * 60);
  const seconds = minutes * 60;

  console.log('Minutes:', minutes, 'Seconds:', seconds);

  if (seconds < 60) {
    console.log('Too short, skip');
    return;
  }

  const tm = window.timerModule;
  if (!tm) {
    console.error('timerModule missing');
    return;
  }

  // 停止之前的计时器
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  // 设置状态
  tm.setState({
    startAngle: angle,
    totalSeconds: seconds,
    remainingSeconds: seconds,
    elapsedSeconds: 0,
    isRunning: true,
    isPaused: false
  });

  // 绘制弧线
  tm.drawRing(arcToTop);
  tm.updateTimeDisplay();

  // 开始倒计时
  timerInterval = setInterval(() => {
    const state = tm.getState();
    if (state.isPaused) return;

    const newRem = state.remainingSeconds - 1;
    tm.setState({ remainingSeconds: newRem, elapsedSeconds: state.elapsedSeconds + 1 });
    tm.updateTimeDisplay();

    // 计算剩余弧度
    const ratio = newRem / state.totalSeconds;
    tm.drawRing(ratio * arcToTop);

    if (newRem <= 0) {
      clearInterval(timerInterval);
      timerInterval = null;
      tm.setState({ isRunning: false, remainingSeconds: 0 });
      tm.drawEmptyRing();
      tm.showComplete();
      playSound();

      if (window.storageModule) {
        window.storageModule.addSession(state.elapsedSeconds, angle);
        window.storageModule.updateTotalDisplay();
      }
    }
  }, 1000);

  // 重置按钮
  const pauseBtn = document.getElementById('pauseBtn');
  if (pauseBtn) {
    pauseBtn.textContent = '暂停';
    pauseBtn.classList.remove('active');
  }
}

function handlePause() {
  const tm = window.timerModule;
  if (!tm) return;
  const state = tm.getState();
  if (!state.isRunning) return;

  const newPaused = !state.isPaused;
  tm.setState({ isPaused: newPaused });

  const pauseBtn = document.getElementById('pauseBtn');
  if (pauseBtn) {
    pauseBtn.textContent = newPaused ? '继续' : '暂停';
    pauseBtn.classList.toggle('active', newPaused);
  }
}

function handleReset() {
  // 停止音频
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }

  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  const tm = window.timerModule;
  if (!tm) return;

  tm.setState({
    isRunning: false,
    isPaused: false,
    remainingSeconds: 0,
    elapsedSeconds: 0,
    totalSeconds: 0
  });
  tm.drawEmptyRing();
  tm.updateTimeDisplay();

  const pauseBtn = document.getElementById('pauseBtn');
  if (pauseBtn) {
    pauseBtn.textContent = '暂停';
    pauseBtn.classList.remove('active');
  }
}

async function handleSelectSound() {
  if (!window.electronAPI) return;

  const filePath = await window.electronAPI.selectSoundFile();
  if (filePath) {
    console.log('Sound file selected:', filePath);
    const soundBtn = document.getElementById('soundBtn');
    if (soundBtn) {
      soundBtn.textContent = '已设置';
    }
  }
}

async function playSound() {
  try {
    const settings = await (window.storageModule?.getSettings?.() || { soundEnabled: true });
    const soundFile = settings.soundFile;

    if (soundFile && settings.soundEnabled) {
      // 使用自定义mp3文件
      currentAudio = new Audio('file:///' + soundFile.replace(/\\/g, '/'));
      currentAudio.volume = 1.0;
      currentAudio.play().catch(e => {
        console.log('Custom audio failed, using default:', e);
        currentAudio = null;
        playDefaultSound();
      });
    } else if (settings.soundEnabled) {
      playDefaultSound();
    }
  } catch (e) {
    console.log('Sound failed:', e);
  }
}

function playDefaultSound() {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, audioCtx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(400, audioCtx.currentTime + 0.5);
  gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
  osc.start(audioCtx.currentTime);
  osc.stop(audioCtx.currentTime + 0.5);
}

// 初始化事件
function init() {
  const canvas = document.getElementById('ringCanvas');
  const pauseBtn = document.getElementById('pauseBtn');
  const resetBtn = document.getElementById('resetBtn');
  const historyBtn = document.getElementById('historyBtn');
  const closeBtn = document.getElementById('closeBtn');
  const soundBtn = document.getElementById('soundBtn');

  if (canvas) {
    canvas.addEventListener('click', handleClick);
    console.log('Canvas click bound');
  } else {
    console.error('Canvas not found');
  }

  if (pauseBtn) pauseBtn.addEventListener('click', handlePause);
  if (resetBtn) resetBtn.addEventListener('click', handleReset);
  if (historyBtn) historyBtn.addEventListener('click', () => window.electronAPI && window.electronAPI.openHistory());
  if (closeBtn) closeBtn.addEventListener('click', () => window.electronAPI && window.electronAPI.closeWindow());
  if (soundBtn) soundBtn.addEventListener('click', handleSelectSound);
}

init();
console.log('interaction.js loaded');