/**
 * CarbonLens – App Logic
 * Depends on utils.js being loaded first.
 */

'use strict';

// ── STATE ──
const appState = {
  lastScore: 0,
  currentData: {},
  chatHistory: []
};

// ── RATE LIMITER (client-side) ──
const rateLimiter = (() => {
  let count = 0, windowStart = Date.now();
  return {
    allowed() {
      const now = Date.now();
      if (now - windowStart > 60000) { count = 0; windowStart = now; }
      return ++count <= 15;
    }
  };
})();

// ── DOM HELPERS ──
function $(id) { return document.getElementById(id); }

function setAria(el, attr, val) { if (el) el.setAttribute(attr, val); }

function escapeHtml(str) {
  const d = document.createElement('div');
  d.appendChild(document.createTextNode(String(str)));
  return d.innerHTML;
}

// ── VALIDATION ──
function validateField(inputEl, errorEl, condition, msg) {
  if (condition) {
    setAria(inputEl, 'aria-invalid', 'true');
    if (errorEl) { errorEl.textContent = msg; errorEl.style.display = 'block'; }
    return false;
  }
  setAria(inputEl, 'aria-invalid', 'false');
  if (errorEl) errorEl.style.display = 'none';
  return true;
}

// ── CALCULATE ──
function calculate() {
  const vehicleType = $('vehicleType').value;
  const km = parseFloat($('kmTravel').value) || 0;
  const dietType = $('dietType').value;
  const meals = parseFloat($('meals').value) || 3;
  const electricity = parseFloat($('electricity').value) || 0;
  const acHours = parseFloat($('acHours').value) || 0;
  const orders = parseFloat($('orders').value) || 0;
  const waste = $('waste').value;

  const v1 = validateField($('kmTravel'), $('kmTravel-err'), km < 0 || km > 2000, 'Enter a distance between 0–2000 km');
  const v2 = validateField($('meals'), $('meals-err'), meals < 1 || meals > 6, 'Enter meals between 1 and 6');
  const v3 = validateField($('electricity'), $('electricity-err'), electricity < 0 || electricity > 500, 'Enter a value between 0–500 kWh');
  const v4 = validateField($('acHours'), $('acHours-err'), acHours < 0 || acHours > 24, 'Enter hours between 0 and 24');
  const v5 = validateField($('orders'), $('orders-err'), orders < 0 || orders > 50, 'Enter a number between 0 and 50');
  if (!v1 || !v2 || !v3 || !v4 || !v5) return;

  const result = calcFootprint({ vehicleType, km, dietType, meals, electricity, acHours, orders, waste });
  const { tCO2, fCO2, eCO2, sCO2, total } = result;

  appState.currentData = { vehicleType, km, dietType, meals, electricity, acHours, orders, waste, tCO2, fCO2, eCO2, sCO2, total };
  appState.lastScore = total;

  updateRing(total);
  renderBreakdown(tCO2, fCO2, eCO2, sCO2, total);
  renderTips(vehicleType, dietType, electricity, acHours, orders, waste, tCO2, fCO2, eCO2, sCO2);
  saveHistory(total);

  $('breakdownSection').style.display = 'block';
  const trees = (total * 365 / 21).toFixed(1);
  const kmDrive = (total / 0.21).toFixed(0);
  $('equivalentText').textContent = `🌳 ${trees} trees/year needed · 🚗 ${kmDrive} km driving`;
}

function updateRing(total) {
  const pct = Math.min(total / 20, 1);
  $('ringFill').style.strokeDashoffset = 440 * (1 - pct);
  let color, grade, gradeBg;
  if (total < 4)  { color = '#4ade80'; grade = '🌿 Excellent'; gradeBg = 'rgba(74,222,128,0.15)'; }
  else if (total < 8)  { color = '#a3e635'; grade = '✅ Good';      gradeBg = 'rgba(163,230,53,0.15)'; }
  else if (total < 13) { color = '#facc15'; grade = '⚠️ Average';   gradeBg = 'rgba(250,204,21,0.15)'; }
  else                 { color = '#f87171'; grade = '🔥 High Impact'; gradeBg = 'rgba(248,113,113,0.15)'; }
  $('ringFill').style.stroke = color;
  $('scoreNum').textContent = total.toFixed(1);
  $('scoreNum').style.color = color;
  const g = $('scoreGrade');
  g.textContent = grade; g.style.background = gradeBg; g.style.color = color;
}

