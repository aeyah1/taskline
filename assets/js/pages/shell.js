// shell.js — renders the sidebar + topbar (shared across dashboard, tasks, profile)
// Depends on auth.js, tasks.js, icons.js, ui.js (loaded before this file in HTML)

function renderShell({ active, title, subtitle = '' }) {
  const user = Auth.currentUser();
  if (!user) return;

  // Stats used by sidebar widgets — safe even if Tasks throws (e.g. no session).
  let stats = { total: 0, done: 0, pending: 0, overdue: 0 };
  let pri = { high: 0, medium: 0, low: 0 };
  let dueToday = 0;
  try {
    stats = Tasks.stats();
    pri = Tasks.priorityBreakdown();
    dueToday = Tasks.dueToday().length;
  } catch { /* no-op */ }

  const now = new Date();
  const dow = now.toLocaleDateString(undefined, { weekday: 'long' });
  const dateLine = now.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  document.body.innerHTML = `
    <div class="app">
      <aside class="sidebar" id="appSidebar">
        <div class="brand">
          <span class="logo">${Icon.check}</span>
          <span>Taskline</span>
        </div>

        <div class="sidebar-date" aria-hidden="true">
          <span class="dow">${escapeHTML(dow)}</span>
          <span class="date">${escapeHTML(dateLine)}</span>
        </div>

        <nav class="nav" aria-label="Primary">
          <a href="dashboard.html" data-key="dashboard">${Icon.home}<span>Dashboard</span></a>
          <a href="tasks.html"     data-key="tasks">${Icon.list}<span>Tasks</span>${stats.pending ? `<span class="count">${stats.pending}</span>` : ''}</a>
          <a href="profile.html"   data-key="profile">${Icon.user}<span>Profile</span></a>
        </nav>

        <div class="sidebar-section">
          <h4>At a glance</h4>
          <div class="sidebar-quickstats">
            <div class="sidebar-quickstat today">
              <span class="dot"></span>
              <span class="lbl">Due today</span>
              <span class="val">${dueToday}</span>
            </div>
            <div class="sidebar-quickstat overdue">
              <span class="dot"></span>
              <span class="lbl">Overdue</span>
              <span class="val">${stats.overdue}</span>
            </div>
            <div class="sidebar-quickstat high">
              <span class="dot"></span>
              <span class="lbl">High priority</span>
              <span class="val">${pri.high}</span>
            </div>
            <div class="sidebar-quickstat medium">
              <span class="dot"></span>
              <span class="lbl">Medium</span>
              <span class="val">${pri.medium}</span>
            </div>
            <div class="sidebar-quickstat low">
              <span class="dot"></span>
              <span class="lbl">Low</span>
              <span class="val">${pri.low}</span>
            </div>
          </div>
        </div>

        <div class="sidebar-tip">
          Tip: press <kbd>N</kbd> on the tasks page to add a task fast.
        </div>

        <div class="sidebar-foot">
          <div class="avatar" aria-hidden="true">${escapeHTML(initials(user.name))}</div>
          <div class="user">
            <span class="name">${escapeHTML(user.name)}</span>
            <span class="email">@${escapeHTML(user.username || '')}</span>
          </div>
          <button id="logoutBtn" class="btn btn-ghost btn-icon" aria-label="Sign out" title="Sign out">${Icon.logout}</button>
        </div>
      </aside>
      <main class="main">
        <header class="topbar">
          <button id="navToggle" class="mobile-trigger" aria-label="Open menu" aria-controls="appSidebar">${Icon.list}</button>
          <div>
            <div class="title">${escapeHTML(title)}</div>
            ${subtitle ? `<div class="crumb">${escapeHTML(subtitle)}</div>` : ''}
          </div>
        </header>
        <div class="content fade-in" id="pageContent"></div>
      </main>
      <div class="sidebar-scrim" id="sidebarScrim" aria-hidden="true"></div>
    </div>`;

  document.querySelectorAll('.nav a').forEach(a => {
    if (a.dataset.key === active) a.classList.add('active');
  });

  document.getElementById('logoutBtn').addEventListener('click', async () => {
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

  // Mobile sidebar drawer
  const toggle = document.getElementById('navToggle');
  const scrim  = document.getElementById('sidebarScrim');
  const close  = () => { document.body.classList.remove('sidebar-open'); toggle?.setAttribute('aria-label', 'Open menu'); };
  const open   = () => { document.body.classList.add('sidebar-open');    toggle?.setAttribute('aria-label', 'Close menu'); };
  toggle?.addEventListener('click', () => {
    document.body.classList.contains('sidebar-open') ? close() : open();
  });
  scrim?.addEventListener('click', close);
  // Auto-close the drawer when a nav link is tapped on mobile.
  document.querySelectorAll('.nav a').forEach(a => a.addEventListener('click', close));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

  mountIcons();
  return document.getElementById('pageContent');
}
