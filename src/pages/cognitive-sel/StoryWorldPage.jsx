/**
 * StoryWorldPage.jsx
 * Story Choice World: branching narratives with 3 endings each
 * Adapted for integration-lead
 */
import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
   BRANCHING STORY ENGINE
═══════════════════════════════════════════════════════ */
const STORIES = {
  'lost-puppy': {
    title: 'The Lost Puppy',
    emoji: '🐶',
    color: '#F59E0B',
    nodes: {
      start: {
        text: 'You find a little puppy sitting alone in the park, looking sad and lost. What do you do?',
        scene: '🌳🐶😢',
        choices: [
          { text: '🏠 Take the puppy home and look after it', next: 'home' },
          { text: '📣 Ask around the park if anyone lost it', next: 'ask' },
        ],
      },
      home: {
        text: 'You bring the puppy home and give it water and food. It wags its tail happily! What next?',
        scene: '🏠🐶💧🍖',
        choices: [
          { text: '📋 Make "Found Dog" posters and put them up', next: 'poster' },
          { text: '🤗 Keep it as your own pet', next: 'keep' },
        ],
      },
      ask: {
        text: 'You ask around and find an old lady crying — it\'s her puppy! She is so relieved. What do you say?',
        scene: '👵🐶😊',
        choices: [
          { text: '😊 "I\'m so glad I found it for you!"', next: 'kindEnding' },
          { text: '💰 "Can I have a reward please?"', next: 'rewardEnding' },
        ],
      },
      poster: {
        text: 'Your posters work! The owner calls and comes to pick up the puppy. They thank you gratefully.',
        scene: '📋✅🐶👨',
        ending: true,
        emotion: 'proud',
        message: '🌟 You are responsible and kind! The puppy is home safe.',
      },
      keep: {
        text: 'A few days later a child comes looking for their puppy. They had been crying all week.',
        scene: '👦😢🐶',
        choices: [
          { text: '❤️ Return the puppy to the child', next: 'returnEnding' },
          { text: '😐 Pretend you don\'t know about any puppy', next: 'dishonestEnding' },
        ],
      },
      kindEnding: {
        text: 'The old lady hugs you and calls you a true hero. She gives you a beautiful flower from her garden.',
        scene: '🌸👵🐶😊',
        ending: true,
        emotion: 'happy',
        message: '💛 Your kindness made the whole day brighter!',
      },
      rewardEnding: {
        text: 'The old lady gives you a coin but looks a little sad. True kindness doesn\'t need a reward!',
        scene: '💰👵🐶😐',
        ending: true,
        emotion: 'neutral',
        message: '🤔 Helping others feels even better when you don\'t expect anything back!',
      },
      returnEnding: {
        text: 'The child cries happy tears and hugs the puppy tightly. You feel a warm glow in your heart!',
        scene: '👦🐶❤️😊',
        ending: true,
        emotion: 'proud',
        message: '🌟 Doing the right thing always feels amazing. You\'re a hero!',
      },
      dishonestEnding: {
        text: 'The child leaves sad and the puppy misses its family. Honesty is always the right choice.',
        scene: '👦😢🚶',
        ending: true,
        emotion: 'sad',
        message: '💙 It\'s never too late to be honest. Next time, you\'ll know what to do!',
      },
    },
  },
  'magic-garden': {
    title: 'The Magic Garden',
    emoji: '🌸',
    color: '#10B981',
    nodes: {
      start: {
        text: 'You discover a beautiful hidden garden full of glowing flowers. A fairy appears and offers you a gift. Which do you choose?',
        scene: '🌺✨🧚',
        choices: [
          { text: '🌱 A magic seed that grows a wish tree', next: 'wishTree' },
          { text: '📚 A book that teaches you all about plants', next: 'book' },
        ],
      },
      wishTree: {
        text: 'The tree grows! It can grant ONE wish. What do you wish for?',
        scene: '🌳✨⭐',
        choices: [
          { text: '🌍 A healthier planet with more trees', next: 'planetEnding' },
          { text: '🍭 All the sweets I want forever!', next: 'sweetsEnding' },
        ],
      },
      book: {
        text: 'You learn to grow beautiful gardens everywhere. Your village becomes the greenest in the country!',
        scene: '📚🌿🏡',
        ending: true,
        emotion: 'proud',
        message: '🌿 Knowledge is the greatest gift! You made the world greener.',
      },
      planetEnding: {
        text: 'Trees sprout across the world! Birds sing, rivers flow clear, and everyone breathes fresh air.',
        scene: '🌍🌳🐦💨',
        ending: true,
        emotion: 'happy',
        message: '🌟 You thought of everyone, not just yourself. True hero!',
      },
      sweetsEnding: {
        text: 'The sweets are delicious but you feel sick after too many. Perhaps a wish for others lasts longer!',
        scene: '🍭😋🤢',
        ending: true,
        emotion: 'neutral',
        message: '🍬 Sweet moments are better when shared! Think of others next time.',
      },
    },
  },
};

function StoryPlayer({ storyId }) {
  const navigate = useNavigate();
  const story = STORIES[storyId];
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
const StoryWorldHome = () => {
  const navigate = useNavigate();

  const stories = [
    { id: 'lost-puppy',    title: 'The Lost Puppy',     description: 'Help find a puppy that wandered away', emoji: '🐶', color: '#F59E0B', endings: 4 },
    { id: 'magic-garden',  title: 'The Magic Garden',   description: 'Discover the secrets of an enchanted garden', emoji: '🌸', color: '#10B981', endings: 3 },
    { id: 'treasure-hunt', title: 'Treasure Hunt',      description: 'Follow the map to find hidden treasure', emoji: '🗺️', color: '#3B82F6', comingSoon: true, endings: 3 },
    { id: 'space-explorer',title: 'Space Explorer',     description: 'Journey through the stars and meet aliens', emoji: '🚀', color: '#8B5CF6', comingSoon: true, endings: 3 },
  ];

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
  const navigate = useNavigate();
  return (
    <Routes>
      <Route index element={<StoryWorldHome />} />
      <Route path=":storyId" element={<StoryPlayerWrapper />} />
      <Route path="*" element={<StoryWorldHome />} />
    </Routes>
  );
};

function StoryPlayerWrapper() {
  const { storyId } = { storyId: window.location.pathname.split('/').pop() };
  return <StoryPlayer storyId={storyId} />;
}

export default StoryWorldPage;
