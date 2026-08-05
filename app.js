// Neobrutalism Mobile Delivery Packing App JS - Web Performance Optimized & PWA Offline Enabled

// Register Service Worker for 0ms Instant Cache Loading
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(err => {
      console.log('Service Worker registration skipped:', err);
    });
  });
}

// 1. Initial Preset Items Definition with Cute Emojis
const INITIAL_ITEMS = [
  // 常用类 Main Items
  { id: 'zhu_ham', name: '🐷 猪ham', category: 'main' },
  { id: 'ji_ham', name: '🐔 鸡ham', category: 'main' },
  { id: 'zhu_hotdog', name: '🌭 猪hotdog', category: 'main' },
  { id: 'bacon_large', name: '🥓 Bacon 大', category: 'main' },
  { id: 'bacon_small', name: '🥓 Bacon 小', category: 'main' },
  { id: 'bacon_round', name: '🥓 Bacon 圆', category: 'main' },
  { id: 'fish_fillet', name: '🐟 鱼扒', category: 'main' },
  { id: 'fuzhou_ball', name: '🍡 福州圆', category: 'main' },
  { id: 'hailao', name: '🦀 Hailao', category: 'main' },

  // Outside (不常用菜单 1)
  { id: 'fuzhu_juan', name: '🥢 腐竹卷', category: 'outside' },
  { id: 'chang_yubing', name: '🍥 长鱼饼', category: 'outside' },
  { id: 'taofupok', name: '🧆 TaofuPok', category: 'outside' },

  // Additional (不常用菜单 2)
  { id: 'baoyu_pian', name: '🦪 鲍鱼片', category: 'additional' },
  { id: 'cheese_hotdog', name: '🧀 Cheese Hotdog', category: 'additional' }
];

// App State
let state = {
  currentDate: getTodayString(),
  records: {}, // { "YYYY-MM-DD": { itemId: quantity } }
  customItems: [] // [ { id, name, category: 'custom' } ]
};

// LocalStorage Keys
const STORAGE_RECORDS_KEY = 'packing_delivery_records_v1';
const STORAGE_CUSTOM_KEY = 'packing_delivery_custom_v1';

// Touch Swipe Detection Variables
let touchStartX = 0;
let touchStartY = 0;

// DOM Ready Initialization
document.addEventListener('DOMContentLoaded', () => {
  loadFromLocalStorage();
  initDatePicker();
  renderAllItemGrids();
  updateSummaryAndBadges();
  renderHistoryList();
  initSwipeAndPopstateNavigation();
});

// Settings Modal Handlers
function toggleSettingsModal() {
  const modal = document.getElementById('settings-modal');
  if (modal.classList.contains('show')) {
    modal.classList.remove('show');
  } else {
    updateModalHistoryCount();
    modal.classList.add('show');
  }
}

function closeSettingsModalOnBackdrop(event) {
  if (event.target.id === 'settings-modal') {
    toggleSettingsModal();
  }
}

function updateModalHistoryCount() {
  const dateKeys = Object.keys(state.records).filter(k => {
    const counts = state.records[k] || {};
    return Object.values(counts).some(v => v > 0);
  });
  const countEl = document.getElementById('modal-history-count');
  if (countEl) countEl.innerText = dateKeys.length;
}

// Auto-save on page hide / exit so data is never lost
['visibilitychange', 'beforeunload', 'pagehide'].forEach(evt => {
  window.addEventListener(evt, () => {
    saveToLocalStorage();
  }, { passive: true });
});

// Touch Swipe & Native Popstate Navigation
function initSwipeAndPopstateNavigation() {
  const historyPanel = document.getElementById('view-history');

  // 1. Touch Swipe Gesture (Left to Right Swipe on History view)
  if (historyPanel) {
    historyPanel.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    historyPanel.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].screenX;
      const touchEndY = e.changedTouches[0].screenY;

      const deltaX = touchEndX - touchStartX;
      const deltaY = Math.abs(touchEndY - touchStartY);

      // Swiped from left to right > 60px with minimal vertical drift
      if (deltaX > 60 && deltaY < 50) {
        switchTab('active');
        showToast('⬅️ 已从侧滑返回打包记数');
      }
    }, { passive: true });
  }

  // 2. Native Mobile Back Button / Gesture handling
  window.addEventListener('popstate', (e) => {
    const isHistoryActive = historyPanel && historyPanel.classList.contains('active');
    if (isHistoryActive) {
      switchTab('active');
    }
  });
}

