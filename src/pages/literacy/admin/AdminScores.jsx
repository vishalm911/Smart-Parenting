// src/pages/admin/AdminScores.jsx — Reading scores per story only
import { useState, useEffect } from "react";
import { getAllScores, updateScore, deleteScore, getStories } from '../../../firebase/literacyService';
import { storiesData } from '../../../data/storiesData';
import s from "./Admin.module.css";

function Toast({ msg }) { return msg ? <div className={s.toast}>{msg}</div> : null; }

function EditModal({ score, onSave, onCancel }) {
  const [form, setForm] = useState({
    score: score.score ?? "",
    accuracy: score.accuracy ?? "",
    time_taken: score.time_taken ?? "",
    activity_id: score.activity_id ?? "",
    activity_type: score.activity_type ?? "story",
  });
  const setF = (k,v) => setForm(p=>({...p,[k]:v}));

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center",padding:16}}>
      <div style={{background:"var(--color-surface)",borderRadius:16,padding:24,width:"100%",maxWidth:440,boxShadow:"0 20px 60px rgba(0,0,0,0.3)"}}>
        <h3 style={{marginBottom:20,fontSize:18,fontWeight:800}}>✏️ Edit Score Record</h3>
        <div className="form-group">
          <label className="form-label">Story ID</label>
          <input className="form-input" value={form.activity_id} onChange={e=>setF("activity_id",e.target.value)} placeholder="story id" />
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <div className="form-group">
            <label className="form-label">Score (%)</label>
            <input className="form-input" type="number" min={0} max={100} value={form.score} onChange={e=>setF("score",Number(e.target.value))} />
          </div>
          <div className="form-group">
            <label className="form-label">Accuracy</label>
            <select className="form-input" value={form.accuracy} onChange={e=>setF("accuracy",Number(e.target.value))}>
              <option value={1}>1 — Correct</option>
              <option value={0}>0 — Wrong</option>
            </select>
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Time Taken (seconds)</label>
          <input className="form-input" type="number" min={0} value={form.time_taken} onChange={e=>setF("time_taken",Number(e.target.value))} />
        </div>
        <div style={{display:"flex",gap:10,marginTop:20,justifyContent:"flex-end"}}>
          <button className="btn btn-ghost" onClick={onCancel}>✕ Cancel</button>
          <button className="btn btn-primary" onClick={()=>onSave(form)}>💾 Save Changes</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminScores() {
  const [scores, setScores]   = useState([]);
  const [fsStories, setFsStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [resultFilter, setResultFilter] = useState("All");
  const [editItem, setEditItem] = useState(null);
  const [toast, setToast]     = useState("");
  const [busy, setBusy]       = useState(false);
  const [expandedStory, setExpandedStory] = useState(null);

  const showToast = m => { setToast(m); setTimeout(()=>setToast(""),2500); };

  const getStoryInfo = (activityId) => {
    const fromFs = fsStories.find(st=>st.id===activityId);
    const fromDefault = storiesData.find(st=>st.id===activityId);
    return fromFs || fromDefault || null;
  };

  const load = async () => {
    setLoading(true);
    const [d, stories] = await Promise.all([getAllScores(), getStories()]);
    // Only keep reading/story type scores
    setScores(d.filter(sc => (sc.activity_type || "story") === "story"));
    setFsStories(stories);
    setLoading(false);
  };
  useEffect(()=>{ load(); },[]);

  const fmtDate = ts => {
    if (!ts) return "—";
    try { const d=ts.toDate?ts.toDate():new Date(ts); return d.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}); }
    catch { return "—"; }
  };

  const handleSaveEdit = async (form) => {
    setBusy(true);
    await updateScore(editItem.id, editItem._col || "language_scores", { ...form, activity_type: "story" });
    showToast("✅ Score updated!");
    setEditItem(null);
    await load();
    setBusy(false);
  };

  const handleDelete = async (sc) => {
    if (!window.confirm("Delete this score record?")) return;
    setBusy(true);
    await deleteScore(sc.id, sc._col || "language_scores");
    showToast("🗑️ Deleted!");
    await load();
    setBusy(false);
  };

  // STATS — only story scores
  const total   = scores.length;
  const avg     = total ? Math.round(scores.reduce((a,b)=>a+(b.score||0),0)/total) : 0;
  const perfect = scores.filter(x=>x.score===100).length;
  const users   = [...new Set(scores.map(x=>x.child_id))].length;

  // PER-STORY breakdown with per-user detail
  const storyMap = {};
  scores.forEach(sc => {
    const id = sc.activity_id || "unknown";
    if (!storyMap[id]) storyMap[id] = { attempts:0, correct:0, total_score:0, users:{} };
    storyMap[id].attempts++;
    storyMap[id].total_score += (sc.score||0);
    if (sc.accuracy===1) storyMap[id].correct++;
    const uid = sc.child_id || "unknown";
    if (!storyMap[id].users[uid]) storyMap[id].users[uid] = {
      attempts:0, correct:0, total_score:0,
      username: sc.username || sc.display_name || null
    };
    storyMap[id].users[uid].attempts++;
    storyMap[id].users[uid].total_score += (sc.score||0);
    if (sc.accuracy===1) storyMap[id].users[uid].correct++;
  });
  const storyRows = Object.entries(storyMap).map(([id,d])=>{
    const st = getStoryInfo(id);
    return {
      id, name: st?.title || id,
      emoji: st?.emoji || "📖",
      attempts: d.attempts, correct: d.correct,
      avg_score: Math.round(d.total_score/d.attempts),
      accuracy: Math.round((d.correct/d.attempts)*100),
      users: Object.entries(d.users).map(([uid, ud])=>({
        uid,
        username: ud.username,
        attempts: ud.attempts,
        correct: ud.correct,
        avg_score: Math.round(ud.total_score/ud.attempts),
      }))
    };
  }).sort((a,b)=>b.attempts-a.attempts);

  // TABLE filter — search by userId, username, OR story name
  const filtered = scores.filter(sc=>{
    const username = (sc.username || sc.display_name || "").toLowerCase();
    const uid = (sc.child_id || "").toLowerCase();
    const storyInfo = getStoryInfo(sc.activity_id);
    const storyName = (storyInfo?.title || sc.activity_id || "").toLowerCase();
    const q = search.toLowerCase();
    const matchSearch = !q || uid.includes(q) || username.includes(q) || storyName.includes(q);
    const matchResult = resultFilter==="All" || (resultFilter==="Correct"?sc.accuracy===1:sc.accuracy!==1);
    return matchSearch && matchResult;
  });

  return (
    <>
      <Toast msg={toast} />
      {editItem && <EditModal score={editItem} onSave={handleSaveEdit} onCancel={()=>setEditItem(null)} />}

      {/* Stats */}
      <div className={s.statGrid}>
        <div className={s.statCard}><span className={s.statNum}>{total}</span><span className={s.statLabel}>Total Attempts</span></div>
        <div className={s.statCard}><span className={s.statNum}>{avg}%</span><span className={s.statLabel}>Avg Score</span></div>
        <div className={s.statCard}><span className={s.statNum}>{perfect}</span><span className={s.statLabel}>Perfect Scores</span></div>
        <div className={s.statCard}><span className={s.statNum}>{users}</span><span className={s.statLabel}>Unique Users</span></div>
      </div>

      {/* PER STORY VIEW — expandable user breakdown */}
      <div className={s.section} style={{marginBottom:32}}>
        <h2 className={s.sectionTitle} style={{marginBottom:8}}>📚 Score Breakdown Per Story</h2>
        <p style={{fontSize:13,color:"var(--color-text-secondary)",marginBottom:16,fontWeight:600}}>
          Click on a story to see per-user performance details.
        </p>
        {loading
          ? <p className={s.empty}>Loading...</p>
          : storyRows.length===0
          ? <p className={s.empty}>No story scores yet.</p>
          : <div className={s.tableWrap} style={{overflowX:"auto"}}>
              <table className={s.table}>
                <thead>
                  <tr><th>Story</th><th>Attempts</th><th>Correct</th><th>Avg Score</th><th>Accuracy</th><th>Users</th></tr>
                </thead>
                <tbody>
                  {storyRows.map(row=>(
                    <>
                      <tr key={row.id} style={{cursor:"pointer"}}
                        onClick={()=>setExpandedStory(expandedStory===row.id?null:row.id)}>
                        <td>
                          <strong>{row.emoji} {row.name}</strong>
                          <span style={{marginLeft:8,fontSize:12,color:"var(--color-text-secondary)"}}>
                            {expandedStory===row.id?"▲":"▼"}
                          </span>
                        </td>
                        <td><span className={`${s.badge} ${s.badgeBlue}`}>{row.attempts}</span></td>
                        <td><span className={`${s.badge} ${s.badgeGreen}`}>{row.correct} ✅</span></td>
                        <td>
                          <span className={`${s.badge} ${row.avg_score>=80?s.badgeGreen:row.avg_score>=50?s.badgeOrange:""}`}>
                            {row.avg_score}%
                          </span>
                        </td>
                        <td>
                          <div style={{display:"flex",alignItems:"center",gap:8}}>
                            <div style={{flex:1,height:8,background:"var(--color-border)",borderRadius:4,overflow:"hidden",minWidth:60}}>
                              <div style={{width:`${row.accuracy}%`,height:"100%",background:"var(--color-success)",borderRadius:4}}/>
                            </div>
                            <span style={{fontSize:13,fontWeight:700,minWidth:36}}>{row.accuracy}%</span>
                          </div>
                        </td>
                        <td><span className={`${s.badge} ${s.badgePurple}`}>{row.users.length} users</span></td>
                      </tr>
                      {expandedStory===row.id && row.users.map(u=>(
                        <tr key={u.uid} style={{background:"var(--color-bg-elevated)"}}>
                          <td style={{paddingLeft:32}}>
                            <span style={{fontSize:13}}>👤</span>
                            {u.username ? (
                              <>
                                <strong style={{marginLeft:6,fontSize:13}}>{u.username}</strong>
                                <span style={{marginLeft:6,fontSize:11,color:"var(--color-text-secondary)",fontFamily:"monospace"}}>
                                  ({u.uid.slice(0,10)}…)
                                </span>
                              </>
                            ) : (
                              <span style={{marginLeft:6,fontSize:12,fontFamily:"monospace",color:"var(--color-text-secondary)"}}>
                                {u.uid}
                              </span>
                            )}
                          </td>
                          <td><span className={`${s.badge} ${s.badgeBlue}`}>{u.attempts}</span></td>
                          <td><span className={`${s.badge} ${s.badgeGreen}`}>{u.correct} ✅</span></td>
                          <td>
                            <span className={`${s.badge} ${u.avg_score>=80?s.badgeGreen:u.avg_score>=50?s.badgeOrange:""}`}>
                              {u.avg_score}%
                            </span>
                          </td>
                          <td colSpan={2}></td>
                        </tr>
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
        }
      </div>

      {/* ALL READING SCORES TABLE */}
      <div className={s.section}>
        <div className={s.sectionHead}>
          <h2 className={s.sectionTitle}>📋 All Reading Score Records ({filtered.length})</h2>
          <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"center"}}>
            <input className="form-input" style={{width:"100%",maxWidth:260}}
              placeholder="🔍 User ID, username ya story naam..."
              value={search} onChange={e=>setSearch(e.target.value)} />
          </div>
        </div>

        {/* Result filter */}
        <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
          <span style={{fontSize:13,fontWeight:600,alignSelf:"center"}}>Result:</span>
          {["All","Correct","Wrong"].map(f=>(
            <button key={f} className={`${s.chipBtn} ${resultFilter===f?s.chipActive:""}`}
              onClick={()=>setResultFilter(f)}>{f}</button>
          ))}
        </div>

        <div className={s.tableWrap} style={{overflowX:"auto"}}>
          <table className={s.table}>
            <thead>
              <tr><th>User</th><th>Story</th><th>Score</th><th>Result</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading
                ? <tr className={s.loadingRow}><td colSpan={6}>Loading scores...</td></tr>
                : filtered.length===0
                ? <tr><td colSpan={6} className={s.empty}>
                    {scores.length===0
                      ? "No reading scores yet. Users complete stories to appear here!"
                      : "No results match your filter."}
                  </td></tr>
                : filtered.map(sc=>{
                    const story = getStoryInfo(sc.activity_id);
                    const displayName = sc.username || sc.display_name || null;
                    const uid = sc.child_id || "—";
                    return (
                      <tr key={sc.id}>
                        <td>
                          <div>
                            {displayName && (
                              <div style={{fontWeight:700,fontSize:13}}>👤 {displayName}</div>
                            )}
                            <div style={{fontFamily:"monospace",fontSize:10,color:"var(--color-text-secondary)",marginTop:displayName?2:0}}>
                              {uid}
                            </div>
                          </div>
                        </td>
                        <td>
                          <strong>{story ? `${story.emoji} ${story.title}` : (sc.activity_id || "—")}</strong>
                        </td>
                        <td>
                          <span className={`${s.badge} ${sc.score>=80?s.badgeGreen:sc.score>=50?s.badgeOrange:""}`}>
                            {sc.score}%
                          </span>
                        </td>
                        <td>
                          <span className={`${s.badge} ${sc.accuracy===1?s.badgeGreen:""}`}>
                            {sc.accuracy===1?"✅ Correct":"❌ Wrong"}
                          </span>
                        </td>
                        <td style={{fontSize:12,color:"var(--color-text-secondary)",whiteSpace:"nowrap"}}>{fmtDate(sc.date)}</td>
                        <td style={{whiteSpace:"nowrap"}}>
                          <button className={s.iconBtn} onClick={()=>setEditItem(sc)} title="Edit" disabled={busy}>✏️</button>
                          <button className={`${s.iconBtn} ${s.deleteBtn}`} onClick={()=>handleDelete(sc)} title="Delete" disabled={busy}>🗑️</button>
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
