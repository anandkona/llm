# LLM Portal — Multi-Tenant University LMS

Full-stack enterprise application featuring React 19 + Vite frontend, Express.js REST API backend, and MySQL database with strict multi-tenant university isolation and role-based access control.

---

## ⚡ Quick Start for Developers

Clone the repository and run the automated setup script to configure environment variables, install all dependencies, and prepare the MySQL database:

### 1. Run Automated Setup
```bash
npm run setup
```
This script will:
1. Create `backend/.env` from `backend/.env.example`
2. Create `frontend/.env` from `frontend/.env.example`
3. Install backend & frontend packages
4. Connect to MySQL (`llm` database) and initialize tables with sample data

### 2. Start the Development Servers

Open two terminal windows:

#### Terminal 1 — Backend:
```bash
npm run dev:backend
# API running on http://localhost:5000
```

#### Terminal 2 — Frontend:
```bash
npm run dev:frontend
# App running on http://localhost:3000
```

---

## 🔐 Security & Access Control

1. **Automatic Unauthenticated Rejection:**  
   All protected endpoints require an active session via an **HTTP-only, SameSite** cookie (`auth_token`). Any unauthenticated request is immediately rejected with **`401 Unauthorized`**.

2. **Strict University Tenant Boundary Enforcement:**  
   Users belonging to University A cannot view, modify, or manipulate URLs/IDs to access University B’s data. Cross-tenant tampering attempts are blocked with **`403 Forbidden`**.

3. **Global Super Admin:**  
   Users with the `Super Admin` role have cross-tenant oversight to create, view, and manage all universities.

---

## 🔑 Pre-Seeded Test Credentials

Password for all pre-seeded accounts: **`Admin@12345`**

| Role | Email | University |
| :--- | :--- | :--- |
| **Super Admin** | `superadmin@example.com` | Global (All Universities) |
| **University Admin** | `admin@gtu.edu` | Global Tech University (GTU) |
| **Faculty** | `turing@gtu.edu` | Global Tech University (GTU) |
| **Student** | `alice@gtu.edu` | Global Tech University (GTU) |

---

## 📁 Repository Layout

```text
llm/
├── backend/                    # Express REST API (Node.js)
│   ├── src/
│   │   ├── config/             # DB connection pool (MySQL2) & migrations
│   │   ├── controllers/        # Auth, Super Admin, University Admin controllers
│   │   ├── middlewares/        # JWT auth, RBAC, tenant isolation, centralized error handler
│   │   ├── routes/             # API endpoints
│   │   └── utils/              # Logger & input validators
│   ├── .env                    # Local environment config (DB: llm)
│   └── package.json
│
├── frontend/                   # React 19 + Vite Frontend
│   ├── public/                 # Static assets & logos
│   ├── src/                    # Pages (Login, Signup, ForgotPassword), App router
│   ├── vite.config.js          # Vite config (port 3000)
│   └── package.json
│
├── database/                   # Database scripts & documentation
│   ├── init.sql                # Table definitions (universities, users)
│   └── BACKUP_RESTORE.md       # Backup & restore operations guide
│
├── package.json                # Root monorepo workspace scripts
├── setup.js                    # One-command developer setup script
└── README.md                   # Project documentation
```
