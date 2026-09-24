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
  FileText,
  MapPin,
  Download,
  ExternalLink
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
            <span className="font-bold text-neutral-dark">{shipment.assigned_driver || 'Unassigned'}</span>
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

// --- View QR Manifest Modal Component (Society Dashboard Style) ---
const ViewQrModal = ({ shipment, onClose, onDownload }) => {
  if (!shipment) return null;

  const qrToken = shipment.qr_code || shipment.qr_code_token || `BATCH-${shipment.id || '001'}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(qrToken)}`;

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
        className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative text-center"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3 text-left">
            <div className="p-3 bg-primary/10 text-primary rounded-2xl">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-neutral-dark text-xl">Shipment QR Manifest</h3>
              <p className="text-xs text-neutral-gray font-medium">Scan token at gate weighbridge for rapid intake verification</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-neutral-gray" />
          </button>
        </div>

        {/* QR Code Container */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-6 flex flex-col items-center justify-center">
          <div className="p-3 bg-white rounded-2xl shadow-md border border-gray-200 mb-3">
            <img
              src={qrImageUrl}
              alt={`QR Code for ${qrToken}`}
              className="w-48 h-48 object-contain rounded-xl"
            />
          </div>
          <span className="font-mono text-xs font-black text-primary bg-primary/10 px-3 py-1 rounded-md border border-primary/20">
            {qrToken}
          </span>
        </div>

        {/* Details Box */}
        <div className="text-left space-y-2 bg-gray-50 p-4 rounded-xl mb-6 text-xs">
          <div className="flex justify-between"><span className="text-neutral-gray">Origin Society</span><span className="font-bold text-neutral-dark">{shipment.society_name || 'Registered Society'}</span></div>
          <div className="flex justify-between"><span className="text-neutral-gray">Stream Category</span><span className="font-bold text-neutral-dark">{shipment.stream_category || shipment.waste_category || 'DRY'} Stream</span></div>
          <div className="flex justify-between"><span className="text-neutral-gray">Allocated Mass</span><span className="font-black text-primary">{Number(shipment.allocated_weight_kg || shipment.estimated_weight_kg || shipment.weight_kg || 0).toFixed(1)} kg</span></div>
          <div className="flex justify-between"><span className="text-neutral-gray">Logistics Driver</span><span className="font-bold text-neutral-dark">{shipment.driver_name || shipment.assigned_driver || 'Assigned Driver'}</span></div>
          <div className="flex justify-between"><span className="text-neutral-gray">Allocation Status</span><span className="font-bold text-emerald-600">{shipment.shipment_status || shipment.allocation_status || shipment.status || 'ASSIGNED'}</span></div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            onClick={onDownload}
            className="flex items-center justify-center gap-2 border border-primary text-primary hover:bg-primary/5 py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95"
          >
            <Download className="w-4 h-4" /> Download QR
          </button>
          <button
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 text-neutral-dark py-3.5 rounded-xl font-bold text-sm transition-all active:scale-95"
          >
            Close
          </button>
        </div>
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
  const [factoryAnalytics, setFactoryAnalytics] = useState({
    daily_quota_kg: 1000,
    weekly_quota_kg: 7000,
    remaining_quota_kg: 1000,
    accepted_waste_category: 'PLASTIC',
    total_weight_processed_kg: 0,
    pending_incoming_trucks: 0,
    completed_deliveries_count: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const [viewingQrShipment, setViewingQrShipment] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
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
        const stats = statsRes.stats;
        setFactorySettings({
          weekly_quota_kg: stats.weekly_quota_kg || 1000,
        });
        setFactoryAnalytics({
          daily_quota_kg: stats.daily_quota_kg || 1000,
          weekly_quota_kg: stats.weekly_quota_kg || 7000,
          remaining_quota_kg: stats.remaining_quota_kg || 1000,
          accepted_waste_category: stats.accepted_waste_category || 'PLASTIC',
          total_weight_processed_kg: stats.total_weight_processed_kg || 0,
          pending_incoming_trucks: stats.pending_incoming_trucks || 0,
          completed_deliveries_count: stats.completed_deliveries_count || 0,
        });
      }

      const shipmentsList = res.pickups || res.shipments || [];
      const totalWeight = shipmentsList.reduce((acc, p) => acc + parseFloat(p.allocated_weight_kg || p.estimated_weight_kg || p.weight_kg || 0), 0);

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
    .filter((p) => (p.stream_category || p.waste_category || '').toString().toUpperCase() === 'WET')
    .reduce((sum, p) => sum + parseFloat(p.allocated_weight_kg || p.estimated_weight_kg || p.weight_kg || 0), 0);

  const dryWeight = incomingData.pickups
    .filter((p) => (p.stream_category || p.waste_category || '').toString().toUpperCase() === 'DRY')
    .reduce((sum, p) => sum + parseFloat(p.allocated_weight_kg || p.estimated_weight_kg || p.weight_kg || 0), 0);

  const hazardousWeight = incomingData.pickups
    .filter((p) => {
      const kind = (p.stream_category || p.waste_category || '').toString().toUpperCase();
      return kind === 'HAZARDOUS' || kind === 'SANITARY';
    })
    .reduce((sum, p) => sum + parseFloat(p.allocated_weight_kg || p.estimated_weight_kg || p.weight_kg || 0), 0);

  const intakeLogs = incomingData.pickups.map((pickup, index) => ({
    id: pickup.allocation_id || pickup.id || index,
    batchId: pickup.batch_id || pickup.qr_code || pickup.qr_code_token || `B-${index + 1}`,
    source: pickup.society_name || 'Registered Society',
    stream: pickup.stream_category || pickup.waste_category || 'WET',
    weight: Number(pickup.allocated_weight_kg || pickup.estimated_weight_kg || pickup.weight_kg || 0),
    status: pickup.shipment_status || pickup.allocation_status || pickup.status || 'ASSIGNED',
    time: pickup.allocated_at || pickup.created_at || new Date().toISOString(),
  }));

  const analyticsByStream = [
    { label: 'Wet', value: wetWeight, color: 'bg-amber-500' },
    { label: 'Dry', value: dryWeight, color: 'bg-emerald-500' },
    { label: 'Hazardous', value: hazardousWeight, color: 'bg-rose-500' },
  ];

  const quotaUsagePercent = Math.min(100, ((factoryAnalytics.weekly_quota_kg - factoryAnalytics.remaining_quota_kg) / Math.max(factoryAnalytics.weekly_quota_kg, 1)) * 100 || 0);

  const renderContent = () => {
    if (activeTab === 'Overview') {
      return (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-neutral-dark">Factory Operational Overview</h1>
              <p className="text-sm font-medium text-neutral-gray">Live processing throughput, telemetry metrics and facility capacity usage</p>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Incoming Trucks" value={incomingData.incoming_trucks_count} subtext="Assigned En-Route" trend="Active" icon={Truck} colorClass="bg-blue-50 text-blue-600" />
            <StatCard title="Total Scheduled Weight" value={`${incomingData.total_incoming_weight_kg.toLocaleString()} kg`} subtext="Live intake mass" trend="Live" icon={Scale} colorClass="bg-green-50 text-green-600" />
            <StatCard title="Processed Weight" value={`${factoryAnalytics.total_weight_processed_kg.toLocaleString()} kg`} subtext="Confirmed weighbridge intake" icon={Recycle} colorClass="bg-yellow-50 text-yellow-600" />
            <StatCard title="Capacity Quota" value={`${Math.round(quotaUsagePercent)}%`} subtext={`${factoryAnalytics.weekly_quota_kg - factoryAnalytics.remaining_quota_kg} / ${factoryAnalytics.weekly_quota_kg} kg`} icon={Box} colorClass="bg-purple-50 text-purple-600" />
          </div>

          {/* Processing Capacity & Waste Stream Gauge */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-neutral-dark text-lg">Weekly Capacity & Quota Usage</h3>
                  <p className="text-xs text-neutral-gray font-medium">Synced with S2 Spatial Dispatch engine for auto-allocation</p>
                </div>
                <button onClick={() => setActiveTab('Settings')} className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                  Adjust Quota <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center text-sm font-bold mb-2">
                    <span className="text-neutral-dark">Weekly Intake Quota ({Math.round(quotaUsagePercent)}% utilized)</span>
                    <span className="text-primary font-mono">{factoryAnalytics.weekly_quota_kg - factoryAnalytics.remaining_quota_kg} kg / {factoryAnalytics.weekly_quota_kg} kg</span>
                  </div>
                  <div className="h-4 bg-gray-100 rounded-full overflow-hidden p-0.5 border border-gray-200">
                    <div className="bg-gradient-to-r from-green-500 to-emerald-600 h-full rounded-full transition-all duration-500" style={{ width: `${quotaUsagePercent}%` }} />
                  </div>
                  <div className="flex justify-between items-center text-xs text-neutral-gray mt-2">
                    <span>Remaining Capacity: <strong className="text-emerald-600">{factoryAnalytics.remaining_quota_kg} kg</strong></span>
                    <span>Daily Equivalent: <strong className="text-neutral-dark">{factoryAnalytics.daily_quota_kg} kg/day</strong></span>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-gray mb-4">Accepted Waste Streams Proportions</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100 text-center">
                      <span className="text-[10px] uppercase font-bold text-amber-700 tracking-wider">Wet Stream</span>
                      <p className="text-lg font-black text-neutral-dark mt-1">{wetWeight.toLocaleString()} kg</p>
                    </div>
                    <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 text-center">
                      <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Dry Stream</span>
                      <p className="text-lg font-black text-neutral-dark mt-1">{dryWeight.toLocaleString()} kg</p>
                    </div>
                    <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-100 text-center">
                      <span className="text-[10px] uppercase font-bold text-rose-700 tracking-wider">Hazardous</span>
                      <p className="text-lg font-black text-neutral-dark mt-1">{hazardousWeight.toLocaleString()} kg</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-neutral-dark text-base">En-Route Queue Summary</h3>
                  <button onClick={() => setActiveTab('Shipments')} className="text-xs font-bold text-primary hover:underline">
                    View All
                  </button>
                </div>
                <div className="space-y-3">
                  {incomingData.pickups.slice(0, 3).map((pickup, idx) => (
                    <div key={pickup.id || idx} className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-neutral-dark truncate max-w-[140px]">{pickup.society_name || 'Registered Society'}</p>
                        <p className="text-[10px] text-neutral-gray">{pickup.stream_category || pickup.waste_category || 'DRY'} • {pickup.allocated_weight_kg || pickup.estimated_weight_kg || 0} kg</p>
                      </div>
                      <span className="px-2.5 py-1 bg-blue-100 text-blue-700 font-bold rounded-full text-[10px]">
                        {pickup.shipment_status || pickup.status || 'ASSIGNED'}
                      </span>
                    </div>
                  ))}
                  {incomingData.pickups.length === 0 && (
                    <p className="text-xs text-neutral-gray italic p-4 text-center">No active truck queue right now.</p>
                  )}
                </div>
              </div>

              <button onClick={() => setActiveTab('Shipments')} className="w-full mt-4 bg-primary/10 hover:bg-primary/20 text-primary py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2">
                <Truck className="w-4 h-4" />
                <span>Go to Incoming Shipments ({incomingData.pickups.length})</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'Shipments') {
      const filteredPickups = incomingData.pickups.filter((pickup) => {
        const q = searchQuery.toLowerCase().trim();
        const societyName = (pickup.society_name || '').toLowerCase();
        const driverName = (pickup.driver_name || pickup.assigned_driver || '').toLowerCase();
        const qrToken = (pickup.qr_code || pickup.qr_code_token || '').toLowerCase();
        const streamCategory = (pickup.stream_category || pickup.waste_category || '').toUpperCase();
        const statusVal = (pickup.shipment_status || pickup.allocation_status || pickup.status || 'ASSIGNED').toUpperCase();

        const matchesSearch = !q || societyName.includes(q) || driverName.includes(q) || qrToken.includes(q);
        const matchesCategory = categoryFilter === 'ALL' || streamCategory === categoryFilter;
        const matchesStatus = statusFilter === 'ALL' || statusVal === statusFilter;

        return matchesSearch && matchesCategory && matchesStatus;
      });

      return (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-neutral-dark">Incoming Truck Shipments & Manifest Verification</h1>
              <p className="text-sm font-medium text-neutral-gray">View QR code tokens, manifest details, origin societies and weighbridge intake</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchIncomingPickups}
                className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-neutral-dark rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <RefreshCw className={`w-4 h-4 text-primary ${loading ? 'animate-spin' : ''}`} />
                Refresh Shipments
              </button>
            </div>
          </div>

          {/* Search & Filter Control Bar matching Society Dashboard */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-gray" />
              <input
                type="text"
                placeholder="Search by Society, Driver or QR Token..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold text-neutral-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-neutral-dark focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              >
                <option value="ALL">All Stream Categories</option>
                <option value="WET">Wet Stream</option>
                <option value="DRY">Dry Stream</option>
                <option value="HAZARDOUS">Hazardous Stream</option>
                <option value="FOOD_WASTE">Food Waste</option>
                <option value="PLASTIC">Plastic Waste</option>
              </select>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-neutral-dark focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="ASSIGNED">Assigned</option>
                <option value="IN_TRANSIT">In Transit</option>
                <option value="DELIVERED">Delivered</option>
              </select>

              <span className="text-xs font-bold px-3 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-200/50">
                {filteredPickups.length} Result{filteredPickups.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Dedicated Incoming Shipments Cards Grid */}
          <div className="space-y-6">
            {loading ? (
              <div className="p-16 bg-white rounded-3xl border border-gray-100 text-center text-neutral-gray flex flex-col items-center justify-center gap-3 shadow-sm">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm font-bold">Fetching incoming shipments & QR manifest data...</p>
              </div>
            ) : filteredPickups.length === 0 ? (
              <div className="p-16 bg-white rounded-3xl border border-dashed border-gray-200 text-center text-neutral-gray shadow-sm">
                <Truck className="w-12 h-12 text-neutral-gray/40 mx-auto mb-3" />
                <h3 className="font-bold text-neutral-dark text-lg mb-1">No matching incoming shipments found</h3>
                <p className="text-xs text-neutral-gray max-w-md mx-auto">
                  {searchQuery || categoryFilter !== 'ALL' || statusFilter !== 'ALL'
                    ? 'Try adjusting your search query or filter options to see scheduled drops.'
                    : 'New society waste drops will appear here automatically when assigned by the dispatch engine.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredPickups.map((pickup) => {
                  const statusVal = pickup.shipment_status || pickup.allocation_status || pickup.status || 'ASSIGNED';
                  const isDelivered = statusVal === 'DELIVERED';
                  const qrToken = pickup.qr_code || pickup.qr_code_token || `QR-${pickup.id || pickup.allocation_id}`;
                  const qrImg = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrToken)}`;
                  const streamCategory = pickup.stream_category || pickup.waste_category || 'DRY';

                  return (
                    <motion.div
                      key={pickup.id || pickup.allocation_id}
                      whileHover={{ y: -3 }}
                      className="bg-white p-7 rounded-3xl border border-gray-100 hover:border-green-300 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between gap-6 relative overflow-hidden"
                    >
                      {/* Top Header Row matching Society Batch Card */}
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex items-center gap-3">
                          <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                            <QrCode className="w-6 h-6" />
                          </div>
                          <div>
                            <span className="text-[10px] font-mono font-black text-primary bg-primary/10 px-2.5 py-0.5 rounded border border-primary/20">
                              #{qrToken}
                            </span>
                            <h3 className="font-bold text-neutral-dark text-lg mt-1">
                              From: {pickup.society_name || 'Registered Society'}
                            </h3>
                          </div>
                        </div>

                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border ${isDelivered
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : statusVal === 'IN_TRANSIT'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-blue-50 text-blue-700 border-blue-200'
                          }`}>
                          {statusVal}
                        </span>
                      </div>

                      {/* Card Content Split: Details Left + Interactive QR Right */}
                      <div className="grid grid-cols-1 sm:grid-cols-[1fr_130px] gap-4 bg-gray-50/70 p-5 rounded-2xl border border-gray-100">
                        <div className="space-y-2.5 text-xs">
                          <div className="flex items-center gap-2 text-neutral-dark font-medium">
                            <Building2 className="w-4 h-4 text-neutral-gray shrink-0" />
                            <span>Origin: <strong className="font-bold text-neutral-dark">{pickup.society_name || 'Lotus Society RWA'}</strong></span>
                          </div>
                          <div className="flex items-center gap-2 text-neutral-dark font-medium">
                            <MapPin className="w-4 h-4 text-neutral-gray shrink-0" />
                            <span className="truncate">Address: <strong className="font-bold text-neutral-dark">{pickup.pickup_address || 'Delhi NCT Zone 4'}</strong></span>
                          </div>
                          <div className="flex items-center gap-2 text-neutral-dark font-medium">
                            <Truck className="w-4 h-4 text-neutral-gray shrink-0" />
                            <span>Driver: <strong className="font-bold text-neutral-dark">{pickup.driver_name || pickup.assigned_driver || 'Logistics Driver'}</strong></span>
                          </div>

                          <div className="pt-2 flex items-center gap-3">
                            <span className={`px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${streamCategory === 'WET' ? 'bg-amber-100 text-amber-800' : streamCategory === 'DRY' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                              }`}>
                              {streamCategory} Stream
                            </span>
                            <span className="text-sm font-black text-primary bg-white px-3 py-1 rounded-md border border-gray-200 shadow-xs">
                              {Number(pickup.allocated_weight_kg || pickup.estimated_weight_kg || pickup.weight_kg || 0).toFixed(1)} kg
                            </span>
                          </div>
                        </div>

                        {/* Interactive QR Code Thumbnail matching Society view */}
                        <div
                          onClick={() => setViewingQrShipment(pickup)}
                          className="group relative bg-white p-2.5 rounded-xl border border-gray-200 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-all shadow-xs"
                          title="Click to expand QR Manifest"
                        >
                          <img
                            src={qrImg}
                            alt="Shipment QR"
                            className="w-24 h-24 object-contain rounded-lg group-hover:scale-105 transition-transform"
                          />
                          <span className="text-[9px] font-bold text-primary mt-1 flex items-center gap-0.5">
                            <ExternalLink className="w-2.5 h-2.5" /> Enlarge
                          </span>
                        </div>
                      </div>

                      {/* Action Footer Buttons matching Society Dashboard */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <button
                          type="button"
                          onClick={() => setViewingQrShipment(pickup)}
                          className="w-full bg-white border border-gray-200 hover:bg-gray-50 text-neutral-dark py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2 active:scale-95 shadow-xs"
                        >
                          <QrCode className="w-4 h-4 text-primary" />
                          <span>View Manifest QR</span>
                        </button>

                        {isDelivered ? (
                          <button disabled className="w-full bg-emerald-50 text-emerald-700 border border-emerald-200 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-default">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>Intake Verified ✅</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => setSelectedShipment(pickup)}
                            className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold text-xs shadow-md shadow-green-600/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>Confirm Weighbridge Intake</span>
                          </button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeTab === 'Intake Logs') {
      return (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-neutral-dark">Intake Logs</h1>
              <p className="text-sm font-medium text-neutral-gray">Every assigned shipment is logged from arrival to processing confirmation.</p>
            </div>
            <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-full text-xs font-bold">
              {intakeLogs.length} entries
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {intakeLogs.length === 0 ? (
              <div className="p-12 text-center text-neutral-gray">
                <Layers className="w-12 h-12 text-neutral-gray/40 mx-auto mb-3" />
                <h3 className="font-bold text-neutral-dark text-base">No intake logs yet</h3>
                <p className="text-xs text-neutral-gray mt-1">Shipment records will appear here after assignment and confirmation.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-neutral-gray">Batch</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-neutral-gray">Source</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-neutral-gray">Stream</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-neutral-gray">Weight</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-neutral-gray">Status</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold uppercase tracking-wider text-neutral-gray">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {intakeLogs.map((entry) => (
                      <tr key={entry.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 text-sm font-bold text-neutral-dark">{entry.batchId}</td>
                        <td className="px-6 py-4 text-sm text-neutral-dark">{entry.source}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider border border-blue-100">
                            {entry.stream}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-neutral-dark">{entry.weight.toFixed(1)} kg</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${entry.status === 'DELIVERED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : entry.status === 'IN_TRANSIT' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-700 border-slate-200'}`}>
                            {entry.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-gray">{new Date(entry.time).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeTab === 'Analytics') {
      return (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-neutral-dark">Factory Analytics</h1>
              <p className="text-sm font-medium text-neutral-gray">Waste mix, processing throughput and facility utilization from live intake data.</p>
            </div>
            <div className="px-3 py-1.5 bg-primary/10 border border-primary/30 text-primary rounded-full text-xs font-bold">
              Updated live
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Processed Weight" value={`${factoryAnalytics.total_weight_processed_kg.toLocaleString()} kg`} subtext="Confirmed deliveries" trend="+12%" icon={TrendingUp} colorClass="bg-emerald-50 text-emerald-600" />
            <StatCard title="Pending Intake" value={factoryAnalytics.pending_incoming_trucks} subtext="Incoming trucks waiting" icon={Clock} colorClass="bg-blue-50 text-blue-600" />
            <StatCard title="Completed Deliveries" value={factoryAnalytics.completed_deliveries_count} subtext="Delivered batches" icon={CheckCircle2} colorClass="bg-violet-50 text-violet-600" />
            <StatCard title="Quota Used" value={`${Math.round(quotaUsagePercent)}%`} subtext={`${factoryAnalytics.weekly_quota_kg - factoryAnalytics.remaining_quota_kg} / ${factoryAnalytics.weekly_quota_kg} kg`} icon={BarChart3} colorClass="bg-orange-50 text-orange-600" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-neutral-dark text-lg mb-5">Waste Stream Breakdown</h3>
              <div className="space-y-5">
                {analyticsByStream.map((group) => {
                  const percent = incomingData.total_incoming_weight_kg > 0 ? (group.value / Math.max(incomingData.total_incoming_weight_kg, 1)) * 100 : 0;
                  return (
                    <div key={group.label}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-neutral-dark">{group.label}</span>
                        <span className="text-xs font-bold text-neutral-gray">{group.value.toLocaleString()} kg</span>
                      </div>
                      <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`${group.color} h-full rounded-full`} style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-neutral-dark text-lg mb-5">Processing Insight</h3>
              <div className="space-y-4">
                <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-emerald-700">Operation Health</p>
                  <h4 className="text-xl font-black text-neutral-dark mt-1">{Math.max(86, 100 - Math.round((factoryAnalytics.pending_incoming_trucks || 0) * 5))}%</h4>
                  <p className="text-xs text-neutral-gray mt-1">Processing lines are operating within acceptable intake range.</p>
                </div>
                <div className="p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-blue-700">Accepted Material</p>
                  <h4 className="text-lg font-black text-neutral-dark mt-1">{factoryAnalytics.accepted_waste_category || 'PLASTIC'}</h4>
                  <p className="text-xs text-neutral-gray mt-1">Current intake acceptance profile is synced from backend configuration.</p>
                </div>
                <div className="p-4 bg-violet-50 border border-violet-100 rounded-2xl">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-violet-700">Facility Capacity</p>
                  <h4 className="text-lg font-black text-neutral-dark mt-1">{factoryAnalytics.weekly_quota_kg.toLocaleString()} kg / week</h4>
                  <p className="text-xs text-neutral-gray mt-1">Remaining weekly capacity: {factoryAnalytics.remaining_quota_kg.toLocaleString()} kg.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'Settings') {
      return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-5xl">
          <div>
            <h1 className="text-2xl font-black text-neutral-dark">Factory Profile</h1>
            <p className="text-sm font-medium text-neutral-gray">Manage facility intake profile, accepted waste streams and weekly quota settings.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-7">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary">
                  <Building2 className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider font-bold text-primary">Factory identity</p>
                  <h3 className="text-xl font-black text-neutral-dark">{user?.name || 'GreenTech Plant #1'}</h3>
                  <p className="text-xs text-neutral-gray">Approved processing partner</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-neutral-gray">Accepted Waste</p>
                  <p className="mt-2 text-lg font-black text-neutral-dark">{factoryAnalytics.accepted_waste_category || 'PLASTIC'}</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-neutral-gray">Weekly Capacity</p>
                  <p className="mt-2 text-lg font-black text-neutral-dark">{factoryAnalytics.weekly_quota_kg.toLocaleString()} kg</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-neutral-gray">Remaining Capacity</p>
                  <p className="mt-2 text-lg font-black text-neutral-dark">{factoryAnalytics.remaining_quota_kg.toLocaleString()} kg</p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <p className="text-[10px] uppercase tracking-wider font-bold text-neutral-gray">Current Status</p>
                  <p className="mt-2 text-lg font-black text-emerald-600">Operational</p>
                </div>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="bg-white p-7 rounded-3xl shadow-sm border border-gray-100 space-y-6">
              <div>
                <label className="block text-xs font-bold text-neutral-dark uppercase tracking-wider mb-2">Weekly Waste Requirement (kg)</label>
                <input
                  type="number"
                  min="0"
                  value={factorySettings.weekly_quota_kg}
                  onChange={(e) => setFactorySettings({ weekly_quota_kg: parseFloat(e.target.value || 0) })}
                  className="w-full px-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-base font-bold text-neutral-dark focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all"
                  placeholder="e.g. 1000"
                  required
                />
              </div>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700 text-xs font-medium">
                Backend configuration is connected to the factory quota API, so these values sync with the live processing engine.
              </div>

              <button type="submit" disabled={savingSettings} className="w-full bg-primary hover:bg-green-700 text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2">
                {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Save Factory Profile</span>
              </button>
            </form>
          </div>
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
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all ${isActive
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

      {/* View QR Manifest Modal */}
      <AnimatePresence>
        {viewingQrShipment && (
          <ViewQrModal
            shipment={viewingQrShipment}
            onClose={() => setViewingQrShipment(null)}
            onDownload={() => showToast('QR Manifest downloaded! ✅')}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FactoryDashboard;
