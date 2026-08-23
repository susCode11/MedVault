import React from 'react';
import { Fingerprint, MonitorSmartphone, MousePointerClick } from 'lucide-react';
import { Card } from '../ui/Card';

export const LoginWalkthrough: React.FC = () => {
  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-scale-in">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-white mb-2">How to Login securely</h2>
        <p className="text-gray-400">Follow these 3 simple steps to access your vault</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Step 1 */}
        <Card className="p-6 text-center border border-primary-500/20 bg-surface-card hover:border-primary-500/50 transition-colors">
          <div className="w-12 h-12 rounded-full bg-primary-500/10 text-primary-400 flex items-center justify-center mx-auto mb-4 relative">
            <MousePointerClick size={24} className="animate-bounce" />
            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-primary-500 text-white text-sm font-bold flex items-center justify-center">
              1
            </div>
          </div>
          <h3 className="text-white font-semibold mb-2">Click the Button</h3>
          <p className="text-sm text-gray-400">
            Click the big blue button below to start the secure login process.
          </p>
        </Card>

        {/* Step 2 */}
        <Card className="p-6 text-center border border-accent-500/20 bg-surface-card hover:border-accent-500/50 transition-colors">
          <div className="w-12 h-12 rounded-full bg-accent-500/10 text-accent-400 flex items-center justify-center mx-auto mb-4 relative">
            <MonitorSmartphone size={24} />
            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent-500 text-white text-sm font-bold flex items-center justify-center">
              2
            </div>
          </div>
          <h3 className="text-white font-semibold mb-2">Secure Window</h3>
          <p className="text-sm text-gray-400">
            A new window will open from Internet Identity. Click <strong>Continue</strong>.
          </p>
        </Card>

        {/* Step 3 */}
        <Card className="p-6 text-center border border-success-500/20 bg-surface-card hover:border-success-500/50 transition-colors relative overflow-hidden group">
          <div className="absolute inset-0 bg-success-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="w-12 h-12 rounded-full bg-success-500/10 text-success-400 flex items-center justify-center mx-auto mb-4 relative z-10">
            <Fingerprint size={24} className="animate-pulse-glow" />
            <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-success-500 text-white text-sm font-bold flex items-center justify-center">
              3
            </div>
          </div>
          <h3 className="text-white font-semibold mb-2 relative z-10">Scan Fingerprint</h3>
          <p className="text-sm text-gray-400 relative z-10">
            When your phone asks, scan your fingerprint to instantly unlock your vault.
          </p>
        </Card>
      </div>
    </div>
  );
};
