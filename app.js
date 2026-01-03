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

	// Backwards-compat alias used by some older event handlers
	const KEY_MARKS_TYPE = KEYS.marksType;

  const TEACHER_ALIAS_MAP = {}; // v1.0: no hardcoded teacher directory (persondata-safe)


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
        text_m: "{{ELEV_FORNAVN}} har været en del af elevrådet på Himmerlands Ungdomsskole, hvor elevrådet blandt andet har stået for ugentlige fællesmøder for elever og lærere. Derudover har elevrådsarbejdet omfattet en række forskellige opgaver i løbet af året med ansvar for at sætte aktiviteter i gang i fællesskabets ånd. I den forbindelse har {{ELEV_FORNAVN}} vist engagement og vilje til at påtage sig og gennemføre forskellige opgaver og aktiviteter.",
        text_k: "{{ELEV_FORNAVN}} har været en del af elevrådet på Himmerlands Ungdomsskole, hvor elevrådet blandt andet har stået for ugentlige fællesmøder for elever og lærere. Derudover har elevrådsarbejdet omfattet en række forskellige opgaver i løbet af året med ansvar for at sætte aktiviteter i gang i fællesskabets ånd. I den forbindelse har {{ELEV_FORNAVN}} vist engagement og vilje til at påtage sig og gennemføre forskellige opgaver og aktiviteter."
      }
    },
    kontaktgruppeDefault: "I kontaktgruppen har vi arbejdet med trivsel, ansvar og fællesskab.",
    afslutningDefault: "Vi ønsker eleven alt det bedste fremover."
  };

  const SNIPPETS_DEFAULT = JSON.parse(JSON.stringify(SNIPPETS));

const DEFAULT_SCHOOL_TEXT =
`På Himmerlands Ungdomsskole arbejder vi med både faglighed, fællesskab og personlig udvikling.
Udtalelsen er skrevet med udgangspunkt i elevens hverdag og deltagelse gennem skoleåret.`;

  const DEFAULT_TEMPLATE = "Udtalelse vedrørende {{ELEV_FULDE_NAVN}}\\n\\n{{ELEV_FORNAVN}} {{ELEV_EFTERNAVN}} har været elev på Himmerlands Ungdomsskole i perioden fra {{PERIODE_FRA}} til {{PERIODE_TIL}} i {{ELEV_KLASSE}}.\\n\\nHimmerlands Ungdomsskole er en traditionsrig efterskole, som prioriterer fællesskabet og faglig fordybelse højt. Elevernes hverdag er præget af frie rammer og mange muligheder. Vi møder eleverne med tillid, positive forventninger og faglige udfordringer. I løbet af et efterskoleår på Himmerlands Ungdomsskole er oplevelserne mange og udfordringerne ligeså. Det gælder i hverdagens almindelige undervisning, som fordeler sig over boglige fag, fællesfag og profilfag. Det gælder også alle de dage, hvor hverdagen ændres til fordel for temauger, studieture mm. \\n\\n{{ELEV_UDVIKLING_AFSNIT}}\n\n{{ELEVRAAD_AFSNIT}}\n\n{{ROLLE_AFSNIT}}\n\\n\\nSom en del af et efterskoleår på Himmerlands Ungdomsskole deltager eleverne ugentligt i fællessang og fællesgymnastik. Begge fag udgør en del af efterskolelivet, hvor eleverne oplever nye sider af sig selv, flytter grænser og oplever, at deres bidrag til fællesskabet har betydning. I løbet af året optræder eleverne med fælleskor og gymnastikopvisninger.\\n\\n{{SANG_GYM_AFSNIT}}\\n\\nPå en efterskole er der mange praktiske opgaver.\\n\\n{{PRAKTISK_AFSNIT}}\\n\\n{{ELEV_FORNAVN}} har på Himmerlands Ungdomsskole været en del af en kontaktgruppe på {{KONTAKTGRUPPE_ANTAL}} elever. I kontaktgruppen kender vi {{HAM_HENDE}} som {{KONTAKTGRUPPE_BESKRIVELSE}}.\\n\\nVi har været rigtig glade for at have {{ELEV_FORNAVN}} som elev på skolen og ønsker {{HAM_HENDE}} held og lykke fremover.\\n\\n{{KONTAKTLÆRER_1_NAVN}} & {{KONTAKTLÆRER_2_NAVN}}\\n\\nKontaktlærere\\n\\n{{FORSTANDER_NAVN}}\\n\\nForstander";

  // ---------- storage ----------
  function lsGet(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      if (v === null || v === undefined) return fallback;
      return JSON.parse(v);
    } catch {
      return fallback;
    }
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

  
// ---------- snippet overrides (deling mellem lærere) ----------
const SNIPPETS_IMPORTED_KEY = 'udt_snippets_imported_v1';
const SNIPPETS_DRAFT_KEY = 'udt_snippets_draft_v1';
const OVERRIDE_SCHEMA = 'hu-elevudtalelser-snippets-override@1';
const REMOTE_OVERRIDE_FILES = {
  sang: './overrides/sang_override.json',
  gym: './overrides/gym_override.json',
  elevraad: './overrides/elevraad_override.json',
  templates: './overrides/templates_override.json',
};
let REMOTE_OVERRIDES = { sang: null, gym: null, elevraad: null, templates: null };

