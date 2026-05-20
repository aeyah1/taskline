// register.js — wires up the registration form
// Depends on auth.js, validation.js, ui.js, icons.js, router.js (loaded before this file in HTML)

guard();
mountIcons();
wirePasswordToggles();
wireStrengthMeter();

const form = document.getElementById('registerForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors(form);

  const data = new FormData(form);
  const name     = data.get('name')?.toString().trim();
  const username = data.get('username')?.toString().trim();
  const email    = data.get('email')?.toString().trim();
  const password = data.get('password')?.toString() || '';
  const confirm  = data.get('confirm')?.toString() || '';

  const errors = {
    name:     Validate.run([Validate.required(name, 'Name'), Validate.minLength(name, 2, 'Name')]),
    username: Validate.username(username),
    email:    Validate.email(email),
    password: Validate.run([Validate.required(password, 'Password'), Validate.minLength(password, 6, 'Password')]),
    confirm:  Validate.match(password, confirm, 'Passwords'),
  };
  showErrors(form, errors);
  if (Object.values(errors).some(Boolean)) return;

  const btn = form.querySelector('button[type="submit"]');
  btn.disabled = true;
  btn.textContent = 'Creating account...';
  try {
    await Auth.register({ username, name, email, password });
    toast('Account created. Welcome aboard.', 'success');
    setTimeout(() => location.href = 'dashboard.html', 500);
  } catch (err) {
    toast(err.message, 'error');
    btn.disabled = false;
    btn.textContent = 'Create account';
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

function wireStrengthMeter() {
  const pw = document.getElementById('password');
  const meter = document.getElementById('pwStrength');
  if (!pw || !meter) return;
  const label = meter.querySelector('.strength-label');
  pw.addEventListener('input', () => {
    const { level, text } = scoreStrength(pw.value);
    meter.dataset.level = String(level);
    label.textContent = text;
  });
}

// Returns level 0..4 and a short label.
function scoreStrength(pw) {
  if (!pw) return { level: 0, text: 'Use 6 or more characters.' };
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'];
  return { level: score, text: labels[score] };
}
