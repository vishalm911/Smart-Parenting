/**
 * App.jsx - Root Application Component & Router
 *
 * Integrated SpacECE Learning Platform containing:
 * 1. Auth & Profiles — Parent, Child, Teacher, Admin portals
 * 2. Numeracy — Math World, Puzzle World, Number Adventure, Logic Island
 * 3. Literacy & Phonics — Reading World, Story World, Vocabulary, Challenges
 * 4. Cognitive & Creativity — Brain World, Creativity World, Emotion World
 * 5. Parent Analytics & Reports — Linked dashboard views under Parent Analytics
 */
import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate } from 'react-router-dom';
import { setNavigate } from './api/client';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import theme from './theme/theme';
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider } from './context/UserContext';
import Layout from './components/layout/Layout';
import MaintenancePage from './components/shared/MaintenancePage';
import LoadingSpinner from './components/shared/LoadingSpinner';

// Core contexts
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/AuthContext';
import { ChildProfileProvider, useChildProfile } from './context/ChildProfileContext';
import { NotificationProvider } from './context/NotificationContext';
import { AppProvider as PlatformProvider } from './context/AppContext';
import { useApp } from './context/AppContext';

// Auth layouts & pages
import AuthLayout from './components/layout/AuthLayout';
import RoleSelector from './pages/auth/RoleSelector';
import ChildLogin from './pages/auth/ChildLogin';
import ParentLogin from './pages/auth/ParentLogin';
import TeacherLogin from './pages/auth/TeacherLogin';
import AdminLogin from './pages/auth/AdminLogin';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
import ResetPassword from './pages/auth/ResetPassword';
import PrivacyPolicy from './pages/auth/PrivacyPolicy';
import TermsOfService from './pages/auth/TermsOfService';

// Layout guards
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';
import MainLayout from './components/layout/MainLayout';

// Parent pages
import ParentDashboard from './pages/parent/ParentDashboard';
import ChildProfileManager from './pages/parent/ChildProfileManager';
import SwitchChild from './pages/parent/SwitchChild';
import AccountSettings from './pages/settings/AccountSettings';
import { ParentDashboard as ParentAnalyticsDashboard } from './pages/analytics/ParentDashboard';
import { ReportsPage } from './pages/analytics/ReportsPage';

// Teacher pages
import TeacherProfile from './pages/teacher/TeacherProfile';
import { TeacherDashboard } from './pages/analytics/TeacherDashboard';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import SessionManagement from './pages/admin/SessionManagement';
import NotificationManager from './pages/admin/NotificationManager';
import FeatureFlags from './pages/admin/FeatureFlags';
import LiteracyPanelPage from './pages/admin/LiteracyPanelPage';
import NumeracyPanelPage from './pages/admin/NumeracyPanelPage';

// Numeracy Child Pages
import Home from './pages/child/Home';
import Adventure from './pages/child/Adventure';
import Awards from './pages/child/Awards';
import AvatarPage from './pages/child/AvatarPage';
import Settings from './pages/child/Settings';
import AssessmentModule from './pages/child/AssessmentModule';
import MathWorld from './pages/numeracy/MathWorld';
import PuzzleWorld from './pages/numeracy/PuzzleWorld';
import NumberAdventure from './pages/numeracy/NumberAdventure';
import LogicIsland from './pages/numeracy/LogicIsland';
import AdminPanel from './pages/numeracy/AdminPanel';
import LiteracyAdminPanel from './pages/literacy/admin/AdminPanel';

// Language Child Pages
import ReadingWorldPage from './pages/literacy/ReadingWorldPage';
import StoryWorldPage from './pages/literacy/StoryWorldPage';
import VocabularyZonePage from './pages/literacy/VocabularyZonePage';
import LanguageChallengesPage from './pages/literacy/LanguageChallengesPage';

