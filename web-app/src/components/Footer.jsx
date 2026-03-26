import React from 'react';
import { Leaf, Globe, MessageSquare, Send, Share2 } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-6">
              <Leaf className="w-8 h-8 text-primary fill-primary/10" />
              <span className="text-2xl font-bold text-primary-dark tracking-tight">
                UrbanEco-Link
              </span>
            </div>
            <p className="text-neutral-gray max-w-sm mb-8 leading-relaxed">
              Transforming urban waste management through smart automation and 
              circular economy networks. Connecting societies to a cleaner future.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-2 bg-gray-50 rounded-full text-neutral-gray hover:bg-primary/10 hover:text-primary transition-all">
                <Send className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-gray-50 rounded-full text-neutral-gray hover:bg-primary/10 hover:text-primary transition-all">
                <MessageSquare className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-gray-50 rounded-full text-neutral-gray hover:bg-primary/10 hover:text-primary transition-all">
                <Share2 className="w-5 h-5" />
              </a>
              <a href="#" className="p-2 bg-gray-50 rounded-full text-neutral-gray hover:bg-primary/10 hover:text-primary transition-all">
                <Globe className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-neutral-dark mb-6 uppercase tracking-wider text-sm">Platform</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-neutral-gray hover:text-primary transition-colors">How it Works</a></li>
              <li><a href="#" className="text-neutral-gray hover:text-primary transition-colors">Leaderboard</a></li>
              <li><a href="#" className="text-neutral-gray hover:text-primary transition-colors">Impact Tracking</a></li>
              <li><a href="#" className="text-neutral-gray hover:text-primary transition-colors">Partner Network</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-neutral-dark mb-6 uppercase tracking-wider text-sm">Company</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-neutral-gray hover:text-primary transition-colors">About Us</a></li>
              <li><a href="#" className="text-neutral-gray hover:text-primary transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-neutral-gray hover:text-primary transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-neutral-gray hover:text-primary transition-colors">Contact</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-neutral-gray text-sm">
            © 2026 UrbanEco-Link. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-sm font-medium text-primary-dark">
            Made for cleaner cities 🌿
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
