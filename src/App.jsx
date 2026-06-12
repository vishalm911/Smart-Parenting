import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider } from './context/UserContext';
import Layout from './components/layout/Layout';

// Gyanendra contexts
import { AuthProvider } from './modules/gyanendra/context/AuthContext';
import { ChildProfileProvider, useChildProfile } from './modules/gyanendra/context/ChildProfileContext';
import { NotificationProvider } from './modules/gyanendra/context/NotificationContext';
import { AppProvider as PlatformProvider } from './modules/gyanendra/context/AppContext';

// Auth layouts & pages (Gyanendra)
import AuthLayout from './modules/gyanendra/layouts/AuthLayout';
import RoleSelector from './modules/gyanendra/pages/auth/RoleSelector';
import ChildLogin from './modules/gyanendra/pages/auth/ChildLogin';
import ParentLogin from './modules/gyanendra/pages/auth/ParentLogin';
import TeacherLogin from './modules/gyanendra/pages/auth/TeacherLogin';
import AdminLogin from './modules/gyanendra/pages/auth/AdminLogin';
import Register from './modules/gyanendra/pages/auth/Register';
import ForgotPassword from './modules/gyanendra/pages/auth/ForgotPassword';

// Layout guards (Gyanendra)
import ProtectedRoute from './modules/gyanendra/routes/ProtectedRoute';
import RoleRoute from './modules/gyanendra/routes/RoleRoute';
import MainLayout from './modules/gyanendra/layouts/MainLayout';

// Parent pages (Gyanendra & Aditya)
import ParentDashboard from './modules/gyanendra/pages/parent/ParentDashboard';
import ChildProfileManager from './modules/gyanendra/pages/parent/ChildProfileManager';
import SwitchChild from './modules/gyanendra/pages/parent/SwitchChild';
import AccountSettings from './modules/gyanendra/pages/settings/AccountSettings';
import { ParentDashboard as AdityaParentDashboard } from './modules/aditya/pages/ParentDashboard';
import { ReportsPage } from './modules/aditya/pages/ReportsPage';

// Teacher pages (Gyanendra)
import TeacherDashboard from './modules/gyanendra/pages/teacher/TeacherDashboard';
import TeacherProfile from './modules/gyanendra/pages/teacher/TeacherProfile';

// Admin pages (Gyanendra)
import AdminDashboard from './modules/gyanendra/pages/admin/AdminDashboard';
import UserManagement from './modules/gyanendra/pages/admin/UserManagement';
import SessionManagement from './modules/gyanendra/pages/admin/SessionManagement';
import NotificationManager from './modules/gyanendra/pages/admin/NotificationManager';
import FeatureFlags from './modules/gyanendra/pages/admin/FeatureFlags';

// Numeracy Child Pages (Our module)
import Home from './pages/Home';
import Adventure from './pages/Adventure';
import Awards from './pages/Awards';
import AvatarPage from './pages/AvatarPage';
import Settings from './pages/Settings';
import MathWorld from './pages/MathWorld';
import PuzzleWorld from './pages/PuzzleWorld';
import NumberAdventure from './pages/NumberAdventure';
import LogicIsland from './pages/LogicIsland';
import AdminPanel from './pages/AdminPanel';

// Language Child Pages (Harshika's module)
import ReadingWorldPage from './modules/harshika/pages/ReadingWorldPage';
import StoryWorldPage from './modules/harshika/pages/StoryWorldPage';
import VocabularyZonePage from './modules/harshika/pages/VocabularyZonePage';
import LanguageChallengesPage from './modules/harshika/pages/LanguageChallengesPage';

// Helper controller views to safely map Aditya's child-specific parent views
function ParentAnalyticsView() {
  const { activeChild, refreshProfiles } = useChildProfile();
  if (!activeChild) {
    return (
      <div className="p-8 text-center" style={{ color: 'var(--text-secondary)' }}>
        <h4 className="text-lg font-bold">No child profile active</h4>
        <p className="text-sm mt-1">Please select or switch to a child first under Child Profiles.</p>
      </div>
    );
  }
  return <AdityaParentDashboard selectedChild={activeChild} onRefresh={refreshProfiles} />;
}

