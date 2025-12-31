/* Elevudtalelser – statisk GitHub Pages app (ingen libs)
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
	// Backwards-compat alias (older builds referenced KEY_MARKS_TYPE directly)
	const KEY_MARKS_TYPE = KEYS.marksType;

  const TEACHER_ALIAS_MAP = {
  "ab": "Andreas Bech Pedersen",
  "avp": "Ane Vestergaard Pedersen",
  "av": "Anne Valsted",
  "ao": "Astrid Sun Otte",
  "bpo": "Bjarne Poulsen",
  "bs": "Bo Serritzlew",
  "cm": "Carsten Søe Mortensen",
  "dh": "Dennis Horn",
  "dc": "Dorthe Corneliussen Bertelsen",
  "eb": "Emil Egetoft Brinch",
  "eni": "Emil Nielsen",
  "hm": "Henrik Marcussen",
  "ic": "Ida Søttrup Christensen",
  "is": "Inge Johansen Stuhr",
  "jg": "Jakob Mols Græsborg",
  "jh": "Jens H. Noe",
  "jl": "Jesper Laubjerg",
  "kb": "Kathrine Spandet Brøndum",
  "kh": "Kenneth Hald",
  "kvs": "Kristoffer Vorre Sørensen",
  "lgn": "Laura Guldbæk Nymann",
  "mti": "Magnus Tolborg Ibsen",
  "mt": "Maria Rosborg Thornval",
  "mo": "Marianne Brun Ottesen",
  "mv": "Mark Vestergaard Pedersen",
  "mg": "Martin Gregersen",
  "ms": "Mia Mejlby Sørensen",
  "mtp": "Mikkel Tejlgaard Pedersen",
  "mm": "Måns Patrik Mårtensson",
  "rb": "Randi Borum",
  "rd": "Rasmus Damsgaard",
  "ra": "Rebecka Antonsen",
  "sg": "Sara Maiken Mols Græsborg",
  "smb": "Stine Maria Birkeholm",
  "snv": "Stine Nielsen Vad",
  "sp": "Stinne Krogh Poulsen",
  "th": "Trine Hedegaard Nielsen",
  "tin": "Trine Isager Nielsen",
  "tk": "Trine Krogh Korneliussen",
  "vsi": "Viola Simonsen"
};

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

  // Backwards compatibility: some code paths still reference DEFAULT_ALIAS_MAP.
  // Keep it as an alias of TEACHER_ALIAS_MAP.
  const DEFAULT_ALIAS_MAP = TEACHER_ALIAS_MAP;

    const SNIPPETS_DEFAULT = JSON.parse(JSON.stringify(SNIPPETS));

const DEFAULT_SCHOOL_TEXT =
`På Himmerlands Ungdomsskole arbejder vi med både faglighed, fællesskab og personlig udvikling.
Udtalelsen er skrevet med udgangspunkt i elevens hverdag og deltagelse gennem skoleåret.`;

  const DEFAULT_TEMPLATE = "Udtalelse vedrørende {{ELEV_FULDE_NAVN}}\n\n{{ELEV_FORNAVN}} {{ELEV_EFTERNAVN}} har været elev på Himmerlands Ungdomsskole i perioden fra {{PERIODE_FRA}} til {{PERIODE_TIL}} i {{ELEV_KLASSE}}.\n\nHimmerlands Ungdomsskole er en traditionsrig efterskole, som prioriterer fællesskabet og faglig fordybelse højt. Elevernes hverdag er præget af frie rammer og mange muligheder. Vi møder eleverne med tillid, positive forventninger og faglige udfordringer. I løbet af et efterskoleår på Himmerlands Ungdomsskole er oplevelserne mange og udfordringerne ligeså. Det gælder i hverdagens almindelige undervisning, som fordeler sig over boglige fag, fællesfag og profilfag. Det gælder også alle de dage, hvor hverdagen ændres til fordel for temauger, studieture mm. \n\n{{ELEV_UDVIKLING_AFSNIT}}\n\nSom en del af et efterskoleår på Himmerlands Ungdomsskole deltager eleverne ugentligt i fællessang og fællesgymnastik. Begge fag udgør en del af efterskolelivet, hvor eleverne oplever nye sider af sig selv, flytter grænser og oplever, at deres bidrag til fællesskabet har betydning. I løbet af året optræder eleverne med fælleskor og gymnastikopvisninger.\n\n{{SANG_GYM_AFSNIT}}\n\nPå en efterskole er der mange praktiske opgaver.\n\n{{PRAKTISK_AFSNIT}}\n\n{{ELEV_FORNAVN}} har på Himmerlands Ungdomsskole været en del af en kontaktgruppe på {{KONTAKTGRUPPE_ANTAL}} elever. I kontaktgruppen kender vi {{HAM_HENDE}} som {{KONTAKTGRUPPE_BESKRIVELSE}}.\n\nVi har været rigtig glade for at have {{ELEV_FORNAVN}} som elev på skolen og ønsker held og lykke fremover.\n\n{{KONTAKTLÆRER_1_NAVN}} & {{KONTAKTLÆRER_2_NAVN}}\n\nKontaktlærere\n\n{{FORSTANDER_NAVN}}\n\nForstander";

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
  function lsSet(key, value) { localStorage.setItem(key, JSON.stringify(value)); 
// Index: which teacher namespaces have any saved text per unilogin.
function buildTextOwnersIndex(){
  const idx = {};
  try{
    for (let i=0; i<localStorage.length; i++){
      const k = localStorage.key(i);
      if (!k) continue;
      if (!k.startsWith(KEYS.textPrefix)) continue;
      const rest = k.slice(KEYS.textPrefix.length);
      const u = rest.indexOf('_');
      if (u <= 0) continue;
      const owner = rest.slice(0, u);
      const unilogin = rest.slice(u+1);
      if (!unilogin) continue;

      // Consider "has text" if any main fields contain non-whitespace.
      const obj = lsGet(k, null);
      if (!obj) continue;
      const has = !!(((obj.elevudvikling||'')+'').trim() || ((obj.praktisk||'')+'').trim() || ((obj.kgruppe||'')+'').trim());
      if (!has) continue;

      if (!idx[unilogin]) idx[unilogin] = [];
      if (!idx[unilogin].includes(owner)) idx[unilogin].push(owner);
    }
  } catch {}
  // Stable-ish ordering (alphabetical)
  try{
    Object.keys(idx).forEach(u => idx[u].sort());
  } catch {}
  return idx;
}

function getOwnersWithText(unilogin){
  if (!state.textOwnersIndex) state.textOwnersIndex = buildTextOwnersIndex();
  return state.textOwnersIndex[unilogin] || [];
}

function renderOwnerBadges(unilogin){
  const owners = getOwnersWithText(unilogin);
  if (!owners.length) return '';
  return `<div class="badgeRow">${owners.map(o=>`<span class="pill tiny">${escapeHtml(o)}</span>`).join('')}</div>`;
}

}

  // Compatibility alias used by some UI handlers
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
const SNIPPETS_LEGACY_KEY = 'udt_snippets_override_v1';
const SNIPPETS_IMPORTED_KEY = 'udt_snippets_imported_v1';
const SNIPPETS_DRAFT_KEY = 'udt_snippets_draft_v1';
const OVERRIDE_SCHEMA = 'hu-elevudtalelser-snippets-override@1';
// --- Remote overrides from GitHub Pages (optional) -------------------------
// If files exist in /overrides/, they are merged on top of defaults.
// Missing files are ignored silently.
const REMOTE_OVERRIDE_FILES = {
  sang: './overrides/sang_override.json',
  gym: './overrides/gym_override.json',
  elevraad: './overrides/elevraad_override.json',
  templates: './overrides/templates_override.json',
};
let REMOTE_OVERRIDES = { sang: null, gym: null, elevraad: null, templates: null };

function cacheBust(url){
  const v = Date.now();
  return url + (url.includes('?') ? '&' : '?') + 'v=' + v;
}
async function fetchJsonIfExists(url){
  try{
    const res = await fetch(cacheBust(url), { cache: 'no-store' });
    if (!res.ok) return null; // 404 etc.
    return await res.json();
  }catch(_e){
    return null;
  }
}
function unwrapOverridePack(pack){
  if (!pack) return null;
  // Accept either full package {schema,scope,payload} or raw payload object
  if (pack.payload) return pack.payload;
  return pack;
}
async function loadRemoteOverrides(){
  const [sang, gym, elevraad, templates] = await Promise.all([
    fetchJsonIfExists(REMOTE_OVERRIDE_FILES.sang),
    fetchJsonIfExists(REMOTE_OVERRIDE_FILES.gym),
    fetchJsonIfExists(REMOTE_OVERRIDE_FILES.elevraad),
    fetchJsonIfExists(REMOTE_OVERRIDE_FILES.templates),
  ]);
  REMOTE_OVERRIDES = {
    sang: unwrapOverridePack(sang),
    gym: unwrapOverridePack(gym),
    elevraad: unwrapOverridePack(elevraad),
    templates: unwrapOverridePack(templates),
  };
}


function getSnippetImported() {
  return lsGet(SNIPPETS_IMPORTED_KEY, {}) || {};
}
function setSnippetImported(o) {
  lsSet(SNIPPETS_IMPORTED_KEY, o || {});
}
function getSnippetDraft() {
  // Backward compatibility: migrate legacy key -> draft
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
function applySnippetOverrides() {
  const remote = REMOTE_OVERRIDES || {};
  const imported = getSnippetImported();
  const draft = getSnippetDraft();

  // start fra defaults (deep clone)
  SNIPPETS = JSON.parse(JSON.stringify(SNIPPETS_DEFAULT));

  function applyPack(pack){
    if(!pack) return;

    // If a full override package was stored, unwrap payload
    if (pack.payload) pack = pack.payload;

    // --- Sang
    const sang = pack.sang && (pack.sang.items ? pack.sang : pack.sang.sang); // accept nested
    if (sang && sang.items) {
      Object.keys(sang.items).forEach(k => {
        const it = sang.items[k] || {};
        if (!SNIPPETS.sang[k]) SNIPPETS.sang[k] = { title: k, text_m: '', text_k: '' };
        if (typeof it.label === 'string' && it.label.trim()) SNIPPETS.sang[k].title = it.label.trim();
        if (typeof it.text === 'string') { SNIPPETS.sang[k].text_m = it.text; SNIPPETS.sang[k].text_k = it.text; }
        // allow direct text_m/text_k too
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

    // --- Gym (varianter + roller)
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

    // --- Elevråd (YES)
    const er = pack.elevraad && (typeof pack.elevraad.text === 'string') ? pack.elevraad : (pack.elevraad && pack.elevraad.elevraad ? pack.elevraad.elevraad : null);
    if (er && typeof er.text === 'string') {
      if (!SNIPPETS.elevraad.YES) SNIPPETS.elevraad.YES = { title: 'Elevrådsrepræsentant', text_m: '', text_k: '' };
      SNIPPETS.elevraad.YES.text_m = er.text;
      SNIPPETS.elevraad.YES.text_k = er.text;
      if (typeof er.label === 'string' && er.label.trim()) SNIPPETS.elevraad.YES.title = er.label.trim();
    }
  }

  // 1) Remote (GitHub /overrides/)
  applyPack(remote.sang);
  applyPack(remote.gym);
  applyPack(remote.elevraad);

  // 2) Imported overrides (explicitly imported JSON)
  applyPack(imported);

  // 3) Draft overrides (local work-in-progress; MUST win on refresh)
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
  // Some browsers need a short delay before revoking
  setTimeout(()=>{ try{ URL.revokeObjectURL(url); }catch(e){} }, 250);
}

function exportLocalBackup() {
  const owner = getOwnerKeyForStorage();
  if (!owner || owner === 'ALL') {
    alert('Vælg en konkret K-lærer (ikke "Alle") før du tager backup.');
    return;
  }

  const prefix = KEYS.textPrefix + owner + '_';
  const data = {};
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (!k || !k.startsWith(prefix)) continue;
    data[k] = localStorage.getItem(k);
  }

  if (!Object.keys(data).length) {
    alert('Der var ingen udtalelser at tage backup af for denne K-lærer endnu.');
    return;
  }

  const s = getSettings();
  const year = Number(s.schoolYearEnd) || '';
  const stamp = new Date().toISOString().replace(/[:.]/g,'-').slice(0,19);
  const file = `elevudtalelser_backup_${owner}${year ? '_' + year : ''}_${stamp}.json`;

  downloadJson(file, {
    schema: 'elevudtalelser_backup_v2',
    createdAt: new Date().toISOString(),
    owner,
    prefix,
    data
  });
}

function getMyKStudents() {
  const s = getSettings();
  const studs = getStudents();
  if (!studs.length) return [];

  const raw = ((s.me || '') + '').trim();
  const meResolvedConfirmed = ((s.meResolvedConfirmed || '') + '').trim();
  const meResolvedRaw = resolveTeacherName(raw) || raw;
  const meNorm = normalizeName(meResolvedConfirmed || meResolvedRaw);
  if (!meNorm) return [];
  return sortedStudents(studs)
    .filter(st => normalizeName(st.kontaktlaerer1) === meNorm || normalizeName(st.kontaktlaerer2) === meNorm);
}

// --- Print: force single-student print to always fit on ONE A4 page by scaling down.
// Strategy: compute available content height (A4 minus margins = 261mm) in px,
// compare to rendered preview height at scale=1, and set CSS var --printScale.
function applyOnePagePrintScale() {
  const preview = document.getElementById('preview');
  if (!preview) return;

  // Reset
  document.documentElement.style.setProperty('--printScale', '1');

  const txt = (preview.textContent || '').trim();
  if (!txt) return;

  // Measure available height in px (A4 height minus @page top/bottom margin)
  const probe = document.createElement('div');
  probe.style.cssText = 'position:fixed; left:-9999px; top:-9999px; width:1mm; height:261mm; visibility:hidden; pointer-events:none;';
  document.body.appendChild(probe);
  const availPx = probe.getBoundingClientRect().height;
  probe.remove();
  if (!availPx) return;

  // Iterative fit: use getBoundingClientRect() which reflects transform scaling.
  let scale = 1;
  for (let i=0; i<4; i++){
    // Apply
    document.documentElement.style.setProperty('--printScale', String(scale));
    const used = preview.getBoundingClientRect().height;
    if (!used) break;

    // Target close to full height, but keep a tiny safety margin
    const target = availPx * 0.995;

    if (used > target) {
      scale = scale * (target / used);
    } else {
      // If there's noticeable slack, scale up a bit (but never above 1)
      const slack = target - used;
      if (slack > (availPx * 0.02)) {
        scale = Math.min(1, scale * (target / used));
      } else {
        break;
      }
    }
    scale = Math.max(0.10, Math.min(1, scale));
  }
}

function printAllKStudents() {
  const list = state.showAllStudents ? sortedStudents(getStudents()) : getMyKStudents();
  if (!list.length) {
    alert('Der er ingen K-elever at printe (tjek elevliste og initialer).');
    return;
  }
  // Build a dedicated print window with page breaks between students
  const title = state.showAllStudents ? 'Elevudtalelser – print alle elever' : 'Elevudtalelser – print alle K-elever';
  // One-page-per-student, always fit by scaling down if needed.
  // Printable area: A4 minus @page margins = 178mm x 261mm.
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
  const body = list.map(st => {
    const txt = buildStatement(st, getSettings());
    return `
      <section class="entry">
        <div class="page"><pre class="content">${escapeHtml(txt)}</pre></div>
      </section>
    `;
  }).join('');

  const w = window.open('', '_blank');
  if (!w) {
    alert('Pop-up blev blokeret. Tillad pop-ups for at printe alle.');
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
            const avail = p.clientHeight;
            if (!avail) return;

            let s = 1;
            for (let i=0; i<4; i++){
              p.style.setProperty('--s', String(s));
              const used = c.getBoundingClientRect().height;
              if (!used) break;
              const target = avail * 0.995;

              if (used > target) {
                s = s * (target / used);
              } else {
                const slack = target - used;
                if (slack > (avail * 0.02)) {
                  s = Math.min(1, s * (target / used));
                } else {
                  break;
                }
              }
              s = Math.max(0.10, Math.min(1, s));
            }
            p.style.setProperty('--s', String(s));
          });
        }
        window.addEventListener('load', fitAll);
        window.addEventListener('beforeprint', fitAll);
      })();
    </script>
  </body></html>`);
  w.document.close();
  // Let the browser lay out the document before printing
  setTimeout(()=>{ try{ w.focus(); w.print(); }catch(e){} }, 250);
}

function importLocalBackup(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const obj = JSON.parse(String(reader.result || '{}'));
      if (!obj || typeof obj !== 'object' || !obj.data) throw new Error('Ugyldig backupfil.');

      if (obj.schema !== 'elevudtalelser_backup_v2') {
        throw new Error('Backupfilen har et gammelt format. Brug en nyere backup (v2).');
      }

      const owner = (obj.owner || '').toString().trim().toUpperCase();
      const prefix = (obj.prefix || '').toString();
      if (!owner || !prefix || !prefix.startsWith(KEYS.textPrefix + owner + '_')) {
        throw new Error('Backupfilen mangler owner/prefix i korrekt format.');
      }

      let imported = 0, skipped = 0;
      for (const [k, v] of Object.entries(obj.data || {})) {
        if (typeof k !== 'string' || !k.startsWith(prefix)) { skipped++; continue; }
        localStorage.setItem(k, String(v ?? ''));
        imported++;
      }

      alert(`Backup importeret\nOwner: ${owner}\nImporteret: ${imported}\nSkippet: ${skipped}`);
      renderAll();
    } catch (err) {
      alert(err?.message || String(err));
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

  if (expectedScope === 'templates' || obj.scope === 'templates' || obj.scope === 'all') {
    // Templates er ikke snippets-overrides, men indstillinger/templates.
    if (p.templates) {
      // Store imported templates separately, so a local draft is not overwritten on refresh.
      const tImp = lsGet(KEYS.templatesImported, {});
      if (typeof p.templates.schoolText === 'string') tImp.schoolText = p.templates.schoolText;
      if (typeof p.templates.template === 'string') tImp.template = p.templates.template;
      lsSet(KEYS.templatesImported, tImp);

const s = getSettings();
      if (typeof p.templates.forstanderNavn === 'string') s.forstanderName = p.templates.forstanderNavn;
      setSettings(s);
    }
  }

  setSnippetImported(overrides);
  applySnippetOverrides();
}

// ---------- normalize ----------
  function normalizeName(input) {
  if (!input) return "";
  return input
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\./g, " ")
    // Danish letters are not decomposed by NFD, so transliterate explicitly
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

  const aliasMap = (s && s.aliasMap) ? s.aliasMap : DEFAULT_ALIAS_MAP;
  const key = normalizeName(input).replace(/\s+/g, "");
  if (aliasMap && aliasMap[key]) {
    return { raw: input, resolved: aliasMap[key] };
  }

  const all = getAllTeacherNamesFromStudents();
  const nIn = normalizeName(input);
  const exact = all.find(n => normalizeName(n) === nIn);
  if (exact) return { raw: input, resolved: exact };

  // Partial match: allow "Måns" -> "Måns Patrik Mårtensson" etc.
  const partial = all.filter(n => normalizeName(n).includes(nIn));
  if (partial.length === 1) return { raw: input, resolved: partial[0] };

  return { raw: input, resolved: input };
}

function resolveTeacherName(raw) {
  return resolveTeacherMatch(raw).resolved;
}


// --- K-lærer namespaces ----------------------------------------------------
// Special value for "show all"
function isAllTeacherRaw(raw){
  // v20: 'Alle' som bruger er fjernet.
  return false;
}

function teacherKeyFromRaw(raw){
  const s = getSettings();
  const aliasMap = (s && s.aliasMap) ? s.aliasMap : DEFAULT_ALIAS_MAP;

  const r = ((raw||'')+'').trim();
  if (!r) return '';

  // If raw matches an alias code, use it
  const rawNorm = normalizeName(r).replace(/\s+/g,'');
  const aliasCodes = Object.keys(aliasMap || {});
  const hitCode = aliasCodes.find(k => normalizeName(k).replace(/\s+/g,'') === rawNorm);
  if (hitCode) return (hitCode||'').toString().toUpperCase();

  // If raw is a full name that matches an alias target, return the alias code
  const resolved = resolveTeacherName(r) || r;
  const resNorm = normalizeName(resolved);
  const hitByName = aliasCodes.find(k => normalizeName(aliasMap[k]) === resNorm);
  if (hitByName) return (hitByName||'').toString().toUpperCase();

  // Fallback: stable-ish slug from resolved name
  const slug = resNorm.replace(/[^a-z0-9]+/g,'').toUpperCase();
  return (slug || 'UNK').slice(0, 16);
}

// Which teacher namespace should we read/write texts under?
// - Normal mode: uses K-lærer input
// - "Alle": uses settings.activeTeacher (the one we are editing/printing for)
function getOwnerKeyForStorage(){
  const s = getSettings();
  const raw = ((s.me||'')+'').trim();
  return teacherKeyFromRaw(raw);
}

function getTextKey(unilogin, ownerKey){
  const ok = (ownerKey || getOwnerKeyForStorage() || '').trim();
  if (!ok) return null; // e.g. ALL-mode without valgt aktiv lærer
  return KEYS.textPrefix + ok + '_' + unilogin;
}

function updateTeacherDatalist() {
  // Replaces the old <datalist> UX with a custom, searchable dropdown.
  const input = document.getElementById('meInput');
  const menu  = document.getElementById('teacherPickerMenu');
  const btn   = document.getElementById('teacherPickerBtn');
  const wrap  = document.getElementById('teacherPicker');
  if (!input || !menu || !btn || !wrap) return;

  const s = getSettings();
  const aliasMap = (s && s.aliasMap) ? s.aliasMap : DEFAULT_ALIAS_MAP;
  const fullNames = getAllTeacherNamesFromStudents();

  const aliasItems = Object.keys(aliasMap || {}).map(k => {
    const code = (k || '').toString().toUpperCase();
    const name = (aliasMap[k] || '').toString().trim();
    return { kind: 'alias', code, name };
  }).filter(x => x.code);

  // Full-name items (avoid duplicates)
  const aliasNames = new Set(aliasItems.map(x => normalizeName(x.name)));
  const nameItems = fullNames
    .filter(n => n && !aliasNames.has(normalizeName(n)))
    .map(n => ({ kind: 'name', code: '', name: n }));

  // Special "Alle" item
  const allModeItem = { kind:'all', code:'ALLE', name:'Alle (alle k-lærere)', value:'Alle' };

  // Sorted: aliases first, then names
  aliasItems.sort((a,b) => a.code.localeCompare(b.code));
  nameItems.sort((a,b) => normalizeName(a.name).localeCompare(normalizeName(b.name)));
  const allItems = [allModeItem, ...aliasItems, ...nameItems];

  function itemMatches(it, q){
    // Autocomplete behavior: match from the *start* of alias codes or name-words.
    // This feels closer to native autocomplete than a broad "contains" search.
    if (!q) return true;
    const nq = normalizeName(q).replace(/\s+/g,'');
    if (!nq) return true;

    const code = normalizeName(it.code || '').replace(/\s+/g,'');
    const name = normalizeName(it.name || '');

    // 1) Alias code prefix (e.g. "M" -> "MM")
    if (code && code.startsWith(nq)) return true;

    // 2) Word-start in name (e.g. "m" -> "Måns ...")
    const words = name.split(/\s+/).filter(Boolean);
    if (words.some(w => w.startsWith(nq))) return true;

    // 3) Initialism prefix (e.g. "mm" -> "Måns Mårtensson")
    const initials = words.map(w => (w[0] || '')).join('');
    if (initials && initials.startsWith(nq)) return true;

    return false;
  }

  function renderMenu(){
    const q = (input.value || '').trim();
    const items = allItems.filter(it => itemMatches(it, q)).slice(0, 120);
    menu.innerHTML = '';
    if (!items.length){
      const empty = document.createElement('div');
      empty.className = 'tpItem';
      empty.style.opacity = '.75';
      empty.style.cursor = 'default';
      empty.textContent = 'Ingen match – skriv fx initialer eller et navn…';
      menu.appendChild(empty);
      return;
    }
    for (const it of items){
      const row = document.createElement('div');
      row.className = 'tpItem';
      row.setAttribute('role','option');
      const left = document.createElement('div');
      left.className = 'tpLeft';
      const right = document.createElement('div');
      right.className = 'tpRight';

      if (it.kind === 'all') {
        left.textContent = 'Alle';
        right.textContent = '(alle k-lærere)';
        row.dataset.value = 'Alle';
      } else if (it.kind === 'alias'){
        left.textContent = it.code;
        right.textContent = it.name ? `(${it.name})` : '';
        row.dataset.value = it.code;
      } else {
        left.textContent = it.name;
        right.textContent = '';
        row.dataset.value = it.name;
      }

      row.appendChild(left);
      row.appendChild(right);

      row.addEventListener('mousedown', (e) => {
        // mousedown so selection happens before blur
        e.preventDefault();
        input.value = row.dataset.value || '';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        closeMenu();
      });

      menu.appendChild(row);
    }
  }

  function openMenu(){
    if (!menu.hidden) return;
    renderMenu();
    menu.hidden = false;
  }
  function closeMenu(){
    if (menu.hidden) return;
    menu.hidden = true;
  }
  function toggleMenu(){
    if (menu.hidden) openMenu(); else closeMenu();
  }

  // Init listeners once
  if (!window.__TEACHER_PICKER_INIT__){
    window.__TEACHER_PICKER_INIT__ = true;
    btn.addEventListener('click', (e) => { e.preventDefault(); toggleMenu(); input.focus(); });
    input.addEventListener('focus', () => openMenu());
    input.addEventListener('input', () => { if (!menu.hidden) renderMenu(); });
    document.addEventListener('click', (e) => {
      if (!wrap.contains(e.target)) closeMenu();
    });
    // ESC closes
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  // If settings/students changed, refresh suggestions when open
  if (!menu.hidden) renderMenu();
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
    // HU-data: hvis fornavn-feltet indeholder ekstra efternavn, brug kun første ord.
    // Behold bindestreg-navne (fx Anne-Sofie) uændret.
    const s = (rawFirstName ?? '').toString().trim();
    if (!s) return '';
    const parts = s.split(/\s+/).filter(Boolean);
    return parts.length ? parts[0] : s;
  }
  function normalizeHeader(input) { return normalizeName(input).replace(/[^a-z0-9]+/g, ""); }

  // ---------- util ----------
  function escapeAttr(s) { return (s ?? '').toString().replace(/"/g,'&quot;'); }
  function $(id){ return document.getElementById(id); }

function syncKToggleAndPrintLabels(){
  // v20: labels depend on toggle state (vis alle elever) — no 'Alle' bruger.
  const btnToggleShowAll = $("btnToggleShowAll");
  const btnPrintAllK = $("btnPrintAllK");
  const showAll = !!state.showAllStudents;
  if (btnToggleShowAll) btnToggleShowAll.textContent = showAll ? "Viser kun mine K-elever" : "Viser alle elever";
  if (btnPrintAllK) btnPrintAllK.textContent = showAll ? "🖨️ Print alle elever" : "🖨️ Print alle K-elever";
}

  // Hold "Faglærer-arbejde" type tabs in sync with the underlying select.
  // This must live in the same scope as renderMarksTable().
  function syncMarksTypeTabs(){
    const wrap = $("marksTypeTabs");
    const sel  = $("marksType");
    if(!wrap || !sel) return;
  // Compare using normalized tokens (e.g. "Elevråd" == "elevraad").
  const val = normalizeHeader(sel.value || "sang");
  wrap.querySelectorAll("button[data-type]").forEach(btn => {
    const t = normalizeHeader(btn.getAttribute("data-type") || "");
    const on = (t && t === val);
    btn.classList.toggle("active", on);
    btn.setAttribute("aria-pressed", on ? "true" : "false");
  });
  }

const on = (id, ev, fn, opts) => { const el = document.getElementById(id); if (el) el.addEventListener(ev, fn, opts); };
  // ---------- CSV ----------
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
  function downloadText(filename, text) {
    const blob = new Blob([text], {type:'text/csv;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  // ---------- app state ----------
  const state = {
    tab: 'set',
    settingsSubtab: 'general',
    selectedUnilogin: null,
    studentInputUrls: {},
    // The current visible K-elev list (after any filters). Used for prev/next navigation in Redigér.
    visibleKElevIds: [],
    kMeDraft: '',
    showAllStudents: false
  };

  // Restore last UI selection (settings subtab etc.) from localStorage
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

  // UI-state (tabs etc.) is stored inside settings.ui so it survives reloads
  function loadUIStateInto(stateObj){
    const s = getSettings();
    const ui = (s && s.ui) ? s.ui : {};
    if (typeof ui.settingsSubtab === 'string' && ui.settingsSubtab) stateObj.settingsSubtab = ui.settingsSubtab;
    if (typeof ui.marksType === 'string' && ui.marksType) stateObj.marksType = ui.marksType;
    if (typeof ui.showAllStudents === 'boolean') stateObj.showAllStudents = ui.showAllStudents;
  }

  function saveUIStateFrom(stateObj){
    const s = getSettings();
    s.ui = s.ui || {};
    s.ui.settingsSubtab = stateObj.settingsSubtab;
    s.ui.marksType = stateObj.marksType;
    s.ui.showAllStudents = !!stateObj.showAllStudents;
    setSettings(s);
  }

  // Back-compat: older code calls saveState()
  function saveState(){ saveUIStateFrom(state); }
  function getTemplates(){ return Object.assign(defaultTemplates(), (REMOTE_OVERRIDES.templates && (REMOTE_OVERRIDES.templates.templates || REMOTE_OVERRIDES.templates)) || {}, lsGet(KEYS.templatesImported, {}), lsGet(KEYS.templates, {})); }
  function setTemplates(t){ lsSet(KEYS.templates, t); }
  function getStudents(){ const s = lsGet(KEYS.students, []); window.__ALL_STUDENTS__ = s || []; return s; }
  function setStudents(studs){ lsSet(KEYS.students, studs); window.__ALL_STUDENTS__ = studs || []; }
  function getMarks(kindKey){ return lsGet(kindKey, {}); }
  function setMarks(kindKey, m){ lsSet(kindKey, m); }
  function getTextFor(unilogin, ownerKey){
    const key = getTextKey(unilogin, ownerKey);
    if (!key) return { elevudvikling:'', praktisk:'', kgruppe:'', lastSavedTs:null, studentInputMeta:null };
    return lsGet(key, { elevudvikling:'', praktisk:'', kgruppe:'', lastSavedTs:null, studentInputMeta:null });
  }
  function setTextFor(unilogin, obj, ownerKey){
    const key = getTextKey(unilogin, ownerKey);
    if (!key) { alert('Vælg en aktiv lærer (til redigér/print), før du redigerer udtalelser i "Alle"-tilstand.'); return; }
    lsSet(key, obj);
  }

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
    // Ukendt/neutral
    return { HAN_HUN: 'han/hun', HAM_HENDE: 'ham/hende', HANS_HENDES: 'hans/hendes', SIG_HAM_HENDE: 'sig' };
  }


  function sortedStudents(all) {
    return all.slice().sort((a,b) =>
      (genderGroup(a.koen) - genderGroup(b.koen)) ||
      (a.efternavn||'').localeCompare(b.efternavn||'', 'da') ||
      (a.fornavn||'').localeCompare(b.fornavn||'', 'da')
    );
  }

  // ---------- templating ----------
  function snippetTextByGender(snObj, genderRaw) {
    const g = normalizeName(genderRaw);
    const isMale = (g === 'm' || g.includes('dreng') || /\bmale\b/.test(g));
    const txt = isMale ? (snObj.text_m || '') : (snObj.text_k || snObj.text_m || '');
    return txt;
  }
  function applyPlaceholders(text, placeholderMap) {
  if (!text) return "";
  const s = String(text);

  // Replaces both {KEY} and {{KEY}} (allows æ/ø/å).
  // Lookup strategy:
  // 1) exact uppercased key
  // 2) normalized key (æ/ø/å -> AE/OE/AA + diacritics stripped)
  // 3) raw key as-is
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
    Object.keys(SNIPPETS.roller).forEach(code => {
      if (marksGym[code]) roleTexts.push(snippetTextByGender(SNIPPETS.roller[code], student.koen));
    });
    let rolleAfsnit = roleTexts.filter(Boolean).join('\n\n');

    let elevraadAfsnit = '';
    if (marksER.elevraad) elevraadAfsnit = snippetTextByGender(SNIPPETS.elevraad.YES, student.koen);

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
      "ELEVRAAD_AFSNIT": elevraadAfsnit,
      "ROLLE_AFSNIT": rolleAfsnit,

      "ELEVUDVIKLING_AFSNIT": (free.elevudvikling || ''),
      "PRAKTISK_AFSNIT": (free.praktisk || ''),
      "KONTAKTGRUPPE_AFSNIT": (free.kgruppe || SNIPPETS.kontaktgruppeDefault),

      "AFSLUTNING_AFSNIT": SNIPPETS.afslutningDefault,

      "KONTAKTLAERERE": kontakt,
      "FORSTANDER": settings.forstanderName || '',
// Synonymer til skabeloner/snippets (forskellige placeholder-navne)
"ELEV_FULDE_NAVN": fullName,
"ELEV_FULD_E_NAVN": fullName,
"ELEV_UDVIKLING_AFSNIT": (free.elevudvikling || ''),
"ELEV_UDVIKLING_FRI": (free.elevudvikling || ''),
"PRAKTISK_FRI": (free.praktisk || ''),
"KGRUPPE_FRI": (free.kgruppe || ''),
"KONTAKTGRUPPE_ANTAL": String(settings.contactGroupCount || (window.__ALL_STUDENTS__ ? window.__ALL_STUDENTS__.length : "") || ''),
"KONTAKTGRUPPE_BESKRIVELSE": (free.kgruppe || SNIPPETS.kontaktgruppeDefault || ''),
"KONTAKTLAERER_1_NAVN": (student.kontaktlaerer1 || '').trim(),
"KONTAKTLAERER_2_NAVN": (student.kontaktlaerer2 || '').trim(),
      "KONTAKTLÆRER_1_NAVN": (student.kontaktlaerer1 || '').trim(),
      "KONTAKTLÆRER_2_NAVN": (student.kontaktlaerer2 || '').trim(),
"FORSTANDER_NAVN": settings.forstanderName || '',

      "HAN_HUN": pr.HAN_HUN,
      "HAM_HENDE": pr.HAM_HENDE,
      "HANS_HENDES": pr.HANS_HENDES,

      /* legacy placeholders */
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
      "SANG_GYM_AFSNIT": [sangAfsnit, gymAfsnit, elevraadAfsnit, rolleAfsnit].filter(Boolean).join('\n\n')
    };

    let out = tpls.template || DEFAULT_TEMPLATE;
    out = applyPlaceholders(out, placeholderMap);
    return cleanSpacing(out);
  }

  async function readFileText(file) { return await file.text(); }

  // ---------- student CSV mapping ----------
  const STUDENT_COLMAP = {
    fornavn: new Set(["fornavn","firstname","givenname"]),
    efternavn: new Set(["efternavn","lastname","surname","familyname"]),
    unilogin: new Set(["unilogin","unicbrugernavn","unicusername","unic"]),
    koen: new Set(["køn","koen","gender", "kon"]),
    klasse: new Set(["klasse","class","hold"]),
    kontakt1: new Set(["kontaktlærer1","kontaktlaerer1","relationerkontaktlaerernavn","relationerkontaktlærernavn","kontaktlærer","kontaktlaerer"]),
    kontakt2: new Set(["kontaktlærer2","kontaktlaerer2","relationerandenkontaktlaerernavn","relationerandenkontaktlærernavn","andenkontaktlærer","andenkontaktlaerer"])
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

    // Rens fornavn-felt: nogle elever har et "ekstra efternavn" i fornavn-kolonnen.
    // Regel: hvis fornavn har flere ord og IKKE indeholder bindestreg, så bruges første ord som kaldnavn,
    // og resten flyttes over i efternavn (foran eksisterende efternavn).
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
    const koen = get('koen');
    const klasse = get('klasse');
    const k1 = resolveTeacherName(get('kontakt1'));
    const k2 = resolveTeacherName(get('kontakt2'));
    return { fornavn, efternavn, unilogin, koen, klasse, kontaktlaerer1: k1, kontaktlaerer2: k2 };
  }

  // ---------- UI rendering ----------
  function setTab(tab) {
    let students = getStudents();
    if (!students.length && Array.isArray(window.__ALL_STUDENTS__)) students = window.__ALL_STUDENTS__;
    if (!students.length && tab !== 'set') tab = 'set';

    // Redigér kræver valgt elev. Hvis ingen er valgt, send brugeren til K-elever.
    if (tab === 'edit' && !state.selectedUnilogin) tab = 'k';

    state.tab = tab;

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

    // Persistér valg af underfane og sørg for at UI'et re-rendres
    // (ellers bliver fx faglærer-tabellen ikke bygget).
    saveState();
  // Undgå recursion: opdater kun UI lokalt
  updateTeacherDatalist();
  renderMarksTable(); // hvis export-pane er synligt
}


  function updateTabVisibility() {
    const editBtn = $('tab-edit');
    if (!editBtn) return;
    // Skjul Redigér, hvis ingen elev er valgt.
    editBtn.style.display = state.selectedUnilogin ? '' : 'none';
  }

  function renderAll() {
    updateTeacherDatalist();
    updateTabVisibility();
    renderStatus();
    if (state.tab === 'set') renderSettings();
    if (state.tab === 'k') renderKList();
    if (state.tab === 'edit') renderEdit();
  }

  function renderStatus() {
  const s = getSettings();
  const studs = getStudents();
  let me = '';
  if (s.meResolved) me = `· K-lærer: ${s.meResolved}`;
  $('statusText').textContent = studs.length ? `Elever: ${studs.length} ${me}` : `Ingen elevliste indlæst`;
}

  function renderSettings() {
    const s = getSettings();
    const t = getTemplates();
    const studs = getStudents();

    // Ensure correct subtab visibility
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

    // Hvis vi er på Data & eksport, så render/refresh også flueben-tabellen her,
    // så den ikke "hænger" på en gammel status efter import af students.csv.
    if (state.settingsSubtab === 'export') {
      try { renderMarksTable(); } catch (e) { /* no-op */ }
    }

    const meNorm = normalizeName(s.meResolved);
    if (studs.length && meNorm) {
      const count = studs.filter(st => normalizeName(st.kontaktlaerer1) === meNorm || normalizeName(st.kontaktlaerer2) === meNorm).length;
      $('contactCount').value = String(count);
      // persist contact group count for placeholders
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
  // Hvis UI ikke findes (ældre HTML), gør intet
  if (!$('sangText_S1')) return;

  // Sikr vi viser de aktuelle (merged) værdier
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

  // Elevråd
  const er = (SNIPPETS.elevraad && SNIPPETS.elevraad.YES) ? SNIPPETS.elevraad.YES : { text_m: '', text_k: '' };
  $('elevraadText').value = (er.text_m || er.text_k || '');

  // Roller (gym)
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
        <button class="btn danger" type="button" data-remove-role="${escapeHtml(key)}">Slet</button>
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
  // opdater visninger
  if (state.tab === 'edit') renderEdit();
  renderMarksTable();
}

function renderKList() {
    const s = getSettings();
    const studs = getStudents();
    // Resolve teacher input via alias-map (MM -> Måns ...) for both filtering and UI.
    const meRaw = ((s.me || '') + '').trim();
    const allMode = isAllTeacherRaw(meRaw);
    const meResolvedRaw = resolveTeacherName(meRaw) || meRaw;
    const showAllStudents = !!state.showAllStudents;
    // In ALL-mode we show every student that has at least one contact-teacher.
    const minePreview = showAllStudents
      ? sortedStudents(studs)
      : (meResolvedRaw
          ? studs.filter(st => {
              const k1 = resolveTeacherName((st.Kontaktlaerer1 || '') + '');
              const k2 = resolveTeacherName((st.Kontaktlaerer2 || '') + '');
              return (k1 && k1 === meResolvedRaw) || (k2 && k2 === meResolvedRaw);
            })
          : []);
          const has = arr.includes(roleKey);
          if (el.checked && !has) arr.push(roleKey);
          if (!el.checked && has) arr.splice(arr.indexOf(roleKey), 1);
          marks[u].gym_roles = arr;
        } else {
          // Variant (single)
          const field = (type === 'gym') ? 'gym_variant' : (type === 'elevraad' ? 'elevraad_variant' : 'sang_variant');
          if (el.checked) marks[u][field] = k;
          else if (marks[u][field] === k) marks[u][field] = '';
        }

        setMarks(type, marks);
        renderMarksTable();
      });
    }

    // Eksportér CSV
    const btnExport = document.getElementById('btnExportMarksCSV');
    if (btnExport && !btnExport.__wired) {
      btnExport.__wired = true;
      btnExport.addEventListener('click', () => {
        const type = (state.marksType || 'sang');
        const studs = getStudents() || [];
        if (!studs.length) { alert('Upload elevliste først.'); return; }
        const marks = getMarks(type) || {};

        const baseCols = ['UniLogin','Navn','Klasse'];
        let extraCols = [];
        if (type === 'sang') extraCols = Object.keys(SNIPPETS.sang || {});
        else if (type === 'elevraad') extraCols = Object.keys(SNIPPETS.elevraad || {});
        else if (type === 'gym') extraCols = [...Object.keys(SNIPPETS.gym || {}), ...Object.keys(SNIPPETS.roller || {}).map(r => `role:${r}`)];

        const header = [...baseCols, ...extraCols];

        const rows = studs.map(s => {
          const u = s.unilogin || '';
          const m = marks[u] || {};
          const out = {};
          out['UniLogin'] = u;
          out['Navn'] = s.navn || s.fulde_navn || '';
          out['Klasse'] = s.klasse || '';

          if (type === 'sang') {
            const v = m.sang_variant || '';
            for (const c of Object.keys(SNIPPETS.sang || {})) out[c] = (v === c) ? '1' : '';
          } else if (type === 'elevraad') {
            const v = m.elevraad_variant || '';
            for (const c of Object.keys(SNIPPETS.elevraad || {})) out[c] = (v === c) ? '1' : '';
          } else if (type === 'gym') {
            const v = m.gym_variant || '';
            for (const c of Object.keys(SNIPPETS.gym || {})) out[c] = (v === c) ? '1' : '';
            const roles = Array.isArray(m.gym_roles) ? m.gym_roles : [];
            for (const r of Object.keys(SNIPPETS.roller || {})) out[`role:${r}`] = roles.includes(r) ? '1' : '';
          }

          return header.map(h => out[h] ?? '');
        });

        const esc = (x) => {
          const s = String(x ?? '');
          return /[",\n;]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s;
        };
        const csv = [header.join(';'), ...rows.map(r => r.map(esc).join(';'))].join('\n');

        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        const a = document.createElement('a');
        const date = new Date();
        const stamp = `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
        a.download = `${type}_marks_${stamp}.csv`;
        a.href = URL.createObjectURL(blob);
        document.body.appendChild(a);
        a.click();
        setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
      });
    }

}

  async function init() {
    wireEvents();

    // Print scaling (single-student print)
    if (!window.__printScaleWired) {
      window.__printScaleWired = true;
      window.addEventListener('beforeprint', () => { try { applyOnePagePrintScale(); } catch(_) {} });
      window.addEventListener('afterprint', () => {
        try { document.documentElement.style.setProperty('--printScale', '1'); } catch(_) {}
      });
    }

    await loadRemoteOverrides();
    if (!localStorage.getItem(KEYS.settings)) setSettings(defaultSettings());
    if (!localStorage.getItem(KEYS.templates)) setTemplates(defaultTemplates());
    applySnippetOverrides();

    const s = getSettings();
    if (s.me && !s.meResolved) {
      s.meResolved = resolveTeacherName(s.me);
      setSettings(s);
    }
    // Top: Hjælp-knap
    const topHelpBtn = $("tab-help-top");
    if (topHelpBtn) topHelpBtn.addEventListener("click", () => {
      setTab("set");
      setSettingsSubtab("help");
      renderAll();
      syncKToggleAndPrintLabels();
    });

    // Logo/brand: hvis setup ikke er gjort endnu, hop til Data & import
    const brandHome = $("brandHome");
    if (brandHome) brandHome.addEventListener("click", () => {
      // Always go to Data & import (tooltip must match behavior)
      setTab("set");
      setSettingsSubtab("data");
      renderAll();
    });

    // K-elever: Print alle
    const btnPrintAllK = $("btnPrintAllK");
    if (btnPrintAllK) btnPrintAllK.addEventListener("click", printAllKStudents);

    // K-elever: Toggle visning (kun mine K-elever <-> alle elever)
    const btnToggleShowAll = $("btnToggleShowAll");
    if (btnToggleShowAll) btnToggleShowAll.addEventListener("click", () => {
      state.showAllStudents = !state.showAllStudents;
      saveUIStateFrom(state);
      renderAll();
    });

    // Hjælp-links (hop til relevante faner)
    document.body.addEventListener("click", (ev) => {
      const a = ev.target.closest && ev.target.closest(".helpLink");
      if (!a) return;
      ev.preventDefault();
      const goto = String(a.getAttribute("data-goto") || "");
      if (!goto) return;
      if (goto === "k") { setTab("k"); renderAll(); return; }
      if (goto === "edit") { setTab("edit"); renderAll(); return; }
      if (goto.startsWith("set:")) {
        const sub = goto.split(":")[1] || "general";
        setTab("set");
        setSettingsSubtab(sub);
        renderAll();
        return;
      }
    });

    // Backup
    const btnBackupDownload = $("btnBackupDownload");
    if (btnBackupDownload) btnBackupDownload.addEventListener("click", exportLocalBackup);
    const backupFileInput = $("backupFileInput");
    if (backupFileInput) backupFileInput.addEventListener("change", (e) => {
      const f = e.target.files && e.target.files[0];
      importLocalBackup(f);
      e.target.value = "";
    });

    // Start: hvis elever eller initialer mangler, start i Data & import
    const hasStudents = getStudents().length > 0;
    const hasMe = String(getSettings().me || "").trim().length > 0;
    if (!hasStudents || !hasMe) {
      setTab("set");
      setSettingsSubtab("data");
    } else {
      setTab("k");
    }
    renderAll();
}

  init();
})();