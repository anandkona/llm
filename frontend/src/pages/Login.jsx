
import React, { useState } from "react";

import {
  Container,
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  FormControlLabel,
  Checkbox,
  Link,
  Alert,
} from "@mui/material";

import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
} from "@mui/icons-material";

import "./Login.css";

function Login({ onNavigate, onLoginSuccess }) {  
  // Store email and password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Login feedback
  const [message, setMessage] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Handle login form submission
  const handleLogin = async (event) => {
    event.preventDefault();

    if (!email || !password) {
      setErrorMsg("Please enter your email and password.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setMessage("");

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email.trim(), password })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Login failed. Please check your credentials.');
        return;
      }

      setMessage("Logged in successfully! Redirecting...");
      if (onLoginSuccess) {
        onLoginSuccess();
      } else if (onNavigate) {
        onNavigate("dashboard");
      }
    } catch (err) {
      setErrorMsg("Unable to reach server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container
      maxWidth={false}
      className="login-container"
    >
      <Paper elevation={6} className="login-card">

        <Box className="login-header">

          {/* Company Logo Centered */}
          <Box className="company-logo" sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', mb: 2 }}>
            <img
              src="/logo.jpg"
              alt="Agnes IT Solutions Logo"
              style={{ display: 'block', margin: '0 auto', maxWidth: 120, height: 'auto', borderRadius: 8 }}
            />
          </Box>

          <Typography variant="h4" fontWeight="bold" textAlign="center">
            Welcome Back!
          </Typography>

          <Typography variant="body2" color="text.secondary" textAlign="center">
            Please sign in to continue
          </Typography>
        </Box>

        <Box
          component="form"
          onSubmit={handleLogin}
          className="login-form"
        >

          {/* Email Field */}
          <TextField
            fullWidth
            label="Email Address"
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Email sx={{ color: "#1a2b55" }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          {/* Password Field */}
          <TextField
            fullWidth
            label="Password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock sx={{ color: "#1a2b55" }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword(!showPassword)}
                      edge="end"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          {/* Forgot Password link aligned right */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%', mt: -1 }}>
            <Link
              component="button"
              type="button"
              underline="hover"
              onClick={() => onNavigate ? onNavigate("forgot") : null}
              sx={{ fontSize: '0.875rem' }}
            >
              Forgot Password?
            </Link>
          </Box>

          {/* Login Feedback */}
          {errorMsg && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMsg}
            </Alert>
          )}
          {message && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {message}
            </Alert>
          )}

          {/* Login Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            className="login-button"
          >
            {loading ? "Signing In..." : "Sign In"}
          </Button>

          {/* Registration Link Centered */}
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', mt: 2 }}>
            <Typography
              variant="body2"
              textAlign="center"
              sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
            >
              Don't have an account?{" "}
              <Link
                component="button"
                type="button"
                underline="hover"
                sx={{ fontWeight: 'bold' }}
                onClick={() => onNavigate ? onNavigate("signup") : null}
              >
                Sign Up
              </Link>
            </Typography>
          </Box>

        </Box>
      </Paper>
    </Container>
  );
}

export default Login;
