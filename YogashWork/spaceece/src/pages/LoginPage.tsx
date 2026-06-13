import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Lock, LogIn } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { authService } from '../services/firebase/auth.service';
import { useAuthStore } from '../store/authStore';
import { AnimatedButton } from '../components/AnimatedButton';
import { fadeInUp } from '../utils/animations';

interface LoginForm {
  email: string;
  password: string;
}

const LoginPage = () => {
  const navigate = useNavigate();
  const { setUser, setError } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      setIsLoading(true);
      setError(null);
      const user = await authService.login(data.email, data.password);
      setUser(user);
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const user = await authService.loginWithGoogle();
      setUser(user);
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBypassLogin = () => {
    // Create a temporary mock user for testing without Firebase
    const mockUser = {
      id: 'temp-user-123',
      email: 'demo@spaceece.com',
      displayName: 'Demo User',
      role: 'child' as 'child' | 'parent' | 'admin',
      level: 3,
      xp: 450,
      totalScore: 3500,
      cognitiveScore: 850,
      emotionalScore: 920,
      streak: 5,
      lastLoginDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setUser(mockUser);
    navigate('/dashboard');
  };

  const handleBypassAdminLogin = () => {
    // Create a temporary mock admin user for testing
    const mockAdmin = {
      id: 'admin-123',
      email: 'admin@spaceece.com',
      displayName: 'Admin User',
      role: 'admin' as 'child' | 'parent' | 'admin',
      level: 1,
      xp: 0,
      totalScore: 0,
      cognitiveScore: 0,
      emotionalScore: 0,
      streak: 0,
      lastLoginDate: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setUser(mockAdmin);
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-light-cream to-light-orange flex items-center justify-center px-4">
      <motion.div
        variants={fadeInUp}
        initial="initial"
        animate="animate"
        className="w-full max-w-md"
      >
        {/* Logo */}
        <Link to="/" className="flex items-center justify-center space-x-2 mb-8">
          <img 
            src="/logo.png" 
            alt="SpaceECE Logo" 
            className="h-16 w-auto"
          />
        </Link>

        {/* Login Card */}
        <div className="card">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-dark mb-2">Welcome Back!</h1>
            <p className="text-gray-600">Continue your learning journey</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                Email
              </label>
              <div className="relative">
                <Mail
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email address',
                    },
                  })}
                  type="email"
                  className="input-field pl-12"
                  placeholder="your@email.com"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-error">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  type="password"
                  className="input-field pl-12"
                  placeholder="••••••••"
                />
              </div>
              {errors.password && (
                <p className="mt-1 text-sm text-error">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <AnimatedButton
              type="submit"
              disabled={isLoading}
              className="w-full"
              icon={<LogIn size={20} />}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </AnimatedButton>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-600">Or continue with</span>
            </div>
          </div>

          {/* Google Login */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-gray-300 rounded-2xl font-semibold text-dark hover:bg-gray-50 transition-all"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </button>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </div>

          {/* Bypass Login Button - For Development/Testing */}
          <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">
            <button
              onClick={handleBypassLogin}
              className="text-sm text-gray-500 hover:text-primary font-semibold underline transition-colors w-full text-center"
            >
              🚀 Bypass Login (Demo Child)
            </button>
            <button
              onClick={handleBypassAdminLogin}
              className="text-sm text-gray-500 hover:text-primary font-semibold underline transition-colors w-full text-center"
            >
              👨‍💼 Bypass Login (Demo Admin)
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
