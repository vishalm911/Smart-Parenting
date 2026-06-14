import { useRef, useState, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { saveNumeracyScore, awardProgress } from '../../firebase/services';
import ConfettiEffect from '../animations/ConfettiEffect';

const BEAD_RADIUS = 0.45;
const BEAD_HEIGHT = 0.22;
const ROD_SPACING = 1.6;
const MAX_BEADS = 9;

// Colors for rods
const ROD_INFO = [
  { label: 'Hundreds (H)', color: '#7C4DFF', x: -ROD_SPACING, multiplier: 100 },
  { label: 'Tens (T)', color: '#FF9A56', x: 0, multiplier: 10 },
  { label: 'Units (U)', color: '#FF6B9D', x: ROD_SPACING, multiplier: 1 }
];

/* ─── 3D Bead Component ─── */
function AbacusBead({ position, color, onClick, active }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.z = state.clock.elapsedTime * 0.2;
  });

  return (
    <mesh ref={meshRef} position={position} onClick={onClick}>
      <torusGeometry args={[BEAD_RADIUS, 0.12, 16, 32]} />
      <meshStandardMaterial
        color={color}
        roughness={0.2}
        metalness={0.4}
        emissive={active ? color : 'black'}
        emissiveIntensity={active ? 0.15 : 0}
      />
    </mesh>
  );
}

/* ─── Abacus Scene ─── */
function AbacusScene({ values, onBeadClick }) {
  return (
    <>
      <ambientLight intensity={0.7} />
      <pointLight position={[10, 10, 10]} intensity={1.2} />
      <directionalLight position={[0, 8, 4]} intensity={0.9} castShadow />

      {/* Frame border box */}
      <mesh position={[0, 0, -0.1]}>
        <boxGeometry args={[4.8, 3.8, 0.15]} />
        <meshStandardMaterial color="#3E2723" roughness={0.9} />
      </mesh>

      {/* Internal separator beam */}
      <mesh position={[0, 0.4, 0]}>
        <boxGeometry args={[4.6, 0.12, 0.35]} />
        <meshStandardMaterial color="#4E342E" roughness={0.8} />
      </mesh>

      {/* Render 3 Rods and their beads */}
      {ROD_INFO.map((rod, rIdx) => {
        const val = values[rIdx]; // 0 to 9

        return (
          <group key={rod.label} position={[rod.x, 0, 0]}>
            {/* Rod Cylinder */}
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.06, 0.06, 3.4, 16]} />
              <meshStandardMaterial color="#B0BEC5" roughness={0.2} metalness={0.8} />
            </mesh>

            {/* Rod label indicator */}
            <Text position={[0, -1.9, 0.2]} fontSize={0.2} color="#FFFFFF">
              {rod.label[0]}
            </Text>

            {/* Rod value text */}
            <Text position={[0, 2.0, 0.2]} fontSize={0.25} color="#FFD700" fontWeight="bold">
              {val}
            </Text>

            {/* Beads (total 9) */}
            {Array.from({ length: MAX_BEADS }).map((_, bIdx) => {
              // Standard abacus layout: beads active go UP to center or stack from bottom/top.
              // Let's stack active beads in the top half (y > 0.4) and inactive in the bottom half (y < 0.4).
              // Active beads = val. If active, index from top: y ranges downwards from 1.6
              // Inactive beads = 9 - val. Stacks upwards from -1.6
              const isActive = bIdx < val;
              const yPos = isActive
                ? 1.6 - bIdx * (BEAD_HEIGHT + 0.04)
                : -1.6 + (bIdx - val) * (BEAD_HEIGHT + 0.04);

              return (
                <AbacusBead
                  key={bIdx}
                  position={[0, yPos, 0]}
                  color={rod.color}
                  active={isActive}
                  onClick={() => onBeadClick(rIdx, isActive ? bIdx : bIdx + 1)}
                />
              );
            })}
          </group>
        );
      })}

      <OrbitControls enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 2} />
    </>
  );
}

