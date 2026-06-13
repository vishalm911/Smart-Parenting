import { Routes, Route, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain,
  Grid3x3,
  Sparkles,
  Puzzle,
  MapPin,
  ArrowLeft,
  Trophy,
  Target,
} from 'lucide-react';
import { staggerContainer, staggerItem } from '../utils/animations';

const BrainWorldHome = () => {
  const navigate = useNavigate();

  const activities = [
    {
      id: 'memory-match',
      title: 'Memory Match',
      description: 'Flip cards and find matching pairs',
      icon: Grid3x3,
      color: '#3B82F6',
      level: 5,
      score: 450,
    },
    {
      id: 'sequence-builder',
      title: 'Sequence Builder',
      description: 'Remember and repeat the pattern',
      icon: Sparkles,
      color: '#8B5CF6',
      level: 3,
      score: 320,
    },
    {
      id: 'pattern-finder',
      title: 'Pattern Finder',
      description: 'Find the different item in the grid',
      icon: Puzzle,
      color: '#F59E0B',
      level: 7,
      score: 580,
    },
    {
      id: 'maze-challenge',
      title: 'Maze Challenge',
      description: 'Navigate through the maze',
      icon: MapPin,
      color: '#10B981',
      level: 4,
      score: 290,
    },
  ];

  const stats = [
    { label: 'Total Score', value: '1,640', icon: Trophy },
    { label: 'Accuracy', value: '87%', icon: Target },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-light py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-dark mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-semibold">Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-float">
              <Brain size={40} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-dark mb-2">
                Brain World
              </h1>
              <p className="text-gray-600 text-lg">
                Boost your cognitive skills with fun puzzles!
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-blue-100 mb-3 flex items-center justify-center mx-auto">
                <stat.icon size={24} className="text-blue-600" />
              </div>
              <div className="text-3xl font-extrabold text-dark mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Activities Grid */}
        <div>
          <h2 className="text-2xl font-extrabold text-dark mb-6">Activities</h2>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid md:grid-cols-2 gap-6"
          >
            {activities.map((activity) => (
              <motion.div
                key={activity.id}
                variants={staggerItem}
                whileHover={{ y: -8, scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate(`/brain-world/${activity.id}`)}
                className="card cursor-pointer"
                style={{ borderTop: `4px solid ${activity.color}` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: `${activity.color}20` }}
                  >
                    <activity.icon size={32} style={{ color: activity.color }} />
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Level</div>
                    <div className="text-2xl font-extrabold text-dark">
                      {activity.level}
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-extrabold text-dark mb-2">
                  {activity.title}
                </h3>
                <p className="text-gray-600 mb-4">{activity.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Best Score</span>
                  <span className="text-lg font-bold" style={{ color: activity.color }}>
                    {activity.score} pts
                  </span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Encouragement Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 card bg-gradient-to-br from-blue-100 to-blue-50 border-2 border-blue-200"
        >
          <div className="text-center">
            <div className="text-4xl mb-3">🧠✨</div>
            <h3 className="text-xl font-extrabold text-dark mb-2">
              Keep Your Brain Active!
            </h3>
            <p className="text-gray-700">
              Play daily to improve memory, focus, and problem-solving skills.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const MemoryMatchGame = () => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-light py-8">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => navigate('/brain-world')}
          className="flex items-center gap-2 text-gray-600 hover:text-dark mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="font-semibold">Back to Brain World</span>
        </button>
        
        <div className="card text-center">
          <h2 className="text-3xl font-extrabold text-dark mb-4">Memory Match</h2>
          <p className="text-gray-600 mb-6">Game implementation coming soon...</p>
          <div className="text-6xl">🎮</div>
        </div>
      </div>
    </div>
  );
};

const BrainWorldPage = () => {
  return (
    <Routes>
      <Route index element={<BrainWorldHome />} />
      <Route path="memory-match" element={<MemoryMatchGame />} />
      <Route path="sequence-builder" element={<MemoryMatchGame />} />
      <Route path="pattern-finder" element={<MemoryMatchGame />} />
      <Route path="maze-challenge" element={<MemoryMatchGame />} />
    </Routes>
  );
};

export default BrainWorldPage;
