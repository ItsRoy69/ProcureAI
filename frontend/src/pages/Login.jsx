import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { VisibilityIcon, VisibilityOffIcon, EmailIcon, LockIcon, PersonIcon } from '../components/Icons';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../components/UIComponents';
import './Login.css';

function Login() {
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
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
    <div className="login-container">
      {/* Left Side - Brand */}
      {!isMobile && (
        <div className="login-brand">
          <div className="login-brand-bg-1"></div>
          <div className="login-brand-bg-2"></div>
          
          <div className="login-brand-content">
            <div className="login-brand-logo">P</div>
            <h1 className="login-brand-title">Smart Procurement Simplified.</h1>
            <p className="login-brand-subtitle">
              Join thousands of companies automating their RFP process with the power of AI.
            </p>
          </div>
        </div>
      )}

      {/* Right Side - Form */}
      <div className="login-form-container">
        <div className="login-form-wrapper">
          {isMobile && (
            <div className="login-mobile-header">
              <div className="login-mobile-logo">P</div>
              <h2 className="login-mobile-title">ProcureAI</h2>
            </div>
          )}

          <h2 className="login-title">
            {isLogin ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="login-subtitle">
            {isLogin ? 'Please enter your details to sign in.' : 'Start your 14-day free trial today.'}
          </p>

          {error && (
            <Alert type="error" onClose={() => setError('')}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label className="label">Full Name</label>
                <div className="input-group">
                  <PersonIcon width={20} height={20} className="input-icon" />
                  <input
                    className="input input-with-icon"
                    placeholder="John Doe"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required={!isLogin}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <label className="label">Email</label>
              <div className="input-group">
                <EmailIcon width={20} height={20} className="input-icon" />
                <input
                  className="input input-with-icon"
                  placeholder="name@company.com"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Password</label>
              <div className="input-group">
                <LockIcon width={20} height={20} className="input-icon" />
                <input
                  className="input input-with-icon"
                  style={{ paddingRight: '2.5rem' }}
                  placeholder="••••••••"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="input-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <VisibilityOffIcon width={20} height={20} /> : <VisibilityIcon width={20} height={20} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full btn-lg"
              disabled={loading}
              style={{ marginBottom: '1.5rem' }}
            >
              {loading ? 'Please wait...' : (isLogin ? 'Sign In' : 'Create Account')}
            </button>

            <div style={{ textAlign: 'center' }}>
              <p className="text-sm text-gray-500">
                {isLogin ? "Don't have an account? " : "Already have an account? "}
                <button
                  type="button"
                  className="login-toggle-link"
                  onClick={() => setIsLogin(!isLogin)}
                >
                  {isLogin ? 'Sign up' : 'Sign in'}
                </button>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
