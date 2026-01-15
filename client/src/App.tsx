import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';
import MainLayout from './components/layout/MainLayout';
import LandingPage from './pages/LandingPage';
import './App.css';

// Lazy load protected pages to reduce initial bundle size
const ChatPage = lazy(() => import('./pages/ChatPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));

// Loading fallback that matches the app's dark theme
const PageLoader = () => (
  <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/chat"
          element={
            <>
              <SignedIn>
                <Suspense fallback={<PageLoader />}>
                  <ChatPage />
                </Suspense>
              </SignedIn>
              <SignedOut>
                <RedirectToSignIn />
              </SignedOut>
            </>
          }
        />

        <Route
          element={
            <MainLayout>
              <Outlet />
            </MainLayout>
          }
        >
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/dashboard"
            element={
              <>
                <SignedIn>
                  <Suspense fallback={<PageLoader />}>
                    <DashboardPage />
                  </Suspense>
                </SignedIn>
                <SignedOut>
                  <RedirectToSignIn />
                </SignedOut>
              </>
            }
          />

          {/* Fallback for undefined routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
