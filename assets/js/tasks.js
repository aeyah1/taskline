// tasks.js — task CRUD logic (separation from UI)
// Depends on storage.js and auth.js (loaded before this file in HTML)

function uid() {
  return 't_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function userId() {
  const u = Auth.currentUser();
  if (!u) throw new Error('Not signed in.');
  return u.id;
}

const Tasks = {
  list(sort = 'smart') {
    const raw = Storage.getTasks(userId()).slice();
    const prio = { high: 0, medium: 1, low: 2 };
    const comparators = {
      // Default: incomplete first, then by priority, then by recency.
      smart: (a, b) => {
        if (a.done !== b.done) return a.done ? 1 : -1;
        if (prio[a.priority] !== prio[b.priority]) return prio[a.priority] - prio[b.priority];
        return (b.createdAt || '').localeCompare(a.createdAt || '');
      },
      newest:   (a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''),
      oldest:   (a, b) => (a.createdAt || '').localeCompare(b.createdAt || ''),
      due:      (a, b) => {
        // Tasks with a due date come first (earliest first); no-due last.
        if (!a.dueDate && !b.dueDate) return 0;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      },
      priority: (a, b) => prio[a.priority] - prio[b.priority],
    };
    return raw.sort(comparators[sort] || comparators.smart);
  },

  create({ title, description, priority = 'medium', dueDate = '' }) {
    const uId = userId();
    const list = Storage.getTasks(uId);
    const task = {
      id: uid(),
      title: title.trim(),
      description: (description || '').trim(),
      priority,
      dueDate,
      done: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    list.push(task);
    Storage.setTasks(uId, list);
    return task;
  },

  update(id, patch) {
    const uId = userId();
    const list = Storage.getTasks(uId);
    const idx = list.findIndex(t => t.id === id);
    if (idx === -1) throw new Error('Task not found.');
    list[idx] = { ...list[idx], ...patch, updatedAt: new Date().toISOString() };
    Storage.setTasks(uId, list);
    return list[idx];
  },

  toggleDone(id) {
    const uId = userId();
    const list = Storage.getTasks(uId);
    const idx = list.findIndex(t => t.id === id);
    if (idx === -1) return;
    list[idx].done = !list[idx].done;
    list[idx].updatedAt = new Date().toISOString();
    Storage.setTasks(uId, list);
    return list[idx];
  },

  remove(id) {
    const uId = userId();
    const list = Storage.getTasks(uId).filter(t => t.id !== id);
    Storage.setTasks(uId, list);
  },

  // Stats for dashboard
  stats() {
    const list = Storage.getTasks(userId());
    const total = list.length;
    const done = list.filter(t => t.done).length;
    const pending = total - done;
    const overdue = list.filter(t => !t.done && t.dueDate && new Date(t.dueDate) < startOfToday()).length;
    const completionRate = total ? Math.round((done / total) * 100) : 0;
    return { total, done, pending, overdue, completionRate };
  },

  // Tasks due today (not yet done).
  dueToday() {
    const today = startOfToday();
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    return Tasks.list().filter(t => {
      if (t.done || !t.dueDate) return false;
      const d = new Date(t.dueDate);
      return d >= today && d < tomorrow;
    });
  },

  // Tasks due in the next 7 days (excluding today). Not yet done.
  dueThisWeek() {
    const today = startOfToday();
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);
    const weekEnd = new Date(today); weekEnd.setDate(weekEnd.getDate() + 7);
    return Tasks.list().filter(t => {
      if (t.done || !t.dueDate) return false;
      const d = new Date(t.dueDate);
      return d >= tomorrow && d < weekEnd;
    });
  },

  // Count of tasks per priority bucket.
  priorityBreakdown() {
    const counts = { high: 0, medium: 0, low: 0 };
    for (const t of Tasks.list()) counts[t.priority] = (counts[t.priority] || 0) + 1;
    return counts;
  },

  // Tasks completed grouped by day for the last N days (oldest -> newest).
  completedByDay(days = 7) {
    const list = Storage.getTasks(userId());
    const buckets = [];
    const today = startOfToday();
    for (let i = days - 1; i >= 0; i--) {
      const day = new Date(today); day.setDate(day.getDate() - i);
      const next = new Date(day); next.setDate(next.getDate() + 1);
      const count = list.filter(t => {
        if (!t.done || !t.updatedAt) return false;
        const u = new Date(t.updatedAt);
        return u >= day && u < next;
      }).length;
      buckets.push({ date: day, count });
    }
    return buckets;
  },

  // Search + filter + sort
  query({ keyword = '', status = 'all', priority = 'all', sort = 'smart' } = {}) {
    const kw = keyword.trim().toLowerCase();
    return Tasks.list(sort).filter(t => {
      if (status === 'done' && !t.done) return false;
      if (status === 'pending' && t.done) return false;
      if (priority !== 'all' && t.priority !== priority) return false;
      if (kw && !(t.title.toLowerCase().includes(kw) || t.description.toLowerCase().includes(kw))) return false;
      return true;
    });
  },
};

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}
