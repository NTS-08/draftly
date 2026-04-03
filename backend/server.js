require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const admin = require('firebase-admin');
const cors = require('cors');
const Y = require('yjs');

const app = express();
app.use(cors());
app.use(express.json());

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Initialize Firebase Admin
// You need to download your service account key from Firebase Console
// and save it as serviceAccountKey.json in the backend folder
let firebaseInitialized = false;

try {
  // Try to use environment variables first (for production deployment)
  if (process.env.FIREBASE_PRIVATE_KEY) {
    const serviceAccount = {
      type: process.env.FIREBASE_TYPE || 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
      token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    };
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    firebaseInitialized = true;
    console.log('✅ Firebase Admin initialized with environment variables (production mode)');
  } else {
    // Fall back to service account file (for local development)
    const serviceAccount = require('./serviceAccountKey.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
    firebaseInitialized = true;
    console.log('✅ Firebase Admin initialized with service account file (development mode)');
  }
} catch (error) {
  console.error('❌ Error initializing Firebase Admin:', error.message);
  console.log('\n⚠️  IMPORTANT: Please follow these steps to set up Firebase:\n');
  console.log('1. Go to: https://console.firebase.google.com/');
  console.log('2. Select project: draftly-abe2c');
  console.log('3. Click gear icon ⚙️  → Project settings');
  console.log('4. Go to "Service accounts" tab');
  console.log('5. Click "Generate new private key"');
  console.log('6. Save the downloaded file as: backend/serviceAccountKey.json');
  console.log('\nFor detailed instructions, see: backend/GET_SERVICE_KEY.md\n');
  
  // Initialize with minimal config for development (no database access)
  try {
    admin.initializeApp({
      projectId: 'draftly-abe2c',
    });
    console.log('⚠️  Running in LIMITED mode (no database access)');
    console.log('   Real-time collaboration will work, but documents won\'t be saved.\n');
  } catch (initError) {
    console.error('Failed to initialize Firebase in limited mode:', initError.message);
  }
}

const db = firebaseInitialized ? admin.firestore() : null;
const activeDocs = new Map();

// Middleware to verify Firebase token
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split('Bearer ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// REST API endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Get user documents
app.get('/api/documents', verifyToken, async (req, res) => {
  if (!firebaseInitialized || !db) {
    return res.status(503).json({ error: 'Database not available. Please configure Firebase.' });
  }
  
  try {
    const userId = req.user.uid;
    const documentsRef = db.collection('documents');
    const snapshot = await documentsRef
      .where('owner', '==', userId)
      .orderBy('updatedAt', 'desc')
      .get();

    const documents = [];
    snapshot.forEach(doc => {
      documents.push({
        id: doc.id,
        ...doc.data(),
        data: undefined, // Don't send binary data in list
      });
    });

    res.json({ documents });
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.status(500).json({ error: 'Failed to fetch documents' });
  }
});

// Get user documents by user ID (no auth required for now)
app.get('/api/documents/user/:userId', async (req, res) => {
  if (!firebaseInitialized || !db) {
    console.log('Firebase not initialized, returning empty array');
    return res.json([]); // Return empty array if Firebase not configured
  }
  
  try {
    const userId = req.params.userId;
    console.log('Fetching documents for user:', userId);
    
    const documentsRef = db.collection('documents');
    
    // Get documents owned by user
    let ownedSnapshot;
    try {
      ownedSnapshot = await documentsRef
        .where('owner', '==', userId)
        .orderBy('updatedAt', 'desc')
        .get();
    } catch (indexError) {
      console.log('Index not found, querying without orderBy');
      ownedSnapshot = await documentsRef
        .where('owner', '==', userId)
        .get();
    }

    // Get user's email from Firebase Auth
    let userEmail = null;
    try {
      const userRecord = await admin.auth().getUser(userId);
      userEmail = userRecord.email;
    } catch (error) {
      console.log('Could not fetch user email:', error.message);
    }

    const documents = [];
    
    // Add owned documents
    ownedSnapshot.forEach(doc => {
      const data = doc.data();
      console.log('Found owned document:', doc.id, data.title);
      documents.push({
        id: doc.id,
        title: data.title || 'Untitled document',
        lastModified: data.updatedAt?.toDate().toISOString() || data.createdAt?.toDate().toISOString() || new Date().toISOString(),
        owner: data.owner,
        isOwner: true,
      });
    });

    // Get documents shared with user (by email)
    if (userEmail) {
      let sharedSnapshot;
      try {
        sharedSnapshot = await documentsRef
          .where('collaborators', 'array-contains', userEmail)
          .orderBy('updatedAt', 'desc')
          .get();
      } catch (indexError) {
        console.log('Index not found for shared docs, querying without orderBy');
        sharedSnapshot = await documentsRef
          .where('collaborators', 'array-contains', userEmail)
          .get();
      }

      sharedSnapshot.forEach(doc => {
        const data = doc.data();
        // Don't add if already in list (user is owner)
        if (data.owner !== userId) {
          console.log('Found shared document:', doc.id, data.title);
          documents.push({
            id: doc.id,
            title: data.title || 'Untitled document',
            lastModified: data.updatedAt?.toDate().toISOString() || data.createdAt?.toDate().toISOString() || new Date().toISOString(),
            owner: data.owner,
            isOwner: false,
            sharedWith: true,
          });
        }
      });
    }

    // Sort by lastModified in JavaScript if we couldn't use orderBy
    documents.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified));

    console.log(`Returning ${documents.length} documents (owned + shared)`);
    res.json(documents);
  } catch (error) {
    console.error('Error fetching documents:', error);
    res.json([]); // Return empty array on error
  }
});

