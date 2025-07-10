'use client';

import { X, ExternalLink, Sparkles, Database, Globe } from 'lucide-react';

interface SignupPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SignupPopup({ isOpen, onClose }: SignupPopupProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 border border-white/20 rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 bg-gradient-to-r from-blue-700/20 to-blue-900/20 rounded-full mb-4">
            <Sparkles className="w-8 h-8 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Ready for More?
          </h2>
          <p className="text-gray-300 text-sm">
            You've reached the demo limit. Sign up for Bright Data to unlock unlimited access to 60+ powerful data collection tools.
          </p>
        </div>

        {/* Features */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-3 text-sm">
            <div className="p-1.5 bg-blue-500/20 rounded">
              <Database className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-gray-300">60+ specialized scraping tools</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="p-1.5 bg-green-500/20 rounded">
              <Globe className="w-4 h-4 text-green-400" />
            </div>
            <span className="text-gray-300">Global proxy network</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <div className="p-1.5 bg-purple-500/20 rounded">
              <Sparkles className="w-4 h-4 text-purple-400" />
            </div>
            <span className="text-gray-300">Free tier available</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3">
          <a
            href="https://brightdata.com/?hs_signup=1"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-gradient-to-r from-blue-700 to-blue-900 text-white rounded-xl py-3 px-4 font-medium hover:from-blue-800 hover:to-blue-950 transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span>Get Started Free</span>
            <ExternalLink className="w-4 h-4" />
          </a>
          
          <button
            onClick={onClose}
            className="w-full bg-white/10 text-gray-300 rounded-xl py-3 px-4 font-medium hover:bg-white/20 transition-colors"
          >
            Continue Demo Later
          </button>
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="text-xs text-gray-400 text-center">
            No credit card required • Start with free tier
          </p>
        </div>
      </div>
    </div>
  );
}