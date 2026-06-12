import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '../context/UserContext';
import FloatingElements from '../components/animations/FloatingElements';

const ZONES = [
  {
    id: 'literacy-land',
    name: 'Literacy Land',
    emoji: '📚',
    description: 'Letters, sounds & reading adventures!',
    color: '#4CAF50',
    gradient: 'from-[#66BB6A] to-[#2EC4B6]',
    done: 2, total: 8,
    path: '/puzzle-world',
    xpRequired: 0,
  },
  {
    id: 'math-mountain',
    name: 'Math Mountain',
    emoji: '🏔️',
    description: 'Numbers, counting & arithmetic!',
    color: '#F5A623',
    gradient: 'from-[#FF9A56] via-[#F5A623] to-[#FFCC02]',
    done: 1, total: 8,
    path: '/math-world',
    xpRequired: 0,
  },
  {
    id: 'emotion-garden',
    name: 'Emotion Garden',
    emoji: '🌸',
    description: 'Understand and express your feelings!',
    color: '#FF6B9D',
    gradient: 'from-[#FF6B9D] to-[#F5A623]',
    done: 0, total: 6,
    path: '/logic-island',
    xpRequired: 50,
  },
  {
    id: 'brain-bay',
    name: 'Brain Bay',
    emoji: '🧩',
    description: 'Logic, puzzles & critical thinking!',
    color: '#7C4DFF',
    gradient: 'from-[#7C4DFF] to-[#FF6B9D]',
    done: 0, total: 6,
    path: '/puzzle-world',
    xpRequired: 120,
  },
  {
    id: 'creative-cove',
    name: 'Creative Cove',
    emoji: '🎨',
    description: 'Art, music & creative expression!',
    color: '#4FC3F7',
    gradient: 'from-[#4FC3F7] to-[#7C4DFF]',
    done: 0, total: 6,
    path: '/number-adventure',
    xpRequired: 200,
  },
];

export default function Adventure() {
  const navigate = useNavigate();
  const { profile } = useUser();
  const playerXp = profile?.xp ?? 180;

  return (
    <div className="relative min-h-screen">
      <FloatingElements count={4} />

      {/* Level / XP Bar at top */}
      <div
        className="sticky top-0 z-10 px-6 py-3 border-b flex items-center gap-4"
        style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
      >
        <span className="font-bold text-sm" style={{ color: '#7C4DFF', fontFamily: 'var(--font-display)' }}>
          Level {profile?.level ?? 2} ⭐
        </span>
        <div className="flex-1 max-w-xs">
          <div className="progress-track" style={{ height: 10 }}>
            <div
              className="progress-fill"
              style={{
                width: `${Math.min((playerXp / 500) * 100, 100)}%`,
                background: 'linear-gradient(90deg, #7C4DFF, #E91E8C)',
              }}
            />
          </div>
        </div>
        <span className="text-sm font-bold" style={{ color: 'var(--text-secondary)' }}>
          {playerXp}/500 XP
        </span>
      </div>

      {/* ─── Adventure Island Map ─── */}
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-6">
        {/* Map background container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-3xl overflow-hidden mb-6"
          style={{
            background: 'linear-gradient(180deg, #87CEEB 0%, #a8e6cf 50%, #68c068 100%)',
            minHeight: 400,
            border: '4px solid #F5A623',
            boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
          }}
        >
          {/* Title banner */}
          <div
            className="relative z-10 text-center py-3"
            style={{ background: 'rgba(10,10,50,0.75)' }}
          >
            <h2
              className="text-2xl font-bold text-white tracking-widest"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              ★ ADVENTURE ISLAND ★
            </h2>
          </div>

          {/* Zone bubbles on map */}
          <div className="relative" style={{ minHeight: 360 }}>
            {ZONES.map((zone, i) => {
              const unlocked = playerXp >= zone.xpRequired;
              const positions = [
                { top: '15%', left: '25%' },
                { top: '15%', right: '20%' },
                { top: '48%', left: '44%' },
                { top: '60%', right: '12%' },
                { top: '62%', left: '10%' },
              ];
              const pos = positions[i] || { top: '50%', left: '50%' };

              return (
                <motion.div
                  key={zone.id}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: i * 0.1, type: 'spring', stiffness: 300 }}
                  whileHover={unlocked ? { scale: 1.1 } : {}}
                  whileTap={unlocked ? { scale: 0.95 } : {}}
                  onClick={() => unlocked && navigate(zone.path)}
                  className="absolute"
                  style={{ ...pos, transform: 'translate(-50%,-50%)', cursor: unlocked ? 'pointer' : 'not-allowed' }}
                >
                  <div
                    className="bg-white rounded-2xl shadow-lg p-3 text-center min-w-[90px]"
                    style={{ opacity: unlocked ? 1 : 0.55 }}
                  >
                    <div className="text-2xl mb-1">{zone.emoji}</div>
                    <p className="text-xs font-bold" style={{ color: '#1A1A1A' }}>{zone.name}</p>
                    <p className="text-[10px] font-semibold" style={{ color: '#9E9E9E' }}>
                      {unlocked ? `${zone.done}/${zone.total}` : `🔒 ${zone.xpRequired} XP`}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Zone list */}
        <h3 className="font-bold text-lg mb-4" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          🗺️ All Zones
        </h3>
        <div className="space-y-3">
          {ZONES.map((zone, i) => {
            const unlocked = playerXp >= zone.xpRequired;
            return (
              <motion.div
                key={zone.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                whileHover={unlocked ? { x: 4 } : {}}
                onClick={() => unlocked && navigate(zone.path)}
                className={`card p-4 flex items-center gap-4 ${unlocked ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl bg-gradient-to-br ${zone.gradient}`}
                >
                  {zone.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                      {zone.name}
                    </h4>
                    {!unlocked && (
                      <span className="text-xs font-bold text-white bg-[#9E9E9E] rounded-full px-2 py-0.5">
                        🔒 {zone.xpRequired} XP
                      </span>
                    )}
                  </div>
                  <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{zone.description}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 progress-track" style={{ height: 6 }}>
                      <div
                        className="progress-fill"
                        style={{
                          width: zone.total > 0 ? `${(zone.done / zone.total) * 100}%` : '0%',
                          background: `linear-gradient(90deg, ${zone.color}, ${zone.color}aa)`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-bold" style={{ color: 'var(--text-muted)' }}>
                      {zone.done}/{zone.total}
                    </span>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
