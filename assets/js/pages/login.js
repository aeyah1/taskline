// login.js — wires up the login form
// Depends on auth.js, validation.js, ui.js, icons.js, router.js (loaded before this file in HTML)

guard();
mountIcons();
wirePasswordToggles();

const form = document.getElementById('loginForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors(form);

  const data = new FormData(form);
  const identifier = data.get('identifier')?.toString().trim();
  const password   = data.get('password')?.toString();

  const errors = {
    identifier: Validate.required(identifier, 'Username or email'),
    password:   Validate.required(password, 'Password'),
  };
  showErrors(form, errors);
  if (Object.values(errors).some(Boolean)) return;

  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Signing in...';
  try {
    const user = await Auth.login({ identifier, password });
    toast(`Welcome back, ${user.name.split(' ')[0]}.`, 'success');
    setTimeout(() => location.href = 'dashboard.html', 500);
  } catch (err) {
    toast(err.message, 'error');
    btn.disabled = false;
    btn.textContent = 'Sign in';
  }
});

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
