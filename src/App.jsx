import { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import ResumeBuilder from './components/ResumeBuilder';
import ResumeViewer from './components/ResumeViewer';
import Dashboard from './components/Dashboard';
import PublicResumeViewer from './components/PublicResumeViewer';

const API_BASE_URL = import.meta.env.VITE_API_URL;

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
          { email, password }
        );

        const token = response.data;
        localStorage.setItem('jwt_token', token);
        navigate('/dashboard');

      } catch (error) {
        setMessage({ text: "Invalid email or password", type: 'error' });
      }

    } else {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/auth/register`,
          { email, password }
        );

        setMessage({ text: 'Account created successfully! You can now log in.', type: 'success' });
        setEmail('');
        setPassword('');
        setIsLogin(true);

      } catch (error) {
        setMessage({ text: error.response?.data || "Server Error", type: 'error' });
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
        <div className={`status-message ${message.type === 'success' ? 'status-success' : 'status-error'}`}>
          {message.text}
        </div>
      )}

      <p className="toggle-text">
        {isLogin ? "Don't have an account? " : "Already have an account? "}
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

  // --- MAXIMUM ANTI-SCREENSHOT & ANTI-COPY SCRIPT ---
  useEffect(() => {
    let isPrinting = false; // NEW FLAG

    const handleKeyDown = (e) => {
      // 1. Block PrintScreen Key
      if (e.key === 'PrintScreen') {
        navigator.clipboard.writeText(''); 
        document.body.style.opacity = '0'; 
        alert('Screenshots are disabled for security purposes.');
        setTimeout(() => { document.body.style.opacity = '1'; }, 500);
      }
      
      // 2. Block Advanced Keyboard Shortcuts (Ctrl/Cmd combos)
      if (e.ctrlKey || e.metaKey) {
        const key = e.key.toLowerCase();
        
        // Block basic Copy, Save, Source
        if (['s', 'c', 'u'].includes(key) && !e.shiftKey) {
          e.preventDefault();
        }
        
        // Block Advanced Browser Snip Tools (Ctrl+Shift+S, Ctrl+Shift+C, Ctrl+Shift+I)
        if (e.shiftKey && ['s', 'c', 'i'].includes(key)) {
          e.preventDefault();
        }
      }

      // 3. Block Developer Tools (F12)
      if (e.key === 'F12') e.preventDefault();
    };

    const handleContextMenu = (e) => e.preventDefault();

    const hideContent = () => {
      if (isPrinting) return; // FIX: Bypass security if printing
      document.body.style.filter = 'blur(20px)';
      document.body.style.opacity = '0'; 
    };

    const showContent = () => {
      document.body.style.filter = 'none';
      document.body.style.opacity = '1';
    };

    const handleVisibilityChange = () => {
      if (document.hidden && !isPrinting) hideContent();
      else showContent();
    };

    // --- PRINT INTERCEPTORS ---
    const handleBeforePrint = () => {
      isPrinting = true;
      showContent(); // Ensure screen is visible for PDF renderer
    };

    const handleAfterPrint = () => {
      isPrinting = false;
    };

    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    window.addEventListener('blur', hideContent);
    window.addEventListener('pagehide', hideContent);
    document.addEventListener('mouseleave', hideContent); 
    document.addEventListener('visibilitychange', handleVisibilityChange);

    window.addEventListener('focus', showContent);
    window.addEventListener('pageshow', showContent);
    document.addEventListener('mouseenter', showContent);

    window.addEventListener('keyup', handleKeyDown);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
      window.removeEventListener('blur', hideContent);
      window.removeEventListener('pagehide', hideContent);
      document.removeEventListener('mouseleave', hideContent);
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      window.removeEventListener('focus', showContent);
      window.removeEventListener('pageshow', showContent);
      document.removeEventListener('mouseenter', showContent);

      window.removeEventListener('keyup', handleKeyDown);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthScreen />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/resume-builder/:id?" element={<ResumeBuilder />} />
        <Route path="/resume-viewer/:id" element={<ResumeViewer />} />
        <Route path="/v/:shareCode" element={<PublicResumeViewer />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;