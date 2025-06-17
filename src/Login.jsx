import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './Components/AuthContext';
import { getApiUrl } from './config.js';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    // Check if we're returning from OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    
    if (code && state) {
      handleOAuthCallback(code, state);
    }
  }, []);

  const handleOAuthCallback = async (code, state) => {
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get(getApiUrl('auth/google/callback'), {
        params: { code, state },
        withCredentials: true
      });
      
      if (response.data?.user) {
        login(response.data.user);
        navigate('/app', { replace: true });
      }
    } catch (err) {
      console.error('OAuth callback error:', err);
      setError(err.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      if (!email) {
        setError('Email is required');
        setLoading(false);
        return;
      }

      // Validate email domain
      const domain = email.split('@')[1]?.toLowerCase();
      if (!domain || !['gmail.com', 'bajajearths.com'].includes(domain)) {
        setError('Please use a valid Gmail or Bajaj Earths email address');
        setLoading(false);
        return;
      }

      const response = await axios.post(
        getApiUrl('auth/google'),
        { email: email.trim() },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          withCredentials: true
        }
      );

      if (response.data?.auth_url) {
        // Redirect to Google OAuth page
        window.location.href = response.data.auth_url;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      if (err.response?.status === 400) {
        setError(err.response.data.error);
      } else if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else if (!err.response) {
        setError('Unable to connect to the server. Please try again.');
      } else {
        setError('An error occurred during login. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Login with Google</h2>
      {error && <div className="error-message">{error}</div>}
      <form onSubmit={handleGoogleLogin}>
        <div className="form-group">
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            required
            placeholder="Enter your Gmail or Bajaj Earths email"
          />
        </div>
        <button type="submit" disabled={loading} className="login-button">
          {loading ? 'Logging in...' : 'Continue with Google'}
        </button>
      </form>
    </div>
  );
}

export default Login;