
import { useState } from "react";
import "./ForgotPassword.css";

function ForgotPassword({ onNavigate }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (email.trim() === "") {
      setError("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    setSubmitted(true);
  };

  const handleEmailChange = (event) => {
    setEmail(event.target.value);
    setError("");
  };

  return (
    <div className="forgot-container">
      <div className="forgot-card">

        <img
          src="/Agnes%20logo.jpg"
          alt="Agnes IT Solutions Logo"
          className="company-logo"
        />


        <h2>Forgot Password?</h2>

        <p className="description">
          Enter your registered email address to reset
          your password.
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit}>

            <label>Email Address</label>

            <input
              type="text"
              placeholder="Enter your email"
              value={email}
              onChange={handleEmailChange}
            />

            {error && (
              <p className="error-message">{error}</p>
            )}

            <button type="submit">
              Send Reset Link
            </button>

          </form>
        ) : (
          <div className="success-message">
            <h3>Request Submitted!</h3>
            <p>
              If an account exists for {email},
              password reset instructions will be sent.
            </p>
          </div>
        )}

        <button
          type="button"
          onClick={() => onNavigate ? onNavigate("login") : null}
          className="back-link"
          style={{ background: "none", border: "none", color: "#1976d2", textDecoration: "underline", cursor: "pointer", font: "inherit", display: "inline-block", marginTop: "1rem" }}
        >
          ← Back to Login
        </button>

      </div>
    </div>
  );
}

export default ForgotPassword;
