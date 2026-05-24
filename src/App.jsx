import { useState } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import ResumeBuilder from './components/ResumeBuilder';
import ResumeViewer from './components/ResumeViewer';
import Dashboard from './components/Dashboard';

// ----------------------------------------------------------------------
// 1. YOUR EXISTING AUTH COMPONENT (Unchanged logic, just added navigate)
// ----------------------------------------------------------------------
function AuthScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true); 
  const [message, setMessage] = useState({ text: '', type: '' });
  
  const navigate = useNavigate(); // <-- NEW: Allows us to change pages

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setMessage({ text: '', type: '' }); 

    if (isLogin) {
      // --- THE EXISTING LOGIN API CALL ---
      try {
        const response = await axios.post('http://localhost:8080/api/auth/login', {
          email: email,
          password: password
        });
        
        const token = response.data;
        
        // Save the VIP Pass in the browser's local storage so we don't lose it on refresh!
        localStorage.setItem('jwt_token', token);
        
        // --- NEW: Redirect to the builder page on success ---
        navigate('/resume-builder');

        // Inside handleSubmit of AuthScreen:
        localStorage.setItem('jwt_token', token);
        navigate('/dashboard'); // <-- Change this line!
        
      } catch (error) {
        setMessage({ text: "Invalid email or password", type: 'error' });
      }
    } else {
      // --- THE EXISTING REGISTER API CALL ---
      try {
        const response = await axios.post('http://localhost:8080/api/auth/register', {
          email: email,
          password: password
        });
        setMessage({ text: 'Account created successfully! You can now log in.', type: 'success' });
        setEmail('');    
        setPassword(''); 
        setIsLogin(true); // Switch back to login view automatically
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

// ----------------------------------------------------------------------
// 2. 

// ----------------------------------------------------------------------
// 3. THE MAIN APP ROUTER (Controls traffic)
// ----------------------------------------------------------------------
function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthScreen />} />

        <Route path="/dashboard" element={<Dashboard />} /> {/* <-- Add this! */}
        
        {/* WE REPLACED THE PLACEHOLDER WITH THE REAL COMPONENT */}
{/* Notice the optional /:id at the end */}
        <Route path="/resume-builder/:id?" element={<ResumeBuilder />} />        
        <Route path="*" element={<Navigate to="/" replace />} />

        <Route path="/resume-viewer/:id" element={<ResumeViewer />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;