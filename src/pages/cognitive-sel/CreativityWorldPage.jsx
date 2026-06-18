/**
 * CreativityWorldPage.jsx
 * Cognitive, Creativity & Social Emotional Universe
 * Creativity World: Drawing Pad, Color Studio, Story Creator, Gallery
 * Adapted for integration-lead
 */
import { useState, useRef, useEffect } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import FloatingElements from '../../components/animations/FloatingElements';
import ConfettiEffect from '../../components/animations/ConfettiEffect';

const staggerContainer = {
  initial: {},
  animate: { transition: { staggerChildren: 0.1 } },
};
const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

/* ═══════════════════════════════════════════════════════
   DRAWING PAD
═══════════════════════════════════════════════════════ */
const PALETTE = ['#EF4444','#F59E0B','#22C55E','#3B82F6','#8B5CF6','#EC4899','#000000','#FFFFFF'];
const BRUSH_SIZES = [4, 8, 14, 22];

function DrawingPad() {
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [color, setColor] = useState('#3B82F6');
  const [brushSize, setBrushSize] = useState(8);
  const [drawing, setDrawing] = useState(false);
  const [saved, setSaved] = useState(false);
  const lastPos = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const getPos = (e, canvas) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const startDraw = (e) => {
    setDrawing(true);
    lastPos.current = getPos(e, canvasRef.current);
  };

  const draw = (e) => {
    if (!drawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const pos = getPos(e, canvas);
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = brushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.moveTo(lastPos.current.x, lastPos.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    lastPos.current = pos;
  };

  const stopDraw = () => { setDrawing(false); lastPos.current = null; };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setSaved(false);
  };

  const save = () => {
    const link = document.createElement('a');
    link.download = 'my-drawing.png';
    link.href = canvasRef.current.toDataURL();
    link.click();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div style={{ width: '100%', maxWidth: '700px', margin: '0 auto', padding: '24px 16px' }}>
      <ConfettiEffect active={saved} />
      <button onClick={() => navigate('/child/creativity-world')} className="flex items-center gap-2 mb-4 font-semibold" style={{ color: 'var(--text-muted)' }}>
        ← Back to Creativity World
      </button>
      <h2 className="text-3xl font-extrabold mb-4 text-center" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>🎨 Drawing Pad</h2>

      {/* Toolbar */}
      <div className="card p-4 mb-4">
        <div className="flex gap-2 flex-wrap justify-center mb-3">
          {PALETTE.map(c => (
            <button key={c} onClick={() => setColor(c)}
              className="w-8 h-8 rounded-full shadow-md border-2 transition-transform hover:scale-125"
              style={{ background: c, borderColor: color === c ? '#7C4DFF' : 'transparent' }} />
          ))}
        </div>
        <div className="flex gap-3 justify-center">
          {BRUSH_SIZES.map(s => (
            <button key={s} onClick={() => setBrushSize(s)}
              className="rounded-full flex items-center justify-center"
              style={{ width: `${s + 16}px`, height: `${s + 16}px`, background: brushSize === s ? color : 'var(--bg-muted)', border: brushSize === s ? `2px solid ${color}` : '2px solid transparent' }}>
              <div className="rounded-full" style={{ width: s, height: s, background: brushSize === s ? '#fff' : color }} />
            </button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <canvas ref={canvasRef} width={600} height={400}
        className="w-full rounded-2xl shadow-lg mb-4 touch-none"
        style={{ background: '#fff', cursor: 'crosshair', border: '2px solid var(--bg-muted)' }}
        onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
        onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} />

      <div className="flex gap-3 justify-center">
        <motion.button whileHover={{ scale: 1.05 }} onClick={clear} className="btn-ghost">🗑️ Clear</motion.button>
        <motion.button whileHover={{ scale: 1.05 }} onClick={save} className="btn-orange">💾 Save Drawing</motion.button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   STORY CREATOR (drag-and-drop panel builder)
═══════════════════════════════════════════════════════ */
const STICKERS = ['🦁','🐸','🌈','🏰','🌸','🚀','⭐','🌊','🦋','🌺','🎈','🍭'];

function StoryCreator() {
  const navigate = useNavigate();
  const [panels, setPanels] = useState([[], [], []]);
  const [activePanel, setActivePanel] = useState(0);

  const addSticker = (sticker) => {
    const updated = panels.map((p, i) => i === activePanel ? [...p, sticker] : p);
    setPanels(updated);
  };

  const clearPanel = () => {
    const updated = panels.map((p, i) => i === activePanel ? [] : p);
    setPanels(updated);
  };

  return (
    <div style={{ width: '100%', maxWidth: '700px', margin: '0 auto', padding: '24px 16px' }}>
      <button onClick={() => navigate('/child/creativity-world')} className="flex items-center gap-2 mb-4 font-semibold" style={{ color: 'var(--text-muted)' }}>
        ← Back to Creativity World
      </button>
      <h2 className="text-3xl font-extrabold mb-4 text-center" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>📖 Story Creator</h2>
      <p className="text-center mb-4 text-sm" style={{ color: 'var(--text-muted)' }}>Pick a panel, then tap stickers to build your story!</p>

      {/* Story Panels */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {panels.map((panel, i) => (
          <motion.div key={i} onClick={() => setActivePanel(i)} whileHover={{ scale: 1.03 }}
            className="aspect-square rounded-2xl flex flex-wrap items-center justify-center gap-1 p-2 cursor-pointer"
            style={{ background: activePanel === i ? 'rgba(124,77,255,0.1)' : 'var(--bg-accent)', border: `2px solid ${activePanel === i ? '#7C4DFF' : 'transparent'}`, minHeight: '80px' }}>
            <span className="absolute top-1 left-2 text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Panel {i + 1}</span>
            {panel.length === 0 ? <span style={{ color: 'var(--text-muted)', fontSize: '1.5rem' }}>+</span> : panel.map((s, j) => <span key={j} className="text-2xl">{s}</span>)}
          </motion.div>
        ))}
      </div>

      {/* Sticker palette */}
      <div className="card p-4 mb-4">
        <p className="text-sm font-bold mb-2 text-center" style={{ color: 'var(--text-secondary)' }}>Tap stickers to add to Panel {activePanel + 1}</p>
        <div className="flex flex-wrap gap-3 justify-center">
          {STICKERS.map(s => (
            <motion.button key={s} whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }} onClick={() => addSticker(s)} className="text-3xl">
              {s}
            </motion.button>
          ))}
        </div>
      </div>

      <motion.button whileHover={{ scale: 1.05 }} onClick={clearPanel} className="btn-ghost w-full">
        🗑️ Clear Panel {activePanel + 1}
      </motion.button>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   CREATIVITY WORLD HOME
═══════════════════════════════════════════════════════ */
const CreativityWorldHome = () => {
  const navigate = useNavigate();

  const activities = [
    { id: 'drawing-pad',     title: 'Drawing Pad',    description: 'Create your own masterpiece with digital canvas', emoji: '🖌️', color: '#F2A100' },
    { id: 'story-creator',   title: 'Story Creator',  description: 'Build your own comic stories with stickers',       emoji: '📖', color: '#EC4899' },
    { id: 'coloring-studio', title: 'Color Studio',   description: 'Colour beautiful illustrations digitally',         emoji: '🎨', color: '#F7B733', comingSoon: true },
    { id: 'gallery',         title: 'My Gallery',     description: 'View all your creative masterpieces',              emoji: '🖼️', color: '#8B5CF6', comingSoon: true },
  ];

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <FloatingElements count={3} />
      <div style={{ flex: 1, padding: '40px 32px', width: '100%', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        <motion.section initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <motion.span className="text-6xl inline-block mb-3" animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 3, repeat: Infinity }}>🎨</motion.span>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-orange-400 via-yellow-400 to-pink-400 bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-display)' }}>
            Creativity World
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Express yourself through art and imagination! 🌈</p>
        </motion.section>

        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid md:grid-cols-2 gap-5">
          {activities.map(act => (
            <motion.div key={act.id} variants={staggerItem}
              whileHover={!act.comingSoon ? { y: -8, scale: 1.02 } : {}} whileTap={!act.comingSoon ? { scale: 0.98 } : {}}
              onClick={() => !act.comingSoon && navigate(`/child/creativity-world/${act.id}`)}
              className="card relative overflow-hidden"
              style={{ borderTop: `4px solid ${act.color}`, cursor: act.comingSoon ? 'not-allowed' : 'pointer', opacity: act.comingSoon ? 0.8 : 1 }}>
              {act.comingSoon && (
                <span className="absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-full" style={{ background: `${act.color}22`, color: act.color }}>Coming Soon</span>
              )}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0" style={{ background: `${act.color}18` }}>
                  {act.emoji}
                </div>
                <div>
                  <h3 className="text-lg font-extrabold mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{act.title}</h3>
                  <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{act.description}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="mt-8 card text-center" style={{ background: 'linear-gradient(135deg, #FFF7ED, #FFF0F6)', border: '2px solid #FED7AA' }}>
          <div className="text-4xl mb-3">✨🎨</div>
          <h3 className="text-xl font-extrabold mb-2" style={{ color: 'var(--text-primary)' }}>Your Imagination Has No Limits!</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Every creation is a masterpiece. Keep making, keep dreaming!</p>
        </motion.div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   ROUTER
═══════════════════════════════════════════════════════ */
const CreativityWorldPage = () => (
  <Routes>
    <Route index element={<CreativityWorldHome />} />
    <Route path="drawing-pad"   element={<DrawingPad />} />
    <Route path="story-creator" element={<StoryCreator />} />
    <Route path="*"             element={<CreativityWorldHome />} />
  </Routes>
);

export default CreativityWorldPage;
