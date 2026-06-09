import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';
import { ROLES } from '../utils/constants';
import { useApp } from '../context/AppContext';
import LoadingSpinner from '../components/shared/LoadingSpinner';

// Layouts
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';

// Auth Pages
import RoleSelector from '../pages/auth/RoleSelector';
import ChildLogin from '../pages/auth/ChildLogin';
import ParentLogin from '../pages/auth/ParentLogin';
import TeacherLogin from '../pages/auth/TeacherLogin';
import AdminLogin from '../pages/auth/AdminLogin';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';

// Parent Pages
import ParentDashboard from '../pages/parent/ParentDashboard';
import ChildProfileManager from '../pages/parent/ChildProfileManager';
import SwitchChild from '../pages/parent/SwitchChild';

// Child Pages
import ChildDashboard from '../pages/child/ChildDashboard';
import ChildExplore from '../pages/child/ChildExplore';
import ChildAwards from '../pages/child/ChildAwards';
import ChildAvatar from '../pages/child/ChildAvatar';

// Teacher Pages
import TeacherDashboard from '../pages/teacher/TeacherDashboard';
import TeacherProfile from '../pages/teacher/TeacherProfile';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import UserManagement from '../pages/admin/UserManagement';
import SessionManagement from '../pages/admin/SessionManagement';
import NotificationManager from '../pages/admin/NotificationManager';
import FeatureFlags from '../pages/admin/FeatureFlags';

// Settings
import AccountSettings from '../pages/settings/AccountSettings';

// Showcase
import ComponentShowcase from '../pages/showcase/ComponentShowcase';

// ── Maintenance page shown when maintenanceMode flag is ON ────────────────────
const MaintenancePage = () => (
  <div style={{
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #1F3A68 0%, #2D5A9E 100%)',
    color: 'white', textAlign: 'center', padding: '2rem',
    fontFamily: '"Nunito", sans-serif',
  }}>
    <div style={{ fontSize: '5rem', marginBottom: '1rem', animation: 'pulse 2s ease-in-out infinite' }}>🔧</div>
    <h1 style={{ fontSize: '2.5rem', fontWeight: 900, marginBottom: '0.5rem' }}>Under Maintenance</h1>
    <p style={{ fontSize: '1.1rem', opacity: 0.85, maxWidth: 480, lineHeight: 1.6 }}>
      SpacECE India Foundation is undergoing scheduled maintenance. We'll be back shortly! 🚀
    </p>
    <p style={{ marginTop: '2rem', opacity: 0.6, fontSize: '0.85rem' }}>
      If you are an admin, please log in at <strong>/login/admin</strong> to disable maintenance mode.
    </p>
  </div>
);

// ── Feature-disabled page ─────────────────────────────────────────────────────
const FeatureDisabledPage = ({ feature = 'This feature' }) => (
  <div style={{
    minHeight: '60vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    textAlign: 'center', padding: '2rem',
    fontFamily: '"Nunito", sans-serif',
  }}>
    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🚧</div>
    <h2 style={{ fontWeight: 900, marginBottom: '0.5rem' }}>{feature} is currently disabled</h2>
    <p style={{ color: '#6B7280' }}>This feature has been turned off by an administrator.</p>
  </div>
);

const AppRouter = () => {
  const { featureFlags, flagsLoaded } = useApp();

  // Wait until flags are loaded from Firestore before rendering routes
  // (prevents flash of wrong content; falls back after 3s anyway)
  if (!flagsLoaded) {
    return <LoadingSpinner fullScreen message="Loading platform..." />;
  }

  // Show maintenance page to all non-admin users when flag is ON
  const isMaintenance = featureFlags.maintenanceMode;

  return (
    <BrowserRouter>
      <Routes>
        {/* ============================== */}
        {/* PUBLIC AUTH ROUTES */}
        {/* ============================== */}
        <Route element={<AuthLayout />}>
          <Route path="/" element={<RoleSelector />} />
          <Route path="/login/child"   element={<ChildLogin />} />
          <Route path="/login/parent"  element={<ParentLogin />} />
          <Route path="/login/teacher" element={<TeacherLogin />} />
          {/* Admin login always accessible even in maintenance mode */}
          <Route path="/login/admin"   element={<AdminLogin />} />
          <Route path="/register"        element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Route>

        {/* ============================== */}
        {/* PROTECTED CHILD ROUTES */}
        {/* ============================== */}
        <Route
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[ROLES.CHILD]}>
                <MainLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route
            path="/child/dashboard"
            element={
              isMaintenance
                ? <MaintenancePage />
                : !featureFlags.enableChildDashboard
                  ? <FeatureDisabledPage feature="Child Dashboard" />
                  : <ChildDashboard />
            }
          />
          <Route path="/child/explore" element={isMaintenance ? <MaintenancePage /> : <ChildExplore />} />
          <Route
            path="/child/awards"
            element={isMaintenance ? <MaintenancePage /> : <ChildAwards />}
          />
          <Route
            path="/child/avatar"
            element={
              isMaintenance
                ? <MaintenancePage />
                : !featureFlags.enableAvatarCustomization
                  ? <FeatureDisabledPage feature="Avatar Customization" />
                  : <ChildAvatar />
            }
          />
        </Route>

        {/* ============================== */}
        {/* PROTECTED PARENT ROUTES */}
        {/* ============================== */}
        <Route
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[ROLES.PARENT]}>
                <MainLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route path="/parent/dashboard"         element={isMaintenance ? <MaintenancePage /> : <ParentDashboard />} />
          <Route path="/parent/children"          element={isMaintenance ? <MaintenancePage /> : <ChildProfileManager />} />
          <Route path="/parent/children/switch"   element={isMaintenance ? <MaintenancePage /> : <SwitchChild />} />
          <Route path="/parent/settings"          element={isMaintenance ? <MaintenancePage /> : <AccountSettings />} />
        </Route>

        {/* ============================== */}
        {/* PROTECTED TEACHER ROUTES */}
        {/* ============================== */}
        <Route
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[ROLES.TEACHER]}>
                <MainLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route
            path="/teacher/dashboard"
            element={
              isMaintenance
                ? <MaintenancePage />
                : !featureFlags.enableTeacherDashboard
                  ? <FeatureDisabledPage feature="Teacher Dashboard" />
                  : <TeacherDashboard />
            }
          />
          <Route path="/teacher/profile"  element={isMaintenance ? <MaintenancePage /> : <TeacherProfile />} />
          <Route path="/teacher/settings" element={isMaintenance ? <MaintenancePage /> : <AccountSettings />} />
        </Route>

        {/* ============================== */}
        {/* PROTECTED ADMIN ROUTES         */}
        {/* Admin is never blocked by maintenanceMode */}
        {/* ============================== */}
        <Route
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={[ROLES.ADMIN]}>
                <MainLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route path="/admin/dashboard"      element={<AdminDashboard />} />
          <Route path="/admin/users"          element={<UserManagement />} />
          <Route path="/admin/sessions"       element={<SessionManagement />} />
          <Route path="/admin/notifications"  element={<NotificationManager />} />
          <Route path="/admin/features"       element={<FeatureFlags />} />
          <Route path="/admin/settings"       element={<AccountSettings />} />
        </Route>

        {/* ============================== */}
        {/* DEV ROUTES */}
        {/* ============================== */}
        <Route path="/showcase" element={<ComponentShowcase />} />

        {/* Catch-all */}
        <Route path="*" element={<RoleSelector />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