// Update document title
app.put('/api/documents/:documentId/title', async (req, res) => {
  if (!firebaseInitialized || !db) {
    return res.status(503).json({ error: 'Database not available' });
  }
  
  try {
    const { documentId } = req.params;
    const { title } = req.body;
    
    const docRef = db.collection('documents').doc(documentId);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    await docRef.update({
      title: title || 'Untitled document',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    res.json({ success: true, title });
  } catch (error) {
    console.error('Error updating title:', error);
    res.status(500).json({ error: 'Failed to update title' });
  }
});

// Delete document
app.delete('/api/documents/:documentId', async (req, res) => {
  if (!firebaseInitialized || !db) {
    return res.status(503).json({ error: 'Database not available' });
  }
  
  try {
    const { documentId } = req.params;
    
    const docRef = db.collection('documents').doc(documentId);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    await docRef.delete();
    
    // Remove from active documents if it's currently open
    if (activeDocs.has(documentId)) {
      activeDocs.delete(documentId);
    }
    
    console.log(`✅ Document ${documentId} deleted`);
    res.json({ success: true, message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// Get document by ID
app.get('/api/documents/:documentId', async (req, res) => {
  if (!firebaseInitialized || !db) {
    return res.json({ title: 'Untitled document' });
  }
  
  try {
    const { documentId } = req.params;
    const docRef = db.collection('documents').doc(documentId);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      return res.json({ title: 'Untitled document' });
    }
    
    const data = docSnap.data();
    res.json({ 
      title: data.title || 'Untitled document',
      owner: data.owner,
      collaborators: data.collaborators || []
    });
  } catch (error) {
    console.error('Error fetching document:', error);
    res.json({ title: 'Untitled document' });
  }
});

// Get document collaborators
app.get('/api/documents/:documentId/collaborators', async (req, res) => {
  if (!firebaseInitialized || !db) {
    return res.json({ collaborators: [] });
  }
  
  try {
    const { documentId } = req.params;
    const docRef = db.collection('documents').doc(documentId);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    const data = docSnap.data();
    res.json({ collaborators: data.collaborators || [] });
  } catch (error) {
    console.error('Error fetching collaborators:', error);
    res.json({ collaborators: [] });
  }
});

// Share document with user (creates pending invitation)
app.post('/api/documents/:documentId/share', async (req, res) => {
  if (!firebaseInitialized || !db) {
    return res.status(503).json({ error: 'Database not available' });
  }
  
  try {
    const { documentId } = req.params;
    const { email, documentTitle, sharedBy } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const docRef = db.collection('documents').doc(documentId);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    const data = docSnap.data();
    const collaborators = data.collaborators || [];
    const pendingInvites = data.pendingInvites || [];
    
    if (collaborators.includes(email)) {
      return res.status(400).json({ error: 'User already has access' });
    }
    
    if (pendingInvites.includes(email)) {
      return res.status(400).json({ error: 'Invitation already sent' });
    }
    
    // Add to pending invites instead of collaborators
    pendingInvites.push(email);
    
    await docRef.update({
      pendingInvites,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    // Create notification
    const notificationData = {
      type: 'share_invite',
      documentId,
      documentTitle: documentTitle || 'Untitled document',
      fromEmail: sharedBy,
      toEmail: email,
      status: 'pending',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    
    const notifRef = await db.collection('notifications').add(notificationData);
    
    console.log(`✅ Invitation sent to ${email} for document ${documentId}`);
    console.log(`📧 Notification created with ID: ${notifRef.id}`);
    console.log(`   From: ${sharedBy}`);
    console.log(`   To: ${email}`);
    console.log(`   Document: "${documentTitle}"`);
    
    res.json({ 
      success: true, 
      collaborators,
      pendingInvites,
      message: `Invitation sent to ${email}. They will receive a notification to accept.`
    });
  } catch (error) {
    console.error('Error sharing document:', error);
    res.status(500).json({ error: 'Failed to share document' });
  }
});

// Get user notifications
app.get('/api/notifications/:userEmail', async (req, res) => {
  if (!firebaseInitialized || !db) {
    return res.json([]);
  }
  
  try {
    const { userEmail } = req.params;
    console.log('Fetching notifications for:', userEmail);
    
    let snapshot;
    try {
      // Try with orderBy first
      snapshot = await db.collection('notifications')
        .where('toEmail', '==', userEmail)
        .where('status', '==', 'pending')
        .orderBy('createdAt', 'desc')
        .get();
    } catch (indexError) {
      console.log('Index not found, querying without orderBy');
      // If index doesn't exist, query without orderBy
      snapshot = await db.collection('notifications')
        .where('toEmail', '==', userEmail)
        .where('status', '==', 'pending')
        .get();
    }
    
    const notifications = [];
    snapshot.forEach(doc => {
      console.log('Found notification:', doc.id, doc.data());
      notifications.push({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate().toISOString(),
      });
    });
    
    // Sort in JavaScript if we couldn't use orderBy
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    console.log(`Returning ${notifications.length} notifications`);
    res.json(notifications);
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.json([]);
  }
});

// Accept share invitation
app.post('/api/notifications/:notificationId/accept', async (req, res) => {
  if (!firebaseInitialized || !db) {
    return res.status(503).json({ error: 'Database not available' });
  }
  
  try {
    const { notificationId } = req.params;
    const notifRef = db.collection('notifications').doc(notificationId);
    const notifSnap = await notifRef.get();
    
    if (!notifSnap.exists) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    const notifData = notifSnap.data();
    const { documentId, toEmail } = notifData;
    
    // Update document to add collaborator
    const docRef = db.collection('documents').doc(documentId);
    const docSnap = await docRef.get();
    
    if (docSnap.exists) {
      const data = docSnap.data();
      const collaborators = data.collaborators || [];
      const pendingInvites = (data.pendingInvites || []).filter(email => email !== toEmail);
      
      if (!collaborators.includes(toEmail)) {
        collaborators.push(toEmail);
      }
      
      await docRef.update({
        collaborators,
        pendingInvites,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
    
    // Update notification status
    await notifRef.update({
      status: 'accepted',
      acceptedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    console.log(`✅ ${toEmail} accepted invitation for document ${documentId}`);
    res.json({ success: true, message: 'Invitation accepted' });
  } catch (error) {
    console.error('Error accepting invitation:', error);
    res.status(500).json({ error: 'Failed to accept invitation' });
  }
});

// Reject share invitation
app.post('/api/notifications/:notificationId/reject', async (req, res) => {
  if (!firebaseInitialized || !db) {
    return res.status(503).json({ error: 'Database not available' });
  }
  
  try {
    const { notificationId } = req.params;
    const notifRef = db.collection('notifications').doc(notificationId);
    const notifSnap = await notifRef.get();
    
    if (!notifSnap.exists) {
      return res.status(404).json({ error: 'Notification not found' });
    }
    
    const notifData = notifSnap.data();
    const { documentId, toEmail } = notifData;
    
    // Remove from pending invites
    const docRef = db.collection('documents').doc(documentId);
    const docSnap = await docRef.get();
    
    if (docSnap.exists) {
      const data = docSnap.data();
      const pendingInvites = (data.pendingInvites || []).filter(email => email !== toEmail);
      
      await docRef.update({
        pendingInvites,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    }
    
    // Update notification status
    await notifRef.update({
      status: 'rejected',
      rejectedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    console.log(`❌ ${toEmail} rejected invitation for document ${documentId}`);
    res.json({ success: true, message: 'Invitation rejected' });
  } catch (error) {
    console.error('Error rejecting invitation:', error);
    res.status(500).json({ error: 'Failed to reject invitation' });
  }
});

// Remove collaborator
app.delete('/api/documents/:documentId/collaborators', async (req, res) => {
  if (!firebaseInitialized || !db) {
    return res.status(503).json({ error: 'Database not available' });
  }
  
  try {
    const { documentId } = req.params;
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }
    
    const docRef = db.collection('documents').doc(documentId);
    const docSnap = await docRef.get();
    
    if (!docSnap.exists) {
      return res.status(404).json({ error: 'Document not found' });
    }
    
    const data = docSnap.data();
    const collaborators = (data.collaborators || []).filter(collab => collab !== email);
    
    await docRef.update({
      collaborators,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    
    console.log(`✅ Removed ${email} from document ${documentId}`);
    res.json({ success: true, collaborators });
  } catch (error) {
    console.error('Error removing collaborator:', error);
    res.status(500).json({ error: 'Failed to remove collaborator' });
  }
});

// Create new document
app.post('/api/documents', verifyToken, async (req, res) => {
  if (!firebaseInitialized || !db) {
    return res.status(503).json({ error: 'Database not available. Please configure Firebase.' });
  }
  
  try {
    const userId = req.user.uid;
    const { title } = req.body;

    const docRef = db.collection('documents').doc();
    const docData = {
      title: title || 'Untitled document',
      owner: userId,
      collaborators: [userId],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      data: Buffer.from(''),
    };

    await docRef.set(docData);

    res.json({ 
      id: docRef.id,
      ...docData,
      data: undefined,
    });
  } catch (error) {
    console.error('Error creating document:', error);
    res.status(500).json({ error: 'Failed to create document' });
  }
});

// Socket.IO for real-time collaboration
io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('join-document', async (data) => {
    const { documentId, token } = data;

    try {
      // Verify user token
      let userId = null;
      if (token) {
        try {
          const decodedToken = await admin.auth().verifyIdToken(token);
          userId = decodedToken.uid;
        } catch (error) {
          console.error('Invalid token:', error.message);
        }
      }

      socket.join(documentId);

      if (!activeDocs.has(documentId)) {
        // Load document from Firestore
        const ydoc = new Y.Doc();

        if (firebaseInitialized && db) {
          try {
            const docRef = db.collection('documents').doc(documentId);
            const docSnap = await docRef.get();

            if (docSnap.exists) {
              const docData = docSnap.data();
              if (docData.data && docData.data.length > 0) {
                Y.applyUpdate(ydoc, docData.data);
              }
            } else {
              // Create new document if it doesn't exist
              await docRef.set({
                title: 'Untitled document',
                owner: userId || 'anonymous',
                collaborators: userId ? [userId] : [],
                createdAt: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp(),
                data: Buffer.from(''),
              });
            }
          } catch (dbError) {
            console.error('Database error (document will not be saved):', dbError.message);
          }
        } else {
          console.log('⚠️  Document will not be saved (Firebase not configured)');
        }

        activeDocs.set(documentId, { ydoc, clients: 1 });
        
        ydoc.on('update', () => {
          if (firebaseInitialized && db) {
            saveDocumentToFirestore(documentId, ydoc);
          }
        });
      } else {
        activeDocs.get(documentId).clients++;
      }

      const docObj = activeDocs.get(documentId);
      
      // Send initial state to the client
      const stateVector = Y.encodeStateAsUpdate(docObj.ydoc);
      socket.emit('sync-update', stateVector);

      socket.on('sync-update', (update) => {
        Y.applyUpdate(docObj.ydoc, new Uint8Array(update));
        socket.to(documentId).emit('sync-update', update);
      });

      socket.on('awareness-update', (update) => {
        socket.to(documentId).emit('awareness-update', update);
      });

      socket.on('disconnect', () => {
        if (activeDocs.has(documentId)) {
          const docInfo = activeDocs.get(documentId);
          docInfo.clients--;
          if (docInfo.clients <= 0) {
            activeDocs.delete(documentId);
          }
        }
      });
    } catch (error) {
      console.error('Error joining document:', error);
      socket.emit('error', { message: 'Failed to join document' });
    }
  });
});

const saveTimeouts = new Map();
function saveDocumentToFirestore(documentId, ydoc) {
  if (!firebaseInitialized || !db) {
    return; // Skip saving if Firebase is not configured
  }
  
  if (saveTimeouts.has(documentId)) {
    clearTimeout(saveTimeouts.get(documentId));
  }
  saveTimeouts.set(documentId, setTimeout(async () => {
    try {
      const state = Y.encodeStateAsUpdate(ydoc);
      const docRef = db.collection('documents').doc(documentId);
      
      await docRef.update({
        data: Buffer.from(state),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      
      console.log(`✅ Document ${documentId} saved to Firestore`);
    } catch (error) {
      console.error('❌ Error saving document:', error.message);
    }
    saveTimeouts.delete(documentId);
  }, 2000));
}

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready for connections`);
  
  if (!firebaseInitialized) {
    console.log('\n⚠️  WARNING: Firebase not fully configured');
    console.log('   - Real-time collaboration: ✅ Working');
    console.log('   - Document persistence: ❌ Not working');
    console.log('   - Authentication: ❌ Not working');
    console.log('\n   See backend/GET_SERVICE_KEY.md to complete setup\n');
  } else {
    console.log('\n✅ All systems operational!\n');
  }
});