// Helper: Format Today Date string YYYY-MM-DD
function getTodayString() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Storage Operations
function loadFromLocalStorage() {
  try {
    const savedRecords = localStorage.getItem(STORAGE_RECORDS_KEY);
    if (savedRecords) {
      state.records = JSON.parse(savedRecords);
    }
    const savedCustom = localStorage.getItem(STORAGE_CUSTOM_KEY);
    if (savedCustom) {
      state.customItems = JSON.parse(savedCustom);
    }
  } catch (e) {
    console.error('Failed to load local storage:', e);
  }
}

function saveToLocalStorage() {
  try {
    localStorage.setItem(STORAGE_RECORDS_KEY, JSON.stringify(state.records));
    localStorage.setItem(STORAGE_CUSTOM_KEY, JSON.stringify(state.customItems));
  } catch (e) {
    console.error('Failed to save to local storage:', e);
  }
}

// Date Picker Handling
function updateDateDisplay(dateStr) {
  const parts = dateStr.split('-');
  const el_md = document.getElementById('date-display-md');
  const el_full = document.getElementById('date-display-full');
  if (el_md) el_md.textContent = `${parts[1]}/${parts[2]}`;
  if (el_full) el_full.textContent = dateStr;
}

function initDatePicker() {
  const dateInput = document.getElementById('packing-date');
  if (dateInput) dateInput.value = state.currentDate;
  updateDateDisplay(state.currentDate);
}

function onDateChanged() {
  const dateInput = document.getElementById('packing-date');
  if (dateInput && dateInput.value) {
    state.currentDate = dateInput.value;
    updateDateDisplay(state.currentDate);
    renderAllItemGrids();
    updateSummaryAndBadges();
  }
}

function changeDate(offsetDays) {
  const [y, m, d] = state.currentDate.split('-').map(Number);
  const dateObj = new Date(y, m - 1, d);
  dateObj.setDate(dateObj.getDate() + offsetDays);

  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  state.currentDate = `${year}-${month}-${day}`;

  const dateInput = document.getElementById('packing-date');
  if (dateInput) dateInput.value = state.currentDate;
  updateDateDisplay(state.currentDate);

  renderAllItemGrids();
  updateSummaryAndBadges();
}

function setTodayDate() {
  state.currentDate = getTodayString();
  const dateInput = document.getElementById('packing-date');
  if (dateInput) dateInput.value = state.currentDate;
  updateDateDisplay(state.currentDate);
  renderAllItemGrids();
  updateSummaryAndBadges();
  showToast('已跳转到今天 Date: ' + state.currentDate);
}

// Get current date's item count map
function getCurrentDateCounts() {
  if (!state.records[state.currentDate]) {
    state.records[state.currentDate] = {};
  }
  return state.records[state.currentDate];
}

// Update specific item quantity
function setItemQuantity(itemId, val) {
  const counts = getCurrentDateCounts();
  const numVal = Math.max(0, parseInt(val) || 0);

  if (numVal === 0) {
    delete counts[itemId];
  } else {
    counts[itemId] = numVal;
  }

  saveToLocalStorage();

  // Use requestAnimationFrame for 60-120 FPS UI updates
  requestAnimationFrame(() => {
    updateItemCardUI(itemId, numVal);
    updateSummaryAndBadges();
    renderHistoryList();
  });
}

function adjustQuantity(itemId, delta) {
  const counts = getCurrentDateCounts();
  const currentVal = counts[itemId] || 0;
  setItemQuantity(itemId, currentVal + delta);
}

function clearCurrentCounts() {
  if (confirm(`确定要清空 ${state.currentDate} 的所有输入数量吗？`)) {
    state.records[state.currentDate] = {};
    saveToLocalStorage();
    renderAllItemGrids();
    updateSummaryAndBadges();
    renderHistoryList();
    showToast('已清空当天的记录');
  }
}

// Render Item Cards
function getAllItemsList() {
  return [...INITIAL_ITEMS, ...state.customItems];
}

function renderAllItemGrids() {
  const counts = getCurrentDateCounts();
  const allItems = getAllItemsList();

  // Single-pass grouping instead of 4 separate filter() calls
  const groups = { main: [], outside: [], additional: [], custom: [] };
  allItems.forEach(item => {
    if (groups[item.category]) groups[item.category].push(item);
  });

  const toHTML = (items, isCustom = false) =>
    items.map(item => createItemCardHTML(item, counts[item.id] || 0, isCustom)).join('');

  document.getElementById('main-items-grid').innerHTML       = toHTML(groups.main);
  document.getElementById('outside-items-grid').innerHTML    = toHTML(groups.outside);
  document.getElementById('additional-items-grid').innerHTML = toHTML(groups.additional);
  document.getElementById('custom-items-grid').innerHTML     = toHTML(groups.custom, true);
}

