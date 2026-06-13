import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Trophy,
  Star,
  Flame,
  Calendar,
  TrendingUp,
  Award,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { getInitials, formatDate } from '../utils/helpers';
import { fadeInUp, staggerContainer, staggerItem } from '../utils/animations';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const stats = [
    { icon: Star, label: 'Total Points', value: '4,440', color: '#F2A100' },
    { icon: Trophy, label: 'Achievements', value: '12', color: '#3B82F6' },
    { icon: Flame, label: 'Current Streak', value: `${user?.streak || 0} days`, color: '#EF4444' },
    { icon: TrendingUp, label: 'Level', value: user?.level || 1, color: '#22C55E' },
  ];

  const badges = [
    { id: 1, name: 'Memory Master', icon: '🧠', description: 'Complete 10 memory games' },
    { id: 2, name: 'Creative Artist', icon: '🎨', description: 'Create 5 artworks' },
    { id: 3, name: 'Kind Heart', icon: '❤️', description: 'Complete 7 kindness challenges' },
    { id: 4, name: 'Story Explorer', icon: '📚', description: 'Finish 3 stories' },
    { id: 5, name: 'Problem Solver', icon: '🧩', description: 'Solve 20 puzzles' },
    { id: 6, name: 'Empathy Hero', icon: '🤝', description: 'Complete emotion activities' },
  ];

  const recentActivity = [
    { date: '2 hours ago', activity: 'Completed Memory Match - Level 5', points: 50 },
    { date: 'Yesterday', activity: 'Created a new drawing', points: 30 },
    { date: '2 days ago', activity: 'Finished "The Lost Puppy" story', points: 100 },
    { date: '3 days ago', activity: 'Daily Kindness Challenge completed', points: 25 },
  ];

  return (
    <div className="min-h-screen bg-light py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeInUp}
          initial="initial"
          animate="animate"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-dark mb-6 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-semibold">Back to Dashboard</span>
          </button>

          {/* Profile Header */}
          <div className="card mb-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.displayName}
                  className="w-32 h-32 rounded-3xl shadow-soft"
                />
              ) : (
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-primary to-primary-yellow flex items-center justify-center shadow-soft">
                  <span className="text-5xl font-extrabold text-white">
                    {user && getInitials(user.displayName)}
                  </span>
                </div>
              )}

              <div className="flex-1 text-center md:text-left">
                <h1 className="text-4xl font-extrabold text-dark mb-2">
                  {user?.displayName}
                </h1>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-gray-600 mb-4">
                  <div className="flex items-center gap-2">
                    <User size={18} />
                    <span>{user?.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={18} />
                    <span>Joined {user && formatDate(user.createdAt)}</span>
                  </div>
                </div>

                {/* Level Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-dark">
                      Level {user?.level || 1}
                    </span>
                    <span className="text-gray-600">
                      {user?.xp || 0} / 1000 XP
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-primary to-primary-yellow"
                      initial={{ width: 0 }}
                      animate={{ width: `${((user?.xp || 0) / 1000) * 100}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {stats.map((stat) => (
              <motion.div key={stat.label} variants={staggerItem} className="card text-center">
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

          {/* Badges */}
          <div className="mb-8">
            <h2 className="text-2xl font-extrabold text-dark mb-6 flex items-center gap-2">
              <Award className="text-primary" size={28} />
              Achievements & Badges
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {badges.map((badge, index) => (
                <motion.div
                  key={badge.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="card text-center"
                >
                  <div className="text-5xl mb-3">{badge.icon}</div>
                  <h3 className="text-lg font-extrabold text-dark mb-2">
                    {badge.name}
                  </h3>
                  <p className="text-sm text-gray-600">{badge.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-2xl font-extrabold text-dark mb-6">
              Recent Activity
            </h2>
            <div className="card">
              <div className="space-y-4">
                {recentActivity.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-dark">{item.activity}</p>
                      <p className="text-sm text-gray-600">{item.date}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-extrabold text-primary">
                        +{item.points}
                      </span>
                      <p className="text-xs text-gray-600">points</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;
