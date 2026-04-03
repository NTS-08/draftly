import { useEffect, useState } from 'react';
import { auth } from '../firebase/config';
import { onAuthStateChanged } from 'firebase/auth';

export default function TestAuth() {
  const [authState, setAuthState] = useState('checking...');
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log('Firebase Auth object:', auth);
    
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('Auth state changed:', currentUser);
      if (currentUser) {
        setAuthState('Logged in');
        setUser(currentUser);
      } else {
        setAuthState('Not logged in');
        setUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div style={{ padding: '40px', fontFamily: 'monospace' }}>
      <h1>Firebase Auth Test</h1>
      <div style={{ marginTop: '20px', padding: '20px', background: '#f0f0f0', borderRadius: '8px' }}>
        <p><strong>Auth State:</strong> {authState}</p>
        <p><strong>User Email:</strong> {user?.email || 'None'}</p>
        <p><strong>User ID:</strong> {user?.uid || 'None'}</p>
        <p><strong>Firebase Config:</strong> {auth.app.options.projectId}</p>
      </div>
      <div style={{ marginTop: '20px' }}>
        <a href="/login" style={{ color: 'blue', textDecoration: 'underline' }}>Go to Login</a>
        {' | '}
        <a href="/" style={{ color: 'blue', textDecoration: 'underline' }}>Go to Home</a>
      </div>
    </div>
  );
}
