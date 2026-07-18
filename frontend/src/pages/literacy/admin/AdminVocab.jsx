// src/pages/admin/AdminVocab.jsx — Fixed CRUD for Vocabulary Flashcards + Word Builder + Picture Match
import { useState, useEffect } from "react";
import {
  getVocabularyGames, addVocabGame, updateVocabGame, deleteVocabGame,
  getWordBuilderList, addWordBuilderItem, updateWordBuilderItem, deleteWordBuilderItem,
  getPictureMatchItems, addPictureMatchItem, updatePictureMatchItem, deletePictureMatchItem,
} from '../../../api/literacyService';
import s from "./Admin.module.css";

function Toast({ msg }) { return msg ? <div className={s.toast}>{msg}</div> : null; }

const VOCAB_BLANK = { emoji:"", word:"", meaning:"", age_group:"4-6" };
const WB_BLANK    = { emoji:"", word:"", hint:"", age_group:"4-6" };
const PM_BLANK    = { emoji:"", word:"", age_group:"4-6" };

const DEFAULT_VOCAB_IDS = new Set(["dv1","dv2","dv3","dv4","dv5","dv6","dv7","dv8","dv9","dv10"]);
const DEFAULT_WB_IDS    = new Set(["dwb1","dwb2","dwb3","dwb4","dwb5","dwb6","dwb7","dwb8"]);
const DEFAULT_PM_IDS    = new Set(["pm1","pm2","pm3","pm4","pm5","pm6","pm7","pm8","pm9","pm10"]);

const DEFAULT_VOCAB = [
  { id:"dv1",  emoji:"🐘", word:"Elephant", meaning:"A large grey animal with a long trunk",  age_group:"4-6" },
  { id:"dv2",  emoji:"🌺", word:"Flower",   meaning:"A colourful bloom on a plant",            age_group:"4-6" },
  { id:"dv3",  emoji:"🍎", word:"Apple",    meaning:"A round red or green fruit",              age_group:"1-3" },
  { id:"dv4",  emoji:"🌊", word:"Wave",     meaning:"Water moving up and down",                age_group:"7-10" },
  { id:"dv5",  emoji:"🦋", word:"Butterfly",meaning:"A colourful flying insect",               age_group:"4-6" },
  { id:"dv6",  emoji:"⛰️", word:"Mountain", meaning:"A very tall hill of land",                age_group:"7-10" },
  { id:"dv7",  emoji:"🌙", word:"Moon",     meaning:"Earth's natural satellite",               age_group:"1-3" },
  { id:"dv8",  emoji:"🎨", word:"Colour",   meaning:"What we see in light — red, blue...",     age_group:"4-6" },
  { id:"dv9",  emoji:"🐸", word:"Frog",     meaning:"A green animal that jumps and croaks",    age_group:"1-3" },
  { id:"dv10", emoji:"🏠", word:"House",    meaning:"A building where people live",            age_group:"1-3" },
];
const DEFAULT_WB = [
  { id:"dwb1", emoji:"🐸", word:"FROG",     hint:"It jumps and says ribbit 🐸", age_group:"4-6" },
  { id:"dwb2", emoji:"🌸", word:"FLOWER",   hint:"Pretty and found in gardens 🌸", age_group:"4-6" },
  { id:"dwb3", emoji:"🦁", word:"LION",     hint:"King of the jungle 🦁", age_group:"4-6" },
  { id:"dwb4", emoji:"🍎", word:"APPLE",    hint:"A red juicy fruit 🍎", age_group:"1-3" },
  { id:"dwb5", emoji:"🐟", word:"FISH",     hint:"Lives in water 🐟", age_group:"1-3" },
  { id:"dwb6", emoji:"🌙", word:"MOON",     hint:"Shines at night 🌙", age_group:"1-3" },
  { id:"dwb7", emoji:"🐘", word:"ELEPHANT", hint:"Has a long trunk 🐘", age_group:"4-6" },
  { id:"dwb8", emoji:"🏠", word:"HOUSE",    hint:"Where we live 🏠", age_group:"1-3" },
];
const DEFAULT_PM = [
  { id:"pm1",  emoji:"🐶", word:"Dog",    age_group:"1-3" },
  { id:"pm2",  emoji:"🐱", word:"Cat",    age_group:"1-3" },
  { id:"pm3",  emoji:"🐦", word:"Bird",   age_group:"1-3" },
  { id:"pm4",  emoji:"🐠", word:"Fish",   age_group:"1-3" },
  { id:"pm5",  emoji:"🌳", word:"Tree",   age_group:"4-6" },
  { id:"pm6",  emoji:"☀️", word:"Sun",    age_group:"1-3" },
  { id:"pm7",  emoji:"🌙", word:"Moon",   age_group:"1-3" },
  { id:"pm8",  emoji:"🍎", word:"Apple",  age_group:"1-3" },
  { id:"pm9",  emoji:"🏠", word:"House",  age_group:"1-3" },
  { id:"pm10", emoji:"🌸", word:"Flower", age_group:"4-6" },
];