/* ─── Exported Game Component ─── */
export default function ThreeDAbacus({ user, refreshProfile, onBack }) {
  const [values, setValues] = useState([0, 0, 0]); // [Hundreds, Tens, Units]
  const [targetNum, setTargetNum] = useState(0);
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const [level, setLevel] = useState(1);
  const [perfectStreak, setPerfectStreak] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const hasSaved = useRef(false);

  // Generate target number based on level difficulty
  const generateTarget = (lvl) => {
    if (lvl === 1) return Math.floor(Math.random() * 9) + 1; // 1 to 9 (Units only)
    if (lvl === 2) return (Math.floor(Math.random() * 9) + 1) * 10; // Multiples of 10
    if (lvl === 3) return Math.floor(Math.random() * 89) + 10; // 10 to 99 (Tens + Units)
    return Math.floor(Math.random() * 899) + 100; // 100 to 999
  };

  useEffect(() => {
    Promise.resolve().then(() => {
      setTargetNum(generateTarget(level));
      setValues([0, 0, 0]);
    });
  }, [round, level]);

  const handleBeadClick = (rodIdx, clickedIdx) => {
    if (feedback || isComplete) return;

    setValues((prev) => {
      const next = [...prev];
      // Tapping sets value directly to clicked index rank (1-indexed)
      next[rodIdx] = clickedIdx;
      return next;
    });
  };

  const currentSum = values[0] * 100 + values[1] * 10 + values[2];

  const checkAnswer = () => {
    if (feedback || isComplete) return;

    if (currentSum === targetNum) {
      setFeedback('correct');
      const pts = 20 * level;
      setScore((s) => s + pts);
      const newStreak = perfectStreak + 1;
      setPerfectStreak(newStreak);

      if (newStreak >= 3 && level < 4) {
        setLevel((l) => l + 1);
        setPerfectStreak(0);
      }

      setTimeout(() => {
        setFeedback(null);
        if (round + 1 >= 5) {
          setIsComplete(true);
        } else {
          setRound((r) => r + 1);
        }
      }, 1500);
    } else {
      setFeedback('wrong');
      setPerfectStreak(0);
      setTimeout(() => setFeedback(null), 1200);
    }
  };

  useEffect(() => {
    if (isComplete && user && !hasSaved.current) {
      hasSaved.current = true;
      saveNumeracyScore({
        child_id: user.uid,
        game_id: 'abacus-simulation',
        score: score,
        level: level,
        time_taken: 0
      });
      const starsAwarded = Math.min(3, Math.max(1, Math.floor(score / 50)));
      awardProgress(user.uid, {
        xp: Math.floor(score / 2),
        stars: starsAwarded,
        coins: 10,
        module: 'mathWorld'
      }).then(() => {
        if (refreshProfile) refreshProfile();
      });
    }
  }, [isComplete, score, level, user, refreshProfile]);

  const resetGame = () => {
    setRound(0);
    setScore(0);
    setLevel(1);
    setPerfectStreak(0);
    setIsComplete(false);
    setValues([0, 0, 0]);
    hasSaved.current = false;
  };

  if (isComplete) {
    const starsAwarded = Math.min(3, Math.max(1, Math.floor(score / 50)));
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[50vh] text-center px-4 py-8 card max-w-lg mx-auto"
      >
        <ConfettiEffect active={true} />
        <span className="text-7xl mb-4">🧮</span>
        <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          Abacus Master!
        </h2>
        <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>
          Final Score: <strong>{score}</strong> points
        </p>
        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
          Stars Earned: <strong>{'⭐'.repeat(starsAwarded)}</strong>
        </p>
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={resetGame}
            className="btn-orange text-sm px-6 py-2.5"
          >
            Play Again 🔄
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="btn-ghost text-sm px-6 py-2.5"
          >
            Back to Hub
          </motion.button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-4">
      {/* HUD Info */}
      <div className="flex items-center justify-between mb-4">
        <span className="font-bold px-3 py-1 rounded-full text-white text-sm" style={{ background: 'linear-gradient(135deg, #7C4DFF, #FF6B9D)' }}>
          🏆 {score} pts
        </span>
        <span className="font-bold text-sm" style={{ color: 'var(--text-muted)' }}>
          Level {level}/4 · Round {round + 1}/5
        </span>
        <span className="font-bold text-xs" style={{ color: 'var(--text-muted)' }}>
          🔥 Streak: {perfectStreak}/3
        </span>
      </div>

      <div className="card p-6 mb-4 text-center">
        <p className="text-lg font-bold mb-1" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>
          Challenge: Show this number on the abacus!
        </p>
        <p className="text-4xl font-black mb-4" style={{ color: '#FF9A56', fontFamily: 'var(--font-display)' }}>
          {targetNum}
        </p>

        {/* 3D R3F Canvas */}
        <div className="rounded-3xl overflow-hidden border-2 h-[320px]" style={{ borderColor: 'var(--border-default)' }}>
          <Canvas camera={{ position: [0, 0, 5.5], fov: 45 }} style={{ background: '#1e1e24' }}>
            <Suspense fallback={null}>
              <AbacusScene values={values} onBeadClick={handleBeadClick} />
            </Suspense>
          </Canvas>
        </div>

        {/* Current abacus math display */}
        <div className="mt-4 p-3 rounded-2xl bg-black/5 flex justify-center items-center gap-1.5 font-mono text-sm font-bold">
          <span style={{ color: '#7C4DFF' }}>({values[0]} × 100)</span>
          <span>+</span>
          <span style={{ color: '#FF9A56' }}>({values[1]} × 10)</span>
          <span>+</span>
          <span style={{ color: '#FF6B9D' }}>({values[2]} × 1)</span>
          <span>=</span>
          <span className="text-lg font-black text-amber-500">{currentSum}</span>
        </div>

        {/* Submit */}
        <div className="mt-5 flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={checkAnswer}
            disabled={!!feedback}
            className="flex-1 btn-orange font-bold text-base py-3 cursor-pointer"
          >
            Check Answer! 🔔
          </motion.button>
        </div>

        <AnimatePresence>
          {feedback && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-3 text-lg font-bold"
              style={{ color: feedback === 'correct' ? '#4CAF50' : '#F44336', fontFamily: 'var(--font-display)' }}
            >
              {feedback === 'correct' ? `🎉 Perfect! Correct Representation!` : `❌ Not quite! That's ${currentSum}.`}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={onBack}
        className="btn-ghost w-full py-3"
      >
        ← Back to Math World
      </motion.button>
    </div>
  );
}