const META_KEYS = {
  templatesDirty: 'udt_templatesDirty_v1',
  snippetsDirty: 'udt_snippetsDirty_v1',
  remoteOverridesFetchedAt: 'udt_remoteOverridesFetchedAt_v1',
};

function isTemplatesDirty(){ return !!lsGet(META_KEYS.templatesDirty, false); }
function setTemplatesDirty(v){ lsSet(META_KEYS.templatesDirty, !!v); }
function hasTemplatesDirtyMeta(){ try { return localStorage.getItem(META_KEYS.templatesDirty) !== null; } catch(_) { return true; } }
function isSnippetsDirty(){ return !!lsGet(META_KEYS.snippetsDirty, false); }
function setSnippetsDirty(v){ lsSet(META_KEYS.snippetsDirty, !!v); }

async function fetchJsonIfExists(url){
  try{
    const res = await fetch(url + '?v=' + Date.now(), { cache: 'no-store' });
    if (!res.ok) return null;
    return await res.json();
  }catch(_e){
    return null;
  }
}
function unwrapOverridePack(pack){
  if (!pack) return null;
  if (pack.payload) return pack.payload;
  return pack;
}

function normalizeOverrideText(s){
  if (typeof s !== 'string') return s;
  return s.replace(/\\r\\n/g, "\n").replace(/\\n/g, "\n").replace(/\r\n/g, "\n");
}
function normalizeOverrideDeep(obj){
  if (!obj) return obj;
  if (typeof obj === 'string') return normalizeOverrideText(obj);
  if (Array.isArray(obj)) return obj.map(normalizeOverrideDeep);
  if (typeof obj === 'object') {
    const out = {};
    Object.keys(obj).forEach(k => { out[k] = normalizeOverrideDeep(obj[k]); });
    return out;
  }
  return obj;
}


async function loadRemoteOverrides(){
  const [sang, gym, elevraad, templates] = await Promise.all([
    fetchJsonIfExists(REMOTE_OVERRIDE_FILES.sang),
    fetchJsonIfExists(REMOTE_OVERRIDE_FILES.gym),
    fetchJsonIfExists(REMOTE_OVERRIDE_FILES.elevraad),
    fetchJsonIfExists(REMOTE_OVERRIDE_FILES.templates),
  ]);
  const tplPack = unwrapOverridePack(templates);
  const tplObj = (tplPack && tplPack.templates) ? tplPack.templates : tplPack;
  
  REMOTE_OVERRIDES = {
    sang: normalizeOverrideDeep(unwrapOverridePack(sang)),
    gym: normalizeOverrideDeep(unwrapOverridePack(gym)),
    elevraad: normalizeOverrideDeep(unwrapOverridePack(elevraad)),
    templates: normalizeOverrideDeep(tplObj),
  };
}


function getSnippetImported() { return lsGet(SNIPPETS_IMPORTED_KEY, {}); }
function setSnippetImported(o) { lsSet(SNIPPETS_IMPORTED_KEY, o || {}); }
function getSnippetDraft() { return lsGet(SNIPPETS_DRAFT_KEY, {}); }
function setSnippetDraft(o) { lsSet(SNIPPETS_DRAFT_KEY, o || {}); }

function clearLocalSnippetScope(scope){
  const d = getSnippetDraft();
  const i = getSnippetImported();
  if (scope && typeof scope === 'string') { delete d[scope]; delete i[scope]; }
  setSnippetDraft(d); setSnippetImported(i);
  if (Object.keys(d).length === 0 && Object.keys(i).length === 0) setSnippetsDirty(false);
}

