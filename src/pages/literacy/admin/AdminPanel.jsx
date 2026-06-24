// src/pages/literacy/admin/AdminPanel.jsx
import { useState, useEffect } from "react";
import AdminLogin      from "./AdminLogin";
import AdminStories    from "./AdminStories";
import AdminVocab      from "./AdminVocab";
import AdminActivities from "./AdminActivities";
import AdminScores     from "./AdminScores";
import { useNavigate } from "react-router-dom";
import s from "./AdminPanel.module.css";

const TABS = [
  { id: "stories",    icon: "📚", label: "Stories"    },
  { id: "vocab",      icon: "🔤", label: "Vocabulary"  },
  { id: "activities", icon: "🎯", label: "Activities"  },
  { id: "scores",     icon: "📊", label: "Scores"      },
];

/**
 * LiteracyAdminContent — content only, no login wall, no sidebar.
 * Used inside the Firebase Admin dashboard (/admin/literacy).
 */
export function LiteracyAdminContent() {
  const [tab, setTab] = useState("stories");
  return (
    <div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24, borderBottom: "2px solid var(--color-border,#eee)", paddingBottom: 12 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              padding: "8px 18px", borderRadius: 20, border: "none", cursor: "pointer",
              fontWeight: 800, fontSize: 14, fontFamily: "inherit",
              background: tab === t.id ? "linear-gradient(135deg,#7C4DFF,#B388FF)" : "#f3f4f6",
              color:      tab === t.id ? "#fff" : "#374151",
              boxShadow:  tab === t.id ? "0 4px 12px rgba(124,77,255,0.3)" : "none",
              transition: "all .18s",
            }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>
      {tab === "stories"    && <AdminStories />}
      {tab === "vocab"      && <AdminVocab />}
      {tab === "activities" && <AdminActivities />}
      {tab === "scores"     && <AdminScores />}
    </div>
  );
}

/**
 * Default export — standalone literacy admin with its own login wall.
 * Accessible at /literacy-admin without Firebase auth.
 */
export default function AdminPanel() {
  const [admin, setAdmin]       = useState(null);
  const [tab, setTab]           = useState("stories");
  const [sideOpen, setSideOpen] = useState(false);
  const navigate                = useNavigate();

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("admin_auth");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Date.now() - parsed.ts < 8 * 60 * 60 * 1000) setAdmin(parsed);
        else sessionStorage.removeItem("admin_auth");
      }
    } catch { sessionStorage.removeItem("admin_auth"); }
  }, []);

  const handleLogout = () => { sessionStorage.removeItem("admin_auth"); setAdmin(null); };

  if (!admin) return <AdminLogin onLogin={setAdmin} />;

  return (
    <div className={s.layout}>
      {sideOpen && <div className={s.overlay} onClick={() => setSideOpen(false)} />}

      <aside className={`${s.sidebar} ${sideOpen ? s.sidebarOpen : ""}`}>
        <div className={s.brand}>
          <img src="/logo.png" alt="SpacECE" className={s.logo} onError={e => { e.target.style.display = "none"; }} />
          <div className={s.brandText}>
            <span className={s.brandName}>SpacECE</span>
            <span className={s.brandSub}>Admin Panel</span>
          </div>
        </div>
        <div className={s.adminBadge}>👤 {admin.name}</div>
        <nav className={s.nav}>
          {TABS.map(t => (
            <button key={t.id}
              className={`${s.navBtn} ${tab === t.id ? s.navActive : ""}`}
              onClick={() => { setTab(t.id); setSideOpen(false); }}>
              <span className={s.navIcon}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </nav>
        <div className={s.sideBottom}>
          <button className={s.backBtn} onClick={() => navigate("/child/reading-world")}>← Back to App</button>
          <button className={s.logoutBtn} onClick={handleLogout}>🚪 Logout</button>
        </div>
      </aside>

      <main className={s.main}>
        <div className={s.topbar}>
          <button className={s.menuBtn} onClick={() => setSideOpen(o => !o)}>☰</button>
          <h1 className={s.pageTitle}>
            {TABS.find(t => t.id === tab)?.icon}&nbsp;
            {TABS.find(t => t.id === tab)?.label} Management
          </h1>
        </div>
        <div className={s.content}>
          {tab === "stories"    && <AdminStories />}
          {tab === "vocab"      && <AdminVocab />}
          {tab === "activities" && <AdminActivities />}
          {tab === "scores"     && <AdminScores />}
        </div>
      </main>
    </div>
  );
}