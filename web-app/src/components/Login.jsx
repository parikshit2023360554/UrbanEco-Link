import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Leaf, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  Building2, 
  HeartHandshake, 
  Factory, 
  Truck, 
  ArrowLeft, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  X 
} from 'lucide-react';
import authService from '../services/authService';

export const Login = () => {
  // 4 Role tabs: 'SOCIETY_INDIVIDUAL', 'NGO', 'FACTORY', 'DELIVERY_PARTNER'
  const [selectedRole, setSelectedRole] = useState('SOCIETY_INDIVIDUAL');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Validation & Error states
  const [inlineError, setInlineError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({ email: '', password: '' });
  const [toast, setToast] = useState(null);

  const navigate = useNavigate();

  const showToastNotification = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const validateForm = () => {
    let isValid = true;
    const errors = { email: '', password: '' };

    if (!email.trim()) {
      errors.email = 'Email address is required.';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      errors.email = 'Please enter a valid email address.';
      isValid = false;
    }

    if (!password) {
      errors.password = 'Password is required.';
      isValid = false;
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setInlineError('');
    
    if (!validateForm()) {
      showToastNotification('warning', 'Please enter your email and password.');
      return;
    }

    try {
      setLoading(true);

      const response = await authService.login({
        email: email.trim(),
        password,
      });

      setLoading(false);

      const returnedRole = response?.user?.role || selectedRole;
      const normalizedRole = returnedRole.toUpperCase();

      showToastNotification('success', 'Login successful! Redirecting to portal...');

      if (response?.token) {
        localStorage.setItem('urbaneco_token', response.token);
        localStorage.setItem('token', response.token);
      }
      if (response?.user) {
        localStorage.setItem('urbaneco_user', JSON.stringify(response.user));
      }

      // Role-based redirection logic
      setTimeout(() => {
        if (normalizedRole === 'NGO') {
          navigate('/org-portal');
        } else if (normalizedRole === 'FACTORY') {
          navigate('/dashboard/factory');
        } else if (normalizedRole === 'DELIVERY_PARTNER') {
          navigate('/dashboard/delivery');
        } else {
          navigate('/dashboard/society');
        }
      }, 800);

    } catch (err) {
      setLoading(false);
      const errorMessage = err?.response?.data?.error || err.message || 'Invalid credentials or server error. Please try again.';
      setInlineError(errorMessage);
      showToastNotification('error', errorMessage);
    }
  };

  const roleTabs = [
    {
      id: 'SOCIETY_INDIVIDUAL',
      label: 'Society / Individual',
      icon: Building2,
      description: 'Residents, RWAs & Bulk Waste Generators',
    },
    {
      id: 'NGO',
      label: 'NGO / Civic Partner',
      icon: HeartHandshake,
      description: 'NGOs, Volunteers & Civic Impact Partners',
    },
    {
      id: 'FACTORY',
      label: 'Factory',
      icon: Factory,
      description: 'Recyclers & Processing Facilities',
    },
    {
      id: 'DELIVERY_PARTNER',
      label: 'Delivery Partner',
      icon: Truck,
      description: 'Drivers & Fleet Logistics Operators',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 relative flex flex-col justify-center items-center p-4 sm:p-6 lg:p-8 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div 
          className={`fixed top-5 right-5 z-50 max-w-md w-full p-4 rounded-2xl shadow-2xl border flex items-center justify-between gap-3 transition-all transform animate-in slide-in-from-top-5 duration-300 ${
            toast.type === 'success' 
              ? 'bg-emerald-900 border-emerald-700 text-emerald-100' 
              : toast.type === 'warning'
              ? 'bg-amber-900 border-amber-700 text-amber-100'
              : 'bg-rose-900 border-rose-700 text-rose-100'
          }`}
        >
          <div className="flex items-start gap-3">
            {toast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {toast.type === 'warning' && <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
            <p className="text-sm font-medium leading-snug">{toast.message}</p>
          </div>
          <button 
            type="button" 
            onClick={() => setToast(null)}
            className="text-slate-300 hover:text-white p-1 rounded-lg hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header & Home Link */}
      <div className="w-full max-w-lg flex items-center justify-between mb-6">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Link>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-3 py-1.5 rounded-full border border-emerald-200">
          <span>SWM Rules 2026</span>
        </div>
      </div>

      {/* Main Login Card */}
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-10 relative overflow-hidden">
        {/* Top Decorative Gradient Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600" />

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-3 ring-8 ring-emerald-50">
            <Leaf className="w-8 h-8 text-emerald-600 fill-emerald-600/20" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">UrbanEco Link</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Multi-Role Portal Access</p>
        </div>

        {/* 4 Role Selector Tabs */}
        <div className="mb-6">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
            Select Role to Access
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
            {roleTabs.map((tab) => {
              const IconComponent = tab.icon;
              const isSelected = selectedRole === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    setSelectedRole(tab.id);
                    setInlineError('');
                  }}
                  className={`flex flex-col items-center justify-center py-2.5 px-1.5 rounded-xl transition-all duration-200 text-center ${
                    isSelected
                      ? 'bg-white text-emerald-600 shadow-md font-bold ring-1 ring-slate-200'
                      : 'text-slate-500 hover:text-slate-800 font-medium hover:bg-white/50'
                  }`}
                >
                  <IconComponent className={`w-4 h-4 mb-1 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className="text-[11px] leading-tight font-semibold">{tab.label}</span>
                </button>
              );
            })}
          </div>
          <p className="text-xs text-center text-slate-400 mt-2 font-medium">
            {roleTabs.find(t => t.id === selectedRole)?.description}
          </p>
        </div>

        {/* Inline Error Alert */}
        {inlineError && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-bold text-rose-900">Authentication Error</p>
              <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">{inlineError}</p>
            </div>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLoginSubmit} className="space-y-5" noValidate>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-5 h-5" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (fieldErrors.email) setFieldErrors({ ...fieldErrors, email: '' });
                }}
                placeholder="user@urbaneco.com"
                className={`w-full pl-11 pr-4 py-3 rounded-2xl border text-slate-900 text-sm focus:outline-none transition-all ${
                  fieldErrors.email
                    ? 'border-rose-400 bg-rose-50/30'
                    : 'border-slate-200 bg-slate-50/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white'
                }`}
              />
            </div>
            {fieldErrors.email && (
              <p className="text-xs font-semibold text-rose-600 mt-1.5 ml-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-5 h-5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) setFieldErrors({ ...fieldErrors, password: '' });
                }}
                placeholder="••••••••"
                className={`w-full pl-11 pr-11 py-3 rounded-2xl border text-slate-900 text-sm focus:outline-none transition-all ${
                  fieldErrors.password
                    ? 'border-rose-400 bg-rose-50/30'
                    : 'border-slate-200 bg-slate-50/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 focus:bg-white'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {fieldErrors.password && (
              <p className="text-xs font-semibold text-rose-600 mt-1.5 ml-1 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {fieldErrors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white py-3.5 px-4 rounded-2xl font-bold text-base transition-all shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-6"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <span>Sign In to Dashboard</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500 font-medium">
            Don't have an account?{' '}
            <Link to="/register" className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline">
              Create an Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