function renderBreakdown(t, f, e, s, total) {
  const items = [
    { icon: '🚗', name: 'Transport', val: t },
    { icon: '🍽️', name: 'Food', val: f },
    { icon: '⚡', name: 'Energy', val: e },
    { icon: '🛍️', name: 'Shopping & Waste', val: s }
  ];
  const colors = ['#4ade80','#a3e635','#facc15','#fb923c'];
  const list = $('breakdownList');
  list.innerHTML = '';
  list.setAttribute('role', 'list');
  items.forEach((item, i) => {
    const pct = total > 0 ? (item.val / total * 100) : 0;
    const div = document.createElement('div');
    div.className = 'breakdown-item';
    div.setAttribute('role', 'listitem');
    div.innerHTML = `
      <div class="breakdown-icon" aria-hidden="true">${escapeHtml(item.icon)}</div>
      <div class="breakdown-info">
        <div class="breakdown-name">${escapeHtml(item.name)}</div>
        <div class="breakdown-val">${item.val.toFixed(2)} kg CO₂</div>
      </div>
      <div class="breakdown-bar-wrap" role="progressbar" aria-valuenow="${Math.round(pct)}" aria-valuemin="0" aria-valuemax="100" aria-label="${escapeHtml(item.name)} contribution">
        <div class="breakdown-bar" style="width:${pct}%;background:${colors[i]}"></div>
      </div>`;
    list.appendChild(div);
  });
}

function renderTips(vt, dt, elec, ac, orders, waste, t, f, e, s) {
  const tips = [];
  if (vt === 'petrol_car' || vt === 'diesel_car') tips.push({ icon: '🚌', title: 'Switch to public transport', desc: 'Taking bus/metro instead of your car cuts transport emissions by up to 70%.', saving: 'Save ~' + (t * 0.7).toFixed(1) + ' kg CO₂/day' });
  if (vt !== 'walk' && vt !== 'train' && vt !== 'bus') tips.push({ icon: '🚲', title: 'Cycle for short trips', desc: 'For trips under 5 km, cycling produces zero emissions and keeps you fit!', saving: 'Zero emissions for short trips' });
  if (dt === 'heavy_meat' || dt === 'mixed') tips.push({ icon: '🥗', title: 'Try Meatless Monday', desc: 'Replacing one meat meal per day with plant-based food reduces food emissions by up to 50%.', saving: 'Save ~' + (f * 0.5).toFixed(1) + ' kg CO₂/day' });
  if (elec > 5) tips.push({ icon: '💡', title: 'Switch to LED lighting', desc: 'LED bulbs use 75% less energy. Turn off lights when not in use.', saving: 'Save ~' + (elec * 0.2).toFixed(1) + ' kg CO₂/day' });
  if (ac > 1) tips.push({ icon: '🌡️', title: 'Optimize AC usage', desc: 'Set AC to 24°C. Each degree higher saves about 6% electricity.', saving: 'Save ~' + (ac * 0.15).toFixed(1) + ' kg CO₂/day' });
  if (orders > 0) tips.push({ icon: '📦', title: 'Batch your orders', desc: 'Combine multiple deliveries into one to reduce packaging and transport emissions.', saving: 'Reduces packaging waste by 40%' });
  if (waste === 'high' || waste === 'medium') tips.push({ icon: '♻️', title: 'Start composting', desc: 'Composting food waste diverts 30% of household waste from landfills.', saving: 'Reduces waste CO₂ by ~30%' });
  tips.push({ icon: '🌳', title: 'Plant a tree', desc: 'A single tree absorbs about 21 kg of CO₂ per year.', saving: '21 kg CO₂ absorbed per year' });

  const container = $('tipsContainer');
  container.innerHTML = `<div class="section-label">${tips.length} personalized tips</div>`;
  tips.forEach(tip => {
    const article = document.createElement('article');
    article.className = 'tip-card';
    article.innerHTML = `
      <div class="tip-icon" aria-hidden="true">${escapeHtml(tip.icon)}</div>
      <div class="tip-content">
        <h4>${escapeHtml(tip.title)}</h4>
        <p>${escapeHtml(tip.desc)}</p>
        <div class="tip-saving">${escapeHtml(tip.saving)}</div>
      </div>`;
    container.appendChild(article);
  });
}

// ── HISTORY ──
function saveHistory(total) {
  try {
    const h = JSON.parse(localStorage.getItem('carbonHistory') || '[]');
    h.push({ date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }), val: parseFloat(total.toFixed(2)) });
    if (h.length > 30) h.shift();
    localStorage.setItem('carbonHistory', JSON.stringify(h));
  } catch (e) { console.warn('Storage unavailable:', e); }
}

