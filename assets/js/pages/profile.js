// profile.js — profile + password + danger zone
// Depends on router.js, auth.js, tasks.js, storage.js, pages/shell.js, icons.js, validation.js, ui.js (loaded before this file in HTML)

const user = guard();
if (user) render();

function render() {
  const root = renderShell({ active: 'profile', title: 'Profile & Settings', subtitle: 'Manage your account' });

  root.innerHTML = `
    <div class="page-header">
      <div>
        <h1>Profile</h1>
        <div class="page-sub">Update your personal information and password.</div>
      </div>
    </div>

    <div class="profile-grid">
      <section class="panel">
        <header class="panel-header">
          <h3>Account information</h3>
        </header>
        <div class="panel-body">
          <div class="row" style="gap:var(--s-4); margin-bottom:var(--s-5);">
            <div class="avatar lg" aria-hidden="true">${escapeHTML(initials(user.name))}</div>
            <div>
              <div style="font-weight:var(--fw-semibold); font-size:var(--fs-lg);">${escapeHTML(user.name)}</div>
              <div class="muted">@${escapeHTML(user.username || '')}</div>
              <div class="muted" style="font-size:var(--fs-sm);">${escapeHTML(user.email)}</div>
              <div class="muted" style="margin-top:var(--s-1); font-size:var(--fs-xs);">Member since ${formatDate(user.createdAt)}</div>
            </div>
          </div>
          <form id="profileForm" novalidate style="display:flex; flex-direction:column; gap:var(--s-4);">
            <div class="field">
              <label for="p_name">Full name</label>
              <input id="p_name" name="name" class="input" type="text" value="${escapeHTML(user.name)}" maxlength="80" required>
              <div class="err" data-err="name"></div>
            </div>
            <div class="field">
              <label for="p_bio">Short bio <span class="muted">(optional)</span></label>
              <textarea id="p_bio" name="bio" class="textarea" maxlength="200" placeholder="A line about yourself">${escapeHTML(user.bio || '')}</textarea>
            </div>
            <div class="row" style="justify-content:flex-end;">
              <button type="submit" class="btn btn-primary">Save changes</button>
            </div>
          </form>
        </div>
      </section>

      <section class="panel">
        <header class="panel-header">
          <h3>Change password</h3>
        </header>
        <div class="panel-body">
          <form id="pwForm" novalidate style="display:flex; flex-direction:column; gap:var(--s-4);">
            <div class="field">
              <label for="pw_current">Current password</label>
              <div class="pw-wrap">
                <input id="pw_current" name="current" class="input" type="password" required>
                <button type="button" class="pw-toggle" data-toggle-pw="pw_current" aria-label="Show password" title="Show password"></button>
              </div>
              <div class="err" data-err="current"></div>
            </div>
            <div class="field">
              <label for="pw_new">New password</label>
              <div class="pw-wrap">
                <input id="pw_new" name="new" class="input" type="password" required>
                <button type="button" class="pw-toggle" data-toggle-pw="pw_new" aria-label="Show password" title="Show password"></button>
              </div>
              <div class="hint">At least 6 characters.</div>
              <div class="err" data-err="new"></div>
            </div>
            <div class="field">
              <label for="pw_confirm">Confirm new password</label>
              <div class="pw-wrap">
                <input id="pw_confirm" name="confirm" class="input" type="password" required>
                <button type="button" class="pw-toggle" data-toggle-pw="pw_confirm" aria-label="Show password" title="Show password"></button>
              </div>
              <div class="err" data-err="confirm"></div>
            </div>
            <div class="row" style="justify-content:flex-end;">
              <button type="submit" class="btn btn-primary">Update password</button>
            </div>
          </form>
        </div>
      </section>

      <section class="panel" style="grid-column: 1 / -1;">
        <header class="panel-header">
          <h3>Your activity</h3>
          <span class="chip ${statsChipVariant(user)}">${memberDaysLabel(user)}</span>
        </header>
        <div class="panel-body">
          <div class="grid grid-stats" id="profileStats"></div>
        </div>
      </section>

      <section class="panel" style="grid-column: 1 / -1;">
        <header class="panel-header">
          <h3>Your data</h3>
        </header>
        <div class="panel-body" style="display:flex; flex-direction:column; gap:var(--s-3);">
          <div class="row between" style="flex-wrap:wrap; gap:var(--s-3);">
            <div>
              <div style="font-weight:var(--fw-medium);">Export your data</div>
              <div class="muted" style="font-size:var(--fs-sm);">Download a JSON file with your profile and all your tasks. You own your data.</div>
            </div>
            <button id="exportBtn" class="btn btn-secondary"><span data-icon="download"></span>Export</button>
          </div>
          <div class="row between" style="flex-wrap:wrap; gap:var(--s-3); border-top:1px solid var(--border); padding-top:var(--s-4);">
            <div>
              <div style="font-weight:var(--fw-medium);">Import tasks from a file</div>
              <div class="muted" style="font-size:var(--fs-sm);">Restore tasks from a previously exported JSON file. Replaces your current tasks.</div>
            </div>
            <div>
              <input id="importFile" type="file" accept="application/json,.json" hidden>
              <button id="importBtn" class="btn btn-secondary"><span data-icon="upload"></span>Import</button>
            </div>
          </div>
          <div class="row between" style="flex-wrap:wrap; gap:var(--s-3); border-top:1px solid var(--border); padding-top:var(--s-4);">
            <div>
              <div style="font-weight:var(--fw-medium);">Clear all tasks</div>
              <div class="muted" style="font-size:var(--fs-sm);">Remove every task in your account. Your profile stays intact.</div>
            </div>
            <button id="clearTasksBtn" class="btn btn-danger">Clear tasks</button>
          </div>
          <div class="row between" style="flex-wrap:wrap; gap:var(--s-3); border-top:1px solid var(--border); padding-top:var(--s-4);">
            <div>
              <div style="font-weight:var(--fw-medium);">Sign out</div>
              <div class="muted" style="font-size:var(--fs-sm);">End your session on this device.</div>
            </div>
            <button id="signOutBtn" class="btn btn-secondary">Sign out</button>
          </div>
        </div>
      </section>
    </div>
  `;

  mountIcons(root);
  renderActivity();
  bind();
}