// Cognitive, Creativity & Emotional Worlds
import BrainWorldPage from './pages/cognitive-sel/BrainWorldPage';
import CreativityWorldPage from './pages/cognitive-sel/CreativityWorldPage';
import EmotionWorldPage from './pages/cognitive-sel/EmotionWorldPage';
import CognitiveStoryWorldPage from './pages/cognitive-sel/StoryWorldPage';

function NavigationSetter() {
  const navigate = useNavigate();
  useEffect(() => {
    setNavigate(navigate);
  }, [navigate]);
  return null;
}

/**
 * MaintenanceGate
 * Must live INSIDE PlatformProvider so it can read useApp().
 * Blocks all non-admin users when maintenanceMode is ON.
 * While flags are still loading from the database, shows a spinner to
 * prevent a flash of the maintenance page on first load.
 */
function MaintenanceGate({ children }) {
  const { featureFlags, flagsLoaded } = useApp();
  const { userRole } = useAuth();

  // Still fetching flags — show a brief loader instead of wrong screen
  if (!flagsLoaded) {
    return <LoadingSpinner fullScreen message="Loading platform..." />;
  }

  // Maintenance is ON and the user is NOT an admin → show maintenance page
  if (featureFlags.maintenanceMode && userRole !== 'admin') {
    return <MaintenancePage />;
  }

  return children;
}

