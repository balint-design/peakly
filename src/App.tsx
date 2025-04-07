import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth, ResetPasswordPage } from './features/auth';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { LoadingScreen } from './components/shared/LoadingScreen';
import { Footer } from './components/shared/Footer';

// Lazy load components with error handling
const LandingPage = lazy(() => import('./components/LandingPage')
  .then(module => ({ default: module.LandingPage }))
  .catch(error => {
    console.error('Error loading LandingPage:', error);
    throw error;
  })
);

const AboutPage = lazy(() => import('./components/AboutPage')
  .then(module => ({ default: module.AboutPage }))
  .catch(error => {
    console.error('Error loading AboutPage:', error);
    throw error;
  })
);

const UserProfile = lazy(() => import('./components/UserProfile')
  .then(module => ({ default: module.UserProfile }))
  .catch(error => {
    console.error('Error loading UserProfile:', error);
    throw error;
  })
);

const PeakPostDetail = lazy(() => import('./components/PeakPostDetail')
  .then(module => ({ default: module.PeakPostDetail }))
  .catch(error => {
    console.error('Error loading PeakPostDetail:', error);
    throw error;
  })
);

function App() {
  const { session, loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Toaster position="top-center" />
      <ErrorBoundary>
        <Suspense fallback={<LoadingScreen />}>
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/posts/:id" element={<PeakPostDetail />} />
              {session && (
                <Route 
                  path="/profile" 
                  element={<UserProfile userId={session.user.id} isPublic={false} />} 
                />
              )}
              <Route 
                path="/profile/:username" 
                element={<UserProfile />} 
              />
              <Route 
                path="/reset-password" 
                element={<ResetPasswordPage />} 
              />
            </Routes>
          </main>
        </Suspense>
      </ErrorBoundary>
      <Footer />
    </div>
  );
}

export default App;