import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  collection, getDocs, addDoc, updateDoc, deleteDoc,
  doc, query, orderBy, limit, serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { useUser } from '../../context/UserContext';

/* ─── Tab config ─── */
const TABS = [
  { id: 'math',    label: 'Math Games',     emoji: '🔢' },
  { id: 'puzzle',  label: 'Puzzle Games',   emoji: '🧩' },
  { id: 'logic',   label: 'Logic Games',    emoji: '🧠' },
  { id: 'scores',  label: 'Score Viewer',   emoji: '📊' },
];

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const AGE_GROUPS   = ['1–3', '4–6', '7–10'];
const MATH_TYPES   = ['counting', 'matching', 'arithmetic', 'ordering'];

/* ─── Helpers ─── */
const emptyMath   = () => ({ title: '', description: '', emoji: '🔢', type: 'counting', age_group: '1–3', difficulty: 'Easy', question_set: '', gradient: 'bg-gradient-to-br from-[#FF9A56] to-[#F5A623]' });
const emptyPuzzle = () => ({ title: '', description: '', emoji: '🧩', shape_type: '2D', age_group: '1–3', difficulty: 'Easy', pieces_url: '', gradient: 'bg-gradient-to-br from-[#2EC4B6] to-[#4FC3F7]' });
const emptyLogic  = () => ({ title: '', description: '', emoji: '🔍', age_group: '4–6', difficulty: 'Medium', pattern_data: '', maze_layout: '', gradient: 'bg-gradient-to-br from-[#7C4DFF] to-[#FF6B9D]' });

