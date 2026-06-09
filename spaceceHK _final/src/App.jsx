// src/App.jsx
import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider }   from "./context/AuthContext";
import Navbar             from "./components/Navbar";
import ProtectedRoute     from "./components/ProtectedRoute";
import LoginPage          from "./pages/LoginPage";
import RegisterPage       from "./pages/RegisterPage";
import ReadingWorldPage        from "./pages/ReadingWorldPage";
import StoryWorldPage          from "./pages/StoryWorldPage";
import VocabularyZonePage      from "./pages/VocabularyZonePage";
import LanguageChallengesPage  from "./pages/LanguageChallengesPage";
import AdminPanel              from "./pages/admin/AdminPanel";
import "./styles/global.css";

function Layout({ children, onToggleTheme, isDark }) {
  return (
    <>
      <Navbar onToggleTheme={onToggleTheme} isDark={isDark} />
      {children}
    </>
  );
}

export default function App() {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    setIsDark(d => {
      document.documentElement.setAttribute("data-theme", !d ? "dark" : "");
      return !d;
    });
  };

  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Admin — protected */}
          <Route path="/admin" element={
            <ProtectedRoute><AdminPanel /></ProtectedRoute>
          } />

          {/* App pages — protected + navbar */}
          <Route path="/reading" element={
            <ProtectedRoute>
              <Layout onToggleTheme={toggleTheme} isDark={isDark}>
                <ReadingWorldPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/story" element={
            <ProtectedRoute>
              <Layout onToggleTheme={toggleTheme} isDark={isDark}>
                <StoryWorldPage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/vocabulary" element={
            <ProtectedRoute>
              <Layout onToggleTheme={toggleTheme} isDark={isDark}>
                <VocabularyZonePage />
              </Layout>
            </ProtectedRoute>
          } />
          <Route path="/challenges" element={
            <ProtectedRoute>
              <Layout onToggleTheme={toggleTheme} isDark={isDark}>
                <LanguageChallengesPage />
              </Layout>
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/reading" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
