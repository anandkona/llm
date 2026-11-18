# LLM LMS Application

A full-stack enterprise web application built with a modern **React 19 + Vite** frontend, an **Express.js** REST API backend, and a **MySQL** database.

---

## 📁 Project Architecture

```text
llm/
├── frontend/                   # Frontend Application (React 19 + Vite)
│   ├── public/                 # Static public assets & logos
│   ├── src/                    # UI Components, Pages, and Styles
│   │   ├── assets/             # Media & SVG icons
│   │   ├── pages/              # Login, Signup, ForgotPassword
│   │   ├── App.jsx             # Root layout & page router
│   │   ├── main.jsx            # React root mount
│   │   └── index.css           # Global typography & layout styles
│   ├── index.html              # HTML5 template
│   ├── vite.config.js          # Vite config & dev server
│   └── package.json
│
├── backend/                    # Backend API (Node.js + Express)
│   ├── src/
│   │   ├── config/             # Database connection pool (MySQL2)
│   │   │   └── db.js
│   │   ├── routes/             # Express API route controllers
│   │   │   └── health.routes.js
│   │   └── server.js           # Express app bootstrap, CORS, & security middleware
│   ├── .env                    # Environment configuration (ignored from git)
│   ├── .env.example            # Environment template
│   └── package.json
│
├── database/                   # Database Schemas & Migrations
│   └── init.sql                # SQL initialization script for MySQL
│
├── .gitignore                  # Global Git ignore rules (secrets & builds)
└── README.md                   # System documentation
```

---

## 🛠️ Tech Stack

- **Frontend:** React 19, Vite, Material-UI (MUI), Emotion, Plain CSS
- **Backend:** Node.js, Express.js, MySQL2 (Connection Pool), CORS, Helmet, Morgan
- **Database:** MySQL 8.x / MariaDB (phpMyAdmin)

---

## 🚀 Local Development Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v18+)
- [XAMPP](https://www.apachefriends.org/) or local [MySQL](https://www.mysql.com/) server running on port `3306`

---

### 1. Database Setup

1. Start Apache & MySQL from your XAMPP Control Panel.
2. Verify or open the database in phpMyAdmin:
   - [http://localhost/phpmyadmin/index.php?route=/database/structure&db=llm](http://localhost/phpmyadmin/index.php?route=/database/structure&db=llm)
3. Ensure the database `llm` exists. You can initialize the base tables by importing:
   ```text
   database/init.sql
   ```

---

### 2. Backend Setup (`backend/`)

1. Open a terminal and navigate to `backend/`:
   ```bash
   cd backend
   ```
2. Set up your `.env` file (copied from `.env.example`):
   ```env
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000

   # MySQL Database Configuration
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=llm
   DB_CONNECTION_LIMIT=10
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the backend in development mode:
   ```bash
   npm run dev
   ```
   - API Server: [http://localhost:5000](http://localhost:5000)
   - Health Check: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

### 3. Frontend Setup (`frontend/`)

1. Open another terminal and navigate to `frontend/`:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   - Frontend Application: [http://localhost:3000](http://localhost:3000)

---

## 🔒 Security Best Practices

- `.env` files are strictly excluded from source control via `.gitignore`.
- Production builds (`dist/`, `build/`) and dependencies (`node_modules/`) are ignored across both workspaces.
- Always use `.env.example` as a template for team onboarding.
