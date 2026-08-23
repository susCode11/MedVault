import React, { useEffect } from 'react';
import { LoginButton } from '../components/auth/LoginButton';
import { LoginWalkthrough } from '../components/auth/LoginWalkthrough';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion, Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }
};

export const Login: React.FC = () => {
  const { isAuthenticated, profile, isProfileLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      if (isProfileLoading) return;

      if (!profile) {
        navigate('/role-select');
      } else {
        navigate(`/${profile.role}/dashboard`);
      }
    }
  }, [isAuthenticated, profile, isProfileLoading, navigate]);

  return (
    <div className="min-h-screen bg-surface-dark flex items-center justify-center p-4 relative overflow-hidden">
      <motion.div 
        className="w-full max-w-4xl z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants} className="text-center mb-10">
          <Link to="/" className="inline-block">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 rounded-lg bg-primary-600 flex items-center justify-center font-bold text-white mx-auto mb-4 text-xl"
            >
              M
            </motion.div>
          </Link>
          <h1 className="text-4xl font-semibold text-white mb-4 tracking-tight">Welcome to MedVault</h1>
          <p className="text-lg text-gray-400 max-w-lg mx-auto font-light">
            Your health records, secured by your unique biometrics.
          </p>
        </motion.div>

        {/* Walkthrough Tutorial */}
        <motion.div variants={itemVariants}>
          <LoginWalkthrough />
        </motion.div>

        <motion.div variants={itemVariants} className="mt-12 flex flex-col items-center">
          <LoginButton />
          
          <div className="text-xs text-gray-500 mt-8 pt-6 border-t border-surface-border w-full max-w-md text-center">
            By logging in, you agree to our <a href="#" className="hover:text-primary-400 transition-colors">Terms of Service</a> and <a href="#" className="hover:text-primary-400 transition-colors">Privacy Policy</a>.
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};
