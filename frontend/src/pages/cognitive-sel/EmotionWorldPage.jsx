import { useState, useCallback } from 'react';
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
   1. EMOTION CHECK-IN
   ============================================================ */
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

  const handleSelect = (mood) => {
    setChosen(mood);
    localStorage.setItem('spaceece_last_mood', mood.emoji);
  };

  return (
    <div className="game-container">
      <button onClick={() => navigate('/child/emotion-world')} className="game-back-btn">
        ← Back to Emotion World
      </button>
      <div className="game-header">
        <h2 className="game-title">😊 Emotion Check-In</h2>
        <p className="game-stat">How are you feeling today?</p>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' }}>
        {MOODS.map(mood => (
          <motion.button key={mood.label} whileHover={{ scale: 1.08 }} whileTap={{ scale: 0.92 }}
            onClick={() => handleSelect(mood)}
            className="flex flex-col items-center gap-2 p-4 rounded-2xl shadow-md"
            style={{ 
              background: chosen?.label === mood.label ? `${mood.color}22` : 'var(--color-bg-elevated)', 
              border: chosen?.label === mood.label ? `3.5px solid ${mood.color}` : '2px solid var(--color-border)' 
            }}
          >
            <span className="text-4xl">{mood.emoji}</span>
            <span className="text-xs font-extrabold" style={{ color: mood.color }}>{mood.label}</span>
          </motion.button>
        ))}
      </div>
      <AnimatePresence>
        {chosen && (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
            className="game-board-card" style={{ borderColor: chosen.color }}>
            <div className="text-5xl mb-2">{chosen.emoji}</div>
            <p className="text-lg font-bold" style={{ color: chosen.color }}>{chosen.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================================================
   2. EMOTION RECOGNITION
   ============================================================ */
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
    if (correct) { 
      setScore(s => s + 20); 
      setShowConfetti(true); 
      setTimeout(() => setShowConfetti(false), 1000); 
    }
    setFeedback(correct ? 'correct' : 'wrong');
    setTimeout(() => {
      setFeedback(null);
      if (round + 1 >= EMOTION_SCENARIOS.length) {
        setDone(true);
        localStorage.setItem('spaceece_emotion_expert_score', `${score + (correct ? 20 : 0)} pts`);
      } else {
        setRound(r => r + 1);
      }
    }, 1100);
  };

  if (done) return (
    <div className="game-container text-center">
      <ConfettiEffect active />
      <div style={{ fontSize: '4.5rem' }}>🏆</div>
      <h2 className="game-title">Emotion Expert!</h2>
      <p style={{ color: 'var(--color-text-secondary)', fontWeight: 800, marginBottom: '24px' }}>
        Score: <strong>{score}</strong> / {EMOTION_SCENARIOS.length * 20}
      </p>
      <div className="flex gap-3 justify-center">
        <button onClick={() => { setRound(0); setScore(0); setDone(false); }} className="btn-orange" style={{ padding: '10px 24px', borderRadius: '999px' }}>Play Again 🔄</button>
        <button onClick={() => navigate('/child/emotion-world')} className="btn-ghost" style={{ padding: '10px 24px', borderRadius: '999px' }}>Back</button>
      </div>
    </div>
  );

  return (
    <div className="game-container">
      <ConfettiEffect active={showConfetti} />
      <button onClick={() => navigate('/child/emotion-world')} className="game-back-btn">
        ← Back to Emotion World
      </button>
      <div className="game-header">
        <h2 className="game-title">👀 Emotion Recognition</h2>
        <p className="game-stat">{round + 1} / {EMOTION_SCENARIOS.length} · Score: {score}</p>
      </div>
      <motion.div key={round} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="game-board-card">
        <motion.div style={{ fontSize: '6rem', margin: '12px 0' }} animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 2, repeat: Infinity }}>
          {q.face}
        </motion.div>
        <p style={{ color: 'var(--color-text-secondary)', fontWeight: 800, fontSize: '1.1rem', marginBottom: '16px' }}>What emotion is this?</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', width: '100%' }}>
          {q.options.map(opt => (
            <motion.button key={opt} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => handle(opt)} disabled={!!feedback}
              className="font-bold text-lg rounded-2xl py-3 shadow-md"
              style={{ 
                background: feedback && opt === q.correct ? '#4CAF50' : feedback && opt !== q.correct ? '#FFCDD2' : 'var(--color-bg-elevated)', 
                border: '2px solid var(--color-border)',
                color: feedback && opt !== q.correct ? '#B71C1C' : 'var(--color-text)', 
                fontFamily: 'var(--font-display)' 
              }}
            >
              {opt}
            </motion.button>
          ))}
        </div>
        {feedback && <p className="mt-3 font-bold" style={{ color: feedback === 'correct' ? '#4CAF50' : '#F44336' }}>{feedback === 'correct' ? '🎉 Correct!' : `❌ It's ${q.correct}!`}</p>}
      </motion.div>
    </div>
  );
}

