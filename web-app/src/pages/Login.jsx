import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Eye, EyeOff, ArrowLeft } from 'lucide-react';

const Login = () => {
  const [activeTab, setActiveTab] = useState('society');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-light-green/20 flex flex-col items-center justify-center p-4">
      <Link 
        to="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-neutral-gray hover:text-primary transition-colors font-medium"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Home
      </Link>

      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-gray-100 p-8 animate-in fade-in zoom-in duration-500">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-3">
            <Leaf className="w-8 h-8 text-primary fill-primary/20" />
          </div>
          <h1 className="text-2xl font-bold text-primary-dark">UrbanEco-Link</h1>
          <p className="text-neutral-gray text-sm mt-1">Welcome Back</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 mb-8">
          <button
            onClick={() => setActiveTab('society')}
            className={`flex-1 pb-3 text-sm font-semibold transition-all relative ${
              activeTab === 'society' ? 'text-primary' : 'text-neutral-gray hover:text-neutral-dark'
            }`}
          >
            Society / RWA
            {activeTab === 'society' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('org')}
            className={`flex-1 pb-3 text-sm font-semibold transition-all relative ${
              activeTab === 'org' ? 'text-primary' : 'text-neutral-gray hover:text-neutral-dark'
            }`}
          >
            Organization
            {activeTab === 'org' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-neutral-dark">
            {activeTab === 'society' ? 'Society Login' : 'Partner Portal'}
          </h2>
          <p className="text-sm text-neutral-gray mt-1">
            Access your {activeTab === 'society' ? 'society' : 'organization'} dashboard
          </p>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={(e) => e.preventDefault()}>
          <div>
            <label className="block text-sm font-medium text-neutral-dark mb-1.5 ml-1">Email Address</label>
            <input 
              type="email" 
              placeholder="name@society.com"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-gray-50/50"
            />
          </div>

          <div className="relative">
            <div className="flex justify-between items-center mb-1.5 ml-1">
              <label className="block text-sm font-medium text-neutral-dark">Password</label>
              <button className="text-xs font-semibold text-primary hover:underline">Forgot Password?</button>
            </div>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-gray-50/50"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-gray hover:text-neutral-dark"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button className="w-full bg-primary hover:bg-primary-dark text-white py-3.5 rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-xl active:scale-95 mt-4">
            Login
          </button>
          
          <Link to="/dashboard" className="block w-full text-center mt-3">
            <button type="button" className="w-full border-2 border-primary/20 hover:border-primary text-primary py-3 rounded-full font-bold transition-all bg-primary/5 hover:bg-primary/10">
              Go to Dashboard (Demo)
            </button>
          </Link>
        </form>

        {/* Divider */}
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-100"></div>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-neutral-gray tracking-wider">or continue with</span>
          </div>
        </div>

        {/* Social Login */}
        <button className="w-full border border-gray-200 hover:bg-gray-50 py-3 rounded-full flex items-center justify-center gap-3 transition-all font-medium text-neutral-dark">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google Account
        </button>

        <p className="text-center text-sm text-neutral-gray mt-8">
          Don't have an account?{' '}
          <Link to="/register" className="text-primary font-bold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