function renderHistory() {
  try {
    const h = JSON.parse(localStorage.getItem('carbonHistory') || '[]');
    const container = $('historyContainer');
    if (!h.length) { container.innerHTML = '<div class="empty-state"><div class="e-icon" aria-hidden="true">📅</div><p>No history yet. Start tracking to see your progress!</p></div>'; return; }
    container.innerHTML = `<div class="section-label">Last ${h.length} entries</div>`;
    [...h].reverse().forEach((item, i) => {
      const prev = h[h.length - 2 - i];
      let delta = '';
      if (prev) {
        const diff = item.val - prev.val;
        delta = diff > 0
          ? `<span class="history-delta" style="color:#f87171" aria-label="Increased by ${diff.toFixed(1)}">▲${diff.toFixed(1)}</span>`
          : `<span class="history-delta" style="color:#4ade80" aria-label="Decreased by ${Math.abs(diff).toFixed(1)}">▼${Math.abs(diff).toFixed(1)}</span>`;
      }
      const color = item.val < 4 ? '#4ade80' : item.val < 8 ? '#a3e635' : item.val < 13 ? '#facc15' : '#f87171';
      const div = document.createElement('div');
      div.className = 'history-item';
      div.innerHTML = `<div class="history-date">${escapeHtml(String(item.date))}</div><div style="display:flex;align-items:center;gap:12px;">${delta}<div class="history-val" style="color:${color}">${parseFloat(item.val).toFixed(1)} kg</div></div>`;
      container.appendChild(div);
    });
  } catch (e) { console.warn('History unavailable:', e); }
}

// ── TABS ──
function switchTab(tab, el) {
  document.querySelectorAll('.tab').forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  el.classList.add('active');
  el.setAttribute('aria-selected', 'true');
  $('panel-' + tab).classList.add('active');
  if (tab === 'history') renderHistory();
}

// ── CHAT ──
async function sendMessage() {
  const input = $('chatInput');
  const raw = input.value.trim();
  if (!raw) return;
  if (!rateLimiter.allowed()) { appendMsg('bot', 'Please wait a moment before sending more messages. 🌿'); return; }

  const msg = raw.substring(0, 500);
  input.value = '';
  appendMsg('user', msg);
  $('sendBtn').disabled = true;
  showTyping();

  appState.chatHistory.push({ role: 'user', content: msg });
  if (appState.chatHistory.length > 10) appState.chatHistory = appState.chatHistory.slice(-10);

  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: msg,
        context: appState.lastScore > 0 ? {
          lastScore: appState.lastScore,
          vehicleType: appState.currentData.vehicleType,
          dietType: appState.currentData.dietType
        } : null,
        history: appState.chatHistory.slice(0, -1)
      })
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    hideTyping();
    const reply = data.reply || "Sorry, I couldn't get a response. Please try again!";
    appState.chatHistory.push({ role: 'assistant', content: reply });
    appendMsg('bot', reply);
  } catch (err) {
    hideTyping();
    console.error('Chat error:', err);
    appendMsg('bot', "Oops! Something went wrong. Please check your connection and try again. 🌿");
  }
  $('sendBtn').disabled = false;
}

function sendChip(el) { $('chatInput').value = el.textContent.trim(); sendMessage(); }
function handleKey(e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }

function appendMsg(role, text) {
  const msgs = $('chatMessages');
  const time = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  const div = document.createElement('div');
  div.className = `msg ${role === 'user' ? 'user' : 'bot'}`;
  const bubble = document.createElement('div');
  bubble.className = 'msg-bubble';
  bubble.textContent = text;
  const timeEl = document.createElement('div');
  timeEl.className = 'msg-time';
  timeEl.textContent = time;
  div.appendChild(bubble);
  div.appendChild(timeEl);
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function showTyping() {
  const msgs = $('chatMessages');
  const div = document.createElement('div');
  div.className = 'msg bot'; div.id = 'typingIndicator';
  div.setAttribute('aria-label', 'Assistant is typing');
  div.innerHTML = '<div class="msg-bubble"><div class="typing" aria-hidden="true"><span></span><span></span><span></span></div></div>';
  msgs.appendChild(div);
  msgs.scrollTop = msgs.scrollHeight;
}

function hideTyping() { const t = $('typingIndicator'); if (t) t.remove(); }

// ── INIT ──
document.addEventListener('DOMContentLoaded', renderHistory);
