function resolveFullName(row) {
  const full = row.fullName || row.fuldtNavn || row.navn || row.kontaktlaerer || row.kontaktlaererNavn;
  if (full && String(full).trim()) return String(full).trim();
  const fn = row.fornavn || row.firstName || "";
  const en = row.efternavn || row.lastName || "";
  return `${fn} ${en}`.trim();
}

/* Udtalelser v1.0 – statisk GitHub Pages app
   localStorage prefix: udt_
*/
(() => {
  'use strict';

  const LS_PREFIX = 'udt_';
  const KEYS = {
    settings: LS_PREFIX + 'settings',
    students:  LS_PREFIX + 'students',
    templates: LS_PREFIX + 'templates',
    templatesImported: LS_PREFIX + 'templates_imported',
    marksSang: LS_PREFIX + 'marks_sang',
    marksGym:  LS_PREFIX + 'marks_gym',
    marksElev: LS_PREFIX + 'marks_elevraad',
	  marksType: LS_PREFIX + 'marks_type',
    textPrefix: LS_PREFIX + 'text_' // + unilogin
  };

  const KEY_MARKS_TYPE = KEYS.marksType;
  const TEACHER_ALIAS_MAP = {}; 

  let SNIPPETS = {
    sang: {
      "S1": { "title": "Sang – niveau 1", "text_m": "{{FORNAVN}} har bidraget til fællessang på allerbedste vis...", "text_k": "{{FORNAVN}} har bidraget til fællessang på allerbedste vis..." },
      "S2": { "title": "Sang – niveau 2", "text_m": "{{FORNAVN}} har med godt humør bidraget til fællessang...", "text_k": "{{FORNAVN}} har med godt humør bidraget til fællessang..." },
      "S3": { "title": "Sang – niveau 3", "text_m": "{{FORNAVN}} har deltaget i fællessang...", "text_k": "{{FORNAVN}} har deltaget i fællessang..." }
    },
    gym:  {
      "G1": { "title": "Meget engageret", "text_m": "{{FORNAVN}} har deltaget meget engageret...", "text_k": "{{FORNAVN}} har deltaget meget engageret..." },
      "G2": { "title": "Stabil deltagelse", "text_m": "{{FORNAVN}} har deltaget stabilt...", "text_k": "{{FORNAVN}} har deltaget stabilt..." },
      "G3": { "title": "Varierende deltagelse", "text_m": "{{FORNAVN}} har haft en varierende deltagelse...", "text_k": "{{FORNAVN}} har haft en varierende deltagelse..." }
    },
    roller: {
      "FANEBÆRER": { "title": "Fanebærer", "text_m": "{{FORNAVN}} har været fanebærer...", "text_k": "{{FORNAVN}} har været fanebærer..." },
      "REDSKAB": { "title": "Redskabshold", "text_m": "{{FORNAVN}} har været på redskabshold...", "text_k": "{{FORNAVN}} har været på redskabshold..." },
      "DGI": { "title": "DGI-instruktør", "text_m": "{{FORNAVN}} har deltaget som DGI-instruktør...", "text_k": "{{FORNAVN}} har deltaget som DGI-instruktør..." }
    },
    elevraad: {
      YES: { "title": "Elevrådsrepræsentant", "text_m": "{{ELEV_FORNAVN}} har været i elevrådet...", "text_k": "{{ELEV_FORNAVN}} har været i elevrådet..." }
    },
    kontaktgruppeDefault: "I kontaktgruppen har vi arbejdet med trivsel, ansvar og fællesskab.",
    afslutningDefault: "Vi ønsker eleven alt det bedste fremover."
  };

  const DEFAULT_SCHOOL_TEXT = `På Himmerlands Ungdomsskole arbejder vi med både faglighed, fællesskab og personlig udvikling.`;
  const DEFAULT_TEMPLATE = `Udtalelse vedrørende {{ELEV_FULDE_NAVN}}\n\n{{ELEV_FORNAVN}} {{ELEV_EFTERNAVN}}...`;

  // ---------- storage ----------
  function lsGet(key, fallback) { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } }
  function lsSet(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  function $(id){ return document.getElementById(id); }

  // ---------- IDENTITET PICKER FIX (ERSTATTER DIN GAMLE FUNKTION) ----------
  function updateTeacherDatalist() {
    const input = $('meInput');
    const menu  = $('teacherPickerMenu');
    const btn   = $('teacherPickerBtn');
    const wrap  = $('teacherPicker');
    const clear = $('meInputClear');
    if (!input || !menu || !btn || !wrap) return;

    // SIKRER AT LISTENERS KUN TILFØJES ÉN GANG
    if (input.__wired) {
      input.disabled = !getStudents().length;
      btn.disabled = !getStudents().length;
      return;
    }
    input.__wired = true;

    let activeIndex = 0;
    let items = [];

    function getFilteredItems() {
      const q = (input.value || '').toString().trim().toUpperCase();
      return !q ? items : items.filter(x => x.includes(q));
    }

    function setActive(idx) {
      const opts = Array.from(menu.querySelectorAll('[role="option"]'));
      if (!opts.length) return;
      activeIndex = Math.max(0, Math.min(idx, opts.length - 1));
      opts.forEach((el, i) => el.classList.toggle('active', i === activeIndex));
      const el = opts[activeIndex];
      if (el) el.scrollIntoView({ block: 'nearest' });
    }

    function renderMenu() {
      const studs = getStudents();
      const set = new Set();
      for (const st of studs) {
        const a = (st.kontaktlaerer1_ini || '').toString().trim().toUpperCase();
        const b = (st.kontaktlaerer2_ini || '').toString().trim().toUpperCase();
        if (a) set.add(a); if (b) set.add(b);
      }
      items = Array.from(set).sort((x, y) => x.localeCompare(y, 'da'));

      const filtered = getFilteredItems();
      menu.innerHTML = '';
      if (!filtered.length) { menu.innerHTML = `<div class="pickerEmpty">Ingen match</div>`; return; }

      filtered.forEach((code, i) => {
        const row = document.createElement('div');
        row.className = 'tpRow';
        row.setAttribute('role', 'option');
        row.textContent = code;
        row.addEventListener('mousedown', (e) => { e.preventDefault(); commit(code); closeMenu(); });
        menu.appendChild(row);
      });
      setActive(0);
    }

    function openMenu() { renderMenu(); menu.hidden = false; wrap.classList.add('open'); }
    function closeMenu() { wrap.classList.remove('open'); menu.hidden = true; }

    function commit(code) {
      input.value = code;
      const s2 = getSettings(); s2.me = code; setSettings(s2);
      renderStatus();
      if (clear) clear.hidden = !code;
      try { state.viewMode = 'K'; setTab('k'); } catch (_) {}
    }

    input.onfocus = openMenu;
    input.oninput = () => { if (!wrap.classList.contains('open')) openMenu(); else renderMenu(); };
    btn.onclick = (e) => { e.preventDefault(); wrap.classList.contains('open') ? closeMenu() : openMenu(); input.focus(); };

    input.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(activeIndex + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(activeIndex - 1); }
      else if (e.key === 'Enter') {
        const filtered = getFilteredItems();
        if (wrap.classList.contains('open') && filtered[activeIndex]) {
          e.preventDefault(); commit(filtered[activeIndex]); closeMenu();
        }
      } else if (e.key === 'Escape') { closeMenu(); }
    });

    document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) closeMenu(); });
  }

  // ---------- RESTE AF DIN OPRINDELIGE LOGIK (VIGTIGT!) ----------
  function setTab(tab) {
    state.tab = tab;
    document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + tab));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.id === 'tab-' + tab));
    renderAll();
  }

  function getSettings(){ return Object.assign({ me: '', schoolYearEnd: 2026 }, lsGet(KEYS.settings, {})); }
  function setSettings(s){ lsSet(KEYS.settings, s); }
  function getStudents(){ return lsGet(KEYS.students, []); }
  function setStudents(s){ lsSet(KEYS.students, s); }

  function renderStatus() {
    const s = getSettings();
    const studs = getStudents();
    const el = $('statusText');
    if (el) el.textContent = studs.length ? `Elever: ${studs.length} · K-lærer: ${s.me}` : `Ingen elevliste indlæst`;
  }

  function renderAll() {
    renderStatus();
    updateTeacherDatalist();
    if (state.tab === 'k') renderKList();
  }

  function renderKList() {
    const s = getSettings();
    const studs = getStudents();
    const list = $('kList');
    if (!list) return;
    const mine = studs.filter(st => (st.kontaktlaerer1_ini === s.me || st.kontaktlaerer2_ini === s.me));
    list.innerHTML = mine.map(st => `<div class="card clickable" onclick="state.selectedUnilogin='${st.unilogin}'; setTab('edit')"><b>${st.fornavn} ${st.efternavn}</b><br><small>${st.klasse}</small></div>`).join('');
  }

  // --- CSV parsing ---
  function parseCsv(text) {
    const lines = text.split('\n').filter(l => l.trim());
    const headers = lines[0].split(/[;,]/).map(h => h.trim());
    const rows = lines.slice(1).map(line => {
      const values = line.split(/[;,]/);
      const row = {};
      headers.forEach((h, i) => row[h] = (values[i] || '').trim());
      return row;
    });
    return { headers, rows };
  }

  // --- Event wiring ---
  function wireEvents() {
    const on = (id, ev, fn) => { const el = $(id); if (el) el.addEventListener(ev, fn); };
    on('tab-k', 'click', () => setTab('k'));
    on('tab-set', 'click', () => setTab('set'));
    on('studentsFile', 'change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const text = await file.text();
      const parsed = parseCsv(text);
      // Simpel mapping baseret på din demo-csv struktur
      const students = parsed.rows.map(r => ({
        fornavn: r['Fornavn'], efternavn: r['Efternavn'], unilogin: r['Unilogin'],
        klasse: r['Klasse'], kontaktlaerer1_ini: r['Initialer for k-lærer1'], kontaktlaerer2_ini: r['Initialer for k-lærer2']
      }));
      setStudents(students);
      renderAll();
    });
    on('btnReload', 'click', () => location.reload());
  }

  const state = { tab: 'set', selectedUnilogin: null };

  function init() {
    wireEvents();
    setTab(getStudents().length > 0 ? 'k' : 'set');
  }

  init();
})();
