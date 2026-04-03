import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe } from 'lucide-react';
import { signupWithEmail, loginWithGoogle } from '../firebase/auth';
import '../css/LoginPage.css';

export default function SignUpPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!name) {
      newErrors.name = 'Name is required';
    }
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setLoading(true);
      const { user, error } = await signupWithEmail(email, password);
      setLoading(false);

      if (error) {
        // Show user-friendly error messages
        let errorMessage = error;
        if (error.includes('email-already-in-use')) {
          errorMessage = 'This email is already registered. Please sign in instead.';
        } else if (error.includes('weak-password')) {
          errorMessage = 'Password is too weak. Please use a stronger password.';
        } else if (error.includes('invalid-email')) {
          errorMessage = 'Invalid email address';
        }
        setErrors({ general: errorMessage });
      } else {
        console.log('Sign up successful:', user);
        // Small delay to ensure auth state is updated
        setTimeout(() => {
          navigate('/');
        }, 100);
      }
    }
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    const { user, error } = await loginWithGoogle();
    setLoading(false);

    if (error) {
      let errorMessage = error;
      if (error.includes('popup-closed')) {
        errorMessage = 'Sign-in popup was closed';
      } else if (error.includes('popup-blocked')) {
        errorMessage = 'Please allow popups for this site';
      }
      setErrors({ general: errorMessage });
    } else {
      console.log('Google sign up successful:', user);
      setTimeout(() => {
        navigate('/');
      }, 100);
    }
  };

  return (
    <div className="login-container">
      {/* Header */}
      <header className="login-header">
        <div className="login-logo">
          <img src="/logo.png" alt="Draftly" style={{ width: '40px', height: '40px', marginRight: '8px' }} />
          <span className="login-logo-text">Draftly</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="login-main">
        <div className="login-card">
          <h1 className="login-title">Create your account</h1>
          <p className="login-subtitle">to continue to Draftly</p>

          <form className="login-form" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="form-error-general">{errors.general}</div>
            )}
            
            <div className="form-group">
              <label htmlFor="name" className="form-label">Full Name</label>
              <input
                id="name"
                type="text"
                className="form-input"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors({ ...errors, name: '' });
                }}
              />
              {errors.name && <span className="form-error">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email" className="form-label">Email</label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: '' });
                }}
              />
              {errors.email && <span className="form-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password" className="form-label">Password</label>
              <input
                id="password"
                type="password"
                className="form-input"
                placeholder="Create a password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: '' });
                }}
              />
              {errors.password && <span className="form-error">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
              <input
                id="confirmPassword"
                type="password"
                className="form-input"
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: '' });
                }}
              />
              {errors.confirmPassword && <span className="form-error">{errors.confirmPassword}</span>}
            </div>

            <div className="login-actions">
              <a href="/login" className="create-account-link">Already have an account?</a>
              <button type="submit" className="login-button" disabled={loading}>
                {loading ? 'Creating...' : 'Sign Up'}
              </button>
            </div>
          </form>

          <div className="divider">or</div>

          <div className="social-login">
            <button className="social-button" onClick={handleGoogleSignup} disabled={loading}>
              <svg className="social-icon" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span>Sign up with Google</span>
            </button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="login-footer">
        <div className="footer-links">
          <a href="#" className="footer-link">Help</a>
          <a href="#" className="footer-link">Privacy</a>
          <a href="#" className="footer-link">Terms</a>
        </div>
        <div className="language-selector">
          <Globe style={{ width: '16px', height: '16px' }} />
          <select className="language-select">
            <option>English (United States)</option>
            <option>Español</option>
            <option>Français</option>
            <option>Deutsch</option>
          </select>
        </div>
      </footer>
    </div>
  );
}
