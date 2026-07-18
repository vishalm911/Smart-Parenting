/**
 * StoryWorldPage.jsx
 * Story Choice World: branching narratives with 3 endings each
 * Adapted for integration-lead
 */
import { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import FloatingElements from '../../components/animations/FloatingElements';
import ConfettiEffect from '../../components/animations/ConfettiEffect';
import { getBranchingStories } from '../../api/cognitiveSelService';

const staggerContainer = {
  initial: {},
  animate: { transition: { staggerChildren: 0.1 } },
};
const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
};

/* ═══════════════════════════════════════════════════════
   BRANCHING STORY ENGINE
═══════════════════════════════════════════════════════ */
function StoryPlayer({ storyId, storiesData }) {
  const navigate = useNavigate();
  const story = storiesData.find(s => s.story_id === storyId);
  const [currentNode, setCurrentNode] = useState('start');
  const [history, setHistory] = useState([]);
  const [showConfetti, setShowConfetti] = useState(false);

  if (!story) {
    navigate('/child/story-world');
    return null;
  }

  const node = story.nodes[currentNode];

  const choose = (choice) => {
    setHistory(h => [...h, currentNode]);
    setCurrentNode(choice.next);
    if (story.nodes[choice.next]?.ending) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  };

  const restart = () => { setCurrentNode('start'); setHistory([]); setShowConfetti(false); };

  const emotionMap = { proud: '🌟', happy: '😊', sad: '💙', neutral: '🤔' };

  return (
    <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto', padding: '24px 16px' }}>
      <ConfettiEffect active={showConfetti} />
      <button onClick={() => navigate('/child/story-world')} className="flex items-center gap-2 mb-6 font-semibold" style={{ color: 'var(--text-muted)' }}>
        ← Back to Story World
      </button>
      <div className="flex items-center gap-3 mb-6">
        <span className="text-4xl">{story.emoji}</span>
        <div>
          <h2 className="text-2xl font-extrabold" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{story.title}</h2>
          <p className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>Chapter {history.length + 1}</p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={currentNode} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} className="card p-6">
          {/* Scene */}
          <div className="text-center text-4xl mb-4 space-x-2">{node.scene.split('').filter(c => c.trim()).map((c, i) => <span key={i}>{c}</span>)}</div>

          {/* Story text */}
          <div className="rounded-2xl p-4 mb-5" style={{ background: `${story.color}10`, border: `1.5px solid ${story.color}30` }}>
            <p className="text-base font-semibold text-center leading-relaxed" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              📖 {node.text}
            </p>
          </div>

          {node.ending ? (
            <div className="text-center">
              <div className="text-5xl mb-3">{emotionMap[node.emotion] ?? '🌟'}</div>
              <div className="rounded-2xl p-4 mb-5" style={{ background: 'rgba(76,175,80,0.08)', border: '1px solid rgba(76,175,80,0.3)' }}>
                <p className="font-bold" style={{ color: '#2E7D32' }}>{node.message}</p>
              </div>
              <div className="flex gap-3 justify-center">
                <motion.button whileHover={{ scale: 1.05 }} onClick={restart} className="btn-orange">Read Again 🔄</motion.button>
                <motion.button whileHover={{ scale: 1.05 }} onClick={() => navigate('/child/story-world')} className="btn-ghost">More Stories</motion.button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {node.choices.map((choice, i) => (
                <motion.button key={i} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                  onClick={() => choose(choice)}
                  className="font-semibold text-left rounded-2xl p-4 shadow-md"
                  style={{ background: 'var(--bg-accent)', color: 'var(--text-primary)', border: `2px solid ${story.color}22` }}>
                  {choice.text}
                </motion.button>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   STORY WORLD HOME
═══════════════════════════════════════════════════════ */
const StoryWorldHome = ({ storiesData }) => {
  const navigate = useNavigate();

  const stories = (storiesData || []).map(s => ({
    id: s.story_id,
    title: s.title,
    description: s.story_id === 'lost-puppy' ? 'Help find a puppy that wandered away' : 'Discover the secrets of an enchanted garden',
    emoji: s.emoji || '📖',
    color: s.color || '#10B981',
    endings: Object.values(s.nodes || {}).filter(n => n.ending).length
  })).concat([
    { id: 'treasure-hunt', title: 'Treasure Hunt',      description: 'Follow the map to find hidden treasure', emoji: '🗺️', color: '#3B82F6', comingSoon: true, endings: 3 },
    { id: 'space-explorer',title: 'Space Explorer',     description: 'Journey through the stars and meet aliens', emoji: '🚀', color: '#8B5CF6', comingSoon: true, endings: 3 },
  ]);

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <FloatingElements count={3} />
      <div style={{ flex: 1, padding: '40px 32px', width: '100%', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        <motion.section initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <motion.span className="text-6xl inline-block mb-3" animate={{ rotate: [0, -5, 5, 0] }} transition={{ duration: 3, repeat: Infinity }}>📖</motion.span>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-purple-500 via-indigo-400 to-blue-400 bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-display)' }}>
            Story Choice World
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Choose your path and discover unique endings! ✨</p>
        </motion.section>

        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid md:grid-cols-2 gap-5">
          {stories.map(story => (
            <motion.div key={story.id} variants={staggerItem}
              whileHover={!story.comingSoon ? { y: -8, scale: 1.02 } : {}} whileTap={!story.comingSoon ? { scale: 0.98 } : {}}
              onClick={() => !story.comingSoon && navigate(`/child/story-world/${story.id}`)}
              className="card relative overflow-hidden"
              style={{ borderTop: `4px solid ${story.color}`, cursor: story.comingSoon ? 'not-allowed' : 'pointer', opacity: story.comingSoon ? 0.8 : 1 }}>
              {story.comingSoon && (
                <span className="absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-full" style={{ background: `${story.color}22`, color: story.color }}>Coming Soon</span>
              )}
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0" style={{ background: `${story.color}18` }}>
                  {story.emoji}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-extrabold mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>{story.title}</h3>
                  <p className="text-sm mb-2" style={{ color: 'var(--text-muted)' }}>{story.description}</p>
                  <span className="text-xs font-bold" style={{ color: story.color }}>📚 {story.endings} possible endings</span>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
          className="mt-8 card text-center" style={{ background: 'linear-gradient(135deg, #F5F3FF, #EDE9FE)', border: '2px solid #DDD6FE' }}>
          <div className="text-4xl mb-3">✨🎭</div>
          <h3 className="text-xl font-extrabold mb-2" style={{ color: 'var(--text-primary)' }}>Every Choice Matters!</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Make different choices to discover all the unique story endings.</p>
        </motion.div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   ROUTER
═══════════════════════════════════════════════════════ */
const StoryWorldPage = () => {
  const [storiesData, setStoriesData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBranchingStories()
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setStoriesData(data);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-lg font-black" style={{ color: 'var(--text-primary)' }}>
        Loading Stories... 📖
      </div>
    );
  }

  return (
    <Routes>
      <Route index element={<StoryWorldHome storiesData={storiesData} />} />
      <Route path=":storyId" element={<StoryPlayerWrapper storiesData={storiesData} />} />
      <Route path="*" element={<StoryWorldHome storiesData={storiesData} />} />
    </Routes>
  );
};

function StoryPlayerWrapper({ storiesData }) {
  const { storyId } = useParams();
  return <StoryPlayer storyId={storyId} storiesData={storiesData} />;
}

export default StoryWorldPage;
