 import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useState, useEffect } from 'react';
import { FileText, Menu, Search, Grid3x3, List, MoreVertical, Clock, Plus, Trash2, X } from 'lucide-react';
import { auth, API_URL } from '../firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import NotificationBell from '../components/NotificationBell';
import '../css/LandingPage.css';

export default function LandingPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userDocs, setUserDocs] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [showDocMenu, setShowDocMenu] = useState(null);
  const [deletingDoc, setDeletingDoc] = useState(null);
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [selectionMode, setSelectionMode] = useState(false);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list' - grid is default

  useEffect(() => {
    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('Auth state:', currentUser ? 'Logged in' : 'Not logged in');
      setUser(currentUser);
      setLoading(false);
      
      // Fetch user documents when logged in
      if (currentUser) {
        fetchUserDocuments(currentUser.uid);
      } else {
        setUserDocs([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Refresh documents when page becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        fetchUserDocuments(user.uid);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  const fetchUserDocuments = async (userId) => {
    setLoadingDocs(true);
    try {
      console.log('Fetching documents for user:', userId);
      const response = await fetch(`${API_URL}/api/documents/user/${userId}`);
      if (response.ok) {
        const docs = await response.json();
        console.log('Received documents:', docs);
        setUserDocs(docs);
      } else {
        console.error('Failed to fetch documents, status:', response.status);
        setUserDocs([]);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
      setUserDocs([]);
    }
    setLoadingDocs(false);
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
      if (showDocMenu && !event.target.closest('.doc-menu-container')) {
        setShowDocMenu(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu, showDocMenu]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleCreateDocument = () => {
    if (!user) {
      navigate('/signup');
      return;
    }
    const newDocId = uuidv4();
    navigate(`/doc/${newDocId}`);
  };

  const handleOpenDocument = (docId) => {
    navigate(`/doc/${docId}`);
  };

  const handleDeleteDocument = async (docId, docTitle) => {
    if (!confirm(`Are you sure you want to delete "${docTitle}"?`)) {
      return;
    }

    setDeletingDoc(docId);
    try {
      const response = await fetch(`${API_URL}/api/documents/${docId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove document from local state
        setUserDocs(userDocs.filter(doc => doc.id !== docId));
        setShowDocMenu(null);
      } else {
        alert('Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document');
    }
    setDeletingDoc(null);
  };

  const toggleDocMenu = (e, docId) => {
    e.stopPropagation();
    setShowDocMenu(showDocMenu === docId ? null : docId);
  };

  const toggleSelection = (e, docId) => {
    e.stopPropagation();
    setSelectedDocs(prev => 
      prev.includes(docId) 
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode);
    setSelectedDocs([]);
  };

  const selectAll = () => {
    if (selectedDocs.length === userDocs.length) {
      setSelectedDocs([]);
    } else {
      setSelectedDocs(userDocs.map(doc => doc.id));
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedDocs.length === 0) return;

    const count = selectedDocs.length;
    if (!confirm(`Are you sure you want to delete ${count} document${count > 1 ? 's' : ''}?`)) {
      return;
    }

    setDeletingDoc('multiple');
    try {
      // Delete all selected documents
      const deletePromises = selectedDocs.map(docId =>
        fetch(`${API_URL}/api/documents/${docId}`, {
          method: 'DELETE',
        })
      );

      await Promise.all(deletePromises);

      // Remove deleted documents from local state
      setUserDocs(userDocs.filter(doc => !selectedDocs.includes(doc.id)));
      setSelectedDocs([]);
      setSelectionMode(false);
    } catch (error) {
      console.error('Error deleting documents:', error);
      alert('Failed to delete some documents');
    }
    setDeletingDoc(null);
  };

  const handleDocumentClick = (docId) => {
    if (selectionMode) {
      setSelectedDocs(prev => 
        prev.includes(docId) 
          ? prev.filter(id => id !== docId)
          : [...prev, docId]
      );
    } else {
      navigate(`/doc/${docId}`);
    }
  };

  return (
    <div className="landing-container">
      {/* Header */}
      <header className="landing-header">
        <div className="landing-header-content">
          <button className="menu-button">
            <Menu style={{ width: '24px', height: '24px', color: '#374151' }} />
          </button>
          <div className="logo">
            <img src="/logo.png" alt="Draftly" style={{ width: '48px', height: '48px', marginRight: '8px' }} />
            <span className="logo-text">Draftly</span>
          </div>
          
          <div className="header-right">
            {user && <NotificationBell userEmail={user.email} />}
            {user ? (
              <div className="user-menu-container">
                <div 
                  className="avatar" 
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  title={user.email}
                >
                  {user.photoURL ? (
                    <img src={user.photoURL} alt={user.email} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    user.email ? user.email.charAt(0).toUpperCase() : 'U'
                  )}
                </div>
                {showUserMenu && (
                  <div className="user-dropdown">
                    <div className="user-info">
                      <div className="user-email">{user.email}</div>
                      <div className="user-id">User ID: {user.uid.substring(0, 8)}...</div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <button className="dropdown-item" onClick={() => navigate('/profile')}>
                      My Profile
                    </button>
                    <button className="dropdown-item" onClick={handleLogout}>
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button className="login-btn" onClick={() => navigate('/login')}>
                Sign in
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading...</p>
          </div>
        ) : !user ? (
          /* Not Logged In - Show Sign Up Prompt */
          <div className="signup-prompt">
            <div className="signup-card">
              <div className="signup-icon">
                <img src="/logo.png" alt="Draftly" style={{ width: '80px', height: '80px' }} />
              </div>
              <h2 className="signup-title">Welcome to Draftly</h2>
              <p className="signup-description">
                Create, edit, and collaborate on documents in real-time with your team.
              </p>
              <div className="signup-actions">
                <button className="signup-button-primary" onClick={() => navigate('/signup')}>
                  Create account
                </button>
                <button className="signup-button-secondary" onClick={() => navigate('/login')}>
                  Sign in
                </button>
              </div>
              <div className="signup-features">
                <div className="feature-item">
                  <div className="feature-icon">✓</div>
                  <span>Real-time collaboration</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">✓</div>
                  <span>Auto-save & sync</span>
                </div>
                <div className="feature-item">
                  <div className="feature-icon">✓</div>
                  <span>Share with anyone</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Logged In - Show Documents */
          <>
            {/* Recent Documents */}
            <section>
              <div className="docs-header">
                <div className="docs-header-left">
                  <h2 className="docs-header-title">My Documents</h2>
                  {userDocs.length > 0 && (
                    <button 
                      className="selection-toggle-button"
                      onClick={toggleSelectionMode}
                    >
                      {selectionMode ? 'Cancel' : 'Select'}
                    </button>
                  )}
                </div>
                <div className="view-buttons">
                  {selectionMode && selectedDocs.length > 0 && (
                    <div className="selection-actions">
                      <span className="selection-count">
                        {selectedDocs.length} selected
                      </span>
                      <button 
                        className="delete-selected-button"
                        onClick={handleDeleteSelected}
                        disabled={deletingDoc === 'multiple'}
                      >
                        <Trash2 style={{ width: '16px', height: '16px' }} />
                        <span>{deletingDoc === 'multiple' ? 'Deleting...' : 'Delete'}</span>
                      </button>
                    </div>
                  )}
                  {selectionMode && (
                    <button 
                      className="select-all-button"
                      onClick={selectAll}
                    >
                      {selectedDocs.length === userDocs.length ? 'Deselect All' : 'Select All'}
                    </button>
                  )}
                  <button 
                    className={`view-button ${viewMode === 'grid' ? 'active' : ''}`}
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid3x3 style={{ width: '20px', height: '20px', color: viewMode === 'grid' ? '#2563eb' : '#6b7280' }} />
                  </button>
                  <button 
                    className={`view-button ${viewMode === 'list' ? 'active' : ''}`}
                    onClick={() => setViewMode('list')}
                  >
                    <List style={{ width: '20px', height: '20px', color: viewMode === 'list' ? '#2563eb' : '#6b7280' }} />
                  </button>
                </div>
              </div>

              {/* Document List or Grid */}
              {loadingDocs ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading documents...</p>
                </div>
              ) : userDocs.length === 0 ? (
                <div className="empty-state">
                  <FileText style={{ width: '48px', height: '48px', color: '#9ca3af' }} />
                  <p className="empty-state-title">No documents yet</p>
                  <p className="empty-state-description">Create your first document to get started</p>
                  <button className="empty-state-button" onClick={handleCreateDocument}>
                    <Plus style={{ width: '16px', height: '16px' }} />
                    <span>Create document</span>
                  </button>
                </div>
              ) : viewMode === 'grid' ? (
                <div className="docs-grid">
                  {userDocs.map((doc) => (
                    <div 
                      key={doc.id} 
                      className={`doc-card ${selectedDocs.includes(doc.id) ? 'selected' : ''}`}
                      onClick={() => handleDocumentClick(doc.id)}
                    >
                      {selectionMode && (
                        <div className="doc-card-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedDocs.includes(doc.id)}
                            onChange={(e) => toggleSelection(e, doc.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      )}
                      <div className="doc-card-preview">
                        <FileText style={{ width: '48px', height: '48px', color: '#9ca3af' }} />
                      </div>
                      <div className="doc-card-info">
                        <span className="doc-card-title">
                          {doc.title || 'Untitled document'}
                        </span>
                        {!doc.isOwner && doc.sharedWith && (
                          <span className="shared-badge-small">Shared with me</span>
                        )}
                        <span className="doc-card-time">
                          {formatDate(doc.lastModified)}
                        </span>
                      </div>
                      {!selectionMode && doc.isOwner && (
                        <div className="doc-card-menu">
                          <button 
                            className="more-button" 
                            onClick={(e) => toggleDocMenu(e, doc.id)}
                            disabled={deletingDoc === doc.id}
                          >
                            <MoreVertical style={{ width: '20px', height: '20px', color: '#6b7280' }} />
                          </button>
                          {showDocMenu === doc.id && (
                            <div className="doc-dropdown">
                              <button 
                                className="doc-dropdown-item delete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteDocument(doc.id, doc.title);
                                }}
                                disabled={deletingDoc === doc.id}
                              >
                                <Trash2 style={{ width: '16px', height: '16px' }} />
                                <span>{deletingDoc === doc.id ? 'Deleting...' : 'Delete'}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="docs-list">
                  {userDocs.map((doc) => (
                    <div 
                      key={doc.id} 
                      className={`doc-row ${selectedDocs.includes(doc.id) ? 'selected' : ''} ${selectionMode ? 'selection-mode' : ''}`}
                      onClick={() => handleDocumentClick(doc.id)}
                    >
                      {selectionMode && (
                        <div className="doc-checkbox">
                          <input
                            type="checkbox"
                            checked={selectedDocs.includes(doc.id)}
                            onChange={(e) => toggleSelection(e, doc.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      )}
                      <div className="doc-icon">
                        <FileText style={{ width: '16px', height: '16px', color: 'white' }} />
                      </div>
                      <div className="doc-content">
                        <span className="doc-name">
                          {doc.title || 'Untitled document'}
                          {!doc.isOwner && doc.sharedWith && (
                            <span className="shared-badge">Shared with me</span>
                          )}
                        </span>
                      </div>
                      <div className="doc-meta">
                        <span className="doc-time">
                          <Clock style={{ width: '16px', height: '16px' }} />
                          {formatDate(doc.lastModified)}
                        </span>
                      </div>
                      {!selectionMode && doc.isOwner && (
                        <div className="doc-menu-container">
                          <button 
                            className="more-button" 
                            onClick={(e) => toggleDocMenu(e, doc.id)}
                            disabled={deletingDoc === doc.id}
                          >
                            <MoreVertical style={{ width: '20px', height: '20px', color: '#6b7280' }} />
                          </button>
                          {showDocMenu === doc.id && (
                            <div className="doc-dropdown">
                              <button 
                                className="doc-dropdown-item delete"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteDocument(doc.id, doc.title);
                                }}
                                disabled={deletingDoc === doc.id}
                              >
                                <Trash2 style={{ width: '16px', height: '16px' }} />
                                <span>{deletingDoc === doc.id ? 'Deleting...' : 'Delete'}</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2025 <a href="https://semozhix.in" target="_blank" rel="noopener noreferrer">semozhix</a>. All rights reserved.</p>
      </footer>

      {/* Floating Add Document Button */}
      {user && (
        <button 
          className="floating-add-button" 
          onClick={handleCreateDocument}
          title="Create new document"
        >
          <Plus style={{ width: '24px', height: '24px' }} />
        </button>
      )}
    </div>
  );
}
