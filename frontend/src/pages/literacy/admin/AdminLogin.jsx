// src/pages/admin/AdminLogin.jsx
// Hardcoded admin credentials — stored only in this file, never in the database
import { useState } from "react";
import s from "./AdminLogin.module.css";

// ── CHANGE THESE TO YOUR OWN CREDENTIALS ──────────────────
const ADMIN_USERS = [
  { username: "spacece_admin", password: "SpacECE@2025!", name: "Super Admin" },
  { username: "literacy_admin", password: "Lit@2025!",  name: "Literacy Admin" },
];
// ──────────────────────────────────────────────────────────

export default function AdminLogin({ onLogin }) {
  const [form, setForm]   = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy]   = useState(false);
  const [show, setShow]   = useState(false);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setBusy(true);
    await new Promise(r => setTimeout(r, 600)); // small delay feels more secure
    const match = ADMIN_USERS.find(
      u => u.username === form.username && u.password === form.password
    );
    if (match) {
      sessionStorage.setItem("admin_auth", JSON.stringify({ name: match.name, ts: Date.now() }));
      onLogin(match);
    } else {
      setError("Invalid username or password.");
    }
    setBusy(false);
  };

  return (
    <div className={s.page}>
      <div className={s.card}>
        <div className={s.icon}>🔐</div>
        <h1 className={s.heading}>Admin Access</h1>
        <p className={s.sub}>SpacECE Literacy Panel — Restricted</p>

        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="form-input" type="text" autoComplete="off"
              placeholder="Enter admin username"
              value={form.username} onChange={set("username")} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position:"relative" }}>
              <input className="form-input" type={show ? "text" : "password"}
                placeholder="Enter admin password" style={{ paddingRight: 48 }}
                value={form.password} onChange={set("password")} required />
              <button type="button" onClick={() => setShow(p => !p)}
                style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
                  background:"none", border:"none", fontSize:18, cursor:"pointer", color:"var(--color-text-secondary)" }}>
                {show ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {error && <p className="form-error" style={{ marginBottom:12 }}>⚠️ {error}</p>}

          <button className={s.submitBtn} type="submit" disabled={busy}>
            {busy ? "Verifying..." : "🚀 Login to Admin Panel"}
          </button>
        </form>

        <p className={s.note}>
          🔒 This panel is restricted to SpacECE administrators only.
        </p>
      </div>
    </div>
  );
}