export default function AdminPanel() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('math');
  const [toast, setToast]   = useState(null);

  /* collection data */
  const [mathGames,   setMathGames]   = useState([]);
  const [puzzleGames, setPuzzleGames] = useState([]);
  const [logicGames,  setLogicGames]  = useState([]);
  const [scores,      setScores]      = useState([]);

  /* form state */
  const [mathForm,   setMathForm]   = useState(emptyMath());
  const [puzzleForm, setPuzzleForm] = useState(emptyPuzzle());
  const [logicForm,  setLogicForm]  = useState(emptyLogic());
  const [editId,     setEditId]     = useState(null);
  const [saving,     setSaving]     = useState(false);
  const [loading,    setLoading]    = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── Fetch helpers ── */
  const fetchMath   = async () => { const s = await getDocs(collection(db, 'math_games'));   setMathGames(s.docs.map(d => ({ id: d.id, ...d.data() }))); };
  const fetchPuzzle = async () => { const s = await getDocs(collection(db, 'puzzle_games')); setPuzzleGames(s.docs.map(d => ({ id: d.id, ...d.data() }))); };
  const fetchLogic  = async () => { const s = await getDocs(collection(db, 'logic_games'));  setLogicGames(s.docs.map(d => ({ id: d.id, ...d.data() }))); };
  const fetchScores = async () => {
    const q = query(collection(db, 'numeracy_scores'), orderBy('date', 'desc'), limit(50));
    const s = await getDocs(q);
    setScores(s.docs.map(d => ({ id: d.id, ...d.data() })));
  };

  useEffect(() => {
    let active = true;
    const loadData = async () => {
      await Promise.resolve();
      if (!active) return;
      setLoading(true);
      const loaders = { math: fetchMath, puzzle: fetchPuzzle, logic: fetchLogic, scores: fetchScores };
      await loaders[activeTab]?.();
      if (!active) return;
      setLoading(false);
    };
    loadData();
    return () => { active = false; };
  }, [activeTab]);

  /* ── Generic CRUD ── */
  const handleSave = async (colName, form, setForm, empty, fetchFn) => {
    if (!form.title?.trim()) return showToast('Title is required', 'error');
    setSaving(true);
    try {
      const data = { ...form, updated_at: serverTimestamp() };
      if (editId) {
        await updateDoc(doc(db, colName, editId), data);
        showToast('Updated successfully ✅');
      } else {
        await addDoc(collection(db, colName), { ...data, created_at: serverTimestamp() });
        showToast('Added successfully ✅');
      }
      setForm(empty());
      setEditId(null);
      await fetchFn();
    } catch (e) {
      showToast('Error: ' + e.message, 'error');
    }
    setSaving(false);
  };

  const handleEdit = (game, setForm) => {
    setForm({ ...game });
    setEditId(game.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (colName, id, fetchFn) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      await deleteDoc(doc(db, colName, id));
      showToast('Deleted');
      await fetchFn();
    } catch {
      showToast('Delete failed', 'error');
    }
  };

  const cancelEdit = (setForm, empty) => { setForm(empty()); setEditId(null); };

  /* ── Input component ── */
  const Field = ({ label, value, onChange, type = 'text', options, placeholder }) => (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{label}</label>
      {options ? (
        <select value={value} onChange={e => onChange(e.target.value)}
          className="rounded-xl px-3 py-2 text-sm font-semibold border"
          style={{ background: 'var(--bg-accent)', color: 'var(--text-primary)', borderColor: 'var(--border-default)' }}>
          {options.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder || label}
          className="rounded-xl px-3 py-2 text-sm border"
          style={{ background: 'var(--bg-accent)', color: 'var(--text-primary)', borderColor: 'var(--border-default)' }} />
      )}
    </div>
  );

  /* ── Game row ── */
  const GameRow = ({ game, onEdit, onDelete }) => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="flex items-center justify-between p-4 rounded-2xl"
      style={{ background: 'var(--bg-accent)', border: '1px solid var(--border-default)' }}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{game.emoji}</span>
        <div>
          <p className="font-bold text-sm" style={{ color: 'var(--text-primary)' }}>{game.title}</p>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {game.age_group || game.ageRange} · {game.difficulty} {game.type ? `· ${game.type}` : ''}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onEdit}
          className="px-3 py-1.5 rounded-xl text-xs font-bold"
          style={{ background: 'var(--bg-card)', color: '#7C4DFF', border: '1px solid #7C4DFF' }}>Edit</button>
        <button onClick={onDelete}
          className="px-3 py-1.5 rounded-xl text-xs font-bold"
          style={{ background: '#FEE2E2', color: '#DC2626' }}>Delete</button>
      </div>
    </motion.div>
  );

  /* ═══════════════════════════════
     MATH GAMES TAB
  ═══════════════════════════════ */
  const renderMathTab = () => (
    <div className="space-y-6">
      {/* Form */}
      <div className="card p-6">
        <h3 className="font-bold text-base mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          {editId ? '✏️ Edit Math Game' : '➕ Add Math Game'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Title" value={mathForm.title} onChange={v => setMathForm(f => ({ ...f, title: v }))} />
          <Field label="Emoji" value={mathForm.emoji} onChange={v => setMathForm(f => ({ ...f, emoji: v }))} />
          <div className="sm:col-span-2">
            <Field label="Description" value={mathForm.description} onChange={v => setMathForm(f => ({ ...f, description: v }))} placeholder="Short description..." />
          </div>
          <Field label="Type" value={mathForm.type} onChange={v => setMathForm(f => ({ ...f, type: v }))} options={MATH_TYPES} />
          <Field label="Age Group" value={mathForm.age_group} onChange={v => setMathForm(f => ({ ...f, age_group: v }))} options={AGE_GROUPS} />
          <Field label="Difficulty" value={mathForm.difficulty} onChange={v => setMathForm(f => ({ ...f, difficulty: v }))} options={DIFFICULTIES} />
          <Field label="Gradient CSS" value={mathForm.gradient} onChange={v => setMathForm(f => ({ ...f, gradient: v }))} placeholder="bg-gradient-to-br from-[#...] to-[#...]" />
          <div className="sm:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wide block mb-1" style={{ color: 'var(--text-muted)' }}>Question Set (JSON)</label>
            <textarea rows={4} value={mathForm.question_set} onChange={e => setMathForm(f => ({ ...f, question_set: e.target.value }))}
              placeholder='[{"question":"Count the apples","answer":3,"options":[2,3,4,5]}]'
              className="w-full rounded-xl px-3 py-2 text-sm border font-mono"
              style={{ background: 'var(--bg-accent)', color: 'var(--text-primary)', borderColor: 'var(--border-default)' }} />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} disabled={saving}
            onClick={() => handleSave('math_games', mathForm, setMathForm, emptyMath, fetchMath)}
            className="btn-orange text-sm">
            {saving ? 'Saving…' : editId ? 'Update' : 'Add Game'}
          </motion.button>
          {editId && (
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => cancelEdit(setMathForm, emptyMath)} className="btn-ghost text-sm">Cancel</motion.button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="card p-6">
        <h3 className="font-bold text-base mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          📋 All Math Games ({mathGames.length})
        </h3>
        {loading ? <p style={{ color: 'var(--text-muted)' }}>Loading…</p> : (
          <div className="space-y-3">
            {mathGames.length === 0 && <p style={{ color: 'var(--text-muted)' }} className="text-sm">No games yet. Add one above!</p>}
            {mathGames.map(g => (
              <GameRow key={g.id} game={g}
                onEdit={() => handleEdit(g, setMathForm)}
                onDelete={() => handleDelete('math_games', g.id, fetchMath)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  /* ═══════════════════════════════
     PUZZLE GAMES TAB
  ═══════════════════════════════ */
  const renderPuzzleTab = () => (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="font-bold text-base mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          {editId ? '✏️ Edit Puzzle Game' : '➕ Add Puzzle Game'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Title" value={puzzleForm.title} onChange={v => setPuzzleForm(f => ({ ...f, title: v }))} />
          <Field label="Emoji" value={puzzleForm.emoji} onChange={v => setPuzzleForm(f => ({ ...f, emoji: v }))} />
          <div className="sm:col-span-2">
            <Field label="Description" value={puzzleForm.description} onChange={v => setPuzzleForm(f => ({ ...f, description: v }))} />
          </div>
          <Field label="Shape Type" value={puzzleForm.shape_type} onChange={v => setPuzzleForm(f => ({ ...f, shape_type: v }))} options={['2D', '3D']} />
          <Field label="Age Group" value={puzzleForm.age_group} onChange={v => setPuzzleForm(f => ({ ...f, age_group: v }))} options={AGE_GROUPS} />
          <Field label="Difficulty" value={puzzleForm.difficulty} onChange={v => setPuzzleForm(f => ({ ...f, difficulty: v }))} options={DIFFICULTIES} />
          <Field label="Puzzle Pieces Image URL" value={puzzleForm.pieces_url} onChange={v => setPuzzleForm(f => ({ ...f, pieces_url: v }))} placeholder="https://firebasestorage.googleapis.com/..." />
          <Field label="Gradient CSS" value={puzzleForm.gradient} onChange={v => setPuzzleForm(f => ({ ...f, gradient: v }))} />
        </div>
        <div className="flex gap-3 mt-5">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} disabled={saving}
            onClick={() => handleSave('puzzle_games', puzzleForm, setPuzzleForm, emptyPuzzle, fetchPuzzle)}
            className="btn-orange text-sm">
            {saving ? 'Saving…' : editId ? 'Update' : 'Add Puzzle'}
          </motion.button>
          {editId && (
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => cancelEdit(setPuzzleForm, emptyPuzzle)} className="btn-ghost text-sm">Cancel</motion.button>
          )}
        </div>
      </div>
      <div className="card p-6">
        <h3 className="font-bold text-base mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          📋 All Puzzle Games ({puzzleGames.length})
        </h3>
        {loading ? <p style={{ color: 'var(--text-muted)' }}>Loading…</p> : (
          <div className="space-y-3">
            {puzzleGames.length === 0 && <p style={{ color: 'var(--text-muted)' }} className="text-sm">No puzzles yet.</p>}
            {puzzleGames.map(g => (
              <GameRow key={g.id} game={g}
                onEdit={() => handleEdit(g, setPuzzleForm)}
                onDelete={() => handleDelete('puzzle_games', g.id, fetchPuzzle)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  /* ═══════════════════════════════
     LOGIC GAMES TAB
  ═══════════════════════════════ */
  const renderLogicTab = () => (
    <div className="space-y-6">
      <div className="card p-6">
        <h3 className="font-bold text-base mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          {editId ? '✏️ Edit Logic Game' : '➕ Add Logic Game'}
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Title" value={logicForm.title} onChange={v => setLogicForm(f => ({ ...f, title: v }))} />
          <Field label="Emoji" value={logicForm.emoji} onChange={v => setLogicForm(f => ({ ...f, emoji: v }))} />
          <div className="sm:col-span-2">
            <Field label="Description" value={logicForm.description} onChange={v => setLogicForm(f => ({ ...f, description: v }))} />
          </div>
          <Field label="Age Group" value={logicForm.age_group} onChange={v => setLogicForm(f => ({ ...f, age_group: v }))} options={AGE_GROUPS} />
          <Field label="Difficulty" value={logicForm.difficulty} onChange={v => setLogicForm(f => ({ ...f, difficulty: v }))} options={DIFFICULTIES} />
          <Field label="Gradient CSS" value={logicForm.gradient} onChange={v => setLogicForm(f => ({ ...f, gradient: v }))} />
          <div className="sm:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wide block mb-1" style={{ color: 'var(--text-muted)' }}>Pattern Data (JSON array)</label>
            <textarea rows={3} value={logicForm.pattern_data} onChange={e => setLogicForm(f => ({ ...f, pattern_data: e.target.value }))}
              placeholder='["🔴","🔵","🔴","🔵","?"]'
              className="w-full rounded-xl px-3 py-2 text-sm border font-mono"
              style={{ background: 'var(--bg-accent)', color: 'var(--text-primary)', borderColor: 'var(--border-default)' }} />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-bold uppercase tracking-wide block mb-1" style={{ color: 'var(--text-muted)' }}>Maze Layout (JSON)</label>
            <textarea rows={3} value={logicForm.maze_layout} onChange={e => setLogicForm(f => ({ ...f, maze_layout: e.target.value }))}
              placeholder='{"rows":5,"cols":5,"walls":[[0,1],[1,1]]}'
              className="w-full rounded-xl px-3 py-2 text-sm border font-mono"
              style={{ background: 'var(--bg-accent)', color: 'var(--text-primary)', borderColor: 'var(--border-default)' }} />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} disabled={saving}
            onClick={() => handleSave('logic_games', logicForm, setLogicForm, emptyLogic, fetchLogic)}
            className="btn-orange text-sm">
            {saving ? 'Saving…' : editId ? 'Update' : 'Add Logic Game'}
          </motion.button>
          {editId && (
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              onClick={() => cancelEdit(setLogicForm, emptyLogic)} className="btn-ghost text-sm">Cancel</motion.button>
          )}
        </div>
      </div>
      <div className="card p-6">
        <h3 className="font-bold text-base mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          📋 All Logic Games ({logicGames.length})
        </h3>
        {loading ? <p style={{ color: 'var(--text-muted)' }}>Loading…</p> : (
          <div className="space-y-3">
            {logicGames.length === 0 && <p style={{ color: 'var(--text-muted)' }} className="text-sm">No logic games yet.</p>}
            {logicGames.map(g => (
              <GameRow key={g.id} game={g}
                onEdit={() => handleEdit(g, setLogicForm)}
                onDelete={() => handleDelete('logic_games', g.id, fetchLogic)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );

  /* ═══════════════════════════════
     SCORES TAB
  ═══════════════════════════════ */
  const renderScoresTab = () => (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="font-bold text-base" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          📊 Numeracy Scores (last 50)
        </h3>
        <motion.button whileHover={{ scale: 1.05 }} onClick={fetchScores} className="btn-ghost text-xs py-2 px-4">↻ Refresh</motion.button>
      </div>
      {loading ? <p style={{ color: 'var(--text-muted)' }}>Loading…</p> : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-default)' }}>
                {['Game ID', 'Score', 'Level', 'Time (s)', 'Child ID', 'Date'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-xs font-bold uppercase tracking-wide" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {scores.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No scores yet. Play a game first!</td></tr>
              )}
              {scores.map((s, i) => (
                <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  style={{ borderBottom: '1px solid var(--border-default)' }}
                  className="hover:bg-[var(--bg-accent)] transition-colors">
                  <td className="py-2 px-3 font-mono text-xs" style={{ color: 'var(--text-primary)' }}>{s.game_id}</td>
                  <td className="py-2 px-3 font-bold" style={{ color: '#F5A623' }}>{s.score}</td>
                  <td className="py-2 px-3" style={{ color: 'var(--text-secondary)' }}>{s.level}</td>
                  <td className="py-2 px-3" style={{ color: 'var(--text-secondary)' }}>{s.time_taken ?? '—'}</td>
                  <td className="py-2 px-3 font-mono text-xs" style={{ color: 'var(--text-muted)' }}>{s.child_id?.slice(0, 8)}…</td>
                  <td className="py-2 px-3 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {s.date?.toDate ? s.date.toDate().toLocaleDateString('en-IN') : '—'}
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const tabContent = { math: renderMathTab(), puzzle: renderPuzzleTab(), logic: renderLogicTab(), scores: renderScoresTab() };

  return (
    <div className="relative min-h-screen">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }}
            className="fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl text-white text-sm font-bold shadow-xl"
            style={{ background: toast.type === 'error' ? '#EF4444' : '#10B981' }}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
            🛠️ Admin Panel
          </h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            Numeracy &amp; Logical Thinking Module — Manage game content and view scores
          </p>
          {user && (
            <span className="inline-block mt-2 text-xs font-mono px-3 py-1 rounded-full"
              style={{ background: 'var(--bg-accent)', color: 'var(--text-muted)' }}>
              Admin: {user.uid?.slice(0, 12)}…
            </span>
          )}
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {TABS.map(tab => (
            <motion.button key={tab.id} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
              onClick={() => { setActiveTab(tab.id); setEditId(null); }}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-sm transition-all"
              style={{
                background: activeTab === tab.id ? 'linear-gradient(135deg, #7C4DFF, #E91E8C)' : 'var(--bg-card)',
                color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                border: '1px solid var(--border-default)',
                boxShadow: activeTab === tab.id ? '0 4px 15px rgba(124,77,255,0.3)' : 'none',
              }}>
              <span>{tab.emoji}</span> {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {tabContent[activeTab]}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
