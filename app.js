/* Udtalelser v1.1 – Optimeret til Himmerlands Ungdomsskole demo-data */

// --- Konstanter og Storage Keys ---
const LS_PREFIX = 'udt_';
const KEYS = {
  settings: LS_PREFIX + 'settings',
  students:  LS_PREFIX + 'students',
  templates: LS_PREFIX + 'templates',
  marksSang: LS_PREFIX + 'marks_sang',
  marksGym:  LS_PREFIX + 'marks_gym',
  marksElev: LS_PREFIX + 'marks_elevraad',
  marksType: LS_PREFIX + 'marks_type',
  textPrefix: LS_PREFIX + 'text_'
};

const DEFAULT_SCHOOL_TEXT = `På Himmerlands Ungdomsskole arbejder vi med både faglighed, fællesskab og personlig udvikling.
Udtalelsen er skrevet med udgangspunkt i elevens hverdag og deltagelse gennem skoleåret.`;

const DEFAULT_TEMPLATE = `Udtalelse vedrørende {{ELEV_FULDE_NAVN}}

{{ELEV_FORNAVN}} {{ELEV_EFTERNAVN}} har været elev på Himmerlands Ungdomsskole i perioden fra {{PERIODE_FRA}} til {{PERIODE_TIL}} i {{ELEV_KLASSE}}.

Himmerlands Ungdomsskole er en traditionsrig efterskole, som prioriterer fællesskabet og faglig fordybelse højt.

{{ELEV_UDVIKLING_AFSNIT}}

{{SANG_GYM_AFSNIT}}

{{KONTAKTGRUPPE_AFSNIT}}

Vi ønsker {{HAM_HENDE}} alt det bedste fremover.

{{KONTAKTLAERERE}}
Kontaktlærere`;

// --- App State ---
window.state = {
  tab: 'set',
  viewMode: 'K',
  kGroupIndex: 0,
  settingsSubtab: 'general',
  selectedUnilogin: null,
  studentInputUrls: {},
  visibleKElevIds: []
};

// --- Storage Hjælpere ---
function lsGet(key, fallback) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : fallback;
  } catch { return fallback; }
}
function lsSet(key, value) { localStorage.setItem(key, JSON.stringify(value)); }

// --- Hjælpefunktioner til Navne og Køn ---
function toInitials(raw) {
  if (!raw) return "";
  const s = raw.trim().toUpperCase();
  if (/^[A-ZÆØÅ]{1,4}$/.test(s)) return s;
  const parts = s.split(/[^A-ZÆØÅ]+/).filter(Boolean);
  if (!parts.length) return "";
  return (parts[0][0] + (parts[parts.length - 1][0] || "")).toUpperCase();
}

function getPronouns(gender) {
  const g = String(gender || '').toLowerCase();
  if (g === 'k' || g.includes('pige') || g.includes('f')) {
    return { HAN_HUN: 'hun', HAM_HENDE: 'hende', HANS_HENDES: 'hendes' };
  }
  return { HAN_HUN: 'han', HAM_HENDE: 'ham', HANS_HENDES: 'hans' };
}

// --- UI Navigation (Globale funktioner) ---
window.setTab = function(tab) {
  const studs = lsGet(KEYS.students, []);
  if (!studs.length && tab !== 'set') tab = 'set';
  window.state.tab = tab;
  
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const targetView = document.getElementById('view-' + (tab === 'set' ? 'set' : tab));
  if (targetView) targetView.classList.add('active');

  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  const targetBtn = document.getElementById('tab-' + (tab === 'set' ? 'set' : tab));
  if (targetBtn) targetBtn.classList.add('active');

  window.renderAll();
};

window.setSettingsSubtab = function(sub) {
  window.state.settingsSubtab = sub;
  document.querySelectorAll('.settingsSubtab').forEach(p => p.classList.remove('active'));
  const target = document.querySelector(`.settingsSubtab[data-subtab="${sub}"]`);
  if (target) target.classList.add('active');

  document.querySelectorAll('#settingsSubtabs .subtab').forEach(b => {
    b.classList.toggle('active', b.dataset.subtab === sub);
  });
};

