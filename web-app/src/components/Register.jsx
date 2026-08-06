import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Leaf, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  MapPin, 
  Navigation, 
  Building2, 
  Factory, 
  Truck, 
  HeartHandshake, 
  ArrowLeft, 
  Loader2, 
  AlertCircle, 
  CheckCircle2, 
  X,
  Globe,
  Award,
  Tag
} from 'lucide-react';
import authService from '../services/authService';

export const Register = () => {
  // Active role tab: 'SOCIETY_INDIVIDUAL', 'NGO', 'FACTORY', 'DELIVERY_PARTNER'
  const [selectedRole, setSelectedRole] = useState('SOCIETY_INDIVIDUAL');

  // Common User Credentials & Basic Info
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Address & Geolocation State (Mandatory for Society, NGO & Factory)
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const country = 'India'; // Read-only default
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  // Role 1 (Society / Individual) Specific Fields
  const [fullName, setFullName] = useState('');
  const [orgName, setOrgName] = useState('');
  const [buildingType, setBuildingType] = useState('Gated Society');

  // Role 2 (NGO / Civic Partner) Specific Fields
  const [ngoName, setNgoName] = useState('');
  const [ngoContactPerson, setNgoContactPerson] = useState('');
  const [darpanId, setDarpanId] = useState('');
  const [focusArea, setFocusArea] = useState('CIVIC_CLEANUP');

  // Role 3 (Factory) Specific Fields
  const [familyName, setFactoryName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [acceptedWasteCategory, setAcceptedWasteCategory] = useState('PLASTIC');
  const [dailyQuotaKg, setDailyQuotaKg] = useState('1000');

  // Role 4 (Delivery Partner) Specific Fields
  const [driverName, setDriverName] = useState('');
  const [vehicleType, setVehicleType] = useState('Mini Truck');
  const [vehicleNumber, setVehicleNumber] = useState('');

  // UI Feedback States
  const [loading, setLoading] = useState(false);
  const [inlineError, setInlineError] = useState('');
  const [toast, setToast] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const navigate = useNavigate();

  const showToastNotification = (type, message) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Browser Geolocation Detector API with IP Fallback
  const handleDetectCurrentLocation = async () => {
    setIsDetectingLocation(true);
    setInlineError('');

    const applyCoordinates = (lat, lng, sourceLabel) => {
      const formattedLat = parseFloat(lat).toFixed(6);
      const formattedLng = parseFloat(lng).toFixed(6);
      setLatitude(formattedLat);
      setLongitude(formattedLng);
      setFieldErrors((prev) => ({ ...prev, latitude: '', longitude: '' }));
      showToastNotification('success', `Coordinates Detected (${sourceLabel}): ${formattedLat}, ${formattedLng}`);
    };

    const fallbackToIpGeolocation = async () => {
      try {
        const res = await fetch('https://ipapi.co/json/');
        if (res.ok) {
          const data = await res.json();
          if (data.latitude && data.longitude) {
            applyCoordinates(data.latitude, data.longitude, 'IP Location');
            if (data.city && !city) setCity(data.city);
            if (data.region && !state) setState(data.region);
            if (data.postal && !pincode) setPincode(data.postal);
            return true;
          }
        }
      } catch (e) {
        console.warn('IP Geolocation API fallback failed:', e);
      }

      // Default Hub Fallback (New Delhi / SWM Hub)
      applyCoordinates(28.613939, 77.209021, 'Delhi Hub Fallback');
      if (!city) setCity('New Delhi');
      if (!state) setState('Delhi');
      if (!pincode) setPincode('110001');
      return true;
    };

    if (!navigator.geolocation) {
      await fallbackToIpGeolocation();
      setIsDetectingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsDetectingLocation(false);
        applyCoordinates(position.coords.latitude, position.coords.longitude, 'Browser GPS');
      },
      async (error) => {
        console.warn('Browser Geolocation error:', error.message);
        await fallbackToIpGeolocation();
        setIsDetectingLocation(false);
      },
      { enableHighAccuracy: false, timeout: 6000, maximumAge: 60000 }
    );
  };

  const validateForm = () => {
    const errors = {};
    let isValid = true;

    // Email & Password Validation
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
      errors.password = 'Password must be at least 6 characters long.';
      isValid = false;
    }

    // Role-specific Name Validation
    if (selectedRole === 'SOCIETY_INDIVIDUAL') {
      if (!fullName.trim()) {
        errors.fullName = 'Full Name is required.';
        isValid = false;
      }
    } else if (selectedRole === 'NGO') {
      if (!ngoName.trim()) {
        errors.ngoName = 'NGO Organization Name is required.';
        isValid = false;
      }
      if (!ngoContactPerson.trim()) {
        errors.ngoContactPerson = 'Representative Name is required.';
        isValid = false;
      }
    } else if (selectedRole === 'FACTORY') {
      if (!familyName.trim()) {
        errors.familyName = 'Factory Name is required.';
        isValid = false;
      }
      if (!contactPerson.trim()) {
        errors.contactPerson = 'Contact Person Name is required.';
        isValid = false;
      }
      if (!dailyQuotaKg || isNaN(dailyQuotaKg) || parseFloat(dailyQuotaKg) <= 0) {
        errors.dailyQuotaKg = 'Valid Daily Quota in KG is required.';
        isValid = false;
      }
    } else if (selectedRole === 'DELIVERY_PARTNER') {
      if (!driverName.trim()) {
        errors.driverName = 'Driver Name is required.';
        isValid = false;
      }
    }

    // Mandatory Geolocation & Address Validation for Society, NGO & Factory
    const isLocationMandatory = selectedRole === 'SOCIETY_INDIVIDUAL' || selectedRole === 'NGO' || selectedRole === 'FACTORY';
    if (isLocationMandatory) {
      if (!streetAddress.trim()) {
        errors.streetAddress = 'Street Address is required.';
        isValid = false;
      }
      if (!city.trim()) {
        errors.city = 'City is required.';
        isValid = false;
      }
      if (!state.trim()) {
        errors.state = 'State is required.';
        isValid = false;
      }
      if (!pincode.trim()) {
        errors.pincode = 'Pincode is required.';
        isValid = false;
      }
      if (!latitude || isNaN(latitude)) {
        errors.latitude = 'Latitude is required. Click "Detect Current Location".';
        isValid = false;
      }
      if (!longitude || isNaN(longitude)) {
        errors.longitude = 'Longitude is required. Click "Detect Current Location".';
        isValid = false;
      }
    }

    setFieldErrors(errors);
    return isValid;
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setInlineError('');

    if (!validateForm()) {
      showToastNotification('warning', 'Please fill in all mandatory fields before registering.');
      return;
    }

    try {
      setLoading(true);

      const payload = {
        role: selectedRole,
        email: email.trim(),
        password,
        phone_number: phoneNumber.trim() || null,

        // Address & Geolocation data
        street_address: streetAddress.trim() || null,
        city: city.trim() || null,
        state: state.trim() || null,
        pincode: pincode.trim() || null,
        country: 'India',
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,

        // Role 1 (Society / Individual)
        name: selectedRole === 'SOCIETY_INDIVIDUAL' ? fullName.trim() : (selectedRole === 'NGO' ? ngoName.trim() : (selectedRole === 'FACTORY' ? familyName.trim() : driverName.trim())),
        full_name: fullName.trim(),
        org_name: orgName.trim() || ngoName.trim() || null,
        society_name: orgName.trim() || familyName.trim() || null,
        building_type: buildingType,

        // Role 2 (NGO)
        ngo_name: ngoName.trim(),
        darpan_id: darpanId.trim() || null,
        focus_area: focusArea,
        contact_person: selectedRole === 'NGO' ? ngoContactPerson.trim() : contactPerson.trim(),

        // Role 3 (Factory)
        factory_name: familyName.trim(),
        accepted_waste_category: acceptedWasteCategory,
        daily_quota_kg: dailyQuotaKg ? parseFloat(dailyQuotaKg) : null,

        // Role 4 (Delivery Partner)
        driver_name: driverName.trim(),
        vehicle_type: vehicleType,
        vehicle_number: vehicleNumber.trim() || null,
      };

      const response = await authService.signup(payload);

      setLoading(false);
      showToastNotification('success', 'Account created successfully! Redirecting to your portal...');

      // Save token and user details in localStorage
      if (response?.token) {
        localStorage.setItem('urbaneco_token', response.token);
        localStorage.setItem('token', response.token);
      }
      if (response?.user) {
        localStorage.setItem('urbaneco_user', JSON.stringify(response.user));
      }

      // Role-based redirection
      setTimeout(() => {
        if (selectedRole === 'NGO') {
          navigate('/org-portal');
        } else if (selectedRole === 'FACTORY') {
          navigate('/dashboard/factory');
        } else if (selectedRole === 'DELIVERY_PARTNER') {
          navigate('/dashboard/delivery');
        } else {
          navigate('/dashboard/society');
        }
      }, 800);

    } catch (err) {
      setLoading(false);
      const errorMessage = err?.response?.data?.error || err.message || 'Registration failed. Please check form details.';
      setInlineError(errorMessage);
      showToastNotification('error', errorMessage);
    }
  };

  const roleTabs = [
    {
      id: 'SOCIETY_INDIVIDUAL',
      label: 'Society / Individual',
      icon: Building2,
      description: 'Residents, RWAs, & Bulk Waste Generators',
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
      description: 'Drivers & Waste Logistics Fleet',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-center items-center selection:bg-emerald-500 selection:text-white font-sans">
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

      {/* Top Header & Home Navigation Link */}
      <div className="w-full max-w-2xl flex items-center justify-between mb-6">
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-emerald-600 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Link>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-100/80 px-3 py-1.5 rounded-full border border-emerald-200">
          <span>India SWM Rules 2026</span>
        </div>
      </div>

      {/* Main Registration Card */}
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-xl border border-slate-100 p-6 sm:p-10 relative overflow-hidden">
        {/* Top Decorative Gradient Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600" />

        {/* Brand Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center mb-3 ring-8 ring-emerald-50">
            <Leaf className="w-8 h-8 text-emerald-600 fill-emerald-600/20" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Create UrbanEco Account</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Join India's Smart Waste Management Network</p>
        </div>

        {/* 4 Role Selector Tabs */}
        <div className="mb-8">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
            Select Registration Type
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
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
                    setFieldErrors({});
                  }}
                  className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-xl transition-all duration-200 text-center ${
                    isSelected
                      ? 'bg-white text-emerald-600 shadow-md font-bold ring-1 ring-slate-200'
                      : 'text-slate-500 hover:text-slate-800 font-medium hover:bg-white/50'
                  }`}
                >
                  <IconComponent className={`w-5 h-5 mb-1 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className="text-xs leading-tight font-semibold">{tab.label}</span>
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
              <p className="font-bold text-rose-900">Registration Error</p>
              <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">{inlineError}</p>
            </div>
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleRegisterSubmit} className="space-y-6" noValidate>
          
          {/* SECTION 1: ROLE SPECIFIC IDENTITY FIELDS */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider border-b border-slate-100 pb-2 flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-600" />
              Account Details
            </h3>

            {/* Role 1: Society / Individual Fields */}
            {selectedRole === 'SOCIETY_INDIVIDUAL' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-all ${
                      fieldErrors.fullName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                    }`}
                  />
                  {fieldErrors.fullName && <p className="text-xs text-rose-600 mt-1">{fieldErrors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Society / Org Name (Optional)</label>
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    placeholder="e.g. Green Meadows RWA"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Building Type</label>
                  <select
                    value={buildingType}
                    onChange={(e) => setBuildingType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="Gated Society">Gated Society / RWA</option>
                    <option value="Apartment Complex">Apartment Complex</option>
                    <option value="Individual House">Individual Independent House</option>
                    <option value="Commercial Establishment">Commercial / Hotel / Mall</option>
                  </select>
                </div>
              </div>
            )}

            {/* Role 2: NGO / Civic Partner Fields */}
            {selectedRole === 'NGO' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">NGO / Organization Name *</label>
                  <input
                    type="text"
                    value={ngoName}
                    onChange={(e) => setNgoName(e.target.value)}
                    placeholder="e.g. Clean City Foundation"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-all ${
                      fieldErrors.ngoName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                    }`}
                  />
                  {fieldErrors.ngoName && <p className="text-xs text-rose-600 mt-1">{fieldErrors.ngoName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Representative Name *</label>
                  <input
                    type="text"
                    value={ngoContactPerson}
                    onChange={(e) => setNgoContactPerson(e.target.value)}
                    placeholder="e.g. Ananya Roy (President)"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-all ${
                      fieldErrors.ngoContactPerson ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                    }`}
                  />
                  {fieldErrors.ngoContactPerson && <p className="text-xs text-rose-600 mt-1">{fieldErrors.ngoContactPerson}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">NITI Aayog DARPAN ID (Optional)</label>
                  <div className="relative">
                    <Award className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={darpanId}
                      onChange={(e) => setDarpanId(e.target.value)}
                      placeholder="e.g. DL/2026/0123456"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Focus Area</label>
                  <select
                    value={focusArea}
                    onChange={(e) => setFocusArea(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="CIVIC_CLEANUP">Civic Spot Cleanups & Anti-Littering</option>
                    <option value="WASTE_SEGREGATION">Source Waste Segregation Campaigns</option>
                    <option value="PLASTIC_RECYCLING">Plastic Circular Economy</option>
                    <option value="COMMUNITY_AWARENESS">Community Awareness & Education</option>
                  </select>
                </div>
              </div>
            )}

            {/* Role 3: Factory Fields */}
            {selectedRole === 'FACTORY' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Factory Name *</label>
                  <input
                    type="text"
                    value={familyName}
                    onChange={(e) => setFactoryName(e.target.value)}
                    placeholder="e.g. EcoRecycle Industries"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-all ${
                      fieldErrors.familyName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                    }`}
                  />
                  {fieldErrors.familyName && <p className="text-xs text-rose-600 mt-1">{fieldErrors.familyName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person *</label>
                  <input
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Plant Manager"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-all ${
                      fieldErrors.contactPerson ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                    }`}
                  />
                  {fieldErrors.contactPerson && <p className="text-xs text-rose-600 mt-1">{fieldErrors.contactPerson}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Accepted Waste Category *</label>
                  <select
                    value={acceptedWasteCategory}
                    onChange={(e) => setAcceptedWasteCategory(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="FOOD_WASTE">Organic / Food Waste</option>
                    <option value="PLASTIC">Plastics & Polymers</option>
                    <option value="PAPER">Paper & Cardboard</option>
                    <option value="GLASS">Glass & Metal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Daily Processing Quota (KG) *</label>
                  <input
                    type="number"
                    value={dailyQuotaKg}
                    onChange={(e) => setDailyQuotaKg(e.target.value)}
                    placeholder="e.g. 5000"
                    min="1"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-all ${
                      fieldErrors.dailyQuotaKg ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                    }`}
                  />
                  {fieldErrors.dailyQuotaKg && <p className="text-xs text-rose-600 mt-1">{fieldErrors.dailyQuotaKg}</p>}
                </div>
              </div>
            )}

            {/* Role 4: Delivery Partner Fields */}
            {selectedRole === 'DELIVERY_PARTNER' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Driver Name *</label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="e.g. Vikram Singh"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-all ${
                      fieldErrors.driverName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                    }`}
                  />
                  {fieldErrors.driverName && <p className="text-xs text-rose-600 mt-1">{fieldErrors.driverName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Type</label>
                  <select
                    value={vehicleType}
                    onChange={(e) => setVehicleType(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="Mini Truck">Electric Mini Truck / Loader</option>
                    <option value="E-Rickshaw">E-Rickshaw Waste Cart</option>
                    <option value="Auto Tipper">Hydraulic Auto Tipper</option>
                    <option value="Heavy Waste Van">Heavy Waste Compactor</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Number (Optional)</label>
                  <input
                    type="text"
                    value={vehicleNumber}
                    onChange={(e) => setVehicleNumber(e.target.value)}
                    placeholder="e.g. DL 01 AB 1234"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>
              </div>
            )}

            {/* Email, Password & Phone for Roles 1, 2, 3 */}
            {selectedRole !== 'DELIVERY_PARTNER' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                    />
                  </div>
                </div>

                <div className="sm:col-span-1">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@urbaneco.com"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-all ${
                        fieldErrors.email ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                      }`}
                    />
                  </div>
                  {fieldErrors.email && <p className="text-xs text-rose-600 mt-1">{fieldErrors.email}</p>}
                </div>
              </div>
            )}

            {/* Email & Password for Delivery Partner */}
            {selectedRole === 'DELIVERY_PARTNER' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="driver@urbaneco.com"
                      className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-all ${
                        fieldErrors.email ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                      }`}
                    />
                  </div>
                  {fieldErrors.email && <p className="text-xs text-rose-600 mt-1">{fieldErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm focus:outline-none transition-all ${
                        fieldErrors.password ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                      }`}
                    />
                  </div>
                  {fieldErrors.password && <p className="text-xs text-rose-600 mt-1">{fieldErrors.password}</p>}
                </div>
              </div>
            )}

            {/* Password field for Roles 1, 2, 3 */}
            {selectedRole !== 'DELIVERY_PARTNER' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="•••••••• (Min. 6 characters)"
                    className={`w-full pl-10 pr-10 py-2.5 rounded-xl border text-sm focus:outline-none transition-all ${
                      fieldErrors.password ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                    }`}
                  />
                </div>
                {fieldErrors.password && <p className="text-xs text-rose-600 mt-1">{fieldErrors.password}</p>}
              </div>
            )}
          </div>

          {/* SECTION 2: LOCATION & ADDRESS (MANDATORY FOR SOCIETY, NGO & FACTORY) */}
          {(selectedRole === 'SOCIETY_INDIVIDUAL' || selectedRole === 'NGO' || selectedRole === 'FACTORY' || selectedRole === 'DELIVERY_PARTNER') && (
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  Location & Address {selectedRole !== 'DELIVERY_PARTNER' && <span className="text-rose-500 font-bold">*</span>}
                </h3>
                {selectedRole !== 'DELIVERY_PARTNER' && (
                  <span className="text-xs font-semibold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md">
                    Mandatory Geo-Verification
                  </span>
                )}
              </div>

              {/* Address Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Street Address {selectedRole !== 'DELIVERY_PARTNER' && '*'}
                  </label>
                  <input
                    type="text"
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="House / Plot No., Building, Street Name, Sector/Area"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-all ${
                      fieldErrors.streetAddress ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                    }`}
                  />
                  {fieldErrors.streetAddress && <p className="text-xs text-rose-600 mt-1">{fieldErrors.streetAddress}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City {selectedRole !== 'DELIVERY_PARTNER' && '*'}
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. New Delhi / Bengaluru"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-all ${
                      fieldErrors.city ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                    }`}
                  />
                  {fieldErrors.city && <p className="text-xs text-rose-600 mt-1">{fieldErrors.city}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    State {selectedRole !== 'DELIVERY_PARTNER' && '*'}
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    placeholder="e.g. Delhi / Karnataka"
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-all ${
                      fieldErrors.state ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                    }`}
                  />
                  {fieldErrors.state && <p className="text-xs text-rose-600 mt-1">{fieldErrors.state}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pincode {selectedRole !== 'DELIVERY_PARTNER' && '*'}
                  </label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="e.g. 110001"
                    maxLength={10}
                    className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-all ${
                      fieldErrors.pincode ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                    }`}
                  />
                  {fieldErrors.pincode && <p className="text-xs text-rose-600 mt-1">{fieldErrors.pincode}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Country</label>
                  <div className="relative">
                    <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input
                      type="text"
                      value={country}
                      readOnly
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-slate-500 text-sm font-semibold cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Geolocation Section */}
              <div className="mt-4 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wide flex items-center gap-1.5">
                      <Navigation className="w-4 h-4 text-emerald-600" />
                      GPS Geolocation Coordinates {selectedRole !== 'DELIVERY_PARTNER' && '*'}
                    </h4>
                    <p className="text-xs text-emerald-700 mt-0.5 font-medium">
                      Required for India SWM Rules 2026 proximity routing & pickup verification.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDetectCurrentLocation}
                    disabled={isDetectingLocation}
                    className="inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 shrink-0 disabled:opacity-75"
                  >
                    {isDetectingLocation ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Detecting GPS...
                      </>
                    ) : (
                      <>
                        <Navigation className="w-3.5 h-3.5" />
                        Detect Current Location
                      </>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-emerald-900 mb-1">
                      Latitude {selectedRole !== 'DELIVERY_PARTNER' && '*'}
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      placeholder="e.g. 28.613939"
                      className={`w-full px-3.5 py-2 rounded-xl border text-sm font-mono focus:outline-none transition-all ${
                        fieldErrors.latitude ? 'border-rose-400 bg-white' : 'border-emerald-300 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                      }`}
                    />
                    {fieldErrors.latitude && <p className="text-xs text-rose-600 mt-1">{fieldErrors.latitude}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-emerald-900 mb-1">
                      Longitude {selectedRole !== 'DELIVERY_PARTNER' && '*'}
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      placeholder="e.g. 77.209021"
                      className={`w-full px-3.5 py-2 rounded-xl border text-sm font-mono focus:outline-none transition-all ${
                        fieldErrors.longitude ? 'border-rose-400 bg-white' : 'border-emerald-300 bg-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20'
                      }`}
                    />
                    {fieldErrors.longitude && <p className="text-xs text-rose-600 mt-1">{fieldErrors.longitude}</p>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Submit Registration Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white py-3.5 px-4 rounded-2xl font-bold text-base transition-all shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-8"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Creating Compliant Account...</span>
              </>
            ) : (
              <span>Complete Multi-Role Registration</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500 font-medium">
            Already registered on UrbanEco Link?{' '}
            <Link to="/login" className="text-emerald-600 font-bold hover:text-emerald-700 hover:underline">
              Sign In Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
