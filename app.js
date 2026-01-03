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
        text_m: "{{ELEV_FORNAVN}} har været en del af elevrådet på Himmerlands Ungdomsskole, hvor elevrådet blandt andet har stået for ugentlige fællesmøder for elever og lærere. Derudover har elevrådsarbejdet omfattet en række forskellige opgaver i løbet af året med ansvar for at sætte aktiviteter i gang i fællesskabets ånd. I den forbindelse har {{ELEV_FORNAVN}} vist engagement og vilje til at påtage sig og gennemføre forskellige opgaver og aktiviteter.",
        text_k: "{{ELEV_FORNAVN}} har været en del af elevrådet på Himmerlands Ungdomsskole, hvor elevrådet blandt andet har stået for ugentlige fællesmøder for elever og lærere. Derudover har elevrådsarbejdet omfattet en række forskellige opgaver i løbet af året med ansvar for at sætte aktiviteter i gang i fællesskabets ånd. I den forbindelse har {{ELEV_FORNAVN}} vist engagement og vilje til at påtage sig og gennemføre forskellige opgaver og aktiviteter."
      }
    },
    kontaktgruppeDefault: "I kontaktgruppen har vi arbejdet med trivsel, ansvar og fællesskab.",
    afslutningDefault: "Vi ønsker eleven alt det bedste fremover."
  };

  const DEFAULT_ALIAS_MAP = {}; 
  const SNIPPETS_DEFAULT = JSON.parse(JSON.stringify(SNIPPETS));

  const DEFAULT_SCHOOL_TEXT =
`På Himmerlands Ungdomsskole arbejder vi med både faglighed, fællesskab og personlig udvikling.
Udtalelsen er skrevet med udgangspunkt i elevens hverdag og deltagelse gennem skoleåret.`;

  const DEFAULT_TEMPLATE = "Udtalelse vedrørende {{ELEV_FULDE_NAVN}}\\n\\n{{ELEV_FORNAVN}} {{ELEV_EFTERNAVN}} har været elev på Himmerlands Ungdomsskole i perioden fra {{PERIODE_FRA}} til {{PERIODE_TIL}} i {{ELEV_KLASSE}}.\\n\\nHimmerlands Ungdomsskole er en traditionsrig efterskole, som prioriterer fællesskabet og faglig fordybelse højt. Elevernes hverdag er præget af frie rammer og mange muligheder. Vi møder eleverne med tillid, positive forventninger og faglige udfordringer. I løbet af et efterskoleår på Himmerlands Ungdomsskole er oplevelserne mange og udfordringerne ligeså. Det gælder i hverdagens almindelige undervisning, som fordeler sig over boglige fag, fællesfag og profilfag. Det gælder også alle de dage, hvor hverdagen ændres til fordel for temauger, studieture mm. \\n\\n{{ELEV_UDVIKLING_AFSNIT}}\n\n{{ELEVRAAD_AFSNIT}}\n\n{{ROLLE_AFSNIT}}\n\\n\\nSom en part af et efterskoleår på Himmerlands Ungdomsskole deltager eleverne ugentligt i fællessang og fællesgymnastik. Begge fag udgør en del af efterskolelivet, hvor eleverne oplever nye sider af sig selv, flytter grænser og oplever, at deres bidrag til fællesskabet har betydning. I løbet af året optræder eleverne med fælleskor og gymnastikopvisninger.\\n\\n{{SANG_GYM_AFSNIT}}\\n\\nPå en efterskole er der mange praktiske opgaver.\\n\\n{{PRAKTISK_AFSNIT}}\\n\\n{{ELEV_FORNAVN}} har på Himmerlands Ungdomsskole været en del af en kontaktgruppe på {{KONTAKTGRUPPE_ANTAL}} elever. I kontaktgruppen kender vi {{HAM_HENDE}} som {{KONTAKTGRUPPE_BESKRIVELSE}}.\\n\\nVi har været rigtig glade for at have {{ELEV_FORNAVN}} som elev på skolen og ønsker {{HAM_HENDE}} held og lykke fremover.\\n\\n{{KONTAKTLÆRER_1_NAVN}} & {{KONTAKTLÆRER_2_NAVN}}\\n\\nKontaktlærere\\n\\n{{FORSTANDER_NAVN}}\\n\\nForstander";

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

const SNIPPETS_LEGACY_KEY = 'udt_snippets_override_v1';
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

function stampOverridesFetched(){ lsSet(META_KEYS.remoteOverridesFetchedAt, Date.now()); }
function overridesFetchedAt(){ return lsGet(META_KEYS.remoteOverridesFetchedAt, 0) || 0; }

function cacheBust(url){
  const v = Date.now();
  return url + (url.includes('?') ? '&' : '?') + 'v=' + v;
}
async function fetchJsonIfExists(url){
  try{
    const res = await fetch(cacheBust(url), { cache: 'no-store' });
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
  return s
    .replace(/\\r\\n/g, "\n")
    .replace(/\\n/g, "\n")
    .replace(/\r\n/g, "\n");
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
  const tplObjNorm = normalizeOverrideDeep(tplObj);

  REMOTE_OVERRIDES = {
    sang: normalizeOverrideDeep(unwrapOverridePack(sang)),
    gym: normalizeOverrideDeep(unwrapOverridePack(gym)),
    elevraad: normalizeOverrideDeep(unwrapOverridePack(elevraad)),
    templates: tplObjNorm,
  };
  stampOverridesFetched();
}


function getSnippetImported() {
  return lsGet(SNIPPETS_IMPORTED_KEY, {}) || {};
}
function setSnippetImported(o) {
  lsSet(SNIPPETS_IMPORTED_KEY, o || {});
}
function getSnippetDraft() {
  const draft = lsGet(SNIPPETS_DRAFT_KEY, null);
  if (draft) return draft || {};
  const legacy = lsGet(SNIPPETS_LEGACY_KEY, null);
  if (legacy) {
    lsSet(SNIPPETS_DRAFT_KEY, legacy);
    try { localStorage.removeItem(SNIPPETS_LEGACY_KEY); } catch {}
    return legacy || {};
  }
  return {};
}
function setSnippetDraft(o) {
  lsSet(SNIPPETS_DRAFT_KEY, o || {});
}

function clearLocalSnippetScope(scope){
  const d = getSnippetDraft();
  const i = getSnippetImported();
  if (scope && typeof scope === 'string') {
    delete d[scope];
    delete i[scope];
  }
  setSnippetDraft(d);
  setSnippetImported(i);
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

    const sang = pack.sang && (pack.sang.items ? pack.sang : pack.sang.sang); 
    if (sang && sang.items) {
      Object.keys(sang.items).forEach(k => {
        const it = sang.items[k] || {};
        if (!SNIPPETS.sang[k]) SNIPPETS.sang[k] = { title: k, text_m: '', text_k: '' };
        if (typeof it.label === 'string' && it.label.trim()) SNIPPETS.sang[k].title = it.label.trim();
        if (typeof it.text === 'string') { SNIPPETS.sang[k].text_m = it.text; SNIPPETS.sang[k].text_k = it.text; }
        if (typeof it.text_m === 'string') SNIPPETS.sang[k].text_m = it.text_m;
        if (typeof it.text_k === 'string') SNIPPETS.sang[k].text_k = it.text_k;
      });
    } else if (pack.snippets && pack.snippets.sang) {
      Object.keys(pack.snippets.sang).forEach(k => {
        const it = pack.snippets.sang[k] || {};
        if (!SNIPPETS.sang[k]) SNIPPETS.sang[k] = { title: k, text_m: '', text_k: '' };
        if (typeof it.label === 'string') SNIPPETS.sang[k].title = it.label;
        if (typeof it.text === 'string') { SNIPPETS.sang[k].text_m = it.text; SNIPPETS.sang[k].text_k = it.text; }
      });
    }

    const gym = pack.gym && (pack.gym.variants || pack.gym.roles) ? pack.gym : (pack.gym && pack.gym.gym ? pack.gym.gym : null);
    if (gym && gym.variants) {
      Object.keys(gym.variants).forEach(k => {
        const it = gym.variants[k] || {};
        if (!SNIPPETS.gym[k]) SNIPPETS.gym[k] = { title: k, text_m: '', text_k: '' };
        if (typeof it.label === 'string' && it.label.trim()) SNIPPETS.gym[k].title = it.label.trim();
        if (typeof it.text === 'string') { SNIPPETS.gym[k].text_m = it.text; SNIPPETS.gym[k].text_k = it.text; }
        if (typeof it.text_m === 'string') SNIPPETS.gym[k].text_m = it.text_m;
        if (typeof it.text_k === 'string') SNIPPETS.gym[k].text_k = it.text_k;
      });
    }
    if (gym && gym.roles) {
      Object.keys(gym.roles).forEach(k => {
        const it = gym.roles[k] || {};
        if (!SNIPPETS.roller[k]) SNIPPETS.roller[k] = { title: k, text_m: '', text_k: '' };
        if (typeof it.label === 'string' && it.label.trim()) SNIPPETS.roller[k].title = it.label.trim();
        if (typeof it.text === 'string') { SNIPPETS.roller[k].text_m = it.text; SNIPPETS.roller[k].text_k = it.text; }
        if (typeof it.text_m === 'string') SNIPPETS.roller[k].text_m = it.text_m;
        if (typeof it.text_k === 'string') SNIPPETS.roller[k].text_k = it.text_k;
      });
    }

    const er = pack.elevraad && (typeof pack.elevraad.text === 'string') ? pack.elevraad : (pack.elevraad && pack.elevraad.elevraad ? pack.elevraad.elevraad : null);
    if (er && typeof er.text === 'string') {
      if (!SNIPPETS.elevraad.YES) SNIPPETS.elevraad.YES = { title: 'Elevrådsrepræsentant', text_m: '', text_k: '' };
      SNIPPETS.elevraad.YES.text_m = er.text;
      SNIPPETS.elevraad.YES.text_k = er.text;
      if (typeof er.label === 'string' && er.label.trim()) SNIPPETS.elevraad.YES.title = er.label.trim();
    }
  }

  applyPack(remote.sang);
  applyPack(remote.gym);
  applyPack(remote.elevraad);
  applyPack(imported);
  applyPack(draft);
}

function downloadJson(filename, obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(()=>{ try{ URL.revokeObjectURL(url); }catch(e){} }, 250);
}

function exportLocalBackup() {
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k || !k.startsWith(LS_PREFIX)) continue;
    data[k] = localStorage.getItem(k);
  }
  if (!Object.keys(data).length) {
    alert('Der var ingen lokale data at tage backup af endnu.');
    return;
  }
  let ini = '';
  try {
    const s = getSettings();
    const raw = ((s.me || s.meResolved || '') + '').trim();
    ini = toInitials(raw);
  } catch(_) {}
  const fn = `${(ini || 'XX')}_UdtalelsesBackup.json`;
  downloadJson(fn, {
    schema: 'elevudtalelser_backup_v1',
    prefix: LS_PREFIX,
    createdAt: new Date().toISOString(),
    data
  });
}

function getMyKStudents() {
  const s = getSettings();
  const studs = getStudents();
  const meIni = toInitials((s.me || '') + '');
  if (!studs.length || !meIni) return [];
  return sortedStudents(studs)
    .filter(st => toInitials(st.kontaktlaerer1_ini) === meIni || toInitials(st.kontaktlaerer2_ini) === meIni);
}

function applyOnePagePrintScale() {
  const preview = document.getElementById('preview');
  if (!preview) return;
  document.documentElement.style.setProperty('--printScale', '1');
  const txt = (preview.textContent || '').trim();
  if (!txt) return;

  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed; left:-9999px; top:-9999px; width:1mm; height:261mm; visibility:hidden; pointer-events:none;';
  document.body.appendChild(probe);
  const availPx = probe.getBoundingClientRect().height;
  probe.remove();

  const neededPx = preview.scrollHeight;
  if (!availPx || !neededPx) return;

  if (neededPx > availPx) {
    const s = Math.max(0.10, Math.min(1, availPx / neededPx));
    document.documentElement.style.setProperty('--printScale', String(s));
  }
}