// --- DEN FIXEDE K-LÆRER VÆLGER ---
window.updateTeacherDatalist = function() {
  const input = document.getElementById('meInput');
  const menu  = document.getElementById('teacherPickerMenu');
  const wrap  = document.getElementById('teacherPicker');
  if (!input || !menu) return;

  if (input.__wired) {
    input.disabled = !lsGet(KEYS.students, []).length;
    return;
  }
  input.__wired = true;

  let activeIndex = 0;
  let items = [];

  function getFilteredItems() {
    const q = (input.value || '').toUpperCase();
    return !q ? items : items.filter(x => x.includes(q));
  }

  function setActive(idx) {
    const opts = Array.from(menu.querySelectorAll('.tpRow'));
    if (!opts.length) return;
    activeIndex = Math.max(0, Math.min(idx, opts.length - 1));
    opts.forEach((el, i) => el.classList.toggle('active', i === activeIndex));
    if (opts[activeIndex]) opts[activeIndex].scrollIntoView({ block: 'nearest' });
  }

  function renderMenu() {
    const studs = lsGet(KEYS.students, []);
    const set = new Set();
    studs.forEach(st => {
      if (st.kontaktlaerer1_ini) set.add(st.kontaktlaerer1_ini.toUpperCase());
      if (st.kontaktlaerer2_ini) set.add(st.kontaktlaerer2_ini.toUpperCase());
    });
    items = Array.from(set).sort();
    const filtered = getFilteredItems();
    menu.innerHTML = filtered.map(item => `<div class="tpRow" data-value="${item}">${item}</div>`).join('');
    if (!filtered.length) menu.innerHTML = '<div class="pickerEmpty">Ingen match</div>';
    
    // Klik-event på rækkerne
    menu.querySelectorAll('.tpRow').forEach(row => {
      row.onmousedown = (e) => {
        e.preventDefault();
        selectItem(row.dataset.value);
      };
    });
    setActive(0);
  }

  function selectItem(val) {
    input.value = val;
    const s = lsGet(KEYS.settings, {}); 
    s.me = val; 
    lsSet(KEYS.settings, s);
    wrap.classList.remove('open');
    menu.hidden = true;
    window.renderAll();
  }

  input.onfocus = () => { wrap.classList.add('open'); menu.hidden = false; renderMenu(); };
  input.oninput = () => renderMenu();
  
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActive(activeIndex + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(activeIndex - 1); }
    else if (e.key === 'Enter') {
      const filtered = getFilteredItems();
      if (filtered[activeIndex]) {
        e.preventDefault();
        selectItem(filtered[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      wrap.classList.remove('open'); menu.hidden = true;
    }
  });

  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target)) { wrap.classList.remove('open'); menu.hidden = true; }
  });
};

// --- CSV Import ---
window.handleCsvUpload = async function(e) {
  const file = e.target.files[0];
  if (!file) return;
  const text = await file.text();
  const lines = text.split('\n').filter(l => l.trim());
  if (lines.length < 2) return;

  const headers = lines[0].split(/[;,]/).map(h => h.trim());
  
  // Mapping baseret på dine specifikke kolonnenavne
  const rows = lines.slice(1).map(line => {
    const values = line.split(/[;,]/);
    const d = {};
    headers.forEach((h, i) => d[h] = (values[i] || '').trim());
    
    return {
      fornavn: d['Fornavn'],
      efternavn: d['Efternavn'],
      unilogin: d['Unilogin'],
      koen: d['Køn'],
      klasse: d['Klasse'],
      kontaktlaerer1: d['Kontaktlærer1'],
      kontaktlaerer2: d['Kontaktlærer2'],
      kontaktlaerer1_ini: d['Initialer for k-lærer1'] || toInitials(d['Kontaktlærer1']),
      kontaktlaerer2_ini: d['Initialer for k-lærer2'] || toInitials(d['Kontaktlærer2'])
    };
  });

  lsSet(KEYS.students, rows);
  window.renderAll();
  alert(`Import succes! ${rows.length} elever indlæst.`);
  window.setTab('set');
};

// --- Render Main ---
window.renderAll = function() {
  const studs = lsGet(KEYS.students, []);
  const s = lsGet(KEYS.settings, { me: '' });
  
  const statusLine = document.getElementById('statusText');
  if (statusLine) {
    statusLine.textContent = studs.length 
      ? `Elever: ${studs.length} · Valgt K-lærer: ${s.me || '—'}` 
      : 'Ingen elevliste indlæst';
  }

  window.updateTeacherDatalist();

  // Opdater visning af K-elever hvis vi er på den fane
  if (window.state.tab === 'k') {
    renderKList();
  }
};

function renderKList() {
  const studs = lsGet(KEYS.students, []);
  const s = lsGet(KEYS.settings, { me: '' });
  const listEl = document.getElementById('kList');
  if (!listEl) return;

  const meIni = s.me.toUpperCase();
  const mine = studs.filter(st => 
    st.kontaktlaerer1_ini.toUpperCase() === meIni || 
    st.kontaktlaerer2_ini.toUpperCase() === meIni
  );

  if (mine.length === 0) {
    listEl.innerHTML = '<div class="muted">Ingen elever fundet for dine initialer.</div>';
    return;
  }

  listEl.innerHTML = mine.map(st => `
    <div class="card clickable" onclick="openEdit('${st.unilogin}')">
      <div class="cardTitle"><b>${st.fornavn} ${st.efternavn}</b></div>
      <div class="cardSub muted small">${st.klasse} · ${st.unilogin}</div>
    </div>
  `).join('');
}

window.openEdit = function(unilogin) {
  window.state.selectedUnilogin = unilogin;
  window.setTab('edit');
  // Her ville renderEdit() logik køre
};

// --- Init ---
document.addEventListener('DOMContentLoaded', () => {
  const csvInput = document.getElementById('studentsFile');
  if (csvInput) csvInput.addEventListener('change', window.handleCsvUpload);
  
  // Start appen i Indstillinger
  window.setTab('set');
});
