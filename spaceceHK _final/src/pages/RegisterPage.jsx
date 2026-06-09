// src/pages/RegisterPage.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import s from "./AuthPage.module.css";

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [form, setForm]   = useState({ name:"", email:"", password:"", confirm:"" });
  const [error, setError] = useState("");
  const [busy, setBusy]   = useState(false);

  const set = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Passwords do not match."); return; }
    if (form.password.length < 6)       { setError("Password must be at least 6 characters."); return; }
    setBusy(true);
    try {
      await register(form.email, form.password, form.name);
      navigate("/reading");
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally { setBusy(false); }
  };

  return (
    <div className={s.page}>
      <div className={s.card}>
        <div className={s.logo}>✨</div>
        <h1 className={s.heading}>Create Account</h1>
        <p className={s.sub}>Join SpacECE Literacy Universe</p>
        <form onSubmit={submit}>
          {[
            { key:"name",     label:"Your Name",        type:"text",     ph:"e.g. Harsh" },
            { key:"email",    label:"Email",             type:"email",    ph:"your@email.com" },
            { key:"password", label:"Password",          type:"password", ph:"Min 6 characters" },
            { key:"confirm",  label:"Confirm Password",  type:"password", ph:"Re-enter password" },
          ].map(f => (
            <div key={f.key} className="form-group">
              <label className="form-label">{f.label}</label>
              <input className="form-input" type={f.type} placeholder={f.ph}
                value={form[f.key]} onChange={set(f.key)} required />
            </div>
          ))}
          {error && <p className="form-error">⚠️ {error}</p>}
          <button className={`btn btn-primary ${s.submitBtn}`} type="submit" disabled={busy}>
            {busy ? "Creating account..." : "Register 🎉"}
          </button>
        </form>
        <p className={s.switch}>Already have an account? <Link to="/login" className={s.link}>Login here</Link></p>
      </div>
    </div>
  );
}
