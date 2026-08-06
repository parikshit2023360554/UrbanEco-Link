import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import pickupService from '../services/pickupService';
import batchService from '../services/batchService';
import factoryService from '../services/factoryService';
import authService from '../services/authService';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Factory, 
  Truck, 
  Scale, 
  CheckCircle2, 
  RefreshCw, 
  Loader2, 
  LogOut, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Recycle, 
  Box,
  Layers,
  ArrowUpRight,
  Home,
  BarChart3,
  Settings,
  Bell,
  Menu,
  X,
  Plus,
  QrCode,
  Search,
  Filter,
  Check,
  ShieldCheck,
  Building2,
  Calendar,
  FileText
} from 'lucide-react';

// --- Stat Card Component matching Society Dashboard ---
const StatCard = ({ title, value, subtext, trend, icon: Icon, colorClass }) => (
  <motion.div 
    whileHover={{ y: -4 }}
    transition={{ duration: 0.2 }}
    className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-xs font-bold text-green-600 bg-green-50 px-2.5 py-1 rounded-full">
          <TrendingUp className="w-3.5 h-3.5" />
          <span>{trend}</span>
        </div>
      )}
    </div>
    <div>
      <h3 className="text-xs font-bold text-neutral-gray uppercase tracking-widest mb-1">{title}</h3>
      <div className="text-2xl font-black text-neutral-dark mb-1">{value}</div>
      <p className="text-xs font-medium text-neutral-gray">{subtext}</p>
    </div>
  </motion.div>
);

