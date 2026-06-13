import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Brain,
  Palette,
  Heart,
  BookOpen,
  User,
  Menu,
  X,
  LogOut,
  Settings,
} from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/firebase/auth.service';
import { getInitials } from '../utils/helpers';

export const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await authService.logout();
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: Home },
    { path: '/brain-world', label: 'Brain World', icon: Brain },
    { path: '/creativity-world', label: 'Creativity World', icon: Palette },
    { path: '/emotion-world', label: 'Emotion World', icon: Heart },
    { path: '/story-world', label: 'Story World', icon: BookOpen },
  ];

  return (
    <header className="bg-white shadow-soft sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center"
            >
              <img 
                src="/logo.png" 
                alt="SpaceECE Logo" 
                className="h-12 w-auto"
              />
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 rounded-2xl text-dark hover:bg-light-cream transition-colors flex items-center gap-2"
                >
                  <item.icon size={18} />
                  <span className="font-semibold">{item.label}</span>
                </motion.div>
              </Link>
            ))}
          </nav>

          {/* User Menu */}
          {user && (
            <div className="hidden md:flex items-center space-x-4">
              {/* Admin Panel Button - Only show for admin users */}
              {user.role === 'admin' && (
                <Link to="/admin">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary text-white font-semibold hover:bg-primary/90 transition-colors shadow-md"
                  >
                    <Settings size={18} />
                    <span>Admin Panel</span>
                  </motion.button>
                </Link>
              )}
              
              <Link to="/profile">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-3 bg-light-cream px-4 py-2 rounded-2xl"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.displayName}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                      {getInitials(user.displayName)}
                    </div>
                  )}
                  <span className="font-semibold text-dark">{user.displayName}</span>
                </motion.div>
              </Link>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleLogout}
                className="p-2 rounded-xl hover:bg-light-cream transition-colors"
                aria-label="Logout"
              >
                <LogOut size={20} className="text-dark" />
              </motion.button>
            </div>
          )}

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-light-cream transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t border-gray-200 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <motion.div
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-light-cream transition-colors"
                  >
                    <item.icon size={20} />
                    <span className="font-semibold">{item.label}</span>
                  </motion.div>
                </Link>
              ))}
              {user && (
                <>
                  {/* Admin Panel Button in Mobile Menu */}
                  {user.role === 'admin' && (
                    <Link
                      to="/admin"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <motion.div
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-primary text-white font-semibold"
                      >
                        <Settings size={20} />
                        <span>Admin Panel</span>
                      </motion.div>
                    </Link>
                  )}
                  
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <motion.div
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-light-cream transition-colors"
                    >
                      <User size={20} />
                      <span className="font-semibold">Profile</span>
                    </motion.div>
                  </Link>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl hover:bg-light-cream transition-colors text-left"
                  >
                    <LogOut size={20} />
                    <span className="font-semibold">Logout</span>
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
