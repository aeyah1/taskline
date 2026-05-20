// tasks-page.js — full CRUD UI with search + filter
// Depends on router.js, tasks.js, pages/shell.js, icons.js, ui.js, validation.js (loaded before this file in HTML)

const state = {
  keyword: '',
  status:  'all',     // all | pending | done
  priority: 'all',    // all | low | medium | high
  sort:    'smart',   // smart | newest | oldest | due | priority
};

const u = guard();
if (u) init();

function init() {
  const root = renderShell({ active: 'tasks', title: 'Tasks', subtitle: 'Create, organize, and complete' });

  root.innerHTML = `
    <div class="page-header">
      <div>
        <h1>Your tasks</h1>
        <div class="page-sub">Stay focused on what matters next.</div>
      </div>
      <button id="newTaskBtn" class="btn btn-primary"><span data-icon="plus"></span>New task</button>
    </div>

    <div class="filter-bar">
      <div class="input-wrap">
        <span class="icon-left" data-icon="search"></span>
        <input id="searchInput" class="input" type="search" placeholder="Search tasks by title or description" aria-label="Search">
      </div>
      <div class="segmented" role="tablist" aria-label="Status filter">
        <button data-status="all" class="active">All</button>
        <button data-status="pending">Pending</button>
        <button data-status="done">Done</button>
      </div>
      <select id="priorityFilter" class="select" aria-label="Priority filter" style="width:auto; min-width:160px;">
        <option value="all">All priorities</option>
        <option value="high">High priority</option>
        <option value="medium">Medium priority</option>
        <option value="low">Low priority</option>
      </select>
      <select id="sortFilter" class="select" aria-label="Sort tasks" style="width:auto; min-width:170px;">
        <option value="smart">Sort: Smart</option>
        <option value="newest">Sort: Newest first</option>
        <option value="oldest">Sort: Oldest first</option>
        <option value="due">Sort: Due date</option>
        <option value="priority">Sort: Priority</option>
      </select>
    </div>

    <div class="tasks-layout">
      <section class="panel tasks-main">
        <header class="panel-header">
          <h3 id="tasksHeader">All tasks</h3>
          <span id="taskCount" class="chip"></span>
        </header>
        <div id="taskList" class="task-list" role="list"></div>
      </section>

      <aside class="tasks-side">
        <section class="panel">
          <header class="panel-header"><h3>Snapshot</h3></header>
          <div class="panel-body snapshot-grid" id="snapshotGrid"></div>
        </section>

        <section class="panel">
          <header class="panel-header"><h3>Priority breakdown</h3></header>
          <div class="panel-body" id="prioritySide"></div>
        </section>

        <section class="panel">
          <header class="panel-header"><h3>Due today</h3></header>
          <div id="dueTodaySide"></div>
        </section>

        <section class="panel">
          <header class="panel-header"><h3>Recently completed</h3></header>
          <div id="recentDoneSide"></div>
        </section>

        <section class="panel">
          <header class="panel-header"><h3>Quick tips</h3></header>
          <div class="panel-body shortcut-list">
            <div class="shortcut-row"><span class="lbl">New task</span><kbd>N</kbd></div>
            <div class="shortcut-row"><span class="lbl">Close dialog</span><kbd>Esc</kbd></div>
            <div class="shortcut-row"><span class="lbl">Search</span><span>Type in the field above</span></div>
          </div>
        </section>
      </aside>
    </div>
  `;

  mountIcons(root);

  document.getElementById('newTaskBtn').addEventListener('click', () => openTaskModal());
  document.getElementById('searchInput').addEventListener('input', (e) => {
    state.keyword = e.target.value;
    renderList();
  });
  document.querySelectorAll('.segmented [data-status]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.segmented [data-status]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.status = btn.dataset.status;
      renderList();
    });
  });
  document.getElementById('priorityFilter').addEventListener('change', (e) => {
    state.priority = e.target.value;
    renderList();
  });
  document.getElementById('sortFilter').addEventListener('change', (e) => {
    state.sort = e.target.value;
    renderList();
  });

  // Keyboard shortcut: "N" opens the new-task modal (ignored while typing in a field).
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'n' && e.key !== 'N') return;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
    if (document.querySelector('.modal-backdrop.open')) return;
    e.preventDefault();
    openTaskModal();
  });

  renderList();
}

