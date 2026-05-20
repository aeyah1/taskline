// ui.js — small reusable UI helpers: toast, modal, confirm
// Depends on icons.js (loaded before this file in HTML)

// ─── Toast ─────────────────────────────────────────────
let toastStack;
function ensureStack() {
  if (toastStack) return toastStack;
  toastStack = document.createElement('div');
  toastStack.className = 'toast-stack';
  document.body.appendChild(toastStack);
  return toastStack;
}

const TOAST_ICONS = {
  success: Icon.checkCircle,
  error:   Icon.xCircle,
  warning: Icon.alert,
  info:    Icon.info,
};

function toast(message, type = 'info', ms = 3200) {
  const stack = ensureStack();
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.innerHTML = `${TOAST_ICONS[type] || TOAST_ICONS.info}<span>${escapeHTML(message)}</span>`;
  stack.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(20px)';
    el.style.transition = 'opacity 200ms, transform 200ms';
    setTimeout(() => el.remove(), 220);
  }, ms);
}

// ─── Modal ─────────────────────────────────────────────
// Generic mountable modal. Returns { open, close, root }.
function createModal({ title, bodyHTML, footerHTML = '' }) {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.innerHTML = `
    <div class="modal" role="dialog" aria-modal="true" aria-label="${escapeAttr(title)}">
      <header class="modal-header">
        <h3>${escapeHTML(title)}</h3>
        <button class="btn btn-ghost btn-icon" data-close aria-label="Close">${Icon.close}</button>
      </header>
      <div class="modal-body">${bodyHTML}</div>
      ${footerHTML ? `<footer class="modal-footer">${footerHTML}</footer>` : ''}
    </div>`;
  document.body.appendChild(backdrop);

  function close() {
    backdrop.classList.remove('open');
    setTimeout(() => backdrop.remove(), 200);
    document.removeEventListener('keydown', onKey);
  }
  function open() {
    requestAnimationFrame(() => backdrop.classList.add('open'));
    document.addEventListener('keydown', onKey);
  }
  function onKey(e) { if (e.key === 'Escape') close(); }

  backdrop.addEventListener('click', (e) => {
    if (e.target === backdrop || e.target.closest('[data-close]')) close();
  });

  return { root: backdrop, open, close };
}

// Confirm dialog — used for destructive actions (error prevention rubric)
function confirmDialog({ title, message, confirmLabel = 'Confirm', danger = false }) {
  return new Promise(resolve => {
    const modal = createModal({
      title,
      bodyHTML: `<p style="color:var(--text-muted); line-height:var(--lh-loose);">${escapeHTML(message)}</p>`,
      footerHTML: `
        <button class="btn btn-secondary" data-action="cancel">Cancel</button>
        <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" data-action="ok">${escapeHTML(confirmLabel)}</button>
      `,
    });
    modal.root.querySelector('[data-action="cancel"]').addEventListener('click', () => { modal.close(); resolve(false); });
    modal.root.querySelector('[data-action="ok"]').addEventListener('click',     () => { modal.close(); resolve(true); });
    modal.open();
  });
}

// ─── HTML safety ───────────────────────────────────────
function escapeHTML(str) {
  return String(str ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}
function escapeAttr(str) { return escapeHTML(str); }

// Initials helper for avatars
function initials(name) {
  if (!name) return '?';
  return name.trim().split(/\s+/).map(p => p[0]).slice(0, 2).join('').toUpperCase();
}

// Relative date formatter
function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d)) return '';
  const opts = { year: 'numeric', month: 'short', day: 'numeric' };
  return d.toLocaleDateString(undefined, opts);
}
