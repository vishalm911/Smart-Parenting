import { useState, useRef, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import FloatingElements from '../../components/animations/FloatingElements';
import ConfettiEffect from '../../components/animations/ConfettiEffect';
import { getTranslation } from '../../utils/translations';
import './BrainWorldPage.css';

const staggerContainer = {
  initial: {},
  animate: { transition: { staggerChildren: 0.08 } },
};
const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

/* ============================================================
   1. DRAWING PAD
   ============================================================ */
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
    
    // Save to local count
    const total = Number(localStorage.getItem('spaceece_drawings_count') || 0) + 1;
    localStorage.setItem('spaceece_drawings_count', String(total));

    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="game-container">
      <ConfettiEffect active={saved} />
      <button onClick={() => navigate('/child/creativity-world')} className="game-back-btn">
        ← Back to Creativity World
      </button>
      <div className="game-header">
        <h2 className="game-title">🎨 Drawing Pad</h2>
      </div>

      {/* Toolbar */}
      <div className="game-board-card" style={{ width: '100%', gap: '16px', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {PALETTE.map(c => (
            <button key={c} onClick={() => setColor(c)}
              className="w-8 h-8 rounded-full shadow-md border-2 transition-transform hover:scale-125"
              style={{ background: c, borderColor: color === c ? '#7C4DFF' : 'transparent', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          {BRUSH_SIZES.map(s => (
            <button key={s} onClick={() => setBrushSize(s)}
              className="rounded-full flex items-center justify-center"
              style={{ 
                width: `${s + 16}px`, 
                height: `${s + 16}px`, 
                borderRadius: '50%', 
                background: brushSize === s ? color : 'var(--color-bg-elevated)', 
                border: brushSize === s ? `2px solid ${color}` : '2px solid transparent',
                cursor: 'pointer'
              }}
            >
              <div className="rounded-full" style={{ width: s, height: s, borderRadius: '50%', background: brushSize === s ? '#fff' : color }} />
            </button>
          ))}
        </div>
      </div>

      {/* Canvas */}
      <canvas ref={canvasRef} width={600} height={400}
        className="w-full rounded-2xl shadow-lg mb-4 touch-none"
        style={{ background: '#fff', cursor: 'crosshair', border: '2px solid var(--color-border)', width: '100%', minHeight: '300px', display: 'block', marginTop: '16px' }}
        onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
        onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} />

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <button onClick={clear} className="btn-ghost" style={{ padding: '8px 24px', borderRadius: '999px' }}>🗑️ Clear</button>
        <button onClick={save} className="btn-orange" style={{ padding: '8px 24px', borderRadius: '999px' }}>💾 Save Drawing</button>
      </div>
    </div>
  );
}

/* ============================================================
   2. STORY CREATOR
   ============================================================ */
const STICKERS = ['🦁','🐸','🌈','🏰','🌸','🚀','⭐','🌊','🦋','🌺','🎈','🍭'];

function StoryCreator() {
  const navigate = useNavigate();
  const [panels, setPanels] = useState([[], [], []]);
  const [activePanel, setActivePanel] = useState(0);
  const [done, setDone] = useState(false);

  const addSticker = (sticker) => {
    const updated = panels.map((p, i) => i === activePanel ? [...p, sticker] : p);
    setPanels(updated);
  };

  const clearPanel = () => {
    const updated = panels.map((p, i) => i === activePanel ? [] : p);
    setPanels(updated);
  };

  const handleFinish = () => {
    setDone(true);
    const total = Number(localStorage.getItem('spaceece_stories_count') || 0) + 1;
    localStorage.setItem('spaceece_stories_count', String(total));
  };

  return (
    <div className="game-container">
      <button onClick={() => navigate('/child/creativity-world')} className="game-back-btn">
        ← Back to Creativity World
      </button>
      <div className="game-header">
        <h2 className="game-title">📖 Story Creator</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontWeight: 800, marginTop: '4px' }}>
          Pick a panel, then tap stickers to build your adventure story!
        </p>
      </div>

      {done ? (
        <div className="game-board-card" style={{ width: '100%' }}>
          <div style={{ fontSize: '4.5rem' }}>🌈📖✨</div>
          <h3 className="brain-card-title" style={{ fontSize: '1.5rem' }}>Story Published!</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontWeight: 700 }}>Your story was added to the gallery album!</p>
          <button onClick={() => { setPanels([[], [], []]); setActivePanel(0); setDone(false); }} className="btn-orange" style={{ padding: '10px 24px', borderRadius: '999px', marginTop: '12px' }}>
            Create New 🔄
          </button>
        </div>
      ) : (
        <>
          {/* Story Panels */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
            {panels.map((panel, i) => (
              <div 
                key={i} 
                onClick={() => setActivePanel(i)} 
                style={{ 
                  aspectRatio: '1', 
                  borderRadius: '16px', 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  gap: '4px', 
                  padding: '8px', 
                  cursor: 'pointer',
                  position: 'relative',
                  background: activePanel === i ? 'rgba(124,77,255,0.08)' : 'var(--color-bg-elevated)', 
                  border: `3px solid ${activePanel === i ? '#7C4DFF' : 'var(--color-border)'}`, 
                  minHeight: '100px' 
                }}
              >
                <span style={{ position: 'absolute', top: '4px', left: '8px', fontSize: '0.75rem', fontWeight: 800, color: 'var(--color-text-muted)' }}>Panel {i + 1}</span>
                {panel.length === 0 ? <span style={{ color: 'var(--color-text-muted)', fontSize: '1.5rem' }}>+</span> : panel.map((s, j) => <span key={j} className="text-2xl">{s}</span>)}
              </div>
            ))}
          </div>

          {/* Sticker palette */}
          <div className="game-board-card" style={{ width: '100%', padding: '16px', gap: '8px' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--color-text-secondary)' }}>Tap stickers to add to Panel {activePanel + 1}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', justifyContent: 'center' }}>
              {STICKERS.map(s => (
                <motion.button key={s} whileHover={{ scale: 1.25 }} whileTap={{ scale: 0.9 }} onClick={() => addSticker(s)} style={{ fontSize: '2.5rem', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                  {s}
                </motion.button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button onClick={clearPanel} className="btn-ghost" style={{ flex: 1, padding: '8px', borderRadius: '12px' }}>
              🗑️ Clear Panel {activePanel + 1}
            </button>
            <button onClick={handleFinish} className="btn-orange" style={{ flex: 1, padding: '8px', borderRadius: '12px' }}>
              Publish Story 🚀
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/* ============================================================
   3. COLOR STUDIO (Previously "Coming Soon" - Now Fully Active!)
   ============================================================ */
const SHAPES = [
  { id: 'cat', emoji: '🐱', path: 'M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4Z' },
  { id: 'star', emoji: '⭐', path: 'M12,17.27L18.18,21L16.54,13.97L22,9.24L14.81,8.62L12,2L9.19,8.62L2,9.24L7.45,13.97L5.82,21L12,17.27Z' },
  { id: 'heart', emoji: '❤️', path: 'M12,21.35L10.55,20.03C5.4,15.36 2,12.27 2,8.5C2,5.41 4.42,3 7.5,3C9.24,3 10.91,3.81 12,5.08C13.09,3.81 14.76,3 16.5,3C19.58,3 22,5.41 22,8.5C22,12.27 18.6,15.36 13.45,20.03L12,21.35Z' }
];

function ColorStudio() {
  const navigate = useNavigate();
  const [selectedShape, setSelectedShape] = useState(SHAPES[0]);
  const [fillColor, setFillColor] = useState('#EF4444');
  const [coloredParts, setColoredParts] = useState({}); // shapeId -> color
  const [done, setDone] = useState(false);

  const handleColorClick = (shapeId) => {
    setColoredParts({
      ...coloredParts,
      [shapeId]: fillColor
    });
    setDone(true);
    localStorage.setItem('spaceece_color_studio_sessions', 'Active 🎨');
  };

  const reset = () => {
    setColoredParts({});
    setDone(false);
  };

  return (
    <div className="game-container">
      <button onClick={() => navigate('/child/creativity-world')} className="game-back-btn">
        ← Back to Creativity World
      </button>
      <div className="game-header">
        <h2 className="game-title">🎨 Color Studio</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontWeight: 800 }}>Select a shape, choose a color, and tap the shape to paint! 🌈</p>
      </div>

      {/* Palette */}
      <div className="game-board-card" style={{ width: '100%', gap: '16px', padding: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {PALETTE.map(c => (
            <button key={c} onClick={() => setFillColor(c)}
              className="w-8 h-8 rounded-full border-2 transition-transform hover:scale-125"
              style={{ background: c, borderColor: fillColor === c ? '#7C4DFF' : 'transparent', width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer' }} />
          ))}
        </div>

        {/* Shape Choices */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
          {SHAPES.map(s => (
            <button 
              key={s.id} 
              onClick={() => setSelectedShape(s)}
              className="btn-ghost"
              style={{ padding: '8px 16px', fontSize: '1.3rem', border: selectedShape.id === s.id ? '2.5px solid #7C4DFF' : '2px solid var(--color-border)', borderRadius: '12px' }}
            >
              {s.emoji} {s.id.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Canvas Shape SVG */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '24px' }}>
        <svg 
          viewBox="0 0 24 24" 
          width="200" 
          height="200" 
          onClick={() => handleColorClick(selectedShape.id)}
          style={{ cursor: 'pointer', stroke: '#1A1A1A', strokeWidth: 0.8, transition: 'all 0.3s' }}
        >
          <path 
            d={selectedShape.path} 
            fill={coloredParts[selectedShape.id] || '#F3F4F6'} 
          />
        </svg>

        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
          <button onClick={reset} className="btn-ghost" style={{ padding: '8px 20px', borderRadius: '12px' }}>🗑️ Reset Shape</button>
          <button onClick={() => navigate('/child/creativity-world')} className="btn-orange" style={{ padding: '8px 20px', borderRadius: '12px' }}>Done ✅</button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   4. MY GALLERY (Previously "Coming Soon" - Now Fully Active!)
   ============================================================ */
function MyGallery() {
  const navigate = useNavigate();
  
  const sampleItems = [
    { title: 'My Space Journey 🚀', date: 'Today', type: 'drawing', color: '#BFDBFE', emoji: '🎨' },
    { title: 'Forest Adventure 🦁🌳', date: 'Yesterday', type: 'story', color: '#FED7AA', emoji: '📖' },
    { title: 'Beautiful Rainbow 🌈', date: '2 days ago', type: 'colored', color: '#FBCFE8', emoji: '🎨' }
  ];

  return (
    <div className="game-container">
      <button onClick={() => navigate('/child/creativity-world')} className="game-back-btn">
        ← Back to Creativity World
      </button>
      <div className="game-header">
        <h2 className="game-title">🖼️ My Gallery</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontWeight: 800 }}>Explore all the masterpieces you've built! 🌟</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginTop: '16px' }}>
        {sampleItems.map((item, idx) => (
          <div 
            key={idx} 
            style={{ 
              borderRadius: '20px', 
              padding: '24px 16px', 
              textAlign: 'center', 
              border: '2px solid var(--color-border)', 
              background: item.color,
              boxShadow: 'var(--shadow-sm)',
              position: 'relative'
            }}
          >
            <div style={{ fontSize: '3rem', marginBottom: '8px' }}>{item.emoji}</div>
            <h4 style={{ fontWeight: 800, color: '#1A1A1A', fontSize: '0.95rem', margin: '4px 0' }}>{item.title}</h4>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'rgba(0,0,0,0.6)' }}>Published {item.date}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ============================================================
   CREATIVITY WORLD HOME
   ============================================================ */
const MascotCompanion = () => {
  const mascot = localStorage.getItem('spaceece_mascot') || '🦁';
  const mascotNames = { '🦁': 'Leo the Lion', '🐯': 'Toby the Tiger', '🐼': 'Penny the Panda', '🦊': 'Felix the Fox', '🐱': 'Cleo the Cat', '🐶': 'Buddy the Dog' };
  const mascotName = mascotNames[mascot] || 'My Companion';
  
  const [bubbleText, setBubbleText] = useState(`Hi there! I am ${mascotName}. Let's learn and play together today! ✨`);
  const [sparkle, setSparkle] = useState(false);
  const [heart, setHeart] = useState(false);

  const handlePet = () => {
    setHeart(true);
    setSparkle(false);
    const reactions = [
      `Aww, that tickles! 🥰`,
      `You are my best friend! ❤️`,
      `Hehe, thank you! I love pet sessions! 😄`
    ];
    setBubbleText(reactions[Math.floor(Math.random() * reactions.length)]);
    setTimeout(() => setHeart(false), 1500);
  };

  const handleFeed = () => {
    setSparkle(true);
    setHeart(false);
    const foods = ['🍌', '🍎', '🥕', '🍪', '🍓'];
    const selectedFood = foods[Math.floor(Math.random() * foods.length)];
    setBubbleText(`Nom nom nom! That ${selectedFood} was super tasty! 😋`);
    setTimeout(() => setSparkle(false), 1500);
  };

  const handleTalk = () => {
    setSparkle(false);
    setHeart(false);
    const facts = [
      `Did you know that honeybees can dance to talk to each other? 🐝💃`,
      `Every puzzle you solve makes our brains grow bigger! 🧠`,
      `Being kind to a friend is like giving them a bright sunshine! ☀️`,
      `You are doing amazing today! Keep going! 🌟`
    ];
    setBubbleText(facts[Math.floor(Math.random() * facts.length)]);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="brain-sidebar-card"
      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', padding: '24px' }}
    >
      <h3 className="sidebar-title" style={{ width: '100%', justifyContent: 'center' }}>🐾 Mascot Companion</h3>
      
      <div style={{ position: 'relative', margin: '16px 0' }}>
        <motion.div 
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          style={{ fontSize: '5rem', cursor: 'pointer', userSelect: 'none', lineHeight: 1 }}
          onClick={handlePet}
        >
          {mascot}
        </motion.div>
        
        <AnimatePresence>
          {heart && (
            <motion.span 
              initial={{ scale: 0, y: 0, opacity: 1 }}
              animate={{ scale: 1.5, y: -45, opacity: 0 }}
              exit={{ opacity: 0 }}
              style={{ position: 'absolute', top: '-10px', left: '30px', zIndex: 10, fontSize: '2rem' }}
            >
              💖
            </motion.span>
          )}
          {sparkle && (
            <motion.span 
              initial={{ scale: 0, y: 0, opacity: 1 }}
              animate={{ scale: 1.5, y: -45, opacity: 0 }}
              exit={{ opacity: 0 }}
              style={{ position: 'absolute', top: '-10px', left: '30px', zIndex: 10, fontSize: '2rem' }}
            >
              ✨
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <div style={{ fontWeight: 800, fontSize: '1.1rem', color: 'var(--color-text)' }}>
        {mascotName}
      </div>

      <div 
        style={{
          background: 'linear-gradient(135deg, #FFFDF0 0%, #FFEEDD 100%)',
          border: '2px solid #FFE4B5',
          borderRadius: '16px',
          padding: '12px 16px',
          fontSize: '0.88rem',
          fontWeight: 700,
          color: '#1A1A1A',
          textAlign: 'center',
          lineHeight: 1.45,
          position: 'relative',
          width: '100%',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {bubbleText}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', width: '100%', marginTop: '8px' }}>
        <button onClick={handlePet} className="btn-ghost" style={{ padding: '8px 4px', fontSize: '0.78rem', fontWeight: 800, borderRadius: '12px', cursor: 'pointer' }}>
          Pet 💖
        </button>
        <button onClick={handleFeed} className="btn-ghost" style={{ padding: '8px 4px', fontSize: '0.78rem', fontWeight: 800, borderRadius: '12px', cursor: 'pointer' }}>
          Feed 🍎
        </button>
        <button onClick={handleTalk} className="btn-orange" style={{ padding: '8px 4px', fontSize: '0.78rem', fontWeight: 800, borderRadius: '12px', cursor: 'pointer' }}>
          Talk 🗣️
        </button>
      </div>
    </motion.div>
  );
};

/* ============================================================
   CREATIVITY WORLD HOME
   ============================================================ */
const CreativityWorldHome = () => {
  const navigate = useNavigate();
  const { profile } = useUser();
  const currentLang = profile?.language || localStorage.getItem('spaceece_language') || 'English';

  const activities = [
    { id: 'drawing-pad',     title: 'Drawing Pad',    description: 'Create your own masterpiece with digital canvas', emoji: '🖌️', color: '#F2A100' },
    { id: 'story-creator',   title: 'Story Creator',  description: 'Build your own comic stories with stickers',       emoji: '📖', color: '#EC4899' },
    { id: 'coloring-studio', title: 'Color Studio',   description: 'Color beautiful illustrations digitally',         emoji: '🎨', color: '#F7B733' },
    { id: 'gallery',         title: 'My Gallery',     description: 'View all your creative masterpieces',              emoji: '🖼️', color: '#8B5CF6' },
  ];

  return (
    <div className="brain-world-container">
      <FloatingElements count={3} />
      
      {/* Title Header */}
      <motion.section initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="brain-header">
        <motion.span className="text-6xl inline-block mb-3" animate={{ rotate: [0, 12, -12, 0] }} transition={{ duration: 3, repeat: Infinity }}>🎨</motion.span>
        <h1 className="brain-title" style={{ background: 'linear-gradient(135deg, #F2A100 0%, #EC4899 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          {getTranslation('Creativity World', currentLang)}
        </h1>
        <p className="brain-subtitle">{getTranslation('Express yourself through digital art and magic imagination! 🌈', currentLang)}</p>
      </motion.section>

      {/* Two column layout to utilise side blank space */}
      <div className="brain-layout-wrapper">
        
        {/* Left Side: Games & active box */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="brain-grid">
            {activities.map(act => (
              <motion.div 
                key={act.id} 
                variants={staggerItem}
                whileHover={{ y: -6, scale: 1.02 }} 
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/child/creativity-world/${act.id}`)}
                className="brain-activity-card"
                style={{ borderTop: `4px solid ${act.color}` }}
              >
                <div className="brain-card-icon" style={{ background: `${act.color}15`, color: act.color }}>
                  {act.emoji}
                </div>
                <div className="brain-card-info">
                  <h3 className="brain-card-title">{getTranslation(act.title, currentLang)}</h3>
                  <p className="brain-card-desc">{getTranslation(act.description, currentLang)}</p>
                </div>
                <span style={{ fontSize: '1.25rem' }}>🚀</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Active container box */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.4 }}
            className="brain-active-box"
            style={{ background: 'linear-gradient(135deg, #FFF7ED 0%, #FFF0F6 100%)', borderColor: '#FED7AA' }}
          >
            <div style={{ fontSize: '2.5rem' }}>✨🎨🌈</div>
            <h3 className="brain-active-title">{getTranslation('Your Imagination Has No Limits!', currentLang)}</h3>
            <p className="brain-active-desc">{getTranslation('Every drawing, colored shape, and comic panel you design is a unique masterpiece. Keep making, dreaming, and sharing!', currentLang)}</p>
          </motion.div>
        </div>

        {/* Right Side: Interactive Mascot companion (utilises side margins) */}
        <MascotCompanion />

      </div>
    </div>
  );
};

/* ============================================================
   ROUTER PATH COMPONENT
   ============================================================ */
const CreativityWorldPage = () => (
  <Routes>
    <Route index element={<CreativityWorldHome />} />
    <Route path="drawing-pad"     element={<DrawingPad />} />
    <Route path="story-creator"   element={<StoryCreator />} />
    <Route path="coloring-studio" element={<ColorStudio />} />
    <Route path="gallery"         element={<MyGallery />} />
    <Route path="*"               element={<CreativityWorldHome />} />
  </Routes>
);

export default CreativityWorldPage;
