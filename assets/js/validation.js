// validation.js — pure validation helpers (no DOM coupling)
const Validate = {
  required(value, label = 'This field') {
    if (!value || !String(value).trim()) return `${label} is required.`;
    return null;
  },

  email(value) {
    if (!value) return 'Email is required.';
    const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
    return ok ? null : 'Enter a valid email address.';
  },

  // Username: 3–20 chars, lowercase letters / digits / underscore / dot only.
  username(value) {
    if (!value || !value.trim()) return 'Username is required.';
    const v = value.trim();
    if (v.length < 3) return 'Username must be at least 3 characters.';
    if (v.length > 20) return 'Username must be 20 characters or fewer.';
    if (!/^[a-zA-Z0-9_.]+$/.test(v)) return 'Use only letters, numbers, dot, or underscore.';
    return null;
  },

  minLength(value, n, label = 'This field') {
    if (!value || value.length < n) return `${label} must be at least ${n} characters.`;
    return null;
  },

  maxLength(value, n, label = 'This field') {
    if (value && value.length > n) return `${label} must be ${n} characters or fewer.`;
    return null;
  },

  match(a, b, label = 'Values') {
    return a === b ? null : `${label} do not match.`;
  },

  // Compose multiple checks; returns first error message or null.
  run(checks) {
    for (const err of checks) if (err) return err;
    return null;
  },
};

// Bind error messages to a form's .err elements.
// fieldErrors: { [inputName]: errorMessage | null }
function showErrors(form, fieldErrors) {
  Object.entries(fieldErrors).forEach(([name, msg]) => {
    const input = form.querySelector(`[name="${name}"]`);
    const errEl = form.querySelector(`[data-err="${name}"]`);
    if (input)  input.classList.toggle('invalid', !!msg);
    if (errEl)  errEl.textContent = msg || '';
  });
}

function clearErrors(form) {
  form.querySelectorAll('.invalid').forEach(el => el.classList.remove('invalid'));
  form.querySelectorAll('[data-err]').forEach(el => (el.textContent = ''));
}
