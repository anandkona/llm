import React, { useState } from "react";
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  Link,
  Alert,
  CircularProgress
} from "@mui/material";
import { Email, ArrowBack } from "@mui/icons-material";
import "./Login.css";

function ForgotPassword({ onNavigate }) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (email.trim() === "") {
      setError("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    setLoading(true);

    // Simulate link dispatch / API integration
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 700);
  };

  return (
    <Container maxWidth={false} className="login-container">
      <Paper elevation={6} className="login-card">
        {/* Header with Centered Compact Logo */}
        <Box className="login-header" sx={{ textAlign: "center", mb: 3 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              width: "100%",
              mb: 2
            }}
          >
            <Box
              component="img"
              src="/logo.jpg"
              alt="Agnes IT Solutions Logo"
              sx={{
                width: 85,
                maxWidth: "100%",
                height: "auto",
                display: "block",
                mx: "auto",
                borderRadius: 2
              }}
            />
          </Box>

          <Typography variant="h4" fontWeight="bold" textAlign="center">
            Forgot Password?
          </Typography>

          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 0.5 }}>
            Enter your registered email address to receive password reset instructions.
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit} className="login-form">
          {!submitted ? (
            <>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                placeholder="Enter your registered email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
                required
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: "#1a2b55" }} />
                      </InputAdornment>
                    )
                  }
                }}
              />

              {error && <Alert severity="error">{error}</Alert>}

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                className="login-button"
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : "Send Reset Link"}
              </Button>
            </>
          ) : (
            <Alert severity="success" sx={{ py: 2 }}>
              <Typography variant="subtitle2" fontWeight="bold">
                Reset Request Dispatched!
              </Typography>
              <Typography variant="body2">
                If an account exists for <strong>{email}</strong>, you will receive password reset instructions shortly.
              </Typography>
            </Alert>
          )}

          {/* Centered Back to Login Link */}
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", mt: 1 }}>
            <Link
              component="button"
              type="button"
              underline="hover"
              sx={{ display: "flex", alignItems: "center", gap: 0.5, fontWeight: "bold" }}
              onClick={() => (onNavigate ? onNavigate("login") : null)}
            >
              <ArrowBack fontSize="small" /> Back to Sign In
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default ForgotPassword;
