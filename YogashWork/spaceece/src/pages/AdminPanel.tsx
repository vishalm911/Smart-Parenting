import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Gamepad2,
  Palette,
  Heart,
  Upload,
  BarChart3,
  Users,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { useAdminStore } from '../store/adminStore';
import { adminService } from '../services/admin.service';
import { fadeInUp, staggerContainer, staggerItem } from '../utils/animations';

const AdminPanel = () => {
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const { stats, setStats, setLoading } = useAdminStore();
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    loadAdminStats();
  }, []);

  const loadAdminStats = async () => {
    try {
      setLoading(true);
      const adminStats = await adminService.getAdminStats();
      setStats(adminStats);
    } catch (error) {
      console.error('Error loading admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  const menuItems = [
    {
      id: 'dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
      path: '/admin',
      color: '#F2A100',
    },
    {
      id: 'games',
      icon: Gamepad2,
      label: 'Cognitive Games',
      path: '/admin/games',
      color: '#3B82F6',
    },
    {
      id: 'activities',
      icon: Palette,
      label: 'Creativity Activities',
      path: '/admin/activities',
      color: '#F2A100',
    },
    {
      id: 'scenarios',
      icon: Heart,
      label: 'Emotion Scenarios',
      path: '/admin/scenarios',
      color: '#EF4444',
    },
    {
      id: 'assets',
      icon: Upload,
      label: 'Asset Uploader',
      path: '/admin/assets',
      color: '#8B5CF6',
    },
    {
      id: 'analytics',
      icon: BarChart3,
      label: 'Analytics',
      path: '/admin/analytics',
      color: '#22C55E',
    },
    {
      id: 'users',
      icon: Users,
      label: 'User Management',
      path: '/admin/users',
      color: '#6B7280',
    },
    {
      id: 'settings',
      icon: Settings,
      label: 'Admin Settings',
      path: '/admin/settings',
      color: '#64748B',
    },
  ];

  const statCards = [
    {
      label: 'Total Users',
      value: stats?.totalUsers || 0,
      icon: Users,
      color: '#3B82F6',
      change: '+12%',
    },
    {
      label: 'Active Children',
      value: stats?.totalChildren || 0,
      icon: Users,
      color: '#F2A100',
      change: '+8%',
    },
    {
      label: 'Total Games',
      value: stats?.totalGames || 0,
      icon: Gamepad2,
      color: '#8B5CF6',
      change: '+3',
    },
    {
      label: 'Avg Cognitive Score',
      value: stats?.avgCognitiveScore || 0,
      icon: BarChart3,
      color: '#22C55E',
      change: '+5%',
    },
    {
      label: 'Avg Emotional Score',
      value: stats?.avgEmotionalScore || 0,
      icon: Heart,
      color: '#EF4444',
      change: '+7%',
    },
    {
      label: 'Active Users (7d)',
      value: stats?.activeUsers || 0,
      icon: Users,
      color: '#6B7280',
      change: '+15%',
    },
  ];

  return (
    <div className="min-h-screen bg-light flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-soft fixed h-full">
        {/* Logo */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="SpaceECE Logo" className="h-10 w-auto" />
            <div>
              <h1 className="text-lg font-extrabold text-dark">Admin Panel</h1>
              <p className="text-xs text-gray-500">SpaceECE</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.id}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setActiveTab(item.id)}
            >
              <item.icon size={20} />
              <span className="font-semibold text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* User Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-yellow flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {user?.displayName?.charAt(0)}
              </span>
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-dark">{user?.displayName}</p>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-error transition-colors w-full px-3 py-2 rounded-xl hover:bg-gray-100"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 ml-64 p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-extrabold text-dark mb-2">Dashboard Overview</h1>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">Monitor and manage SpaceECE platform</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl font-semibold text-white bg-primary hover:bg-primary/90 transition-colors shadow-md"
            >
              <LayoutDashboard size={20} />
              <span>Go to Main Dashboard</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          {statCards.map((stat) => (
            <motion.div
              key={stat.label}
              variants={staggerItem}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: `${stat.color}20` }}
                >
                  <stat.icon size={24} style={{ color: stat.color }} />
                </div>
                <span className="text-xs font-semibold text-success bg-success/10 px-2 py-1 rounded-lg">
                  {stat.change}
                </span>
              </div>
              <h3 className="text-3xl font-extrabold text-dark mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-600">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-extrabold text-dark mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link
              to="/admin/games"
              className="card hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <Gamepad2 className="text-primary mb-3" size={32} />
              <h3 className="text-lg font-bold text-dark mb-1">Add New Game</h3>
              <p className="text-sm text-gray-600">Create cognitive game</p>
            </Link>

            <Link
              to="/admin/scenarios"
              className="card hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <Heart className="text-error mb-3" size={32} />
              <h3 className="text-lg font-bold text-dark mb-1">Add Scenario</h3>
              <p className="text-sm text-gray-600">Create emotion activity</p>
            </Link>

            <Link
              to="/admin/assets"
              className="card hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <Upload className="text-info mb-3" size={32} />
              <h3 className="text-lg font-bold text-dark mb-1">Upload Assets</h3>
              <p className="text-sm text-gray-600">Manage media files</p>
            </Link>

            <Link
              to="/admin/analytics"
              className="card hover:shadow-lg transition-all hover:-translate-y-1"
            >
              <BarChart3 className="text-success mb-3" size={32} />
              <h3 className="text-lg font-bold text-dark mb-1">View Analytics</h3>
              <p className="text-sm text-gray-600">Check performance</p>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h2 className="text-2xl font-extrabold text-dark mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-light-cream rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                <Users size={20} className="text-primary" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-dark">New user registered</p>
                <p className="text-sm text-gray-600">John Doe joined as a parent</p>
              </div>
              <span className="text-xs text-gray-500">2 hours ago</span>
            </div>

            <div className="flex items-center gap-4 p-4 bg-light-cream rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-success/20 flex items-center justify-center">
                <Gamepad2 size={20} className="text-success" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-dark">Game completed</p>
                <p className="text-sm text-gray-600">Memory Match - Level 5</p>
              </div>
              <span className="text-xs text-gray-500">5 hours ago</span>
            </div>

            <div className="flex items-center gap-4 p-4 bg-light-cream rounded-xl">
              <div className="w-10 h-10 rounded-xl bg-error/20 flex items-center justify-center">
                <Heart size={20} className="text-error" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-dark">Emotion check-in</p>
                <p className="text-sm text-gray-600">Child expressed happiness</p>
              </div>
              <span className="text-xs text-gray-500">1 day ago</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
