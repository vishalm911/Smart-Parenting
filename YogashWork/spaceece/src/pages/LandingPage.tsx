import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Brain, Palette, Heart, BookOpen, Star, Trophy, Target } from 'lucide-react';
import { AnimatedButton } from '../components/AnimatedButton';
import { fadeInUp, staggerContainer } from '../utils/animations';

const LandingPage = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Brain,
      title: 'Brain World',
      description: 'Boost memory, logic, and problem-solving skills',
      color: '#3B82F6',
    },
    {
      icon: Palette,
      title: 'Creativity World',
      description: 'Express yourself through art and storytelling',
      color: '#F2A100',
    },
    {
      icon: Heart,
      title: 'Emotion World',
      description: 'Learn empathy, kindness, and emotional awareness',
      color: '#EF4444',
    },
    {
      icon: BookOpen,
      title: 'Story World',
      description: 'Make choices and discover unique story endings',
      color: '#8B5CF6',
    },
  ];

  const benefits = [
    { icon: Star, text: 'Age-appropriate activities for kids 5-12' },
    { icon: Trophy, text: 'Earn achievements and unlock rewards' },
    { icon: Target, text: 'Track progress with detailed analytics' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-light-cream to-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-soft sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link to="/">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <img 
                  src="/logo.png" 
                  alt="SpaceECE Logo" 
                  className="h-12 w-auto"
                />
              </motion.div>
            </Link>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              <button
                onClick={() => navigate('/login')}
                className="px-6 py-2 rounded-2xl font-semibold text-dark hover:bg-light-cream transition-colors"
              >
                Login
              </button>
              <AnimatedButton onClick={() => navigate('/register')} size="sm">
                Get Started
              </AnimatedButton>
            </motion.div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="text-center"
        >
          <motion.h1
            variants={fadeInUp}
            className="text-5xl md:text-7xl font-extrabold text-dark mb-6"
          >
            Learn, Create, Feel & Explore
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto"
          >
            Helping children grow through play, creativity, and emotional learning.
          </motion.p>
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <AnimatedButton onClick={() => navigate('/register')} size="lg">
              Start Learning
            </AnimatedButton>
            <AnimatedButton
              onClick={() => navigate('/login')}
              variant="secondary"
              size="lg"
            >
              Explore Worlds
            </AnimatedButton>
          </motion.div>

          {/* Hero Illustration */}
          <motion.div
            variants={fadeInUp}
            className="relative max-w-4xl mx-auto"
          >
            <div className="bg-gradient-to-br from-primary/20 to-primary-yellow/20 rounded-3xl p-12 md:p-20">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl p-6 shadow-soft"
                  >
                    <div
                      className="w-12 h-12 rounded-xl mb-3 flex items-center justify-center mx-auto"
                      style={{ backgroundColor: `${feature.color}20` }}
                    >
                      <feature.icon size={24} style={{ color: feature.color }} />
                    </div>
                    <h3 className="text-sm font-semibold text-dark">
                      {feature.title}
                    </h3>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-extrabold text-dark text-center mb-16"
          >
            Four Worlds of Learning
          </motion.h2>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="card"
                style={{ borderTop: `4px solid ${feature.color}` }}
              >
                <div
                  className="w-16 h-16 rounded-2xl mb-4 flex items-center justify-center"
                  style={{ backgroundColor: `${feature.color}20` }}
                >
                  <feature.icon size={32} style={{ color: feature.color }} />
                </div>
                <h3 className="text-2xl font-extrabold text-dark mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-b from-white to-light-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-extrabold text-dark text-center mb-16"
          >
            Why Parents Love SpaceECE
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit.text}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="card text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 mb-4 flex items-center justify-center mx-auto">
                  <benefit.icon size={32} className="text-primary" />
                </div>
                <p className="text-lg font-semibold text-dark">{benefit.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-primary to-primary-yellow">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
              Ready to Start Learning?
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Join thousands of children on their learning journey today!
            </p>
            <div className="flex justify-center">
              <AnimatedButton
                onClick={() => navigate('/register')}
                variant="secondary"
                size="lg"
              >
                Create Free Account
              </AnimatedButton>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <img 
              src="/logo.png" 
              alt="SpaceECE Logo" 
              className="h-10 w-auto"
            />
          </div>
          <p className="text-gray-400 text-sm">
            © 2026 SpaceECE. Empowering children through play and learning.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
