import { useRef, useState, Suspense, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, RoundedBox, Sphere, Torus, Cone } from '@react-three/drei';
import { motion } from 'framer-motion';
import { saveNumeracyScore, awardProgress } from '../../api/services';

/* ─── Individual 3D Shape ─── */
function Shape3D({ type, color, position, isTarget, isSelected, onSelect }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (!meshRef.current) return;
    meshRef.current.rotation.y += 0.01;
    if (isTarget) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime) * 0.3;
    }
  });

  const material = (
    <meshStandardMaterial
      color={isSelected ? '#4CAF50' : color}
      roughness={0.3}
      metalness={0.2}
      emissive={isTarget ? color : 'black'}
      emissiveIntensity={isTarget ? 0.2 : 0}
    />
  );

  const shapes = {
    cube:     <RoundedBox ref={meshRef} args={[1.4, 1.4, 1.4]} radius={0.1} onClick={onSelect}>{material}</RoundedBox>,
    sphere:   <Sphere    ref={meshRef} args={[0.8, 32, 32]}       onClick={onSelect}>{material}</Sphere>,
    cone:     <Cone      ref={meshRef} args={[0.7, 1.5, 32]}      onClick={onSelect}>{material}</Cone>,
    torus:    <Torus     ref={meshRef} args={[0.6, 0.25, 16, 64]} onClick={onSelect}>{material}</Torus>,
    cylinder: (
      <mesh ref={meshRef} onClick={onSelect}>
        <cylinderGeometry args={[0.6, 0.6, 1.4, 32]} />
        {material}
      </mesh>
    ),
    pyramid: (
      <mesh ref={meshRef} onClick={onSelect}>
        <coneGeometry args={[0.8, 1.5, 4]} />
        {material}
      </mesh>
    ),
  };

  return (
    <group position={position}>
      {shapes[type] || shapes.cube}
    </group>
  );
}

/* ─── Scene with target + options ─── */
function PuzzleScene({ target, options, onSelect, selected }) {
  if (!target) return null;
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.3} />
      <directionalLight position={[0, 5, 5]} intensity={0.8} castShadow />

      {/* Target shape (big, center-top) */}
      <Shape3D
        type={target.type}
        color={target.color}
        position={[0, 1.5, 0]}
        isTarget={true}
        isSelected={false}
        onSelect={() => {}}
      />

      {/* Option shapes in a row */}
      {options.map((opt, i) => {
        const xOffset = (i - (options.length - 1) / 2) * 2.5;
        return (
          <Shape3D
            key={opt.id}
            type={opt.type}
            color={opt.color}
            position={[xOffset, -1.5, 0]}
            isTarget={false}
            isSelected={selected === opt.id}
            onSelect={() => onSelect(opt)}
          />
        );
      })}

      <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
    </>
  );
}

/* ─── 3D PUZZLE GAME ─── */
const SHAPES_DATA = [
  { type: 'cube',     color: '#7C4DFF', name: 'Cube'     },
  { type: 'sphere',   color: '#E91E8C', name: 'Sphere'   },
  { type: 'cone',     color: '#F5A623', name: 'Cone'     },
  { type: 'torus',    color: '#2EC4B6', name: 'Torus'    },
  { type: 'cylinder', color: '#FF6B9D', name: 'Cylinder' },
  { type: 'pyramid',  color: '#66BB6A', name: 'Pyramid'  },
];

function generateRound(roundIdx) {
  const target = SHAPES_DATA[roundIdx % SHAPES_DATA.length];
  const others = SHAPES_DATA.filter((s) => s.type !== target.type)
    .sort(() => Math.random() - 0.5)
    .slice(0, 2);
  const options = [...others, target]
    .sort(() => Math.random() - 0.5)
    .map((s, i) => ({ ...s, id: `${s.type}-${i}` }));
  return { target, options };
}