function renderList() {
  const list = Tasks.query(state);
  const container = document.getElementById('taskList');

  renderSidePanels();

  // Header chip + section title
  const headerEl = document.getElementById('tasksHeader');
  const countEl  = document.getElementById('taskCount');
  if (headerEl) headerEl.textContent = headerForStatus(state.status);
  if (countEl)  countEl.textContent  = `${list.length} ${list.length === 1 ? 'task' : 'tasks'}`;

  if (list.length === 0) {
    container.innerHTML = `
      <div class="empty">
        <div class="icon-wrap" data-icon="inbox"></div>
        <h3>${Tasks.list().length === 0 ? 'No tasks yet' : 'No tasks match your filters'}</h3>
        <p>${Tasks.list().length === 0 ? 'Add your first task to get started.' : 'Try clearing the search or changing filters.'}</p>
      </div>`;
    mountIcons(container);
    return;
  }

  container.innerHTML = list.map(rowHTML).join('');
  mountIcons(container);

  container.querySelectorAll('[data-toggle]').forEach(el => {
    el.addEventListener('change', () => {
      Tasks.toggleDone(el.dataset.toggle);
      renderList();
    });
  });
  container.querySelectorAll('[data-edit]').forEach(el => {
    el.addEventListener('click', () => {
      const t = Tasks.list().find(x => x.id === el.dataset.edit);
      if (t) openTaskModal(t);
    });
  });
  container.querySelectorAll('[data-delete]').forEach(el => {
    el.addEventListener('click', async () => {
      const t = Tasks.list().find(x => x.id === el.dataset.delete);
      if (!t) return;
      const ok = await confirmDialog({
        title: 'Delete task?',
        message: `"${t.title}" will be permanently removed. This action cannot be undone.`,
        confirmLabel: 'Delete',
        danger: true,
      });
      if (ok) {
        Tasks.remove(t.id);
        toast('Task deleted.', 'success');
        renderList();
      }
    });
  });
}

function rowHTML(t) {
  const pri = t.priority;
  const priClass = pri === 'high' ? 'danger' : pri === 'medium' ? 'warning' : '';
  const overdue = !t.done && t.dueDate && new Date(t.dueDate) < startOfToday();

  return `
    <div class="task-item ${t.done ? 'done' : ''}" role="listitem">
      <input type="checkbox" class="check" ${t.done ? 'checked' : ''} data-toggle="${t.id}" aria-label="Mark complete">
      <div>
        <div class="task-title">${escapeHTML(t.title)}</div>
        <div class="task-meta">
          <span class="chip ${priClass}"><span class="chip-dot"></span>${cap(pri)}</span>
          ${t.dueDate ? `<span class="${overdue ? 'chip danger' : ''}">${overdue ? 'Overdue · ' : 'Due '}${formatDate(t.dueDate)}</span>` : '<span>No due date</span>'}
          ${t.description ? `<span title="${escapeHTML(t.description)}">${escapeHTML(t.description.slice(0, 50))}${t.description.length > 50 ? '…' : ''}</span>` : ''}
        </div>
      </div>
      <span></span>
      <div class="task-actions">
        <button class="btn btn-ghost btn-icon" data-edit="${t.id}" aria-label="Edit" title="Edit">${Icon.edit}</button>
        <button class="btn btn-ghost btn-icon" data-delete="${t.id}" aria-label="Delete" title="Delete">${Icon.trash}</button>
      </div>
    </div>`;
}

function openTaskModal(existing = null) {
  const isEdit = !!existing;
  const modal = createModal({
    title: isEdit ? 'Edit task' : 'New task',
    bodyHTML: `
      <form id="taskForm" novalidate>
        <div class="field">
          <label for="t_title">Title</label>
          <input id="t_title" class="input" name="title" type="text" maxlength="120" value="${existing ? escapeHTML(existing.title) : ''}" placeholder="e.g. Finalize project reflection" required>
          <div class="err" data-err="title"></div>
        </div>
        <div class="field" style="margin-top:var(--s-3);">
          <label for="t_desc">Description <span class="muted">(optional)</span></label>
          <textarea id="t_desc" class="textarea" name="description" maxlength="500" placeholder="Add any details that help you remember the context">${existing ? escapeHTML(existing.description) : ''}</textarea>
        </div>
        <div class="row" style="margin-top:var(--s-3); gap:var(--s-3);">
          <div class="field" style="flex:1;">
            <label for="t_pri">Priority</label>
            <select id="t_pri" name="priority" class="select">
              <option value="low"    ${existing?.priority === 'low' ? 'selected' : ''}>Low</option>
              <option value="medium" ${!existing || existing.priority === 'medium' ? 'selected' : ''}>Medium</option>
              <option value="high"   ${existing?.priority === 'high' ? 'selected' : ''}>High</option>
            </select>
          </div>
          <div class="field" style="flex:1;">
            <label for="t_due">Due date <span class="muted">(optional)</span></label>
            <input id="t_due" type="date" name="dueDate" class="input" value="${existing?.dueDate || ''}">
          </div>
        </div>
      </form>
    `,
    footerHTML: `
      <button class="btn btn-secondary" data-action="cancel">Cancel</button>
      <button class="btn btn-primary"   data-action="save">${isEdit ? 'Save changes' : 'Create task'}</button>
    `,
  });

  const form = modal.root.querySelector('#taskForm');
  modal.root.querySelector('[data-action="cancel"]').addEventListener('click', () => modal.close());
  modal.root.querySelector('[data-action="save"]').addEventListener('click', () => submit());
  form.addEventListener('submit', (e) => { e.preventDefault(); submit(); });

  function submit() {
    clearErrors(form);
    const data = new FormData(form);
    const title = data.get('title')?.toString().trim();
    const description = data.get('description')?.toString();
    const priority = data.get('priority')?.toString();
    const dueDate = data.get('dueDate')?.toString();

    const errors = {
      title: Validate.run([Validate.required(title, 'Title'), Validate.maxLength(title, 120, 'Title')]),
    };
    showErrors(form, errors);
    if (errors.title) return;

    try {
      if (isEdit) {
        Tasks.update(existing.id, { title, description, priority, dueDate });
        toast('Task updated.', 'success');
      } else {
        Tasks.create({ title, description, priority, dueDate });
        toast('Task created.', 'success');
      }
      modal.close();
      renderList();
    } catch (err) {
      toast(err.message, 'error');
    }
  }

  modal.open();
  setTimeout(() => modal.root.querySelector('#t_title')?.focus(), 50);
}

