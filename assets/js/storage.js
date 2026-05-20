// storage.js — thin localStorage abstraction (single responsibility: persistence)
const KEYS = {
  users:   'tm.users',
  session: 'tm.session',
  tasks:   'tm.tasks',
};

// Sessions auto-expire after 24 hours of inactivity.
const SESSION_TTL_MS = 24 * 60 * 60 * 1000;

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

// Returns true on success, false if storage is full or unavailable.
// Callers can surface a friendly error when this fails.
function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error('Storage write failed for', key, err);
    return false;
  }
}

const Storage = {
  // Users (array of { id, username, name, email, passwordHash, createdAt, bio })
  getUsers()        { return read(KEYS.users, []); },
  setUsers(users)   { return write(KEYS.users, users); },

  // Session — { id, expiresAt } stored as JSON. Returns null if missing or expired.
  getSession() {
    const s = read(KEYS.session, null);
    if (!s || !s.id) return null;
    if (s.expiresAt && Date.now() > s.expiresAt) {
      localStorage.removeItem(KEYS.session);
      return null;
    }
    return s.id;
  },
  setSession(id) {
    return write(KEYS.session, { id, expiresAt: Date.now() + SESSION_TTL_MS });
  },
  clearSession()    { localStorage.removeItem(KEYS.session); },

  // Tasks scoped per user: { [userId]: Task[] }
  getAllTasks()     { return read(KEYS.tasks, {}); },
  getTasks(userId)  { return read(KEYS.tasks, {})[userId] || []; },
  setTasks(userId, list) {
    const all = read(KEYS.tasks, {});
    all[userId] = list;
    return write(KEYS.tasks, all);
  },
};
