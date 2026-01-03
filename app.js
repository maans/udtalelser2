function resolveFullName(row) {
  const full = row.fullName || row.fuldtNavn || row.navn || row.kontaktlaerer || row.kontaktlaererNavn;
  if (full && String(full).trim()) return String(full).trim();
  const fn = row.fornavn || row.firstName || "";
  const en = row.efternavn || row.lastName || "";
  return `${fn} ${en}`.trim();
}

/* Udtalelser v1.0 – statisk GitHub Pages app (ingen libs)
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
      "S1": {
        "title": "Sang – niveau 1",
        "text_m": "{{FORNAVN}} har bidraget til fællessang på allerbedste vis. Med sangglæde, engagement og nysgerrighed har {{FORNAVN}} været en drivkraft i timerne og en inspiration for andre. {{FORNAVN}} har herigennem oplevet det fællesskab, som fællessang kan give.",
        "text_k": "{{FORNAVN}} har bidraget til fællessang på allerbedste vis. Med sangglæde, engagement og nysgerrighed har {{FORNAVN}} været en drivkraft i timerne og en inspiration for andre. {{FORNAVN}} har herigennem oplevet det fællesskab, som fællessang kan give."
      },
      "S2": {
        "title": "Sang – niveau 2",
        "text_m": "{{FORNAVN}} har med godt humør bidraget til fællessang og kor og har derigennem vist sangglæde og åbenhed og fået kendskab til nye sange. {{FORNAVN}} har oplevet det fællesskab, som fællessang kan give.",
        "text_k": "{{FORNAVN}} har med godt humør bidraget til fællessang og kor og har derigennem vist sangglæde og åbenhed og fået kendskab til nye sange. {{FORNAVN}} har oplevet det fællesskab, som fællessang kan give."
      },
      "S3": {
        "title": "Sang – niveau 3",
        "text_m": "{{FORNAVN}} har deltaget i fællessang og kor og har derigennem fået kendskab til nye sange og har oplevet det fællesskab, som fællessang kan give.",
        "text_k": "{{FORNAVN}} har deltaget i fællessang og kor og har derigennem fået kendskab til nye sange og har oplevet det fællesskab, som fællessang kan give."
      }
    },
    gym:  {
      "G1": {
        "title": "Meget engageret",
        "text_m": "{{FORNAVN}} har deltaget meget engageret i fællesgymnastik og har vist stor lyst til at udfordre sig selv. {{HAN_HUN}} har bidraget positivt til holdets fællesskab.",
        "text_k": "{{FORNAVN}} har deltaget meget engageret i fællesgymnastik og har vist stor lyst til at udfordre sig selv. {{HAN_HUN}} har bidraget positivt til holdets fællesskab."
      },
      "G2": {
        "title": "Stabil deltagelse",
        "text_m": "{{FORNAVN}} har deltaget stabilt i fællesgymnastik og har mødt undervisningen med en positiv indstilling.",
        "text_k": "{{FORNAVN}} har deltaget stabilt i fællesgymnastik og har mødt undervisningen med en positiv indstilling."
      },
      "G3": {
        "title": "Varierende deltagelse",
        "text_m": "{{FORNAVN}} har haft en varierende deltagelse i fællesgymnastik, men har i perioder vist vilje til at indgå i fællesskabet.",
        "text_k": "{{FORNAVN}} har haft en varierende deltagelse i fællesgymnastik, men har i perioder vist vilje til at indgå i fællesskabet."
      }
    },
    roller: {
      "FANEBÆRER": {
        "title": "Fanebærer",
        "text_m": "{{FORNAVN}} har været udtaget som fanebærer til skolens fælles gymnastikopvisninger. Et hverv {{HAN_HUN}} har varetaget ansvarsfuldt og respektfuldt.",
        "text_k": "{{FORNAVN}} har været udtaget som fanebærer til skolens fælles gymnastikopvisninger. Et hverv {{HAN_HUN}} har varetaget ansvarsfuldt og respektfuldt."
      },
      "REDSKAB": {
        "title": "Redskabshold",
        "text_m": "{{FORNAVN}} har været en del af redskabsholdet, som {{HAN_HUN}} frivilligt har meldt sig til. {{HAN_HUN}} har ydet en stor indsats og taget ansvar.",
        "text_k": "{{FORNAVN}} har været en del af redskabsholdet, som {{HAN_HUN}} frivilligt har meldt sig til. {{HAN_HUN}} har ydet en stor indsats og taget ansvar."
      },
      "DGI": {
        "title": "DGI-instruktør",
        "text_m": "{{FORNAVN}} har deltaget aktivt i skolens frivillige samarbejde med foreningslivet og har vist engagement og ansvar.",
        "text_k": "{{FORNAVN}} har deltaget aktivt i skolens frivillige samarbejde med foreningslivet og har vist engagement og ansvar."
      }
    },
    elevraad: {
      YES: {
        title: "Elevrådsrepræsentant",
        text_m: "{{ELEV_FORNAVN}} har været en del af elevrådet på Himmerlands Ungdomsskole, hvor elevrådet blandt andet har stået for ugentlige fællesmøder for elever og lærere. I den forbindelse har {{ELEV_FORNAVN}} vist engagement og vilje til at påtage sig og gennemføre forskellige opgaver og aktiviteter.",
        text_k: "{{ELEV_FORNAVN}} har været en del af elevrådet på Himmerlands Ungdomsskole, hvor elevrådet blandt andet har stået for ugentlige fællesmøder for elever og lærere. I den forbindelse har {{ELEV_FORNAVN}} vist engagement og vilje til at påtage sig og gennemføre forskellige opgaver og aktiviteter."
      }
    },
    kontaktgruppeDefault: "I kontaktgruppen har vi arbejdet med trivsel, ansvar og fællesskab.",
    afslutningDefault: "Vi ønsker eleven alt det bedste fremover."
  };

  const SNIPPETS_DEFAULT = JSON.parse(JSON.stringify(SNIPPETS));
  const DEFAULT_SCHOOL_TEXT = `På Himmerlands Ungdomsskole arbejder vi med både faglighed, fællesskab og personlig udvikling. Udtalelsen er skrevet med udgangspunkt i elevens hverdag og deltagelse gennem skoleåret.`;
  const DEFAULT_TEMPLATE = "Udtalelse vedrørende {{ELEV_FULDE_NAVN}}\\n\\n{{ELEV_FORNAVN}} {{ELEV_EFTERNAVN}} har været elev på Himmerlands Ungdomsskole i perioden fra {{PERIODE_FRA}} til {{PERIODE_TIL}} i {{ELEV_KLASSE}}.\\n\\n{{ELEV_UDVIKLING_AFSNIT}}\n\n{{ELEVRAAD_AFSNIT}}\n\n{{ROLLE_AFSNIT}}\\n\\n{{SANG_GYM_AFSNIT}}\\n\\n{{PRAKTISK_AFSNIT}}\\n\\n{{KONTAKTGRUPPE_AFSNIT}}\\n\\n{{FORSTANDER_NAVN}}";

  // ---------- storage ----------
  function lsGet(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      if (v === null || v === undefined) return fallback;
      return JSON.parse(v);
    } catch { return fallback; }
  }
  function lsSet(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  function saveLS(key, value) { return lsSet(key, value); }
  function lsDelPrefix(prefix) {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith(prefix)) keys.push(k);
    }
    keys.forEach(k => localStorage.removeItem(k));
  }

  // ---------- helper data ----------
  function normalizeName(input) {
    if (!input) return "";
    return input.toString().trim().toLowerCase().replace(/æ/g, "ae").replace(/ø/g, "oe").replace(/å/g, "aa").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  }

  function toInitials(raw) {
    const s = (raw ?? "").toString().trim();
    if (!s) return "";
    const up = s.toUpperCase();
    if (/^[A-ZÆØÅ]{1,4}$/.test(up)) return up;
    const parts = up.split(/[^A-ZÆØÅ]+/).filter(Boolean);
    if (!parts.length) return "";
    return (parts[0][0] + (parts[parts.length - 1][0] || "")).toUpperCase();
  }

  function groupKeyFromTeachers(k1Raw, k2Raw) {
    const a = toInitials(k1Raw);
    const b = toInitials(k2Raw);
    const parts = [a,b].filter(Boolean).sort((x,y)=>x.localeCompare(y,'da'));
    return parts.length ? parts.join('/') : '—';
  }

  function buildKGroups(students) {
    const groups = new Map();
    for (const st of students) {
      const key = groupKeyFromTeachers(st.kontaktlaerer1_ini||'', st.kontaktlaerer2_ini||'');
      if (!groups.has(key)) groups.set(key, {key, students: []});
      groups.get(key).students.push(st);
    }
    return Array.from(groups.values()).sort((a,b) => a.key.localeCompare(b.key));
  }

  function computeMissingKTeacher(students) {
    return students.filter(st => !st.kontaktlaerer1_ini && !st.kontaktlaerer2_ini);
  }

  // ---------- THE FIXED TEACHER PICKER ----------
  function updateTeacherDatalist() {
    const input = document.getElementById('meInput');
    const menu  = document.getElementById('teacherPickerMenu');
    const btn   = document.getElementById('teacherPickerBtn');
    const wrap  = document.getElementById('teacherPicker');
    const clear = document.getElementById('meInputClear');
    if (!input || !menu || !btn || !wrap) return;

    const studs = getStudents();
    if (!studs.length) {
      input.value = ''; input.disabled = true; btn.disabled = true;
      menu.innerHTML = `<div class="pickerEmpty">Indlæs elevliste først.</div>`;
      wrap.classList.remove('open');
      return;
    }

    // SIKRING: Bind kun events én gang
    if (input.__wired) {
      input.disabled = false; btn.disabled = false;
      return;
    }
    input.__wired = true;

    input.disabled = false; btn.disabled = false;
    let activeIndex = 0;

    function getFilteredItems() {
      const set = new Set();
      getStudents().forEach(st => {
        if (st.kontaktlaerer1_ini) set.add(st.kontaktlaerer1_ini.toUpperCase());
        if (st.kontaktlaerer2_ini) set.add(st.kontaktlaerer2_ini.toUpperCase());
      });
      const items = Array.from(set).sort((x, y) => x.localeCompare(y, 'da'));
      const q = (input.value || '').toString().trim().toUpperCase();
      return !q ? items : items.filter(x => x.includes(q));
    }

    function setActive(idx) {
      const opts = Array.from(menu.querySelectorAll('.tpRow'));
      if (!opts.length) return;
      activeIndex = Math.max(0, Math.min(idx, opts.length - 1));
      opts.forEach((el, i) => el.classList.toggle('active', i === activeIndex));
      const el = opts[activeIndex];
      if (el) el.scrollIntoView({ block: 'nearest' });
    }

    function renderMenu() {
      const filtered = getFilteredItems();
      menu.innerHTML = '';
      if (!filtered.length) {
        menu.innerHTML = `<div class="pickerEmpty">Ingen match</div>`;
        return;
      }
      filtered.forEach((code) => {
        const row = document.createElement('div');
        row.className = 'tpRow';
        row.setAttribute('role', 'option');
        row.textContent = code;
        row.addEventListener('mousedown', (e) => {
          e.preventDefault();
          commit(code);
        });
        menu.appendChild(row);
      });
      setActive(0);
    }

    function commit(code) {
      input.value = code;
      const s = getSettings(); s.me = code; setSettings(s);
      renderStatus();
      if (clear) clear.hidden = !code;
      wrap.classList.remove('open'); menu.hidden = true;
      try { state.viewMode = 'K'; setTab('k'); } catch(_) {}
    }

    input.onfocus = () => { wrap.classList.add('open'); menu.hidden = false; renderMenu(); };
    input.oninput = () => { if (!wrap.classList.contains('open')) { wrap.classList.add('open'); menu.hidden = false; } renderMenu(); };
    btn.onclick = (e) => { e.preventDefault(); wrap.classList.contains('open') ? (wrap.classList.remove('open'), menu.hidden = true) : input.focus(); };

    input.addEventListener('keydown', (e) => {
      const filtered = getFilteredItems();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!wrap.classList.contains('open')) { wrap.classList.add('open'); menu.hidden = false; renderMenu(); }
        else setActive(activeIndex + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault(); setActive(activeIndex - 1);
      } else if (e.key === 'Enter') {
        if (wrap.classList.contains('open') && filtered[activeIndex]) {
          e.preventDefault(); commit(filtered[activeIndex]);
        }
      } else if (e.key === 'Escape') {
        wrap.classList.remove('open'); menu.hidden = true;
      }
    });

    document.addEventListener('click', (e) => {
      if (!wrap.contains(e.target)) { wrap.classList.remove('open'); menu.hidden = true; }
    });
  }

  // ---------- core logic ----------
  function getSettings(){ return Object.assign({ me: '', schoolYearEnd: 2026, forstanderName: "Stinne Krogh Poulsen" }, lsGet(KEYS.settings, {})); }
  function setSettings(s){ lsSet(KEYS.settings, s); }
  function getStudents(){ return lsGet(KEYS.students, []); }
  function setStudents(s){ lsSet(KEYS.students, s); }
  function getTemplates(){ return Object.assign({ schoolText: DEFAULT_SCHOOL_TEXT, template: DEFAULT_TEMPLATE }, lsGet(KEYS.templates, {})); }
  function setTemplates(t){ lsSet(KEYS.templates, t); }
  function getTextFor(u){ return lsGet(KEYS.textPrefix + u, { elevudvikling:'', praktisk:'', kgruppe:'' }); }
  function setTextFor(u, o){ lsSet(KEYS.textPrefix + u, o); }

  function pronouns(genderRaw) {
    const g = normalizeName(genderRaw);
    if (g === 'k' || g === 'f' || g.includes('pige')) return { HAN_HUN: 'hun', HAM_HENDE: 'hende', HANS_HENDES: 'hendes' };
    return { HAN_HUN: 'han', HAM_HENDE: 'ham', HANS_HENDES: 'hans' };
  }

  function formatClassLabel(raw) {
    const k = ((raw || '') + '').trim();
    return k.match(/^(\d{1,2})\.?$/) ? `${k.replace('.','')}. klasse` : k;
  }

  function buildStatement(student, settings) {
    const tpls = getTemplates();
    const free = getTextFor(student.unilogin);
    const pr = pronouns(student.koen);
    const fullName = `${student.fornavn} ${student.efternavn}`.trim();

    const map = {
      "ELEV_FULDE_NAVN": fullName,
      "ELEV_FORNAVN": student.fornavn,
      "ELEV_EFTERNAVN": student.efternavn,
      "HAN_HUN": pr.HAN_HUN,
      "HAM_HENDE": pr.HAM_HENDE,
      "HANS_HENDES": pr.HANS_HENDES,
      "ELEV_KLASSE": formatClassLabel(student.klasse),
      "ELEV_UDVIKLING_AFSNIT": free.elevudvikling,
      "PRAKTISK_AFSNIT": free.praktisk,
      "KONTAKTGRUPPE_AFSNIT": free.kgruppe || SNIPPETS.kontaktgruppeDefault,
      "FORSTANDER_NAVN": settings.forstanderName,
      "KONTAKTLAERERE": [student.kontaktlaerer1, student.kontaktlaerer2].filter(Boolean).join(' & ')
    };

    let out = tpls.template;
    Object.keys(map).forEach(k => {
      out = out.replace(new RegExp(`{{${k}}}`, 'g'), map[k] || "");
    });
    return out.replace(/\\n/g, '\n');
  }

  // ---------- UI logic ----------
  function setTab(tab) {
    state.tab = tab;
    document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + tab));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.id === 'tab-' + tab));
    renderAll();
  }

  function renderStatus() {
    const s = getSettings();
    const studs = getStudents();
    const el = document.getElementById('statusText');
    if (el) el.textContent = studs.length ? `Elever: ${studs.length} · K-lærer: ${s.me}` : `Ingen elevliste indlæst`;
  }

  function renderAll() {
    renderStatus();
    updateTeacherDatalist();
    if (state.tab === 'k') renderKList();
    if (state.tab === 'edit') renderEdit();
  }

  function renderKList() {
    const s = getSettings();
    const studs = getStudents();
    const list = document.getElementById('kList');
    if (!list) return;
    const me = (s.me || '').toUpperCase();
    const mine = state.viewMode === 'ALL' ? studs : studs.filter(st => (st.kontaktlaerer1_ini === me || st.kontaktlaerer2_ini === me));
    
    list.innerHTML = mine.map(st => `
      <div class="card clickable" data-u="${st.unilogin}">
        <b>${st.fornavn} ${st.efternavn}</b><br><small>${st.klasse}</small>
      </div>
    `).join('');

    list.querySelectorAll('.card').forEach(c => {
      c.onclick = () => { state.selectedUnilogin = c.dataset.u; setTab('edit'); };
    });
  }

  function renderEdit() {
    const studs = getStudents();
    const st = studs.find(x => x.unilogin === state.selectedUnilogin);
    if (!st) return;
    const free = getTextFor(st.unilogin);
    document.getElementById('txtElevudv').value = free.elevudvikling || '';
    document.getElementById('txtPraktisk').value = free.praktisk || '';
    document.getElementById('txtKgruppe').value = free.kgruppe || '';
    document.getElementById('preview').textContent = buildStatement(st, getSettings());
  }

  // ---------- CSV Logic ----------
  function parseCsv(text) {
    const lines = text.split('\n').filter(l => l.trim());
    if (!lines.length) return { headers: [], rows: [] };
    const delim = lines[0].includes(';') ? ';' : ',';
    const headers = lines[0].split(delim).map(h => h.trim());
    const rows = lines.slice(1).map(line => {
      const vals = line.split(delim);
      const obj = {};
      headers.forEach((h, i) => obj[h] = (vals[i] || '').trim());
      return obj;
    });
    return { headers, rows };
  }

  function wireEvents() {
    const on = (id, ev, fn) => { const el = document.getElementById(id); if (el) el.addEventListener(ev, fn); };
    on('tab-k', 'click', () => setTab('k'));
    on('tab-set', 'click', () => setTab('set'));
    on('studentsFile', 'change', async (e) => {
      const f = e.target.files[0]; if (!f) return;
      const text = await f.text();
      const parsed = parseCsv(text);
      const studs = parsed.rows.map(r => ({
        fornavn: r['Fornavn'], efternavn: r['Efternavn'], unilogin: r['Unilogin'],
        koen: r['Køn'], klasse: r['Klasse'], kontaktlaerer1: r['Kontaktlærer1'],
        kontaktlaerer2: r['Kontaktlærer2'],
        kontaktlaerer1_ini: r['Initialer for k-lærer1'] || toInitials(r['Kontaktlærer1']),
        kontaktlaerer2_ini: r['Initialer for k-lærer2'] || toInitials(r['Kontaktlærer2'])
      }));
      setStudents(studs); renderAll();
    });

    ['txtElevudv', 'txtPraktisk', 'txtKgruppe'].forEach(id => {
      on(id, 'input', () => {
        const obj = getTextFor(state.selectedUnilogin);
        obj.elevudvikling = document.getElementById('txtElevudv').value;
        obj.praktisk = document.getElementById('txtPraktisk').value;
        obj.kgruppe = document.getElementById('txtKgruppe').value;
        setTextFor(state.selectedUnilogin, obj);
        renderEdit();
      });
    });

    on('btnPrint', 'click', () => {
      const st = getStudents().find(x => x.unilogin === state.selectedUnilogin);
      if (st) {
        const win = window.open('', '_blank');
        win.document.write(`<pre style="white-space:pre-wrap;font-family:sans-serif;">${buildStatement(st, getSettings())}</pre>`);
        win.document.close();
        win.print();
      }
    });
  }

  const state = { tab: 'set', selectedUnilogin: null, viewMode: 'K' };

  function init() {
    wireEvents();
    renderAll();
    setTab(getStudents().length > 0 ? 'k' : 'set');
  }

  init();
})();

/* === EXPORT / IMPORT SKABELONER === */
function exportTemplates() {
  const settings = JSON.parse(localStorage.getItem('udt_settings') || '{}');
  const templates = JSON.parse(localStorage.getItem('udt_templates') || '{}');
  const data = { forstanderNavn: settings.forstanderName, schoolText: templates.schoolText, template: templates.template };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "udtalelses-skabeloner.json";
  a.click();
}

function handleImportTemplates(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      const s = JSON.parse(localStorage.getItem('udt_settings') || '{}');
      const t = JSON.parse(localStorage.getItem('udt_templates') || '{}');
      if (data.forstanderNavn) s.forstanderName = data.forstanderNavn;
      if (data.schoolText) t.schoolText = data.schoolText;
      if (data.template) t.template = data.template;
      localStorage.setItem('udt_settings', JSON.stringify(s));
      localStorage.setItem('udt_templates', JSON.stringify(t));
      location.reload();
    } catch (e) { alert("Ugyldig skabelon-fil"); }
  };
  reader.readAsText(file);
}

document.addEventListener("DOMContentLoaded", () => {
  const expBtn = document.getElementById("btnExportTemplates");
  if (expBtn) expBtn.addEventListener("click", exportTemplates);
  const impBtn = document.getElementById("btnImportTemplates");
  if (impBtn) {
    const input = document.createElement("input");
    input.type = "file"; input.accept = ".json";
    input.onchange = (e) => handleImportTemplates(e.target.files[0]);
    impBtn.onclick = () => input.click();
  }
});
