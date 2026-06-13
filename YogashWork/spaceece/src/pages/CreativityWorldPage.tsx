import { Routes, Route, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Palette,
  Paintbrush,
  Image,
  BookImage,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { staggerContainer, staggerItem } from '../utils/animations';

const CreativityWorldHome = () => {
  const navigate = useNavigate();

  const activities = [
    {
      id: 'drawing-pad',
      title: 'Drawing Pad',
      description: 'Create your own masterpiece with digital canvas',
      icon: Paintbrush,
      color: '#F2A100',
      creations: 12,
    },
    {
      id: 'coloring-studio',
      title: 'Color Studio',
      description: 'Bring beautiful illustrations to life with colors',
      icon: Palette,
      color: '#F7B733',
      creations: 8,
    },
    {
      id: 'story-creator',
      title: 'Story Creator',
      description: 'Build your own comic stories with drag & drop',
      icon: BookImage,
      color: '#EC4899',
      creations: 5,
    },
    {
      id: 'gallery',
      title: 'My Gallery',
      description: 'View all your creative masterpieces',
      icon: Image,
      color: '#8B5CF6',
      creations: 25,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-light py-8">
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
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary-yellow flex items-center justify-center shadow-float">
              <Palette size={40} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-dark mb-2">
                Creativity World
              </h1>
              <p className="text-gray-600 text-lg">
                Express yourself through art and imagination!
              </p>
            </div>
          </div>
        </motion.div>

        <div>
          <h2 className="text-2xl font-extrabold text-dark mb-6">
            Creative Activities
          </h2>
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
                onClick={() => navigate(`/creativity-world/${activity.id}`)}
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
                    <div className="text-sm text-gray-600">Created</div>
                    <div className="text-2xl font-extrabold text-dark">
                      {activity.creations}
                    </div>
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
          className="mt-8 card bg-gradient-to-br from-orange-100 to-yellow-50 border-2 border-primary/20"
        >
          <div className="flex items-center gap-4">
            <Sparkles className="text-primary" size={40} />
            <div>
              <h3 className="text-xl font-extrabold text-dark mb-2">
                Let Your Imagination Soar!
              </h3>
              <p className="text-gray-700">
                Every masterpiece starts with a single brushstroke. What will you create today?
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const CreativityWorldPage = () => {
  const navigate = useNavigate();
  
  return (
    <Routes>
      <Route index element={<CreativityWorldHome />} />
      <Route
        path="*"
        element={
          <div className="min-h-screen bg-gradient-to-b from-orange-50 to-light py-8">
            <div className="max-w-4xl mx-auto px-4">
              <button
                onClick={() => navigate('/creativity-world')}
                className="flex items-center gap-2 text-gray-600 hover:text-dark mb-6 transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="font-semibold">Back to Creativity World</span>
              </button>
              <div className="card text-center">
                <h2 className="text-3xl font-extrabold text-dark mb-4">
                  Activity Coming Soon
                </h2>
                <p className="text-gray-600 mb-6">
                  This creative activity is under development...
                </p>
                <div className="text-6xl">🎨</div>
              </div>
            </div>
          </div>
        }
      />
    </Routes>
  );
};

export default CreativityWorldPage;
