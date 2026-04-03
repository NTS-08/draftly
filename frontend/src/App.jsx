import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import SignUpPage from './pages/SignUpPage';
import LandingPage from './pages/LandingPage';
import EditorPage from './pages/EditorPage';
import ProfilePage from './pages/ProfilePage';
import TestAuth from './pages/TestAuth';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/test-auth" element={<TestAuth />} />
        <Route path="/" element={<LandingPage />} />
        <Route path="/doc/:id" element={<EditorPage />} />
      </Routes>
    </Router>
  );
}

export default App;
