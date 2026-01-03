
/* === FIX: Keyboard navigation for K-lærer dropdown (single active index) === */

let teacherActiveIndex = -1;

function initTeacherDropdown({
  inputEl,
  listEl,
  itemsSelector,
  onCommit
}) {
  const getItems = () => Array.from(listEl.querySelectorAll(itemsSelector));

  function renderActive() {
    const items = getItems();
    items.forEach((el, i) => {
      el.classList.toggle('active', i === teacherActiveIndex);
      el.setAttribute('aria-selected', i === teacherActiveIndex ? 'true' : 'false');
    });
  }

  function clampIndex(idx) {
    const items = getItems();
    if (!items.length) return -1;
    return Math.max(0, Math.min(idx, items.length - 1));
  }

  inputEl.addEventListener('keydown', (e) => {
    const items = getItems();
    if (!items.length) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      teacherActiveIndex = clampIndex(teacherActiveIndex + 1);
      renderActive();
      items[teacherActiveIndex]?.scrollIntoView({ block: 'nearest' });
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      teacherActiveIndex = clampIndex(teacherActiveIndex - 1);
      renderActive();
      items[teacherActiveIndex]?.scrollIntoView({ block: 'nearest' });
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (teacherActiveIndex >= 0) {
        const value = items[teacherActiveIndex].textContent.trim();
        onCommit(value);
      }
    }

    if (e.key === 'Escape') {
      teacherActiveIndex = -1;
      renderActive();
      listEl.style.display = 'none';
    }
  });

  listEl.addEventListener('click', (e) => {
    const item = e.target.closest(itemsSelector);
    if (!item) return;
    teacherActiveIndex = getItems().indexOf(item);
    renderActive();
    onCommit(item.textContent.trim());
  });
}

/* === Example init (adjust selectors to your DOM) ===
initTeacherDropdown({
  inputEl: document.querySelector('#teacherInput'),
  listEl: document.querySelector('#teacherList'),
  itemsSelector: '.teacher-item',
  onCommit: (value) => {
    document.querySelector('#teacherInput').value = value;
    // save state + navigate to K-elever
  }
});
*/
