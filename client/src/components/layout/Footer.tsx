import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto py-6 flex flex-col items-center justify-center text-sm text-gray-500">
      <div className="flex items-center space-x-2">
        <span>Powered by</span>
        <span className="font-semibold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
          Internet Computer
        </span>
      </div>
      <div className="mt-2 space-x-4">
        <a href="#" className="hover:text-gray-300 transition-colors">Privacy Policy</a>
        <span>&middot;</span>
        <a href="#" className="hover:text-gray-300 transition-colors">Terms of Service</a>
        <span>&middot;</span>
        <a href="#" className="hover:text-gray-300 transition-colors">Help Center</a>
      </div>
    </footer>
  );
};