function ParentReportsView() {
  const { activeChild } = useChildProfile();
  if (!activeChild) {
    return (
      <div className="p-8 text-center" style={{ color: 'var(--text-secondary)' }}>
        <h4 className="text-lg font-bold">No child profile active</h4>
        <p className="text-sm mt-1">Please select or switch to a child first under Child Profiles.</p>
      </div>
    );
  }
  return <ReportsPage selectedChild={activeChild} />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ChildProfileProvider>
          <NotificationProvider>
            <PlatformProvider>
              <UserProvider>
                <BrowserRouter>
                  <Routes>
                    {/* Public Auth Routes */}
                    <Route element={<AuthLayout />}>
                      <Route path="/" element={<RoleSelector />} />
                      <Route path="/login/child"   element={<ChildLogin />} />
                      <Route path="/login/parent"  element={<ParentLogin />} />
                      <Route path="/login/teacher" element={<TeacherLogin />} />
                      <Route path="/login/admin"   element={<AdminLogin />} />
                      <Route path="/register"        element={<Register />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                    </Route>

                    {/* Protected Parent Routes */}
                    <Route
                      element={
                        <ProtectedRoute>
                          <RoleRoute allowedRoles={['parent']}>
                            <MainLayout />
                          </RoleRoute>
                        </ProtectedRoute>
                      }
                    >
                      <Route path="/parent/dashboard"         element={<ParentDashboard />} />
                      <Route path="/parent/children"          element={<ChildProfileManager />} />
                      <Route path="/parent/children/switch"   element={<SwitchChild />} />
                      <Route path="/parent/settings"          element={<AccountSettings />} />
                      <Route path="/parent/analytics"         element={<ParentAnalyticsView />} />
                      <Route path="/parent/reports"           element={<ParentReportsView />} />
                    </Route>

                    {/* Protected Teacher Routes */}
                    <Route
                      element={
                        <ProtectedRoute>
                          <RoleRoute allowedRoles={['teacher']}>
                            <MainLayout />
                          </RoleRoute>
                        </ProtectedRoute>
                      }
                    >
                      <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
                      <Route path="/teacher/profile"   element={<TeacherProfile />} />
                      <Route path="/teacher/settings"  element={<AccountSettings />} />
                    </Route>

                    {/* Protected Admin Routes */}
                    <Route
                      element={
                        <ProtectedRoute>
                          <RoleRoute allowedRoles={['admin']}>
                            <MainLayout />
                          </RoleRoute>
                        </ProtectedRoute>
                      }
                    >
                      <Route path="/admin/dashboard"     element={<AdminDashboard />} />
                      <Route path="/admin/users"         element={<UserManagement />} />
                      <Route path="/admin/sessions"      element={<SessionManagement />} />
                      <Route path="/admin/notifications" element={<NotificationManager />} />
                      <Route path="/admin/features"      element={<FeatureFlags />} />
                      <Route path="/admin/settings"      element={<AccountSettings />} />
                    </Route>

                    {/* Protected Child Routes */}
                    <Route
                      element={
                        <ProtectedRoute>
                          <RoleRoute allowedRoles={['child']}>
                            <Layout />
                          </RoleRoute>
                        </ProtectedRoute>
                      }
                    >
                      {/* Numeracy & Exploration */}
                      <Route path="/child/dashboard"        element={<Home />} />
                      <Route path="/child/explore"          element={<Adventure />} />
                      <Route path="/child/awards"           element={<Awards />} />
                      <Route path="/child/avatar"           element={<AvatarPage />} />
                      <Route path="/child/settings"         element={<Settings />} />
                      
                      {/* Game Worlds */}
                      <Route path="/math-world"        element={<MathWorld />} />
                      <Route path="/puzzle-world"      element={<PuzzleWorld />} />
                      <Route path="/number-adventure"  element={<NumberAdventure />} />
                      <Route path="/logic-island"      element={<LogicIsland />} />

                      {/* Language & Vocabulary World */}
                      <Route path="/child/reading-world"        element={<ReadingWorldPage />} />
                      <Route path="/child/story-world"          element={<StoryWorldPage />} />
                      <Route path="/child/vocabulary-zone"      element={<VocabularyZonePage />} />
                      <Route path="/child/language-challenges"  element={<LanguageChallengesPage />} />

                      {/* Admin panel inside child portal */}
                      <Route path="/admin" element={<AdminPanel />} />
                    </Route>

                    {/* Fallback Catch-all redirects to selector */}
                    <Route path="*" element={<Navigate to="/" replace />} />
                  </Routes>
                </BrowserRouter>
              </UserProvider>
            </PlatformProvider>
          </NotificationProvider>
        </ChildProfileProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
