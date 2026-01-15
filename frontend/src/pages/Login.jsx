import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Grid,
  Link,
  useMediaQuery,
  useTheme
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../context/AuthContext';

function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await login(formData.email, formData.password);
      } else {
        result = await register(formData.name, formData.email, formData.password);
      }

      if (result.success) {
        navigate('/');
      } else {
        setError(result.error || 'Authentication failed');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container sx={{ minHeight: '100vh' }}>
      {/* Left Side - Brand / Visual */}
      {!isMobile && (
        <Grid item md={6} lg={5} sx={{ 
          bgcolor: '#4F46E5', 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center',
          p: 8,
          color: 'white',
          position: 'relative',
          overflow: 'hidden'
        }}>
          {/* Abstract background shapes */}
          <Box sx={{
            position: 'absolute',
            top: -100,
            left: -100,
            width: 400,
            height: 400,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.05)'
          }} />
          <Box sx={{
            position: 'absolute',
            bottom: -50,
            right: -50,
            width: 300,
            height: 300,
            borderRadius: '50%',
            bgcolor: 'rgba(255,255,255,0.05)'
          }} />

          <Box sx={{ position: 'relative', zIndex: 1 }}>
            <Box sx={{ 
              width: 56, 
              height: 56, 
              bgcolor: 'white', 
              color: '#4F46E5', 
              borderRadius: 3, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.75rem',
              mb: 4
            }}>
              P
            </Box>
            <Typography variant="h3" sx={{ fontWeight: 800, mb: 2 }}>
              Smart Procurement Simplified.
            </Typography>
            <Typography variant="h6" sx={{ opacity: 0.8, fontWeight: 400 }}>
              Join thousands of companies automating their RFP process with the power of AI.
            </Typography>
          </Box>
        </Grid>
      )}

      {/* Right Side - Form */}
      <Grid item xs={12} md={6} lg={7} sx={{ 
        bgcolor: '#FFFFFF', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        p: 2
      }}>
        <Box sx={{ width: '100%', maxWidth: 420, p: 2 }}>
          {isMobile && (
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box sx={{ 
                width: 36, 
                height: 36, 
                bgcolor: '#4F46E5', 
                color: 'white', 
                borderRadius: 1.5, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontWeight: 700
              }}>
                P
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 700, color: '#111827' }}>
                ProcureAI
              </Typography>
            </Box>
          )}

          <Typography variant="h4" sx={{ fontWeight: 700, color: '#111827', mb: 1 }}>
            {isLogin ? 'Welcome back' : 'Create an account'}
          </Typography>
          <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
            {isLogin ? 'Please enter your details to sign in.' : 'Start your 14-day free trial today.'}
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600, color: '#374151' }}>
                  Full Name
                </Typography>
                <TextField
                  fullWidth
                  placeholder="John Doe"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PersonIcon sx={{ color: '#9CA3AF' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
                />
              </Box>
            )}

            <Box sx={{ mb: 2.5 }}>
              <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600, color: '#374151' }}>
                Email
              </Typography>
              <TextField
                fullWidth
                placeholder="name@company.com"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon sx={{ color: '#9CA3AF' }} />
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="subtitle2" sx={{ mb: 0.5, fontWeight: 600, color: '#374151' }}>
                Password
              </Typography>
              <TextField
                fullWidth
                placeholder="••••••••"
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={handleChange}
                required
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: '#9CA3AF' }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
              />
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                bgcolor: '#4F46E5',
                '&:hover': { bgcolor: '#4338CA' },
                py: 1.5,
                borderRadius: 1.5,
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '1rem',
                boxShadow: 'none',
                mb: 3
              }}
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </Button>

            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <Link
                  component="button"
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  sx={{
                    color: '#4F46E5',
                    fontWeight: 600,
                    textDecoration: 'none',
                    '&:hover': { textDecoration: 'underline' }
                  }}
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </Link>
              </Typography>
            </Box>
          </form>
        </Box>
      </Grid>
    </Grid>
  );
}

export default Login;
