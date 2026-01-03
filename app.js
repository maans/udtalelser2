function updateTeacherDatalist() {
  const input = document.getElementById('meInput');
  const menu  = document.getElementById('teacherPickerMenu');
  const btn   = document.getElementById('teacherPickerBtn');
  const wrap  = document.getElementById('teacherPicker');
  const clear = document.getElementById('meInputClear');
  if (!input || !menu || !btn || !wrap) return;

  // SIKRING: Tilføj kun event-listeners én gang (vigtigt for at Enter virker korrekt)
  if (input.__pickerWired) {
    const studs = getStudents();
    input.disabled = !studs.length;
    btn.disabled = !studs.length;
    return;
  }
  input.__pickerWired = true;

  let activeIndex = 0;
  let items = [];

  // Funktion til at hente og filtrere listen af initialer
  function getFilteredItems() {
    const studs = getStudents();
    const set = new Set();
    for (const st of studs) {
      const a = (st.kontaktlaerer1_ini || '').toString().trim().toUpperCase();
      const b = (st.kontaktlaerer2_ini || '').toString().trim().toUpperCase();
      if (a) set.add(a);
      if (b) set.add(b);
    }
    items = Array.from(set).sort((x, y) => x.localeCompare(y, 'da'));
    const q = (input.value || '').toString().trim().toUpperCase();
    return !q ? items : items.filter(x => x.includes(q));
  }

  // Opdaterer hvilken linje der er markeret i dropdown
  function setActive(idx) {
    const opts = Array.from(menu.querySelectorAll('[role="option"]'));
    if (!opts.length) return;
    activeIndex = Math.max(0, Math.min(idx, opts.length - 1));
    opts.forEach((el, i) => el.classList.toggle('active', i === activeIndex));
    const el = opts[activeIndex];
    if (el) el.scrollIntoView({ block: 'nearest' });
  }

  // Tegner selve dropdown-menuen
  function renderMenu() {
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
      // Brug mousedown så vi fanger klikket før inputfeltet mister fokus (blur)
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

  // Gemmer det valgte navn og skifter fane
  function commit(code) {
    const ini = (code || '').toString().trim().toUpperCase();
    const s2 = getSettings();
    s2.me = ini;
    setSettings(s2);
    input.value = ini;
    renderStatus();
    if (clear) clear.hidden = !ini;
    // Skift til K-elever fanen
    try { 
      state.viewMode = 'K'; 
      setTab('k'); 
    } catch (err) {
      console.warn("Kunne ikke skifte fane automatisk", err);
    }
  }

  // Event handlers (sættes kun én gang pga. __pickerWired)
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
      const s2 = getSettings(); s2.me = ''; setSettings(s2);
      input.value = '';
      clear.hidden = true;
      closeMenu();
      renderStatus();
    };
  }

  // NAVIGATION MED TASTATUR (Her løses dit problem med Enter)
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
