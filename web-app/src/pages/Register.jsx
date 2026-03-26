import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowLeft, Building2, MapPin, User, Mail, Phone, Lock } from 'lucide-react';

const Register = () => {
  const benefits = [
    "AI-powered waste tracking",
    "Compete on city leaderboard",
    "Auto-matched to verified recyclers",
    "Real-time bin inventory"
  ];

  const societyTypes = ["Apartment", "Gated Community", "RWA", "University Hostel"];

  return (
    <div className="min-h-screen bg-white flex flex-col md:flex-row">
      {/* Left Panel - Benefits */}
      <div className="hidden md:flex md:w-[40%] bg-light-green/30 p-12 flex-col justify-center sticky top-0 h-screen">
        <Link 
          to="/" 
          className="absolute top-8 left-8 flex items-center gap-2 text-neutral-gray hover:text-primary transition-colors font-medium"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </Link>

        <div className="max-w-md mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider mb-6">
            Join the Green Revolution 🌿
          </div>
          <h1 className="text-4xl font-bold text-primary-dark mb-8 leading-tight">
            Transform Your Society into an <span className="text-primary underline decoration-primary/20 decoration-4 underline-offset-4">Eco-Hub</span>
          </h1>

          <div className="space-y-6">
            {benefits.map((benefit) => (
              <div key={benefit} className="flex items-start gap-4 animate-in slide-in-from-left duration-500">
                <div className="mt-1 bg-white rounded-full p-1 shadow-sm">
                  <CheckCircle2 className="w-5 h-5 text-primary fill-primary/10" />
                </div>
                <div>
                  <h3 className="font-bold text-neutral-dark">{benefit}</h3>
                  <p className="text-sm text-neutral-gray leading-relaxed">
                    Automated systems to help you maximize your environmental impact.
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 p-6 bg-white/50 backdrop-blur-sm rounded-2xl border border-white shadow-sm italic text-neutral-gray text-sm">
            "Since joining UrbanEco-Link, our society has diverted over 5,000kg of plastic from landfills."
            <br />
            <span className="font-bold text-primary-dark mt-2 block">— Secretary, Skyline Heights</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex-1 p-6 md:p-12 lg:p-20 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <div className="md:hidden flex justify-between items-center mb-8">
             <Link to="/" className="text-primary font-bold">UrbanEco-Link</Link>
             <Link to="/login" className="text-sm font-bold text-primary">Login Instead</Link>
          </div>

          <div className="mb-10">
            <h2 className="text-3xl font-bold text-neutral-dark mb-2">Register Your Society</h2>
            <p className="text-neutral-gray">Let's get your smart waste management system started.</p>
          </div>

          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5 text-xs text-neutral-gray">
                <label className="text-sm font-semibold text-neutral-dark ml-1 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  Society Name
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Greenwood Residency"
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5 text-xs text-neutral-gray">
                <label className="text-sm font-semibold text-neutral-dark ml-1 flex items-center gap-2">
                  <span className="text-primary font-bold text-lg">📁</span>
                  Society Type
                </label>
                <select className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all appearance-none cursor-pointer">
                  {societyTypes.map(type => (
                    <option key={type} value={type.toLowerCase()}>{type}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 text-xs text-neutral-gray">
                <label className="text-sm font-semibold text-neutral-dark ml-1 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  City
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. Bangalore"
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5 text-xs text-neutral-gray">
                <label className="text-sm font-semibold text-neutral-dark ml-1 flex items-center gap-2">
                  <span className="text-primary font-bold">#</span>
                  Pincode
                </label>
                <input 
                  type="text" 
                  placeholder="560102"
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                />
              </div>
            </div>

            <div className="w-full h-px bg-gray-100 my-8" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-1.5 text-xs text-neutral-gray">
                <label className="text-sm font-semibold text-neutral-dark ml-1 flex items-center gap-2">
                  <User className="w-4 h-4 text-primary" />
                  Admin Name
                </label>
                <input 
                  type="text" 
                  placeholder="Contact person"
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5 text-xs text-neutral-gray">
                <label className="text-sm font-semibold text-neutral-dark ml-1 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  Phone Number
                </label>
                <input 
                  type="tel" 
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                />
              </div>

              <div className="md:col-span-2 space-y-1.5 text-xs text-neutral-gray">
                <label className="text-sm font-semibold text-neutral-dark ml-1 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  Email Address
                </label>
                <input 
                  type="email" 
                  placeholder="admin@society.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5 text-xs text-neutral-gray">
                <label className="text-sm font-semibold text-neutral-dark ml-1 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" />
                  Password
                </label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                />
              </div>

              <div className="space-y-1.5 text-xs text-neutral-gray">
                <label className="text-sm font-semibold text-neutral-dark ml-1 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-primary" />
                  Confirm Password
                </label>
                <input 
                  type="password" 
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-gray-100 bg-gray-50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 outline-none transition-all"
                />
              </div>
            </div>

            <div className="pt-6">
              <button className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-full font-bold text-lg transition-all shadow-lg hover:shadow-xl active:scale-95">
                Create Account
              </button>
            </div>

            <p className="text-center text-sm text-neutral-gray mt-6">
              Already registered?{' '}
              <Link to="/login" className="text-primary font-bold hover:underline">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
