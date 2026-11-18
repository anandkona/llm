
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

function Login() {  
  // Store email and password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);

  // Remember me
  const [rememberMe, setRememberMe] = useState(false);

  // Login feedback
  const [message, setMessage] = useState("");

  // Handle login form submission
  const handleLogin = (event) => {
    event.preventDefault();

    if (!email || !password) {
      setMessage("Please enter your email and password.");
      return;
    }

    setMessage("Login form submitted successfully!");
  };

  return (
    <Container
      maxWidth={false}
      className="login-container"
    >
      <Paper elevation={6} className="login-card">

        <Box className="login-header">

          {/* Company Logo */}
          <Box className="company-logo">
            <img
              src="/logo.jpg"
              alt="Agnes IT Solutions Logo"
            />
          </Box>

          <Typography variant="h4" fontWeight="bold">
            Welcome Back!
          </Typography>

          <Typography variant="body2" color="text.secondary">
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

          {/* Remember Me */}
          <Box className="login-options">
            <FormControlLabel
              control={
                <Checkbox
                  checked={rememberMe}
                  onChange={(e) =>
                    setRememberMe(e.target.checked)
                  }
                />
              }
              label="Remember me"
            />

            <Link href="#" underline="hover">
              Forgot Password?
            </Link>
          </Box>

          {/* Login Feedback */}
          {message && (
            <Alert severity="info">
              {message}
            </Alert>
          )}

          {/* Login Button */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            size="large"
            className="login-button"
          >
            Sign In
          </Button>

          {/* Registration Link */}
          <Typography
            variant="body2"
            textAlign="center"
            className="register-text"
          >
            Don't have an account?{" "}
            <Link href="#" underline="hover">
              Sign Up
            </Link>
          </Typography>

        </Box>
      </Paper>
    </Container>
  );
}

export default Login;
