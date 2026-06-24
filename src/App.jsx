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
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import theme from './theme/theme';
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider } from './context/UserContext';
import Layout from './components/layout/Layout';

// Core contexts
import { AuthProvider } from './context/AuthContext';
import { ChildProfileProvider, useChildProfile } from './context/ChildProfileContext';
import { NotificationProvider } from './context/NotificationContext';
import { AppProvider as PlatformProvider } from './context/AppContext';

// Auth layouts & pages
import AuthLayout from './components/layout/AuthLayout';
import RoleSelector from './pages/auth/RoleSelector';
import ChildLogin from './pages/auth/ChildLogin';
import ParentLogin from './pages/auth/ParentLogin';
import TeacherLogin from './pages/auth/TeacherLogin';
import AdminLogin from './pages/auth/AdminLogin';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';
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
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import TeacherProfile from './pages/teacher/TeacherProfile';

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
                      <Route element={<ProtectedRoute><RoleRoute allowedRoles={['teacher']}><MainLayout /></RoleRoute></ProtectedRoute>}>
                        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
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

                      {/* Protected Child Routes */}
                      <Route element={<ProtectedRoute><RoleRoute allowedRoles={['child']}><Layout /></RoleRoute></ProtectedRoute>}>
                        <Route path="/child/dashboard"   element={<Home />} />
                        <Route path="/child/explore"     element={<Adventure />} />
                        <Route path="/child/awards"      element={<Awards />} />
                        <Route path="/child/avatar"      element={<AvatarPage />} />
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

                      {/* Literacy Admin — standalone, no Firebase auth required */}
                      <Route path="/literacy-admin" element={<LiteracyAdminPanel />} />

                      {/* Fallback */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
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