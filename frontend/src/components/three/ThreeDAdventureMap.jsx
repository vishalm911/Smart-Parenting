import { useRef, useState, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text, Stars } from '@react-three/drei';
import { motion } from 'framer-motion';
import * as THREE from 'three';

/* ─── Floating Island ─── */
function Island({ position, color, label, unlocked, progress, onClick }) {
  const groupRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!groupRef.current) return;
    groupRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime + position[0]) * 0.08;
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={unlocked ? onClick : undefined}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
    >
      {/* Island base */}
      <mesh>
        <cylinderGeometry args={[0.9, 0.7, 0.3, 8]} />
        <meshStandardMaterial color={unlocked ? color : '#888888'} roughness={0.6} />
      </mesh>

      {/* Grass top */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.85, 0.85, 0.1, 8]} />
        <meshStandardMaterial color={unlocked ? '#66BB6A' : '#AAAAAA'} roughness={0.8} />
      </mesh>

      {/* Lock icon for locked zones */}
      {!unlocked && (
        <mesh position={[0, 0.7, 0]}>
          <sphereGeometry args={[0.3, 16, 16]} />
          <meshStandardMaterial color="#9E9E9E" roughness={0.5} />
        </mesh>
      )}

      {/* Glow ring for hovered/unlocked */}
      {unlocked && hovered && (
        <mesh position={[0, -0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.9, 1.1, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Progress ring */}
      {unlocked && progress > 0 && (
        <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.92, 1.0, 32, 1, 0, (progress / 100) * Math.PI * 2]} />
          <meshBasicMaterial color="#FFD700" side={THREE.DoubleSide} />
        </mesh>
      )}

      {/* Label */}
      <Text
        position={[0, 0.7, 0]}
        fontSize={0.22}
        color={unlocked ? '#FFFFFF' : '#CCCCCC'}
        anchorX="center"
        anchorY="middle"
        font={undefined}
      >
        {label}
      </Text>
    </group>
  );
}

/* ─── Path between islands ─── */
function Path({ from, to }) {
  const mid = [(from[0] + to[0]) / 2, Math.max(from[1], to[1]) + 0.3, (from[2] + to[2]) / 2];
  const dir = new THREE.Vector3(to[0] - from[0], to[1] - from[1], to[2] - from[2]);
  const length = dir.length();

  return (
    <mesh position={mid}>
      <cylinderGeometry args={[0.04, 0.04, length, 8]} />
      <meshStandardMaterial color="#FFD700" opacity={0.4} transparent />
    </mesh>
  );
}

/* ─── Floating star decorations ─── */
function FloatingStar({ position }) {
  const ref = useRef();
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y += 0.02;
      ref.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 2 + position[0]) * 0.15;
    }
  });
  return (
    <mesh ref={ref} position={position}>
      <octahedronGeometry args={[0.12]} />
      <meshStandardMaterial color="#FFD700" emissive="#FFD700" emissiveIntensity={0.5} />
    </mesh>
  );
}

/* ─── Main 3D Scene ─── */
const ZONES_3D = [
  { id: 'counting-meadow', label: 'Counting\nMeadow', color: '#66BB6A', position: [-3.5, 0, 0],   xpRequired: 0,   progress: 75 },
  { id: 'number-forest',   label: 'Number\nForest',   color: '#2EC4B6', position: [-1.2, 0.3, 1], xpRequired: 50,  progress: 30 },
  { id: 'toy-town',        label: 'Toy\nTown',        color: '#F5A623', position: [1.2, 0, 0],    xpRequired: 120, progress: 0  },
  { id: 'ocean-depths',    label: 'Ocean\nDepths',    color: '#4FC3F7', position: [3.5, 0.2, 0],  xpRequired: 200, progress: 0  },
  { id: 'sky-castle',      label: 'Sky\nCastle',      color: '#7C4DFF', position: [0, 1.2, -2],   xpRequired: 350, progress: 0  },
  { id: 'space-station',   label: 'Space\nStation',   color: '#FF6B9D', position: [0, 2.5, -4],   xpRequired: 500, progress: 0  },
];

