import React, { Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuth } from './hooks/useAuth';
import { ErrorBoundary } from './components/shared/ErrorBoundary';
import { LoadingScreen } from './components/shared/LoadingScreen';
import { Footer } from './components/shared/Footer';

// Lazy load components with proper error handling
const LandingPage = React.lazy(() => 
  import('./components/LandingPage').then(module => ({ default: module.LandingPage }))
);
const AboutPage = React.lazy(() => 
  import('./components/AboutPage').then(module => ({ default: module.AboutPage }))
);
const UserProfile = React.lazy(() => 
  import('./components/UserProfile').then(module => ({ default: module.UserProfile }))
);
const PeakPostDetail = React.lazy(() => 
  import('./components/PeakPostDetail').then(module => ({ default: module.PeakPostDetail }))
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
            </Routes>
          </main>
        </Suspense>
      </ErrorBoundary>
      <Footer />
    </div>
  );
}

export default App;