/* ============================================================
   3. FRIENDSHIP STORIES
   ============================================================ */
const FRIENDSHIP_SCENARIOS = [
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
      { text: 'Apologize and offer to replace it 🙏', correct: true, response: 'Great! Saying sorry and making it right is very kind! 💙' },
      { text: 'Pretend it didn\'t happen 🏃', correct: false, response: 'It\'s better to be honest and apologise. Friends trust each other!' },
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

  const q = FRIENDSHIP_SCENARIOS[round % FRIENDSHIP_SCENARIOS.length];

  const handle = (choice) => {
    if (chosen) return;
    setChosen(choice);
    if (choice.correct) setScore(s => s + 30);
    setTimeout(() => {
      if (round + 1 >= FRIENDSHIP_SCENARIOS.length) {
        setDone(true);
        localStorage.setItem('spaceece_friendship_level', 'Champion ❤️');
      } else {
        setChosen(null);
        setRound(r => r + 1);
      }
    }, 2000);
  };

  if (done) return (
    <div className="game-container text-center">
      <ConfettiEffect active />
      <div style={{ fontSize: '4.5rem' }}>❤️</div>
      <h2 className="game-title">Friendship Champion!</h2>
      <p style={{ color: 'var(--color-text-secondary)', fontWeight: 800, marginBottom: '24px' }}>
        Kindness score: <strong>{score}</strong> / {FRIENDSHIP_SCENARIOS.length * 30}
      </p>
      <div className="flex gap-3 justify-center">
        <button onClick={() => { setRound(0); setScore(0); setChosen(null); setDone(false); }} className="btn-orange" style={{ padding: '10px 24px', borderRadius: '999px' }}>Play Again 🔄</button>
        <button onClick={() => navigate('/child/emotion-world')} className="btn-ghost" style={{ padding: '10px 24px', borderRadius: '999px' }}>Back</button>
      </div>
    </div>
  );

  return (
    <div className="game-container">
      <button onClick={() => navigate('/child/emotion-world')} className="game-back-btn">
        ← Back to Emotion World
      </button>
      <div className="game-header">
        <h2 className="game-title">❤️ Friendship Stories</h2>
        <p className="game-stat">{round + 1} / {FRIENDSHIP_SCENARIOS.length}</p>
      </div>
      <motion.div key={round} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} className="game-board-card">
        <div style={{ fontSize: '4rem', margin: '8px' }}>{q.scene}</div>
        <div className="rounded-2xl p-4 mb-5" style={{ background: 'rgba(236,72,153,0.07)', border: '1.5px solid rgba(236,72,153,0.18)', width: '100%' }}>
          <p className="text-base font-semibold text-center leading-relaxed" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-display)' }}>
            💭 {q.story}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
          {q.choices.map((choice, i) => (
            <motion.button key={i} whileHover={{ scale: chosen ? 1 : 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => handle(choice)} disabled={!!chosen}
              className="font-semibold text-left rounded-2xl p-4 shadow-md"
              style={{ 
                background: chosen === choice ? (choice.correct ? '#4CAF5022' : '#F4433622') : 'var(--color-bg-elevated)', 
                border: chosen === choice ? `2px solid ${choice.correct ? '#4CAF50' : '#F44336'}` : '2px solid var(--color-border)', 
                color: 'var(--color-text)' 
              }}
            >
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

/* ============================================================
   4. KINDNESS CHALLENGE (Previously "Coming Soon" - Now Fully Active!)
   ============================================================ */
function KindnessChallenge() {
  const navigate = useNavigate();
  const [acts, setActs] = useState([
    { id: 1, text: 'Share a snack or treat with someone today 🍎', done: false },
    { id: 2, text: 'Give a warm hug or high-five to a family member 🤗', done: false },
    { id: 3, text: 'Say a big "Thank you" to a parent or teacher 🙏', done: false },
  ]);
  const [showConfetti, setShowConfetti] = useState(false);

  const toggleAct = (id) => {
    const updated = acts.map(a => a.id === id ? { ...a, done: !a.done } : a);
    setActs(updated);
    if (updated.every(a => a.done)) {
      setShowConfetti(true);
      localStorage.setItem('spaceece_kindness_challenge', 'Completed! 🌟');
    }
  };

  return (
    <div className="game-container">
      <ConfettiEffect active={showConfetti} />
      <button onClick={() => navigate('/child/emotion-world')} className="game-back-btn">
        ← Back to Emotion World
      </button>
      <div className="game-header">
        <h2 className="game-title">🎁 Kindness Challenge</h2>
        <p style={{ color: 'var(--color-text-secondary)', fontWeight: 800, marginTop: '4px' }}>
          Complete these acts of kindness to spread joy! ✨
        </p>
      </div>

      <div className="game-board-card" style={{ width: '100%', gap: '16px' }}>
        <div style={{ fontSize: '3.5rem' }}>🌟🎁💖</div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%', textAlign: 'left' }}>
          {acts.map(act => (
            <div 
              key={act.id} 
              onClick={() => toggleAct(act.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '16px',
                borderRadius: '16px',
                border: '2px solid var(--color-border)',
                background: act.done ? '#E8F5E9' : 'var(--color-bg-elevated)',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '1.5rem' }}>{act.done ? '✅' : '⬜'}</span>
              <span style={{ fontWeight: 700, color: act.done ? '#2E7D32' : 'var(--color-text)', fontSize: '0.95rem' }}>{act.text}</span>
            </div>
          ))}
        </div>

        {acts.every(a => a.done) && (
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="mt-2 text-center" style={{ color: '#2E7D32', fontWeight: 900 }}>
            🎉 Hooray! You spread kindness today! You are awesome!
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ============================================================
   5. DECISION MAKING (Previously "Coming Soon" - Now Fully Active!)
   ============================================================ */
const DECISION_SCENARIOS = [
  {
    scenario: 'You want to play with the red truck, but your classmate is using it. What is the best choice?',
    choices: [
      { text: 'Wait for my turn patiently ⌛', correct: true, feedback: 'Excellent! Sharing and taking turns makes playtime fun for everyone!' },
      { text: 'Snatch the toy when they look away 😤', correct: false, feedback: 'Oops, snatching is not nice and could hurt their feelings.' }
    ]
  },
  {
    scenario: 'You find a pencil lying alone on the school hallway floor. What is the best choice?',
    choices: [
      { text: 'Give it to the classroom teacher 👩‍🏫', correct: true, feedback: 'Superb! Returning lost things is the honest and right thing to do!' },
      { text: 'Keep it and hide it in my pencil box 🎒', correct: false, feedback: 'Hmm, the person who lost it might be looking for it.' }
    ]
  }
];

function DecisionMaking() {
  const navigate = useNavigate();
  const [level, setLevel] = useState(0);
  const [choiceChosen, setChoiceChosen] = useState(null);
  const [won, setWon] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const curr = DECISION_SCENARIOS[level];

  const handleChoice = (c) => {
    setChoiceChosen(c);
    if (c.correct) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 1200);
    }
  };

  const nextLevel = () => {
    setChoiceChosen(null);
    if (level + 1 >= DECISION_SCENARIOS.length) {
      setWon(true);
      localStorage.setItem('spaceece_decision_score', 'Cleared! 💡');
    } else {
      setLevel(level + 1);
    }
  };

  return (
    <div className="game-container">
      <ConfettiEffect active={showConfetti} />
      <button onClick={() => navigate('/child/emotion-world')} className="game-back-btn">
        ← Back to Emotion World
      </button>
      <div className="game-header">
        <h2 className="game-title">💡 Decision Making</h2>
        <p className="game-stat">Scenario: <strong>{level + 1}/{DECISION_SCENARIOS.length}</strong></p>
      </div>

      {won ? (
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="game-board-card">
          <div style={{ fontSize: '4rem' }}>💡👑💡</div>
          <h3 className="brain-card-title" style={{ fontSize: '1.5rem' }}>Thoughtful Thinker!</h3>
          <p style={{ color: 'var(--color-text-secondary)', fontWeight: 700 }}>You made great choices in all scenarios!</p>
          <button 
            onClick={() => { setLevel(0); setWon(false); setChoiceChosen(null); }} 
            className="btn-orange" 
            style={{ padding: '10px 24px', borderRadius: '999px', marginTop: '12px' }}
          >
            Play Again 🔄
          </button>
        </motion.div>
      ) : (
        <div className="game-board-card" style={{ width: '100%' }}>
          <div style={{ fontSize: '2.5rem', margin: '4px' }}>🤔</div>
          <p style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--color-text)', lineHeight: 1.4, margin: '8px 0 16px 0' }}>
            {curr.scenario}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            {curr.choices.map((c, i) => (
              <motion.button 
                key={i}
                whileHover={{ scale: choiceChosen ? 1 : 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleChoice(c)}
                disabled={!!choiceChosen}
                className="font-semibold text-left rounded-2xl p-4"
                style={{
                  background: choiceChosen === c ? (c.correct ? '#E8F5E9' : '#FFEBEE') : 'var(--color-bg-elevated)',
                  border: choiceChosen === c ? `2.5px solid ${c.correct ? '#4CAF50' : '#EF5350'}` : '2.5px solid var(--color-border)',
                  color: 'var(--color-text)'
                }}
              >
                {c.text}
              </motion.button>
            ))}
          </div>

          {choiceChosen && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1 }} style={{ width: '100%', marginTop: '12px' }}>
              <div 
                style={{ 
                  padding: '12px', 
                  borderRadius: '12px', 
                  background: choiceChosen.correct ? '#E8F5E9' : '#FFEBEE',
                  color: choiceChosen.correct ? '#2E7D32' : '#C62828',
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  lineHeight: 1.35
                }}
              >
                {choiceChosen.feedback}
              </div>
              {choiceChosen.correct && (
                <button onClick={nextLevel} className="btn-orange" style={{ padding: '8px 20px', fontSize: '0.85rem', fontWeight: 800, borderRadius: '999px', marginTop: '12px' }}>
                  Next Scenario ➡️
                </button>
              )}
              {!choiceChosen.correct && (
                <button onClick={() => setChoiceChosen(null)} className="btn-ghost" style={{ padding: '8px 20px', fontSize: '0.85rem', fontWeight: 800, borderRadius: '999px', marginTop: '12px' }}>
                  Try Again 🔄
                </button>
              )}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}

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
      `Every puzzle you solve makes our brains grow bigger! 🧠✨`,
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
   EMOTION WORLD HOME
   ============================================================ */
const EmotionWorldHome = () => {
  const navigate = useNavigate();
  const { profile } = useUser();
  const currentLang = profile?.language || localStorage.getItem('spaceece_language') || 'English';

  const activities = [
    { id: 'emotion-checkin',      title: 'Emotion Check-In',    description: 'How are you feeling today?',             emoji: '😊', color: '#F59E0B' },
    { id: 'emotion-recognition',  title: 'Emotion Recognition',  description: 'Learn to identify different emotions',   emoji: '👀', color: '#EF4444' },
    { id: 'friendship-stories',   title: 'Friendship Stories',   description: 'Make caring choices in social stories',  emoji: '❤️', color: '#EC4899' },
    { id: 'kindness-challenge',   title: 'Kindness Challenge',   description: 'Complete daily acts of kindness',        emoji: '🎁', color: '#8B5CF6' },
    { id: 'decision-making',      title: 'Decision Making',      description: 'Practice making thoughtful choices',     emoji: '💡', color: '#10B981' },
  ];

  return (
    <div className="brain-world-container">
      <FloatingElements count={3} />
      
      {/* Title Header */}
      <motion.section initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="brain-header">
        <motion.span className="text-6xl inline-block mb-3" animate={{ scale: [1, 1.12, 1] }} transition={{ duration: 3, repeat: Infinity }}>❤️</motion.span>
        <h1 className="brain-title" style={{ background: 'linear-gradient(135deg, #EC4899 0%, #EF4444 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
          {getTranslation('Emotion World', currentLang)}
        </h1>
        <p className="brain-subtitle">{getTranslation('Explore feelings, empathy, decision skills, and kindness! 🌈', currentLang)}</p>
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
                onClick={() => navigate(`/child/emotion-world/${act.id}`)}
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
            style={{ background: 'linear-gradient(135deg, #FFF0F6 0%, #EDE9FE 100%)', borderColor: '#FBCFE8' }}
          >
            <div style={{ fontSize: '2.5rem' }}>💙🌟🤗</div>
            <h3 className="brain-active-title">{getTranslation('Feelings Matter!', currentLang)}</h3>
            <p className="brain-active-desc">{getTranslation('Understanding emotions helps you make great friends and spread kindness. Practice everyday choices to grow stronger!', currentLang)}</p>
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
const EmotionWorldPage = () => (
  <Routes>
    <Route index element={<EmotionWorldHome />} />
    <Route path="emotion-checkin"     element={<EmotionCheckIn />} />
    <Route path="emotion-recognition" element={<EmotionRecognition />} />
    <Route path="friendship-stories"  element={<FriendshipStories />} />
    <Route path="kindness-challenge"  element={<KindnessChallenge />} />
    <Route path="decision-making"      element={<DecisionMaking />} />
    <Route path="*"                   element={<EmotionWorldHome />} />
  </Routes>
);

export default EmotionWorldPage;
