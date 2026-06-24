/**
 * Adventure.jsx - Explore Adventure Island Map
 *
 * Implements the responsive kid-friendly learning zones explorer map:
 * - Visually plots zones (Literacy, Math, Emotions, Brain, Creativity) on an SVG/HTML5 Island map
 * - Limits zone accessibility based on the child's active XP level
 * - Redirects children to corresponding learning worlds (MathWorld, reading-world, etc.) upon unlock
 */
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import FloatingElements from '../../components/animations/FloatingElements';

const ZONES = [
  {
    id: 'literacy-land',
    name: 'Literacy Land',
    emoji: '📚',
    description: 'Letters, sounds & reading adventures!',
    color: '#4CAF50',
    gradient: 'from-[#66BB6A] to-[#2EC4B6]',
    done: 2, total: 8,
    path: '/child/reading-world',
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
    path: '/child/emotion-world',
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
    path: '/child/brain-world',
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
    path: '/child/creativity-world',
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
        className="sticky top-0 z-10 px-6 py-3 border-b flex items-center gap-4 backdrop-blur-md bg-white/70 dark:bg-[#1E2A3A]/70"
        style={{ borderColor: 'var(--border-default)' }}
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
      <div className="relative z-10 max-w-5xl mx-auto px-6 py-6 animate-scale-in">
        {/* Map background container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-3xl overflow-hidden mb-6"
          style={{
            background: 'linear-gradient(180deg, #4EA8DE 0%, #48CAE4 40%, #0077B6 80%, #03045E 100%)',
            minHeight: 420,
            border: '4px solid var(--color-primary-light)',
            boxShadow: '0 12px 48px rgba(124, 77, 255, 0.15)',
          }}
        >
          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, white 10%, transparent 11%)',
              backgroundSize: '20px 20px'
            }}
          />

          {/* Title banner */}
          <div
            className="relative z-10 text-center py-3 border-b border-white/10"
            style={{ background: 'rgba(10, 15, 40, 0.65)', backdropFilter: 'blur(8px)' }}
          >
            <h2
              className="text-2xl font-bold text-white tracking-widest drop-shadow-md"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              ★ ADVENTURE ISLAND ★
            </h2>
          </div>

          {/* Map pathway SVG */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ zIndex: 1 }}>
            {/* Winding outer track glow */}
            <path
              d="M 25,20 Q 52.5,12 80,20 T 44,53 T 88,65 T 10,67"
              fill="none"
              stroke="#FFF"
              strokeWidth="4"
              strokeDasharray="6 8"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              opacity="0.25"
            />
            {/* Inner dashed line */}
            <path
              d="M 25,20 Q 52.5,12 80,20 T 44,53 T 88,65 T 10,67"
              fill="none"
              stroke="#F5A623"
              strokeWidth="2"
              strokeDasharray="4 6"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              opacity="0.8"
            />
          </svg>

          {/* Zone bubbles on map */}
          <div className="relative" style={{ minHeight: 380, zIndex: 5 }}>
            {ZONES.map((zone, i) => {
              const unlocked = playerXp >= zone.xpRequired;
              const positions = [
                { top: '20%', left: '25%' },
                { top: '20%', right: '20%' },
                { top: '53%', left: '44%' },
                { top: '65%', right: '12%' },
                { top: '67%', left: '10%' },
              ];
              const pos = positions[i] || { top: '50%', left: '50%' };

              return (
                <motion.div
                  key={zone.id}
                  initial={{ scale: 0 }}
                  animate={{ 
                    scale: 1,
                    y: [0, -6, 0]
                  }}
                  transition={{ 
                    scale: { delay: i * 0.1, type: 'spring', stiffness: 250 },
                    y: {
                      duration: 3 + i * 0.4,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }
                  }}
                  whileHover={unlocked ? { scale: 1.1 } : {}}
                  whileTap={unlocked ? { scale: 0.95 } : {}}
                  onClick={() => unlocked && navigate(zone.path)}
                  className="absolute"
                  style={{ ...pos, transform: 'translate(-50%,-50%)', cursor: unlocked ? 'pointer' : 'not-allowed' }}
                >
                  <div
                    className={`rounded-2xl p-3 text-center min-w-[100px] border transition-all duration-300 relative ${
                      unlocked
                        ? 'bg-white/85 dark:bg-[#1E2A3A]/85 backdrop-blur-md border-white/50 dark:border-white/10 shadow-xl'
                        : 'bg-black/35 backdrop-blur-md border-white/10 shadow-md text-white/50'
                    }`}
                  >
                    {/* Glowing outer shadow if currently active and unlocked */}
                    {unlocked && (
                      <div className="absolute inset-0 rounded-2xl -z-10 animate-pulse-glow"
                        style={{ boxShadow: `0 0 16px ${zone.color}40` }}
                      />
                    )}

                    <div className="text-3xl mb-1 filter drop-shadow-sm">{zone.emoji}</div>
                    <p className="text-xs font-bold" style={{ color: unlocked ? 'var(--text-primary)' : 'rgba(255,255,255,0.45)' }}>{zone.name}</p>
                    <p className="text-[10px] font-semibold" style={{ color: unlocked ? 'var(--text-secondary)' : 'rgba(255,255,255,0.3)' }}>
                      {unlocked ? `${zone.done}/${zone.total}` : `${zone.xpRequired} XP`}
                    </p>

                    {/* Small Lock indicator */}
                    {!unlocked && (
                      <div className="absolute -top-2 -right-2 bg-amber-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] border border-white shadow-md">
                        🔒
                      </div>
                    )}
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
        <div className="space-y-4">
          {ZONES.map((zone, i) => {
            const unlocked = playerXp >= zone.xpRequired;
            return (
              <motion.div
                key={zone.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                whileHover={unlocked ? { x: 6, scale: 1.01, boxShadow: `0 8px 24px ${zone.color}15` } : {}}
                onClick={() => unlocked && navigate(zone.path)}
                className={`card p-4 flex items-center gap-4 transition-all ${
                  unlocked 
                    ? 'cursor-pointer hover:border-transparent' 
                    : 'cursor-not-allowed opacity-60'
                }`}
                style={{
                  borderLeft: `6px solid ${zone.color}`
                }}
              >
                <div
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl bg-gradient-to-br ${zone.gradient} shadow-md`}
                >
                  {zone.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-bold text-sm" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                      {zone.name}
                    </h4>
                    {!unlocked && (
                      <span className="text-[10px] font-bold text-white bg-amber-500 rounded-full px-2.5 py-0.5 flex items-center gap-1 shadow-sm">
                        🔒 {zone.xpRequired} XP
                      </span>
                    )}
                  </div>
                  <p className="text-xs mb-2" style={{ color: 'var(--text-muted)' }}>{zone.description}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 progress-track" style={{ height: 8, background: 'rgba(0,0,0,0.06)' }}>
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
