// storage.js - 本地数据存储模块

/**
 * 获取今天的日期字符串
 * @returns {string} YYYY-MM-DD 格式
 */
function getTodayDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * 获取当前时间字符串
 * @returns {string} HH:MM 格式
 */
function getCurrentTime() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * 获取所有记录
 * @returns {Promise<Array>} 记录数组
 */
async function getAllRecords() {
  const records = await window.electronAPI.store.get('records');
  return records || [];
}

/**
 * 获取今天的记录
 * @returns {Promise<Object|null>} 今天的记录或null
 */
async function getTodayRecord() {
  const records = await getAllRecords();
  const today = getTodayDate();
  return records.find(record => record.date === today) || null;
}

/**
 * 添加一个番茄钟会话记录
 * @param {number} durationSeconds - 时长（秒）
 * @param {number} startAngle - 起始角度（弧度）
 */
async function addSession(durationSeconds, startAngle) {
  const records = await getAllRecords();
  const today = getTodayDate();
  const startTime = getCurrentTime();
  const durationMinutes = Math.round(durationSeconds / 60);
  const startAngleDegrees = Math.round(startAngle * 180 / Math.PI);

  // 查找或创建今天的记录
  let todayRecord = records.find(record => record.date === today);
  if (!todayRecord) {
    todayRecord = {
      date: today,
      sessions: [],
      totalMinutes: 0
    };
    records.push(todayRecord);
  }

  // 添加会话
  todayRecord.sessions.push({
    startTime,
    duration: durationMinutes,
    startAngle: startAngleDegrees
  });

  // 更新总时长
  todayRecord.totalMinutes += durationMinutes;

  // 按日期降序排序
  records.sort((a, b) => b.date.localeCompare(a.date));

  // 保存到 store
  await window.electronAPI.store.set('records', records);
}

/**
 * 更新累计时长显示
 */
async function updateTotalDisplay() {
  const todayRecord = await getTodayRecord();
  const totalMinutes = todayRecord ? todayRecord.totalMinutes : 0;
  const totalElement = document.getElementById('totalMinutes');
  if (totalElement) {
    totalElement.textContent = totalMinutes;
  }
}

/**
 * 获取设置
 * @returns {Promise<Object>} 设置对象
 */
async function getSettings() {
  const settings = await window.electronAPI.store.get('settings');
  return {
    soundEnabled: settings?.soundEnabled !== undefined ? settings.soundEnabled : true,
    soundType: settings?.soundType || 'soft-bell'
  };
}

/**
 * 保存设置
 * @param {Object} settings - 设置对象
 */
async function saveSettings(settings) {
  await window.electronAPI.store.set('settings', settings);
}

// 导出到 window
window.storageModule = {
  getTodayDate,
  getCurrentTime,
  getAllRecords,
  getTodayRecord,
  addSession,
  updateTotalDisplay,
  getSettings,
  saveSettings
};

// 初始化时更新累计显示
updateTotalDisplay();