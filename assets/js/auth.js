// auth.js — registration, login, session, password hashing
// Depends on storage.js (loaded before this file in HTML)

// SHA-256 + static salt. Not real security — see REFLECTION.md.
async function hashPassword(plain) {
  const buf = new TextEncoder().encode(plain + '::tm-salt-v1');
  const digest = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

function uid() {
  return 'u_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function normalizeUsername(u) {
  return (u || '').trim().toLowerCase();
}

const Auth = {
  async register({ username, name, email, password }) {
    const users = Storage.getUsers();
    const uname = normalizeUsername(username);
    const mail  = email.trim().toLowerCase();

    if (users.find(u => (u.username || '').toLowerCase() === uname)) {
      throw new Error('That username is already taken.');
    }
    if (users.find(u => u.email.toLowerCase() === mail)) {
      throw new Error('An account with that email already exists.');
    }

    const user = {
      id: uid(),
      username: uname,
      name: name.trim(),
      email: mail,
      passwordHash: await hashPassword(password),
      bio: '',
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    if (!Storage.setUsers(users)) {
      throw new Error('Could not save account — storage is full.');
    }
    Storage.setSession(user.id);
    return user;
  },

  // identifier = username OR email. We try username first, then email.
  async login({ identifier, password }) {
    const users = Storage.getUsers();
    const key = (identifier || '').trim().toLowerCase();
    const user =
      users.find(u => (u.username || '').toLowerCase() === key) ||
      users.find(u => u.email.toLowerCase() === key);
    if (!user) throw new Error('No account found with that username or email.');
    const hash = await hashPassword(password);
    if (user.passwordHash !== hash) throw new Error('Incorrect password. Please try again.');
    Storage.setSession(user.id);
    return user;
  },

  logout() {
    Storage.clearSession();
  },

  currentUser() {
    const id = Storage.getSession();
    if (!id) return null;
    return Storage.getUsers().find(u => u.id === id) || null;
  },

  updateProfile({ name, bio }) {
    const users = Storage.getUsers();
    const id = Storage.getSession();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) throw new Error('Not signed in.');
    users[idx] = { ...users[idx], name: name.trim(), bio: (bio || '').trim() };
    if (!Storage.setUsers(users)) throw new Error('Could not save changes.');
    return users[idx];
  },

  async changePassword({ currentPassword, newPassword }) {
    const user = Auth.currentUser();
    if (!user) throw new Error('Not signed in.');
    const currHash = await hashPassword(currentPassword);
    if (user.passwordHash !== currHash) throw new Error('Current password is incorrect.');
    const users = Storage.getUsers();
    const idx = users.findIndex(u => u.id === user.id);
    users[idx].passwordHash = await hashPassword(newPassword);
    if (!Storage.setUsers(users)) throw new Error('Could not save password.');
  },

  // Backfill: any pre-existing accounts without a username get one derived from email.
  // Runs once on every page that loads auth.js — idempotent.
  _ensureUsernames() {
    const users = Storage.getUsers();
    let changed = false;
    for (const u of users) {
      if (!u.username) {
        u.username = (u.email.split('@')[0] || ('user_' + u.id.slice(2, 6))).toLowerCase();
        changed = true;
      }
    }
    if (changed) Storage.setUsers(users);
  },
};

Auth._ensureUsernames();
