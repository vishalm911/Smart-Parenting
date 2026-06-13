import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './services/firebase/config';
import { useAuthStore } from './store/authStore';
import { LoadingScreen } from './components/LoadingScreen';
import { Header } from './components/Header';
import { AdminRoute } from './components/AdminRoute';

// Lazy load pages
import { lazy, Suspense } from 'react';

const LandingPage = lazy(() => import('./pages/LandingPage.tsx'));
const LoginPage = lazy(() => import('./pages/LoginPage.tsx'));
const RegisterPage = lazy(() => import('./pages/RegisterPage.tsx'));
const DashboardPage = lazy(() => import('./pages/DashboardPage.tsx'));
const BrainWorldPage = lazy(() => import('./pages/BrainWorldPage.tsx'));
const CreativityWorldPage = lazy(() => import('./pages/CreativityWorldPage.tsx'));
const EmotionWorldPage = lazy(() => import('./pages/EmotionWorldPage.tsx'));
const StoryWorldPage = lazy(() => import('./pages/StoryWorldPage.tsx'));
const ProfilePage = lazy(() => import('./pages/ProfilePage.tsx'));

// Admin pages
const AdminPanel = lazy(() => import('./pages/AdminPanel.tsx'));
const GameManager = lazy(() => import('./pages/admin/GameManager.tsx'));
const AssetUploader = lazy(() => import('./pages/admin/AssetUploader.tsx'));
const AnalyticsView = lazy(() => import('./pages/admin/AnalyticsView.tsx'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings.tsx'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const { setUser, setLoading, isLoading, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            setUser(userDoc.data() as any);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-light">
          <Routes>
            {/* Public Routes */}
            <Route
              path="/"
              element={
                <Suspense fallback={<LoadingScreen />}>
                  <LandingPage />
                </Suspense>
              }
            />
            <Route
              path="/login"
              element={
                <Suspense fallback={<LoadingScreen />}>
                  {isAuthenticated ? <Navigate to="/dashboard" /> : <LoginPage />}
                </Suspense>
              }
            />
            <Route
              path="/register"
              element={
                <Suspense fallback={<LoadingScreen />}>
                  {isAuthenticated ? <Navigate to="/dashboard" /> : <RegisterPage />}
                </Suspense>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/dashboard"
              element={
                <Suspense fallback={<LoadingScreen />}>
                  {isAuthenticated ? (
                    <>
                      <Header />
                      <DashboardPage />
                    </>
                  ) : (
                    <Navigate to="/login" />
                  )}
                </Suspense>
              }
            />
            <Route
              path="/brain-world/*"
              element={
                <Suspense fallback={<LoadingScreen />}>
                  {isAuthenticated ? (
                    <>
                      <Header />
                      <BrainWorldPage />
                    </>
                  ) : (
                    <Navigate to="/login" />
                  )}
                </Suspense>
              }
            />
            <Route
              path="/creativity-world/*"
              element={
                <Suspense fallback={<LoadingScreen />}>
                  {isAuthenticated ? (
                    <>
                      <Header />
                      <CreativityWorldPage />
                    </>
                  ) : (
                    <Navigate to="/login" />
                  )}
                </Suspense>
              }
            />
            <Route
              path="/emotion-world/*"
              element={
                <Suspense fallback={<LoadingScreen />}>
                  {isAuthenticated ? (
                    <>
                      <Header />
                      <EmotionWorldPage />
                    </>
                  ) : (
                    <Navigate to="/login" />
                  )}
                </Suspense>
              }
            />
            <Route
              path="/story-world/*"
              element={
                <Suspense fallback={<LoadingScreen />}>
                  {isAuthenticated ? (
                    <>
                      <Header />
                      <StoryWorldPage />
                    </>
                  ) : (
                    <Navigate to="/login" />
                  )}
                </Suspense>
              }
            />
            <Route
              path="/profile"
              element={
                <Suspense fallback={<LoadingScreen />}>
                  {isAuthenticated ? (
                    <>
                      <Header />
                      <ProfilePage />
                    </>
                  ) : (
                    <Navigate to="/login" />
                  )}
                </Suspense>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <Suspense fallback={<LoadingScreen />}>
                  <AdminRoute>
                    <AdminPanel />
                  </AdminRoute>
                </Suspense>
              }
            />
            <Route
              path="/admin/games"
              element={
                <Suspense fallback={<LoadingScreen />}>
                  <AdminRoute>
                    <GameManager />
                  </AdminRoute>
                </Suspense>
              }
            />
            <Route
              path="/admin/assets"
              element={
                <Suspense fallback={<LoadingScreen />}>
                  <AdminRoute>
                    <AssetUploader />
                  </AdminRoute>
                </Suspense>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <Suspense fallback={<LoadingScreen />}>
                  <AdminRoute>
                    <AnalyticsView />
                  </AdminRoute>
                </Suspense>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <Suspense fallback={<LoadingScreen />}>
                  <AdminRoute>
                    <AdminSettings />
                  </AdminRoute>
                </Suspense>
              }
            />

            {/* Catch all */}
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
