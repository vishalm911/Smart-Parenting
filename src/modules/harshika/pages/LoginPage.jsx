// src/pages/LoginPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import s from "./AuthPage.module.css";

const ERR = {
  "auth/user-not-found":    "No account found with this email.",
  "auth/wrong-password":    "Incorrect password. Please try again.",
  "auth/invalid-credential":"Invalid email or password.",
  "auth/invalid-email":     "Please enter a valid email address.",
  "auth/too-many-requests": "Too many attempts. Please wait and try again.",
};

export default function LoginPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [form, setForm]   = useState({ email:"", password:"" });
  const [error, setError] = useState("");
  const [busy, setBusy]   = useState(false);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError(""); setBusy(true);
    try {
      await login(form.email, form.password);
      navigate("/reading");
    } catch (err) {
      setError(ERR[err.code] || "Something went wrong. Please try again.");
    } finally { setBusy(false); }
  };

  return (
    <div className={s.page}>
      <div className={s.card}>
        <div className={s.logo}>📚</div>
        <h1 className={s.heading}>Welcome Back!</h1>
        <p className={s.sub}>Login to SpacECE Literacy Universe</p>
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" placeholder="your@email.com"
              value={form.email} onChange={set("email")} required />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="••••••••"
              value={form.password} onChange={set("password")} required />
          </div>
          {error && <p className="form-error">⚠️ {error}</p>}
          <button className={`btn btn-primary ${s.submitBtn}`} type="submit" disabled={busy}>
            {busy ? "Logging in..." : "Login 🚀"}
          </button>
        </form>
        <p className={s.switch}>Don't have an account? <Link to="/register" className={s.link}>Register here</Link></p>
      </div>
    </div>
  );
}
