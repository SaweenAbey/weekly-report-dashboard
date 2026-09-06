# Weekly Report Dashboard - Frontend

Modern, responsive web application for weekly engineering report submissions, status tracking, and manager reviews built with **React**, **Vite**, **TypeScript**, **Tailwind CSS**, and **Lucide React**.

---

## 🛠️ Tech Stack & Dependencies

- **Framework**: [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + Custom Glassmorphic design tokens
- **Routing**: [React Router v6](https://reactrouter.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **HTTP Client**: [Axios](https://axios-http.com/) with automatic JWT Bearer token interceptor

---

## 📁 Folder Structure

```
frontend/
├── src/
│   ├── api/                       # API integration with Axios
│   │   ├── client.ts              # Axios instance & JWT interceptors
│   │   ├── auth.api.ts            # Login, register, profile
│   │   ├── reports.api.ts         # Report CRUD, submit, review
│   │   ├── projects.api.ts        # Projects CRUD
│   │   └── users.api.ts           # Users & team directory
│   ├── components/
│   │   ├── common/                # StatusBadge, RoleBadge, Button, Modal, Spinner
│   │   ├── layout/                # Navbar, Sidebar, DashboardLayout, ProtectedRoute
│   │   └── reports/               # ReportCard, ReviewModal, CreateReportModal, ReviewHistoryTimeline
│   ├── context/                   # AuthContext (JWT state, roles, 1-click demo login)
│   ├── pages/
│   │   ├── LoginPage.tsx          # Login with 1-click Quick Demo login buttons
│   │   ├── RegisterPage.tsx       # User registration
│   │   ├── DashboardPage.tsx      # Overview metrics & recent submissions
│   │   ├── ReportsPage.tsx        # Multi-filter search & paginated reports
│   │   ├── ReportDetailsPage.tsx  # Detailed report view with Review History timeline
│   │   ├── ProjectsPage.tsx       # Projects overview & creation
│   │   └── TeamPage.tsx           # Engineering team directory (Manager/Admin)
│   ├── types/                     # TypeScript interfaces
│   ├── App.tsx                    # App Router & Protected Routes
│   ├── index.css                  # Tailwind directives & design system
│   └── main.tsx
├── .env / .env.example
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── vite.config.ts
```

---

## 🚀 How to Run

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Configure Environment
Check `.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 3. Start Development Server
```bash
npm run dev
```

The frontend will run on: `http://localhost:5173`

---

## ⚡ 1-Click Quick Demo Login

The login page contains one-click demo login buttons for:
- 👑 **Admin**: `admin@example.com` / `Password123!`
- 👔 **Manager**: `sarah.manager@example.com` / `Password123!`
- 💻 **Team Member**: `john.dev@example.com` / `Password123!`

---

## 🌟 Key Features

1. **Role-Based UI & Access Gates**:
   - Team members can only view, edit, and submit their own reports.
   - Managers have access to the Review Modal (`Approve`, `Request Changes`, `Reject` with comments).
   - Admins can manage all projects, users, and reports.
2. **Review & Status History Timeline**:
   - Visual step-by-step history showing reviewer name, avatar, timestamp, status transition, and feedback comments.
3. **Advanced Filtering & Pagination**:
   - Live search across tasks, summary, and blockers.
   - Filter by status (`DRAFT`, `SUBMITTED`, `UNDER_REVIEW`, `CHANGES_REQUESTED`, `APPROVED`, `REJECTED`), project, and date range.
4. **Interactive Report Submission Modal**:
   - Dynamic task items for completed work, in-progress tasks, plans for next week, hours logged, and blockers.
