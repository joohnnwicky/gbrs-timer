// history.js - 历史记录窗口逻辑

/**
 * 格式化日期显示
 * @param {string} dateStr - YYYY-MM-DD 格式的日期字符串
 * @returns {string} "X月X日 周X" 格式
 */
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weekDays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekDay = weekDays[date.getDay()];
  return `${month}月${day}日 ${weekDay}`;
}

/**
 * 渲染历史记录列表
 */
async function renderHistory() {
  const historyList = document.getElementById('historyList');
  const records = await window.storageModule.getAllRecords();

  if (!records || records.length === 0) {
    historyList.innerHTML = '<div class="empty-message">暂无记录</div>';
    return;
  }

  historyList.innerHTML = records.map((record, index) => `
    <div class="history-item" data-index="${index}">
      <div class="history-item-header">
        <div>
          <div class="history-date">${formatDate(record.date)}</div>
          <div class="history-summary">${record.sessions.length} 个番茄钟</div>
        </div>
        <div class="history-total">${record.totalMinutes}分钟</div>
      </div>
      <div class="history-detail" id="detail-${index}">
        ${record.sessions.map(session => `
          <div class="session-item">
            <span class="session-time">${session.startTime}</span>
            <span>${session.duration}分钟</span>
          </div>
        `).join('')}
      </div>
    </div>
  `).join('');

  // 绑定点击事件
  document.querySelectorAll('.history-item').forEach(item => {
    item.addEventListener('click', () => {
      const index = item.dataset.index;
      const detail = document.getElementById(`detail-${index}`);
      detail.classList.toggle('expanded');
    });
  });
}

// 初始化
renderHistory();