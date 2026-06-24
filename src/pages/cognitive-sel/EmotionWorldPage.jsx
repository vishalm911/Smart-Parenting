/**
 * EmotionWorldPage.jsx
 * Cognitive, Creativity & Social Emotional Universe
 * Emotion World: Check-In, Recognition, Friendship Stories, Kindness Challenge, Decision Making
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
   EMOTION CHECK-IN GAME
═══════════════════════════════════════════════════════ */
const MOODS = [
  { emoji: '😊', label: 'Happy',    color: '#F59E0B', message: 'Wonderful! Keep that smile going! 🌟' },
  { emoji: '😐', label: 'Okay',     color: '#6B7280', message: "That's alright. Every day is different! 💪" },
  { emoji: '😢', label: 'Sad',      color: '#3B82F6', message: "It's okay to feel sad. You are loved! 💙" },
  { emoji: '😠', label: 'Angry',    color: '#EF4444', message: 'Take a deep breath. You can calm down! 🍃' },
  { emoji: '😨', label: 'Scared',   color: '#8B5CF6', message: "It's brave to share how you feel! 💜" },
  { emoji: '🤩', label: 'Excited',  color: '#EC4899', message: 'Your excitement is contagious! 🎉' },
];

function EmotionCheckIn() {
  const navigate = useNavigate();
  const [chosen, setChosen] = useState(null);

  return (
    <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto', padding: '24px 16px' }}>
      <button onClick={() => navigate('/child/emotion-world')} className="flex items-center gap-2 mb-6 font-semibold" style={{ color: 'var(--text-muted)' }}>
        ← Back to Emotion World
      </button>
      <div className="text-center mb-6">
        <h2 className="text-3xl font-extrabold mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>😊 Emotion Check-In</h2>
        <p style={{ color: 'var(--text-muted)' }}>How are you feeling today?</p>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-6">
        {MOODS.map(mood => (
          <motion.button key={mood.label} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
            onClick={() => setChosen(mood)}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl shadow-md"
            style={{ background: chosen?.label === mood.label ? `${mood.color}22` : 'var(--bg-accent)', border: chosen?.label === mood.label ? `2px solid ${mood.color}` : '2px solid transparent' }}>
            <span className="text-4xl">{mood.emoji}</span>
            <span className="text-xs font-bold" style={{ color: mood.color }}>{mood.label}</span>
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {chosen && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="card text-center p-6" style={{ border: `2px solid ${chosen.color}44` }}>
            <div className="text-5xl mb-3">{chosen.emoji}</div>
            <p className="text-lg font-bold" style={{ color: chosen.color }}>{chosen.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   EMOTION RECOGNITION GAME
═══════════════════════════════════════════════════════ */
const EMOTION_SCENARIOS = [
  { face: '😊', correct: 'Happy', options: ['Happy', 'Sad', 'Angry', 'Scared'] },
  { face: '😢', correct: 'Sad', options: ['Happy', 'Sad', 'Excited', 'Okay'] },
  { face: '😠', correct: 'Angry', options: ['Happy', 'Angry', 'Excited', 'Scared'] },
  { face: '😨', correct: 'Scared', options: ['Sad', 'Okay', 'Scared', 'Happy'] },
  { face: '🤩', correct: 'Excited', options: ['Angry', 'Excited', 'Sad', 'Scared'] },
  { face: '😐', correct: 'Okay', options: ['Okay', 'Happy', 'Angry', 'Sad'] },
];

function EmotionRecognition() {
  const navigate = useNavigate();
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [done, setDone] = useState(false);

  const q = EMOTION_SCENARIOS[round % EMOTION_SCENARIOS.length];

  const handle = (opt) => {
    if (feedback) return;
    const correct = opt === q.correct;
    if (correct) { setScore(s => s + 20); setShowConfetti(true); setTimeout(() => setShowConfetti(false), 1000); }
    setFeedback(correct ? 'correct' : 'wrong');
    setTimeout(() => {
      setFeedback(null);
      if (round + 1 >= EMOTION_SCENARIOS.length) setDone(true);
      else setRound(r => r + 1);
    }, 1100);
  };

  if (done) return (
    <div className="max-w-lg mx-auto px-4 py-6 text-center">
      <ConfettiEffect active />
      <div className="text-7xl mb-4">🏆</div>
      <h2 className="text-3xl font-extrabold mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Emotion Expert!</h2>
      <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>Score: <strong>{score}</strong> / {EMOTION_SCENARIOS.length * 20}</p>
      <div className="flex gap-3 justify-center">
        <motion.button whileHover={{ scale: 1.05 }} onClick={() => { setRound(0); setScore(0); setDone(false); }} className="btn-orange">Play Again 🔄</motion.button>
        <motion.button whileHover={{ scale: 1.05 }} onClick={() => navigate('/child/emotion-world')} className="btn-ghost">Back</motion.button>
      </div>
    </div>
  );

  return (
    <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto', padding: '24px 16px' }}>
      <ConfettiEffect active={showConfetti} />
      <button onClick={() => navigate('/child/emotion-world')} className="flex items-center gap-2 mb-6 font-semibold" style={{ color: 'var(--text-muted)' }}>
        ← Back to Emotion World
      </button>
      <div className="text-center mb-2">
        <h2 className="text-3xl font-extrabold mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>👀 Emotion Recognition</h2>
        <p style={{ color: 'var(--text-muted)' }}>{round + 1} / {EMOTION_SCENARIOS.length} · Score: {score}</p>
      </div>
      <motion.div key={round} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="card p-6 mb-4 text-center">
        <motion.div className="text-8xl mb-6" animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
          {q.face}
        </motion.div>
        <p className="text-lg font-semibold mb-4" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>What emotion is this?</p>
        <div className="grid grid-cols-2 gap-3">
          {q.options.map(opt => (
            <motion.button key={opt} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.9 }} onClick={() => handle(opt)} disabled={!!feedback}
              className="font-bold text-lg rounded-2xl py-3 shadow-md"
              style={{ background: feedback && opt === q.correct ? '#4CAF50' : feedback && opt !== q.correct ? '#FFCDD2' : 'var(--bg-accent)', color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
              {opt}
            </motion.button>
          ))}
        </div>
        {feedback && <p className="mt-3 font-bold" style={{ color: feedback === 'correct' ? '#4CAF50' : '#F44336' }}>{feedback === 'correct' ? '🎉 Correct!' : `❌ It's ${q.correct}!`}</p>}
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   FRIENDSHIP STORIES GAME
═══════════════════════════════════════════════════════ */
const FRIENDSHIP_STORIES = [
  {
    scene: '🏫',
    story: 'Ananya sees a new student sitting alone at lunch. What should she do?',
    choices: [
      { text: '😊 Invite them to sit with her friends', correct: true, response: 'Wonderful! You made a new friend feel welcome! 🌟' },
      { text: '😐 Ignore them and continue eating', correct: false, response: 'Hmm, they might feel lonely. Try being more welcoming next time!' },
    ],
  },
  {
    scene: '🎨',
    story: 'Rohan accidentally breaks his friend\'s pencil. What should he do?',
    choices: [
      { text: '🙏 Apologise and offer to replace it', correct: true, response: 'Great! Saying sorry and making it right is very kind! 💙' },
      { text: '🏃 Pretend it didn\'t happen', correct: false, response: 'It\'s better to be honest and apologise. Friends trust each other!' },
    ],
  },
  {
    scene: '⚽',
    story: 'During a game, Priya\'s team loses. Her friend starts crying. What should Priya do?',
    choices: [
      { text: '🤗 Comfort them and say "We played well!"', correct: true, response: 'You are such a caring friend! 🤗' },
      { text: '😤 Tell them "Stop crying, it\'s just a game"', correct: false, response: 'Feelings matter! Comforting friends is always better.' },
    ],
  },
];

function FriendshipStories() {
  const navigate = useNavigate();
  const [round, setRound] = useState(0);
  const [chosen, setChosen] = useState(null);
  const [done, setDone] = useState(false);
  const [score, setScore] = useState(0);

  const q = FRIENDSHIP_STORIES[round % FRIENDSHIP_STORIES.length];

  const handle = (choice) => {
    if (chosen) return;
    setChosen(choice);
    if (choice.correct) setScore(s => s + 30);
    setTimeout(() => {
      if (round + 1 >= FRIENDSHIP_STORIES.length) setDone(true);
      else { setChosen(null); setRound(r => r + 1); }
    }, 2000);
  };

  if (done) return (
    <div className="max-w-lg mx-auto px-4 py-6 text-center">
      <ConfettiEffect active />
      <div className="text-7xl mb-4">❤️</div>
      <h2 className="text-3xl font-extrabold mb-2" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>Friendship Champion!</h2>
      <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>Kindness score: <strong>{score}</strong> / {FRIENDSHIP_STORIES.length * 30}</p>
      <div className="flex gap-3 justify-center">
        <motion.button whileHover={{ scale: 1.05 }} onClick={() => { setRound(0); setScore(0); setChosen(null); setDone(false); }} className="btn-orange">Play Again 🔄</motion.button>
        <motion.button whileHover={{ scale: 1.05 }} onClick={() => navigate('/child/emotion-world')} className="btn-ghost">Back</motion.button>
      </div>
    </div>
  );

  return (
    <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto', padding: '24px 16px' }}>
      <button onClick={() => navigate('/child/emotion-world')} className="flex items-center gap-2 mb-6 font-semibold" style={{ color: 'var(--text-muted)' }}>
        ← Back to Emotion World
      </button>
      <div className="text-center mb-2">
        <h2 className="text-3xl font-extrabold mb-1" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>❤️ Friendship Stories</h2>
        <p style={{ color: 'var(--text-muted)' }}>{round + 1} / {FRIENDSHIP_STORIES.length}</p>
      </div>
      <motion.div key={round} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} className="card p-6 mb-4">
        <div className="text-center text-6xl mb-4">{q.scene}</div>
        <div className="rounded-2xl p-4 mb-5" style={{ background: 'rgba(236,72,153,0.07)', border: '1.5px solid rgba(236,72,153,0.18)' }}>
          <p className="text-base font-semibold text-center leading-relaxed" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
            💭 {q.story}
          </p>
        </div>
        <div className="flex flex-col gap-3">
          {q.choices.map((choice, i) => (
            <motion.button key={i} whileHover={{ scale: chosen ? 1 : 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => handle(choice)} disabled={!!chosen}
              className="font-semibold text-left rounded-2xl p-4 shadow-md"
              style={{ background: chosen === choice ? (choice.correct ? '#4CAF5022' : '#F4433622') : 'var(--bg-accent)', border: chosen === choice ? `2px solid ${choice.correct ? '#4CAF50' : '#F44336'}` : '2px solid transparent', color: 'var(--text-primary)' }}>
              {choice.text}
            </motion.button>
          ))}
        </div>
        <AnimatePresence>
          {chosen && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mt-4 rounded-xl p-3 text-center font-semibold"
              style={{ background: chosen.correct ? 'rgba(76,175,80,0.1)' : 'rgba(244,67,54,0.1)', color: chosen.correct ? '#2E7D32' : '#B71C1C' }}>
              {chosen.response}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════
   EMOTION WORLD HOME
═══════════════════════════════════════════════════════ */
const EmotionWorldHome = () => {
  const navigate = useNavigate();

  const activities = [
    { id: 'emotion-checkin',      title: 'Emotion Check-In',    description: 'How are you feeling today?',             emoji: '😊', color: '#F59E0B' },
    { id: 'emotion-recognition',  title: 'Emotion Recognition',  description: 'Learn to identify different emotions',   emoji: '👀', color: '#EF4444' },
    { id: 'friendship-stories',   title: 'Friendship Stories',   description: 'Make caring choices in social stories',  emoji: '❤️', color: '#EC4899' },
    { id: 'kindness-challenge',   title: 'Kindness Challenge',   description: 'Complete daily acts of kindness',        emoji: '🎁', color: '#8B5CF6', comingSoon: true },
    { id: 'decision-making',      title: 'Decision Making',      description: 'Practice making thoughtful choices',     emoji: '💡', color: '#10B981', comingSoon: true },
  ];

  return (
    <div style={{ minHeight: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column', position: 'relative' }}>
      <FloatingElements count={3} />
      <div style={{ flex: 1, padding: '40px 32px', width: '100%', maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 10 }}>
        <motion.section initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <motion.span className="text-6xl inline-block mb-3" animate={{ scale: [1, 1.15, 1] }} transition={{ duration: 2, repeat: Infinity }}>❤️</motion.span>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-pink-500 via-red-400 to-pink-400 bg-clip-text text-transparent" style={{ fontFamily: 'var(--font-display)' }}>
            Emotion World
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Explore feelings, empathy, and kindness! 🌈</p>
        </motion.section>

        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="grid md:grid-cols-2 gap-5">
          {activities.map(act => (
            <motion.div key={act.id} variants={staggerItem}
              whileHover={!act.comingSoon ? { y: -8, scale: 1.02 } : {}} whileTap={!act.comingSoon ? { scale: 0.98 } : {}}
              onClick={() => !act.comingSoon && navigate(`/child/emotion-world/${act.id}`)}
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
          className="mt-8 card text-center" style={{ background: 'linear-gradient(135deg, #FFF0F6, #EDE9FE)', border: '2px solid #FBCFE8' }}>
          <div className="text-4xl mb-3">💙🌟</div>
          <h3 className="text-xl font-extrabold mb-2" style={{ color: 'var(--text-primary)' }}>Feelings Matter!</h3>
          <p style={{ color: 'var(--text-secondary)' }}>Understanding emotions helps you become kinder and stronger every day.</p>
        </motion.div>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════
   ROUTER
═══════════════════════════════════════════════════════ */
const EmotionWorldPage = () => (
  <Routes>
    <Route index element={<EmotionWorldHome />} />
    <Route path="emotion-checkin"     element={<EmotionCheckIn />} />
    <Route path="emotion-recognition" element={<EmotionRecognition />} />
    <Route path="friendship-stories"  element={<FriendshipStories />} />
    <Route path="*"                   element={<EmotionWorldHome />} />
  </Routes>
);

export default EmotionWorldPage;
