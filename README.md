# Draftly 📝

A real-time collaborative document editor built with React, Node.js, Firebase, and Socket.IO. Create, edit, and share documents with seamless real-time collaboration.

![Draftly](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## ✨ Features

- **Real-time Collaboration** - Multiple users can edit the same document simultaneously
- **User Authentication** - Secure login with Email/Password or Google
- **Document Sharing** - Share documents with collaborators via email invitation
- **Auto-save** - Documents are automatically saved as you type
- **Rich Text Editing** - Full-featured text editor with formatting options
- **Conflict-free Editing** - Uses Yjs CRDT for conflict-free collaborative editing
- **User Profiles** - Manage your account and view your documents
- **Notifications** - Get notified when someone shares a document with you
- **Modern UI** - Clean, intuitive interface inspired by Google Docs

## 🚀 Tech Stack

### Frontend
- **React** - UI framework
- **Vite** - Build tool and dev server
- **Firebase Authentication** - User authentication
- **Firestore** - Cloud database
- **Quill** - Rich text editor
- **Yjs** - CRDT for collaborative editing
- **Socket.IO Client** - Real-time communication
- **React Router** - Client-side routing

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Socket.IO** - WebSocket server for real-time sync
- **Firebase Admin SDK** - Server-side Firebase integration
- **Yjs** - CRDT document synchronization

## 📋 Prerequisites

- Node.js 18+ and npm
- Firebase account
- Git

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/draftly.git
cd draftly
```

### 2. Set up Frontend

```bash
cd frontend
npm install
cp .env.example .env
```

Edit `frontend/.env` with your Firebase configuration.

### 3. Set up Backend

```bash
cd backend
npm install
cp .env.example .env
```

Add your Firebase service account key as `backend/serviceAccountKey.json`.

See [backend/GET_SERVICE_KEY.md](backend/GET_SERVICE_KEY.md) for instructions.

### 4. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
node server.js
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Visit `http://localhost:5173` in your browser.



## 🚢 Deployment

Deploy your app in minutes:

**Recommended Stack:**
- Frontend: Netlify (Free)
- Backend: Render (Free)


## 📖 Usage

### Creating Documents
1. Sign up or log in
2. Click the "+" button or "Create document"
3. Start typing - your document auto-saves

### Sharing Documents
1. Open a document
2. Click the "Share" button
3. Enter collaborator's email
4. They'll receive a notification to accept

### Real-time Collaboration
1. Share a document with someone
2. Both users can edit simultaneously
3. Changes appear instantly for all users

## 🏗️ Project Structure

```
draftly/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/           # Page components
│   │   ├── css/             # Stylesheets
│   │   ├── firebase/        # Firebase config
│   │   └── main.jsx         # Entry point
│   ├── public/              # Static assets
│   └── package.json
│
├── backend/                  # Node.js backend
│   ├── server.js            # Express + Socket.IO server
│   ├── package.json
│   └── serviceAccountKey.json  # Firebase admin (not in git)
│
├── README.md
├── DEPLOYMENT.md
├── ENV_SETUP.md
└── QUICK_DEPLOY.md
```

## 🔒 Security

- Environment variables for sensitive data
- Firebase Authentication for user management
- Firestore security rules for data access
- Service account credentials not committed to git
- CORS configuration for API security

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👨‍💻 Author

**Semozhix**
- Website: [semozhix.in](https://semozhix.in)

## 🙏 Acknowledgments

- Inspired by Google Docs
- Built with Firebase
- Real-time sync powered by Yjs
- UI components styled with custom CSS

## 📞 Support

For support, email support@semozhix.in or open an issue on GitHub.

## 🗺️ Roadmap

- [ ] Offline mode support
- [ ] Document templates
- [ ] Export to PDF/Word
- [ ] Comments and suggestions
- [ ] Version history
- [ ] Mobile app
- [ ] Dark mode
- [ ] Markdown support

## 🤖 AI Tools Used

This project was developed with assistance from the following AI tools:

- **Kiro AI** - AI-powered IDE assistant for code generation, debugging, deployment configuration, and project scaffolding
- **Claude (Anthropic)** - Used through Kiro AI for intelligent code suggestions and problem-solving

### AI Assistance Disclosure

AI tools were used throughout the development process for:
- Code generation and refactoring
- Bug fixing and debugging
- Deployment configuration (Netlify, Render, Railway)
- Documentation writing
- UI/UX improvements
- Environment setup and configuration
- Firebase integration
- Real-time collaboration implementation

All AI-generated code was reviewed, tested, and modified as needed to ensure quality and functionality.

---

Made with ❤️ by [Semozhix](https://semozhix.in)