const SUB_TABS = [
  { id:"flashcards",  label:"🃏 Vocabulary Flashcards" },
  { id:"wordbuilder", label:"🔡 Word Builder" },
  { id:"picturematch",label:"🎯 Picture Match" },
];

/* ── FLASHCARDS ADMIN ── */
function FlashcardsAdmin() {
  const [items, setItems]     = useState([]);
  const [form, setForm]       = useState(VOCAB_BLANK);
  const [editId, setEditId]   = useState(null);  // null = add mode, string = edit mode
  const [loading, setLoading] = useState(true);
  const [busy, setBusy]       = useState(false);
  const [toast, setToast]     = useState("");
  const [filter, setFilter]   = useState("All");

  const showToast = m => { setToast(m); setTimeout(()=>setToast(""),2500); };
  const setF = (k,v) => setForm(p=>({...p,[k]:v}));

  const load = async () => {
    setLoading(true);
    const fs = await getVocabularyGames();
    const fsIds = new Set(fs.map(x=>x.id));
    setItems([...fs, ...DEFAULT_VOCAB.filter(d=>!fsIds.has(d.id))]);
    setLoading(false);
  };
  useEffect(()=>{ load(); },[]);

  const handleSubmit = async () => {
    if (!form.word.trim() || !form.meaning.trim()) { showToast("⚠️ Word aur Meaning zaroori hai!"); return; }
    if (busy) return;
    setBusy(true);
    try {
      if (editId) {
        if (DEFAULT_VOCAB_IDS.has(editId)) {
          // Default item — save as new custom entry in database
          await addVocabGame(form);
          showToast("✅ Default card customised & Database mein save ho gaya!");
        } else {
          await updateVocabGame(editId, form);
          showToast("✅ Vocabulary card update ho gaya!");
        }
      } else {
        await addVocabGame(form);
        showToast("✅ Naya card add ho gaya!");
      }
      setForm(VOCAB_BLANK);
      setEditId(null);
      await load();
    } catch(err) {
      showToast("❌ Error: " + (err.message || "Try again"));
    }
    setBusy(false);
  };

  const startEdit = it => {
    setEditId(it.id);
    setForm({ emoji:it.emoji||"", word:it.word||"", meaning:it.meaning||"", age_group:it.age_group||"4-6" });
    window.scrollTo({top:0,behavior:"smooth"});
  };

  const cancelEdit = () => { setForm(VOCAB_BLANK); setEditId(null); };

  const handleDelete = async id => {
    if (DEFAULT_VOCAB_IDS.has(id)) {
      showToast("ℹ️ Default cards built-in hain. Edit karke save karein custom version.");
      return;
    }
    if (!window.confirm("Ye vocabulary card permanently delete karein?")) return;
    if (busy) return;
    setBusy(true);
    try {
      await deleteVocabGame(id);
      showToast("🗑️ Card delete ho gaya!");
      await load();
    } catch(err) {
      showToast("❌ Delete fail hua: " + (err.message || "Try again"));
    }
    setBusy(false);
  };

  const filtered = filter==="All" ? items : items.filter(x=>x.age_group===filter);

  return (
    <>
      <Toast msg={toast} />
      <div className={s.statGrid}>
        <div className={s.statCard}><span className={s.statNum}>{items.length}</span><span className={s.statLabel}>Total Cards</span></div>
        <div className={s.statCard}><span className={s.statNum}>{items.filter(x=>x.age_group==="1-3").length}</span><span className={s.statLabel}>Age 1–3</span></div>
        <div className={s.statCard}><span className={s.statNum}>{items.filter(x=>x.age_group==="4-6").length}</span><span className={s.statLabel}>Age 4–6</span></div>
        <div className={s.statCard}><span className={s.statNum}>{items.filter(x=>x.age_group==="7-10").length}</span><span className={s.statLabel}>Age 7–10</span></div>
      </div>

      <div className={s.section}>
        <div className={s.sectionHead}>
          <h2 className={s.sectionTitle}>{editId ? "✏️ Edit Vocabulary Card" : "➕ Add Vocabulary Card"}</h2>
          {editId && <button className="btn btn-ghost" onClick={cancelEdit}>✕ Cancel</button>}
        </div>
        <div className={s.formCard}>
          <div className={s.formGrid}>
            <div className="form-group">
              <label className="form-label">Emoji</label>
              <input className="form-input" value={form.emoji} onChange={e=>setF("emoji",e.target.value)} placeholder="🐘" />
            </div>
            <div className="form-group">
              <label className="form-label">Word *</label>
              <input className="form-input" value={form.word} onChange={e=>setF("word",e.target.value)} placeholder="e.g. Elephant" />
            </div>
            <div className="form-group">
              <label className="form-label">Age Group</label>
              <select className="form-input" value={form.age_group} onChange={e=>setF("age_group",e.target.value)}>
                <option value="1-3">1–3</option><option value="4-6">4–6</option><option value="7-10">7–10</option>
              </select>
            </div>
          </div>
          <div className="form-group" style={{marginTop:8}}>
            <label className="form-label">Meaning / Definition *</label>
            <input className="form-input" value={form.meaning} onChange={e=>setF("meaning",e.target.value)} placeholder="e.g. A large grey animal with a long trunk" />
          </div>
          <div className={s.formActions}>
            {editId && <button className="btn btn-ghost" onClick={cancelEdit}>✕ Cancel</button>}
            <button className="btn btn-primary" onClick={handleSubmit} disabled={busy}>
              {busy ? "Saving..." : editId ? "💾 Save Changes" : "➕ Add Card"}
            </button>
          </div>
        </div>
      </div>

      <div className={s.section}>
        <div className={s.sectionHead}>
          <h2 className={s.sectionTitle}>📋 All Vocabulary Cards ({filtered.length})</h2>
          <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
            {["All","1-3","4-6","7-10"].map(f=>(
              <button key={f} className={`${s.chipBtn} ${filter===f?s.chipActive:""}`} onClick={()=>setFilter(f)}>
                {f==="All"?"All Ages":`Age ${f}`}
              </button>
            ))}
          </div>
        </div>
        <div className={s.tableWrap} style={{overflowX:"auto"}}>
          <table className={s.table}>
            <thead><tr><th>Emoji</th><th>Word</th><th>Meaning</th><th>Age</th><th>Type</th><th>Actions</th></tr></thead>
            <tbody>
              {loading
                ? <tr><td colSpan={6} className={s.empty}>Loading...</td></tr>
                : filtered.length===0
                ? <tr><td colSpan={6} className={s.empty}>Koi card nahi mila.</td></tr>
                : filtered.map(it=>(
                  <tr key={it.id}>
                    <td style={{fontSize:24}}>{it.emoji}</td>
                    <td><strong>{it.word}</strong></td>
                    <td style={{fontSize:13,color:"var(--color-text-secondary)"}}>{it.meaning}</td>
                    <td><span className={`${s.badge} ${s.badgeBlue}`}>Age {it.age_group}</span></td>
                    <td>
                      {DEFAULT_VOCAB_IDS.has(it.id)
                        ? <span className={`${s.badge} ${s.badgeOrange}`}>Default</span>
                        : <span className={`${s.badge} ${s.badgeGreen}`}>Custom</span>
                      }
                    </td>
                    <td style={{whiteSpace:"nowrap"}}>
                      <button className={s.iconBtn} onClick={()=>startEdit(it)} disabled={busy} title="Edit">✏️</button>
                      <button className={`${s.iconBtn} ${s.deleteBtn}`} onClick={()=>handleDelete(it.id)} disabled={busy} title="Delete">🗑️</button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ── WORD BUILDER ADMIN ── */
function WordBuilderAdmin() {
  const [items, setItems]     = useState([]);
  const [form, setForm]       = useState(WB_BLANK);
  const [editId, setEditId]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy]       = useState(false);
  const [toast, setToast]     = useState("");

  const showToast = m => { setToast(m); setTimeout(()=>setToast(""),2500); };
  const setF = (k,v) => setForm(p=>({...p,[k]:v}));

  const load = async () => {
    setLoading(true);
    const fs = await getWordBuilderList();
    const fsIds = new Set(fs.map(x=>x.id));
    setItems([...fs, ...DEFAULT_WB.filter(d=>!fsIds.has(d.id))]);
    setLoading(false);
  };
  useEffect(()=>{ load(); },[]);

  const handleSubmit = async () => {
    if (!form.word.trim() || !form.hint.trim()) { showToast("⚠️ Word aur Hint zaroori hai!"); return; }
    if (busy) return;
    const data = { ...form, word: form.word.toUpperCase().trim() };
    setBusy(true);
    try {
      if (editId) {
        if (DEFAULT_WB_IDS.has(editId)) {
          await addWordBuilderItem(data);
          showToast("✅ Default word customised & save ho gaya!");
        } else {
          await updateWordBuilderItem(editId, data);
          showToast("✅ Word update ho gaya!");
        }
      } else {
        await addWordBuilderItem(data);
        showToast("✅ Naya word add ho gaya!");
      }
      setForm(WB_BLANK);
      setEditId(null);
      await load();
    } catch(err) {
      showToast("❌ Error: " + (err.message || "Try again"));
    }
    setBusy(false);
  };

  const startEdit = it => {
    setEditId(it.id);
    setForm({ emoji:it.emoji||"", word:it.word||"", hint:it.hint||"", age_group:it.age_group||"4-6" });
    window.scrollTo({top:0,behavior:"smooth"});
  };

  const cancelEdit = () => { setForm(WB_BLANK); setEditId(null); };

  const handleDelete = async id => {
    if (DEFAULT_WB_IDS.has(id)) { showToast("ℹ️ Default words built-in hain. Edit karke save karein custom version."); return; }
    if (!window.confirm("Ye word permanently delete karein?")) return;
    if (busy) return;
    setBusy(true);
    try {
      await deleteWordBuilderItem(id);
      showToast("🗑️ Word delete ho gaya!");
      await load();
    } catch(err) {
      showToast("❌ Delete fail hua: " + (err.message || "Try again"));
    }
    setBusy(false);
  };

  return (
    <>
      <Toast msg={toast} />
      <div className={s.section}>
        <div className={s.sectionHead}>
          <h2 className={s.sectionTitle}>{editId ? "✏️ Edit Word" : "➕ Add Word Builder Entry"}</h2>
          {editId && <button className="btn btn-ghost" onClick={cancelEdit}>✕ Cancel</button>}
        </div>
        <div className={s.formCard}>
          <div className={s.formGrid}>
            <div className="form-group">
              <label className="form-label">Emoji</label>
              <input className="form-input" value={form.emoji} onChange={e=>setF("emoji",e.target.value)} placeholder="🐸" />
            </div>
            <div className="form-group">
              <label className="form-label">Word * (uppercase)</label>
              <input className="form-input" value={form.word} onChange={e=>setF("word",e.target.value.toUpperCase())} placeholder="e.g. FROG" />
            </div>
            <div className="form-group">
              <label className="form-label">Age Group</label>
              <select className="form-input" value={form.age_group} onChange={e=>setF("age_group",e.target.value)}>
                <option value="1-3">1–3</option><option value="4-6">4–6</option><option value="7-10">7–10</option>
              </select>
            </div>
          </div>
          <div className="form-group" style={{marginTop:8}}>
            <label className="form-label">Hint *</label>
            <input className="form-input" value={form.hint} onChange={e=>setF("hint",e.target.value)} placeholder="e.g. It jumps and says ribbit 🐸" />
          </div>
          <div className={s.formActions}>
            {editId && <button className="btn btn-ghost" onClick={cancelEdit}>✕ Cancel</button>}
            <button className="btn btn-primary" onClick={handleSubmit} disabled={busy}>
              {busy ? "Saving..." : editId ? "💾 Save Changes" : "➕ Add Word"}
            </button>
          </div>
        </div>
      </div>

      <div className={s.section}>
        <h2 className={s.sectionTitle} style={{marginBottom:12}}>📋 All Word Builder Words ({items.length})</h2>
        <div className={s.tableWrap} style={{overflowX:"auto"}}>
          <table className={s.table}>
            <thead><tr><th>Emoji</th><th>Word</th><th>Hint</th><th>Age</th><th>Type</th><th>Actions</th></tr></thead>
            <tbody>
              {loading
                ? <tr><td colSpan={6} className={s.empty}>Loading...</td></tr>
                : items.length===0
                ? <tr><td colSpan={6} className={s.empty}>Koi word nahi mila.</td></tr>
                : items.map(it=>(
                  <tr key={it.id}>
                    <td style={{fontSize:24}}>{it.emoji}</td>
                    <td><strong style={{letterSpacing:2,fontFamily:"monospace",fontSize:15}}>{it.word}</strong></td>
                    <td style={{fontSize:13,color:"var(--color-text-secondary)"}}>{it.hint}</td>
                    <td><span className={`${s.badge} ${s.badgeBlue}`}>Age {it.age_group||"4-6"}</span></td>
                    <td>
                      {DEFAULT_WB_IDS.has(it.id)
                        ? <span className={`${s.badge} ${s.badgeOrange}`}>Default</span>
                        : <span className={`${s.badge} ${s.badgeGreen}`}>Custom</span>
                      }
                    </td>
                    <td style={{whiteSpace:"nowrap"}}>
                      <button className={s.iconBtn} onClick={()=>startEdit(it)} disabled={busy} title="Edit">✏️</button>
                      <button className={`${s.iconBtn} ${s.deleteBtn}`} onClick={()=>handleDelete(it.id)} disabled={busy} title="Delete">🗑️</button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ── PICTURE MATCH ADMIN ── */
function PictureMatchAdmin() {
  const [items, setItems]     = useState([]);
  const [form, setForm]       = useState(PM_BLANK);
  const [editId, setEditId]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy]       = useState(false);
  const [toast, setToast]     = useState("");

  const showToast = m => { setToast(m); setTimeout(()=>setToast(""),2500); };
  const setF = (k,v) => setForm(p=>({...p,[k]:v}));

  const load = async () => {
    setLoading(true);
    const fs = await getPictureMatchItems();
    const fsIds = new Set(fs.map(x=>x.id));
    setItems([...fs, ...DEFAULT_PM.filter(d=>!fsIds.has(d.id))]);
    setLoading(false);
  };
  useEffect(()=>{ load(); },[]);

  const handleSubmit = async () => {
    if (!form.word.trim() || !form.emoji.trim()) { showToast("⚠️ Emoji aur Word zaroori hain!"); return; }
    if (busy) return;
    const data = { ...form, word: form.word.trim() };
    setBusy(true);
    try {
      if (editId) {
        if (DEFAULT_PM_IDS.has(editId)) {
          await addPictureMatchItem(data);
          showToast("✅ Default item customised & save ho gaya!");
        } else {
          await updatePictureMatchItem(editId, data);
          showToast("✅ Item update ho gaya!");
        }
      } else {
        await addPictureMatchItem(data);
        showToast("✅ Naya item add ho gaya!");
      }
      setForm(PM_BLANK);
      setEditId(null);
      await load();
    } catch(err) {
      showToast("❌ Error: " + (err.message || "Try again"));
    }
    setBusy(false);
  };

  const startEdit = it => {
    setEditId(it.id);
    setForm({ emoji:it.emoji||"", word:it.word||"", age_group:it.age_group||"4-6" });
    window.scrollTo({top:0,behavior:"smooth"});
  };

  const cancelEdit = () => { setForm(PM_BLANK); setEditId(null); };

  const handleDelete = async id => {
    if (DEFAULT_PM_IDS.has(id)) { showToast("ℹ️ Default items built-in hain. Edit karke save karein custom version."); return; }
    if (!window.confirm("Ye picture match item permanently delete karein?")) return;
    if (busy) return;
    setBusy(true);
    try {
      await deletePictureMatchItem(id);
      showToast("🗑️ Item delete ho gaya!");
      await load();
    } catch(err) {
      showToast("❌ Delete fail hua: " + (err.message || "Try again"));
    }
    setBusy(false);
  };

  return (
    <>
      <Toast msg={toast} />
      <div className={s.statGrid}>
        <div className={s.statCard}><span className={s.statNum}>{items.length}</span><span className={s.statLabel}>Total Items</span></div>
        <div className={s.statCard}><span className={s.statNum}>{items.filter(x=>x.age_group==="1-3").length}</span><span className={s.statLabel}>Age 1–3</span></div>
        <div className={s.statCard}><span className={s.statNum}>{items.filter(x=>x.age_group==="4-6").length}</span><span className={s.statLabel}>Age 4–6</span></div>
        <div className={s.statCard}><span className={s.statNum}>{items.filter(x=>x.age_group==="7-10").length}</span><span className={s.statLabel}>Age 7–10</span></div>
      </div>

      <div className={s.section}>
        <div className={s.sectionHead}>
          <h2 className={s.sectionTitle}>{editId ? "✏️ Edit Picture Match Item" : "➕ Add Picture Match Item"}</h2>
          {editId && <button className="btn btn-ghost" onClick={cancelEdit}>✕ Cancel</button>}
        </div>
        <div className={s.formCard}>
          <div className={s.formGrid}>
            <div className="form-group">
              <label className="form-label">Emoji (picture) *</label>
              <input className="form-input" value={form.emoji} onChange={e=>setF("emoji",e.target.value)} placeholder="🐶" />
            </div>
            <div className="form-group">
              <label className="form-label">Word (label) *</label>
              <input className="form-input" value={form.word} onChange={e=>setF("word",e.target.value)} placeholder="e.g. Dog" />
            </div>
            <div className="form-group">
              <label className="form-label">Age Group</label>
              <select className="form-input" value={form.age_group} onChange={e=>setF("age_group",e.target.value)}>
                <option value="1-3">1–3</option><option value="4-6">4–6</option><option value="7-10">7–10</option>
              </select>
            </div>
          </div>
          <div className={s.formActions}>
            {editId && <button className="btn btn-ghost" onClick={cancelEdit}>✕ Cancel</button>}
            <button className="btn btn-primary" onClick={handleSubmit} disabled={busy}>
              {busy ? "Saving..." : editId ? "💾 Save Changes" : "➕ Add Item"}
            </button>
          </div>
        </div>
      </div>

      <div className={s.section}>
        <h2 className={s.sectionTitle} style={{marginBottom:6}}>📋 All Picture Match Items ({items.length})</h2>
        <p style={{fontSize:13,color:"var(--color-text-secondary)",marginBottom:12}}>
          Ye emoji-word pairs Picture Match game mein use hote hain. Kam se kam 4 items chahiye.
        </p>
        <div className={s.tableWrap} style={{overflowX:"auto"}}>
          <table className={s.table}>
            <thead><tr><th>Picture</th><th>Word</th><th>Age</th><th>Preview</th><th>Type</th><th>Actions</th></tr></thead>
            <tbody>
              {loading
                ? <tr><td colSpan={6} className={s.empty}>Loading...</td></tr>
                : items.length===0
                ? <tr><td colSpan={6} className={s.empty}>Koi item nahi mila.</td></tr>
                : items.map(it=>(
                  <tr key={it.id}>
                    <td style={{fontSize:32}}>{it.emoji}</td>
                    <td><strong>{it.word}</strong></td>
                    <td><span className={`${s.badge} ${s.badgeBlue}`}>Age {it.age_group||"4-6"}</span></td>
                    <td>
                      <div style={{display:"flex",flexDirection:"column",alignItems:"center",background:"var(--color-bg-elevated)",borderRadius:8,padding:"6px 12px",width:60}}>
                        <span style={{fontSize:22}}>{it.emoji}</span>
                        <span style={{fontSize:11,fontWeight:700}}>{it.word}</span>
                      </div>
                    </td>
                    <td>
                      {DEFAULT_PM_IDS.has(it.id)
                        ? <span className={`${s.badge} ${s.badgeOrange}`}>Default</span>
                        : <span className={`${s.badge} ${s.badgeGreen}`}>Custom</span>
                      }
                    </td>
                    <td style={{whiteSpace:"nowrap"}}>
                      <button className={s.iconBtn} onClick={()=>startEdit(it)} disabled={busy} title="Edit">✏️</button>
                      <button className={`${s.iconBtn} ${s.deleteBtn}`} onClick={()=>handleDelete(it.id)} disabled={busy} title="Delete">🗑️</button>
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

/* ── MAIN EXPORT ── */
export default function AdminVocab() {
  const [subTab, setSubTab] = useState("flashcards");
  return (
    <>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:24,borderBottom:"2px solid var(--color-border)",paddingBottom:12}}>
        {SUB_TABS.map(t=>(
          <button key={t.id}
            className={`${s.chipBtn} ${subTab===t.id?s.chipActive:""}`}
            style={{fontSize:14,padding:"8px 16px"}}
            onClick={()=>setSubTab(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      {subTab==="flashcards"   && <FlashcardsAdmin />}
      {subTab==="wordbuilder"  && <WordBuilderAdmin />}
      {subTab==="picturematch" && <PictureMatchAdmin />}
    </>
  );
}