function statsChipVariant(u) {
  const days = daysSince(u.createdAt);
  if (days >= 90) return 'success';
  if (days >= 30) return 'info';
  return 'accent';
}
function memberDaysLabel(u) {
  const days = daysSince(u.createdAt);
  if (days === 0)  return 'Joined today';
  if (days === 1)  return '1 day in';
  return `${days} days in`;
}
function daysSince(iso) {
  if (!iso) return 0;
  const ms = Date.now() - new Date(iso).getTime();
  return Math.max(0, Math.floor(ms / 86400000));
}

function renderActivity() {
  const grid = document.getElementById('profileStats');
  if (!grid) return;
  let stats;
  try { stats = Tasks.stats(); } catch { stats = { total: 0, done: 0, pending: 0, overdue: 0, completionRate: 0 }; }
  const longestStreak = computeLongestStreak();
  const days = daysSince(user.createdAt);
  const perDay = days > 0 ? (stats.total / days).toFixed(1) : stats.total;

  grid.innerHTML = `
    ${activityStat('Tasks created',  stats.total,            'layers',     'accent', 'All time')}
    ${activityStat('Tasks done',     stats.done,             'checkCircle', stats.done > 0 ? 'success' : 'accent', `${stats.completionRate}% rate`)}
    ${activityStat('In progress',    stats.pending,          'inbox',       stats.pending > 0 ? 'info' : 'accent', stats.overdue ? `${stats.overdue} overdue` : 'On track')}
    ${activityStat('Tasks / day',    perDay,                 'trendingUp',  'warning', days === 0 ? 'New here' : `over ${days} day${days === 1 ? '' : 's'}`)}
    ${activityStat('Best streak',    longestStreak + 'd',    'flag',        longestStreak > 0 ? 'success' : 'accent', 'Consecutive days')}
    ${activityStat('Account age',    days + 'd',             'calendar',    'info', 'Since signup')}
  `;
  mountIcons(grid);
}

function activityStat(label, value, icon, variant, meta) {
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

// Longest run of consecutive days with at least one completed task.
function computeLongestStreak() {
  let all;
  try { all = Tasks.list(); } catch { return 0; }
  const days = new Set();
  for (const t of all) {
    if (!t.done || !t.updatedAt) continue;
    const d = new Date(t.updatedAt);
    d.setHours(0, 0, 0, 0);
    days.add(d.getTime());
  }
  if (days.size === 0) return 0;
  const sorted = [...days].sort((a, b) => a - b);
  let best = 1, run = 1;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] - sorted[i - 1] === 86400000) { run++; best = Math.max(best, run); }
    else { run = 1; }
  }
  return best;
}