function cap(s) { return s ? s[0].toUpperCase() + s.slice(1) : s; }
function startOfToday() { const d = new Date(); d.setHours(0,0,0,0); return d; }
function headerForStatus(s) {
  if (s === 'pending') return 'Pending tasks';
  if (s === 'done')    return 'Completed tasks';
  return 'All tasks';
}

// ─── Side panel renderers ─────────────────────────────────────
function renderSidePanels() {
  const stats   = Tasks.stats();
  const pri     = Tasks.priorityBreakdown();
  const today   = Tasks.dueToday();
  const allDone = Tasks.list().filter(t => t.done).slice(0, 4);

  // Snapshot mini-grid
  const snapshot = document.getElementById('snapshotGrid');
  if (snapshot) {
    snapshot.innerHTML = `
      ${miniStat('Total',     stats.total,           'accent')}
      ${miniStat('Pending',   stats.pending,         stats.pending > 0 ? 'info' : 'muted')}
      ${miniStat('Completed', stats.done,            stats.done > 0 ? 'success' : 'muted')}
      ${miniStat('Overdue',   stats.overdue,         stats.overdue > 0 ? 'danger' : 'muted')}
    `;
  }

  // Priority bars
  const prioritySide = document.getElementById('prioritySide');
  if (prioritySide) prioritySide.innerHTML = priorityChartSide(pri);

  // Due today list
  const dueSide = document.getElementById('dueTodaySide');
  if (dueSide) {
    dueSide.innerHTML = today.length === 0
      ? smallEmptySide('Nothing due today', 'Get ahead on the week.')
      : today.slice(0, 4).map(t => dueRowSide(t)).join('');
  }

  // Recently completed
  const doneSide = document.getElementById('recentDoneSide');
  if (doneSide) {
    doneSide.innerHTML = allDone.length === 0
      ? smallEmptySide('No completed tasks yet', 'Mark one done to see it here.')
      : allDone.map(t => doneRowSide(t)).join('');
  }
}

function miniStat(label, value, variant) {
  return `
    <div class="mini-stat ${variant}">
      <div class="mini-stat-value">${value}</div>
      <div class="mini-stat-label">${label}</div>
    </div>`;
}

function priorityChartSide(pri) {
  const total = Math.max(1, pri.high + pri.medium + pri.low);
  if (pri.high + pri.medium + pri.low === 0) {
    return `<div class="muted" style="font-size:var(--fs-sm);">No tasks yet.</div>`;
  }
  const row = (level, count) => `
    <div class="bar-row ${level}">
      <span class="bar-label"><span class="dot"></span>${cap(level)}</span>
      <span class="bar-track"><span class="bar-fill" style="width: ${(count / total * 100).toFixed(1)}%;"></span></span>
      <span class="bar-count">${count}</span>
    </div>`;
  return `
    <div class="bar-chart">
      ${row('high',   pri.high)}
      ${row('medium', pri.medium)}
      ${row('low',    pri.low)}
    </div>`;
}

function dueRowSide(t) {
  const overdue = !t.done && t.dueDate && new Date(t.dueDate) < startOfToday();
  const cls = overdue ? 'overdue' : t.priority;
  return `
    <div class="due-row ${cls}">
      <span class="due-mark"></span>
      <div class="due-body">
        <div class="due-title">${escapeHTML(t.title)}</div>
        <div class="due-meta">${cap(t.priority)} · ${overdue ? 'Overdue' : 'Today'}</div>
      </div>
    </div>`;
}

function doneRowSide(t) {
  return `
    <div class="due-row low">
      <span class="due-mark" style="background: var(--success);"></span>
      <div class="due-body">
        <div class="due-title" style="text-decoration: line-through; color: var(--text-muted);">${escapeHTML(t.title)}</div>
        <div class="due-meta">Completed ${formatDate(t.updatedAt)}</div>
      </div>
    </div>`;
}

function smallEmptySide(title, sub) {
  return `
    <div style="padding: var(--s-4) var(--s-5); color: var(--text-muted); font-size: var(--fs-sm);">
      <div style="font-weight: var(--fw-medium); color: var(--text); margin-bottom: 2px;">${escapeHTML(title)}</div>
      <div>${escapeHTML(sub)}</div>
    </div>`;
}
