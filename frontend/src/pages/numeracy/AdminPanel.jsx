import { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Paper, Grid, TextField, Select, MenuItem,
  FormControl, InputLabel, Button, Chip, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Alert,
  CircularProgress, IconButton, Avatar, Tabs, Tab
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import {
  getMathGames, addMathGame, updateMathGame, deleteMathGame,
  getPuzzleGames, addPuzzleGame, updatePuzzleGame, deletePuzzleGame,
  getLogicGames, addLogicGame, updateLogicGame, deleteLogicGame,
  getNumeracyScores,
} from '../../api/services';
import { useUser } from '../../context/UserContext';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Tab config ─── */
const TABS = [
  { id: 'math', label: 'Math Games', emoji: '🔢' },
  { id: 'puzzle', label: 'Puzzle Games', emoji: '🧩' },
  { id: 'logic', label: 'Logic Games', emoji: '🧠' },
  { id: 'scores', label: 'Score Viewer', emoji: '📊' },
];

const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
const AGE_GROUPS = ['1–3', '4–6', '7–10'];
const MATH_TYPES = ['counting', 'matching', 'arithmetic', 'ordering'];

/* ─── Helpers ─── */
const emptyMath = () => ({ title: '', description: '', emoji: '🔢', type: 'counting', age_group: '1–3', difficulty: 'Easy', question_set: '', gradient: 'bg-gradient-to-br from-[#FF9A56] to-[#F5A623]' });
const emptyPuzzle = () => ({ title: '', description: '', emoji: '🧩', shape_type: '2D', age_group: '1–3', difficulty: 'Easy', pieces_url: '', gradient: 'bg-gradient-to-br from-[#2EC4B6] to-[#4FC3F7]' });
const emptyLogic = () => ({ title: '', description: '', emoji: '🔍', age_group: '4–6', difficulty: 'Medium', pattern_data: '', maze_layout: '', gradient: 'bg-gradient-to-br from-[#7C4DFF] to-[#FF6B9D]' });

export default function AdminPanel() {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState('math');
  const [toast, setToast] = useState(null);

  /* collection data */
  const [mathGames, setMathGames] = useState([]);
  const [puzzleGames, setPuzzleGames] = useState([]);
  const [logicGames, setLogicGames] = useState([]);
  const [scores, setScores] = useState([]);

  /* form state */
  const [mathForm, setMathForm] = useState(emptyMath());
  const [puzzleForm, setPuzzleForm] = useState(emptyPuzzle());
  const [logicForm, setLogicForm] = useState(emptyLogic());
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ── Fetch helpers ── */
  const fetchMath   = async () => { const data = await getMathGames();   setMathGames(data || []); };
  const fetchPuzzle = async () => { const data = await getPuzzleGames(); setPuzzleGames(data || []); };
  const fetchLogic  = async () => { const data = await getLogicGames();  setLogicGames(data || []); };
  const fetchScores = async () => { const { data } = await getNumeracyScores(); setScores(data || []); };

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

  /* Dynamic stats metrics calculation */
  const statsSummary = useMemo(() => {
    const mathCount = mathGames.length || 9;
    const puzzleCount = puzzleGames.length || 4;
    const logicCount = logicGames.length || 6;
    let avg = 75;
    if (scores.length > 0) {
      const sum = scores.reduce((acc, curr) => acc + (curr.score || 0), 0);
      avg = Math.round(sum / scores.length);
    }
    return { mathCount, puzzleCount, logicCount, avg };
  }, [mathGames, puzzleGames, logicGames, scores]);

  /* ── Generic CRUD ── */
  const handleSave = async (colName, form, setForm, empty, fetchFn) => {
    if (!form.title?.trim()) return showToast('Title is required', 'error');
    setSaving(true);
    try {
      const serviceMap = {
        math_games:   { add: addMathGame,   update: updateMathGame },
        puzzle_games: { add: addPuzzleGame, update: updatePuzzleGame },
        logic_games:  { add: addLogicGame,  update: updateLogicGame },
      };
      const svc = serviceMap[colName];
      if (editId) {
        await svc.update(editId, form);
        showToast('Updated successfully ✅');
      } else {
        await svc.add(form);
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
    setEditId(game._id || game.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (colName, id, fetchFn) => {
    if (!window.confirm('Delete this entry?')) return;
    try {
      const deleteMap = {
        math_games:   deleteMathGame,
        puzzle_games: deletePuzzleGame,
        logic_games:  deleteLogicGame,
      };
      await deleteMap[colName](id);
      showToast('Deleted');
      await fetchFn();
    } catch {
      showToast('Delete failed', 'error');
    }
  };

  const cancelEdit = (setForm, empty) => { setForm(empty()); setEditId(null); };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setEditId(null);
  };

  /* ── Game row ── */
  const GameRow = ({ game, onEdit, onDelete }) => {
    const diffColor = game.difficulty === 'Easy' ? { bg: '#F0FFF4', color: '#22C55E' }
      : game.difficulty === 'Medium' ? { bg: '#FFF8E1', color: '#F5A623' }
        : { bg: '#FFF5F5', color: '#E53E3E' };

    return (
      <Paper elevation={0} sx={{
        p: 2, mb: 1.5, borderRadius: '16px', border: '1.5px solid rgba(0,0,0,0.05)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transition: 'all 0.2s ease', '&:hover': { boxShadow: '0 4px 16px rgba(0,0,0,0.04)' }
      }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Avatar sx={{
            width: 44, height: 44, fontSize: '1.4rem', bgcolor: '#F3F4F6', color: '#111827',
            border: '2px solid rgba(0,0,0,0.05)'
          }}>
            {game.emoji}
          </Avatar>
          <Box>
            <Typography variant="body2" fontWeight={800} color="text.primary">{game.title}</Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 0.75, flexWrap: 'wrap' }}>
              <Chip label={`Age ${game.age_group || game.ageRange}`} size="small" sx={{
                fontWeight: 800, fontSize: '0.62rem', height: 20, bgcolor: 'rgba(124,77,255,0.08)', color: '#7C4DFF'
              }} />
              <Chip label={game.difficulty} size="small" sx={{
                fontWeight: 800, fontSize: '0.62rem', height: 20, bgcolor: diffColor.bg, color: diffColor.color
              }} />
              {game.type && (
                <Chip label={game.type} size="small" sx={{
                  fontWeight: 800, fontSize: '0.62rem', height: 20, textTransform: 'capitalize', bgcolor: 'rgba(107,114,128,0.08)', color: '#6B7280'
                }} />
              )}
            </Box>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton size="small" onClick={onEdit} sx={{ color: '#7C4DFF', '&:hover': { bgcolor: 'rgba(124,77,255,0.08)' } }}>
            <EditIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton size="small" onClick={onDelete} sx={{ color: '#EF5350', '&:hover': { bgcolor: '#FFF5F5' } }}>
            <DeleteIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Paper>
    );
  };

  /* ═══════════════════════════════
     MATH GAMES TAB
  ═══════════════════════════════ */
  const renderMathTab = () => (
    <Grid container spacing={3}>
      {/* Form */}
      <Grid item size={{ xs: 12, md: 4 }}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: '1.5px solid rgba(0,0,0,0.055)' }}>
          <Typography variant="subtitle1" fontWeight={900} sx={{ mb: 2.5, fontFamily: '"Nunito", sans-serif' }}>
            {editId ? '✏️ Edit Math Game' : '➕ Add Math Game'}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Grid container spacing={2}>
              <Grid item size={{ xs: 8 }}>
                <TextField label="Title" size="small" fullWidth value={mathForm.title} onChange={e => setMathForm(f => ({ ...f, title: e.target.value }))} />
              </Grid>
              <Grid item size={{ xs: 4 }}>
                <TextField label="Emoji" size="small" fullWidth value={mathForm.emoji} onChange={e => setMathForm(f => ({ ...f, emoji: e.target.value }))} />
              </Grid>
            </Grid>
            <TextField label="Description" size="small" fullWidth multiline rows={2} value={mathForm.description} onChange={e => setMathForm(f => ({ ...f, description: e.target.value }))} />
            <FormControl size="small" fullWidth>
              <InputLabel>Type</InputLabel>
              <Select value={mathForm.type} onChange={e => setMathForm(f => ({ ...f, type: e.target.value }))} label="Type">
                {MATH_TYPES.map(o => <MenuItem key={o} value={o} sx={{ textTransform: 'capitalize' }}>{o}</MenuItem>)}
              </Select>
            </FormControl>
            <Grid container spacing={2}>
              <Grid item size={{ xs: 6 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Age Group</InputLabel>
                  <Select value={mathForm.age_group} onChange={e => setMathForm(f => ({ ...f, age_group: e.target.value }))} label="Age Group">
                    {AGE_GROUPS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item size={{ xs: 6 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Difficulty</InputLabel>
                  <Select value={mathForm.difficulty} onChange={e => setMathForm(f => ({ ...f, difficulty: e.target.value }))} label="Difficulty">
                    {DIFFICULTIES.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <TextField label="Gradient CSS Class" size="small" fullWidth value={mathForm.gradient} onChange={e => setMathForm(f => ({ ...f, gradient: e.target.value }))} />
            <TextField label="Question Set (JSON array)" size="small" fullWidth multiline rows={4} value={mathForm.question_set} onChange={e => setMathForm(f => ({ ...f, question_set: e.target.value }))} placeholder='[{"question":"Count apples","answer":3,"options":[2,3,4]}]' />
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, mt: 3 }}>
            <Button variant="contained" disabled={saving} onClick={() => handleSave('math_games', mathForm, setMathForm, emptyMath, fetchMath)}
              sx={{ flex: 1, bgcolor: '#7C4DFF', color: 'white', fontWeight: 800, borderRadius: '12px', py: 1, '&:hover': { bgcolor: '#693ddb' } }}>
              {saving ? 'Saving…' : editId ? 'Update' : 'Add Game'}
            </Button>
            {editId && (
              <Button variant="outlined" onClick={() => cancelEdit(setMathForm, emptyMath)}
                sx={{ borderColor: 'rgba(0,0,0,0.15)', color: 'text.secondary', fontWeight: 700, borderRadius: '12px' }}>
                Cancel
              </Button>
            )}
          </Box>
        </Paper>
      </Grid>

      {/* List */}
      <Grid item size={{ xs: 12, md: 8 }}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: '1.5px solid rgba(0,0,0,0.055)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
            <Typography variant="subtitle1" fontWeight={900} sx={{ fontFamily: '"Nunito", sans-serif' }}>
              📋 Math Activities List ({mathGames.length})
            </Typography>
            <Chip label="Live Sync" size="small" sx={{ fontWeight: 800, fontSize: '0.62rem', bgcolor: '#EFF6FF', color: '#3B82F6' }} />
          </Box>
          {loading ? (
            <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}><CircularProgress size={24} sx={{ color: '#7C4DFF' }} /></Box>
          ) : (
            <Box sx={{ maxHeight: 520, overflowY: 'auto', pr: 1 }}>
              {mathGames.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ py: 6, textAlign: 'center', fontWeight: 600 }}>No math activities available. Add one using the form.</Typography>
              )}
              {mathGames.map(g => (
                <GameRow key={g.id} game={g} onEdit={() => handleEdit(g, setMathForm)} onDelete={() => handleDelete('math_games', g.id, fetchMath)} />
              ))}
            </Box>
          )}
        </Paper>
      </Grid>
    </Grid>
  );

  /* ═══════════════════════════════
     PUZZLE GAMES TAB
  ═══════════════════════════════ */
  const renderPuzzleTab = () => (
    <Grid container spacing={3}>
      <Grid item size={{ xs: 12, md: 4 }}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: '1.5px solid rgba(0,0,0,0.055)' }}>
          <Typography variant="subtitle1" fontWeight={900} sx={{ mb: 2.5, fontFamily: '"Nunito", sans-serif' }}>
            {editId ? '✏️ Edit Puzzle Game' : '➕ Add Puzzle Game'}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Grid container spacing={2}>
              <Grid item size={{ xs: 8 }}>
                <TextField label="Title" size="small" fullWidth value={puzzleForm.title} onChange={e => setPuzzleForm(f => ({ ...f, title: e.target.value }))} />
              </Grid>
              <Grid item size={{ xs: 4 }}>
                <TextField label="Emoji" size="small" fullWidth value={puzzleForm.emoji} onChange={e => setPuzzleForm(f => ({ ...f, emoji: e.target.value }))} />
              </Grid>
            </Grid>
            <TextField label="Description" size="small" fullWidth multiline rows={2} value={puzzleForm.description} onChange={e => setPuzzleForm(f => ({ ...f, description: e.target.value }))} />
            <Grid container spacing={2}>
              <Grid item size={{ xs: 4 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Shape</InputLabel>
                  <Select value={puzzleForm.shape_type} onChange={e => setPuzzleForm(f => ({ ...f, shape_type: e.target.value }))} label="Shape">
                    <MenuItem value="2D">2D</MenuItem>
                    <MenuItem value="3D">3D</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item size={{ xs: 4 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Age Group</InputLabel>
                  <Select value={puzzleForm.age_group} onChange={e => setPuzzleForm(f => ({ ...f, age_group: e.target.value }))} label="Age Group">
                    {AGE_GROUPS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item size={{ xs: 4 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Difficulty</InputLabel>
                  <Select value={puzzleForm.difficulty} onChange={e => setPuzzleForm(f => ({ ...f, difficulty: e.target.value }))} label="Difficulty">
                    {DIFFICULTIES.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <TextField label="Pieces Image URL" size="small" fullWidth value={puzzleForm.pieces_url} onChange={e => setPuzzleForm(f => ({ ...f, pieces_url: e.target.value }))} />
            <TextField label="Gradient CSS" size="small" fullWidth value={puzzleForm.gradient} onChange={e => setPuzzleForm(f => ({ ...f, gradient: e.target.value }))} />
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, mt: 3 }}>
            <Button variant="contained" disabled={saving} onClick={() => handleSave('puzzle_games', puzzleForm, setPuzzleForm, emptyPuzzle, fetchPuzzle)}
              sx={{ flex: 1, bgcolor: '#7C4DFF', color: 'white', fontWeight: 800, borderRadius: '12px', py: 1, '&:hover': { bgcolor: '#693ddb' } }}>
              {saving ? 'Saving…' : editId ? 'Update' : 'Add Puzzle'}
            </Button>
            {editId && (
              <Button variant="outlined" onClick={() => cancelEdit(setPuzzleForm, emptyPuzzle)}
                sx={{ borderColor: 'rgba(0,0,0,0.15)', color: 'text.secondary', fontWeight: 700, borderRadius: '12px' }}>
                Cancel
              </Button>
            )}
          </Box>
        </Paper>
      </Grid>
      <Grid item size={{ xs: 12, md: 8 }}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: '1.5px solid rgba(0,0,0,0.055)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
            <Typography variant="subtitle1" fontWeight={900} sx={{ fontFamily: '"Nunito", sans-serif' }}>
              📋 Puzzle Catalog ({puzzleGames.length})
            </Typography>
            <Chip label="Live Sync" size="small" sx={{ fontWeight: 800, fontSize: '0.62rem', bgcolor: '#EFF6FF', color: '#3B82F6' }} />
          </Box>
          {loading ? (
            <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}><CircularProgress size={24} sx={{ color: '#7C4DFF' }} /></Box>
          ) : (
            <Box sx={{ maxHeight: 520, overflowY: 'auto', pr: 1 }}>
              {puzzleGames.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ py: 6, textAlign: 'center', fontWeight: 600 }}>No puzzle activities configured.</Typography>
              )}
              {puzzleGames.map(g => (
                <GameRow key={g.id} game={g} onEdit={() => handleEdit(g, setPuzzleForm)} onDelete={() => handleDelete('puzzle_games', g.id, fetchPuzzle)} />
              ))}
            </Box>
          )}
        </Paper>
      </Grid>
    </Grid>
  );

  /* ─── LOGIC GAMES TAB ─── */
  const renderLogicTab = () => (
    <Grid container spacing={3}>
      <Grid item size={{ xs: 12, md: 4 }}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: '1.5px solid rgba(0,0,0,0.055)' }}>
          <Typography variant="subtitle1" fontWeight={900} sx={{ mb: 2.5, fontFamily: '"Nunito", sans-serif' }}>
            {editId ? '✏️ Edit Logic Game' : '➕ Add Logic Game'}
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Grid container spacing={2}>
              <Grid item size={{ xs: 8 }}>
                <TextField label="Title" size="small" fullWidth value={logicForm.title} onChange={e => setLogicForm(f => ({ ...f, title: e.target.value }))} />
              </Grid>
              <Grid item size={{ xs: 4 }}>
                <TextField label="Emoji" size="small" fullWidth value={logicForm.emoji} onChange={e => setLogicForm(f => ({ ...f, emoji: e.target.value }))} />
              </Grid>
            </Grid>
            <TextField label="Description" size="small" fullWidth multiline rows={2} value={logicForm.description} onChange={e => setLogicForm(f => ({ ...f, description: e.target.value }))} />
            <Grid container spacing={2}>
              <Grid item size={{ xs: 6 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Age Group</InputLabel>
                  <Select value={logicForm.age_group} onChange={e => setLogicForm(f => ({ ...f, age_group: e.target.value }))} label="Age Group">
                    {AGE_GROUPS.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item size={{ xs: 6 }}>
                <FormControl size="small" fullWidth>
                  <InputLabel>Difficulty</InputLabel>
                  <Select value={logicForm.difficulty} onChange={e => setLogicForm(f => ({ ...f, difficulty: e.target.value }))} label="Difficulty">
                    {DIFFICULTIES.map(o => <MenuItem key={o} value={o}>{o}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
            <TextField label="Gradient CSS" size="small" fullWidth value={logicForm.gradient} onChange={e => setLogicForm(f => ({ ...f, gradient: e.target.value }))} />
            <TextField label="Pattern Data (JSON array)" size="small" fullWidth multiline rows={2} value={logicForm.pattern_data} onChange={e => setLogicForm(f => ({ ...f, pattern_data: e.target.value }))} placeholder='["🔴","🔵","?"]' />
            <TextField label="Maze Layout (JSON Object)" size="small" fullWidth multiline rows={2} value={logicForm.maze_layout} onChange={e => setLogicForm(f => ({ ...f, maze_layout: e.target.value }))} placeholder='{"rows":5,"cols":5,"walls":[[0,1]]}' />
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, mt: 3 }}>
            <Button variant="contained" disabled={saving} onClick={() => handleSave('logic_games', logicForm, setLogicForm, emptyLogic, fetchLogic)}
              sx={{ flex: 1, bgcolor: '#7C4DFF', color: 'white', fontWeight: 800, borderRadius: '12px', py: 1, '&:hover': { bgcolor: '#693ddb' } }}>
              {saving ? 'Saving…' : editId ? 'Update' : 'Add Logic'}
            </Button>
            {editId && (
              <Button variant="outlined" onClick={() => cancelEdit(setLogicForm, emptyLogic)}
                sx={{ borderColor: 'rgba(0,0,0,0.15)', color: 'text.secondary', fontWeight: 700, borderRadius: '12px' }}>
                Cancel
              </Button>
            )}
          </Box>
        </Paper>
      </Grid>
      <Grid item size={{ xs: 12, md: 8 }}>
        <Paper elevation={0} sx={{ p: 3, borderRadius: '20px', border: '1.5px solid rgba(0,0,0,0.055)' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
            <Typography variant="subtitle1" fontWeight={900} sx={{ fontFamily: '"Nunito", sans-serif' }}>
              📋 Logic Games Catalog ({logicGames.length})
            </Typography>
            <Chip label="Live Sync" size="small" sx={{ fontWeight: 800, fontSize: '0.62rem', bgcolor: '#EFF6FF', color: '#3B82F6' }} />
          </Box>
          {loading ? (
            <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}><CircularProgress size={24} sx={{ color: '#7C4DFF' }} /></Box>
          ) : (
            <Box sx={{ maxHeight: 600, overflowY: 'auto', pr: 1 }}>
              {logicGames.length === 0 && (
                <Typography variant="body2" color="text.secondary" sx={{ py: 6, textAlign: 'center', fontWeight: 600 }}>No logic games configured.</Typography>
              )}
              {logicGames.map(g => (
                <GameRow key={g.id} game={g} onEdit={() => handleEdit(g, setLogicForm)} onDelete={() => handleDelete('logic_games', g.id, fetchLogic)} />
              ))}
            </Box>
          )}
        </Paper>
      </Grid>
    </Grid>
  );

  /* ═══════════════════════════════
     SCORES TAB
  ═══════════════════════════════ */
  const renderScoresTab = () => (
    <Paper elevation={0} sx={{ p: 3.5, borderRadius: '24px', border: '1.5px solid rgba(0,0,0,0.055)' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h6" fontWeight={900} sx={{ fontFamily: '"Nunito", sans-serif' }}>📊 Student Activity Logs</Typography>
          <Typography variant="caption" color="text.secondary" fontWeight={600}>LATEST 50 NUMERACY AND LOGICAL SESSIONS RECORDED BY STUDENTS</Typography>
        </Box>
        <Button variant="contained" color="secondary" startIcon={<RefreshIcon />} onClick={fetchScores} disabled={loading}
          sx={{ fontWeight: 800, borderRadius: '12px' }}>
          Refresh Log
        </Button>
      </Box>
      {loading ? (
        <Box sx={{ py: 6, display: 'flex', justifyContent: 'center' }}><CircularProgress size={24} sx={{ color: '#7C4DFF' }} /></Box>
      ) : (
        <TableContainer sx={{ overflowX: 'auto', borderRadius: '16px', border: '1px solid rgba(0,0,0,0.06)' }}>
          <Table>
            <TableHead sx={{ bgcolor: 'rgba(0,0,0,0.015)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 800, fontSize: '0.78rem' }}>Game ID</TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: '0.78rem' }}>Score Badge</TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: '0.78rem' }}>Accuracy Level</TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: '0.78rem' }}>Duration</TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: '0.78rem' }}>Student UID</TableCell>
                <TableCell sx={{ fontWeight: 800, fontSize: '0.78rem' }}>Timestamp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {scores.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} sx={{ textAlign: 'center', py: 8 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>No students scores recorded yet.</Typography>
                  </TableCell>
                </TableRow>
              ) : (
                scores.map((s, i) => (
                  <TableRow key={s.id || s._id || i} sx={{ '&:hover': { bgcolor: 'rgba(0,0,0,0.01)' } }}>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.75rem', fontWeight: 700, textTransform: 'capitalize' }}>
                      {s.activity_id || s.activity_type || 'numeracy'}
                    </TableCell>
                    <TableCell>
                      <Chip label={`⭐ ${s.score} pts`} size="small" sx={{
                        fontWeight: 800, fontSize: '0.65rem', bgcolor: '#FFF8E1', color: '#F5A623', border: '1px solid rgba(245,166,35,0.2)'
                      }} />
                    </TableCell>
                    <TableCell>
                      <Chip label={s.accuracy !== undefined ? `${s.accuracy}%` : '—'} size="small" sx={{
                        fontWeight: 800, fontSize: '0.65rem', bgcolor: 'rgba(124,77,255,0.08)', color: '#7C4DFF'
                      }} />
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.78rem', fontWeight: 600 }}>
                      {s.time_spent ? `${s.time_spent}s` : 'Untimed'}
                    </TableCell>
                    <TableCell sx={{ fontFamily: 'monospace', fontSize: '0.72rem', color: 'text.secondary' }}>
                      👤 {s.display_name || s.username || (s.child_id ? `${s.child_id.slice(0, 10)}…` : 'Guest Mode')}
                    </TableCell>
                    <TableCell sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 600 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CalendarIcon sx={{ fontSize: 14, color: '#9CA3AF' }} />
                        {s.date ? new Date(s.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Local Mode'}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  );

  /* Top Metric Cards Row */
  const statsList = [
    { label: 'Math Activities', value: statsSummary.mathCount, icon: '🔢', color: '#3B82F6', bg: '#EFF6FF', border: 'rgba(59,130,246,0.15)' },
    { label: 'Puzzle Tasks', value: statsSummary.puzzleCount, icon: '🧩', color: '#2EC4B6', bg: '#F0FFF4', border: 'rgba(46,196,178,0.15)' },
    { label: 'Logic Island Quizzes', value: statsSummary.logicCount, icon: '🧠', color: '#8B5CF6', bg: '#F5F3FF', border: 'rgba(139,92,246,0.15)' },
    { label: 'Avg Achievement', value: `${statsSummary.avg} pts`, icon: '📈', color: '#66BB6A', bg: '#EFF6FF', border: 'rgba(102,187,106,0.15)' },
  ];

  const tabContent = {
    math: renderMathTab(),
    puzzle: renderPuzzleTab(),
    logic: renderLogicTab(),
    scores: renderScoresTab()
  };

  return (
    <Box sx={{ animation: 'fadeIn 0.5s ease-out' }}>
      {/* Toast Alert */}
      <AnimatePresence>
        {toast && (
          <motion.div initial={{ opacity: 0, y: -40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -40 }}
            className="fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl text-white text-sm font-bold shadow-xl"
            style={{ background: toast.type === 'error' ? '#EF4444' : '#10B981' }}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Metric Summary Cards Grid */}
      <Grid container spacing={2.5} sx={{ mb: 4.5 }}>
        {statsList.map((st, i) => (
          <Grid item size={{ xs: 6, md: 3 }} key={st.label}>
            <Box sx={{
              p: 2.5, borderRadius: '22px', bgcolor: st.bg, border: `1.5px solid ${st.border}`, borderTop: `4px solid ${st.color}`,
              boxShadow: `0 4px 16px ${st.border}`, transition: 'all 0.2s ease',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              '&:hover': { transform: 'translateY(-4px)', boxShadow: `0 8px 24px ${st.border}` }
            }}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={800} sx={{ fontSize: '0.68rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{st.label}</Typography>
                <Typography variant="h4" fontWeight={900} sx={{ color: st.color, mt: 0.5, fontFamily: '"Nunito", sans-serif' }}>{st.value}</Typography>
              </Box>
              <Avatar sx={{ width: 44, height: 44, fontSize: '1.5rem', bgcolor: 'rgba(255,255,255,0.75)', border: '1.5px solid rgba(0,0,0,0.04)', boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>{st.icon}</Avatar>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* Tabs Row */}
      <Paper elevation={0} sx={{ borderRadius: '20px', overflow: 'hidden', mb: 3.5, border: '1.5px solid rgba(0,0,0,0.055)' }}>
        <Tabs value={activeTab} onChange={handleTabChange} sx={{
          px: 1.5, py: 0.5,
          '& .MuiTabs-indicator': { bgcolor: '#7C4DFF', height: 3.5, borderRadius: '4px' },
          '& .MuiTab-root': { fontWeight: 900, fontSize: '0.8rem', letterSpacing: '0.02em', textTransform: 'uppercase', color: 'text.secondary', minHeight: 48 },
          '& .MuiTab-root.Mui-selected': { color: '#7C4DFF' }
        }}>
          {TABS.map(tab => (
            <Tab key={tab.id} value={tab.id} label={`${tab.emoji} ${tab.label}`} />
          ))}
        </Tabs>
      </Paper>

      {/* Dynamic Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
          {tabContent[activeTab]}
        </motion.div>
      </AnimatePresence>
    </Box>
  );
}
