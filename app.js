function resolveFullName(row) {
  const full = row.fullName || row.fuldtNavn || row.navn || row.kontaktlaerer || row.kontaktlaererNavn;
  if (full && String(full).trim()) return String(full).trim();
  const fn = row.fornavn || row.firstName || "";
  const en = row.efternavn || row.lastName || "";
  return `${fn} ${en}`.trim();
}

/* Udtalelser v1.0.2 – Himmerlands Ungdomsskole (Picker-fix integreret) */
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

  const DEFAULT_SCHOOL_TEXT = `På Himmerlands Ungdomsskole arbejder vi med både faglighed, fællesskab og personlig udvikling.
Udtalelsen er skrevet med udgangspunkt i elevens hverdag og deltagelse gennem skoleåret.`;

  const DEFAULT_TEMPLATE = "Udtalelse vedrørende {{ELEV_FULDE_NAVN}}\\n\\n{{ELEV_FORNAVN}} {{ELEV_EFTERNAVN}} har været elev på Himmerlands Ungdomsskole i perioden fra {{PERIODE_FRA}} til {{PERIODE_TIL}} i {{ELEV_KLASSE}}.\\n\\nHimmerlands Ungdomsskole er en traditionsrig efterskole, som prioriterer fællesskabet og faglig fordybelse højt. Elevernes hverdag er præget af frie rammer og mange muligheder. Vi møder eleverne med tillid, positive forventninger og faglige udfordringer. I løbet af et efterskoleår på Himmerlands Ungdomsskole er oplevelserne mange og udfordringerne ligeså. Det gælder i hverdagens almindelige undervisning, som fordeler sig over boglige fag, fællesfag og profilfag. Det gælder også alle de dage, hvor hverdagen ændres til fordel for temauger, studieture mm. \\n\\n{{ELEV_UDVIKLING_AFSNIT}}\n\n{{ELEVRAAD_AFSNIT}}\n\n{{ROLLE_AFSNIT}}\n\\n\\nSom en del af et efterskoleår på Himmerlands Ungdomsskole deltager eleverne ugentligt i fællessang og fællesgymnastik. Begge fag udgør en del af efterskolelivet, hvor eleverne oplever nye sider af sig selv, flytter grænser og oplever, at deres bidrag til fællesskabet har betydning. I løbet af året optræder eleverne med fælleskor og gymnastikopvisninger.\\n\\n{{SANG_GYM_AFSNIT}}\\n\\nPå en efterskole er der mange praktiske opgaver.\\n\\n{{PRAKTISK_AFSNIT}}\\n\\n{{ELEV_FORNAVN}} har på Himmerlands Ungdomsskole været en del af en kontaktgruppe på {{KONTAKTGRUPPE_ANTAL}} elever. I kontaktgruppen kender vi {{HAM_HENDE}} som {{KONTAKTGRUPPE_BESKRIVELSE}}.\\n\\nVi have været rigtig glade for at have {{ELEV_FORNAVN}} som elev på skolen og ønsker {{HAM_HENDE}} held og lykke fremover.\\n\\n{{KONTAKTLÆRER_1_NAVN}} & {{KONTAKTLÆRER_2_NAVN}}\\n\\nKontaktlærere\\n\\n{{FORSTANDER_NAVN}}\\n\\nForstander";

  // ---------- storage ----------
  function lsGet(key, fallback) {
    try {
      const v = localStorage.getItem(key);
      if (v === null || v === undefined) return fallback;
      return JSON.parse(v);
    } catch { return fallback; }
  }
  function lsSet(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  function $(id){ return document.getElementById(id); }

  // ---------- IDENTITET / K-LÆRER DROPDOWN FIX ----------
  function updateTeacherDatalist() {
    const input = $('meInput');
    const menu  = $('teacherPickerMenu');
    const btn   = $('teacherPickerBtn');
    const wrap  = $('teacherPicker');
    const clear = $('meInputClear');
    if (!input || !menu || !btn || !wrap) return;

    const studs = getStudents();
    if (!studs.length) {
      input.value = '';
      input.disabled = true;
      if (btn) btn.disabled = true;
      if (clear) clear.hidden = true;
      menu.innerHTML = `<div class="pickerEmpty">Indlæs elevliste først (students.csv).</div>`;
      wrap.classList.remove('open');
      return;
    }

    // SIKRER AT LISTENERS KUN TILFØJES ÉN GANG
    if (input.__wired) {
      input.disabled = false;
      if (btn) btn.disabled = false;
      return;
    }
    input.__wired = true;

    input.disabled = false;
    if (btn) btn.disabled = false;

    let activeIndex = 0;
    let items = [];

    function getFilteredItems() {
      const set = new Set();
      const currentStuds = getStudents();
      for (const st of currentStuds) {
        const a = (st.kontaktlaerer1_ini || '').toString().trim().toUpperCase();
        const b = (st.kontaktlaerer2_ini || '').toString().trim().toUpperCase();
        if (a) set.add(a);
        if (b) set.add(b);
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
      if (!filtered.length) {
        menu.innerHTML = `<div class="pickerEmpty">Ingen match</div>`;
        return;
      }
      filtered.forEach((code, i) => {
        const row = document.createElement('div');
        row.className = 'tpRow';
        row.setAttribute('role', 'option');
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
      menu.hidden = false;
      wrap.classList.add('open');
      renderMenu();
    }

    function closeMenu() {
      wrap.classList.remove('open');
      menu.hidden = true;
    }

    function commit(code) {
      const ini = (code || '').toString().trim().toUpperCase();
      const s2 = getSettings();
      s2.me = ini;
      setSettings(s2);
      input.value = ini;
      if (typeof renderStatus === 'function') renderStatus();
      if (clear) clear.hidden = !ini;
      try { 
        if (state) state.viewMode = 'K'; 
        if (typeof setTab === 'function') setTab('k'); 
      } catch (_) {}
    }

    if (btn) btn.onclick = (e) => { e.preventDefault(); wrap.classList.contains('open') ? closeMenu() : openMenu(); input.focus(); };
    input.onfocus = () => openMenu();
    input.oninput = () => { if (!wrap.classList.contains('open')) openMenu(); else renderMenu(); };

    if (clear) {
      clear.onclick = (e) => {
        e.preventDefault();
        const s2 = getSettings(); s2.me = ''; setSettings(s2);
        input.value = '';
        clear.hidden = true;
        closeMenu();
        if (typeof renderStatus === 'function') renderStatus();
      };
      clear.hidden = !(getSettings().me || '').trim();
    }

    input.addEventListener('keydown', (e) => {
      const filtered = getFilteredItems();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (!wrap.classList.contains('open')) openMenu();
        setActive(activeIndex + 1);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActive(activeIndex - 1);
      } else if (e.key === 'Enter') {
        if (wrap.classList.contains('open') && filtered[activeIndex]) {
          e.preventDefault();
          commit(filtered[activeIndex]);
          closeMenu();
        }
      } else if (e.key === 'Escape') {
        closeMenu();
      }
    });

    document.addEventListener('click', (e) => {
      if (!wrap.contains(e.target)) closeMenu();
    });
  }

  // --- RESTE AF APP FUNKTIONER ---
  function getSettings(){ return Object.assign({ me: '', schoolYearEnd: 2026 }, lsGet(KEYS.settings, {})); }
  function setSettings(s){ lsSet(KEYS.settings, s); }
  function getStudents(){ return lsGet(KEYS.students, []); }
  function setStudents(s){ lsSet(KEYS.students, s); }
  function getTextFor(u){ return lsGet(KEYS.textPrefix + u, { elevudvikling:'', praktisk:'', kgruppe:'' }); }
  function setTextFor(u, o){ lsSet(KEYS.textPrefix + u, o); }

  function setTab(tab) {
    state.tab = tab;
    document.querySelectorAll('.view').forEach(v => v.classList.toggle('active', v.id === 'view-' + tab));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.id === 'tab-' + tab));
    renderAll();
  }

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
    if (state.tab === 'edit') renderEdit();
  }

  function renderKList() {
    const s = getSettings();
    const studs = getStudents();
    const list = $('kList');
    if (!list) return;
    const mine = studs.filter(st => (st.kontaktlaerer1_ini === s.me || st.kontaktlaerer2_ini === s.me));
    list.innerHTML = mine.map(st => `
      <div class="card clickable" data-unilogin="${st.unilogin}">
        <b>${st.fornavn} ${st.efternavn}</b><br><small>${st.klasse}</small>
      </div>
    `).join('');

    list.querySelectorAll('.card').forEach(card => {
      card.onclick = () => {
        state.selectedUnilogin = card.dataset.unilogin;
        setTab('edit');
      };
    });
  }

  function renderEdit() {
    const studs = getStudents();
    const st = studs.find(x => x.unilogin === state.selectedUnilogin);
    if (!st) return;
    const txt = getTextFor(st.unilogin);
    if ($('txtElevudv')) $('txtElevudv').value = txt.elevudvikling || '';
    if ($('preview')) $('preview').textContent = "Udtalelse for " + st.fornavn;
  }

  function wireEvents() {
    const on = (id, ev, fn) => { const el = $(id); if (el) el.addEventListener(ev, fn); };
    on('tab-k', 'click', () => setTab('k'));
    on('tab-set', 'click', () => setTab('set'));
    on('studentsFile', 'change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const text = await file.text();
      const lines = text.split('\n').filter(l => l.trim());
      const students = lines.slice(1).map(line => {
        const v = line.split(/[;,]/);
        return { fornavn: v[0], efternavn: v[1], unilogin: v[2], klasse: v[4], kontaktlaerer1_ini: v[7], kontaktlaerer2_ini: v[8] };
      });
      setStudents(students);
      renderAll();
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
