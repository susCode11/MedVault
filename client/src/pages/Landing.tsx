import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { ShieldCheck, Activity, Key } from 'lucide-react';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface-dark text-gray-100 flex flex-col font-sans">
      <header className="h-20 flex items-center justify-between px-6 sm:px-12 max-w-7xl w-full mx-auto z-10">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center font-bold text-white shadow-glow">
            M
          </div>
          <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
            MedVault
          </span>
        </div>
        <Link to="/login">
          <Button variant="ghost">Login</Button>
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center relative overflow-hidden px-4">
        <div className="absolute inset-0 bg-gradient-mesh opacity-50 z-0"></div>
        
        <div className="z-10 text-center max-w-3xl mx-auto mt-20 sm:mt-0 animate-slide-up">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6">
            Your Health Data, <br className="hidden sm:block" />
            <span className="gradient-text">Decentralized.</span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Secure, end-to-end encrypted medical records stored on the Internet Computer. You control who gets access. Integrated seamlessly with ABHA.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link to="/login">
              <Button size="lg" className="w-full sm:w-auto shadow-glow">
                Get Started
              </Button>
            </Link>
            <a href="#how-it-works">
              <Button variant="ghost" size="lg" className="w-full sm:w-auto">
                Learn More
              </Button>
            </a>
          </div>
        </div>

        <div id="how-it-works" className="z-10 mt-32 w-full max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 pb-32">
          <div className="glass-card p-8 text-center animate-fade-in" style={{ animationDelay: '0.1s' }}>
            <div className="w-16 h-16 rounded-2xl bg-primary-500/20 text-primary-400 flex items-center justify-center mx-auto mb-6">
              <ShieldCheck size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">Military-Grade Encryption</h3>
            <p className="text-gray-400">Every record is encrypted before leaving your device. Stored permanently on decentralized networks.</p>
          </div>
          <div className="glass-card p-8 text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
            <div className="w-16 h-16 rounded-2xl bg-accent-500/20 text-accent-400 flex items-center justify-center mx-auto mb-6">
              <Key size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">You Hold the Keys</h3>
            <p className="text-gray-400">Grant temporary or permanent access to doctors. Revoke access instantly at any time.</p>
          </div>
          <div className="glass-card p-8 text-center animate-fade-in" style={{ animationDelay: '0.3s' }}>
            <div className="w-16 h-16 rounded-2xl bg-info-500/20 text-info-400 flex items-center justify-center mx-auto mb-6">
              <Activity size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-3">ABHA Integration</h3>
            <p className="text-gray-400">Link your Ayushman Bharat Health Account to seamlessly fetch records from the national registry.</p>
          </div>
        </div>
      </main>
    </div>
  );
};