function openPrintWindowForStudents(students, settings, title) {
  const escapeHtml = (s) => String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));

  const list = sortedStudents(Array.isArray(students) ? students : []);
  const pagesHtml = list.map(st => {
    const txt = buildStatement(st, settings);
    return `
      <div class="page">
        <div class="content">
          <pre class="statement">${escapeHtml(txt)}</pre>
        </div>
      </div>`;
  }).join('');

  const docTitle = escapeHtml(title || 'Print');

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>${docTitle}</title>
  <style>
    @page { size: A4; margin: 0; }
    html, body { margin: 0; padding: 0; background: #fff; }
    .page {
      width: 210mm;
      height: 297mm;
      padding: 12mm 14mm;
      box-sizing: border-box;
      page-break-after: always;
      overflow: hidden;
      --s: 1;
    }
    .content { width: 100%; height: 100%; overflow: hidden; }
    .statement {
      margin: 0;
      white-space: pre-wrap;
      font-family: system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif;
      font-size: 12pt;
      line-height: 1.45;
      transform: scale(var(--s));
      transform-origin: top left;
    }
  </style>
</head>
<body>
${pagesHtml}
<script>
(function(){
  function fitAll(){
    const pages = document.querySelectorAll('.page');
    pages.forEach(p => {
      const c = p.querySelector('.statement');
      if(!c) return;
      p.style.setProperty('--s', 1);
      c.style.width = '';
      const availH = p.clientHeight;
      const availW = p.clientWidth;
      let neededH = c.scrollHeight;
      let neededW = c.scrollWidth;
      let s = Math.min(1, availH / Math.max(1, neededH), availW / Math.max(1, neededW));
      if (s < 1) {
        c.style.width = (100 / s) + '%';
        neededH = c.scrollHeight;
        neededW = c.scrollWidth;
        s = Math.min(s, availH / Math.max(1, neededH), availW / Math.max(1, neededW));
      }
      p.style.setProperty('--s', s.toFixed(4));
    });
  }
  window.addEventListener('load', () => {
    fitAll();
    setTimeout(fitAll, 50);
    setTimeout(() => { try { window.focus(); window.print(); } catch(e) {} }, 120);
  });
})();
</script>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) {
    alert('Kunne ikke åbne print-vindue (pop-up blokeret).');
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
}

async function printAllKStudents() {
  try {
    await loadRemoteOverrides();
    applyTemplatesFromOverridesToLocal({ preserveLocks: true });
  } catch (_) {}

  const studs = getStudents();
  const kGroups = buildKGroups(studs);
  const isAll = state.viewMode === 'ALL';
  const list = isAll
    ? ((kGroups[state.kGroupIndex] && kGroups[state.kGroupIndex].students) ? kGroups[state.kGroupIndex].students.slice() : [])
    : getMyKStudents();

  if (!list.length) {
    alert(isAll
      ? 'Der er ingen elever i denne K-gruppe at printe.'
      : 'Der er ingen K-elever at printe (tjek elevliste og initialer).'
    );
    return;
  }

  const title = isAll ? 'Udtalelser v1.0 – print K-gruppe' : 'Udtalelser v1.0 – print K-elever';
  const sorted = sortedStudents(list);
  openPrintWindowForStudents(sorted, getSettings(), title);
}

async function printAllKGroups() {
  try {
    await loadRemoteOverrides();
    applyTemplatesFromOverridesToLocal({ preserveLocks: true });
  } catch(_) {}

  const studs = getStudents();
  if (!studs.length) {
    alert('Der er ingen elevliste indlæst endnu.');
    return;
  }
  const kGroups = buildKGroups(studs);
  const all = [];

  kGroups.forEach(g => {
    (g.students || []).forEach(st => all.push(st));
  });

  if (!all.length) {
    alert('Der var ingen elever i K-grupperne at printe.');
    return;
  }

  const title = 'Udtalelser v1.0 – print alle K-grupper';
  const styles = `
    <style>
      @page { size: A4; margin: 18mm 16mm; }
      body{ font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; color:#000; background:#fff; }
      .entry{ page-break-after: always; }
      .page{ width: 178mm; height: 261mm; overflow:hidden; position:relative; }
      pre.content{
        white-space: pre-wrap;
        font: 11pt/1.45 ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        margin:0;
        transform: scale(var(--s, 1));
        transform-origin: top left;
        width: calc(100% / var(--s, 1));
      }
    </style>
  `;
  const body = all.map(st => {
    const txt = buildStatement(st, getSettings());
    return `
      <section class="entry">
        <div class="page"><pre class="content">${escapeHtml(txt)}</pre></div>
      </section>
    `;
  }).join('');

  const w = window.open('', '_blank');
  if (!w) {
    alert('Pop-up blev blokeret. Tillad pop-ups for at printe.');
    return;
  }
  w.document.open();
  w.document.write(`<!doctype html><html lang="da"><head><meta charset="utf-8"><title>${title}</title>${styles}</head><body>${body}
    <script>
      (function(){
        function fitAll(){
          const pages = Array.from(document.querySelectorAll('.page'));
          pages.forEach(p=>{
            const c = p.querySelector('.content');
            if(!c) return;
            p.style.setProperty('--s','1');
            const avail = p.clientHeight;
            const needed = c.scrollHeight;
            let s = 1;
            if (needed > avail && avail > 0) s = Math.max(0.10, Math.min(1, avail / needed));
            p.style.setProperty('--s', String(s));
          });
        }
        window.addEventListener('load', fitAll);
        window.addEventListener('beforeprint', fitAll);
      })();
    </script>
  </body></html>`);
  w.document.close();
  setTimeout(()=>{ try{ w.focus(); w.print(); }catch(e){} }, 250);
}

function importLocalBackup(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const obj = JSON.parse(String(reader.result || '{}'));
      if (!obj || typeof obj !== 'object' || !obj.data) throw new Error('Ugyldig backupfil.');
      const prefix = obj.prefix || LS_PREFIX;

      const textKeyPrefix = prefix + 'text_';
      let mergedText = 0, addedText = 0, skippedText = 0;
      let addedOther = 0, skippedOther = 0;

      Object.entries(obj.data).forEach(([k, v]) => {
        if (typeof k !== 'string' || !k.startsWith(prefix)) return;
        const incomingRaw = String(v ?? '');
        if (k === KEYS.settings) { skippedOther++; return; }
        if (k.startsWith(textKeyPrefix)) {
          const existingRaw = localStorage.getItem(k);
          if (!existingRaw) {
            localStorage.setItem(k, incomingRaw);
            addedText++;
            return;
          }
          try {
            const ex = JSON.parse(existingRaw || '{}') || {};
            const inc = JSON.parse(incomingRaw || '{}') || {};
            const fields = ['elevudvikling','praktisk','kgruppe'];
            let changed = false;
            fields.forEach(f => {
              const exVal = ((ex[f] ?? '') + '').trim();
              const incVal = ((inc[f] ?? '') + '').trim();
              if (!exVal && incVal) { ex[f] = inc[f]; changed = true; }
            });
            if (!((ex.lastEditedBy || '') + '').trim() && ((inc.lastEditedBy || '') + '').trim()) {
              ex.lastEditedBy = inc.lastEditedBy;
              changed = true;
            }
            if (changed) {
              localStorage.setItem(k, JSON.stringify(ex));
              mergedText++;
            } else {
              skippedText++;
            }
          } catch (_) {
            skippedText++;
          }
          return;
        }
        if (localStorage.getItem(k) == null) {
          localStorage.setItem(k, incomingRaw);
          addedOther++;
        } else {
          skippedOther++;
        }
      });

      alert(
        `Backup importeret (sikkert)\n\n` +
        `Tekster: +${addedText} nye, +${mergedText} udfyldt (tomt→fyldt), ${skippedText} uændret\n` +
        `Andet: +${addedOther} nye nøgler, ${skippedOther} uændret\n\n` +
        `Tip: Import af kollegers backup udfylder primært tomme felter – det overskriver ikke din tekst.`
      );
      location.reload();
    } catch (err) {
      alert(err?.message || 'Kunne ikke indlæse backup.');
    }
  };
  reader.readAsText(file);
}


function buildOverridePackage(scope) {
  const today = new Date().toISOString().slice(0,10);
  const s = getSettings();
  const author = (s && s.me) ? String(s.me) : '';
  const pkg = { schema: OVERRIDE_SCHEMA, scope, author, createdAt: today, payload: {} };

  if (scope === 'sang') {
    const items = {};
    ['S1','S2','S3'].forEach(k => {
      const label = ($('sangLabel_'+k)?.value || '').trim() || k;
      const text = ($('sangText_'+k)?.value || '').trim();
      items[k] = { label, text };
    });
    pkg.payload.sang = { items, order: ['S1','S2','S3'] };
  }

  if (scope === 'gym') {
    const variants = {};
    ['G1','G2','G3'].forEach(k => {
      const label = ($('gymLabel_'+k)?.value || '').trim() || k;
      const text = ($('gymText_'+k)?.value || '').trim();
      variants[k] = { label, text };
    });
    const roles = {};
    const roleRows = Array.from(document.querySelectorAll('[data-role-key]'));
    roleRows.forEach(row => {
      const key = row.getAttribute('data-role-key');
      const label = (row.querySelector('.roleLabel')?.value || '').trim() || key;
      const text = (row.querySelector('.roleText')?.value || '').trim();
      if (key) roles[key] = { label, text };
    });
    pkg.payload.gym = {
      variants,
      variantOrder: ['G1','G2','G3'],
      roles,
      roleOrder: Object.keys(roles)
    };
  }

  if (scope === 'elevraad') {
    const text = ($('elevraadText')?.value || '').trim();
    pkg.payload.elevraad = { label: 'Elevråd', text };
  }

  if (scope === 'templates') {
    const t = getTemplates();
    const s2 = getSettings();
    pkg.payload.templates = {
      forstanderNavn: (s2.forstanderName || '').trim(),
      schoolText: String(t.schoolText ?? DEFAULT_SCHOOL_TEXT),
      template: String(t.template ?? DEFAULT_TEMPLATE)
    };
  }
  return pkg;
}

function importOverridePackage(expectedScope, obj) {
  if (!obj || obj.schema !== OVERRIDE_SCHEMA) throw new Error('Forkert fil: schema matcher ikke.');
  if (!obj.scope) throw new Error('Forkert fil: mangler scope.');
  if (obj.scope !== expectedScope && obj.scope !== 'all') throw new Error('Forkert fil: scope matcher ikke.');

  const overrides = getSnippetImported();
  const p = obj.payload || {};

  if (obj.scope === 'all' || obj.scope === 'sang') {
    if (p.sang && p.sang.items) overrides.sang = p.sang;
  }
  if (obj.scope === 'all' || obj.scope === 'gym') {
    if (p.gym) overrides.gym = p.gym;
  }
  if (obj.scope === 'all' || obj.scope === 'elevraad') {
    if (p.elevraad) overrides.elevraad = p.elevraad;
  }
  if (obj.scope === 'all' || obj.scope === 'sang' || obj.scope === 'gym' || obj.scope === 'elevraad') {
    setSnippetsDirty(true);
  }
  if (expectedScope === 'templates' || obj.scope === 'templates' || obj.scope === 'all') {
    if (p.templates) {
      const tImp = lsGet(KEYS.templatesImported, {});
      if (typeof p.templates.schoolText === 'string') tImp.schoolText = p.templates.schoolText;
      if (typeof p.templates.template === 'string') tImp.template = p.templates.template;
      if (typeof p.templates.forstanderName === 'string') tImp.forstanderName = p.templates.forstanderName;
      if (typeof p.templates.forstanderNavn === 'string') tImp.forstanderName = p.templates.forstanderNavn;
      lsSet(KEYS.templatesImported, tImp);
      setTemplatesDirty(true);
    }
  }
  setSnippetImported(overrides);
  setSnippetsDirty(true);
  applySnippetOverrides();
}

  function normalizeName(input) {
  if (!input) return "";
  return input
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\./g, " ")
    .replace(/æ/g, "ae")
    .replace(/ø/g, "oe")
    .replace(/å/g, "aa")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function uniqStrings(arr) {
  const out = [];
  const seen = new Set();
  for (const v of arr || []) {
    const raw = (v || "").toString().trim();
    if (!raw) continue;
    const k = normalizeName(raw);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(raw);
  }
  return out;
}

