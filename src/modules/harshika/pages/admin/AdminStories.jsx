// src/pages/admin/AdminStories.jsx — Multiple quiz support + mobile responsive
import { useState, useEffect } from "react";
import {
  getStories, addStory, updateStory, deleteStory,
} from "../../firebase/firestoreService";
import { storiesData } from "../../data/storiesData";
import s  from "./Admin.module.css";

const BLANK_META = {
  title:"", emoji:"📖", age_group:"4-6", difficulty:"Easy",
  language:"English", estimated_time:"5 min",
  cover_gradient:"linear-gradient(135deg,#FFD180,#F5A623)", is_featured:false,
};
const BLANK_QUIZ  = { question:"", options:["","","",""], correct:0 };

function Toast({ msg }) { return msg ? <div className={s.toast}>{msg}</div> : null; }

export default function AdminStories() {
  const [stories, setStories]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [busy, setBusy]         = useState(false);
  const [toast, setToast]       = useState("");

  const [meta, setMeta]         = useState(BLANK_META);
  const [pages, setPages]       = useState([""]);
  const [quizzes, setQuizzes]   = useState([{ ...BLANK_QUIZ }]);
  const [editingId, setEditingId] = useState(null);
  const [section, setSection]   = useState("meta");

  const showToast = m => { setToast(m); setTimeout(()=>setToast(""),2800); };

  const load = async () => {
    setLoading(true);
    const fs = await getStories();
    const fsMarked = fs.map(x => ({...x, _fromFS: true}));
    setStories(fsMarked.length ? fsMarked : storiesData);
    setLoading(false);
  };
  useEffect(()=>{ load(); },[]);

  const setM = k => e => {
    const v = e.target.type==="checkbox" ? e.target.checked : e.target.value;
    setMeta(p=>({...p,[k]:v}));
  };

  // PAGES handlers
  const setPage = (i,v) => setPages(p=>{ const n=[...p]; n[i]=v; return n; });
  const addPage    = ()  => setPages(p=>[...p,""]);
  const removePage = i   => setPages(p=>p.filter((_,idx)=>idx!==i));

  // QUIZ handlers — multiple quizzes
  const addQuiz = () => setQuizzes(q=>[...q,{...BLANK_QUIZ}]);
  const removeQuiz = i => setQuizzes(q=>q.filter((_,idx)=>idx!==i));
  const setQuizField = (qi, field, val) => setQuizzes(q=>{
    const n=[...q]; n[qi]={...n[qi],[field]:val}; return n;
  });
  const setQuizOpt = (qi,oi,val) => setQuizzes(q=>{
    const n=[...q];
    const opts=[...n[qi].options]; opts[oi]=val;
    n[qi]={...n[qi],options:opts}; return n;
  });

  const handleSubmit = async () => {
    if (!String(meta.title||"").trim()) { showToast("⚠️ Story title is required!"); return; }
    const safePages = pages.map(p=>String(p||""));
    if (safePages.every(p=>!p.trim())) { showToast("⚠️ Add at least one page of content!"); return; }
    setBusy(true);
    // Strip trailing semicolons from cover_gradient (common copy-paste mistake)
    const cleanGradient = String(meta.cover_gradient||"").replace(/;+$/,"").trim();
    const validQuizzes = quizzes.filter(q=>String(q.question||"").trim() && q.options.some(o=>String(o||"").trim()));
    const payload = {
      ...meta,
      cover_gradient: cleanGradient,
      pages: safePages.filter(p=>p.trim()),
      // Keep backward compat: first quiz also stored as `quiz`
      quiz: validQuizzes.length>0 ? {
        question: validQuizzes[0].question,
        options:  validQuizzes[0].options.filter(o=>String(o||"").trim()),
        correct:  Number(validQuizzes[0].correct),
      } : null,
      quizzes: validQuizzes.map(q=>({
        question: q.question,
        options: q.options.filter(o=>String(o||"").trim()),
        correct: Number(q.correct),
      })),
    };
    if (editingId) {
      await updateStory(editingId, payload);
      showToast("✅ Story updated!");
    } else {
      await addStory(payload);
      showToast("✅ Story added!");
    }
    resetForm();
    await load(); setBusy(false);
  };

  const resetForm = () => {
    setMeta(BLANK_META); setPages([""]); setQuizzes([{...BLANK_QUIZ}]);
    setEditingId(null); setSection("meta");
  };

  const startEdit = st => {
    setEditingId(st.id);
    setMeta({
      title:st.title||"", emoji:st.emoji||"📖", age_group:st.age_group||"4-6",
      difficulty:st.difficulty||"Easy", language:st.language||"English",
      estimated_time:st.estimated_time||"5 min",
      cover_gradient:st.cover_gradient||"linear-gradient(135deg,#FFD180,#F5A623)",
      is_featured:st.is_featured||false,
    });
    setPages(st.pages?.length ? st.pages.map(p=>String(p||"")) : [""]);
    // Load quizzes — support both old `quiz` field and new `quizzes` array
    if (st.quizzes?.length) {
      setQuizzes(st.quizzes.map(q=>({
        question:q.question||"", options:q.options?.length===4?q.options:["","","",""], correct:q.correct||0
      })));
    } else if (st.quiz?.question) {
      setQuizzes([{ question:st.quiz.question, options:st.quiz.options||["","","",""], correct:st.quiz.correct||0 }]);
    } else {
      setQuizzes([{...BLANK_QUIZ}]);
    }
    setSection("meta");
    window.scrollTo({top:0,behavior:"smooth"});
  };

  const handleDelete = async st => {
    if (!st._fromFS) {
      showToast("ℹ️ This is a default story. Add it via the form to create a custom version.");
      return;
    }
    if (!window.confirm("Delete this story permanently?")) return;
    setBusy(true);
    try {
      await deleteStory(st.id);
      showToast("🗑️ Story deleted!");
      await load();
    } catch(err) { showToast("❌ Delete failed: " + (err.message||"Try again")); }
    setBusy(false);
  };

  const SECTIONS = ["meta","pages","quiz"];
  const SLABELS  = ["📝 Basic Info","📄 Story Pages","❓ Quizzes"];

  return (
    <>
      <Toast msg={toast} />

      {/* Stats */}
      <div className={s.statGrid}>
        <div className={s.statCard}><span className={s.statNum}>{stories.length}</span><span className={s.statLabel}>Total Stories</span></div>
        <div className={s.statCard}><span className={s.statNum}>{stories.filter(x=>x.is_featured).length}</span><span className={s.statLabel}>Featured</span></div>
        <div className={s.statCard}><span className={s.statNum}>{[...new Set(stories.map(x=>x.language))].length}</span><span className={s.statLabel}>Languages</span></div>
        <div className={s.statCard}><span className={s.statNum}>{stories.filter(x=>x.age_group==="1-3").length}</span><span className={s.statLabel}>Age 1–3</span></div>
      </div>

      {/* FORM */}
      <div className={s.section}>
        <div className={s.sectionHead}>
          <h2 className={s.sectionTitle}>{editingId ? "✏️ Edit Story" : "➕ Add New Story"}</h2>
          {editingId && <button className="btn btn-ghost" onClick={resetForm}>✕ Cancel</button>}
        </div>

        <div className={s.stepTabs}>
          {SECTIONS.map((sec,i)=>(
            <button key={sec}
              className={`${s.stepTab} ${section===sec?s.stepActive:""}`}
              onClick={()=>setSection(sec)}>
              {SLABELS[i]}
            </button>
          ))}
        </div>

        <div className={s.formCard}>

          {/* SECTION 1: Basic Info */}
          {section==="meta" && (
            <>
              <div className={s.formGrid}>
                <div className="form-group">
                  <label className="form-label">Story Title *</label>
                  <input className="form-input" value={meta.title} onChange={setM("title")} placeholder="e.g. The Brave Lion" />
                </div>
                <div className="form-group">
                  <label className="form-label">Emoji Icon</label>
                  <input className="form-input" value={meta.emoji} onChange={setM("emoji")} placeholder="🦁" />
                </div>
                <div className="form-group">
                  <label className="form-label">Age Group</label>
                  <select className="form-input" value={meta.age_group} onChange={setM("age_group")}>
                    <option value="1-3">1–3</option><option value="4-6">4–6</option><option value="7-10">7–10</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Difficulty</label>
                  <select className="form-input" value={meta.difficulty} onChange={setM("difficulty")}>
                    <option>Beginner</option><option>Easy</option><option>Medium</option><option>Hard</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Language</label>
                  <select className="form-input" value={meta.language} onChange={setM("language")}>
                    <option>English</option><option value="हिंदी">हिंदी</option><option value="मराठी">मराठी</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Estimated Time</label>
                  <input className="form-input" value={meta.estimated_time} onChange={setM("estimated_time")} placeholder="5 min" />
                </div>
                <div className="form-group">
                  <label className="form-label">Cover Gradient CSS</label>
                  <input className="form-input" value={meta.cover_gradient} onChange={setM("cover_gradient")} placeholder="linear-gradient(...)" />
                </div>
              </div>
              <label style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",fontWeight:700,fontSize:14,marginTop:4}}>
                <input type="checkbox" checked={meta.is_featured} onChange={setM("is_featured")} style={{width:16,height:16}}/>
                Mark as Featured (shown in carousel)
              </label>
              <div className={s.formActions}>
                <button className="btn btn-primary" onClick={()=>setSection("pages")}>Next: Story Pages →</button>
              </div>
            </>
          )}

          {/* SECTION 2: Pages */}
          {section==="pages" && (
            <>
              <p style={{fontSize:14,color:"var(--color-text-secondary)",marginBottom:16,fontWeight:600}}>
                Write each page of the story separately. You can use &lt;strong&gt;bold&lt;/strong&gt; for highlighted words.
              </p>
              {pages.map((pg, i) => (
                <div key={i} className={s.pageBlock}>
                  <div className={s.pageBlockHead}>
                    <label className="form-label" style={{margin:0}}>Page {i+1}</label>
                    {pages.length > 1 && (
                      <button className={`${s.iconBtn} ${s.deleteBtn}`} onClick={()=>removePage(i)}>🗑️</button>
                    )}
                  </div>
                  <textarea className={`form-input ${s.textarea}`} rows={4}
                    value={pg} onChange={e=>setPage(i,e.target.value)}
                    placeholder={`Write story page ${i+1} here...`} />
                </div>
              ))}
              <button className="btn btn-ghost" style={{marginTop:8}} onClick={addPage}>+ Add Another Page</button>
              <div className={s.formActions}>
                <button className="btn btn-ghost" onClick={()=>setSection("meta")}>← Back</button>
                <button className="btn btn-primary" onClick={()=>setSection("quiz")}>Next: Quizzes →</button>
              </div>
            </>
          )}

          {/* SECTION 3: Multiple Quizzes */}
          {section==="quiz" && (
            <>
              <p style={{fontSize:14,color:"var(--color-text-secondary)",marginBottom:16,fontWeight:600}}>
                Add one or more comprehension questions shown after the story is read.
              </p>

              {quizzes.map((quiz, qi) => (
                <div key={qi} className={s.pageBlock} style={{marginBottom:20}}>
                  <div className={s.pageBlockHead}>
                    <label className="form-label" style={{margin:0,fontSize:15,fontWeight:800}}>❓ Quiz {qi+1}</label>
                    {quizzes.length > 1 && (
                      <button className={`${s.iconBtn} ${s.deleteBtn}`} onClick={()=>removeQuiz(qi)} title="Remove quiz">🗑️</button>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Question</label>
                    <input className="form-input" value={quiz.question}
                      onChange={e=>setQuizField(qi,"question",e.target.value)}
                      placeholder="e.g. Why did Leo feel brave at the end?" />
                  </div>

                  <div className={s.formGrid} style={{marginTop:12}}>
                    {quiz.options.map((opt,oi)=>(
                      <div key={oi} className="form-group">
                        <label className="form-label" style={{display:"flex",alignItems:"center",gap:8}}>
                          <input type="radio" name={`correct_${qi}`} checked={quiz.correct===oi}
                            onChange={()=>setQuizField(qi,"correct",oi)} />
                          Option {oi+1} {quiz.correct===oi ? "✅ (Correct)" : ""}
                        </label>
                        <input className="form-input" value={opt}
                          onChange={e=>setQuizOpt(qi,oi,e.target.value)}
                          placeholder={`Option ${oi+1}`} />
                      </div>
                    ))}
                  </div>
                  <p style={{fontSize:12,color:"var(--color-text-secondary)",marginTop:4}}>
                    ☝️ Select the radio button next to the correct answer.
                  </p>
                </div>
              ))}

              <button className="btn btn-ghost" style={{marginBottom:8}} onClick={addQuiz}>
                + Add Another Quiz Question
              </button>

              <div className={s.formActions}>
                <button className="btn btn-ghost" onClick={()=>setSection("pages")}>← Back</button>
                <button className="btn btn-primary" onClick={handleSubmit} disabled={busy}>
                  {busy ? "Saving..." : editingId ? "💾 Update Story" : "✅ Save Story"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className={s.section}>
        <h2 className={s.sectionTitle} style={{marginBottom:16}}>📋 All Stories ({stories.length})</h2>
        <div className={s.tableWrap} style={{overflowX:"auto"}}>
          <table className={s.table}>
            <thead>
              <tr>
                <th>Story</th><th>Age</th><th>Difficulty</th>
                <th>Language</th><th>Pages</th><th>Quizzes</th><th>Featured</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading
                ? <tr className={s.loadingRow}><td colSpan={8}>Loading stories...</td></tr>
                : stories.length===0
                ? <tr><td colSpan={8} className={s.empty}>No stories yet. Add one above!</td></tr>
                : stories.map(st=>{
                    const quizCount = st.quizzes?.length || (st.quiz?.question ? 1 : 0);
                    return (
                      <tr key={st.id}>
                        <td><strong>{st.emoji} {st.title}</strong></td>
                        <td><span className={`${s.badge} ${s.badgeOrange}`}>Age {st.age_group}</span></td>
                        <td><span className={`${s.badge} ${s.badgeBlue}`}>{st.difficulty}</span></td>
                        <td><span className={`${s.badge} ${s.badgePurple}`}>{st.language}</span></td>
                        <td><span className={`${s.badge} ${st.pages?.length ? s.badgeGreen : ""}`}>{st.pages?.length||0} pages</span></td>
                        <td><span className={`${s.badge} ${quizCount>0 ? s.badgeGreen : ""}`}>{quizCount>0 ? `✅ ${quizCount} quiz${quizCount>1?"zes":""}` : "❌ None"}</span></td>
                        <td>{st.is_featured ? "⭐ Yes" : "—"}</td>
                        <td style={{whiteSpace:"nowrap"}}>
                          <button className={s.iconBtn} onClick={()=>startEdit(st)} title="Edit">✏️</button>
                          <button className={`${s.iconBtn} ${s.deleteBtn}`} onClick={()=>handleDelete(st)} title={st._fromFS?"Delete":"Built-in"} disabled={busy}>
                            {st._fromFS ? "🗑️" : "🔒"}
                          </button>
                        </td>
                      </tr>
                    );
                  })
              }
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
