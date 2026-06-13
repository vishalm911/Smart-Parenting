import { Routes, Route, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Heart,
  Smile,
  Users,
  Lightbulb,
  Gift,
  ArrowLeft,
  TrendingUp,
} from 'lucide-react';
import { staggerContainer, staggerItem } from '../utils/animations';

const EmotionWorldHome = () => {
  const navigate = useNavigate();

  const activities = [
    {
      id: 'emotion-checkin',
      title: 'Emotion Check-In',
      description: 'How are you feeling today?',
      icon: Smile,
      color: '#F59E0B',
      streak: 7,
    },
    {
      id: 'emotion-recognition',
      title: 'Emotion Recognition',
      description: 'Learn to identify different emotions',
      icon: Users,
      color: '#EF4444',
      score: 420,
    },
    {
      id: 'friendship-stories',
      title: 'Friendship Stories',
      description: 'Make caring choices in social situations',
      icon: Heart,
      color: '#EC4899',
      completed: 12,
    },
    {
      id: 'kindness-challenge',
      title: 'Kindness Challenge',
      description: 'Complete daily acts of kindness',
      icon: Gift,
      color: '#8B5CF6',
      streak: 5,
    },
    {
      id: 'decision-making',
      title: 'Decision Making',
      description: 'Practice making thoughtful choices',
      icon: Lightbulb,
      color: '#10B981',
      score: 350,
    },
  ];

  const moodData = [
    { mood: '😊', count: 15 },
    { mood: '😐', count: 3 },
    { mood: '😢', count: 2 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-light py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-pink-500 to-red-500 flex items-center justify-center shadow-float">
              <Heart size={40} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-dark mb-2">
                Emotion World
              </h1>
              <p className="text-gray-600 text-lg">
                Explore feelings, empathy, and kindness!
              </p>
            </div>
          </div>
        </motion.div>

        {/* Mood Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card mb-8 bg-gradient-to-br from-pink-100 to-red-50 border-2 border-pink-200"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-extrabold text-dark">
              Your Mood This Week
            </h3>
            <TrendingUp className="text-pink-600" size={24} />
          </div>
          <div className="flex items-center justify-around">
            {moodData.map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-2">{item.mood}</div>
                <div className="text-2xl font-extrabold text-dark">
                  {item.count}
                </div>
                <div className="text-sm text-gray-600">days</div>
              </div>
            ))}
          </div>
        </motion.div>

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
                onClick={() => navigate(`/emotion-world/${activity.id}`)}
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
                    {activity.streak && (
                      <>
                        <div className="text-sm text-gray-600">Streak</div>
                        <div className="text-2xl font-extrabold text-dark">
                          {activity.streak}🔥
                        </div>
                      </>
                    )}
                    {activity.score && (
                      <>
                        <div className="text-sm text-gray-600">Score</div>
                        <div className="text-2xl font-extrabold text-dark">
                          {activity.score}
                        </div>
                      </>
                    )}
                    {activity.completed && (
                      <>
                        <div className="text-sm text-gray-600">Done</div>
                        <div className="text-2xl font-extrabold text-dark">
                          {activity.completed}
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <h3 className="text-xl font-extrabold text-dark mb-2">
                  {activity.title}
                </h3>
                <p className="text-gray-600">{activity.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 card bg-gradient-to-br from-pink-100 to-purple-50 border-2 border-pink-200"
        >
          <div className="text-center">
            <div className="text-4xl mb-3">💝</div>
            <h3 className="text-xl font-extrabold text-dark mb-2">
              Spread Kindness Every Day
            </h3>
            <p className="text-gray-700">
              Small acts of kindness make the world a better place!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const EmotionWorldPage = () => {
  const navigate = useNavigate();
  
  return (
    <Routes>
      <Route index element={<EmotionWorldHome />} />
      <Route
        path="*"
        element={
          <div className="min-h-screen bg-gradient-to-b from-pink-50 to-light py-8">
            <div className="max-w-4xl mx-auto px-4">
              <button
                onClick={() => navigate('/emotion-world')}
                className="flex items-center gap-2 text-gray-600 hover:text-dark mb-6 transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="font-semibold">Back to Emotion World</span>
              </button>
              <div className="card text-center">
                <h2 className="text-3xl font-extrabold text-dark mb-4">
                  Activity Coming Soon
                </h2>
                <p className="text-gray-600 mb-6">
                  This emotional learning activity is under development...
                </p>
                <div className="text-6xl">❤️</div>
              </div>
            </div>
          </div>
        }
      />
    </Routes>
  );
};

export default EmotionWorldPage;
