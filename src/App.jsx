import { useState } from "react";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import "./App.css";

function App() {
  const [currentPage, setCurrentPage] = useState("login");

  return (
    <div className="app">
      {currentPage === "login" && (
        <Login onNavigate={setCurrentPage} />
      )}
      {currentPage === "signup" && (
        <Signup onNavigate={setCurrentPage} />
      )}
      {currentPage === "forgot" && (
        <ForgotPassword onNavigate={setCurrentPage} />
      )}
    </div>
  );
}

export default App;
