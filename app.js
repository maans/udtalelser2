
/* =========================================================
   app.js – Stable keyboard navigation for K-lærer dropdown
   ========================================================= */

/* ---- STATE ---- */
let teacherActiveIndex = -1;

/* ---- INIT ---- */
document.addEventListener('DOMContentLoaded', () => {
  const inputEl = document.querySelector('#teacherInput');
  const listEl  = document.querySelector('#teacherList');

  if (!inputEl || !listEl) return;

  initTeacherDropdown({
    inputEl,
    listEl,
    itemsSelector: '.teacher-item',
    onCommit: (value) => {
      inputEl.value = value;
      listEl.style.display = 'none';
      teacherActiveIndex = -1;

      // save + navigate (hook into existing app)
      if (window.state) {
        state.activeTeacher = value;
        if (typeof saveState === 'function') saveState();
      }
      if (typeof goToTab === 'function') goToTab('K-elever');
    }
  });
});

/* ---- DROPDOWN LOGIC ---- */
function initTeacherDropdown({ inputEl, listEl, itemsSelector, onCommit }) {
  const getItems = () =>
    Array.from(listEl.querySelectorAll(itemsSelector));

  function clamp(idx, max) {
    return Math.max(0, Math.min(idx, max));
  }

  function render() {
    const items = getItems();
    items.forEach((el, i) => {
      el.classList.toggle('active', i === teacherActiveIndex);
      el.setAttribute('aria-selected', i === teacherActiveIndex);
    });
  }

  inputEl.addEventListener('keydown', (e) => {
    const items = getItems();
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      teacherActiveIndex =
        teacherActiveIndex < 0 ? 0 :
        clamp(teacherActiveIndex + 1, items.length - 1);
      render();
      items[teacherActiveIndex].scrollIntoView({ block: 'nearest' });
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      teacherActiveIndex =
        teacherActiveIndex < 0 ? items.length - 1 :
        clamp(teacherActiveIndex - 1, items.length - 1);
      render();
      items[teacherActiveIndex].scrollIntoView({ block: 'nearest' });
    }

    if (e.key === 'Enter' && teacherActiveIndex >= 0) {
      e.preventDefault();
      onCommit(items[teacherActiveIndex].textContent.trim());
    }

    if (e.key === 'Escape') {
      teacherActiveIndex = -1;
      listEl.style.display = 'none';
      render();
    }
  });

  listEl.addEventListener('click', (e) => {
    const item = e.target.closest(itemsSelector);
    if (!item) return;
    teacherActiveIndex = getItems().indexOf(item);
    render();
    onCommit(item.textContent.trim());
  });
}

/* -------- Startfane-logik -------- */
function decideStartTab() {
  let students = [];
  try {
    students = JSON.parse(localStorage.getItem('students')) || [];
  } catch (e) {
    students = [];
  }

  if (!Array.isArray(students) || students.length === 0) {
    activateTab('hjælp');
  } else {
    activateTab('k-elever');
  }
}


decideStartTab();
