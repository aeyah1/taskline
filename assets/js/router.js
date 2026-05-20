// router.js — page-level access control
// Depends on auth.js (loaded before this file in HTML)

// Pages that require a logged-in user.
const PROTECTED  = ['dashboard.html', 'tasks.html', 'profile.html'];
// Pages a logged-in user should NOT see (redirect to dashboard).
// The landing page (index.html) is intentionally not in this list — it should
// always be reachable, even when signed in.
const GUEST_ONLY = ['login.html', 'register.html'];

function guard() {
  const path = location.pathname.split('/').pop();
  const user = Auth.currentUser();

  if (PROTECTED.includes(path) && !user) {
    location.replace('login.html');
    return null;
  }
  if (GUEST_ONLY.includes(path) && user) {
    location.replace('dashboard.html');
    return null;
  }
  return user;
}
