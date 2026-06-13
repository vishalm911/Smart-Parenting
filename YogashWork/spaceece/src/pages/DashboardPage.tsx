import { motion } from 'framer-motion';
import { Brain, Palette, Heart, BookOpen, Star, Flame, Target, TrendingUp } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { WorldCard } from '../components/WorldCard';
import { getGreeting, getInitials } from '../utils/helpers';
import { staggerContainer, staggerItem } from '../utils/animations';

const DashboardPage = () => {
  const { user } = useAuthStore();

  const worlds = [
    {
      title: 'Brain World',
      description: 'Puzzles, memory games, and logic challenges',
      icon: Brain,
      color: '#3B82F6',
      progress: 45,
      score: 1250,
      path: '/brain-world',
    },
    {
      title: 'Creativity World',
      description: 'Drawing, coloring, and storytelling',
      icon: Palette,
      color: '#F2A100',
      progress: 30,
      score: 890,
      path: '/creativity-world',
    },
    {
      title: 'Emotion World',
      description: 'Learn about feelings and empathy',
      icon: Heart,
      color: '#EF4444',
      progress: 60,
      score: 1580,
      path: '/emotion-world',
    },
    {
      title: 'Story World',
      description: 'Choose your adventure and discover endings',
      icon: BookOpen,
      color: '#8B5CF6',
      progress: 25,
      score: 720,
      path: '/story-world',
    },
  ];

  const stats = [
    { icon: Star, label: 'Total Points', value: '4,440', color: '#F2A100' },
    { icon: Target, label: 'Activities', value: '32', color: '#3B82F6' },
    { icon: Flame, label: 'Day Streak', value: user?.streak || 0, color: '#EF4444' },
    { icon: TrendingUp, label: 'Level', value: user?.level || 1, color: '#22C55E' },
  ];

  const recentAchievements = [
    { id: 1, name: 'Memory Master', icon: '🧠', unlockedAt: '2 days ago' },
    { id: 2, name: 'Creative Artist', icon: '🎨', unlockedAt: '5 days ago' },
    { id: 3, name: 'Kind Heart', icon: '❤️', unlockedAt: '1 week ago' },
  ];

  return (
    <div className="min-h-screen bg-light py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.displayName}
                className="w-20 h-20 rounded-3xl shadow-soft"
              />
            ) : (
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary-yellow flex items-center justify-center shadow-soft">
                <span className="text-3xl font-extrabold text-white">
                  {user && getInitials(user.displayName)}
                </span>
              </div>
            )}
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-dark">
                {getGreeting()}, {user?.displayName}! 👋
              </h1>
              <p className="text-gray-600 text-lg">
                Ready to learn something new today?
              </p>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              variants={staggerItem}
              className="card text-center"
            >
              <div
                className="w-12 h-12 rounded-2xl mb-3 flex items-center justify-center mx-auto"
                style={{ backgroundColor: `${stat.color}20` }}
              >
                <stat.icon size={24} style={{ color: stat.color }} />
              </div>
              <div className="text-3xl font-extrabold text-dark mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-gray-600">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>

        {/* Worlds Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-extrabold text-dark mb-6">Your Worlds</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {worlds.map((world, index) => (
              <motion.div
                key={world.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <WorldCard {...world} />
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-extrabold text-dark mb-6">
            Recent Achievements
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {recentAchievements.map((achievement) => (
              <motion.div
                key={achievement.id}
                whileHover={{ scale: 1.05, y: -5 }}
                className="card text-center"
              >
                <div className="text-5xl mb-3">{achievement.icon}</div>
                <h3 className="text-lg font-bold text-dark mb-1">
                  {achievement.name}
                </h3>
                <p className="text-sm text-gray-600">
                  Unlocked {achievement.unlockedAt}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick Tips */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="card bg-gradient-to-br from-primary/10 to-primary-yellow/10 border-2 border-primary/20"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center flex-shrink-0">
              <Star className="text-white" size={24} />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-dark mb-2">
                Daily Challenge Available!
              </h3>
              <p className="text-gray-700 mb-4">
                Complete today's kindness challenge in Emotion World to continue
                your streak and earn bonus points!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => window.location.href = '/emotion-world'}
                className="btn-primary text-sm"
              >
                Start Challenge
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
