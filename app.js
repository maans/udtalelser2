/* =========================================================
   Udtalelser – app.js
   Fokus: K-lærer dropdown m. keyboard navigation
   ========================================================= */

document.addEventListener('DOMContentLoaded', init);

/* ---------- STATE ---------- */

let allTeachers = [];
let filteredTeachers = [];
let activeIndex = -1;
let dropdownOpen = false;

/* ---------- INIT ---------- */

function init() {
  const teacherInput = document.getElementById('teacherInput');
  const teacherDropdown = document.getElementById('teacherDropdown');

  if (!teacherInput || !teacherDropdown) {
    console.warn('K-lærer input eller dropdown ikke fundet i DOM');
    return;
  }

  // demo / init-data – erstattes normalt af CSV
  allTeachers = [
    'CB','DS','FW','GX','HD','JL','KB','LR','MU','NP','OY','QK','SP','TA'
  ];

  /* ---------- INPUT ---------- */

  teacherInput.addEventListener('input', () => {
    const q = teacherInput.value.trim().toLowerCase();

    filteredTeachers = allTeachers.filter(t =>
      t.toLowerCase().includes(q)
    );

    if (filteredTeachers.length) {
      openDropdown();
    } else {
      closeDropdown();
    }
  });

  /* ---------- KEYBOARD ---------- */

  teacherInput.addEventListener('keydown', (e) => {
    if (!dropdownOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeIndex = Math.min(activeIndex + 1, filteredTeachers.length - 1);
      renderDropdown();
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeIndex = Math.max(activeIndex - 1, 0);
      renderDropdown();
    }

    if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredTeachers[activeIndex]) {
        selectTeacher(filteredTeachers[activeIndex]);
      }
    }

    if (e.key === 'Escape') {
      closeDropdown();
    }
  });

  /* ---------- CLICK OUTSIDE ---------- */

  document.addEventListener('click', (e) => {
    if (!teacherInput.contains(e.target) &&
        !teacherDropdown.contains(e.target)) {
      closeDropdown();
    }
  });

  /* ---------- HELPERS ---------- */

  function openDropdown() {
    dropdownOpen = true;
    activeIndex = 0;
    renderDropdown();
  }

  function closeDropdown() {
    dropdownOpen = false;
    teacherDropdown.innerHTML = '';
    activeIndex = -1;
  }

  function renderDropdown() {
    teacherDropdown.innerHTML = '';

    filteredTeachers.forEach((t, i) => {
      const div = document.createElement('div');
      div.className = 'teacher-option';
      div.textContent = t;

      if (i === activeIndex) {
        div.classList.add('active');
      }

      // vigtig: mousedown – ikke click
      div.addEventListener('mousedown', (e) => {
        e.preventDefault();
        selectTeacher(t);
      });

      teacherDropdown.appendChild(div);
    });
  }

  function selectTeacher(value) {
    teacherInput.value = value;
    closeDropdown();
    onTeacherSelected(value);
  }
}

/* ---------- CALLBACK ---------- */

function onTeacherSelected(value) {
  console.log('Valgt K-lærer:', value);
  // her kalder din app typisk:
  // – filtrering af K-elever
  // – navigation til K-elever fanen
}