const STAR_POSITIONS = [
  [-2.5, 0.8, 0.5], [-0.3, 0.7, 1.5], [2.2, 0.8, 0.5],
  [3.2, 1.0, -0.5], [0.8, 1.8, -1.5], [-1.5, 1.5, -1],
];

const PATHS = [
  [ZONES_3D[0].position, ZONES_3D[1].position],
  [ZONES_3D[1].position, ZONES_3D[2].position],
  [ZONES_3D[2].position, ZONES_3D[3].position],
  [ZONES_3D[1].position, ZONES_3D[4].position],
  [ZONES_3D[4].position, ZONES_3D[5].position],
];

function MapScene({ playerXp, onZoneClick }) {
  return (
    <>
      <Stars radius={80} depth={30} count={800} factor={3} fade speed={0.5} />
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1.2} color="#FFF8DC" />
      <pointLight position={[-10, 5, -5]} intensity={0.5} color="#A0C4FF" />
      <directionalLight position={[0, 8, 4]} intensity={0.8} />

      {/* Dotted paths */}
      {PATHS.map((p, i) => (
        <Path key={i} from={p[0]} to={p[1]} />
      ))}

      {/* Floating star decorations */}
      {STAR_POSITIONS.map((pos, i) => (
        <FloatingStar key={i} position={pos} />
      ))}

      {/* Zone islands */}
      {ZONES_3D.map((zone) => (
        <Island
          key={zone.id}
          position={zone.position}
          color={zone.color}
          label={zone.label}
          unlocked={playerXp >= zone.xpRequired}
          progress={zone.progress}
          onClick={() => onZoneClick(zone)}
        />
      ))}

      <OrbitControls
        enableZoom={true}
        minDistance={5}
        maxDistance={18}
        maxPolarAngle={Math.PI / 1.8}
        autoRotate
        autoRotateSpeed={0.4}
      />
    </>
  );
}

/* ─── Exported Component ─── */
export default function ThreeDAdventureMap({ playerXp = 85, onZoneClick }) {
  const [tooltip, setTooltip] = useState(null);

  return (
    <div className="w-full">
      {/* Canvas */}
      <div
        className="rounded-3xl overflow-hidden border-2 relative"
        style={{ borderColor: 'var(--border-default)', height: 420 }}
      >
        <Canvas
          camera={{ position: [0, 4, 12], fov: 55 }}
          style={{ background: 'linear-gradient(180deg, #0d0d2b 0%, #1a1a4e 50%, #2d1569 100%)' }}
        >
          <Suspense fallback={null}>
            <MapScene playerXp={playerXp} onZoneClick={(zone) => {
              setTooltip(zone);
              onZoneClick?.(zone);
            }} />
          </Suspense>
        </Canvas>

        {/* Overlay label */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <div className="bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
            🗺️ 3D Adventure Map — Click islands to explore!
          </div>
          <div className="bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">
            ⚡ {playerXp} XP
          </div>
        </div>

        {/* Tooltip */}
        {tooltip && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-xl px-4 py-2 text-center pointer-events-none"
          >
            <p className="font-bold text-sm" style={{ color: '#1A1A1A', fontFamily: 'var(--font-display)' }}>
              {tooltip.label.replace('\n', ' ')}
            </p>
            <p className="text-xs" style={{ color: '#9E9E9E' }}>
              {playerXp >= tooltip.xpRequired ? `Progress: ${tooltip.progress}%` : `🔒 Need ${tooltip.xpRequired} XP`}
            </p>
          </motion.div>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2 mt-3 justify-center">
        {ZONES_3D.map((z) => (
          <div
            key={z.id}
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full"
            style={{
              background: playerXp >= z.xpRequired ? `${z.color}20` : 'var(--bg-accent)',
              color: playerXp >= z.xpRequired ? z.color : 'var(--text-muted)',
              border: `1.5px solid ${playerXp >= z.xpRequired ? z.color : 'var(--border-default)'}`,
            }}
          >
            <div className="w-2 h-2 rounded-full" style={{ background: z.color }} />
            {z.label.replace('\n', ' ')}
            {playerXp < z.xpRequired && ' 🔒'}
          </div>
        ))}
      </div>
    </div>
  );
}
