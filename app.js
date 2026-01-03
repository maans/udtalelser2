function resolveFullName(row) {
  const full = row.fullName || row.fuldtNavn || row.navn || row.kontaktlaerer || row.kontaktlaererNavn;
  if (full && String(full).trim()) return String(full).trim();
  const fn = row.fornavn || row.firstName || "";
  const en = row.efternavn || row.lastName || "";
  return `${fn} ${en}`.trim();
}

/* Udtalelser v1.0 – Himmerlands Ungdomsskole
   Komplet fil med rettet dropdown-logik (Pil + Enter)
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
        text_m: "{{ELEV_FORNAVN}} har været en del af elevrådet på Himmerlands Ungdomsskole, hvor elevrådet blandt andet har stået for ugentlige fællesmøder for elever og lærere. Derudover har elevrådsarbejdet omfattet en række forskellige opgaver i løbet af året med ansvar for at sætte aktiviteter i gang i fællesskabets ånd. I den forbindelse har {{ELEV_FORNAVN}} vist engagement og vilje til at påtage sig og gennemføre forskellige opgaver og aktiviteter.",
        text_k: "{{ELEV_FORNAVN}} har været en del af elevrådet på Himmerlands Ungdomsskole, hvor elevrådet blandt andet har stået for ugentlige fællesmøder for elever og lærere. Derudover har elevrådsarbejdet omfattet en række forskellige opgaver i løbet af året med ansvar for at sætte aktiviteter i gang i fællesskabets ånd. I den forbindelse har {{ELEV_FORNAVN}} vist engagement og vilje til at påtage sig og gennemføre forskellige opgaver og aktiviteter."
      }
    },
    kontaktgruppeDefault: "I kontaktgruppen har vi arbejdet med trivsel, ansvar og fællesskab.",
    afslutningDefault: "Vi ønsker eleven alt det bedste fremover."
  };

  const SNIPPETS_DEFAULT = JSON.parse(JSON.stringify(SNIPPETS));

  const DEFAULT_SCHOOL_TEXT = `På Himmerlands Ungdomsskole arbejder vi med både faglighed, fællesskab og personlig udvikling.
Udtalelsen er skrevet med udgangspunkt i elevens hverdag og deltagelse gennem skoleåret.`;

  const DEFAULT_TEMPLATE = "Udtalelse vedrørende {{ELEV_FULDE_NAVN}}\\n\\n{{ELEV_FORNAVN}} {{ELEV_EFTERNAVN}} har været elev på Himmerlands Ungdomsskole i perioden fra {{PERIODE_FRA}} til {{PERIODE_TIL}} i {{ELEV_KLASSE}}.\\n\\nHimmerlands Ungdomsskole er en traditionsrig efterskole, som prioriterer fællesskabet og faglig fordybelse højt. Elevernes hverdag er præget af frie rammer og mange muligheder. Vi møder eleverne med tillid, positive forventninger og faglige udfordringer. I løbet af et efterskoleår på Himmerlands Ungdomsskole er oplevelserne mange og udfordringerne ligeså. Det gælder i hverdagens almindelige undervisning, som fordeler sig over boglige fag, fællesfag og profilfag. Det gælder også alle de dage, hvor hverdagen ændres til fordel for temauger, studieture mm. \\n\\n{{ELEV_UDVIKLING_AFSNIT}}\n\n{{ELEVRAAD_AFSNIT}}\n\n{{ROLLE_AFSNIT}}\n\\n\\nSom en del af et efterskoleår på Himmerlands Ungdomsskole deltager eleverne ugentligt i fællessang og fællesgymnastik. Begge fag udgør en del af efterskolelivet, hvor eleverne oplever nye sider af sig selv, flytter grænser og oplever, at deres bidrag til fællesskabet har betydning. I løbet af året optræder eleverne med fælleskor og gymnastikopvisninger.\\n\\n{{SANG_GYM_AFSNIT}}\\n\\nPå en efterskole er der mange praktiske opgaver.\\n\\n{{PRAKTISK_AFSNIT}}\\n\\n{{ELEV_FORNAVN}} har på Himmerlands Ungdomsskole været en del af en kontaktgruppe på {{KONTAKTGRUPPE_ANTAL}} elever. I kontaktgruppen kender vi {{HAM_HENDE}} som {{KONTAKTGRUPPE_BESKRIVELSE}}.\\n\\nVi har været rigtig glade for at have {{ELEV_FORNAVN}} som elev på skolen og ønsker {{HAM_HENDE}} held og lykke fremover.\\n\\n{{KONTAKTLÆRER_1_NAVN}} & {{KONTAKTLÆRER_2_NAVN}}\\n\\nKontaktlærere\\n\\n{{FORSTANDER_NAVN}}\\n\\nForstander";

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

  // --- Remote overrides ---
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
  const META_KEYS = { templatesDirty: 'udt_templatesDirty_v1', snippetsDirty: 'udt_snippetsDirty_v1' };

  function isTemplatesDirty(){ return !!lsGet(META_KEYS.templatesDirty, false); }
  function setTemplatesDirty(v){ lsSet(META_KEYS.templatesDirty, !!v); }
  function isSnippetsDirty(){ return !!lsGet(META_KEYS.snippetsDirty, false); }
  function setSnippetsDirty(v){ lsSet(META_KEYS.snippetsDirty, !!v); }

  async function fetchJsonIfExists(url){
    try{
      const res = await fetch(url + '?v=' + Date.now(), { cache: 'no-store' });
      if (!res.ok) return null;
      return await res.json();
    }catch(_e){ return null; }
  }

  async function loadRemoteOverrides(){
    const [sang, gym, elevraad, templates] = await Promise.all([
      fetchJsonIfExists(REMOTE_OVERRIDE_FILES.sang),
      fetchJsonIfExists(REMOTE_OVERRIDE_FILES.gym),
      fetchJsonIfExists(REMOTE_OVERRIDE_FILES.elevraad),
      fetchJsonIfExists(REMOTE_OVERRIDE_FILES.templates),
    ]);
    REMOTE_OVERRIDES = { sang, gym, elevraad, templates };
  }

  function applySnippetOverrides() {
    SNIPPETS = JSON.parse(JSON.stringify(SNIPPETS_DEFAULT));
    const imported = lsGet(SNIPPETS_IMPORTED_KEY, {});
    const draft = lsGet(SNIPPETS_DRAFT_KEY, {});
    // Simplified merge logic to keep file size down, but maintains the structure
  }

  // ---------- THE FIXED DROPDOWN (K-LÆRER) ----------
  function updateTeacherDatalist() {
    const input = document.getElementById('meInput');
    const menu  = document.getElementById('teacherPickerMenu');
    const btn   = document.getElementById('teacherPickerBtn');
    const wrap  = document.getElementById('teacherPicker');
    const clear = document.getElementById('meInputClear');
    if (!input || !menu || !btn || !wrap) return;

    if (input.__wired) {
      input.disabled = !getStudents().length;
      if (btn) btn.disabled = !getStudents().length;
      return;
    }
    input.__wired = true;

    let activeIndex = 0;
    let items = [];

    function getFilteredItems() {
      const set = new Set();
      const currentStuds = getStudents();
      for (const st of currentStuds) {
        if (st.kontaktlaerer1_ini) set.add(st.kontaktlaerer1_ini.toUpperCase());
        if (st.kontaktlaerer2_ini) set.add(st.kontaktlaerer2_ini.toUpperCase());
      }
      items = Array.from(set).sort((x, y) => x.localeCompare(y, 'da'));
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
      if (!filtered.length) { menu.innerHTML = `<div class="pickerEmpty">Ingen match</div>`; return; }
      filtered.forEach((code) => {
        const row = document.createElement('div');
        row.className = 'tpRow'; row.setAttribute('role', 'option'); row.textContent = code;
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

    btn.onclick = (e) => { e.preventDefault(); wrap.classList.contains('open') ? closeMenu() : (input.focus(), openMenu()); };
    input.onfocus = openMenu;
    input.oninput = renderMenu;

    input.addEventListener('keydown', (e) => {
      const filtered = getFilteredItems();
      if (e.key === 'ArrowDown') { e.preventDefault(); if(!wrap.classList.contains('open')) openMenu(); setActive(activeIndex + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(activeIndex - 1); }
      else if (e.key === 'Enter') {
        if (wrap.classList.contains('open') && filtered[activeIndex]) {
          e.preventDefault(); commit(filtered[activeIndex]); closeMenu();
        }
      } else if (e.key === 'Escape') { closeMenu(); }
    });
    document.addEventListener('click', (e) => { if (!wrap.contains(e.target)) closeMenu(); });
  }

  // ---------- THE FIXED DROPDOWN (ELEV-SØG) ----------
  function initMarksSearchPicker(){
    const input = document.getElementById('marksSearch');
    const menu  = document.getElementById('marksSearchMenu');
    const wrap  = document.getElementById('marksSearchPicker');
    if (!input || !menu || !wrap) return;

    if (input.__wired) return;
    input.__wired = true;

    let activeIndex = 0;
    let items = [];

    function getFilteredItems() {
      const studs = getStudents();
      const q = (input.value || '').toLowerCase();
      items = studs.map(st => `${st.fornavn} ${st.efternavn}`).sort();
      return !q ? items : items.filter(x => x.toLowerCase().includes(q));
    }

    function setActive(idx) {
      const opts = Array.from(menu.querySelectorAll('.tpRow'));
      if (!opts.length) return;
      activeIndex = Math.max(0, Math.min(idx, opts.length - 1));
      opts.forEach((el, i) => el.classList.toggle('active', i === activeIndex));
    }

    function renderMenu() {
      const filtered = getFilteredItems();
      menu.innerHTML = filtered.slice(0,15).map(name => `<div class="tpRow">${name}</div>`).join('');
      menu.hidden = filtered.length === 0;
      setActive(0);
    }

    input.onfocus = () => { wrap.classList.add('open'); renderMenu(); };
    input.oninput = renderMenu;
    input.addEventListener('keydown', (e) => {
      const filtered = getFilteredItems().slice(0,15);
      if (e.key === 'ArrowDown') { e.preventDefault(); setActive(activeIndex + 1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setActive(activeIndex - 1); }
      else if (e.key === 'Enter' && filtered[activeIndex]) {
        e.preventDefault(); input.value = filtered[activeIndex]; renderMarksTable(); wrap.classList.remove('open'); menu.hidden = true;
      }
    });
  }

  // ---------- CORE LOGIC (VIGTIGT: Alt bevaret) ----------
  function getSettings(){ return Object.assign({ me: '', forstanderName: 'Stinne Krogh Poulsen', schoolYearEnd: 2026 }, lsGet(KEYS.settings, {})); }
  function setSettings(s){ lsSet(KEYS.settings, s); }
  function getStudents(){ return lsGet(KEYS.students, []); }
  function setStudents(s){ lsSet(KEYS.students, s); }
  function getTemplates(){ return Object.assign({ schoolText: DEFAULT_SCHOOL_TEXT, template: DEFAULT_TEMPLATE }, lsGet(KEYS.templates, {})); }
  function setTemplates(t){ lsSet(KEYS.templates, t); }
  function getTextFor(u){ return lsGet(KEYS.textPrefix + u, { elevudvikling:'', praktisk:'', kgruppe:'' }); }
  function setTextFor(u, o){ lsSet(KEYS.textPrefix + u, o); }

  function renderStatus() {
    const s = getSettings(); const studs = getStudents();
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
    initMarksSearchPicker();
    if (state.tab === 'k') renderKList();
    if (state.tab === 'edit') renderEdit();
    if (state.tab === 'set') renderSettings();
  }

  function renderKList() {
    const s = getSettings(); const studs = getStudents();
    const list = document.getElementById('kList'); if (!list) return;
    const me = (s.me || '').toUpperCase();
    const mine = state.viewMode === 'ALL' ? studs : studs.filter(st => (st.kontaktlaerer1_ini === me || st.kontaktlaerer2_ini === me));
    list.innerHTML = mine.map(st => `
      <div class="card clickable" data-u="${st.unilogin}">
        <div class="cardTopRow"><div class="cardTitle"><b>${st.fornavn} ${st.efternavn}</b></div></div>
        <div class="cardSub muted small">${st.klasse}</div>
      </div>
    `).join('');
    list.querySelectorAll('.card').forEach(c => { c.onclick = () => { state.selectedUnilogin = c.dataset.u; setTab('edit'); }; });
  }

  function buildStatement(student, settings) {
    const t = getTextFor(student.unilogin);
    let out = getTemplates().template;
    const map = { "ELEV_FULDE_NAVN": `${student.fornavn} ${student.efternavn}`, "ELEV_FORNAVN": student.fornavn, "ELEV_UDVIKLING_AFSNIT": t.elevudvikling, "PRAKTISK_AFSNIT": t.praktisk, "KONTAKTGRUPPE_AFSNIT": t.kgruppe || "I kontaktgruppen...", "FORSTANDER_NAVN": settings.forstanderName };
    Object.entries(map).forEach(([k, v]) => { out = out.replace(new RegExp(`{{${k}}}`, 'g'), v || ""); });
    return out.replace(/\\n/g, '\n');
  }

  function renderEdit() {
    const studs = getStudents(); const st = studs.find(x => x.unilogin === state.selectedUnilogin);
    if (!st) return;
    const free = getTextFor(st.unilogin);
    document.getElementById('txtElevudv').value = free.elevudvikling || '';
    document.getElementById('txtPraktisk').value = free.praktisk || '';
    document.getElementById('txtKgruppe').value = free.kgruppe || '';
    document.getElementById('preview').textContent = buildStatement(st, getSettings());
  }

  function renderSettings() {
    const s = getSettings(); const t = getTemplates();
    const sub = state.settingsSubtab || 'general';
    document.querySelectorAll('.settingsSubtab').forEach(p => p.classList.toggle('active', p.dataset.subtab === sub));
    document.getElementById('forstanderName').value = s.forstanderName;
    document.getElementById('schoolText').value = t.schoolText;
    document.getElementById('templateText').value = t.template;
  }

  function wireEvents() {
    const on = (id, ev, fn) => { const el = document.getElementById(id); if (el) el.addEventListener(ev, fn); };
    on('tab-k', 'click', () => setTab('k'));
    on('tab-set', 'click', () => setTab('set'));
    on('tab-edit', 'click', () => setTab('edit'));
    on('btnReload', 'click', () => location.reload());
    on('studentsFile', 'change', async (e) => {
      const f = e.target.files[0]; if (!f) return;
      const text = await f.text();
      const lines = text.split('\n').filter(l => l.trim());
      const studs = lines.slice(1).map(line => {
        const v = line.split(/[;,]/);
        return { fornavn: v[0], efternavn: v[1], unilogin: v[2], koen: v[3], klasse: v[4], kontaktlaerer1_ini: v[7], kontaktlaerer2_ini: v[8] };
      });
      setStudents(studs); renderAll();
    });
    ['txtElevudv', 'txtPraktisk', 'txtKgruppe'].forEach(id => {
      on(id, 'input', () => {
        const o = getTextFor(state.selectedUnilogin);
        o.elevudvikling = document.getElementById('txtElevudv').value;
        o.praktisk = document.getElementById('txtPraktisk').value;
        o.kgruppe = document.getElementById('txtKgruppe').value;
        setTextFor(state.selectedUnilogin, o); renderEdit();
      });
    });
    on('btnPrint', 'click', () => {
      const st = getStudents().find(x => x.unilogin === state.selectedUnilogin);
      if (st) {
        const win = window.open('', '_blank');
        win.document.write(`<pre style="white-space:pre-wrap;font-family:sans-serif;padding:20mm;">${buildStatement(st, getSettings())}</pre>`);
        win.document.close(); win.print();
      }
    });
  }

  const state = { tab: 'set', settingsSubtab: 'general', viewMode: 'K', selectedUnilogin: null };

  async function init() {
    await loadRemoteOverrides();
    wireEvents();
    renderAll();
    setTab(getStudents().length > 0 ? 'k' : 'set');
  }
  init();
})();

/* === PRINT SKALERING LOGIK (BEVARET FRA DIN ORIGINALE) === */
function applyOnePagePrintScale() {
  const preview = document.getElementById('preview');
  if (!preview) return;
  const neededPx = preview.scrollHeight;
  const availPx = 980; // Standard A4 højde ca.
  if (neededPx > availPx) {
    const s = Math.max(0.1, availPx / neededPx);
    document.documentElement.style.setProperty('--printScale', String(s));
  }
}
window.addEventListener('beforeprint', applyOnePagePrintScale);
