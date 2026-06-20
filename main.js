let exercises = [];
let workoutLog = JSON.parse(localStorage.getItem('workoutLog')) || {};

function todayKey() {
  return new Date().toISOString().split('T')[0]; // e.g. "2026-06-20"
}

function getWeekLabel(dateKey) {
  const date = new Date(dateKey + 'T00:00:00');
  const day = date.getDay(); // 0 = Sunday
  const diffToMonday = day === 0 ? 6 : day - 1;

  const monday = new Date(date);
  monday.setDate(date.getDate() - diffToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = function (d) {
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return 'Week of ' + fmt(monday) + ' – ' + fmt(sunday);
}

function addExercise() {
  const input = document.getElementById('exerciseInput');
  if (!input) return;

  const name = input.value.trim();
  if (name === '') return;

  exercises.push({ name: name, sets: [{ reps: '', weight: '' }] });
  input.value = '';
  input.focus();
  render();
}

function removeExercise(index) {
  exercises.splice(index, 1);
  render();
}

function renameExercise(index, newName) {
  const trimmed = newName.trim();
  if (trimmed === '') return;
  exercises[index].name = trimmed;
}

function addSet(exIndex) {
  exercises[exIndex].sets.push({ reps: '', weight: '' });
  render();
}

function removeSet(exIndex, setIndex) {
  exercises[exIndex].sets.splice(setIndex, 1);
  render();
}

function updateSet(exIndex, setIndex, field, value) {
  exercises[exIndex].sets[setIndex][field] = value;
}

function saveToday() {
  if (exercises.length === 0) {
    const msg = document.getElementById('saveMessage');
    if (msg) {
      msg.style.color = '#e3a5a5';
      msg.textContent = 'Add an exercise before saving.';
      setTimeout(function () { msg.textContent = ''; }, 2500);
    }
    return;
  }

  workoutLog[todayKey()] = exercises;
  localStorage.setItem('workoutLog', JSON.stringify(workoutLog));
  renderHistory();

  const msg = document.getElementById('saveMessage');
  if (msg) {
    msg.style.color = '#6fcf6f';
    msg.textContent = 'Saved!';
    setTimeout(function () { msg.textContent = ''; }, 2000);
  }
}

function clearHistory() {
  if (Object.keys(workoutLog).length === 0) return;

  const confirmed = confirm('Delete all saved workout history? This can\'t be undone.');
  if (!confirmed) return;

  workoutLog = {};
  localStorage.removeItem('workoutLog');
  renderHistory();

  const detail = document.getElementById('historyDetail');
  if (detail) detail.innerHTML = '';
}

function showDay(dateKey) {
  const detail = document.getElementById('historyDetail');
  if (!detail) return;

  const dayExercises = workoutLog[dateKey] || [];

  let html = '<h3>' + dateKey + '</h3>';

  if (dayExercises.length === 0) {
    html += '<p>No exercises logged.</p>';
  }

  dayExercises.forEach(function (ex) {
    html += '<div class="exercise"><strong>' + ex.name + '</strong>';
    ex.sets.forEach(function (set, i) {
      const reps = set.reps === '' ? '—' : set.reps;
      const weight = set.weight === '' ? '—' : set.weight;
      html += '<div class="set">Set ' + (i + 1) + ': ' + reps + ' reps, ' + weight + ' kg</div>';
    });
    html += '</div>';
  });

  detail.innerHTML = html;
}

function render() {
  const list = document.getElementById('exerciseList');
  const empty = document.getElementById('exerciseEmpty');
  if (!list) return;

  list.innerHTML = '';

  if (empty) {
    empty.style.display = exercises.length === 0 ? 'block' : 'none';
  }

  exercises.forEach(function (ex, exIndex) {
    const div = document.createElement('div');
    div.className = 'exercise';

    let html = '<div class="exercise-header">';
    html += '<input class="exercise-name-input" value="' + ex.name + '" onchange="renameExercise(' + exIndex + ',this.value)">';
    html += '<button onclick="removeExercise(' + exIndex + ')">Remove</button>';
    html += '</div>';

    ex.sets.forEach(function (set, setIndex) {
      html += '<div class="set">';
      html += '<span class="set-label">Set ' + (setIndex + 1) + '</span>';
      html += '<input type="number" min="0" placeholder="reps" value="' + set.reps + '" onchange="updateSet(' + exIndex + ',' + setIndex + ',\'reps\',this.value)">';
      html += '<input type="number" min="0" placeholder="kg" value="' + set.weight + '" onchange="updateSet(' + exIndex + ',' + setIndex + ',\'weight\',this.value)">';
      html += '<button onclick="removeSet(' + exIndex + ',' + setIndex + ')">X</button>';
      html += '</div>';
    });

    html += '<button class="add-set-btn" onclick="addSet(' + exIndex + ')">+ Add Set</button>';

    div.innerHTML = html;
    list.appendChild(div);
  });
}

function renderHistory() {
  const historyDiv = document.getElementById('historyList');
  if (!historyDiv) return;
  historyDiv.innerHTML = '';

  const dates = Object.keys(workoutLog).sort().reverse(); // most recent first

  if (dates.length === 0) {
    historyDiv.innerHTML = '<p class="empty-state" style="display:block;">No saved workouts yet.</p>';
    return;
  }

  const today = todayKey();
  let currentWeekLabel = null;

  dates.forEach(function (dateKey) {
    const weekLabel = getWeekLabel(dateKey);

    if (weekLabel !== currentWeekLabel) {
      currentWeekLabel = weekLabel;
      const header = document.createElement('div');
      header.className = 'week-header';
      header.textContent = weekLabel;
      historyDiv.appendChild(header);
    }

    const day = document.createElement('div');
    day.className = 'history-day' + (dateKey === today ? ' today' : '');
    const exerciseCount = workoutLog[dateKey].length;

    let html = '<strong>' + dateKey + '</strong>';
    html += '<span class="badge">' + exerciseCount + (exerciseCount === 1 ? ' exercise' : ' exercises') + '</span>';
    day.innerHTML = html;

    day.addEventListener('click', function () {
      showDay(dateKey);
    });

    historyDiv.appendChild(day);
  });
}

render();
renderHistory();