function createItemCardHTML(item, count, isCustom = false) {
  const hasValue = count > 0;
  return `
    <div id="card-${item.id}" class="item-card ${hasValue ? 'has-value' : ''}">
      <div class="item-header">
        <span class="item-name">${item.name}</span>
        <div class="item-header-actions">
          ${hasValue ? `<button class="clear-single-btn" onclick="setItemQuantity('${item.id}', 0)" title="清零">清零 ✕</button>` : ''}
          ${isCustom ? `<button class="clear-single-btn btn-pink-chip" onclick="removeCustomItem('${item.id}')">删除</button>` : ''}
        </div>
      </div>

      <div class="stepper-row">
        <button class="stepper-btn btn-minus" onclick="adjustQuantity('${item.id}', -1)" type="button">-</button>
        <input 
          type="number" 
          inputmode="numeric" 
          pattern="[0-9]*" 
          min="0" 
          id="input-${item.id}" 
          class="quantity-input" 
          value="${count || ''}" 
          placeholder="0"
          onfocus="this.select()"
          oninput="setItemQuantity('${item.id}', this.value)"
        >
        <button class="stepper-btn btn-plus" onclick="adjustQuantity('${item.id}', 1)" type="button">+</button>
      </div>
    </div>
  `;
}

// UI Item Card update helper with requestAnimationFrame GPU acceleration
function updateItemCardUI(itemId, newCount) {
  const card = document.getElementById(`card-${itemId}`);
  const input = document.getElementById(`input-${itemId}`);

  if (input && input.value !== String(newCount || '')) {
    input.value = newCount || '';
  }

  if (card) {
    if (newCount > 0) {
      card.classList.add('has-value');
    } else {
      card.classList.remove('has-value');
    }

    // Trigger bump animation smoothly
    card.classList.remove('bump-anim');
    void card.offsetWidth;
    card.classList.add('bump-anim');

    // Update header actions
    const headerActions = card.querySelector('.item-header-actions');
    if (headerActions) {
      const isCustom = itemId.startsWith('custom_');
      const hasValue = newCount > 0;
      headerActions.innerHTML = `
        ${hasValue ? `<button class="clear-single-btn" onclick="setItemQuantity('${itemId}', 0)" title="清零">清零 ✕</button>` : ''}
        ${isCustom ? `<button class="clear-single-btn btn-pink-chip" onclick="removeCustomItem('${itemId}')">删除</button>` : ''}
      `;
    }
  }
}

// Summary Calculation and Badges
function updateSummaryAndBadges() {
  const counts = getCurrentDateCounts();
  const allItems = getAllItemsList();

  let outsideCount = 0;
  let additionalCount = 0;

  allItems.forEach(item => {
    const qty = counts[item.id] || 0;
    if (qty > 0) {
      if (item.category === 'outside') outsideCount += qty;
      if (item.category === 'additional' || item.category === 'custom') additionalCount += qty;
    }
  });

  // Badges on details dropdown summaries
  const outBadge = document.getElementById('outside-active-badge');
  if (outBadge) outBadge.innerText = outsideCount > 0 ? `${outsideCount}包` : '0';

  const addBadge = document.getElementById('additional-active-badge');
  if (addBadge) addBadge.innerText = additionalCount > 0 ? `${additionalCount}包` : '0';

  updateModalHistoryCount();
}

// Add / Delete Custom Items
function addCustomItem() {
  const input = document.getElementById('custom-item-name');
  const name = input.value.trim();

  if (!name) {
    showToast('请输入物品名称');
    return;
  }

  const id = 'custom_' + Date.now();
  state.customItems.push({ id, name, category: 'custom' });
  saveToLocalStorage();
  input.value = '';

  renderAllItemGrids();
  updateSummaryAndBadges();
  showToast(`已添加自定义项目: ${name}`);
}

function removeCustomItem(itemId) {
  state.customItems = state.customItems.filter(i => i.id !== itemId);
  Object.keys(state.records).forEach(dateKey => {
    delete state.records[dateKey][itemId];
  });
  saveToLocalStorage();
  renderAllItemGrids();
  updateSummaryAndBadges();
  showToast('已删除自定义项目');
}

// View / Tab Switching with History State Push
function switchTab(tabName) {
  document.querySelectorAll('.view-panel').forEach(panel => panel.classList.remove('active'));

  document.getElementById(`view-${tabName}`).classList.add('active');

  if (tabName === 'history') {
    history.pushState({ page: 'history' }, 'History', '#history');
    renderHistoryList();
  }
}