// --- Confirm Delivery Modal Component ---
const ConfirmDeliveryModal = ({ shipment, onClose, onConfirm, processing }) => {
  const [measuredWeight, setMeasuredWeight] = useState(shipment?.estimated_weight_kg || '');
  const [qualityGrade, setQualityGrade] = useState('Grade A - High Purity');
  const [notes, setNotes] = useState('');

  if (!shipment) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(shipment.id, { measuredWeight, qualityGrade, notes });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-dark text-xl">Confirm Waste Delivery</h3>
              <p className="text-xs text-neutral-gray font-medium">Verify weighbridge weight & process into intake inventory</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-neutral-gray" />
          </button>
        </div>

        {/* Shipment Details Summary Box */}
        <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 mb-6 space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-neutral-gray uppercase tracking-wider">Shipment ID</span>
            <span className="text-xs font-black font-mono text-primary bg-primary/10 px-2.5 py-1 rounded-md">
              {shipment.qr_code_token || `#SHIP-${shipment.id}`}
            </span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-gray">Origin Society</span>
            <span className="font-bold text-neutral-dark">{shipment.society_name || 'Greenwood RWA'}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-gray">Waste Stream</span>
            <span className="font-bold text-neutral-dark">{shipment.stream_category} Stream</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-neutral-gray">Assigned Driver</span>
            <span className="font-bold text-neutral-dark">{shipment.assigned_driver || 'Alex Rivera'}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-neutral-gray uppercase tracking-widest mb-2">
              Weighbridge Net Measured Weight (kg)
            </label>
            <div className="relative">
              <input 
                type="number" 
                step="0.1"
                required
                value={measuredWeight}
                onChange={e => setMeasuredWeight(e.target.value)}
                placeholder="e.g. 162.50"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl pl-4 pr-12 py-3.5 text-base font-bold text-neutral-dark focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-neutral-gray">kg</span>
            </div>
            <p className="text-[10px] text-neutral-gray mt-1">Declared weight: {shipment.estimated_weight_kg} kg</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-gray uppercase tracking-widest mb-2">
              Waste Quality Grade
            </label>
            <select 
              value={qualityGrade}
              onChange={e => setQualityGrade(e.target.value)}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3.5 text-sm font-bold text-neutral-dark focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            >
              <option value="Grade A - High Purity">Grade A — High Purity (Direct Recycling Ready)</option>
              <option value="Grade B - Standard">Grade B — Standard (Minor Sorting Required)</option>
              <option value="Grade C - Mixed Contaminated">Grade C — Mixed Contaminated (Pre-treatment Needed)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-gray uppercase tracking-widest mb-2">
              Intake Notes (Optional)
            </label>
            <textarea 
              rows="2"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Gate 2 weighbridge verified. Unloaded into Processing Bay 4."
              className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium text-neutral-dark focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <button 
              type="button"
              onClick={onClose} 
              className="border border-gray-200 hover:bg-gray-50 text-neutral-dark py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={processing}
              className="bg-green-600 hover:bg-green-700 text-white py-3.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-green-600/20 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
            >
              {processing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Verifying Intake...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Confirm Delivery</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

// --- Main Factory Dashboard Component ---
const FactoryDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  const [incomingData, setIncomingData] = useState({
    incoming_trucks_count: 0,
    total_incoming_weight_kg: 0,
    pickups: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token') || localStorage.getItem('urbaneco_token');
    const currentUser = authService.getCurrentUser();

    if (!token) {
      console.warn('🔒 Missing authorization Bearer token. Redirecting to login...');
      navigate('/login');
      return;
    }

    setUser(currentUser);
    fetchIncomingPickups();

    const handleSessionExpired = () => {
      showToast('Session expired. Please log in again.');
      setTimeout(() => navigate('/login'), 1000);
    };

    window.addEventListener('urbaneco:session_expired', handleSessionExpired);
    return () => window.removeEventListener('urbaneco:session_expired', handleSessionExpired);
  }, []);

  const [factorySettings, setFactorySettings] = useState({
    weekly_quota_kg: 1000,
  });
  const [savingSettings, setSavingSettings] = useState(false);

  const fetchIncomingPickups = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await factoryService.getShipments().catch(() => ({ pickups: [], total_incoming_weight_kg: 0 }));
      const statsRes = await factoryService.getStats().catch(() => null);

      if (statsRes?.stats) {
        setFactorySettings({
          weekly_quota_kg: statsRes.stats.weekly_quota_kg || 1000,
        });
      }

      const shipmentsList = res.pickups || res.shipments || [];
      const totalWeight = shipmentsList.reduce((acc, p) => acc + parseFloat(p.allocated_weight_kg || p.estimated_weight_kg || 0), 0);

      setIncomingData({
        incoming_trucks_count: shipmentsList.length,
        total_incoming_weight_kg: totalWeight,
        pickups: shipmentsList,
      });
    } catch (err) {
      if (err.status === 401 || err.message?.includes('401') || err.message?.toLowerCase().includes('authorized')) {
        console.warn('🔒 401 Unauthorized encountered during factory fetch. Redirecting to login...');
        authService.logout();
        navigate('/login');
        return;
      }
      setError(err.message || 'Failed to load factory incoming shipments.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelivery = async (id, intakeDetails) => {
    try {
      setProcessingId(id);
      const targetAllocationId = selectedShipment?.allocation_id || id;
      const targetBatchId = selectedShipment?.batch_id;
      const targetQr = selectedShipment?.qr_code;

      const confirmRes = await factoryService.confirmDelivery({
        allocation_id: targetAllocationId,
        batch_id: targetBatchId,
        qr_code: targetQr,
      });

      setSelectedShipment(null);
      showToast(confirmRes.message || 'Shipment delivery confirmed! ✅');
      await fetchIncomingPickups();
    } catch (err) {
      setError(err.message || 'Failed to process shipment intake.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSavingSettings(true);
      await factoryService.updateSettings({
        weekly_quota_kg: factorySettings.weekly_quota_kg,
      });
      showToast('Factory weekly waste requirement saved! ✅');
      await fetchIncomingPickups();
    } catch (err) {
      setError(err.message || 'Failed to update factory settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const navItems = [
    { id: 'Overview', icon: Home, label: 'Overview' },
    { id: 'Shipments', icon: Truck, label: 'Incoming Shipments' },
    { id: 'Intake Logs', icon: Layers, label: 'Intake Logs' },
    { id: 'Analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'Settings', icon: Settings, label: 'Factory Profile' }
  ];

  const wetWeight = incomingData.pickups
    .filter((p) => p.stream_category === 'WET')
    .reduce((sum, p) => sum + parseFloat(p.estimated_weight_kg || 0), 0);

  const dryWeight = incomingData.pickups
    .filter((p) => p.stream_category === 'DRY')
    .reduce((sum, p) => sum + parseFloat(p.estimated_weight_kg || 0), 0);

  const hazardousWeight = incomingData.pickups
    .filter((p) => p.stream_category === 'HAZARDOUS' || p.stream_category === 'SANITARY')
    .reduce((sum, p) => sum + parseFloat(p.estimated_weight_kg || 0), 0);

  const renderContent = () => {
    if (activeTab === 'Shipments' || activeTab === 'Overview') {
      return (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Top Banner & Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-neutral-dark">Factory Waste Processing Portal</h1>
              <p className="text-sm font-medium text-neutral-gray">Monitor incoming trucks, weighbridge verification & processing intake</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={fetchIncomingPickups}
                className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-neutral-dark rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <RefreshCw className={`w-4 h-4 text-primary ${loading ? 'animate-spin' : ''}`} />
                Refresh Telemetry
              </button>
            </div>
          </div>

          {/* Stat Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Incoming Trucks" 
              value={incomingData.incoming_trucks_count} 
              subtext="En route to processing plant"
              trend="Active"
              icon={Truck} 
              colorClass="bg-blue-50 text-blue-600"
            />
            <StatCard 
              title="Total En Route Weight" 
              value={`${incomingData.total_incoming_weight_kg.toLocaleString()} kg`} 
              subtext="Declared shipment payload"
              trend="Live"
              icon={Scale} 
              colorClass="bg-green-50 text-green-600"
            />
            <StatCard 
              title="Wet Organic Stream" 
              value={`${wetWeight.toLocaleString()} kg`} 
              subtext="Composting & Biogas ready"
              icon={Recycle} 
              colorClass="bg-yellow-50 text-yellow-600"
            />
            <StatCard 
              title="Dry Recyclable Stream" 
              value={`${dryWeight.toLocaleString()} kg`} 
              subtext="Material Recovery Facility"
              icon={Box} 
              colorClass="bg-purple-50 text-purple-600"
            />
          </div>

          {/* Incoming Shipments Table / Card Grid */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="font-bold text-neutral-dark text-lg">Incoming Truck Shipments</h3>
                <p className="text-xs text-neutral-gray font-medium">Verify weighbridge payload and click 'Confirm Delivery' to complete intake</p>
              </div>
              <span className="text-xs font-bold px-3 py-1 bg-blue-50 text-blue-600 rounded-full">
                {incomingData.pickups.length} En Route
              </span>
            </div>

            {loading ? (
              <div className="p-12 text-center text-neutral-gray flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm font-medium">Fetching live factory intake telemetry...</p>
              </div>
            ) : incomingData.pickups.length === 0 ? (
              <div className="p-12 text-center text-neutral-gray bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                <Truck className="w-12 h-12 text-neutral-gray/40 mx-auto mb-3" />
                <h4 className="font-bold text-neutral-dark text-base mb-1">No Incoming Shipments Out For Delivery</h4>
                <p className="text-xs text-neutral-gray max-w-md mx-auto">
                  When delivery partners scan waste bins and start transport, incoming trucks will appear here for gate weighbridge verification.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {incomingData.pickups.map((pickup) => {
                  const statusVal = pickup.shipment_status || pickup.allocation_status || pickup.status || 'ASSIGNED';
                  const isDelivered = statusVal === 'DELIVERED';
                  return (
                    <motion.div 
                      key={pickup.id || pickup.allocation_id}
                      whileHover={{ y: -4 }}
                      className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 hover:border-green-200 hover:shadow-md transition-all flex flex-col justify-between gap-5"
                    >
                      <div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                            <Truck className="w-6 h-6 text-primary" />
                          </div>
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${
                            isDelivered ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' : 'bg-blue-100 text-blue-700 border border-blue-200'
                          }`}>
                            {statusVal}
                          </span>
                        </div>

                        <div className="mb-3">
                          <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                            Drop Assigned To Your Facility
                          </span>
                          <h4 className="font-bold text-neutral-dark text-base mt-1 mb-0.5">
                            From: {pickup.society_name || 'Registered Society'}
                          </h4>
                          <p className="text-xs text-neutral-gray font-medium">
                            Driver: <span className="text-neutral-dark font-bold">{pickup.driver_name || pickup.assigned_driver || 'Assigned Driver'}</span>
                          </p>
                        </div>

                        <div className="space-y-2 text-xs bg-white p-3.5 rounded-xl border border-gray-100">
                          <div className="flex justify-between">
                            <span className="text-neutral-gray">Stream Category:</span>
                            <span className="font-bold text-neutral-dark">{pickup.stream_category || pickup.waste_category || 'WET'} Stream</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-gray">Your Allocated Portion:</span>
                            <span className="font-black text-emerald-600">{pickup.allocated_weight_kg || pickup.estimated_weight_kg || pickup.weight_kg || 0} kg</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-neutral-gray">QR Token:</span>
                            <span className="font-mono text-[10px] font-bold text-neutral-dark">{pickup.qr_code || pickup.qr_code_token || 'N/A'}</span>
                          </div>
                        </div>
                      </div>

                      {isDelivered ? (
                        <button
                          disabled
                          className="w-full bg-emerald-50 text-emerald-700 border border-emerald-200 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-default"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          <span>Delivery Confirmed</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedShipment(pickup)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold text-sm shadow-md shadow-green-600/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Confirm Delivery</span>
                        </button>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeTab === 'Settings') {
      return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
          <div>
            <h1 className="text-2xl font-black text-neutral-dark">Factory Intake Settings & Weekly Waste Requirement</h1>
            <p className="text-sm font-medium text-neutral-gray">Configure weekly waste intake capacity for dynamic multi-factory split allocations</p>
          </div>

          <form onSubmit={handleSaveSettings} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            <div>
              <label className="block text-xs font-bold text-neutral-dark uppercase tracking-wider mb-2">
                Weekly Waste Requirement / Intake Capacity (kg)
              </label>
              <input
                type="number"
                min="0"
                value={factorySettings.weekly_quota_kg}
                onChange={(e) => setFactorySettings({ weekly_quota_kg: parseFloat(e.target.value || 0) })}
                className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-base font-bold text-neutral-dark focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all"
                placeholder="e.g. 1000"
                required
              />
              <p className="text-xs text-neutral-gray mt-2 leading-relaxed">
                Incoming society waste batches are automatically allocated based on your weekly intake requirement.
              </p>
            </div>

            <button
              type="submit"
              disabled={savingSettings}
              className="w-full bg-primary hover:bg-green-700 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2"
            >
              {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>Save Weekly Waste Requirement</span>
            </button>
          </form>
        </div>
      );
    }

    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4 text-primary">
          <Factory className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-neutral-dark mb-1">{activeTab} Module</h3>
        <p className="text-sm text-neutral-gray italic">Factory processing telemetry active & connected to PostgreSQL backend.</p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50 text-neutral-dark font-sans flex">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-[120] bg-neutral-dark text-white px-6 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 font-medium text-sm border border-neutral-gray/20"
          >
            <CheckCircle2 className="w-5 h-5 text-primary" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Left Sidebar matching Society Dashboard */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 p-6 fixed inset-y-0 z-30 justify-between">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30">
              <Factory className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-lg font-black text-neutral-dark tracking-tight">UrbanEco-Link</span>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-primary">Factory Portal</span>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${
                    isActive 
                      ? 'bg-primary text-white shadow-lg shadow-primary/25' 
                      : 'text-neutral-gray hover:bg-gray-50 hover:text-neutral-dark'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="pt-6 border-t border-gray-100 space-y-4">
          <div className="flex items-center gap-3 px-2">
            <div className="w-10 h-10 rounded-2xl bg-green-50 text-green-700 font-black flex items-center justify-center text-sm border border-green-200/50">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'FP'}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-neutral-dark truncate">{user?.name || 'GreenTech Plant #1'}</h4>
              <p className="text-[10px] font-bold text-neutral-gray uppercase tracking-wider">FACTORY ADMIN</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Session</span>
          </button>
        </div>
      </aside>

      {/* Mobile Header Bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-40 bg-white border-b border-gray-100 px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center text-white">
            <Factory className="w-5 h-5" />
          </div>
          <span className="font-black text-neutral-dark text-base">UrbanEco-Link</span>
        </div>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-gray-100 rounded-xl"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8 min-w-0">
        {/* Top Greeting Header */}
        <div className="hidden lg:flex justify-between items-center mb-8 pb-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-black text-neutral-dark flex items-center gap-2">
              <span>Good Morning, Factory Admin</span>
              <span className="text-2xl">👋</span>
            </h2>
            <p className="text-xs text-neutral-gray font-medium mt-0.5">
              Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative p-2.5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:bg-gray-50 cursor-pointer">
              <Bell className="w-5 h-5 text-neutral-gray" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            </div>
            <button 
              onClick={fetchIncomingPickups}
              className="bg-primary hover:bg-primary-dark text-white px-5 py-3 rounded-2xl font-bold text-xs transition-all shadow-lg shadow-primary/20 flex items-center gap-2 active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Shipments</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {renderContent()}
      </main>

      {/* Confirm Delivery Modal */}
      <AnimatePresence>
        {selectedShipment && (
          <ConfirmDeliveryModal 
            shipment={selectedShipment}
            onClose={() => setSelectedShipment(null)}
            onConfirm={handleConfirmDelivery}
            processing={processingId === selectedShipment.id}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FactoryDashboard;
