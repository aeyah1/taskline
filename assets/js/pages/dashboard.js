// dashboard.js — rich, multi-panel overview of the user's tasks
// Depends on router.js, auth.js, tasks.js, pages/shell.js, icons.js, ui.js, validation.js (loaded before this file in HTML)

const user = guard();
if (user) {
  // Paint skeleton frame first so the page never looks empty.
  showSkeleton();
  // Give the browser a tick so the skeleton actually paints before we replace it.
  requestAnimationFrame(() => setTimeout(render, 280));
}

function showSkeleton() {
  const root = renderShell({ active: 'dashboard', title: 'Dashboard', subtitle: 'Overview of your tasks' });
  root.innerHTML = `
    <div class="skeleton-card" style="margin-bottom: var(--s-5);">
      <div class="skeleton skeleton-line lg" style="width: 30%;"></div>
      <div class="skeleton skeleton-line xl" style="width: 60%;"></div>
      <div class="skeleton skeleton-line" style="width: 45%;"></div>
    </div>
    <div class="grid grid-stats">
      <div class="skeleton-stat">
        <div class="skeleton skeleton-line" style="width:50%;"></div>
        <div class="skeleton skeleton-line xl" style="width:40%;"></div>
        <div class="skeleton skeleton-line" style="width:60%;"></div>
      </div>
      <div class="skeleton-stat">
        <div class="skeleton skeleton-line" style="width:50%;"></div>
        <div class="skeleton skeleton-line xl" style="width:40%;"></div>
        <div class="skeleton skeleton-line" style="width:60%;"></div>
      </div>
      <div class="skeleton-stat">
        <div class="skeleton skeleton-line" style="width:50%;"></div>
        <div class="skeleton skeleton-line xl" style="width:40%;"></div>
        <div class="skeleton skeleton-line" style="width:60%;"></div>
      </div>
      <div class="skeleton-stat">
        <div class="skeleton skeleton-line" style="width:50%;"></div>
        <div class="skeleton skeleton-line xl" style="width:40%;"></div>
        <div class="skeleton skeleton-line" style="width:60%;"></div>
      </div>
    </div>
    <div class="grid grid-2" style="margin-top: var(--s-5);">
      <div class="skeleton-card">
        <div class="skeleton skeleton-line lg" style="width:40%;"></div>
        <div class="skeleton skeleton-line"   style="width:90%;"></div>
        <div class="skeleton skeleton-line"   style="width:80%;"></div>
        <div class="skeleton skeleton-line"   style="width:70%;"></div>
      </div>
      <div class="skeleton-card">
        <div class="skeleton skeleton-line lg" style="width:50%;"></div>
        <div class="skeleton skeleton-block"></div>
      </div>
    </div>
  `;
}