// Generate Summary text for WhatsApp sharing
function generateWhatsAppSummaryText(dateStr) {
  const counts = state.records[dateStr] || {};
  const allItems = getAllItemsList();

  const activeLines = [];
  let totalPacks = 0;

  allItems.forEach(item => {
    const qty = counts[item.id] || 0;
    if (qty > 0) {
      activeLines.push(`• ${item.name}: ${qty} 包`);
      totalPacks += qty;
    }
  });

  if (activeLines.length === 0) {
    return `📦 打包发货清单 [${dateStr}]\n(该日期暂无打包记录)`;
  }

  return [
    `📦 打包发货清单 [${dateStr}]`,
    `------------------------`,
    ...activeLines,
    `------------------------`,
    `打包种类: ${activeLines.length} 项`,
    `货物总数: ${totalPacks} 包`
  ].join('\n');
}

// Copy WhatsApp Summary to Clipboard
function copyWhatsAppSummary() {
  const text = generateWhatsAppSummaryText(state.currentDate);
  copyToClipboard(text, '已复制 WhatsApp 打包清单！');
}

function copyToClipboard(text, successMsg) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showToast(successMsg);
    }).catch(err => {
      fallbackCopyText(text, successMsg);
    });
  } else {
    fallbackCopyText(text, successMsg);
  }
}

function fallbackCopyText(text, successMsg) {
  const textArea = document.createElement('textarea');
  textArea.value = text;
  document.body.appendChild(textArea);
  textArea.select();
  try {
    document.execCommand('copy');
    showToast(successMsg);
  } catch (err) {
    showToast('复制失败，请手动截图或复制');
  }
  document.body.removeChild(textArea);
}

// Toast notification helper
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.innerText = msg;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 2500);
}

// History List Rendering
function renderHistoryList(filterDate = null) {
  const container = document.getElementById('history-list-container');
  const allItems = getAllItemsList();
  const dateKeys = Object.keys(state.records).sort().reverse();

  updateModalHistoryCount();

  let filteredKeys = dateKeys;
  if (filterDate) {
    filteredKeys = dateKeys.filter(k => k === filterDate);
  }

  if (filteredKeys.length === 0) {
    container.innerHTML = `
      <div class="empty-history">
        <p>📱 暂无该日期的历史记录</p>
        <p style="font-size:0.8rem; font-weight:600; margin-top:4px;">在“打包记数”页面输入数量后会自动保存记录。</p>
      </div>
    `;
    return;
  }

  container.innerHTML = filteredKeys.map(dateKey => {
    const counts = state.records[dateKey];
    const tagsHTML = [];
    let dayTotal = 0;

    allItems.forEach(item => {
      const qty = counts[item.id] || 0;
      if (qty > 0) {
        tagsHTML.push(`<span class="history-tag">${item.name}: ${qty}</span>`);
        dayTotal += qty;
      }
    });

    if (tagsHTML.length === 0) {
      return ''; // skip empty dates
    }

    return `
      <div class="history-card">
        <div class="history-header">
          <span class="history-date">🗓️ ${dateKey}</span>
          <span class="badge badge-black">共 ${dayTotal} 包</span>
        </div>
        <div class="history-items-list">
          ${tagsHTML.join('')}
        </div>
        <div class="history-actions">
          <button class="neo-btn sm btn-cyan flex-1" onclick="jumpToDate('${dateKey}')">✏️ 编辑该日记录</button>
          <button class="neo-btn sm btn-green flex-1" onclick="copyHistoryDate('${dateKey}')">📋 复制发货文字</button>
          <button class="neo-btn sm btn-pink" onclick="deleteHistoryDate('${dateKey}')">🗑️</button>
        </div>
      </div>
    `;
  }).join('');
}

function jumpToDate(dateStr) {
  state.currentDate = dateStr;
  const dateInput = document.getElementById('packing-date');
  if (dateInput) dateInput.value = dateStr;
  updateDateDisplay(dateStr);
  switchTab('active');
  renderAllItemGrids();
  updateSummaryAndBadges();
  showToast(`已切换至 ${dateStr}`);
}

function copyHistoryDate(dateStr) {
  const text = generateWhatsAppSummaryText(dateStr);
  copyToClipboard(text, `已复制 ${dateStr} 发货清单`);
}

function deleteHistoryDate(dateStr) {
  if (confirm(`确定要删除 ${dateStr} 的历史记录吗？`)) {
    delete state.records[dateStr];
    saveToLocalStorage();
    renderHistoryList();
    if (state.currentDate === dateStr) {
      renderAllItemGrids();
      updateSummaryAndBadges();
    }
    showToast(`已删除 ${dateStr} 记录`);
  }
}

function filterHistoryByDate() {
  const filterInput = document.getElementById('history-filter-date');
  renderHistoryList(filterInput.value || null);
}

function resetHistoryFilter() {
  document.getElementById('history-filter-date').value = '';
  renderHistoryList();
}
