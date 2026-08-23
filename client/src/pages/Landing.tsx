import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ShieldCheck, Activity, Key } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }
};

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface-dark text-gray-100 flex flex-col font-sans">
      <motion.header 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className="h-20 flex items-center justify-between px-6 sm:px-12 max-w-7xl w-full mx-auto z-10 border-b border-surface-border"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 flex items-center justify-center font-bold text-white bg-primary-600 rounded-md">
            M
          </div>
          <span className="text-xl font-bold text-white tracking-tight">
            MedVault
          </span>
        </div>
        <Link to="/login">
          <Button variant="ghost">Login</Button>
        </Link>
      </motion.header>

      <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden px-4">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="z-10 text-center max-w-3xl mx-auto mt-20 sm:mt-0"
        >
          <motion.h1 variants={itemVariants} className="text-5xl sm:text-7xl font-semibold tracking-tighter mb-6 text-white">
            Your Health Data, <br className="hidden sm:block" />
            Decentralized.
          </motion.h1>
          <motion.p variants={itemVariants} className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed font-light">
            Secure, end-to-end encrypted medical records stored on the Internet Computer. You control who gets access. Integrated seamlessly with ABHA.
          </motion.p>
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link to="/login">
              <Button size="lg" className="w-full sm:w-auto">
                Get Started
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="ghost" size="lg" className="w-full sm:w-auto">
                Learn More
              </Button>
            </a>
          </motion.div>
        </motion.div>

        <motion.div 
          id="how-it-works"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
          className="z-10 mt-32 w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 pb-32"
        >
          <motion.div variants={itemVariants} className="sleek-card p-8 text-center transition-colors">
            <div className="w-12 h-12 rounded-lg bg-surface-hover border border-surface-border text-primary-400 flex items-center justify-center mx-auto mb-6">
              <ShieldCheck size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-3">Military-Grade Encryption</h3>
            <p className="text-sm text-gray-400 leading-relaxed font-light">Every record is encrypted before leaving your device. Stored permanently on decentralized networks.</p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="sleek-card p-8 text-center transition-colors">
            <div className="w-12 h-12 rounded-lg bg-surface-hover border border-surface-border text-accent-400 flex items-center justify-center mx-auto mb-6">
              <Key size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-3">You Hold the Keys</h3>
            <p className="text-sm text-gray-400 leading-relaxed font-light">Grant temporary or permanent access to doctors. Revoke access instantly at any time.</p>
          </motion.div>
          
          <motion.div variants={itemVariants} className="sleek-card p-8 text-center transition-colors">
            <div className="w-12 h-12 rounded-lg bg-surface-hover border border-surface-border text-info-400 flex items-center justify-center mx-auto mb-6">
              <Activity size={24} />
            </div>
            <h3 className="text-lg font-semibold text-white mb-3">ABHA Integration</h3>
            <p className="text-sm text-gray-400 leading-relaxed font-light">Link your Ayushman Bharat Health Account to seamlessly fetch records from the national registry.</p>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
};
