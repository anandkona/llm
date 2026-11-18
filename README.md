# LLM Application

A full-stack web application with a modern React + Vite frontend, Express.js backend, and MySQL database.

---

## 📁 Repository Structure

```text
llm/
├── client/                     # Frontend (React 19 + Vite)
│   ├── public/                 # Static assets
│   ├── src/
│   │   ├── assets/             # Images, SVGs
│   │   ├── pages/              # Login, Signup, ForgotPassword
│   │   ├── App.jsx             # Main layout and routing
│   │   ├── main.jsx            # Entry point
│   │   └── index.css           # Global styles
│   ├── index.html              # HTML template
│   ├── vite.config.js          # Vite configuration
│   └── package.json
│
├── server/                     # Backend (Node.js + Express)
│   ├── src/
│   │   ├── config/             # DB connection pool (MySQL2)
│   │   │   └── db.js
│   │   ├── routes/             # API route handlers
│   │   │   └── health.routes.js
│   │   └── server.js           # Server entry point
│   ├── .env.example            # Environment template
│   └── package.json
│
├── database/                   # SQL Schemas & Migrations
│   └── init.sql                # Database initialization script
│
├── .gitignore                  # Global Git ignore rules
└── README.md                   # Project documentation
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [MySQL](https://www.mysql.com/) or [XAMPP](https://www.apachefriends.org/) running locally on port 3306

---

### 1. Database Setup

1. Start Apache & MySQL in your XAMPP Control Panel.
2. Open phpMyAdmin at [http://localhost/phpmyadmin](http://localhost/phpmyadmin).
3. Ensure the database `llm` exists, or run the initialization script located at:
   ```text
   database/init.sql
   ```

---

### 2. Backend Setup (`server/`)

1. Open a terminal and navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Copy the environment variables:
   ```bash
   cp .env.example .env
   ```
   *(Or copy `.env.example` to `.env` on Windows)*

3. Configure your `.env` settings:
   ```env
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:3000

   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=llm
   DB_CONNECTION_LIMIT=10
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend API will be available at [http://localhost:5000](http://localhost:5000).

6. Test the health check endpoint:
   - **URL:** [http://localhost:5000/api/health](http://localhost:5000/api/health)
   - **Expected response:**
     ```json
     {
       "status": "ok",
       "services": {
         "server": { "status": "up", "port": 5000 },
         "database": { "status": "connected", "database": "llm" }
       }
     }
     ```

---

### 3. Frontend Setup (`client/`)

1. Open a new terminal and navigate to the `client/` directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will run at [http://localhost:3000](http://localhost:3000).

---

## 🛡️ Security & Git Notes

- Environment files (`.env`, `.env*.local`) and build artifacts (`node_modules/`, `dist/`) are safely ignored in `.gitignore`.
- Always store sensitive keys, database credentials, and secrets exclusively inside `.env` files.
