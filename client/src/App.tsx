import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import MainLayout from './components/layout/MainLayout';
import LandingPage from './pages/LandingPage';
import ChatPage from './pages/ChatPage';
import DashboardPage from './pages/DashboardPage';
import './App.css';

function App() {
  return (
    <Router>
      <MainLayout>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route
            path="/chat"
            element={
              <>
                <SignedIn>
                  <ChatPage />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />

          <Route
            path="/dashboard"
            element={
              <>
                <SignedIn>
                  <DashboardPage />
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />

          {/* Fallback for undefined routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </Router>
  );
}

export default App;
