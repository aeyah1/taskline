# Reflection — Taskline (Mini Application System)

**Owner:** Alleah Carmel
**Course:** Application Development | A.Y. 2025–2026
**Project:** Taskline — a personal task manager

---

## What did I build?

I built **Taskline**, a front-end personal task manager that runs entirely in the browser using `localStorage` for persistence. It covers six features: account **registration and login** (with a username + email, a password strength meter, a show/hide password toggle, and the option to log in using either the username *or* the email), a **dashboard** with color-coded summary statistics (total, pending, completed, completion rate, overdue), a complete **task CRUD module** (with a keyboard shortcut), **search / filter / sort** by keyword, status, priority, and several sort orders, a **feedback system** (toasts, inline errors, strength meter, quota-full warnings), and a **profile/settings page** with password change, **JSON export and import for data portability**, and a danger zone for clearing data. The application is split into eleven JavaScript files and four CSS files so that persistence, authentication, validation, UI primitives, routing, and business logic each live in their own file. Sessions auto-expire after 24 hours.

## What challenges did I face?

The hardest part was **resisting the temptation to make one big file**. My first instinct was to put everything in a single `app.js`. I chose instead to design the file layout up front: `storage.js` for persistence, `auth.js` for sessions, `tasks.js` for task logic, `validation.js` for pure rules, `ui.js` for toasts and modals, and a thin `pages/` folder for page-specific wiring. The payoff was that when I needed to add the search/filter feature, I only edited two files. A second challenge was **password handling** — I knew that storing raw passwords in `localStorage` would be unsafe, so I hashed them with `SHA-256 + a static salt` using the Web Crypto API. I am aware this is still not real security (see "Technical debt" below). A third challenge was making the UI feel **finished, not auto-generated** — I picked a single restrained accent color (teal), inline SVG icons rather than emojis, and a consistent radius/shadow scale so everything looks like it belongs together.

## Which course concepts did I apply?

- **SOLID — Single Responsibility Principle.** Every module has one job. `storage.js` only persists. `validation.js` is pure and has no DOM imports. `auth.js` never touches HTML. Page modules are the only files that mix logic with DOM, and even they delegate rendering to `shell.js`.
- **Hick's Law / Error Prevention.** The task form keeps choices minimal (three priority levels, optional due date). Destructive actions — *Delete task*, *Clear all tasks* — are gated behind a confirm dialog so users cannot accidentally lose work.
- **Visibility of System Status (Nielsen).** Every action produces visible feedback: success/error toasts, inline field errors that appear as you submit, an *Overdue* chip on past-due tasks, and a completion-rate stat on the dashboard.
- **Abstraction & Reusable Logic.** A single `createModal()` powers both the task form and the confirm dialog. A single `Validate` module is reused by login, registration, profile, and task forms. The toast and icon systems are mounted globally.
- **Ethics — Data minimization and data portability (GDPR).** Taskline only collects the user's username, name, email, and bio. Everything is stored locally; no analytics, no third-party calls. Beyond *Clear tasks* and *Sign out*, the profile page now offers **Export** (download all of your data as JSON) and **Import** (restore it on a new device). This mirrors the GDPR right to data portability and was a deliberate response to the rubric's ethics domain — users should always be able to leave with their own data intact.

## Technical debt I am aware of

1. **`localStorage` is not a real backend.** Tasks and accounts only exist on the current browser. A real version would use a server with a proper database, server-side validation, and HTTPS. I documented this rather than hide it, because acknowledging limits is part of good software practice.
2. **Password hashing is client-side and uses a static salt.** This is not safe against an attacker with access to the device. A production app would use a server-side `argon2` or `bcrypt` hash with a per-user salt. SHA-256 here only prevents the password from being trivially readable in `localStorage`.
3. **No automated tests.** Given the time available, I tested manually using the checklist in `README.md`. The next step would be to add unit tests for `validation.js`, `tasks.js`, and `auth.js`, since those modules have no DOM coupling and are easy to test in isolation.
4. **Accessibility passes are partial.** Focus rings, ARIA labels on icon buttons, and `role` attributes are in place, but a full screen-reader pass and keyboard-only navigation review were not done.

If I had more time, I would (a) port persistence to a small Node/Express + SQLite backend so the app survives across devices, (b) add a basic test suite using Vitest, and (c) finish the accessibility pass.