function getAllTeacherNamesFromStudents() {
  const studs = (window.__STATE__ && window.__STATE__.students) ? window.__STATE__.students : [];
  const names = [];
  for (const st of studs) {
    if (st && st.kontaktlaerer1) names.push(st.kontaktlaerer1);
    if (st && st.kontaktlaerer2) names.push(st.kontaktlaerer2);
  }
  return uniqStrings(names).sort((a,b) => normalizeName(a).localeCompare(normalizeName(b)));
}

function resolveTeacherMatch(raw) {
  const s = getSettings();
  const input = (raw ?? "").toString().trim();
  if (!input) return { raw: "", resolved: "" };

  const aliasMap = { ...(s && s.aliasMap ? s.aliasMap : {}), ...DEFAULT_ALIAS_MAP };
  const key = normalizeName(input).replace(/\s+/g, "");
  if (aliasMap && aliasMap[key]) {
    return { raw: input, resolved: aliasMap[key] };
  }

  const all = getAllTeacherNamesFromStudents();
  const nIn = normalizeName(input);
  const exact = all.find(n => normalizeName(n) === nIn);
  if (exact) return { raw: input, resolved: exact };

  const partial = all.filter(n => normalizeName(n).includes(nIn));
  if (partial.length === 1) return { raw: input, resolved: partial[0] };

  return { raw: input, resolved: input };
}

function resolveTeacherName(raw) {
  return resolveTeacherMatch(raw).resolved;
}

function toInitials(raw) {
  const s = (raw ?? "").toString().trim();
  if (!s) return "";
  const up = s.toUpperCase();
  if (/^[A-ZÆØÅ]{1,4}$/.test(up)) return up;
  const parts = up.split(/[^A-ZÆØÅ]+/).filter(Boolean);
  if (!parts.length) return "";
  const first = parts[0][0] || "";
  const last = parts[parts.length - 1][0] || "";
  return (first + last).toUpperCase();
}


function reverseResolveTeacherInitials(nameOrInitials) {
  const s = getSettings();
  const m = { ...(s.aliasMap || {}), ...DEFAULT_ALIAS_MAP };
  const key = ((nameOrInitials||'')+'').trim().toLowerCase();
  for (const [ini, full] of Object.entries(m)) {
    if (((full||'')+'').trim().toLowerCase() === key) return (ini||'').toUpperCase();
  }
  return '';
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
  const coll = new Intl.Collator('da', {sensitivity:'base'});
  for (const g of groups.values()) {
    g.students.sort((x,y)=> {
      const a = (x.efternavn||'').trim(); const b=(y.efternavn||'').trim();
      const c = coll.compare(a,b);
      if (c) return c;
      return coll.compare((x.fornavn||'').trim(), (y.fornavn||'').trim());
    });
  }
  const arr = Array.from(groups.values()).sort((g1,g2)=>{
    if (g1.key==='—' && g2.key!=='—') return 1;
    if (g2.key==='—' && g1.key!=='—') return -1;
    return coll.compare(g1.key,g2.key);
  });
  return arr;
}

function computeMissingKTeacher(students) {
  const miss = [];
  for (const st of students) {
    const k1 = ((st.kontaktlaerer1_ini||'')+'').trim();
    const k2 = ((st.kontaktlaerer2_ini||'')+'').trim();
    if (!k1 && !k2) miss.push(st);
  }
  return miss;
}

/**
 * OPPDATERET: updateTeacherDatalist
 * Løser problemet med at Pil-ned og Enter ikke virker korrekt ved valg af K-lærer.
 */
function updateTeacherDatalist() {
  const input = document.getElementById('meInput');
  const menu  = document.getElementById('teacherPickerMenu');
  const btn   = document.getElementById('teacherPickerBtn');
  const wrap  = document.getElementById('teacherPicker');
  const clear = document.getElementById('meInputClear');
  if (!input || !menu || !btn || !wrap) return;

  // FORHINDRER FLERE EVENT-LISTENERS
  if (input.__wired) {
    const studs = getStudents();
    input.disabled = !studs.length;
    btn.disabled = !studs.length;
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
      if (a) set.add(a);
      if (b) set.add(b);
    }
    items = Array.from(set).sort((x, y) => x.localeCompare(y, 'da'));

    const filtered = getFilteredItems();
    menu.innerHTML = '';
    
    if (!filtered.length) {
      menu.innerHTML = `<div class="pickerEmpty">Ingen match</div>`;
      return;
    }

    filtered.slice(0, 24).forEach((code, i) => {
      const row = document.createElement('div');
      row.className = 'tpRow';
      row.setAttribute('role', 'option');
      row.dataset.value = code;
      row.textContent = code;
      row.addEventListener('mousedown', (e) => {
        e.preventDefault();
        commit(code);
        closeMenu();
      });
      menu.appendChild(row);
    });
    setActive(0);
  }

  function openMenu() {
    renderMenu();
    menu.hidden = false;
    wrap.classList.add('open');
  }

  function closeMenu() {
    wrap.classList.remove('open');
    menu.hidden = true;
    activeIndex = 0;
  }

  function commit(code) {
    const ini = (code || '').toString().trim().toUpperCase();
    const s2 = getSettings();
    s2.me = ini;
    setSettings(s2);
    input.value = ini;
    renderStatus();
    if (clear) clear.hidden = !ini;
    try { state.viewMode = 'K'; setTab('k'); } catch (_) {}
  }

  btn.onclick = (e) => {
    e.preventDefault();
    wrap.classList.contains('open') ? closeMenu() : openMenu();
    input.focus();
  };

  input.onfocus = () => openMenu();
  
  input.oninput = () => {
    if (!wrap.classList.contains('open')) openMenu();
    renderMenu();
  };

  if (clear) {
    clear.onclick = (e) => {
      e.preventDefault();
      const s2 = getSettings(); s2.me = ''; s2.meResolved = ''; setSettings(s2);
      input.value = '';
      clear.hidden = true;
      closeMenu();
      renderStatus();
    };
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeMenu();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!wrap.classList.contains('open')) {
        openMenu();
      } else {
        e.preventDefault();
        setActive(activeIndex + (e.key === 'ArrowDown' ? 1 : -1));
      }
    } else if (e.key === 'Enter') {
      const filtered = getFilteredItems();
      if (wrap.classList.contains('open') && filtered[activeIndex]) {
        e.preventDefault();
        commit(filtered[activeIndex]);
        closeMenu();
      }
    }
  });

  document.addEventListener('click', (e) => {
    if (!wrap.contains(e.target)) closeMenu();
  });
}


function initMarksSearchPicker(){
  const input = document.getElementById('marksSearch');
  const menu  = document.getElementById('marksSearchMenu');
  const btn   = document.getElementById('marksSearchBtn');
  const wrap  = document.getElementById('marksSearchPicker');
  const clear = document.getElementById('marksSearchClear');
  if (!input || !menu || !btn || !wrap) return;

  let items = [];
  let activeIndex = 0;

  function setActive(idx){
    const opts = Array.from(menu.querySelectorAll('[role="option"]'));
    if (!opts.length) return;
    activeIndex = Math.max(0, Math.min(idx, opts.length-1));
    opts.forEach((el,i)=>el.classList.toggle('active', i===activeIndex));
    const el = opts[activeIndex];
    if (el) el.scrollIntoView({ block: 'nearest' });
  }

  function computeItems(){
    const studs = getStudents();
    const coll = new Intl.Collator('da', {sensitivity:'base'});
    items = studs.slice().sort((a,b)=>coll.compare((a.efternavn||'')+' '+(a.fornavn||''),(b.efternavn||'')+' '+(b.fornavn||''))).map(st=>{
      const full = `${(st.fornavn||'').trim()} ${(st.efternavn||'').trim()}`.trim();
      return { full, unilogin: (st.unilogin||'').trim(), kgrp: groupKeyFromTeachers(st.kontaktlaerer1_ini||'', st.kontaktlaerer2_ini||'') };
    });
  }

  function renderMenu(){
    if (!items.length) computeItems();
    const q = (input.value || '').toString().trim().toLowerCase();
    const filtered = !q ? items : items.filter(it => (it.full||'').toLowerCase().includes(q));
    menu.innerHTML = '';
    if (!filtered.length){
      menu.innerHTML = `<div class="pickerEmpty">Ingen match</div>`;
      return;
    }
    filtered.slice(0, 24).forEach((it) => {
      const row = document.createElement('div');
      row.className = 'tpItem';
      row.setAttribute('role','option');
      row.dataset.value = it.unilogin || it.full;
      row.setAttribute('data-full', it.full || '');
      row.innerHTML = `<div class="tpLeft">${escapeHtml(it.full)}</div><div class="tpRight">${escapeHtml(it.kgrp||'')}</div>`;
      row.addEventListener('mousedown', (e) => {
        e.preventDefault();
        commit(it.full);
        closeMenu();
      });
      menu.appendChild(row);
    });
    setActive(0);
  }

  function openMenu(){
    menu.hidden = false;
    wrap.classList.add('open');
    computeItems();
    renderMenu();
  }

  function closeMenu(){
    wrap.classList.remove('open');
    menu.hidden = true;
  }

  function commit(name){
    input.value = name;
    renderMarksTable();
    if (clear) clear.hidden = !input.value;
  }

  btn.onclick = (e) => { e.preventDefault(); wrap.classList.contains('open') ? closeMenu() : openMenu(); input.focus(); };
  input.onfocus = () => openMenu();
  input.oninput = () => { if (!wrap.classList.contains('open')) openMenu(); else renderMenu(); };

  if (clear){
    clear.onclick = (e)=>{ e.preventDefault(); input.value=''; clear.hidden=true; closeMenu(); renderMarksTable(); };
    clear.hidden = !input.value;
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!wrap.classList.contains('open')) openMenu();
      e.preventDefault();
      setActive(activeIndex + (e.key === 'ArrowDown' ? 1 : -1));
      return;
    }
    if (e.key === 'Escape') { e.preventDefault(); closeMenu(); return; }
    if (e.key === 'Enter') {
      const el = menu.querySelectorAll('[role="option"]')[activeIndex];
      if (el){ e.preventDefault(); commit((el.getAttribute('data-full') || el.dataset.full || el.textContent || '').trim()); closeMenu(); }
    }
  });

  document.addEventListener('click', (e)=>{ if (!wrap.contains(e.target)) closeMenu(); });
  closeMenu();
}