export default function ThreeDPuzzle({ user, refreshProfile }) {
  const [round, setRound] = useState(0);
  const [score, setScore] = useState(0);
  const [selected, setSelected] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [level, setLevel] = useState(1);
  const [perfectStreak, setPerfectStreak] = useState(0);

  const isComplete = round >= 10;
  const hasSaved = useRef(false);

  // Safely extract target and options only if game is not complete
  const { target, options } = !isComplete ? generateRound(round) : { target: null, options: [] };

  useEffect(() => {
    if (isComplete && user && !hasSaved.current) {
      hasSaved.current = true;
      saveNumeracyScore({
        child_id: user.uid,
        game_id: 'shape-match-3d',
        score: score,
        level: level,
        time_taken: 0
      });
      const starsAwarded = Math.min(3, Math.max(1, Math.floor(score / 80)));
      awardProgress(user.uid, {
        xp: Math.floor(score / 2),
        stars: starsAwarded,
        coins: 10,
        module: 'puzzleWorld'
      }).then(() => {
        if (refreshProfile) refreshProfile();
      });
    }
  }, [isComplete, score, level, user, refreshProfile]);

  const handleSelect = (opt) => {
    if (feedback || isComplete) return;
    setSelected(opt.id);

    if (opt.type === target.type) {
      const points = 25 * level;
      const newScore = score + points;
      setScore(newScore);
      setFeedback('correct');
      const newStreak = perfectStreak + 1;
      setPerfectStreak(newStreak);
      if (newStreak >= 3 && level < 5) {
        setLevel((l) => l + 1);
        setPerfectStreak(0);
      }
    } else {
      setFeedback('wrong');
      setPerfectStreak(0);
    }

    setTimeout(() => {
      setSelected(null);
      setFeedback(null);
      setRound((r) => r + 1);
    }, 1500);
  };

  const resetGame = () => {
    setRound(0);
    setScore(0);
    setSelected(null);
    setFeedback(null);
    setLevel(1);
    setPerfectStreak(0);
    hasSaved.current = false;
  };

  if (isComplete) {
    const starsAwarded = Math.min(3, Math.max(1, Math.floor(score / 80)));
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center min-h-[40vh] text-center px-4 py-8 card"
      >
        <span className="text-7xl mb-4">🧩</span>
        <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
          Challenge Complete!
        </h2>
        <p className="mb-2" style={{ color: 'var(--text-secondary)' }}>
          Final Score: <strong>{score}</strong> points
        </p>
        <p className="mb-6" style={{ color: 'var(--text-secondary)' }}>
          Level Reached: <strong>{level}</strong> | Stars: <strong>{'⭐'.repeat(starsAwarded)}</strong>
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
        </div>
      </motion.div>
    );
  }

  return (
    <div className="w-full">
      {/* Score bar */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold px-3 py-1 rounded-full text-white" style={{ background: 'linear-gradient(135deg, #7C4DFF, #FF6B9D)' }}>
            🏆 {score} pts
          </span>
          <span className="text-sm font-bold px-3 py-1 rounded-full" style={{ background: 'var(--bg-accent)', color: 'var(--text-primary)' }}>
            Lvl {level} {'⭐'.repeat(level)}
          </span>
        </div>
        <div className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>
          🔥 Streak: {perfectStreak}/3 → Level up!
        </div>
      </div>

      {/* Instructions */}
      <div className="text-center mb-3">
        <p className="font-semibold text-sm" style={{ color: 'var(--text-secondary)', fontFamily: 'var(--font-display)' }}>
          Find the matching shape below! (Round {round + 1}/10) 👇
        </p>
      </div>

      {/* Three.js Canvas */}
      <div className="rounded-3xl overflow-hidden border-2 h-[280px] md:h-[380px]" style={{ borderColor: 'var(--border-default)' }}>
        <Canvas camera={{ position: [0, 0, 7], fov: 50 }} style={{ background: 'linear-gradient(135deg, #1a1a3e, #2d1b69)' }}>
          <Suspense fallback={null}>
            <PuzzleScene
              target={target}
              options={options}
              onSelect={handleSelect}
              selected={selected}
            />
          </Suspense>
        </Canvas>
      </div>

      {/* Shape labels */}
      <div className="flex justify-around mt-3 px-4">
        {options.map((opt) => (
          <motion.button
            key={opt.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleSelect(opt)}
            disabled={!!feedback}
            className="flex-1 mx-1 py-2 rounded-2xl text-sm font-bold transition-all"
            style={{
              background: selected === opt.id && feedback === 'correct' ? '#4CAF50'
                : selected === opt.id && feedback === 'wrong' ? '#F44336'
                : 'var(--bg-accent)',
              color: selected === opt.id ? 'white' : 'var(--text-primary)',
              fontFamily: 'var(--font-display)',
            }}
          >
            {opt.name}
          </motion.button>
        ))}
      </div>

      {/* Feedback banner */}
      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 text-center text-lg font-bold"
          style={{ color: feedback === 'correct' ? '#4CAF50' : '#F44336', fontFamily: 'var(--font-display)' }}
        >
          {feedback === 'correct' ? `🎉 Correct! +${25 * level} pts` : `❌ That's a ${target.name}! Try again!`}
        </motion.div>
      )}

      {/* Level progress bar */}
      <div className="mt-4 px-1">
        <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
          <span>Level {level} Progress</span>
          <span>{perfectStreak}/3 perfect answers to level up</span>
        </div>
        <div className="progress-track">
          <motion.div
            className="progress-fill"
            animate={{ width: `${(perfectStreak / 3) * 100}%` }}
            transition={{ duration: 0.5 }}
            style={{ background: 'linear-gradient(90deg, #7C4DFF, #FF6B9D)' }}
          />
        </div>
      </div>
    </div>
  );
}
