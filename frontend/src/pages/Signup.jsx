import React, { useState } from "react";
import {
  Container,
  Paper,
  Box,
  Typography,
  TextField,
  Button,
  InputAdornment,
  IconButton,
  Link,
  Alert,
  CircularProgress
} from "@mui/material";
import {
  Person,
  Email,
  Phone,
  Lock,
  Visibility,
  VisibilityOff
} from "@mui/icons-material";
import "./Login.css";

function Signup({ onNavigate }) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: ""
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          full_name: formData.fullName.trim(),
          email: formData.email.trim(),
          phone: formData.phone.trim(),
          password: formData.password,
          role: "Student"
        })
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Registration failed. Please try again.");
        return;
      }

      setSuccess("Account registered successfully! Redirecting to login...");
      setTimeout(() => {
        if (onNavigate) onNavigate("login");
      }, 1500);
    } catch (err) {
      setError("Network error occurred. Please verify backend server is running.");
    } finally {
      setLoading(false);
    }
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
            Create Your Account
          </Typography>

          <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 0.5 }}>
            Register to access the LMS Portal
          </Typography>
        </Box>

        {/* Signup Form */}
        <Box component="form" onSubmit={handleSubmit} className="login-form">
          <TextField
            fullWidth
            label="Full Name"
            name="fullName"
            placeholder="Enter your full name"
            value={formData.fullName}
            onChange={handleChange}
            required
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Person sx={{ color: "#1a2b55" }} />
                  </InputAdornment>
                )
              }
            }}
          />

          <TextField
            fullWidth
            label="Email Address"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
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

          <TextField
            fullWidth
            label="Phone Number"
            type="tel"
            name="phone"
            placeholder="Enter your phone number"
            value={formData.phone}
            onChange={handleChange}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Phone sx={{ color: "#1a2b55" }} />
                  </InputAdornment>
                )
              }
            }}
          />

          <TextField
            fullWidth
            label="Password"
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Create your password"
            value={formData.password}
            onChange={handleChange}
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
                )
              }
            }}
          />

          <TextField
            fullWidth
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={handleChange}
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
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      edge="end"
                      aria-label="Toggle password visibility"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }
            }}
          />

          {error && <Alert severity="error">{error}</Alert>}
          {success && <Alert severity="success">{success}</Alert>}

          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            disabled={loading}
            className="login-button"
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : "Create Account"}
          </Button>

          {/* Centered Sign In Link */}
          <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", mt: 1 }}>
            <Typography variant="body2" textAlign="center" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              Already have an account?{" "}
              <Link
                component="button"
                type="button"
                underline="hover"
                sx={{ fontWeight: "bold" }}
                onClick={() => (onNavigate ? onNavigate("login") : null)}
              >
                Sign In
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
}

export default Signup;
