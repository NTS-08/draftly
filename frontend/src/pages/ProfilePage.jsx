import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, ArrowLeft, User, Mail, Calendar, Shield, Edit2, Save, X } from 'lucide-react';
import { auth } from '../firebase/config';
import { onAuthStateChanged, updateProfile, updateEmail, updatePassword } from 'firebase/auth';
import '../css/ProfilePage.css';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setDisplayName(currentUser.displayName || '');
        setEmail(currentUser.email || '');
      } else {
        navigate('/login');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleSave = async () => {
    setMessage({ type: '', text: '' });
    setSaving(true);

    try {
      // Update display name
      if (displayName !== user.displayName) {
        await updateProfile(user, { displayName });
      }

      // Update email
      if (email !== user.email) {
        await updateEmail(user, email);
      }

      // Update password
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          setMessage({ type: 'error', text: 'Passwords do not match' });
          setSaving(false);
          return;
        }
        if (newPassword.length < 6) {
          setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
          setSaving(false);
          return;
        }
        await updatePassword(user, newPassword);
        setNewPassword('');
        setConfirmPassword('');
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setEditing(false);
      
      // Refresh user data
      await user.reload();
      setUser(auth.currentUser);
    } catch (error) {
      console.error('Error updating profile:', error);
      let errorMessage = 'Failed to update profile';
      
      if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'Please sign out and sign in again to update your profile';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already in use';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      }
      
      setMessage({ type: 'error', text: errorMessage });
    }

    setSaving(false);
  };

  const handleCancel = () => {
    setDisplayName(user.displayName || '');
    setEmail(user.email || '');
    setNewPassword('');
    setConfirmPassword('');
    setEditing(false);
    setMessage({ type: '', text: '' });
  };

  const getProviderName = (providerId) => {
    switch (providerId) {
      case 'google.com':
        return 'Google';
      case 'github.com':
        return 'GitHub';
      case 'password':
        return 'Email/Password';
      default:
        return providerId;
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <div className="loading-spinner"></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Header */}
      <header className="profile-header">
        <div className="profile-header-content">
          <button onClick={() => navigate('/')} className="back-button">
            <ArrowLeft style={{ width: '20px', height: '20px' }} />
            <span>Back to Home</span>
          </button>
          <div className="header-logo">
            <img src="/logo.png" alt="Draftly" style={{ width: '48px', height: '48px', marginRight: '8px' }} />
            <span className="logo-text">Draftly</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="profile-main">
        <div className="profile-card">
          <div className="profile-card-header">
            <h1 className="profile-title">My Profile</h1>
            {!editing && (
              <button className="edit-button" onClick={() => setEditing(true)}>
                <Edit2 style={{ width: '16px', height: '16px' }} />
                <span>Edit Profile</span>
              </button>
            )}
          </div>

          {message.text && (
            <div className={`message ${message.type}`}>
              {message.text}
            </div>
          )}

          <div className="profile-avatar-section">
            <div className="profile-avatar-large">
              {user?.photoURL ? (
                <img src={user.photoURL} alt={user.email} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                user?.email?.charAt(0).toUpperCase() || 'U'
              )}
            </div>
            <div className="profile-avatar-info">
              <h2>{user?.displayName || 'No name set'}</h2>
              <p>{user?.email}</p>
            </div>
          </div>

          <div className="profile-form">
            <div className="form-section">
              <h3 className="section-title">Personal Information</h3>
              
              <div className="form-group">
                <label className="form-label">
                  <User style={{ width: '16px', height: '16px' }} />
                  <span>Display Name</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={!editing}
                  placeholder="Enter your name"
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Mail style={{ width: '16px', height: '16px' }} />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!editing}
                  placeholder="Enter your email"
                />
              </div>

              {editing && user?.providerData?.[0]?.providerId === 'password' && (
                <>
                  <div className="form-group">
                    <label className="form-label">
                      <Shield style={{ width: '16px', height: '16px' }} />
                      <span>New Password (optional)</span>
                    </label>
                    <input
                      type="password"
                      className="form-input"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <Shield style={{ width: '16px', height: '16px' }} />
                      <span>Confirm New Password</span>
                    </label>
                    <input
                      type="password"
                      className="form-input"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                    />
                  </div>
                </>
              )}
            </div>

            <div className="form-section">
              <h3 className="section-title">Account Information</h3>
              
              <div className="info-row">
                <div className="info-label">
                  <Calendar style={{ width: '16px', height: '16px' }} />
                  <span>Account Created</span>
                </div>
                <div className="info-value">
                  {user?.metadata?.creationTime 
                    ? new Date(user.metadata.creationTime).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })
                    : 'Unknown'}
                </div>
              </div>

              <div className="info-row">
                <div className="info-label">
                  <Shield style={{ width: '16px', height: '16px' }} />
                  <span>Sign-in Method</span>
                </div>
                <div className="info-value">
                  {user?.providerData?.map(provider => getProviderName(provider.providerId)).join(', ')}
                </div>
              </div>

              <div className="info-row">
                <div className="info-label">
                  <User style={{ width: '16px', height: '16px' }} />
                  <span>User ID</span>
                </div>
                <div className="info-value info-value-mono">
                  {user?.uid}
                </div>
              </div>
            </div>

            {editing && (
              <div className="form-actions">
                <button className="cancel-button" onClick={handleCancel} disabled={saving}>
                  <X style={{ width: '16px', height: '16px' }} />
                  <span>Cancel</span>
                </button>
                <button className="save-button" onClick={handleSave} disabled={saving}>
                  <Save style={{ width: '16px', height: '16px' }} />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="profile-footer">
        <p>© 2025 <a href="https://semozhix.in" target="_blank" rel="noopener noreferrer">semozhix</a>. All rights reserved.</p>
      </footer>
    </div>
  );
}
