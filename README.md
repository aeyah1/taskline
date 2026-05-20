# Taskline — Mini Application System

**Owner:** Alleah Carmel
**Course:** Application Development | 3rd Year | A.Y. 2025–2026
**Institution:** North Eastern Mindanao State University — College of Information Technology Education

Taskline is a clean, distraction-free personal task manager. It demonstrates UI/UX design, software architecture, quality assurance, deployment readiness, and software ethics — the five course domains required by the final-project rubric.

---

## How to run

No installation. No database. No build step.

1. Open the project folder.
2. Double-click **`index.html`** — that's the **landing page**. From there click **"Get started"** to register, or **"Sign in"** if you already have an account.
3. After you sign in, the landing page (and `login.html`) auto-redirects you to your dashboard. Click **Sign out** in the sidebar to end the session.

That's it — Taskline uses plain `<script>` tags (not ES modules) specifically so that opening the files directly from disk works in every modern browser. If for any reason you prefer to serve it over HTTP, run one of these from the project folder and visit `http://localhost:8000`:

```
python -m http.server 8000
```
```
npx serve .
```

---

## Features implemented

| # | Feature | Where it lives |
|---|---|---|
| 1 | **Login / Registration** — username + email, password strength meter, show/hide password toggle, log in with either username or email | `index.html`, `register.html` + `assets/js/auth.js` |
| 2 | **Dashboard** with color-coded summary statistics (total, pending, completed, completion rate, overdue) | `dashboard.html` + `pages/dashboard.js` |
| 3 | **Full CRUD module** — create, read, update, delete tasks. Press **N** to open the new-task modal | `tasks.html` + `pages/tasks-page.js`, `tasks.js` |
| 4 | **Search, filter, and sort** — keyword search, filter by status / priority, sort by smart / newest / oldest / due date / priority | `pages/tasks-page.js` |
| 5 | **Feedback / error message system** — toasts, inline validation errors, password strength meter, quota-full warnings | `assets/js/ui.js`, `validation.js` |
| 6 | **Settings / profile page** with password change, JSON export & import (data portability), and danger-zone actions | `profile.html` + `pages/profile.js` |

> The rubric required at least three features. Taskline ships with all six, plus extras: 24-hour session expiry, password strength meter, keyboard shortcuts, color-coded dashboard stats, and full data export/import.

---

## Project structure

```
FinalProject-AppDev/
├── index.html              ← entry / login page
├── register.html           ← account registration
├── dashboard.html          ← summary dashboard (post-login)
├── tasks.html              ← task CRUD + search + filter
├── profile.html            ← profile, password, danger zone
├── README.md               ← this file
├── REFLECTION.md           ← 1-page reflection (required deliverable)
└── assets/
    ├── css/
    │   ├── tokens.css       ← design tokens (colors, spacing, shadows, motion)
    │   ├── base.css         ← reset, typography, focus rings
    │   ├── components.css   ← buttons, inputs, panels, modal, toast, chips
    │   └── layout.css       ← auth shell + app shell (sidebar + main)
    └── js/
        ├── storage.js       ← localStorage abstraction (single responsibility)
        ├── auth.js          ← register / login / session / password hashing
        ├── validation.js    ← pure validation helpers
        ├── ui.js            ← toast, modal, confirm-dialog, html escaping
        ├── icons.js         ← inline SVG icon set (no emoji)
        ├── router.js        ← route guard (redirects)
        ├── tasks.js         ← task CRUD logic + stats + query
        └── pages/
            ├── shell.js     ← shared sidebar + topbar renderer
            ├── login.js
            ├── register.js
            ├── dashboard.js
            ├── tasks-page.js
            └── profile.js
```

Every responsibility lives in its own file. **No file exceeds ~300 lines.** Logic is separated from rendering, persistence is separated from logic, and validation is a pure module with no DOM coupling.

---

## Test plan (manual)

1. **Registration validation** — try submitting with empty fields, an invalid email, a username with spaces or special characters, a 3-character password, and mismatched passwords. Each should produce an inline error without submitting.
2. **Password strength meter** — type into the password field; the meter moves from *Too short* → *Weak* → *Fair* → *Good* → *Strong* as length and character variety increase.
3. **Show / hide password** — click the eye icon next to any password field; the input flips between hidden and visible.
4. **Duplicate username / email** — register `alleah_c` / `you@example.com`, log out, register again with either the same username or the same email. The toast names which one is taken.
5. **Login by username or email** — log in once using your username, once using your email. Both should work. Wrong password shows a clear error.
6. **Session expiry** — sessions live for 24 hours. After that, a reload redirects back to the login page automatically.
7. **Route guards** — visit `dashboard.html` while logged out (redirects to `index.html`); visit `index.html` while logged in (redirects to `dashboard.html`).
8. **CRUD** — create a task, edit it, mark it done, delete it. The delete action shows a confirm dialog (error-prevention). Press **N** on the tasks page to open the new-task modal.
9. **Search + filter + sort** — type in the search box, switch the status segmented control, change the priority dropdown, change the sort dropdown. The list updates live.
10. **Edge cases** — submit a 120-character title (allowed), a 121-character title (validation blocks), a task with an empty description (allowed), a past due date (shown as *Overdue*).
11. **Password change** — wrong current password shows an error; correct change updates the password and you can log in again with the new one.
12. **Data export / import** — on the Profile page, export your data as a JSON file. Clear all tasks. Import the file. Your tasks return.
13. **Danger zone** — *Clear all tasks* and *Import* both require confirmation; *Sign out* ends the session.
14. **Responsive** — resize the window. The sidebar collapses below 768 px.

---

## Submission

Compress the entire `FinalProject-AppDev` folder into a `.zip` and submit alongside `REFLECTION.md`.
