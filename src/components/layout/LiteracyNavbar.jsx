// src/components/Navbar.jsx
import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import s from "./Navbar.module.css";

const LINKS = [
  { to:"/reading",    label:"📖 Reading World" },
  { to:"/story",      label:"🌟 Story World" },
  { to:"/vocabulary", label:"🔤 Vocabulary Zone" },
  { to:"/challenges", label:"🎯 Challenges" },
];

export default function Navbar({ onToggleTheme, isDark }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => { await logout(); navigate("/login"); };

  return (
    <nav className={s.nav}>
      {/* Logo — replace /logo.png with your actual logo file in /public */}
      <div className={s.logoWrap} onClick={() => navigate("/reading")}>
        <img src="/logo.png" alt="SpacECE" className={s.logoImg}
          onError={e => { e.target.style.display="none"; }} />
        <span className={s.logoText}>SpacECE</span>
      </div>

      <div className={`${s.links} ${open ? s.open : ""}`}>
        {LINKS.map(l => (
          <NavLink key={l.to} to={l.to}
            className={({ isActive }) => `${s.link} ${isActive ? s.active : ""}`}
            onClick={() => setOpen(false)}>
            {l.label}
          </NavLink>
        ))}
      </div>

      <div className={s.right}>
        {user && (
          <NavLink to="/admin" className={s.adminBtn} onClick={() => setOpen(false)}>
            ⚙️ Admin
          </NavLink>
        )}
        {user && <span className={s.user}>👤 {user.displayName || "User"}</span>}
        <button className={s.iconBtn} onClick={onToggleTheme}>{isDark ? "☀️" : "🌙"}</button>
        {user && <button className={s.logoutBtn} onClick={handleLogout}>Logout</button>}
        <button className={s.burger} onClick={() => setOpen(p => !p)}>{open ? "✕" : "☰"}</button>
      </div>
    </nav>
  );
}
