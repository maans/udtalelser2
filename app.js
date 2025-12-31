/* Elevudtalelser v20 (rebuild)
   - Toggle-visning: K-elever vs alle elever
   - Ingen "Alle-bruger" valg: visning bestemmes kun af toggle
   - GitHub Pages-venlig: ingen server, localStorage
*/
(function(){
  const LS = {
    initials: "eu.initials",
    students: "eu.students.v1",
    edits: "eu.edits.v1",
    defaults: "eu.defaults.v1",
    showAll: "eu.showAll.v1"
  };

  /*** DOM ***/
  const tabs = Array.from(document.querySelectorAll(".tab"));
  const panels = Array.from(document.querySelectorAll("[data-panel]"));
  const statusEl = document.getElementById("status");

  const initialsEl = document.getElementById("initials");
  const fileCsvEl = document.getElementById("fileCsv");
  const btnLoadSample = document.getElementById("btnLoadSample");
  const btnClearAll = document.getElementById("btnClearAll");

  const btnToggleAll = document.getElementById("btnToggleAll");
  const kCountEl = document.getElementById("kCount");
  const searchK = document.getElementById("searchK");
  const kHint = document.getElementById("kHint");
  const kList = document.getElementById("kList");

  const editEmpty = document.getElementById("editEmpty");
  const editForm = document.getElementById("editForm");
  const studentName = document.getElementById("studentName");
  const studentClass = document.getElementById("studentClass");
  const studentK = document.getElementById("studentK");
  const editedBy = document.getElementById("editedBy");
  const savedAt = document.getElementById("savedAt");
  const selectedMeta = document.getElementById("selectedMeta");
  const tmplA = document.getElementById("tmplA");
  const note = document.getElementById("note");
  const btnBackToK = document.getElementById("btnBackToK");

  const defaultTemplate = document.getElementById("defaultTemplate");
  const btnSaveDefaults = document.getElementById("btnSaveDefaults");
  const btnResetDefaults = document.getElementById("btnResetDefaults");
  const btnExport = document.getElementById("btnExport");
  const fileImportJson = document.getElementById("fileImportJson");

  const btnPrint = document.getElementById("btnPrint");
  const btnHelp = document.getElementById("btnHelp");
  const helpPanel = document.getElementById("helpPanel");
  const btnCloseHelp = document.getElementById("btnCloseHelp");

  /*** State ***/
  let students = [];  // {id, navn, klasse, k_initialer}
  let edits = {};     // id -> { text, note, editedBy, savedAt }
  let selectedId = null;

  function nowIso(){
    return new Date().toISOString();
  }
  function fmt(ts){
    if(!ts) return "";
    try{
      const d = new Date(ts);
      return d.toLocaleString("da-DK");
    }catch{ return ts; }
  }

  function loadLS(){
    initialsEl.value = (localStorage.getItem(LS.initials) || "").trim();
    const s = localStorage.getItem(LS.students);
    students = s ? JSON.parse(s) : [];
    const e = localStorage.getItem(LS.edits);
    edits = e ? JSON.parse(e) : {};
    const d = localStorage.getItem(LS.defaults);
    const defaults = d ? JSON.parse(d) : { defaultTemplate: "Kære forældre\n\n{{FORNAVN}} har i perioden…\n\nVenlig hilsen\n{{LÆRERINITIALER}}" };
    defaultTemplate.value = defaults.defaultTemplate || "";
    const showAll = localStorage.getItem(LS.showAll);
    const flag = showAll === "1";
    setShowAll(flag, false);
    updateStatus();
  }

  function saveStudents(){
    localStorage.setItem(LS.students, JSON.stringify(students));
    updateStatus();
  }
  function saveEdits(){
    localStorage.setItem(LS.edits, JSON.stringify(edits));
  }

  function initials(){
    return (initialsEl.value || "").trim().toUpperCase();
  }

  function setShowAll(flag, persist=true){
    if(persist) localStorage.setItem(LS.showAll, flag ? "1" : "0");
    btnToggleAll.textContent = flag ? "Vis kun K-elever" : "Vis alle elever";
    kHint.textContent = flag ? "Du ser ALLE elever" : "Du ser kun dine K-elever";
    renderKList();
  }
  function getShowAll(){
    return localStorage.getItem(LS.showAll) === "1";
  }

  /*** Tabs ***/
  function openTab(key){
    tabs.forEach(t => t.classList.toggle("active", t.dataset.tab === key));
    panels.forEach(p => p.classList.toggle("hidden", p.dataset.panel !== key));
  }
  tabs.forEach(t => t.addEventListener("click", () => openTab(t.dataset.tab)));

  /*** CSV parsing ***/
  function parseCSV(text){
    // very small CSV parser with quotes
    const rows = [];
    let i=0, field="", row=[], inQuotes=false;
    while(i < text.length){
      const c = text[i];
      if(inQuotes){
        if(c === '"'){
          if(text[i+1] === '"'){ field += '"'; i+=2; continue; }
          inQuotes = false; i++; continue;
        }
        field += c; i++; continue;
      }else{
        if(c === '"'){ inQuotes = true; i++; continue; }
        if(c === ","){ row.push(field); field=""; i++; continue; }
        if(c === "\n"){
          row.push(field); field="";
          if(row.length === 1 && row[0] === "" ){ row=[]; i++; continue; }
          rows.push(row); row=[]; i++; continue;
        }
        if(c === "\r"){ i++; continue; }
        field += c; i++; continue;
      }
    }
    row.push(field);
    if(row.some(x => x !== "")) rows.push(row);

    if(rows.length === 0) return [];
    const header = rows[0].map(h => (h||"").trim().toLowerCase());
    const idx = (name) => header.indexOf(name);

    const idI = idx("id");
    const navnI = idx("navn");
    const klasseI = idx("klasse");
    const kI = idx("k_initialer");

    if(idI < 0 || navnI < 0 || klasseI < 0){
      throw new Error("CSV mangler kolonnerne: id, navn, klasse (og valgfrit k_initialer).");
    }

    const out = [];
    for(let r=1; r<rows.length; r++){
      const cols = rows[r];
      const obj = {
        id: (cols[idI]||"").trim(),
        navn: (cols[navnI]||"").trim(),
        klasse: (cols[klasseI]||"").trim(),
        k_initialer: kI >= 0 ? (cols[kI]||"").trim().toUpperCase() : ""
      };
      if(!obj.id) obj.id = String(r);
      if(obj.navn) out.push(obj);
    }
    return out;
  }

  function firstName(full){
    const s = (full||"").trim();
    if(!s) return "";
    // split on whitespace; keep first token; handle "Lastname, Firstname"
    if(s.includes(",")){
      const parts = s.split(",");
      const right = (parts[1]||"").trim();
      if(right) return right.split(/\s+/)[0];
    }
    return s.split(/\s+/)[0];
  }

  function applyTemplate(tpl, student){
    const fn = firstName(student.navn);
    return (tpl||"")
      .replaceAll("{{FORNAVN}}", fn)
      .replaceAll("{{ELEV}}", student.navn || fn)
      .replaceAll("{{KLASSE}}", student.klasse || "")
      .replaceAll("{{LÆRERINITIALER}}", initials());
  }

  /*** Rendering ***/
  function ownedByMe(stu){
    const me = initials();
    if(!me) return false;
    return (stu.k_initialer || "").toUpperCase() === me;
  }

  function currentList(){
    const showAll = getShowAll();
    const me = initials();
    const query = (searchK.value||"").trim().toLowerCase();

    let list = students.slice();

    if(!showAll){
      // only K-elever: match k_initialer to me
      list = list.filter(s => (s.k_initialer||"").toUpperCase() === me && me);
    }

    if(query){
      list = list.filter(s =>
        (s.navn||"").toLowerCase().includes(query) ||
        (s.klasse||"").toLowerCase().includes(query)
      );
    }

    // sort by class then name
    list.sort((a,b) => (a.klasse||"").localeCompare(b.klasse||"") || (a.navn||"").localeCompare(b.navn||""));
    return list;
  }

  function renderKList(){
    const list = currentList();
    kList.innerHTML = "";

    const showAll = getShowAll();
    const me = initials();
    const totalK = students.filter(s => (s.k_initialer||"").toUpperCase() === me && me).length;
    const totalAll = students.length;
    kCountEl.textContent = showAll ? String(totalAll) : String(totalK);

    if(!students.length){
      kList.innerHTML = '<div class="empty">Ingen elever indlæst endnu. Gå til <b>Data & import</b>.</div>';
      return;
    }
    if(!me){
      kList.innerHTML = '<div class="empty">Skriv dine <b>initialer</b> i Data & import for at se dine K-elever.</div>';
      return;
    }
    if(!list.length){
      kList.innerHTML = '<div class="empty">Ingen elever i denne visning (tjek initialer / søgning / toggle).</div>';
      return;
    }

    list.forEach(stu => {
      const ed = edits[stu.id];
      const item = document.createElement("div");
      item.className = "item";
      item.tabIndex = 0;
      item.setAttribute("role","button");
      item.innerHTML = `
        <div class="left">
          <div class="name">${escapeHtml(stu.navn)}</div>
          <div class="meta">${escapeHtml(stu.klasse)} • ID: ${escapeHtml(stu.id)}</div>
        </div>
        <div class="right">
          <span class="pill k" title="K-initialer fra CSV">${escapeHtml(stu.k_initialer || "—")}</span>
          ${ed?.editedBy ? `<span class="pill ed" title="Redigeret af">${escapeHtml(ed.editedBy)}</span>` : ``}
        </div>
      `;
      item.addEventListener("click", () => selectStudent(stu.id));
      item.addEventListener("keydown", (ev) => {
        if(ev.key === "Enter" || ev.key === " "){ ev.preventDefault(); selectStudent(stu.id); }
      });
      kList.appendChild(item);
    });
  }

  function selectStudent(id){
    selectedId = id;
    const stu = students.find(s => s.id === id);
    if(!stu) return;

    openTab("edit");
    editEmpty.classList.add("hidden");
    editForm.classList.remove("hidden");

    studentName.textContent = stu.navn || "";
    studentClass.textContent = stu.klasse || "";
    studentK.textContent = stu.k_initialer || "";
    selectedMeta.textContent = `Redigerer: ${stu.navn} (${stu.klasse})`;

    const ed = edits[id] || null;
    const defaults = getDefaults();

    if(ed){
      tmplA.value = ed.text || "";
      note.value = ed.note || "";
      editedBy.textContent = ed.editedBy || "";
      savedAt.textContent = fmt(ed.savedAt);
    }else{
      const seeded = applyTemplate(defaults.defaultTemplate, stu);
      tmplA.value = seeded;
      note.value = "";
      editedBy.textContent = initials() || "";
      savedAt.textContent = "";
      // do not auto-create edit until user changes something
    }
  }

  function getDefaults(){
    const d = localStorage.getItem(LS.defaults);
    return d ? JSON.parse(d) : { defaultTemplate: "" };
  }

  function upsertEdit(){
    if(!selectedId) return;
    const me = initials();
    if(!me) return;

    const stu = students.find(s => s.id === selectedId);
    if(!stu) return;

    const ts = nowIso();
    edits[selectedId] = {
      text: tmplA.value || "",
      note: note.value || "",
      editedBy: me,
      savedAt: ts
    };
    saveEdits();
    editedBy.textContent = me;
    savedAt.textContent = fmt(ts);
    renderKList();
  }

  /*** Status ***/
  function updateStatus(){
    const me = initials();
    const total = students.length;
    const mine = students.filter(s => (s.k_initialer||"").toUpperCase() === me && me).length;
    statusEl.textContent = total
      ? `Indlæst: ${total} elever. Dine K-elever: ${mine}.`
      : "Ingen data indlæst endnu.";
  }

  /*** Helpers ***/
  function escapeHtml(s){
    return String(s ?? "")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }

  /*** Events ***/
  initialsEl.addEventListener("input", () => {
    localStorage.setItem(LS.initials, initials());
    updateStatus();
    renderKList();
  });

  fileCsvEl.addEventListener("change", async () => {
    const f = fileCsvEl.files && fileCsvEl.files[0];
    if(!f) return;
    try{
      const text = await f.text();
      students = parseCSV(text);
      saveStudents();
      renderKList();
      openTab("k");
    }catch(err){
      alert(err.message || String(err));
    }finally{
      fileCsvEl.value = "";
    }
  });

  btnLoadSample.addEventListener("click", async () => {
    try{
      const res = await fetch("students.csv", { cache:"no-store" });
      if(!res.ok) throw new Error("Kunne ikke hente students.csv (tjek at filen ligger ved siden af index.html).");
      const text = await res.text();
      students = parseCSV(text);
      saveStudents();
      renderKList();
      openTab("k");
    }catch(err){
      alert(err.message || String(err));
    }
  });

  btnClearAll.addEventListener("click", () => {
    if(!confirm("Ryd alle lokale data (initialer, elever, ændringer, standarder)?")) return;
    Object.values(LS).forEach(k => localStorage.removeItem(k));
    students = [];
    edits = {};
    selectedId = null;
    initialsEl.value = "";
    defaultTemplate.value = "Kære forældre\n\n{{FORNAVN}} har i perioden…\n\nVenlig hilsen\n{{LÆRERINITIALER}}";
    setShowAll(false, true);
    updateStatus();
    renderKList();
    openTab("data");
  });

  btnToggleAll.addEventListener("click", () => {
    const flag = !getShowAll();
    setShowAll(flag, true);
  });

  searchK.addEventListener("input", () => renderKList());

  btnBackToK.addEventListener("click", () => openTab("k"));

  // autosave edits
  let saveTimer = null;
  function scheduleSave(){
    if(saveTimer) clearTimeout(saveTimer);
    saveTimer = setTimeout(() => {
      upsertEdit();
    }, 350);
  }
  tmplA.addEventListener("input", scheduleSave);
  note.addEventListener("input", scheduleSave);

  btnSaveDefaults.addEventListener("click", () => {
    const d = { defaultTemplate: defaultTemplate.value || "" };
    localStorage.setItem(LS.defaults, JSON.stringify(d));
    alert("Standard gemt.");
  });
  btnResetDefaults.addEventListener("click", () => {
    defaultTemplate.value = "Kære forældre\n\n{{FORNAVN}} har i perioden…\n\nVenlig hilsen\n{{LÆRERINITIALER}}";
  });

  btnExport.addEventListener("click", () => {
    const payload = {
      version: "v20-rebuild",
      exportedAt: nowIso(),
      initials: initials(),
      edits
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type:"application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `elevudtalelser_backup_${(initials()||"XX")}_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });

  fileImportJson.addEventListener("change", async () => {
    const f = fileImportJson.files && fileImportJson.files[0];
    if(!f) return;
    try{
      const text = await f.text();
      const obj = JSON.parse(text);
      if(!obj || typeof obj !== "object") throw new Error("Ugyldig JSON.");
      if(!obj.edits || typeof obj.edits !== "object") throw new Error("JSON mangler 'edits'.");
      edits = obj.edits;
      saveEdits();
      renderKList();
      alert("Import OK.");
    }catch(err){
      alert(err.message || String(err));
    }finally{
      fileImportJson.value = "";
    }
  });

  btnPrint.addEventListener("click", () => {
    // Print uses the current list; we create a temporary print-only view.
    const list = currentList();
    const showAll = getShowAll();

    const printWin = window.open("", "_blank");
    if(!printWin){ alert("Popup blokeret — tillad popups for at printe."); return; }

    const me = initials();
    const title = showAll ? "Print alle elever" : "Print alle K-elever";
    const rows = list.map(stu => {
      const ed = edits[stu.id];
      const txt = (ed?.text || applyTemplate(getDefaults().defaultTemplate, stu) || "").trim();
      return `
        <div class="p-card">
          <div class="p-head">
            <div class="p-name">${escapeHtml(stu.navn)}</div>
            <div class="p-meta">${escapeHtml(stu.klasse)} • K: ${escapeHtml(stu.k_initialer || "—")} • Redigeret: ${escapeHtml(ed?.editedBy || "")}</div>
          </div>
          <pre class="p-text">${escapeHtml(txt)}</pre>
        </div>
      `;
    }).join("");

    printWin.document.open();
    printWin.document.write(`
      <!doctype html>
      <html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
      <title>${escapeHtml(title)}</title>
      <style>
        body{ font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; margin:20px; }
        h1{ font-size:18px; margin:0 0 10px; }
        .meta{ color:#444; font-size:12px; margin:0 0 14px; }
        .p-card{ border:1px solid #ddd; border-radius:12px; padding:12px; margin:0 0 12px; }
        .p-head{ display:flex; align-items:baseline; justify-content:space-between; gap:12px; }
        .p-name{ font-weight:700; }
        .p-meta{ color:#555; font-size:12px; text-align:right; }
        .p-text{ white-space:pre-wrap; margin:10px 0 0; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace; font-size:12px; }
      </style></head>
      <body>
        <h1>${escapeHtml(title)}</h1>
        <div class="meta">Initialer: ${escapeHtml(me)} • Antal: ${list.length} • Udskrevet: ${escapeHtml(new Date().toLocaleString("da-DK"))}</div>
        ${rows || "<div>Ingen elever i denne visning.</div>"}
        <script>window.print();</script>
      </body></html>
    `);
    printWin.document.close();
  });

  btnHelp.addEventListener("click", () => helpPanel.classList.remove("hidden"));
  btnCloseHelp.addEventListener("click", () => helpPanel.classList.add("hidden"));
  helpPanel.addEventListener("click", (ev) => {
    if(ev.target === helpPanel) helpPanel.classList.add("hidden");
  });

  /*** Boot ***/
  loadLS();

  // Start i Data & import hvis ingen elever / ingen initialer
  if(students.length === 0 || !initials()){
    openTab("data");
  }else{
    openTab("k");
  }
  renderKList();
})();
