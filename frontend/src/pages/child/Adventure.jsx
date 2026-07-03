/**
 * Adventure.jsx - Explore Adventure Island Map
 *
 * Implements the responsive kid-friendly learning zones explorer map:
 * - Visually plots zones (Literacy, Math, Emotions, Brain, Creativity) on an SVG/HTML5 Island map
 * - Limits zone accessibility based on the child's active XP level
 * - Redirects children to corresponding learning worlds (MathWorld, reading-world, etc.) upon unlock
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../../context/UserContext';
import FloatingElements from '../../components/animations/FloatingElements';
import { getTranslation } from '../../utils/translations';
import '../cognitive-sel/BrainWorldPage.css';

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
  const currentLang = profile?.language || localStorage.getItem('spaceece_language') || 'English';

  return (
    <div className="relative min-h-screen pb-12">
      {/* Inject custom styled animations */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes travel-dash {
          to {
            stroke-dashoffset: -20;
          }
        }
        .animated-track {
          animation: travel-dash 1.2s linear infinite;
        }
        @keyframes float-gentle {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-5px) rotate(1.5deg); }
        }
        .sailing-ship {
          animation: float-gentle 6s ease-in-out infinite;
        }
        @keyframes cloud-drift-slow {
          0% { transform: translateX(-150px); opacity: 0; }
          5% { opacity: 0.45; }
          95% { opacity: 0.45; }
          100% { transform: translateX(1050px); opacity: 0; }
        }
        .cloud-drift-1 {
          animation: cloud-drift-slow 35s linear infinite;
        }
        .cloud-drift-2 {
          animation: cloud-drift-slow 48s linear infinite;
          animation-delay: -18s;
        }
      `}} />

      <FloatingElements count={4} />

      {/* Level / XP Bar at top */}
      <div
        className="sticky top-0 z-20 px-6 py-3.5 border-b flex items-center justify-between gap-4 backdrop-blur-md bg-white/80 dark:bg-[#1E2A3A]/80 shadow-sm"
        style={{ borderColor: 'var(--border-default)' }}
      >
        <div className="flex items-center gap-2 bg-gradient-to-r from-violet-600 to-indigo-600 text-white px-3.5 py-1.5 rounded-full shadow-md">
          <span className="text-base animate-bounce">👑</span>
          <span className="font-black text-sm tracking-wide" style={{ fontFamily: 'var(--font-display)' }}>
            {getTranslation('Level', currentLang)} {profile?.level ?? 2}
          </span>
        </div>
        
        <div className="flex-1 max-w-xs relative flex items-center">
          <div className="w-full bg-slate-100 dark:bg-slate-800/80 rounded-full border border-slate-200/50 dark:border-slate-700/50 p-0.5" style={{ height: 16 }}>
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${Math.min((playerXp / 500) * 100, 100)}%`,
                background: 'linear-gradient(90deg, #7C4DFF, #E91E8C, #FF6B9D)',
                boxShadow: '0 0 10px rgba(124, 77, 255, 0.4)',
              }}
            />
          </div>
        </div>
        
        <span className="text-sm font-black text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-950/45 px-3 py-1 rounded-full border border-violet-100 dark:border-violet-900/50">
          {playerXp} / 500 {getTranslation('XP', currentLang)}
        </span>
      </div>

      {/* ─── Adventure Island Map ─── */}
      <div className="relative z-10 mx-auto px-6 py-6 animate-scale-in" style={{ width: '92%', maxWidth: '1440px' }}>
        {/* Map background container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-3xl overflow-hidden mb-8"
          style={{
            background: 'radial-gradient(circle at 50% 50%, #4ea8de 0%, #0077b6 55%, #023e8a 85%, #03045e 100%)',
            minHeight: 600,
            border: '6px solid #FFD166',
            boxShadow: '0 20px 50px rgba(3, 4, 94, 0.35), inset 0 0 120px rgba(0, 0, 0, 0.4)',
          }}
        >
          {/* Subtle grid pattern overlay */}
          <div className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(circle, white 8%, transparent 9%)',
              backgroundSize: '24px 24px'
            }}
          />

          {/* Title banner */}
          <div
            className="relative z-10 text-center py-3.5 border-b border-white/10 flex items-center justify-center gap-3"
            style={{ background: 'linear-gradient(90deg, rgba(10, 25, 50, 0.8) 0%, rgba(20, 15, 40, 0.8) 100%)', backdropFilter: 'blur(8px)' }}
          >
            <span className="text-2xl animate-pulse">🏝️</span>
            <h2
              className="text-2xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-yellow-400 drop-shadow-lg"
              style={{ fontFamily: 'var(--font-display)', textShadow: '0 0 10px rgba(253, 224, 71, 0.2)' }}
            >
              {getTranslation('ADVENTURE ISLAND', currentLang)}
            </h2>
            <span className="text-2xl animate-pulse">🏝️</span>
          </div>

          {/* Decorative Elements */}
          {/* Compass Rose */}
          <div className="absolute pointer-events-none select-none animate-[float-gentle_8s_ease-in-out_infinite]" style={{ bottom: '20px', right: '20px', width: 75, height: 75, zIndex: 2, opacity: 0.7 }}>
            <svg viewBox="0 0 100 100" className="w-full h-full animate-[spin_120s_linear_infinite]">
              <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="3 4" />
              <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="0.8" />
              <path d="M 50,8 L 53,42 L 88,42 L 58,49 L 50,92 L 47,49 L 12,42 L 47,42 Z" fill="white" opacity="0.3" />
              <path d="M 50,8 L 50,50 L 53,42 Z M 88,42 L 50,50 L 58,49 Z M 50,92 L 50,50 L 47,49 Z M 12,42 L 50,50 L 47,42 Z" fill="rgba(255, 255, 255, 0.85)" />
              <path d="M 50,8 L 50,50 L 47,42 Z M 88,42 L 50,50 L 58,49 Z" fill="#FFD166" opacity="0.9" />
              <text x="47" y="16" fill="white" fontSize="10" fontWeight="bold">N</text>
              <text x="47" y="91" fill="white" fontSize="10" fontWeight="bold">S</text>
              <text x="86" y="54" fill="white" fontSize="10" fontWeight="bold">E</text>
              <text x="6" y="54" fill="white" fontSize="10" fontWeight="bold">W</text>
            </svg>
          </div>

          {/* Clouds */}
          <svg className="absolute pointer-events-none cloud-drift-1 opacity-50" style={{ top: '12%', left: '0', width: 65, height: 40, zIndex: 2 }} viewBox="0 0 64 64">
            <path d="M50 39.5c0 5.8-4.7 10.5-10.5 10.5H20.5C14.7 50 10 45.3 10 39.5c0-4.6 2.9-8.5 7-10 0.1-5.8 4.8-10.5 10.5-10.5 4.6 0 8.5 2.9 10 7 1.4-1.2 3.3-2 5.5-2 4.7 0 8.5 3.8 8.5 8.5 0 0.7-0.1 1.4-0.3 2 4.1 1.5 7 5.4 7 10z" fill="white" />
          </svg>
          <svg className="absolute pointer-events-none cloud-drift-2 opacity-50" style={{ top: '60%', left: '0', width: 85, height: 50, zIndex: 2 }} viewBox="0 0 64 64">
            <path d="M50 39.5c0 5.8-4.7 10.5-10.5 10.5H20.5C14.7 50 10 45.3 10 39.5c0-4.6 2.9-8.5 7-10 0.1-5.8 4.8-10.5 10.5-10.5 4.6 0 8.5 2.9 10 7 1.4-1.2 3.3-2 5.5-2 4.7 0 8.5 3.8 8.5 8.5 0 0.7-0.1 1.4-0.3 2 4.1 1.5 7 5.4 7 10z" fill="white" />
          </svg>

          {/* Sailing Ship */}
          <div className="absolute pointer-events-none select-none sailing-ship" style={{ top: '38%', left: '60%', width: 55, height: 55, zIndex: 2 }}>
            <svg viewBox="0 0 64 64" className="w-full h-full">
              <path d="M 12,44 L 52,44 L 46,52 L 18,52 Z" fill="#8B5A2B" />
              <path d="M 12,44 L 46,44 L 42,48 L 16,48 Z" fill="#A0522D" />
              <line x1="32" y1="12" x2="32" y2="44" stroke="#5C4033" strokeWidth="2.5" />
              <path d="M 32,15 Q 16,25 32,40 Z" fill="#F4F1DE" />
              <path d="M 32,15 Q 24,25 32,40 Z" fill="#E07A5F" opacity="0.3" />
              <path d="M 33,18 Q 45,28 33,40 Z" fill="#F4F1DE" />
              <path d="M 32,8 L 39,11 L 32,14 Z" fill="#E07A5F" />
              <path d="M 8,53 Q 18,50 28,53 T 48,53 T 56,53" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>

          {/* Map pathway SVG */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none" style={{ zIndex: 1 }}>
            {/* Ambient track glow */}
            <path
              d="M 20,22 C 40,12 60,12 80,22 C 70,40 60,45 50,53 C 60,65 70,72 80,80 C 60,90 40,90 20,80"
              fill="none"
              stroke="white"
              strokeWidth="5"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              opacity="0.12"
            />
            {/* Animated Inner dashed line */}
            <path
              d="M 20,22 C 40,12 60,12 80,22 C 70,40 60,45 50,53 C 60,65 70,72 80,80 C 60,90 40,90 20,80"
              fill="none"
              stroke="#FFD166"
              strokeWidth="3.2"
              strokeDasharray="6 7"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
              className="animated-track"
              style={{ filter: 'drop-shadow(0 0 6px rgba(255, 209, 102, 0.8))' }}
            />
          </svg>

          {/* Zone 3D Platforms on map */}
          <div className="relative w-full h-full" style={{ minHeight: 520, zIndex: 5 }}>
            {ZONES.map((zone, i) => {
              const unlocked = playerXp >= zone.xpRequired;
              const positions = [
                { top: '22%', left: '20%' },
                { top: '22%', left: '80%' },
                { top: '53%', left: '50%' },
                { top: '80%', left: '80%' },
                { top: '80%', left: '20%' },
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
                  whileHover={unlocked ? { scale: 1.08 } : {}}
                  whileTap={unlocked ? { scale: 0.95 } : {}}
                  onClick={() => unlocked && navigate(zone.path)}
                  className="absolute"
                  style={{
                    top: pos.top,
                    left: pos.left,
                    transform: 'translate(-50%,-50%)',
                    cursor: unlocked ? 'pointer' : 'not-allowed'
                  }}
                >
                  <div className="flex flex-col items-center">
                    {/* The 3D Platform Circular Base */}
                    <div 
                      className={`relative w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300`}
                      style={{
                        background: unlocked ? `linear-gradient(135deg, ${zone.color}dd, ${zone.color})` : '#94a3b8',
                        boxShadow: unlocked 
                          ? `0 8px 0 0 ${zone.color}88, 0 16px 20px rgba(0,0,0,0.3), inset 0 4px 0 rgba(255,255,255,0.4)`
                          : '0 8px 0 0 #64748b, 0 12px 15px rgba(0,0,0,0.2), inset 0 4px 0 rgba(255,255,255,0.2)',
                        border: '3px solid rgba(255,255,255,0.25)'
                      }}
                    >
                      {/* Platform Surface Glow for active zone */}
                      {unlocked && (
                        <div className="absolute inset-2 rounded-full bg-white/20 blur-[2px] opacity-75 pointer-events-none" />
                      )}
                      
                      {/* Floating Emoji */}
                      <span className={`text-4xl filter drop-shadow-md select-none ${unlocked ? 'animate-pulse' : 'grayscale opacity-50'}`}>
                        {zone.emoji}
                      </span>

                      {/* Lock overlay */}
                      {!unlocked && (
                        <div className="absolute inset-0 rounded-full bg-black/25 flex items-center justify-center backdrop-blur-[1px]">
                          <span className="text-2xl">🔒</span>
                        </div>
                      )}
                    </div>

                    {/* Platform Pedestal Shadow */}
                    <div className="w-16 h-2.5 bg-black/25 rounded-full blur-[1px] mt-1.5" />

                    {/* Glass Label Card */}
                    <div 
                      className={`mt-3 px-3 py-1.5 rounded-xl border text-center glass-island-card shadow-lg max-w-[130px] min-w-[110px] ${
                        unlocked 
                          ? 'bg-white/95 dark:bg-slate-900/95 border-white/40 dark:border-slate-800' 
                          : 'bg-slate-900/75 border-white/10 text-white/50'
                      }`}
                    >
                      <p className="text-xs font-black tracking-wide truncate" style={{ fontFamily: 'var(--font-display)', color: unlocked ? 'var(--text-primary)' : 'rgba(255,255,255,0.4)' }}>
                        {getTranslation(zone.name, currentLang)}
                      </p>
                      <p className="text-[10px] font-bold mt-0.5">
                        {unlocked ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{zone.done}/{zone.total} {getTranslation('Done', currentLang)}</span>
                        ) : (
                          <span className="text-amber-500 font-black tracking-wide">{zone.xpRequired} {getTranslation('XP', currentLang)}</span>
                        )}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Zone list */}
        <h3 className="font-black text-xl mb-5 flex items-center gap-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          <span>🗺️</span> {getTranslation('Learning Zones Explorer', currentLang)}
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
                whileHover={unlocked ? { x: 8, scale: 1.01, boxShadow: `0 12px 30px ${zone.color}20` } : {}}
                onClick={() => unlocked && navigate(zone.path)}
                className={`card p-4.5 rounded-2xl flex items-center gap-5 transition-all shadow-md border-2 border-transparent ${
                  unlocked 
                    ? 'cursor-pointer bg-white dark:bg-slate-900/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 hover:border-slate-100 dark:hover:border-slate-800' 
                    : 'cursor-not-allowed opacity-60 bg-slate-100/50 dark:bg-slate-950/20'
                }`}
                style={{
                  borderLeft: `8px solid ${zone.color}`
                }}
              >
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-inner transition-transform duration-300 ${
                    unlocked ? 'bg-gradient-to-br ' + zone.gradient : 'bg-slate-300 dark:bg-slate-800 grayscale'
                  }`}
                  style={{ filter: unlocked ? `drop-shadow(0 4px 10px ${zone.color}40)` : 'none' }}
                >
                  {zone.emoji}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <h4 className="font-extrabold text-base" style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                      {getTranslation(zone.name, currentLang)}
                    </h4>
                    {!unlocked && (
                      <span className="text-[10px] font-black text-amber-600 bg-amber-500/10 border border-amber-500/20 rounded-full px-2.5 py-0.5 flex items-center gap-1 shadow-sm">
                        🔒 {getTranslation('Lock', currentLang)} • {zone.xpRequired} {getTranslation('XP required', currentLang)}
                      </span>
                    )}
                    {unlocked && (
                      <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-0.5 shadow-sm">
                        {getTranslation('Active', currentLang)}
                      </span>
                    )}
                  </div>
                  <p className="text-xs mb-3 text-slate-500 dark:text-slate-400 font-medium" style={{ color: 'var(--text-muted)' }}>
                    {getTranslation(zone.description, currentLang)}
                  </p>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex-1 progress-track rounded-full overflow-hidden" style={{ height: 10, background: 'rgba(0,0,0,0.06)' }}>
                      <div
                        className="progress-fill h-full rounded-full transition-all duration-500"
                        style={{
                          width: zone.total > 0 ? `${(zone.done / zone.total) * 100}%` : '0%',
                          background: `linear-gradient(90deg, ${zone.color}, ${zone.color}cc)`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-black text-slate-500 dark:text-slate-400 min-w-[35px] text-right font-display">
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