function bind() {
  const profileForm = document.getElementById('profileForm');
  profileForm.addEventListener('submit', (e) => {
    e.preventDefault();
    clearErrors(profileForm);
    const data = new FormData(profileForm);
    const name = data.get('name')?.toString().trim();
    const bio  = data.get('bio')?.toString();
    const errors = {
      name: Validate.run([Validate.required(name, 'Name'), Validate.minLength(name, 2, 'Name')]),
    };
    showErrors(profileForm, errors);
    if (errors.name) return;
    try {
      Auth.updateProfile({ name, bio });
      toast('Profile updated.', 'success');
      setTimeout(() => location.reload(), 600);
    } catch (err) {
      toast(err.message, 'error');
    }
  });

  const pwForm = document.getElementById('pwForm');
  pwForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    clearErrors(pwForm);
    const data = new FormData(pwForm);
    const current = data.get('current')?.toString() || '';
    const next    = data.get('new')?.toString() || '';
    const confirm = data.get('confirm')?.toString() || '';
    const errors = {
      current: Validate.required(current, 'Current password'),
      new:     Validate.run([Validate.required(next, 'New password'), Validate.minLength(next, 6, 'New password')]),
      confirm: Validate.match(next, confirm, 'Passwords'),
    };
    showErrors(pwForm, errors);
    if (Object.values(errors).some(Boolean)) return;
    try {
      await Auth.changePassword({ currentPassword: current, newPassword: next });
      toast('Password updated.', 'success');
      pwForm.reset();
    } catch (err) {
      toast(err.message, 'error');
    }
  });

  document.getElementById('clearTasksBtn').addEventListener('click', async () => {
    const ok = await confirmDialog({
      title: 'Clear all your tasks?',
      message: 'This will permanently delete every task in your account. This action cannot be undone.',
      confirmLabel: 'Clear all tasks',
      danger: true,
    });
    if (!ok) return;
    Storage.setTasks(user.id, []);
    toast('All tasks cleared.', 'success');
  });

  document.getElementById('signOutBtn').addEventListener('click', async () => {
    const ok = await confirmDialog({
      title: 'Sign out of Taskline?',
      message: "You'll need to sign in again to see your tasks. Your data stays saved on this device.",
      confirmLabel: 'Sign out',
      danger: false,
    });
    if (!ok) return;
    Auth.logout();
    location.replace('login.html');
  });

  document.getElementById('exportBtn').addEventListener('click', () => exportData());
  document.getElementById('importBtn').addEventListener('click', () => {
    document.getElementById('importFile').click();
  });
  document.getElementById('importFile').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) importData(file);
    e.target.value = ''; // allow re-import of same file
  });

  wirePasswordToggles();
}

function wirePasswordToggles() {
  document.querySelectorAll('[data-toggle-pw]').forEach(btn => {
    btn.innerHTML = Icon.eye;
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.togglePw);
      if (!input) return;
      const showing = input.type === 'text';
      input.type = showing ? 'password' : 'text';
      btn.innerHTML = showing ? Icon.eye : Icon.eyeOff;
      btn.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
      btn.title = showing ? 'Show password' : 'Hide password';
    });
  });
}

function exportData() {
  const payload = {
    version: 1,
    exportedAt: new Date().toISOString(),
    profile: {
      username: user.username,
      name: user.name,
      email: user.email,
      bio: user.bio || '',
      createdAt: user.createdAt,
    },
    tasks: Storage.getTasks(user.id),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `taskline-${user.username || 'data'}-${stamp}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast('Data exported.', 'success');
}

async function importData(file) {
  let parsed;
  try {
    const text = await file.text();
    parsed = JSON.parse(text);
  } catch {
    toast('That file is not valid JSON.', 'error');
    return;
  }
  if (!parsed || !Array.isArray(parsed.tasks)) {
    toast('No tasks found in that file.', 'error');
    return;
  }
  // Light shape check — accept any object that has at least a title.
  const tasks = parsed.tasks
    .filter(t => t && typeof t.title === 'string' && t.title.trim())
    .map(t => ({
      id: t.id || ('t_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8)),
      title: String(t.title).slice(0, 120),
      description: typeof t.description === 'string' ? t.description.slice(0, 500) : '',
      priority: ['low', 'medium', 'high'].includes(t.priority) ? t.priority : 'medium',
      dueDate: typeof t.dueDate === 'string' ? t.dueDate : '',
      done: !!t.done,
      createdAt: t.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  if (tasks.length === 0) {
    toast('That file has no usable tasks.', 'error');
    return;
  }
  const ok = await confirmDialog({
    title: `Import ${tasks.length} task${tasks.length === 1 ? '' : 's'}?`,
    message: 'This replaces your current tasks. Make sure you exported a backup first if you want to keep them.',
    confirmLabel: 'Replace and import',
    danger: true,
  });
  if (!ok) return;
  if (!Storage.setTasks(user.id, tasks)) {
    toast('Could not save — storage is full.', 'error');
    return;
  }
  toast(`Imported ${tasks.length} task${tasks.length === 1 ? '' : 's'}.`, 'success');
}