function normalizePlaceholderKey(key) {
  if (!key) return "";
  return key
    .toString()
    .trim()
    .toUpperCase()
    .replace(/Æ/g, "AE")
    .replace(/Ø/g, "OE")
    .replace(/Å/g, "AA")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

  function callName(rawFirstName) {
    const s = (rawFirstName ?? '').toString().trim();
    if (!s) return '';
    const parts = s.split(/\s+/).filter(Boolean);
    return parts.length ? parts[0] : s;
  }
  function normalizeHeader(input) { return normalizeName(input).replace(/[^a-z0-9]+/g, ""); }

  function escapeAttr(s) { return (s ?? '').toString().replace(/"/g,'&quot;'); }
  function $(id){ return document.getElementById(id); }

  function syncMarksTypeTabs(){
    const wrap = $("marksTypeTabs");
    const sel  = $("marksType");
    if(!wrap || !sel) return;
  const val = normalizeHeader(sel.value || "sang");
  wrap.querySelectorAll("button[data-type]").forEach(btn => {
    const t = normalizeHeader(btn.getAttribute("data-type") || "");
    const on = (t && t === val);
    btn.classList.toggle("active", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
  });
  }

const on = (id, ev, fn, opts) => { const el = document.getElementById(id); if (el) el.addEventListener(ev, fn, opts); };

  function detectDelimiter(firstLine) {
    const candidates = [';', ',', '\t'];
    let best = ',', bestCount = -1;
    for (const d of candidates) {
      const needle = d === '\t' ? '\t' : d;
      const count = (firstLine.split(needle).length - 1);
      if (count > bestCount) { bestCount = count; best = d; }
    }
    return best;
  }
  function parseCsvLine(line, delim) {
    const out = [];
    let cur = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i+1] === '"') { cur += '"'; i++; continue; }
        inQuotes = !inQuotes;
        continue;
      }
      if (!inQuotes && (delim === '\t' ? ch === '\t' : ch === delim)) {
        out.push(cur); cur = ''; continue;
      }
      cur += ch;
    }
    out.push(cur);
    return out;
  }
  function parseCsv(text) {
    const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    while (lines.length && !lines[lines.length-1].trim()) lines.pop();
    if (lines.length === 0) return { headers: [], rows: [] };

    const delim = detectDelimiter(lines[0]);
    const headers = parseCsvLine(lines[0], delim).map(h => h.trim());
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue;
      const parts = parseCsvLine(lines[i], delim);
      const row = {};
      for (let c = 0; c < headers.length; c++) row[headers[c]] = (parts[c] ?? '').trim();
      rows.push(row);
    }
    return { headers, rows, delim };
  }
  function toCsv(rows, headers) {
    const esc = (v) => {
      const s = (v ?? '').toString();
      if (/[",\n\r;]/.test(s)) return '"' + s.replace(/"/g,'""') + '"';
      return s;
    };
    const head = headers.join(',');
    const body = rows.map(r => headers.map(h => esc(r[h])).join(',')).join('\n');
    return head + '\n' + body + '\n';
  }
  
function _dateStampYYYYMMDD() {
  const d = new Date();
  const yyyy = String(d.getFullYear());
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}
function marksExportLabel(type) {
  if (type === 'sang') return 'Sangkarakterer';
  if (type === 'gym')  return 'Gymnastikkarakterer & roller';
  if (type === 'elevraad') return 'Elevrådsrepræsentanter';
  return 'Markeringer';
}
function marksExportFilename(type) {
  const stamp = _dateStampYYYYMMDD();
  if (type === 'sang') return `Sangkarakterer_${stamp}.csv`;
  if (type === 'gym')  return `Gymnastikkarakterer_og_roller_Fanebaerer_Redskabshold_DGI-instruktoer_${stamp}.csv`;
  if (type === 'elevraad') return `Elevraadsrepraesentanter_${stamp}.csv`;
  return `Markeringer_${stamp}.csv`;
}

function downloadText(filename, text) {
    const blob = new Blob([text], {type:'text/csv;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const state = {
    tab: 'set',
    viewMode: 'K', 
    kGroupIndex: 0,
    settingsSubtab: 'general',
    selectedUnilogin: null,
    studentInputUrls: {},
    visibleKElevIds: [],
    kMeDraft: ''
  };

  loadUIStateInto(state);

function defaultSettings() {
    return {
      contactGroupCount: "",
      forstanderName: "Stinne Krogh Poulsen",
      forstanderLocked: true,
      me: "",
      meResolved: "",
      schoolYearEnd: new Date().getFullYear() + 1
    };
  }
  function defaultTemplates() {
    return {
      schoolText: DEFAULT_SCHOOL_TEXT,
      schoolTextLocked: true,
      template: DEFAULT_TEMPLATE,
      templateLocked: true
    };
  }

  function getSettings(){ return Object.assign(defaultSettings(), lsGet(KEYS.settings, {})); }
  function setSettings(s){ lsSet(KEYS.settings, s); }

  function loadUIStateInto(stateObj){
    const s = getSettings();
    const ui = (s && s.ui) ? s.ui : {};
    if (typeof ui.settingsSubtab === 'string' && ui.settingsSubtab) stateObj.settingsSubtab = ui.settingsSubtab;
    if (typeof ui.marksType === 'string' && ui.marksType) stateObj.marksType = ui.marksType;
  }

  function saveUIStateFrom(stateObj){
    const s = getSettings();
    s.ui = s.ui || {};
    s.ui.settingsSubtab = stateObj.settingsSubtab;
    s.ui.marksType = stateObj.marksType;
    setSettings(s);
  }

  function saveState(){ saveUIStateFrom(state); }
  function getTemplates(){ return Object.assign(defaultTemplates(), (REMOTE_OVERRIDES.templates && (REMOTE_OVERRIDES.templates.templates || REMOTE_OVERRIDES.templates)) || {}, lsGet(KEYS.templatesImported, {}), lsGet(KEYS.templates, {})); }

function getRemoteTemplatesOnly(){
  return (REMOTE_OVERRIDES && REMOTE_OVERRIDES.templates) ? (REMOTE_OVERRIDES.templates.templates || REMOTE_OVERRIDES.templates) : null;
}

function normalizeGender(value) {
  const s = String(value ?? '').trim().toLowerCase();
  if (!s) return '';
  if (['m', 'mand', 'dreng', 'male', 'boy', 'han'].includes(s)) return 'm';
  if (['k', 'kvinde', 'pige', 'female', 'girl', 'hun', 'f', 'w'].includes(s)) return 'k';
  if (s.startsWith('m')) return 'm';
  if (s.startsWith('k')) return 'k';
  if (s.startsWith('f')) return 'k';
  return '';
}


function applyRemoteTemplatesToLocal(opts){
  opts = opts || {};
  const remote = getRemoteTemplatesOnly();
  if(!remote) return false;

  const curLocal = lsGet(KEYS.templates, {});
  const curT = getTemplates();
  const locks = {
    schoolTextLocked: curT.schoolTextLocked,
    templateLocked: curT.templateLocked,
    forstanderNameLocked: curT.forstanderNameLocked,
  };

  const nextLocal = Object.assign({}, curLocal);
  ['schoolText','template','forstanderName'].forEach(k => {
    if(remote[k] != null) nextLocal[k] = remote[k];
  });
  if(opts && opts.preserveLocks !== false){
    Object.assign(nextLocal, locks);
  }

  lsDel(KEYS.templatesImported);
  lsSet(KEYS.templates, nextLocal);
  setTemplatesDirty(false);
  return true;
}

function clearLocalTemplates(){
  lsDel(KEYS.templatesImported);
  lsDel(KEYS.templates);
  setTemplatesDirty(false);
}

function applyTemplatesFromOverridesToLocal(opts={}){
  const { preserveLocks = true, force = false } = opts;
  if(!force && isTemplatesDirty()) return false;
  const remoteT = getRemoteTemplatesOnly();
  if(!remoteT) return false;

  const localNow = lsGet(KEYS.templates, {});
  const next = {};

  ['forstanderName','schoolText','template'].forEach(k=>{
    if(remoteT[k] !== undefined) next[k] = remoteT[k];
  });

  if(preserveLocks){
    ['forstanderNameLocked','schoolTextLocked','templateLocked'].forEach(k=>{
      if(localNow[k] !== undefined) next[k] = localNow[k];
    });
  }

  lsSet(KEYS.templates, next);
  setTemplatesDirty(false);
  return true;
}

async function refreshOverridesAndApplyTemplatesIfSafe(force=false){
  if(isTemplatesDirty()) return false;
  await loadRemoteOverrides();
  return applyTemplatesFromOverridesToLocal({ preserveLocks: true });
}
  function setTemplates(t){ lsSet(KEYS.templates, t); }
  function getStudents(){ const s = lsGet(KEYS.students, []); window.__ALL_STUDENTS__ = s || []; return s; }

  function getSelectedStudent(){
    const u = state.selectedUnilogin;
    if(!u) return null;
    const studs = getStudents() || [];
    return (studs || []).find(s => s && s.unilogin === u) || null;
  }

  
function rebuildAliasMapFromStudents(studs){
  const s = getSettings();
  const alias = { ...(s.aliasMap || {}) };
  const add = (ini, full) => {
    if (!ini || !full) return;
    const k = (ini||'').toString().trim().toLowerCase();
    if (k) alias[k] = full;
    const nk = normalizeName(full).replace(/\s+/g,'');
    if (nk) alias[nk] = full;
  };
  (studs || []).forEach(st => {
    const t1 = (st && st.kontaktlaerer1) ? (st.kontaktlaerer1+'').trim() : '';
    const t2 = (st && st.kontaktlaerer2) ? (st.kontaktlaerer2+'').trim() : '';
    [t1,t2].filter(Boolean).forEach(t => {
      if (/^[A-ZÆØÅ]{1,4}(\/[A-ZÆØÅ]{1,4})?$/.test(t)) {
        add(t, t); 
      } else {
        add(toInitials(t), t);
      }
    });
  });
  setSettings({ ...s, aliasMap: alias });
}

function setStudents(studs){ lsSet(KEYS.students, studs); rebuildAliasMapFromStudents(studs); window.__ALL_STUDENTS__ = studs || []; rebuildAliasMapFromStudents(studs); }
  function getMarks(kindKey){ return lsGet(kindKey, {}); }
  function setMarks(kindKey, m){ lsSet(kindKey, m); }
  function getTextFor(unilogin){
    return lsGet(KEYS.textPrefix + unilogin, { elevudvikling:'', praktisk:'', kgruppe:'', lastSavedTs:null, studentInputMeta:null });
  }
  function setTextFor(unilogin, obj){ lsSet(KEYS.textPrefix + unilogin, obj); }

  function computePeriod(schoolYearEnd) {
    const endYear = Number(schoolYearEnd) || (new Date().getFullYear() + 1);
    return { from: `August ${endYear - 1}`, to: `Juni ${endYear}`, dateMonthYear: `Juni ${endYear}` };
  }

  function genderGroup(genderRaw) {
    const g = normalizeName(genderRaw);
    if (g === 'k' || g.includes('pige') || g.includes('female')) return 0;
    if (g === 'm' || g.includes('dreng') || /\bmale\b/.test(g)) return 1;
    return 2;
  }

  function pronouns(genderRaw) {
    const g = normalizeName(genderRaw);
    const isFemale = (g === 'k' || g === 'f' || g === 'p' || g.includes('pige') || g.includes('kvinde') || g.includes('female'));
    const isMale = (g === 'm' || g === 'd' || g.includes('dreng') || g.includes('mand') || /\bmale\b/.test(g));
    if (isFemale && !isMale) {
      return { HAN_HUN: 'hun', HAM_HENDE: 'hende', HANS_HENDES: 'hendes', SIG_HAM_HENDE: 'sig' };
    }
    if (isMale && !isFemale) {
      return { HAN_HUN: 'han', HAM_HENDE: 'ham', HANS_HENDES: 'hans', SIG_HAM_HENDE: 'sig' };
    }
    return { HAN_HUN: 'han/hun', HAM_HENDE: 'ham/hende', HANS_HENDES: 'hans/hendes', SIG_HAM_HENDE: 'sig' };
  }


  function sortedStudents(all) {
    return all.slice().sort((a,b) =>
      (a.fornavn||'').localeCompare(b.fornavn||'', 'da') ||
      (a.efternavn||'').localeCompare(b.efternavn||'', 'da')
    );
  }

  function snippetTextByGender(snObj, genderRaw) {
    const g = normalizeName(genderRaw);
    const isMale = (g === 'm' || g.includes('dreng') || /\bmale\b/.test(g));
    const txt = isMale ? (snObj.text_m || '') : (snObj.text_k || snObj.text_m || '');
    return txt;
  }
  function applyPlaceholders(text, placeholderMap) {
  if (!text) return "";
  const s = String(text);
  return s.replace(/\{\{\s*([^{}]+?)\s*\}\}|\{\s*([^{}]+?)\s*\}/g, (m, k1, k2) => {
    const rawKey = (k1 || k2 || "").trim();
    if (!rawKey) return "";
    const keyUpper = rawKey.toUpperCase();
    const keyNorm = normalizePlaceholderKey(rawKey);
    const v =
      (placeholderMap && (placeholderMap[keyUpper] ?? placeholderMap[keyNorm] ?? placeholderMap[rawKey])) ?? "";
    return (v === null || v === undefined) ? "" : String(v);
  });
}
  function cleanSpacing(text) {
    return (text || '')
      .replace(/[ \t]+\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  function buildStatement(student, settings) {
    const tpls = getTemplates();
    const period = computePeriod(settings.schoolYearEnd);

    const free = getTextFor(student.unilogin);
    const marksSang = getMarks(KEYS.marksSang)[student.unilogin] || {};
    const marksGym  = getMarks(KEYS.marksGym)[student.unilogin] || {};
    const marksER   = getMarks(KEYS.marksElev)[student.unilogin] || {};

    let sangAfsnit = '';
    if (marksSang.sang_variant && SNIPPETS.sang[marksSang.sang_variant]) {
      sangAfsnit = snippetTextByGender(SNIPPETS.sang[marksSang.sang_variant], student.koen);
    }

    let gymAfsnit = '';
    if (marksGym.gym_variant && SNIPPETS.gym[marksGym.gym_variant]) {
      gymAfsnit = snippetTextByGender(SNIPPETS.gym[marksGym.gym_variant], student.koen);
    }

    const roleTexts = [];
const rolesObj = (SNIPPETS && SNIPPETS.roller) ? SNIPPETS.roller : {};
const roleCodes = Object.keys(rolesObj);

const selectedArr =
  (marksGym && Array.isArray(marksGym.gym_roles)) ? marksGym.gym_roles
  : (marksER && Array.isArray(marksER.gym_roles)) ? marksER.gym_roles
  : [];
const selected = new Set(selectedArr.map(s => String(s || '').trim()).filter(Boolean));

roleCodes.forEach(code => {
  const isOn =
    selected.has(code) ||               
    (marksGym && marksGym[code] === true); 

  if (isOn && rolesObj[code]) {
    roleTexts.push(snippetTextByGender(rolesObj[code], student.koen));
  }
});

let rolleAfsnit = roleTexts.filter(Boolean).join('\n\n');

   let elevraadAfsnit = "";
const erObj = (SNIPPETS && SNIPPETS.elevraad) ? SNIPPETS.elevraad : {};
const erKeys = Object.keys(erObj);

const chosen =
  (marksER && typeof marksER.elevraad_variant === "string" && marksER.elevraad_variant.trim())
    ? marksER.elevraad_variant.trim()
    : ((marksER && marksER.elevraad && erKeys[0]) ? erKeys[0] : "");

if (chosen && erObj[chosen]) {
  elevraadAfsnit = snippetTextByGender(erObj[chosen], student.koen);
}

    const fullName = `${student.fornavn} ${student.efternavn}`.trim();
    const firstName = callName(student.fornavn);
    const pr = pronouns(student.koen);
    const snMap = {
      "ELEV_FORNAVN": (student.fornavn||'').trim(),
      "ELEV_NAVN": fullName,
      "FORNAVN": (student.fornavn||'').trim(),
      "NAVN": fullName,
      "HAN_HUN": pr.HAN_HUN,
      "HAM_HENDE": pr.HAM_HENDE,
      "HANS_HENDES": pr.HANS_HENDES
    };
    sangAfsnit = applyPlaceholders(sangAfsnit, snMap);
    gymAfsnit = applyPlaceholders(gymAfsnit, snMap);
    elevraadAfsnit = applyPlaceholders(elevraadAfsnit, snMap);
    rolleAfsnit = applyPlaceholders(rolleAfsnit, snMap);

    const kontakt = [student.kontaktlaerer1, student.kontaktlaerer2].filter(x => (x||'').trim()).join(' / ');

    const placeholderMap = {
      "ELEV_NAVN": fullName,
      "ELEV_FORNAVN": firstName,
      "HAN_HUN": pr.HAN_HUN,
      "HAM_HENDE": pr.HAM_HENDE,
      "HANS_HENDES": pr.HANS_HENDES,
      "ELEV_EFTERNAVN": (student.efternavn || '').trim(),
      "ELEV_KLASSE": formatClassLabel(student.klasse),
      "PERIODE_FRA": period.from,
      "PERIODE_TIL": period.to,
      "DATO_MAANED_AAR": period.dateMonthYear,
      "SKOLENS_STANDARDTEKST": tpls.schoolText || '',
      "SANG_AFSNIT": sangAfsnit,
      "GYM_AFSNIT": gymAfsnit,
      "SANG_GYM_AFSNIT": [sangAfsnit, gymAfsnit].filter(Boolean).join("\n\n"),
      "ELEVRAAD_AFSNIT": elevraadAfsnit,
      "ROLLE_AFSNIT": rolleAfsnit,
      "ELEVUDVIKLING_AFSNIT": (free.elevudvikling || ''),
      "PRAKTISK_AFSNIT": (free.praktisk || ''),
      "KONTAKTGRUPPE_AFSNIT": (free.kgruppe || SNIPPETS.kontaktgruppeDefault),
      "AFSLUTNING_AFSNIT": SNIPPETS.afslutningDefault,
      "KONTAKTLAERERE": kontakt,
      "FORSTANDER": settings.forstanderName || '',
"ELEV_FULDE_NAVN": fullName,
"ELEV_FULD_E_NAVN": fullName,
"ELEV_UDVIKLING_AFSNIT": (free.elevudvikling || ''),
"ELEV_UDVIKLING_FRI": (free.elevudvikling || ''),
"PRAKTISK_FRI": (free.praktisk || ''),
"KGRUPPE_FRI": (free.kgruppe || ''),
"KONTAKTGRUPPE_ANTAL": String(settings.contactGroupCount || (window.__ALL_STUDENTS__ ? window.__ALL_STUDENTS__.length : "") || ''),
"KONTAKTGRUPPE_BESKRIVELSE": (free.kgruppe || SNIPPETS.kontaktgruppeDefault || ''),
"KONTAKTLAERER_1_NAVN": ((student.kontaktlaerer1 || '') + '').trim(),
"KONTAKTLAERER_2_NAVN": ((student.kontaktlaerer2 || '') + '').trim(),
      "KONTAKTLÆRER_1_NAVN": ((student.kontaktlaerer1 || '') + '').trim(),
      "KONTAKTLÆRER_2_NAVN": ((student.kontaktlaerer2 || '') + '').trim(),
"FORSTANDER_NAVN": settings.forstanderName || '',
      "HAN_HUN": pr.HAN_HUN,
      "HAM_HENDE": pr.HAM_HENDE,
      "HANS_HENDES": pr.HANS_HENDES,
      "NAVN": fullName,
      "FORNAVN": firstName,
      "KLASSE": (student.klasse || '').trim(),
      "ELEVUDVIKLING_FRI": (free.elevudvikling || ''),
      "PRAKTISK_FRI": (free.praktisk || ''),
      "KGRUPPE_FRI": (free.kgruppe || SNIPPETS.kontaktgruppeDefault),
      "SANG_SNIPPET": sangAfsnit,
      "GYM_SNIPPET": gymAfsnit,
      "ELEVRAAD_SNIPPET": elevraadAfsnit,
      "ROLLE_SNIPPETS": rolleAfsnit,
      "ELEVRAAD_AFSNIT": (elevraadAfsnit || ""),
      "ROLLE_AFSNIT": (rolleAfsnit || ""),
      "MARKS_AFSNIT": [sangAfsnit, gymAfsnit, elevraadAfsnit, rolleAfsnit].filter(Boolean).join('\n\n'),
      "SANG_GYM_AFSNIT": ""
    };

    let out = tpls.template || DEFAULT_TEMPLATE;
    const hasElevraadSlot = (out.indexOf("{{ELEVRAAD_AFSNIT}}") !== -1);
    const hasRolleSlot = (out.indexOf("{{ROLLE_AFSNIT}}") !== -1);
    placeholderMap.SANG_GYM_AFSNIT = [sangAfsnit, gymAfsnit]
      .concat((!hasElevraadSlot ? [elevraadAfsnit] : []))
      .concat((!hasRolleSlot ? [rolleAfsnit] : []))
      .filter(Boolean).join('\n\n');
    out = applyPlaceholders(out, placeholderMap);
    return cleanSpacing(out);
  }

  async function readFileText(file) { return await file.text(); }

  const STUDENT_COLMAP = {
    fornavn: new Set(["fornavn","firstname","givenname"]),
    efternavn: new Set(["efternavn","lastname","surname","familyname"]),
    unilogin: new Set(["unilogin","unicbrugernavn","unicusername","unic"]),
    koen: new Set(["køn","koen","gender", "kon"]),
    klasse: new Set(["klasse","class","hold"]),
    kontakt1: new Set(["kontaktlærer1","kontaktlaerer1","relationerkontaktlaerernavn","relationerkontaktlærernavn","kontaktlærer","kontaktlaerer"]),
    kontakt2: new Set(["kontaktlærer2","kontaktlaerer2","relationerandenkontaktlaerernavn","relationerandenkontaktlærernavn","andenkontaktlærer","andenkontaktlaerer"])
    ,ini1: new Set(["initialerforklaerer1","initialerforklærer1","kontaktlaerer1initialer","kontaktlærer1initialer"])
    ,ini2: new Set(["initialerforklaerer2","initialerforklærer2","kontaktlaerer2initialer","kontaktlærer2initialer"])
  };
  function mapStudentHeaders(headers) {
    const mapped = {};
    for (const h of headers) {
      const key = normalizeHeader(h);
      for (const [field,set] of Object.entries(STUDENT_COLMAP)) {
        if (set.has(key)) mapped[field] = h;
      }
    }
    return mapped;
  }
  function normalizeStudentRow(row, map) {
    const get = (field) => (row[map[field]] ?? '').trim();
    const fornavnRaw = get('fornavn');
    let efternavnRaw = get('efternavn');

    let fornavn = fornavnRaw;
    if (fornavnRaw && !fornavnRaw.includes('-')) {
      const parts = fornavnRaw.split(/\s+/).filter(Boolean);
      if (parts.length > 1) {
        fornavn = parts[0];
        const extraSurname = parts.slice(1).join(' ');
        efternavnRaw = (extraSurname + ' ' + (efternavnRaw || '')).trim();
      }
    }

    const efternavn = efternavnRaw;
    const unilogin = get('unilogin') || (normalizeName((fornavn + ' ' + efternavn)).replace(/\s/g, '') + '_missing');
    const koen = normalizeGender(get('koen'));
    const klasse = get('klasse');
    const ini1 = (get('ini1') || '').trim();
    const ini2 = (get('ini2') || '').trim();
    const k1 = ini1 ? ini1.toUpperCase() : toInitials(get('kontakt1'));
    const k2 = ini2 ? ini2.toUpperCase() : toInitials(get('kontakt2'));
    const kontakt1_navn = get('kontakt1');
    const kontakt2_navn = get('kontakt2');
    const navn = `${fornavn} ${efternavn}`.trim();
    return { fornavn, efternavn, navn, unilogin, koen, klasse, kontaktlaerer1: kontakt1_navn, kontaktlaerer2: kontakt2_navn, kontaktlaerer1_ini: k1, kontaktlaerer2_ini: k2 };
  }

  function setTab(tab) {
    let students = getStudents();
    if (!students.length && Array.isArray(window.__ALL_STUDENTS__)) students = window.__ALL_STUDENTS__;
    if (!students.length && tab !== 'set') tab = 'set';
    if (tab === 'edit' && !state.selectedUnilogin) tab = 'k';

    state.tab = tab;
    if (tab === 'k') updateTabLabels();
    if (tab === 'set') setSettingsSubtab('general');

    ['k','edit','set'].forEach(t => {
      const btn = $('tab-' + (t==='set'?'set':t));
      if (btn) btn.classList.toggle('active', tab === t);
      const view = $('view-' + (t==='set'?'set':t));
      if (view) view.classList.toggle('active', tab === t);
    });

    renderAll();
  }

function setSettingsSubtab(sub) {
    state.settingsSubtab = sub || 'general';
    const btns = document.querySelectorAll('#settingsSubtabs .subtab');
    btns.forEach(b => b.classList.toggle('active', b.dataset.subtab === state.settingsSubtab));
    const panes = document.querySelectorAll('#view-set .settingsSubtab');
    panes.forEach(p => p.classList.toggle('active', p.dataset.subtab === state.settingsSubtab));
    saveState();
    updateTeacherDatalist();
    renderMarksTable(); 
}

function updateTabLabels(){
  const kBtn = $('tab-k');
  if(!kBtn) return;
  const span = kBtn.querySelector('span');
  const title = (state.viewMode === 'ALL') ? 'Alle K-grupper' : 'K-elever';
  if (span) span.textContent = title;
  kBtn.title = title;
  const h = $('kTitle');
  if (h) h.textContent = title;
}


  function updateTabVisibility() {
    const editBtn = $('tab-edit');
    if (!editBtn) return;
    editBtn.style.display = state.selectedUnilogin ? '' : 'none';
  }

  function renderAll() {
    updateTeacherDatalist();
    updateTabVisibility();
    initMarksSearchPicker();
    renderStatus();
    if (state.tab === 'set') renderSettings();
    if (state.tab === 'k') renderKList();
    if (state.tab === 'edit') renderEdit();
  }

  function renderStatus() {
    const s = getSettings();
    const studs = getStudents();
    const kGroups = buildKGroups(studs);
    state.__kGroups = kGroups;
    if (state.kGroupIndex < 0) state.kGroupIndex = 0;
    if (state.kGroupIndex > Math.max(0, kGroups.length-1)) state.kGroupIndex = Math.max(0, kGroups.length-1);

    const me = (s.me || '').trim() ? `· K-lærer: ${(s.me||'').trim().toUpperCase()}` : '';
    $('statusText').textContent = studs.length ? `Elever: ${studs.length} ${me}` : `Ingen elevliste indlæst`;
  }

  function renderSettings() {
    const s = getSettings();
    const t = getTemplates();
    const studs = getStudents();
    const kGroups = buildKGroups(studs);
    state.__kGroups = kGroups;
    if (state.kGroupIndex < 0) state.kGroupIndex = 0;
    if (state.kGroupIndex > Math.max(0, kGroups.length-1)) state.kGroupIndex = Math.max(0, kGroups.length-1);

    if (typeof setSettingsSubtab === 'function') setSettingsSubtab(state.settingsSubtab);

    $('forstanderName').value = s.forstanderName || '';
    $('forstanderName').readOnly = !!s.forstanderLocked;
    $('btnToggleForstander').textContent = s.forstanderLocked ? '✏️' : '🔒';

    $('meInput').value = s.me || '';
    $('schoolYearEnd').value = s.schoolYearEnd || '';

    const p = computePeriod(s.schoolYearEnd);
    $('periodFrom').value = p.from;
    $('dateMonthYear').value = p.dateMonthYear;

    $('schoolText').value = t.schoolText ?? DEFAULT_SCHOOL_TEXT;
    $('schoolText').readOnly = !!t.schoolTextLocked;
    $('btnToggleSchoolText').textContent = t.schoolTextLocked ? '✏️ Redigér' : '🔒 Lås';

    $('templateText').value = t.template ?? DEFAULT_TEMPLATE;
    $('templateText').readOnly = !!t.templateLocked;
    $('btnToggleTemplate').textContent = t.templateLocked ? '✏️ Redigér' : '🔒 Lås';

    $('studentsStatus').textContent = studs.length ? `✅ Elevliste indlæst: ${studs.length} elever` : `Upload elevliste først.`;
    $('studentsStatus').style.color = studs.length ? 'var(--accent)' : 'var(--muted)';
    const warnEl = $('studentsWarn');
    if (warnEl) {
      const miss = computeMissingKTeacher(studs);
      if (miss.length) {
        const ex = miss.slice(0,3).map(st => `${escapeHtml(st.fornavn||'')} ${escapeHtml(st.efternavn||'')}`.trim()).filter(Boolean);
        warnEl.style.display = 'block';
        warnEl.innerHTML = `⚠️ <b>Tjek manglende data i CSV</b><div class="small muted" style="margin-top:.25rem">${miss.length} elev(er) mangler K-lærere (Kontaktlærer1/2).${ex.length? '<br>Fx: '+ex.join(', '):''}</div>`;
      } else {
        warnEl.style.display = 'none';
        warnEl.textContent = '';
      }
    }

    if (state.settingsSubtab === 'export') {
      try { renderMarksTable(); } catch (e) { }
    }

    const meNorm = normalizeName((s.meResolved || s.me || '').toString());
    if (studs.length && meNorm) {
      const count = studs.filter(st => normalizeName(toInitials(st.kontaktlaerer1_ini)) === meNorm || normalizeName(toInitials(st.kontaktlaerer2_ini)) === meNorm).length;
      $('contactCount').value = String(count);
      const s0 = getSettings();
      if (String(s0.contactGroupCount||'') !== String(count)) { s0.contactGroupCount = String(count); setSettings(s0); }
    } else {
      $('contactCount').value = '';
      const s0 = getSettings();
      if (s0.contactGroupCount) { s0.contactGroupCount = ''; setSettings(s0); }
    }

    renderSnippetsEditor();
    renderMarksTable();
  }

  
function renderSnippetsEditor() {
  if (!$('sangText_S1')) return;
  const sangKeys = ['S1','S2','S3'];
  sangKeys.forEach(k => {
    const it = SNIPPETS.sang[k] || { title: k, text_m: '', text_k: '' };
    $('sangLabel_'+k).value = it.title || k;
    $('sangText_'+k).value = (it.text_m || it.text_k || '');
  });
  const gymKeys = ['G1','G2','G3'];
  gymKeys.forEach(k => {
    const it = SNIPPETS.gym[k] || { title: k, text_m: '', text_k: '' };
    $('gymLabel_'+k).value = it.title || k;
    $('gymText_'+k).value = (it.text_m || it.text_k || '');
  });
  const er = (SNIPPETS.elevraad && SNIPPETS.elevraad.YES) ? SNIPPETS.elevraad.YES : { text_m: '', text_k: '' };
  $('elevraadText').value = (er.text_m || er.text_k || '');
  const list = document.getElementById('gymRolesList');
  if (!list) return;
  list.innerHTML = '';
  Object.keys(SNIPPETS.roller || {}).forEach(key => {
    const it = SNIPPETS.roller[key];
    const row = document.createElement('div');
    row.className = 'roleRow';
    row.setAttribute('data-role-key', key);
    row.innerHTML = `
      <div class="row gap wrap" style="align-items:center">
        <div class="field" style="min-width:220px;flex:1">
          <label>Rolle-navn</label>
          <input class="roleLabel" type="text" value="${escapeHtml(it.title || key)}">
        </div>
        <div class="field" style="flex:2;min-width:280px">
          <label>Tekst</label>
          <textarea class="roleText" rows="3">${escapeHtml((it.text_m || it.text_k || ''))}</textarea>
        </div>
      </div>
    `;
    list.appendChild(row);
  });
}

function escapeHtml(s) {
  return String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function commitSnippetsFromUI(scope) {
  const overrides = getSnippetImported();
  if (scope === 'sang') {
    const items = {};
    ['S1','S2','S3'].forEach(k => {
      items[k] = {
        label: ($('sangLabel_'+k).value || '').trim() || k,
        text: ($('sangText_'+k).value || '').trim()
      };
    });
    overrides.sang = { items, order: ['S1','S2','S3'] };
  }
  if (scope === 'gym') {
    const variants = {};
    ['G1','G2','G3'].forEach(k => {
      variants[k] = {
        label: ($('gymLabel_'+k).value || '').trim() || k,
        text: ($('gymText_'+k).value || '').trim()
      };
    });
    const roles = {};
    Array.from(document.querySelectorAll('[data-role-key]')).forEach(row => {
      const key = row.getAttribute('data-role-key');
      if (!key) return;
      roles[key] = {
        label: (row.querySelector('.roleLabel')?.value || '').trim() || key,
        text: (row.querySelector('.roleText')?.value || '').trim()
      };
    });
    overrides.gym = { variants, roles, variantOrder: ['G1','G2','G3'], roleOrder: Object.keys(roles) };
  }
  if (scope === 'elevraad') {
    overrides.elevraad = { label: 'Elevråd', text: ($('elevraadText').value || '').trim() };
  }
  setSnippetImported(overrides);
  applySnippetOverrides();
  if (state.tab === 'edit') renderEdit();
  renderMarksTable();
}

function renderKList() {
    const s = getSettings();
    const studs = getStudents();
    const isAll = state.viewMode === 'ALL';
    const kGroups = buildKGroups(studs);
    state.__kGroups = kGroups;
    if (state.kGroupIndex < 0) state.kGroupIndex = 0;
    if (state.kGroupIndex > Math.max(0, kGroups.length-1)) state.kGroupIndex = Math.max(0, kGroups.length-1);

    const meRaw = ((s.me || '') + '').trim();
    const meIni = toInitials(meRaw);
    const meResolvedRaw = meIni || meRaw;
    const minePreview = isAll
      ? studs.slice()
      : (meIni
        ? studs.filter(st => toInitials(st.kontaktlaerer1_ini) === meIni || toInitials(st.kontaktlaerer2_ini) === meIni)
        : []);
    const kBox = $('kMessage');
    const kMsg = $('kMsgHost');
    if (kBox) kBox.classList.remove('compact');
    const kList = $('kList');

    if (!(((s.me || '') + '').trim())) {
      state.visibleKElevIds = [];
      if (kList) kList.innerHTML = '';
      const draft = (state.kMeDraft || '').trim();
      if (kMsg) {
        kMsg.innerHTML = `<div class="row between alignCenter" style="gap:1rem; flex-wrap:wrap;">
        <div class="row alignCenter" style="gap:.7rem; flex-wrap:wrap;">
          <div><b>${minePreview.length} match:</b> <span class="pill">${escapeHtml(meResolvedRaw || s.me || '')}</span></div>
          <div class="muted small">
            Kontaktlærer1/2 matcher initialer.
            <span id="kStatusLine" class="muted"></span>
          </div>
        </div>
        <div class="muted small" id="kProgLine"></div>
      </div>`;
      }
      return;
    }

    const meResolvedConfirmed = ((s.meResolvedConfirmed || '') + '').trim();
    const kHeaderInfo = $("kHeaderInfo");
    const meNorm = normalizeName(meResolvedConfirmed || meResolvedRaw);

    (function syncAllNav(){
      const navRow = $("kAllNavRow");
      const navLabel = $("kAllNavLabel");
      const titleActions = $("kTitleActions");
      const btnPrint = $("btnPrintAllK");
      const btnPrev = $("btnPrevGroup");
      const btnNext = $("btnNextGroup");

      if (!navRow || !navLabel || !titleActions || !btnPrint || !btnPrev || !btnNext) return;

      try {
        if (isAll) {
          const totalGroups = kGroups.length || 0;
          const gi = Math.max(0, Math.min(state.kGroupIndex || 0, Math.max(0, totalGroups - 1)));
          const g = kGroups[gi];
          const key = g ? g.key : '—';
          btnPrint.textContent = `🖨️ Print ${key} · K-gruppe ${gi+1}/${totalGroups}`;
          btnPrint.title = 'Udskriv den aktive K-gruppe som én samlet udskrift';
        } else {
          btnPrint.textContent = '🖨️ Print dine K-elever';
          btnPrint.title = 'Udskriv dine K-elever som én samlet udskrift';
        }
        if (btnPrint.parentElement !== titleActions) titleActions.appendChild(btnPrint);
      } catch(_) {}

      navRow.style.display = isAll ? '' : 'none';
      if (!isAll) return;

      const totalGroups = kGroups.length || 0;
      const gi = Math.max(0, Math.min(state.kGroupIndex || 0, Math.max(0, totalGroups - 1)));
      state.kGroupIndex = gi;

      const totalStudents = studs.length || 0;
      let edited = 0;
      for (const st of studs) {
        const t = getTextFor(st.unilogin);
        const hasAny = !!((t.elevudvikling||'').trim() || (t.praktisk||'').trim() || (t.kgruppe||'').trim());
        if (hasAny) edited++;
      }
      navLabel.textContent = '';
      const prevKey = (gi > 0 && kGroups[gi-1]) ? (kGroups[gi-1].key || '—') : '';
      const nextKey = (gi < totalGroups - 1 && kGroups[gi+1]) ? (kGroups[gi+1].key || '—') : '';

      if (gi > 0) { btnPrev.style.visibility = 'visible'; btnPrev.textContent = `◀ ${prevKey}`; } 
      else { btnPrev.style.visibility = 'hidden'; btnPrev.textContent = '◀'; }

      if (gi < totalGroups - 1) { btnNext.style.visibility = 'visible'; btnNext.textContent = `${nextKey} ▶`; } 
      else { btnNext.style.visibility = 'hidden'; btnNext.textContent = '▶'; }

      if (!btnPrev.__wired) {
        btnPrev.__wired = true;
        btnPrev.addEventListener('click', () => { if (state.kGroupIndex > 0) state.kGroupIndex -= 1; renderKList(); });
      }
      if (!btnNext.__wired) {
        btnNext.__wired = true;
        btnNext.addEventListener('click', () => { if (state.kGroupIndex < kGroups.length - 1) state.kGroupIndex += 1; renderKList(); });
      }
    })();

    if (kMsg && (!$("kStatusLine") || !$("kProgLine"))) {
      kMsg.innerHTML = `
	        <div class="k-row" style="align-items:center; gap:10px;">
	          <div id="kStatusLine" class="muted small"></div>
	        </div>
        <div id="kProgLine" class="muted small" style="margin-top:6px;"></div>
      `;
    }

    const mineList = isAll
      ? ((kGroups[state.kGroupIndex] && kGroups[state.kGroupIndex].students) ? kGroups[state.kGroupIndex].students.slice() : [])
      : sortedStudents(studs).filter(st => normalizeName(toInitials(st.kontaktlaerer1_ini)) === meNorm || normalizeName(toInitials(st.kontaktlaerer2_ini)) === meNorm);
    mineList.sort((a,b)=>(a.fornavn||'').localeCompare(b.fornavn||'', 'da') || (a.efternavn||'').localeCompare(b.efternavn||'', 'da'));

    const prog = mineList.reduce((acc, st) => {
      const f = getTextFor(st.unilogin);
      acc.u += (f.elevudvikling||'').trim()?1:0;
      acc.p += (f.praktisk||'').trim()?1:0;
      acc.k += (f.kgruppe||'').trim()?1:0;
      return acc;
    }, {u:0,p:0,k:0});

    const progEl = $("kProgLine");
    if (progEl) {
      const core = `Udvikling: ${prog.u} af ${mineList.length} · Praktisk: ${prog.p} af ${mineList.length} · K-gruppe: ${prog.k} af ${mineList.length}`;
      progEl.textContent = core;
      progEl.style.display = isAll ? 'none' : '';
      progEl.style.textAlign = isAll ? '' : 'center';
      const navLabel = $("kAllNavLabel");
      if (isAll && navLabel) navLabel.textContent = core;
    }

    const statusEl = $("kStatusLine");
    if (statusEl) statusEl.textContent = "";
    if (kHeaderInfo) {
      const who = (meResolvedConfirmed || meRaw || "").trim();
      kHeaderInfo.textContent = who ? `✏️ Redigeres nu af: ${who}` : `✏️ Redigeres nu af: —`;
    }

    if (kList) {
      kList.innerHTML = mineList.map(st => {
        const full = `${st.fornavn || ''} ${st.efternavn || ''}`.trim();
        const free = getTextFor(st.unilogin);
        const hasU = !!(free.elevudvikling || '').trim();
        const hasP = !!(free.praktisk || '').trim();
        const hasK = !!(free.kgruppe || '').trim();
        const lastBy = ((free.lastEditedBy || '') + '').trim();
        const letters = [hasU ? 'U' : '', hasP ? 'P' : '', hasK ? 'K' : ''].filter(Boolean).join(' · ');
        const statusRight = letters ? `${letters}${lastBy ? ` → ${escapeHtml(lastBy)}` : ''}` : '';

        return `
          <div class="card clickable" data-unilogin="${escapeAttr(st.unilogin)}">
            <div class="cardTopRow">
              <div class="cardTitle"><b>${escapeHtml(full)}</b></div>
              <div class="cardFlags muted small">${statusRight}</div>
            </div>
            <div class="cardSub muted small">${escapeHtml(formatClassLabel(st.klasse || ''))}</div>
          </div>
        `;
      }).join('');

      kList.querySelectorAll('[data-unilogin]').forEach(el => {
        el.addEventListener('click', () => { state.selectedUnilogin = el.getAttribute('data-unilogin'); setTab('edit'); renderAll(); });
      });
    }
}

function setEditEnabled(enabled) {
    ['txtElevudv','txtPraktisk','txtKgruppe','fileStudentInput','btnPickStudentPdf','btnOpenStudentInput','btnClearStudentInput','btnPrint']
      .forEach(id => { const el = $(id); if (el) el.disabled = !enabled; });
  }
  function formatClassLabel(raw) {
  const k = ((raw || '') + '').trim();
  if (!k) return '';
  const m = k.match(/^(\d{1,2})\.?$/);
  if (m) return `${m[1]}. klasse`;
  return k;
}

function formatTime(ts) {
    const d = new Date(ts);
    return d.toLocaleTimeString('da-DK', {hour:'2-digit', minute:'2-digit'});
  }

  function updateEditRatios() {
    const nE = ($('txtElevudv')?.value || '').trim().length;
    const nP = ($('txtPraktisk')?.value || '').trim().length;
    const nK = ($('txtKgruppe')?.value || '').trim().length;
    const elE = $('ratioElevudv'); if (elE) elE.textContent = nE ? `antal tegn: ${nE}` : '';
    const elP = $('ratioPraktisk'); if (elP) elP.textContent = nP ? `antal tegn: ${nP}` : '';
    const elK = $('ratioKgruppe'); if (elK) elK.textContent = nK ? `antal tegn: ${nK}` : '';
  }

  function maybeOpenEditSection() {
    const sec = state.openEditSection;
    if (!sec) return;
    const map = {
      elevudv: { details: 'secElevudv', textarea: 'txtElevudv' },
      praktisk: { details: 'secPraktisk', textarea: 'txtPraktisk' },
      kgruppe: { details: 'secKgruppe', textarea: 'txtKgruppe' }
    };
    const m = map[sec];
    if (m) {
      const d = $(m.details);
      if (d) d.open = true;
      const ta = $(m.textarea);
      if (ta) ta.focus();
    }
    state.openEditSection = null;
  }

  function getVisibleKElevIds() {
    if (state.visibleKElevIds && state.visibleKElevIds.length) return state.visibleKElevIds.slice();
    const s = getSettings();
    const studs = getStudents();
    const isAll = state.viewMode === 'ALL';
    const kGroups = buildKGroups(studs);
    state.__kGroups = kGroups;
    if (isAll) {
      const g = kGroups[state.kGroupIndex];
      if (!g || !g.students) return [];
      return g.students.map(st => st.unilogin);
    }
    const meNorm = normalizeName((s.meResolved || s.me || '').toString());
    if (!studs.length || !meNorm) return [];
    return sortedStudents(studs)
      .filter(st => normalizeName(toInitials(st.kontaktlaerer1_ini)) === meNorm || normalizeName(toInitials(st.kontaktlaerer2_ini)) === meNorm)
      .map(st => st.unilogin);
  }

  function gotoAdjacentStudent(dir) {
    const ids = getVisibleKElevIds();
    if (!ids.length || !state.selectedUnilogin) return;
    const i = ids.indexOf(state.selectedUnilogin);
    if (i === -1) return;
    const nextIndex = i + (dir === 'next' ? 1 : -1);
    if (nextIndex < 0 || nextIndex >= ids.length) return;
    state.selectedUnilogin = ids[nextIndex];
    state.openEditSection = null;
    updateTabVisibility();
    renderEdit();
  }

  function renderEdit() {
    const studs = getStudents();
    const isAll = state.viewMode === 'ALL';
    const kGroups = buildKGroups(studs);
    state.__kGroups = kGroups;
    const hint = $('editHint');
    const navRow = $('editNavRow');
    const pill = $('editStudentPill');
    const bPrev = $('btnPrevStudent'); const bNext = $('btnNextStudent');

    if (!studs.length || !state.selectedUnilogin) {
      if (navRow) navRow.style.display = 'none';
      if (pill) pill.textContent = 'Ingen elev valgt';
      setEditEnabled(false);
      $('preview').textContent = '';
      return;
    }

    const st = studs.find(x => x.unilogin === state.selectedUnilogin);
    if (!st) {
      if (navRow) navRow.style.display = 'none';
      setEditEnabled(false);
      $('preview').textContent = '';
      return;
    }

    if (navRow) navRow.style.display = '';
    const full = `${st.fornavn} ${st.efternavn}`.trim();
    if (pill) { pill.style.display = 'none'; }
    const centerSlot = navRow ? navRow.querySelector('.navSlot.center') : null;
    if (centerSlot) {
      centerSlot.innerHTML = `<div class="navActiveName">${escapeHtml(full)}</div>` + (st.klasse ? `<div class="navActiveMeta muted small">${escapeHtml(formatClassLabel(st.klasse))}</div>` : ``);
    }

    const firstNameById = (id) => {
      const s = studs.find(x => x.unilogin === id);
      return s ? (s.fornavn || '').trim() : '';
    };
    const ids = getVisibleKElevIds();
    const idx = ids.indexOf(st.unilogin);
    if (bPrev) {
      const prevId = (idx > 0) ? ids[idx-1] : null;
      if (!prevId) { bPrev.style.display = 'none'; } 
      else { bPrev.style.display = ''; bPrev.textContent = `◀ ${firstNameById(prevId) || 'Forrige'}`; }
    }
    if (bNext) {
      const nextId = (idx !== -1 && idx < ids.length-1) ? ids[idx+1] : null;
      if (!nextId) { bNext.style.display = 'none'; } 
      else { bNext.style.display = ''; bNext.textContent = `${firstNameById(nextId) || 'Næste'} ▶`; }
    }

    setEditEnabled(true);
    const t = getTextFor(st.unilogin);
    $('txtElevudv').value = t.elevudvikling || '';
    $('txtPraktisk').value = t.praktisk || '';
    $('txtKgruppe').value = t.kgruppe || '';
    const as = $('autosavePill');
    if (as) {
      as.textContent = t.lastSavedTs ? `Sidst gemt: ${formatTime(t.lastSavedTs)}` : '';
      as.style.visibility = t.lastSavedTs ? 'visible' : 'hidden';
    }

    updateEditRatios();
    maybeOpenEditSection();

    const hasInputUrl = !!(state.selectedUnilogin && state.studentInputUrls[state.selectedUnilogin]);
    const meta = t.studentInputMeta || null;
    const hasMeta = !!(meta && meta.filename);
    const metaIsPdf = !!(hasMeta && meta.filename.toLowerCase().endsWith('.pdf'));

    if (hasMeta) {
      $('studentInputMeta').textContent = (!hasInputUrl && metaIsPdf) ? `PDF valgt tidligere: ${meta.filename}` : meta.filename;
    } else {
      $('studentInputMeta').textContent = '';
    }

    const btnPick = $('btnPickStudentPdf');
    const btnOpen = $('btnOpenStudentInput');
    const btnClear = $('btnClearStudentInput');
    const hasReadyPdf = !!hasInputUrl;

    if (btnPick) btnPick.style.display = hasReadyPdf ? 'none' : '';
    if (btnOpen) btnOpen.style.display = hasReadyPdf ? '' : 'none';
    if (btnClear) btnClear.style.display = hasReadyPdf ? '' : 'none';

    const pWrap = $('studentInputPreviewWrap');
    const pFrame = $('studentInputPreview');
    if (pWrap && pFrame) {
      if (hasInputUrl && metaIsPdf) { pWrap.style.display = ''; pFrame.src = state.studentInputUrls[state.selectedUnilogin]; } 
      else { pWrap.style.display = 'none'; pFrame.removeAttribute('src'); }
    }
    $('preview').textContent = buildStatement(st, getSettings());
  }

  function renderMarksTable() {
    const studs = getStudents();
    const wrap = $('marksTableWrap');
    const typeEl = $('marksType');
    const searchEl = $('marksSearch');
    const legendEl = $('marksLegend');
    if (!wrap || !legendEl) return;

    if (!document.getElementById('marksStickyCss')) {
      const st = document.createElement('style');
      st.id = 'marksStickyCss';
      st.textContent = `
        #marksTableWrap { overflow:auto; max-height:70vh; }
        #marksTableWrap table { border-collapse: separate; border-spacing: 0; }
        #marksTableWrap thead th { position: sticky; top: 0; z-index: 5; background: rgba(14,18,24,0.98); }
      `;
      document.head.appendChild(st);
    }

    const type = (typeEl && typeEl.value) ? typeEl.value : 'sang';
    const q = normalizeName((searchEl && searchEl.value) ? searchEl.value : '').trim();

    if (!studs || !studs.length){
      wrap.innerHTML = `<div class="muted small">Indlæs først elevliste (students.csv).</div>`;
      legendEl.textContent = '';
      return;
    }

    const list = sortedStudents(studs).filter(st => {
      if (!q) return true;
      const full = normalizeName(`${st.fornavn} ${st.efternavn}`);
      return full.includes(q);
    });

    const kgrpLabel = (st) => groupKeyFromTeachers((st.kontaktlaerer1_ini || '').toString(), (st.kontaktlaerer2_ini || '').toString());

    function renderTick(unilogin, key, on){
      const cls = 'tickbox' + (on ? ' on' : '');
      return `<td class="cb"><button type="button" class="${cls}" data-u="${escapeAttr(unilogin)}" data-k="${escapeAttr(key)}" aria-pressed="${on}"><span class="check">✓</span></button></td>`;
    }

    if (type === 'sang') {
      const marks = getMarks(KEYS.marksSang);
      const cols = Object.keys(SNIPPETS.sang);
      wrap.innerHTML = `<table><thead><tr><th>Navn</th><th>K-grp</th><th>Klasse</th>${cols.map(c => `<th class="cb"><span class="muted small">${escapeHtml(SNIPPETS.sang[c].title||'')}</span></th>`).join('')}</tr></thead><tbody>${list.map(st => {
              const m = marks[st.unilogin] || {};
              return `<tr><td>${escapeHtml(st.fornavn + ' ' + st.efternavn)}</td><td class="muted small">${escapeHtml(kgrpLabel(st))}</td><td class="muted small">${escapeHtml(st.klasse||'')}</td>${cols.map(c => renderTick(st.unilogin, c, ((m.sang_variant||'')===c))).join('')}</tr>`;
            }).join('')}</tbody></table>`;
      return;
    }

    if (type === 'gym') {
      const marks = getMarks(KEYS.marksGym);
      const cols = Object.keys(SNIPPETS.gym);
      const roleCodes = Object.keys(SNIPPETS.roller || {});
      wrap.innerHTML = `<table><thead><tr><th>Navn</th><th>K-grp</th><th>Klasse</th>${cols.map(c => `<th class="cb"><span class="muted small">${escapeHtml(SNIPPETS.gym[c].title||'')}</span></th>`).join('')}${roleCodes.map(r => `<th class="cb"><span class="muted small">${escapeHtml((SNIPPETS.roller[r]||{}).title||r)}</span></th>`).join('')}</tr></thead><tbody>${list.map(st => {
              const m = marks[st.unilogin] || {};
              return `<tr><td>${escapeHtml(st.fornavn + ' ' + st.efternavn)}</td><td class="muted small">${escapeHtml(kgrpLabel(st))}</td><td class="muted small">${escapeHtml(st.klasse||'')}</td>${cols.map(c => renderTick(st.unilogin, c, ((m.gym_variant||'')===c))).join('')}${roleCodes.map(r => renderTick(st.unilogin, 'role:'+r, (Array.isArray(m.gym_roles)?m.gym_roles:[]).includes(r))).join('')}</tr>`;
            }).join('')}</tbody></table>`;
      return;
    }

    const marks = getMarks(KEYS.marksElev);
    const cols = Object.keys(SNIPPETS.elevraad);
    wrap.innerHTML = `<table><thead><tr><th>Navn</th><th>K-grp</th><th>Klasse</th>${cols.map(c => `<th class="cb"><span class="muted small">${escapeHtml(SNIPPETS.elevraad[c].title||'')}</span></th>`).join('')}</tr></thead><tbody>${list.map(st => {
            const m = marks[st.unilogin] || {};
            return `<tr><td>${escapeHtml(st.fornavn + ' ' + st.efternavn)}</td><td class="muted small">${escapeHtml(kgrpLabel(st))}</td><td class="muted small">${escapeHtml(st.klasse||'')}</td>${cols.map(c => renderTick(st.unilogin, c, ((m.elevraad_variant||'')===c))).join('')}</tr>`;
          }).join('')}</tbody></table>`;
}

  async function importMarksFile(e, kind) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const text = await readFileText(f);
    const parsed = parseCsv(text);
    const colUnilogin = parsed.headers.find(h => ['unilogin','unicbrugernavn','unicusername','unic'].includes(normalizeHeader(h)));
    if (!colUnilogin) { alert('CSV mangler kolonne: Unilogin'); return; }

    let imported = 0;
    if (kind === 'sang') {
      const colVar = parsed.headers.find(h => ['sangvariant','sang_variant','sang'].includes(normalizeHeader(h)));
      const map = getMarks(KEYS.marksSang);
      parsed.rows.forEach(r => {
        const u = (r[colUnilogin] || '').trim(); if (!u) return;
        map[u] = map[u] || {};
        map[u].sang_variant = (r[colVar] || '').trim();
        imported++;
      });
      setMarks(KEYS.marksSang, map);
    }
    if (kind === 'gym') {
      const colVar = parsed.headers.find(h => ['gymvariant','gym_variant','gym'].includes(normalizeHeader(h)));
      const roleCodes = Object.keys(SNIPPETS.roller);
      const map = getMarks(KEYS.marksGym);
      parsed.rows.forEach(r => {
        const u = (r[colUnilogin] || '').trim(); if (!u) return;
        map[u] = map[u] || {};
        map[u].gym_variant = (r[colVar] || '').trim();
        roleCodes.forEach(rc => {
          const col = parsed.headers.find(h => normalizeHeader(h) === normalizeHeader(rc));
          if (col) {
            const val = String(r[col]||'').trim();
            map[u][rc] = (val === '1' || normalizeName(val)==='true' || normalizeName(val)==='ja');
          }
        });
        imported++;
      });
      setMarks(KEYS.marksGym, map);
    }
    if (kind === 'elevraad') {
      const colER = parsed.headers.find(h => ['elevraad','elevråd'].includes(normalizeHeader(h)));
      const map = getMarks(KEYS.marksElev);
      parsed.rows.forEach(r => {
        const u = (r[colUnilogin] || '').trim(); if (!u) return;
        map[u] = map[u] || {};
        const val = String(r[colER]||'').trim();
        map[u].elevraad = (val === '1' || normalizeName(val)==='true' || normalizeName(val)==='ja');
        imported++;
      });
      setMarks(KEYS.marksElev, map);
    }
    if (state.tab === 'set') renderMarksTable();
  }

  function wireEvents() {
    on('tab-k','click', () => { if (state.tab === 'k') { state.viewMode = (state.viewMode === 'ALL') ? 'K' : 'ALL'; renderStatus(); renderKList(); updateTabLabels(); } else { setTab('k'); } });
    on('tab-edit','click', async () => {
      await loadRemoteOverrides();
      applyTemplatesFromOverridesToLocal({ force: false, preserveLocks: true });
      applySnippetOverrides();
      setTab('edit');
    });
    on('tab-set','click', () => setTab('set'));
    on('btnReset','click', () => { if (confirm('Ryd alle lokale data?')) { lsDelPrefix(LS_PREFIX); location.reload(); } });

    on('meInput','input', () => {
      const s = getSettings();
      s.meDraft = $('meInput').value;
      setSettings(s);
      renderStatus();
    });

    ['txtElevudv','txtPraktisk','txtKgruppe'].forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      el.addEventListener('input', () => {
        if (!state.selectedUnilogin) return;
        const obj = getTextFor(state.selectedUnilogin);
        obj.elevudvikling = $('txtElevudv').value;
        obj.praktisk = $('txtPraktisk').value;
        obj.kgruppe = $('txtKgruppe').value;
        obj.lastSavedTs = Date.now();
        try {
          const sNow = getSettings();
          const ini = toInitials(((sNow.me || sNow.meResolved || '') + '').trim());
          if (ini) obj.lastEditedBy = ini;
        } catch(_) {}
        setTextFor(state.selectedUnilogin, obj);
        const st = getStudents().find(x => x.unilogin === state.selectedUnilogin);
        if (st) $('preview').textContent = buildStatement(st, getSettings());
        updateEditRatios();
      });
    });

    on('btnPrint','click', async () => {
      await loadRemoteOverrides();
      applyTemplatesFromOverridesToLocal({ preserveLocks: true });
      const st = getSelectedStudent();
      if (st) openPrintWindowForStudents([st], getSettings(), `Udtalelse - ${st.fornavn} ${st.efternavn}`);
    });
  }

  async function init() {
    wireEvents();
    await loadRemoteOverrides();
    if (!localStorage.getItem(KEYS.settings)) setSettings(defaultSettings());
    if (!localStorage.getItem(KEYS.templates)) setTemplates(defaultTemplates());
    applyTemplatesFromOverridesToLocal({ preserveLocks: true, force: false });
    applySnippetOverrides();
    setTab(getStudents().length > 0 ? "k" : "set");
    renderAll();
  }
  init().catch(console.error);
})();