function ChildDashboardGuard({ children }) {
  const { featureFlags } = useApp();
  if (featureFlags?.enableChildDashboard === false) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function TeacherDashboardGuard({ children }) {
  const { featureFlags } = useApp();
  if (featureFlags?.enableTeacherDashboard === false) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function AvatarCustomizationGuard({ children }) {
  const { featureFlags } = useApp();
  if (featureFlags?.enableAvatarCustomization === false) {
    return <Navigate to="/child/dashboard" replace />;
  }
  return children;
}


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
  return <ParentAnalyticsDashboard selectedChild={activeChild} onRefresh={refreshProfiles} />;
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
      <MuiThemeProvider theme={theme}>
        <AuthProvider>
          <ChildProfileProvider>
            <NotificationProvider>
              <PlatformProvider>
                <UserProvider>
                  <BrowserRouter>
                    <NavigationSetter />
                    <MaintenanceGate>
                    <Routes>
                      {/* Public Auth Routes */}
                      <Route element={<AuthLayout />}>
                        <Route path="/" element={<RoleSelector />} />
                        <Route path="/login/child"      element={<ChildLogin />} />
                        <Route path="/login/parent"     element={<ParentLogin />} />
                        <Route path="/login/teacher"    element={<TeacherLogin />} />
                        <Route path="/login/admin"      element={<AdminLogin />} />
                        <Route path="/register"         element={<Register />} />
                        <Route path="/forgot-password"  element={<ForgotPassword />} />
                        <Route path="/reset-password"   element={<ResetPassword />} />
                        <Route path="/privacy"          element={<PrivacyPolicy />} />
                        <Route path="/terms"            element={<TermsOfService />} />
                      </Route>

                      {/* Protected Parent Routes */}
                      <Route element={<ProtectedRoute><RoleRoute allowedRoles={['parent']}><MainLayout /></RoleRoute></ProtectedRoute>}>
                        <Route path="/parent/dashboard"       element={<ParentDashboard />} />
                        <Route path="/parent/children"        element={<ChildProfileManager />} />
                        <Route path="/parent/children/switch" element={<SwitchChild />} />
                        <Route path="/parent/settings"        element={<AccountSettings />} />
                        <Route path="/parent/analytics"       element={<ParentAnalyticsView />} />
                        <Route path="/parent/reports"         element={<ParentReportsView />} />
                      </Route>

                      {/* Protected Teacher Routes */}
                      <Route element={<ProtectedRoute><RoleRoute allowedRoles={['teacher']}><TeacherDashboardGuard><MainLayout /></TeacherDashboardGuard></RoleRoute></ProtectedRoute>}>
                        <Route path="/teacher/dashboard" element={<TeacherDashboard onRefresh={() => {}} />} />
                        <Route path="/teacher/roster"    element={<TeacherDashboard onRefresh={() => {}} />} />
                        <Route path="/teacher/gaps"      element={<TeacherDashboard onRefresh={() => {}} />} />
                        <Route path="/teacher/assign"    element={<TeacherDashboard onRefresh={() => {}} />} />
                        <Route path="/teacher/activities" element={<TeacherDashboard onRefresh={() => {}} />} />
                        <Route path="/teacher/profile"   element={<TeacherProfile />} />
                        <Route path="/teacher/settings"  element={<AccountSettings />} />
                      </Route>

                      {/* Protected Admin Routes */}
                      <Route element={<ProtectedRoute><RoleRoute allowedRoles={['admin']}><MainLayout /></RoleRoute></ProtectedRoute>}>
                        <Route path="/admin/dashboard"     element={<AdminDashboard />} />
                        <Route path="/admin/users"         element={<UserManagement />} />
                        <Route path="/admin/sessions"      element={<SessionManagement />} />
                        <Route path="/admin/notifications" element={<NotificationManager />} />
                        <Route path="/admin/features"      element={<FeatureFlags />} />
                        <Route path="/admin/literacy"      element={<LiteracyPanelPage />} />
                        <Route path="/admin/numeracy"      element={<NumeracyPanelPage />} />
                        <Route path="/admin/settings"      element={<AccountSettings />} />
                      </Route>

                      {/* Protected Child Assessment (standalone, no Layout shell) */}
                      <Route element={<ProtectedRoute><RoleRoute allowedRoles={['child']}><ChildDashboardGuard><Outlet /></ChildDashboardGuard></RoleRoute></ProtectedRoute>}>
                        <Route path="/child/assessment" element={<AssessmentModule />} />
                      </Route>

                      {/* Protected Child Routes */}
                      <Route element={<ProtectedRoute><RoleRoute allowedRoles={['child']}><ChildDashboardGuard><Layout /></ChildDashboardGuard></RoleRoute></ProtectedRoute>}>
                        <Route path="/child/dashboard"   element={<Home />} />
                        <Route path="/child/explore"     element={<Adventure />} />
                        <Route path="/child/awards"      element={<Awards />} />
                        <Route path="/child/avatar"      element={<AvatarCustomizationGuard><AvatarPage /></AvatarCustomizationGuard>} />
                        <Route path="/child/settings"    element={<Settings />} />

                        <Route path="/math-world"       element={<MathWorld />} />
                        <Route path="/puzzle-world"     element={<PuzzleWorld />} />
                        <Route path="/number-adventure" element={<NumberAdventure />} />
                        <Route path="/logic-island"     element={<LogicIsland />} />

                        <Route path="/child/reading-world"       element={<ReadingWorldPage />} />
                        <Route path="/child/story-world"         element={<StoryWorldPage />} />
                        <Route path="/child/vocabulary-zone"     element={<VocabularyZonePage />} />
                        <Route path="/child/language-challenges" element={<LanguageChallengesPage />} />

                        <Route path="/child/brain-world/*"        element={<BrainWorldPage />} />
                        <Route path="/child/creativity-world/*"   element={<CreativityWorldPage />} />
                        <Route path="/child/emotion-world/*"      element={<EmotionWorldPage />} />
                        <Route path="/child/story-choice-world/*" element={<CognitiveStoryWorldPage />} />

                        <Route path="/admin" element={<AdminPanel />} />
                      </Route>

                      {/* Literacy Admin — standalone, no additional auth required */}
                      <Route path="/literacy-admin" element={<LiteracyAdminPanel />} />

                      {/* Fallback */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                    </MaintenanceGate>
                  </BrowserRouter>
                </UserProvider>
              </PlatformProvider>
            </NotificationProvider>
          </ChildProfileProvider>
        </AuthProvider>
      </MuiThemeProvider>
    </ThemeProvider>
  );
}