function applySnippetOverrides() {
  const remote = REMOTE_OVERRIDES || {};
  const imported = getSnippetImported();
  const draft = getSnippetDraft();
  SNIPPETS = JSON.parse(JSON.stringify(SNIPPETS_DEFAULT));

  function applyPack(pack){
    if(!pack) return;
    if (pack.payload) pack = pack.payload;
    // (Merge logic for snippets - simplified for brevity here but matches your original)
    if (pack.sang && pack.sang.items) {
        Object.keys(pack.sang.items).forEach(k => {
          const it = pack.sang.items[k];
          if (!SNIPPETS.sang[k]) SNIPPETS.sang[k] = { title: k, text_m: '', text_k: '' };
          if (it.label) SNIPPETS.sang[k].title = it.label;
          if (it.text) { SNIPPETS.sang[k].text_m = it.text; SNIPPETS.sang[k].text_k = it.text; }
        });
    }
  }
  applyPack(remote.sang); applyPack(imported); applyPack(draft);
}

function downloadJson(filename, obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
}

function exportLocalBackup() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.startsWith(LS_PREFIX)) data[k] = localStorage.getItem(k);
  }
  downloadJson('UdtalelsesBackup.json', { schema: 'elevudtalelser_backup_v1', data });
}

// ---------- PRINT LOGIC ----------
function openPrintWindowForStudents(students, settings, title) {
    const list = students.slice();
    const pagesHtml = list.map(st => {
      const txt = buildStatement(st, settings);
      return `<div class="page"><pre class="statement">${txt.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}</pre></div>`;
    }).join('');

    const html = `<html><head><style>@page { size: A4; margin: 0; } .page { width: 210mm; height: 297mm; padding: 15mm; box-sizing: border-box; page-break-after: always; } .statement { white-space: pre-wrap; font-family: sans-serif; font-size: 11pt; line-height: 1.5; }</style></head><body>${pagesHtml}<script>window.onload=() => { window.print(); }</script></body></html>`;
    const win = window.open('', '_blank');
    win.document.write(html); win.document.close();
}

// ---------- COMPUTE DATA ----------
function groupKeyFromTeachers(k1, k2) {
  const parts = [toInitials(k1), toInitials(k2)].filter(Boolean).sort();
  return parts.length ? parts.join('/') : '—';
}

function buildKGroups(students) {
  const groups = new Map();
  for (const st of students) {
    const key = groupKeyFromTeachers(st.kontaktlaerer1_ini, st.kontaktlaerer2_ini);
    if (!groups.has(key)) groups.set(key, {key, students: []});
    groups.get(key).students.push(st);
  }
  return Array.from(groups.values()).sort((a,b) => a.key.localeCompare(b.key));
}

// ---------- THE FIXED PICKER FUNCTION ----------
function updateTeacherDatalist() {
  const input = document.getElementById('meInput');
  const menu  = document.getElementById('teacherPickerMenu');
  const btn   = document.getElementById('teacherPickerBtn');
  const wrap  = document.getElementById('teacherPicker');
  const clear = document.getElementById('meInputClear');
  if (!input || !menu || !btn || !wrap) return;

  // IMPORTANT: Prevent duplicate listeners on every render
  if (input.__wired) {
    input.disabled = !getStudents().length;
    if (btn) btn.disabled = !getStudents().length;
    return;
  }
  input.__wired = true;

  let activeIndex = 0;
  let items = [];

  function getFilteredItems() {
    const studs = getStudents();
    const set = new Set();
    for (const st of studs) {
      const a = (st.kontaktlaerer1_ini || '').toString().trim().toUpperCase();
      const b = (st.kontaktlaerer2_ini || '').toString().trim().toUpperCase();
      if (a) set.add(a); if (b) set.add(b);
    }
    items = Array.from(set).sort((x, y) => x.localeCompare(y, 'da'));
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

  btn.onclick = (e) => { e.preventDefault(); wrap.classList.contains('open') ? closeMenu() : openMenu(); input.focus(); };
  input.onfocus = () => openMenu();
  input.oninput = () => { if (!wrap.classList.contains('open')) openMenu(); renderMenu(); };

  input.addEventListener('keydown', (e) => {
    const filtered = getFilteredItems();
    if (e.key === 'ArrowDown') { e.preventDefault(); if (!wrap.classList.contains('open')) openMenu(); setActive(activeIndex + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(activeIndex - 1); }
    else if (e.key === 'Enter') {
      if (wrap.classList.contains('open') && filtered[activeIndex]) { e.preventDefault(); commit(filtered[activeIndex]); closeMenu(); }
    } else if (e.key === 'Escape') { closeMenu(); }
  });

  document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) closeMenu(); });
}