function render() {
  const root = renderShell({ active: 'dashboard', title: 'Dashboard', subtitle: 'Overview of your tasks' });
  const s = Tasks.stats();
  const pri = Tasks.priorityBreakdown();
  const today = Tasks.dueToday();
  const week = Tasks.dueThisWeek();
  const recent = Tasks.list().slice(0, 5);
  const sparks = Tasks.completedByDay(7);

  const greeting = timeOfDayGreeting();
  const firstName = (user.name || 'there').split(' ')[0];

  root.innerHTML = `
    <div class="stagger">
    <section class="hero-card" aria-label="Welcome">
      <div class="hero-left">
        <div class="hero-eyebrow">${escapeHTML(greeting.eyebrow)}</div>
        <h1>${escapeHTML(greeting.label)}, ${escapeHTML(firstName)}.</h1>
        <p class="hero-line">${escapeHTML(heroLine(s, today.length))}</p>
      </div>
      <form class="hero-quick" id="quickAddForm" aria-label="Quick add task">
        <span data-icon="plus" style="color:rgba(255,255,255,0.85); display:inline-flex; width:16px; height:16px;"></span>
        <input id="quickAddInput" type="text" maxlength="120" placeholder="Add a task and press Enter" aria-label="New task title">
        <button type="submit">Add</button>
      </form>
    </section>

    <section class="grid grid-stats" aria-label="Statistics">
      ${statCard('Total tasks',     s.total,                'layers',     'All-time',     'accent')}
      ${statCard('In progress',     s.pending,              'inbox',      'Still to do',  s.pending > 0 ? 'info' : 'accent')}
      ${statCard('Completed',       s.done,                 'checkCircle','Nice work',    s.done > 0 ? 'success' : 'accent')}
      ${statCard('Completion rate', s.completionRate + '%', 'trendingUp', s.overdue ? `${s.overdue} overdue` : 'On track', s.overdue ? 'danger' : (s.completionRate >= 70 ? 'success' : 'warning'))}
    </section>

    <div class="grid grid-2" style="margin-top: var(--s-5);">
      <section class="panel">
        <header class="panel-header">
          <h3>Today's focus</h3>
          <span class="chip ${today.length ? 'info' : ''}">${today.length} due today</span>
        </header>
        <div>
          ${today.length === 0 ? smallEmpty('Nothing due today', 'Enjoy your day — or get ahead on the week.') : today.map(dueRow).join('')}
        </div>
      </section>

      <section class="panel">
        <header class="panel-header">
          <h3>Priority breakdown</h3>
        </header>
        <div class="panel-body">
          ${priorityChart(pri)}
        </div>
      </section>
    </div>

    <div class="grid grid-2" style="margin-top: var(--s-5);">
      <section class="panel">
        <header class="panel-header">
          <h3>This week</h3>
          <span class="chip">${week.length} due in 7 days</span>
        </header>
        <div>
          ${week.length === 0 ? smallEmpty('Clear week ahead', 'No tasks due over the next 7 days.') : week.slice(0, 6).map(dueRow).join('')}
        </div>
      </section>

      <section class="panel">
        <header class="panel-header">
          <h3>Completed this week</h3>
          <span class="chip ${weekTotal(sparks) ? 'success' : ''}">${weekTotal(sparks)} done</span>
        </header>
        <div class="panel-body">
          ${sparkline(sparks)}
        </div>
      </section>
    </div>

    <section class="panel" style="margin-top: var(--s-5);">
      <header class="panel-header">
        <h3>Recent tasks</h3>
        <a href="tasks.html" class="btn btn-ghost btn-sm">View all</a>
      </header>
      <div class="task-list">
        ${recent.length === 0 ? emptyState() : recent.map(renderRow).join('')}
      </div>
    </section>

    <section class="panel" style="margin-top: var(--s-5);">
      <header class="panel-header">
        <h3>Tips & shortcuts</h3>
      </header>
      <div class="panel-body">
        <div class="shortcut-list">
          <div class="shortcut-row"><span class="lbl">Open quick-add on this page</span><span>Type a title above + <kbd>Enter</kbd></span></div>
          <div class="shortcut-row"><span class="lbl">New task (Tasks page)</span><kbd>N</kbd></div>
          <div class="shortcut-row"><span class="lbl">Close a dialog</span><kbd>Esc</kbd></div>
          <div class="shortcut-row"><span class="lbl">Export / import your data</span><span>Profile → Your data</span></div>
        </div>
      </div>
    </section>
    </div>
  `;

  mountIcons(root);
  wireQuickAdd();
}

function wireQuickAdd() {
  const form = document.getElementById('quickAddForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const input = document.getElementById('quickAddInput');
    const title = (input.value || '').trim();
    if (!title) {
      toast('Type a title first.', 'warning');
      input.focus();
      return;
    }
    if (title.length > 120) {
      toast('Title must be 120 characters or fewer.', 'error');
      return;
    }
    try {
      Tasks.create({ title, priority: 'medium' });
      toast('Task added.', 'success');
      input.value = '';
      render(); // re-render dashboard so widgets reflect the new task
    } catch (err) {
      toast(err.message, 'error');
    }
  });
}

function timeOfDayGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return { eyebrow: 'Burning the midnight oil',  label: 'Good evening' };
  if (h < 12) return { eyebrow: 'A fresh start',             label: 'Good morning' };
  if (h < 17) return { eyebrow: 'Midday momentum',           label: 'Good afternoon' };
  if (h < 21) return { eyebrow: 'Winding down',              label: 'Good evening' };
  return        { eyebrow: 'Late shift',                     label: 'Good evening' };
}

function heroLine(s, todayCount) {
  if (s.total === 0)       return 'Add your first task using the box on the right — small wins compound.';
  if (todayCount > 0)      return `You have ${todayCount} task${todayCount === 1 ? '' : 's'} due today. Let's keep moving.`;
  if (s.overdue > 0)       return `${s.overdue} task${s.overdue === 1 ? ' is' : 's are'} overdue — handle those first.`;
  if (s.pending === 0 && s.done > 0) return 'Inbox zero. Cherish it for a moment.';
  return `${s.pending} task${s.pending === 1 ? '' : 's'} on deck. Pick one and start.`;
}

