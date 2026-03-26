import React from 'react';
import { ArrowRight, BarChart3, Users, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-primary-light/30 to-white" />
      <div className="absolute inset-0 -z-10 dot-grid opacity-40" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Next Generation Urban Waste Management
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-neutral-dark mb-6 tracking-tight leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-700">
          From Your Bin.<br />
          <span className="text-primary">To A Better City.</span>
        </h1>

        <p className="max-w-2xl mx-auto text-lg md:text-xl text-neutral-gray mb-10 leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-900">
          AI-powered waste segregation that connects your society to real 
          circular-economy outcomes — tracked, verified, and ranked.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-in fade-in slide-in-from-bottom-16 duration-1000">
          <Link to="/register" className="w-full sm:w-auto">
            <button className="w-full bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-xl active:scale-95 flex items-center justify-center gap-2">
              Register Your Society
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
          <Link to="/leaderboard" className="w-full sm:w-auto">
            <button className="w-full border-2 border-primary text-primary hover:bg-primary/5 px-8 py-4 rounded-full font-bold text-lg transition-all active:scale-95">
              View Live Leaderboard
            </button>
          </Link>
        </div>

        {/* Stats Pills */}
        <div className="flex flex-wrap justify-center gap-4 md:gap-8 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
          <div className="flex items-center gap-3 px-6 py-3 bg-white shadow-md rounded-full border border-gray-100">
            <BarChart3 className="w-5 h-5 text-primary" />
            <span className="font-semibold text-neutral-dark">2,400 kg</span>
            <span className="text-neutral-gray text-sm">Diverted Today</span>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 bg-white shadow-md rounded-full border border-gray-100">
            <Users className="w-5 h-5 text-primary" />
            <span className="font-semibold text-neutral-dark">38</span>
            <span className="text-neutral-gray text-sm">Societies Active</span>
          </div>
          <div className="flex items-center gap-3 px-6 py-3 bg-white shadow-md rounded-full border border-gray-100">
            <Building2 className="w-5 h-5 text-primary" />
            <span className="font-semibold text-neutral-dark">12</span>
            <span className="text-neutral-gray text-sm">Partner Orgs</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
