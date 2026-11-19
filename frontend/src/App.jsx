import { useState, useEffect } from "react";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import { apiFetch } from "./services/api.js";
import "./App.css";

function App() {
  const [currentPage, setCurrentPage] = useState("login");
  const [currentUser, setCurrentUser] = useState(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check current session on load
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await apiFetch('/api/auth/me');
        const data = await res.json();
        if (res.ok && data.success && data.user) {
          setCurrentUser(data.user);
          setCurrentPage("dashboard");
        }
      } catch (err) {
        // Not logged in
      } finally {
        setCheckingAuth(false);
      }
    }
    checkSession();
  }, []);

  const handleLoginSuccess = async () => {
    try {
      const res = await apiFetch('/api/auth/me');
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setCurrentUser(data.user);
        setCurrentPage("dashboard");
      }
    } catch (e) {
      setCurrentPage("dashboard");
    }
  };

  const handleLogout = async () => {
    try {
      await apiFetch('/api/auth/logout', { method: 'POST' });
    } catch (e) {}
    localStorage.removeItem('auth_token');
    setCurrentUser(null);
    setCurrentPage("login");
  };

  if (checkingAuth) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', fontFamily: 'sans-serif' }}>
        Loading LMS Portal...
      </div>
    );
  }

  return (
    <div className="app">
      {currentPage === "login" && (
        <Login
          onNavigate={setCurrentPage}
          onLoginSuccess={handleLoginSuccess}
        />
      )}
      {currentPage === "signup" && (
        <Signup onNavigate={setCurrentPage} />
      )}
      {currentPage === "forgot" && (
        <ForgotPassword onNavigate={setCurrentPage} />
      )}
      {currentPage === "dashboard" && (
        <AdminDashboard
          user={currentUser}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;
