import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Quill from 'quill';
import QuillCursors from 'quill-cursors';
import * as Y from 'yjs';
import { QuillBinding } from 'y-quill';
import { Awareness } from 'y-protocols/awareness';
import { io } from 'socket.io-client';
import { Menu, Cloud, CloudOff, Lock, MoreVertical, X, UserPlus, Copy, Check } from 'lucide-react';
import { getCurrentUserToken } from '../firebase/auth';
import { auth } from '../firebase/config';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import 'quill/dist/quill.snow.css';
import '../css/EditorPage.css';

Quill.register('modules/cursors', QuillCursors);

const USER_COLORS = ['#f56565', '#ed8936', '#ecc94b', '#48bb78', '#38b2ac', '#4299e1', '#667eea', '#9f7aea', '#ed64a6'];

export default function EditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const editorContainerRef = useRef(null);
  const quillRef = useRef(null);
  const socketRef = useRef(null);
  const ydocRef = useRef(null);
  
  const [status, setStatus] = useState('connecting');
  const [activeUsers, setActiveUsers] = useState([]);
  const [docTitle, setDocTitle] = useState('Untitled document');
  const [user, setUser] = useState(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const titleTimeoutRef = useRef(null);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [collaborators, setCollaborators] = useState([]);
  const [shareLink, setShareLink] = useState('');
  const [linkCopied, setLinkCopied] = useState(false);
  const [shareLoading, setShareLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef(null);
  const [canEdit, setCanEdit] = useState(false);
  const [checkingPermissions, setCheckingPermissions] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showUserMenu && !event.target.closest('.user-menu-container')) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showUserMenu]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleTitleChange = (newTitle) => {
    setDocTitle(newTitle);
    
    // Debounce title save
    if (titleTimeoutRef.current) {
      clearTimeout(titleTimeoutRef.current);
    }
    
    titleTimeoutRef.current = setTimeout(() => {
      saveTitleToBackend(newTitle);
    }, 1000);
  };

  const saveTitleToBackend = async (title) => {
    try {
      const response = await fetch(`http://localhost:3001/api/documents/${id}/title`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title }),
      });
      
      if (response.ok) {
        console.log('Title saved successfully');
      }
    } catch (error) {
      console.error('Error saving title:', error);
    }
  };

  const fetchDocumentTitle = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/documents/${id}`);
      if (response.ok) {
        const data = await response.json();
        if (data.title) {
          setDocTitle(data.title);
        }
        
        // Check if user can edit
        if (user) {
          const isOwner = data.owner === user.uid;
          const isCollaborator = data.collaborators && data.collaborators.includes(user.email);
          setCanEdit(isOwner || isCollaborator);
        } else {
          setCanEdit(false);
        }
      }
    } catch (error) {
      console.error('Error fetching document title:', error);
    } finally {
      setCheckingPermissions(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDocumentTitle();
    }
  }, [id, user]);

  const fetchCollaborators = async () => {
    try {
      const response = await fetch(`http://localhost:3001/api/documents/${id}/collaborators`);
      if (response.ok) {
        const data = await response.json();
        setCollaborators(data.collaborators || []);
      }
    } catch (error) {
      console.error('Error fetching collaborators:', error);
    }
  };

  const handleShareDocument = async () => {
    if (!shareEmail.trim()) {
      alert('Please enter an email address');
      return;
    }

    setShareLoading(true);
    try {
      const response = await fetch(`http://localhost:3001/api/documents/${id}/share`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: shareEmail,
          documentTitle: docTitle,
          sharedBy: user.email
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setCollaborators(data.collaborators || []);
        setShareEmail('');
        alert(`Document shared with ${shareEmail}. They can now edit this document.`);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to share document');
      }
    } catch (error) {
      console.error('Error sharing document:', error);
      alert('Failed to share document');
    }
    setShareLoading(false);
  };

  const handleRemoveCollaborator = async (email) => {
    if (!confirm(`Remove ${email} from this document?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/documents/${id}/collaborators`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        const data = await response.json();
        setCollaborators(data.collaborators || []);
      } else {
        alert('Failed to remove collaborator');
      }
    } catch (error) {
      console.error('Error removing collaborator:', error);
      alert('Failed to remove collaborator');
    }
  };

  const copyShareLink = () => {
    const link = `${window.location.origin}/doc/${id}`;
    navigator.clipboard.writeText(link);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  useEffect(() => {
    if (showShareDialog) {
      fetchCollaborators();
      setShareLink(`${window.location.origin}/doc/${id}`);
    }
  }, [showShareDialog, id]);

  useEffect(() => {
    // Prevent multiple initializations
    if (quillRef.current || !editorContainerRef.current || !user || checkingPermissions) {
      return;
    }

    let cleanup = null;

    const initializeEditor = async () => {
      // Initialize Quill WITHOUT cursors module
      const quill = new Quill(editorContainerRef.current, {
        theme: 'snow',
        readOnly: !canEdit, // Make read-only if user can't edit
        modules: {
          toolbar: canEdit ? [
            [{ 'font': [] }],
            [{ 'size': ['small', false, 'large', 'huge'] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': [] }, { 'background': [] }],
            [{ 'script': 'sub'}, { 'script': 'super' }],
            [{ 'header': 1 }, { 'header': 2 }],
            ['blockquote', 'code-block'],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'list': 'check' }],
            [{ 'indent': '-1'}, { 'indent': '+1' }],
            [{ 'direction': 'rtl' }],
            [{ 'align': [] }],
            ['link', 'image', 'video'],
            ['clean']
          ] : false // No toolbar for read-only
        },
        placeholder: canEdit ? 'Start typing...' : 'This document is view-only',
      });
      quillRef.current = quill;

      // Initialize Yjs
      const ydoc = new Y.Doc();
      ydocRef.current = ydoc;
      const ytext = ydoc.getText('quill');
      
      const awareness = new Awareness(ydoc);
      const myColor = USER_COLORS[Math.floor(Math.random() * USER_COLORS.length)];
      
      // Use actual user email and ID for awareness
      const clientId = ydoc.clientID;
      awareness.setLocalStateField('user', {
        name: user.email || 'Anonymous',
        color: myColor,
        id: user.uid,
        clientId: clientId,
      });

      // Create binding WITHOUT awareness (no cursor tracking)
      const binding = new QuillBinding(ytext, quill);

      // Initialize socket
      const socket = io('http://localhost:3001', {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });
      socketRef.current = socket;

      socket.on('connect', async () => {
        setStatus('connected');
        const token = await getCurrentUserToken();
        socket.emit('join-document', { documentId: id, token });
      });

      socket.on('disconnect', () => {
        setStatus('disconnected');
      });

      socket.on('sync-update', (updateBuffer) => {
        Y.applyUpdate(ydoc, new Uint8Array(updateBuffer), 'socket');
      });

      ydoc.on('update', (update, origin) => {
        if (origin !== 'socket' && socket.connected) {
          // Show saving indicator
          setIsSaving(true);
          setStatus('saving');
          
          socket.emit('sync-update', update);
          
          // Clear previous timeout
          if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
          }
          
          // Set saved status after 1 second
          saveTimeoutRef.current = setTimeout(() => {
            setIsSaving(false);
            setStatus('connected');
          }, 1000);
        }
      });

      socket.on('awareness-update', (updateBuffer) => {
        import('y-protocols/awareness').then(({ applyAwarenessUpdate }) => {
          applyAwarenessUpdate(awareness, new Uint8Array(updateBuffer), 'socket');
        });
      });

      awareness.on('update', ({ added, updated, removed }, origin) => {
        if (origin !== 'socket' && socket.connected) {
          import('y-protocols/awareness').then(({ encodeAwarenessUpdate }) => {
            const update = encodeAwarenessUpdate(awareness, added.concat(updated).concat(removed));
            socket.emit('awareness-update', update);
          });
        }
        
        // Get unique users by ID, excluding current user
        const usersMap = new Map();
        awareness.getStates().forEach((state, stateClientId) => {
          if (state.user && state.user.id && stateClientId !== clientId) {
            usersMap.set(state.user.id, state.user);
          }
        });
        
        const users = Array.from(usersMap.values());
        setActiveUsers(users);
      });

      // Cleanup function
      cleanup = () => {
        // Clear awareness state before destroying
        awareness.setLocalStateField('user', null);
        awareness.destroy();
        binding.destroy();
        socket.disconnect();
        ydoc.destroy();
        quillRef.current = null;
      };
    };

    initializeEditor();

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [id, user, canEdit, checkingPermissions]);

  return (
    <div className="editor-container">
      <header className="editor-header">
        <div className="editor-header-content">
          <button onClick={() => navigate('/')} className="icon-button">
            <Menu style={{ width: '24px', height: '24px', color: '#374151' }} />
          </button>
          <img src="/logo.png" alt="Draftly" style={{ width: '48px', height: '48px', marginRight: '12px' }} />
          
          <div className="title-container">
            <input
              type="text"
              value={docTitle}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="title-input"
            />
            <div className="meta-bar">
              <div className={`status-badge ${status === 'disconnected' ? 'error' : ''}`}>
                {status === 'connected' ? (
                  <>
                    <Cloud style={{ width: '12px', height: '12px' }} />
                    <span>Saved to Drive</span>
                  </>
                ) : status === 'connecting' ? (
                  <>
                    <div className="status-dot"></div>
                    <span>Connecting...</span>
                  </>
                ) : (
                  <>
                    <CloudOff style={{ width: '12px', height: '12px' }} />
                    <span>Unable to save</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="editor-header-right">
            <div className="avatar-group">
              {activeUsers.slice(0, 3).map((u, i) => (
                <div 
                  key={i} 
                  className="user-avatar"
                  style={{ backgroundColor: u.color, zIndex: 3 - i }}
                  title={u.name}
                >
                  {u.name.charAt(0).toUpperCase()}
                </div>
              ))}
              {activeUsers.length > 3 && (
                <div className="user-avatar extra">
                  +{activeUsers.length - 3}
                </div>
              )}
            </div>

            <button className="share-button" onClick={() => setShowShareDialog(true)} disabled={!canEdit}>
              <Lock style={{ width: '16px', height: '16px' }} />
              <span>Share</span>
            </button>

            <button className="icon-button">
              <MoreVertical style={{ width: '20px', height: '20px', color: '#6b7280' }} />
            </button>

            {user ? (
              <div className="user-menu-container">
                <div 
                  className="profile-avatar" 
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
              <div className="profile-avatar">U</div>
            )}
          </div>
        </div>
      </header>

      <main className="editor-main">
        <div className="editor-wrapper">
          <div className="editor-paper">
            <div ref={editorContainerRef} style={{ height: '100%', minHeight: '1056px' }} />
          </div>
        </div>
      </main>

      {/* Share Dialog */}
      {showShareDialog && (
        <div className="share-overlay" onClick={() => setShowShareDialog(false)}>
          <div className="share-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="share-dialog-header">
              <h2 className="share-dialog-title">Share "{docTitle}"</h2>
              <button className="close-button" onClick={() => setShowShareDialog(false)}>
                <X style={{ width: '20px', height: '20px' }} />
              </button>
            </div>

            <div className="share-dialog-content">
              {/* Add People */}
              <div className="share-section">
                <label className="share-label">Add people</label>
                <div className="share-input-group">
                  <input
                    type="email"
                    className="share-input"
                    placeholder="Enter email address"
                    value={shareEmail}
                    onChange={(e) => setShareEmail(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleShareDocument()}
                  />
                  <button 
                    className="share-send-button"
                    onClick={handleShareDocument}
                    disabled={shareLoading || !shareEmail.trim()}
                  >
                    <UserPlus style={{ width: '16px', height: '16px' }} />
                    <span>{shareLoading ? 'Sharing...' : 'Share'}</span>
                  </button>
                </div>
              </div>

              {/* Collaborators List */}
              {collaborators.length > 0 && (
                <div className="share-section">
                  <label className="share-label">People with access</label>
                  <div className="collaborators-list">
                    {collaborators.map((collab, index) => (
                      <div key={index} className="collaborator-item">
                        <div className="collaborator-avatar">
                          {collab.charAt(0).toUpperCase()}
                        </div>
                        <div className="collaborator-info">
                          <span className="collaborator-email">{collab}</span>
                          <span className="collaborator-role">Can edit</span>
                        </div>
                        {collab !== user?.email && (
                          <button 
                            className="remove-button"
                            onClick={() => handleRemoveCollaborator(collab)}
                          >
                            <X style={{ width: '16px', height: '16px' }} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Share Link */}
              <div className="share-section">
                <label className="share-label">Share link</label>
                <div className="share-link-group">
                  <input
                    type="text"
                    className="share-link-input"
                    value={shareLink}
                    readOnly
                  />
                  <button 
                    className="copy-link-button"
                    onClick={copyShareLink}
                  >
                    {linkCopied ? (
                      <>
                        <Check style={{ width: '16px', height: '16px' }} />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy style={{ width: '16px', height: '16px' }} />
                        <span>Copy</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="share-link-note">
                  Anyone with the link can view this document (read-only)
                </p>
              </div>
            </div>

            <div className="share-dialog-footer">
              <button className="done-button" onClick={() => setShowShareDialog(false)}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
