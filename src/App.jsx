import { useState } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import ResumeBuilder from './components/ResumeBuilder';
import ResumeViewer from './components/ResumeViewer';
import Dashboard from './components/Dashboard';

// Backend URL
const API_BASE_URL = import.meta.env.VITE_API_URL;
// Example:
// const API_BASE_URL = "http://localhost:8080";

function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (isLogin) {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/auth/login`,
          {
            email,
            password
          }
        );

        const token = response.data;

        // Save token
        localStorage.setItem('jwt_token', token);

        // Redirect
        navigate('/dashboard');

      } catch (error) {
        setMessage({
          text: "Invalid email or password",
          type: 'error'
        });
      }

    } else {

      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/auth/register`,
          {
            email,
            password
          }
        );

        setMessage({
          text: 'Account created successfully! You can now log in.',
          type: 'success'
        });

        setEmail('');
        setPassword('');
        setIsLogin(true);

      } catch (error) {
        setMessage({
          text: error.response?.data || "Server Error",
          type: 'error'
        });
      }
    }
  };

  return (
    <div className="auth-container">
      <h2 className="auth-title">
        {isLogin ? 'Welcome Back' : 'Create an Account'}
      </h2>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Email Address</label>

          <input
            type="email"
            className="auth-input"
            placeholder="developer@example.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Password</label>

          <input
            type="password"
            className="auth-input"
            placeholder="••••••••"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button type="submit" className="primary-button">
          {isLogin ? 'Sign In' : 'Register'}
        </button>
      </form>

      {message.text && (
        <div
          className={`status-message ${
            message.type === 'success'
              ? 'status-success'
              : 'status-error'
          }`}
        >
          {message.text}
        </div>
      )}

      <p className="toggle-text">
        {isLogin
          ? "Don't have an account? "
          : "Already have an account? "}

        <button
          className="toggle-link"
          onClick={() => {
            setIsLogin(!isLogin);
            setMessage({ text: '', type: '' });
          }}
        >
          {isLogin ? 'Sign up' : 'Log in'}
        </button>
      </p>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<AuthScreen />} />

        <Route path="/dashboard" element={<Dashboard />} />

        <Route
          path="/resume-builder/:id?"
          element={<ResumeBuilder />}
        />

        <Route
          path="/resume-viewer/:id"
          element={<ResumeViewer />}
        />

        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;