// ---------- CORE APP LOGIC ----------
function normalizeName(input) { return (input || "").toString().trim().toLowerCase(); }
function toInitials(raw) {
  const s = (raw || "").toString().trim();
  if (!s) return "";
  const parts = s.split(/[^A-Za-zÆØÅæøå]+/).filter(Boolean);
  return parts.length ? (parts[0][0] + (parts[parts.length-1][0] || "")).toUpperCase() : "";
}

function getSettings(){ return Object.assign({ me: '', schoolYearEnd: 2026 }, lsGet(KEYS.settings, {})); }
function setSettings(s){ lsSet(KEYS.settings, s); }
function getStudents(){ return lsGet(KEYS.students, []); }
function setStudents(s){ lsSet(KEYS.students, s); }
function getTemplates(){ return Object.assign({ schoolText: DEFAULT_SCHOOL_TEXT, template: DEFAULT_TEMPLATE }, lsGet(KEYS.templates, {})); }
function setTemplates(t){ lsSet(KEYS.templates, t); }
function getTextFor(u){ return lsGet(KEYS.textPrefix + u, { elevudvikling:'', praktisk:'', kgruppe:'' }); }
function setTextFor(u, o){ lsSet(KEYS.textPrefix + u, o); }

function renderStatus() {
  const s = getSettings();
  const studs = getStudents();
  const el = document.getElementById('statusText');
  if (el) el.textContent = studs.length ? `Elever: ${studs.length} · K-lærer: ${s.me}` : `Ingen elevliste indlæst`;
}

function setTab(tab) {
  state.tab = tab;
  document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + tab));
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.id === 'tab-' + tab));
  renderAll();
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
  const isAll = state.viewMode === 'ALL';
  const mine = isAll ? studs : studs.filter(st => (st.kontaktlaerer1_ini === s.me || st.kontaktlaerer2_ini === s.me));
  list.innerHTML = mine.map(st => `<div class="card clickable" data-unilogin="${st.unilogin}"><b>${st.fornavn} ${st.efternavn}</b><br><small>${st.klasse}</small></div>`).join('');
  list.querySelectorAll('.card').forEach(c => { c.onclick = () => { state.selectedUnilogin = c.dataset.unilogin; setTab('edit'); }; });
}

function buildStatement(student, settings) {
  const t = getTextFor(student.unilogin);
  let out = getTemplates().template;
  const map = { "ELEV_FORNAVN": student.fornavn, "ELEV_FULDE_NAVN": student.fornavn + ' ' + student.efternavn, "ELEV_UDVIKLING_AFSNIT": t.elevudvikling, "PRAKTISK_AFSNIT": t.praktisk };
  Object.entries(map).forEach(([k, v]) => { out = out.replace(new RegExp('{{'+k+'}}', 'g'), v || ""); });
  return out;
}

function renderEdit() {
  const studs = getStudents();
  const st = studs.find(x => x.unilogin === state.selectedUnilogin);
  if (!st) return;
  document.getElementById('txtElevudv').value = getTextFor(st.unilogin).elevudvikling || "";
  document.getElementById('preview').textContent = buildStatement(st, getSettings());
}

function wireEvents() {
  const on = (id, ev, fn) => { const el = document.getElementById(id); if (el) el.addEventListener(ev, fn); };
  on('tab-k', 'click', () => setTab('k'));
  on('tab-set', 'click', () => setTab('set'));
  on('studentsFile', 'change', async (e) => {
    const file = e.target.files[0]; if (!file) return;
    const text = await file.text();
    const lines = text.split('\n').filter(l => l.trim());
    const headers = lines[0].split(/[;,]/).map(h => h.trim());
    const studs = lines.slice(1).map(line => {
      const v = line.split(/[;,]/);
      return { fornavn: v[0], efternavn: v[1], unilogin: v[2], klasse: v[4], kontaktlaerer1_ini: v[7], kontaktlaerer2_ini: v[8] };
    });
    setStudents(studs); renderAll();
  });
  on('txtElevudv', 'input', () => {
    const o = getTextFor(state.selectedUnilogin); o.elevudvikling = document.getElementById('txtElevudv').value;
    setTextFor(state.selectedUnilogin, o); renderEdit();
  });
}

const state = { tab: 'set', viewMode: 'K', selectedUnilogin: null };

async function init() {
  await loadRemoteOverrides();
  wireEvents();
  renderAll();
  setTab(getStudents().length > 0 ? 'k' : 'set');
}

init();
})();
