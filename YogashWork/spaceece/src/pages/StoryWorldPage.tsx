import { Routes, Route, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen,
  Star,
  Lock,
  CheckCircle,
  ArrowLeft,
  Sparkles,
} from 'lucide-react';
import { staggerContainer, staggerItem } from '../utils/animations';

const StoryWorldHome = () => {
  const navigate = useNavigate();

  const stories = [
    {
      id: 'lost-puppy',
      title: 'The Lost Puppy',
      description: 'Help find a puppy that wandered away from home',
      color: '#F59E0B',
      progress: 100,
      endingsFound: 3,
      totalEndings: 3,
      unlocked: true,
    },
    {
      id: 'magic-garden',
      title: 'The Magic Garden',
      description: 'Discover the secrets of an enchanted garden',
      color: '#10B981',
      progress: 66,
      endingsFound: 2,
      totalEndings: 3,
      unlocked: true,
    },
    {
      id: 'treasure-hunt',
      title: 'Treasure Hunt Adventure',
      description: 'Follow the map to find hidden treasure',
      color: '#3B82F6',
      progress: 33,
      endingsFound: 1,
      totalEndings: 3,
      unlocked: true,
    },
    {
      id: 'space-explorer',
      title: 'Space Explorer',
      description: 'Journey through the stars and meet aliens',
      color: '#8B5CF6',
      progress: 0,
      endingsFound: 0,
      totalEndings: 3,
      unlocked: true,
    },
    {
      id: 'dragon-friend',
      title: 'The Friendly Dragon',
      description: 'Befriend a dragon and go on adventures',
      color: '#EF4444',
      progress: 0,
      endingsFound: 0,
      totalEndings: 3,
      unlocked: false,
    },
  ];

  const stats = [
    { label: 'Stories Read', value: '4', icon: BookOpen },
    { label: 'Endings Found', value: '6/15', icon: Star },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-light py-8">
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
            <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-float">
              <BookOpen size={40} className="text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-extrabold text-dark mb-2">
                Story World
              </h1>
              <p className="text-gray-600 text-lg">
                Choose your path and discover unique endings!
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
              <div className="w-12 h-12 rounded-2xl bg-purple-100 mb-3 flex items-center justify-center mx-auto">
                <stat.icon size={24} className="text-purple-600" />
              </div>
              <div className="text-3xl font-extrabold text-dark mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        <div>
          <h2 className="text-2xl font-extrabold text-dark mb-6">
            Story Adventures
          </h2>
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid md:grid-cols-2 gap-6"
          >
            {stories.map((story) => (
              <motion.div
                key={story.id}
                variants={staggerItem}
                whileHover={story.unlocked ? { y: -8, scale: 1.02 } : {}}
                whileTap={story.unlocked ? { scale: 0.98 } : {}}
                onClick={() => story.unlocked && navigate(`/story-world/${story.id}`)}
                className={`card ${story.unlocked ? 'cursor-pointer' : 'opacity-60'}`}
                style={{ borderTop: `4px solid ${story.color}` }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: `${story.color}20` }}
                  >
                    {story.unlocked ? (
                      <BookOpen size={32} style={{ color: story.color }} />
                    ) : (
                      <Lock size={32} className="text-gray-400" />
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">Endings</div>
                    <div className="text-2xl font-extrabold text-dark">
                      {story.endingsFound}/{story.totalEndings}
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-extrabold text-dark mb-2 flex items-center gap-2">
                  {story.title}
                  {story.progress === 100 && (
                    <CheckCircle size={20} className="text-success" />
                  )}
                </h3>
                <p className="text-gray-600 mb-4">{story.description}</p>

                {/* Progress Bar */}
                {story.unlocked && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Progress</span>
                      <span className="font-semibold text-dark">
                        {story.progress}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: story.color }}
                        initial={{ width: 0 }}
                        animate={{ width: `${story.progress}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                      />
                    </div>
                  </div>
                )}

                {!story.unlocked && (
                  <div className="flex items-center gap-2 text-gray-600 text-sm mt-4">
                    <Lock size={16} />
                    <span>Complete previous stories to unlock</span>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 card bg-gradient-to-br from-purple-100 to-indigo-50 border-2 border-purple-200"
        >
          <div className="flex items-center gap-4">
            <Sparkles className="text-purple-600" size={40} />
            <div>
              <h3 className="text-xl font-extrabold text-dark mb-2">
                Every Choice Matters!
              </h3>
              <p className="text-gray-700">
                Make different choices to discover all the unique story endings.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const StoryWorldPage = () => {
  const navigate = useNavigate();
  
  return (
    <Routes>
      <Route index element={<StoryWorldHome />} />
      <Route
        path="*"
        element={
          <div className="min-h-screen bg-gradient-to-b from-purple-50 to-light py-8">
            <div className="max-w-4xl mx-auto px-4">
              <button
                onClick={() => navigate('/story-world')}
                className="flex items-center gap-2 text-gray-600 hover:text-dark mb-6 transition-colors"
              >
                <ArrowLeft size={20} />
                <span className="font-semibold">Back to Story World</span>
              </button>
              <div className="card text-center">
                <h2 className="text-3xl font-extrabold text-dark mb-4">
                  Story Coming Soon
                </h2>
                <p className="text-gray-600 mb-6">
                  This interactive story is under development...
                </p>
                <div className="text-6xl">📖</div>
              </div>
            </div>
          </div>
        }
      />
    </Routes>
  );
};

export default StoryWorldPage;