function statCard(label, value, icon, meta, variant = 'accent') {
  return `
    <article class="stat ${variant}">
      <div class="row between">
        <span class="stat-label">${label}</span>
        <span class="stat-icon" data-icon="${icon}"></span>
      </div>
      <span class="stat-value">${value}</span>
      <span class="stat-meta">${meta}</span>
    </article>`;
}

function dueRow(t) {
  const overdue = !t.done && t.dueDate && new Date(t.dueDate) < startOfToday();
  const isToday = !t.done && t.dueDate && sameDay(new Date(t.dueDate), new Date());
  const cls = overdue ? 'overdue' : (isToday ? 'today' : t.priority);
  const pill = overdue ? '<span class="due-pill">Overdue</span>' : (isToday ? '<span class="due-pill">Today</span>' : '');
  return `
    <div class="due-row ${cls}">
      <span class="due-mark"></span>
      <div class="due-body">
        <div class="due-title">${escapeHTML(t.title)}</div>
        <div class="due-meta">${t.dueDate ? 'Due ' + formatDate(t.dueDate) : 'No due date'} · ${cap(t.priority)} priority</div>
      </div>
      ${pill}
    </div>`;
}

function priorityChart(pri) {
  const total = Math.max(1, pri.high + pri.medium + pri.low);
  const row = (level, count) => `
    <div class="bar-row ${level}">
      <span class="bar-label"><span class="dot"></span>${cap(level)}</span>
      <span class="bar-track"><span class="bar-fill" style="width: ${(count / total * 100).toFixed(1)}%;"></span></span>
      <span class="bar-count">${count}</span>
    </div>`;
  if (pri.high + pri.medium + pri.low === 0) {
    return `<div class="muted" style="font-size:var(--fs-sm);">No tasks yet. Add one to see the breakdown.</div>`;
  }
  return `
    <div class="bar-chart">
      ${row('high',   pri.high)}
      ${row('medium', pri.medium)}
      ${row('low',    pri.low)}
    </div>`;
}

function sparkline(buckets) {
  const max = Math.max(1, ...buckets.map(b => b.count));
  const bars = buckets.map(b => {
    const pct = (b.count / max) * 100;
    const label = b.date.toLocaleDateString(undefined, { weekday: 'short' });
    const cls = b.count > 0 ? 'has-value' : '';
    return `
      <div class="spark-bar ${cls}" style="height: ${Math.max(8, pct)}%;" title="${label}: ${b.count}">
        <span class="spark-tip">${label}: ${b.count}</span>
      </div>`;
  }).join('');
  const axis = buckets.map(b => `<span>${b.date.toLocaleDateString(undefined, { weekday: 'narrow' })}</span>`).join('');
  return `
    <div class="spark" role="img" aria-label="Completed tasks over the last 7 days">${bars}</div>
    <div class="spark-axis">${axis}</div>`;
}

function weekTotal(buckets) {
  return buckets.reduce((s, b) => s + b.count, 0);
}

function smallEmpty(title, sub) {
  return `
    <div style="padding: var(--s-5) var(--s-6); color: var(--text-muted); font-size: var(--fs-sm);">
      <div style="font-weight: var(--fw-medium); color: var(--text); margin-bottom: 2px;">${escapeHTML(title)}</div>
      <div>${escapeHTML(sub)}</div>
    </div>`;
}

function renderRow(t) {
  const chipCls = t.done ? 'success' : (t.priority === 'high' ? 'danger' : t.priority === 'medium' ? 'warning' : '');
  const chipLabel = t.done ? 'Done' : (t.priority[0].toUpperCase() + t.priority.slice(1));
  return `
    <div class="task-item ${t.done ? 'done' : ''}">
      <span class="chip ${chipCls}"><span class="chip-dot"></span>${chipLabel}</span>
      <div>
        <div class="task-title">${escapeHTML(t.title)}</div>
        <div class="task-meta">
          ${t.dueDate ? `Due ${formatDate(t.dueDate)}` : 'No due date'} · Added ${formatDate(t.createdAt)}
        </div>
      </div>
      <span></span><span></span>
    </div>`;
}

function emptyState() {
  return `
    <div class="empty">
      <div class="icon-wrap" data-icon="inbox"></div>
      <h3>No tasks yet</h3>
      <p>Create your first task to see it here.</p>
      <a href="tasks.html" class="btn btn-primary"><span data-icon="plus"></span>Add a task</a>
    </div>`;
}

function startOfToday() { const d = new Date(); d.setHours(0,0,0,0); return d; }
function sameDay(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }
function cap(s) { return s ? s[0].toUpperCase() + s.slice(1) : s; }
