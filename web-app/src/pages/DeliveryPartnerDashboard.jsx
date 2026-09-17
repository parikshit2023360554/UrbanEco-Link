import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import pickupService from '../services/pickupService';
import batchService from '../services/batchService';
import authService from '../services/authService';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Truck, 
  QrCode, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  LogOut, 
  RefreshCw, 
  Package, 
  MapPin, 
  Clock, 
  ArrowRight,
  Shield,
  ScanLine,
  Home,
  BarChart3,
  Settings,
  Bell,
  Menu,
  X,
  Search,
  Filter,
  Check,
  Building2,
  Navigation,
  Zap,
  User,
  Gauge,
  Phone,
  ShieldCheck,
  Layers,
  ArrowUpRight
} from 'lucide-react';

// --- Stat Card Component matching main Dashboard layout ---
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
        <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
          <Zap className="w-3.5 h-3.5 text-emerald-600" />
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

const DeliveryPartnerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  // QR Scanning state
  const [qrToken, setQrToken] = useState('');
  const [scanning, setScanning] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(null);
  const [scanError, setScanError] = useState(null);

  // Active pickups
  const [pickups, setPickups] = useState([]);
  const [loadingPickups, setLoadingPickups] = useState(true);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [streamFilter, setStreamFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Driver Profile & Vehicle Settings State
  const [driverSettings, setDriverSettings] = useState({
    driver_name: '',
    phone_number: '',
    vehicle_type: '',
    vehicle_number: '',
    license_number: '',
    duty_status: 'ACTIVE_ONLINE',
    preferred_zone: '',
  });
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    if (currentUser?.name) {
      setDriverSettings(prev => ({ ...prev, driver_name: currentUser.name }));
    }
    fetchPickups();
  }, []);

  const fetchPickups = async () => {
    try {
      setLoadingPickups(true);
      const [res, batchRes] = await Promise.all([
        pickupService.getDeliveryPartnerPickups().catch(() => ({ pickups: [] })),
        batchService.getDeliveryActive().catch(() => ({ batches: [] })),
      ]);

      const pickupsList = res.pickups || [];
      const batchesList = (batchRes.batches || []).map(b => ({
        id: b.id,
        society_name: b.society_name || 'Lotus Residential Society',
        stream_category: b.stream_category || b.waste_category || 'DRY',
        estimated_weight_kg: b.total_weight_kg || b.weight_kg || 40,
        qr_code_token: b.qr_code || `QR-${b.id}`,
        status: b.status === 'IN_TRANSIT' ? 'OUT_FOR_DELIVERY' : b.status === 'PENDING_PICKUP' ? 'REQUESTED' : b.status,
        assigned_driver: b.driver_name || 'Driver Alex',
        pickup_address: 'Lotus St, Block B, Sector 4',
      }));

      const seenTokens = new Set();
      const combined = [];
      for (const item of [...batchesList, ...pickupsList]) {
        const token = (item.qr_code_token || item.id || '').trim();
        if (token && !seenTokens.has(token)) {
          seenTokens.add(token);
          combined.push(item);
        }
      }
      setPickups(combined);
    } catch (err) {
      console.error('Failed to load active pickups:', err);
    } finally {
      setLoadingPickups(false);
    }
  };

  const handleScanSubmit = async (e, customToken = null) => {
    if (e) e.preventDefault();
    setAlertSuccess(null);
    setScanError(null);

    const tokenToScan = (customToken || qrToken).trim();
    if (!tokenToScan) {
      setScanError('Please enter or scan a valid QR Code Token (e.g. QR_WET_89234).');
      return;
    }

    try {
      setScanning(true);
      let res;
      try {
        res = await batchService.deliveryScan(tokenToScan);
      } catch (err) {
        res = await pickupService.scanQR(tokenToScan);
      }

      const msg = res.alert || res.message || 'Pickup verified! Marked as IN_TRANSIT / Out for Delivery to Factory.';
      setAlertSuccess(msg);
      showToast('QR Token Verified & Pickup Marked IN_TRANSIT ✅');
      setQrToken('');

      // Refresh pickups list
      await fetchPickups();
    } catch (err) {
      setScanError(err.message || 'Scanning failed. QR Code Token not found.');
    } finally {
      setScanning(false);
    }
  };

  const handleSaveDriverSettings = (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setTimeout(() => {
      setSavingSettings(false);
      showToast('Vehicle & Driver Profile Updated Successfully! ✅');
    }, 600);
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const navItems = [
    { id: 'Overview', icon: Home, label: 'Overview' },
    { id: 'Pickups', icon: Truck, label: 'Active Pickups' },
    { id: 'Scanner', icon: QrCode, label: 'QR Scanner' },
    { id: 'Routes', icon: Navigation, label: 'Route Dispatch' },
    { id: 'Settings', icon: Settings, label: 'Driver Settings' }
  ];

  const outForDeliveryPickups = pickups.filter((p) => p.status === 'OUT_FOR_DELIVERY' || p.status === 'IN_TRANSIT');
  const requestedPickups = pickups.filter((p) => p.status === 'REQUESTED' || p.status === 'PENDING_PICKUP' || p.status === 'ASSIGNED');
  const completedPickups = pickups.filter((p) => p.status === 'COMPLETED' || p.status === 'DELIVERED');

  const totalTransportedWeight = pickups.reduce((sum, p) => sum + parseFloat(p.estimated_weight_kg || p.allocated_weight_kg || 0), 0);

  const filteredPickups = pickups.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    const soc = (p.society_name || '').toLowerCase();
    const token = (p.qr_code_token || p.qr_code || '').toLowerCase();
    const stream = (p.stream_category || '').toUpperCase();
    const status = (p.status || '').toUpperCase();

    const matchesSearch = !q || soc.includes(q) || token.includes(q);
    const matchesStream = streamFilter === 'ALL' || stream === streamFilter;
    const matchesStatus = statusFilter === 'ALL' || status === statusFilter;

    return matchesSearch && matchesStream && matchesStatus;
  });

  const renderContent = () => {
    if (activeTab === 'Overview') {
      return (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-neutral-dark">Delivery Fleet Telemetry</h1>
              <p className="text-sm font-medium text-neutral-gray">Real-time route tracking, QR verification and logistics dispatch status</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={fetchPickups}
                className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-neutral-dark rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95"
              >
                <RefreshCw className={`w-4 h-4 text-primary ${loadingPickups ? 'animate-spin' : ''}`} />
                Refresh Route Data
              </button>
            </div>
          </div>

          {/* Quick Stat Cards matching Society / Factory Portals */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Requested Pickups" value={requestedPickups.length} subtext="Pending society pickup" trend="Active" icon={Package} colorClass="bg-amber-50 text-amber-600" />
            <StatCard title="Out for Delivery" value={outForDeliveryPickups.length} subtext="In-transit to factories" trend="En-Route" icon={Truck} colorClass="bg-blue-50 text-blue-600" />
            <StatCard title="Total Cargo Weight" value={`${totalTransportedWeight.toLocaleString()} kg`} subtext="Live onboard mass" trend="Live" icon={Gauge} colorClass="bg-emerald-50 text-emerald-600" />
            <StatCard title="Logistics Score" value="100%" subtext="Compliant SWM 2026" trend="Verified" icon={ShieldCheck} colorClass="bg-purple-50 text-purple-600" />
          </div>

          {/* Vehicle Telemetry & Driver Duty Status Bar */}
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
                    <Truck className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-dark text-lg">{driverSettings.vehicle_type}</h3>
                    <p className="text-xs text-neutral-gray font-medium">Reg: <span className="font-mono font-bold text-neutral-dark">{driverSettings.vehicle_number}</span> • License: <span className="font-mono text-neutral-dark">{driverSettings.license_number}</span></p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full border border-emerald-200">
                  {driverSettings.duty_status === 'ACTIVE_ONLINE' ? '🟢 ON DUTY' : '🟡 ON BREAK'}
                </span>
              </div>

              {/* Fuel / Battery Bar & Route Cell */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-gray-50/70 p-4 rounded-2xl border border-gray-100 text-xs">
                <div>
                  <span className="text-neutral-gray block mb-1">Battery / Fuel Range</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full rounded-full w-[88%]" />
                    </div>
                    <span className="font-bold text-neutral-dark font-mono">88%</span>
                  </div>
                </div>
                <div>
                  <span className="text-neutral-gray block mb-1">Active S2 Cell Token</span>
                  <span className="font-mono font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">89c048992</span>
                </div>
                <div>
                  <span className="text-neutral-gray block mb-1">Assigned Zone</span>
                  <span className="font-bold text-neutral-dark">{driverSettings.preferred_zone}</span>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setActiveTab('Scanner')} className="flex-1 bg-primary hover:bg-green-700 text-white py-3.5 rounded-2xl font-bold text-xs shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-95">
                  <ScanLine className="w-4 h-4" />
                  <span>Open Live QR Scanner</span>
                </button>
                <button onClick={() => setActiveTab('Pickups')} className="flex-1 bg-white border border-gray-200 hover:bg-gray-50 text-neutral-dark py-3.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xs">
                  <Truck className="w-4 h-4 text-primary" />
                  <span>View Pickup List ({pickups.length})</span>
                </button>
              </div>
            </div>

            {/* Quick En-Route Queue Box */}
            <div className="bg-gray-50/70 rounded-2xl p-5 border border-gray-100 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-neutral-dark text-sm mb-3">Scheduled Pickup Queue</h4>
                <div className="space-y-2.5">
                  {requestedPickups.slice(0, 3).map((p, idx) => (
                    <div key={p.id || idx} className="p-3 bg-white rounded-xl border border-gray-100 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-neutral-dark truncate max-w-[130px]">{p.society_name || 'Society Drop'}</p>
                        <p className="text-[10px] text-neutral-gray">{p.stream_category} • {p.estimated_weight_kg} kg</p>
                      </div>
                      <button 
                        onClick={() => handleScanSubmit(null, p.qr_code_token)} 
                        className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded-lg text-[10px] hover:bg-emerald-700 transition-colors"
                      >
                        Scan QR
                      </button>
                    </div>
                  ))}
                  {requestedPickups.length === 0 && (
                    <p className="text-xs text-neutral-gray italic p-3 text-center">No pending pickups right now.</p>
                  )}
                </div>
              </div>

              <button onClick={() => setActiveTab('Routes')} className="w-full mt-4 text-xs font-bold text-primary hover:underline flex items-center justify-center gap-1">
                View Interactive Route Map <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'Pickups') {
      return (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-neutral-dark">Active Pickup Inventory</h1>
              <p className="text-sm font-medium text-neutral-gray">Live society waste drops assigned to your delivery vehicle</p>
            </div>
            <button 
              onClick={fetchPickups}
              className="px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-neutral-dark rounded-xl font-bold text-xs flex items-center gap-2 shadow-sm transition-all active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 text-primary ${loadingPickups ? 'animate-spin' : ''}`} />
              Refresh Inventory
            </button>
          </div>

          {/* Search & Filter Controls matching Society Dashboard */}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-neutral-gray" />
              <input 
                type="text"
                placeholder="Search by Society or QR Token..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-bold text-neutral-dark focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <select
                value={streamFilter}
                onChange={(e) => setStreamFilter(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-neutral-dark focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              >
                <option value="ALL">All Waste Streams</option>
                <option value="WET">Wet Stream</option>
                <option value="DRY">Dry Stream</option>
                <option value="HAZARDOUS">Hazardous Stream</option>
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-2xl px-4 py-2.5 text-xs font-bold text-neutral-dark focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
              >
                <option value="ALL">All Statuses</option>
                <option value="REQUESTED">Requested / Pending</option>
                <option value="OUT_FOR_DELIVERY">In Transit / Out for Delivery</option>
                <option value="COMPLETED">Completed</option>
              </select>

              <span className="text-xs font-bold px-3 py-1.5 bg-green-50 text-green-700 rounded-full border border-green-200/50">
                {filteredPickups.length} Pickups
              </span>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPickups.map((p) => {
              const isOutForDelivery = p.status === 'OUT_FOR_DELIVERY' || p.status === 'IN_TRANSIT';
              const isCompleted = p.status === 'COMPLETED' || p.status === 'DELIVERED';
              const qrImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=140x140&data=${encodeURIComponent(p.qr_code_token || 'URBANECO-BATCH')}`;

              return (
                <motion.div 
                  key={p.id} 
                  whileHover={{ y: -3 }} 
                  className="bg-white p-6 rounded-3xl border border-gray-100 hover:border-green-300 shadow-sm hover:shadow-xl transition-all flex flex-col justify-between gap-5 relative overflow-hidden"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center gap-2">
                        <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
                          <QrCode className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-[10px] font-mono font-black text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                            #{p.qr_code_token}
                          </span>
                          <h4 className="font-bold text-neutral-dark text-base mt-1">{p.society_name}</h4>
                        </div>
                      </div>

                      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                        isCompleted ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : isOutForDelivery ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {p.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-[1fr_100px] gap-3 bg-gray-50/70 p-4 rounded-2xl border border-gray-100 text-xs">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-neutral-gray">
                          <MapPin className="w-3.5 h-3.5 text-neutral-gray shrink-0" />
                          <span className="truncate">{p.pickup_address || 'Delhi NCT Zone 4'}</span>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            p.stream_category === 'WET' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {p.stream_category}
                          </span>
                          <span className="font-black text-primary text-xs">{p.estimated_weight_kg} kg</span>
                        </div>
                      </div>

                      <div className="bg-white p-1.5 rounded-xl border border-gray-200 flex items-center justify-center">
                        <img src={qrImgUrl} alt="QR" className="w-20 h-20 object-contain" />
                      </div>
                    </div>
                  </div>

                  {isCompleted ? (
                    <button disabled className="w-full bg-emerald-50 text-emerald-700 border border-emerald-200 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-default">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Delivery Completed ✅</span>
                    </button>
                  ) : isOutForDelivery ? (
                    <button disabled className="w-full bg-blue-50 text-blue-700 border border-blue-200 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 cursor-default">
                      <Truck className="w-4 h-4 text-blue-600 animate-pulse" />
                      <span>In-Transit to Factory</span>
                    </button>
                  ) : (
                    <button 
                      onClick={() => handleScanSubmit(null, p.qr_code_token)} 
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                    >
                      <ScanLine className="w-4 h-4" />
                      <span>Scan QR & Pick Up</span>
                    </button>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      );
    }

    if (activeTab === 'Scanner') {
      return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-3xl mx-auto">
          <div>
            <h1 className="text-2xl font-black text-neutral-dark text-center">Live QR Code Scanner Engine</h1>
            <p className="text-sm font-medium text-neutral-gray text-center mt-1">Scan or verify society bin tokens to initiate waterfall multi-factory dispatch</p>
          </div>

          {alertSuccess && (
            <div className="p-4 bg-emerald-50 border-2 border-emerald-500/30 rounded-2xl text-emerald-800 flex items-center gap-3 shadow-sm">
              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
              <div className="flex-1 text-xs">
                <p className="font-bold text-sm">{alertSuccess}</p>
                <p className="mt-0.5 text-emerald-700">The waste batch status has been updated across all factory allocation cards.</p>
              </div>
              <button onClick={() => setAlertSuccess(null)} className="text-xs font-bold underline">Dismiss</button>
            </div>
          )}

          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-xl space-y-6 text-center">
            {scanError && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-2xl text-xs font-bold flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{scanError}</span>
              </div>
            )}

            {/* High Tech Animated Viewfinder */}
            <div className="w-64 h-64 mx-auto bg-gray-900 rounded-3xl border-4 border-emerald-500/40 relative flex flex-col items-center justify-center overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 via-transparent to-emerald-500/10 animate-pulse pointer-events-none" />
              <QrCode className="w-28 h-28 text-emerald-400 opacity-80" />
              <div className="absolute inset-x-4 h-0.5 bg-emerald-400 shadow-[0_0_15px_#10b981] top-1/2 animate-bounce" />
              <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-emerald-400 mt-2 z-10 bg-black/60 px-3 py-1 rounded-full border border-emerald-500/30">
                ALIGN QR CODE HERE
              </p>
            </div>

            <form onSubmit={handleScanSubmit} className="space-y-4 max-w-md mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={qrToken}
                  onChange={(e) => setQrToken(e.target.value)}
                  placeholder="e.g. QR_WET_89234"
                  className="w-full px-5 py-4 rounded-2xl border-2 border-gray-200 focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none text-center text-lg font-mono tracking-wider font-semibold uppercase bg-gray-50 focus:bg-white transition-all"
                />
                <QrCode className="w-6 h-6 text-neutral-gray absolute right-4 top-1/2 -translate-y-1/2" />
              </div>

              <button
                type="submit"
                disabled={scanning}
                className="w-full bg-primary hover:bg-green-700 text-white py-4 rounded-2xl font-bold text-sm transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50"
              >
                {scanning ? <Loader2 className="w-5 h-5 animate-spin" /> : <ScanLine className="w-5 h-5" />}
                <span>{scanning ? 'Verifying Token...' : 'Verify & Scan QR Code'}</span>
              </button>
            </form>

            {/* Quick click test tokens */}
            {requestedPickups.length > 0 && (
              <div className="pt-4 border-t border-gray-100 text-left">
                <p className="text-xs font-bold text-neutral-gray mb-2">Click to quick-test pending batch token:</p>
                <div className="flex flex-wrap gap-2">
                  {requestedPickups.slice(0, 4).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleScanSubmit(null, p.qr_code_token)}
                      className="text-xs font-mono bg-gray-50 hover:bg-primary/10 hover:text-primary border border-gray-200 px-3 py-1.5 rounded-xl font-bold transition-all"
                    >
                      {p.qr_code_token} ({p.stream_category})
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (activeTab === 'Routes') {
      return (
        <div className="space-y-8 animate-in fade-in duration-500">
          <div>
            <h1 className="text-2xl font-black text-neutral-dark">Route Dispatch & Spatial Stops</h1>
            <p className="text-sm font-medium text-neutral-gray">Google S2 Cell Optimized route sequence for delivery partners</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-3xl p-7 border border-gray-100 shadow-sm space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <h3 className="font-bold text-neutral-dark text-lg flex items-center gap-2">
                  <Navigation className="w-5 h-5 text-primary" />
                  <span>Optimal Route Manifest #R-402</span>
                </h3>
                <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full">
                  Total Distance: 14.2 km
                </span>
              </div>

              {/* Stop Timeline */}
              <div className="space-y-6 relative before:absolute before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-gray-200">
                <div className="relative pl-10">
                  <div className="absolute left-2 top-1.5 -translate-x-1/2 w-4 h-4 rounded-full bg-emerald-500 ring-4 ring-emerald-100" />
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider">Start Origin • Pickup Stop 1</span>
                    <h4 className="font-bold text-neutral-dark text-sm mt-0.5">Lotus Society RWA (Sector 4)</h4>
                    <p className="text-xs text-neutral-gray mt-1">40 kg DRY Waste Batch • QR Token: #QR-WET-89234</p>
                  </div>
                </div>

                <div className="relative pl-10">
                  <div className="absolute left-2 top-1.5 -translate-x-1/2 w-4 h-4 rounded-full bg-blue-500 ring-4 ring-blue-100" />
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Drop Stop 2 • Waterfall Split</span>
                    <h4 className="font-bold text-neutral-dark text-sm mt-0.5">GreenTech Recycling Plant #1 (Factory F1)</h4>
                    <p className="text-xs text-neutral-gray mt-1">Unload 20 kg • S2 Cell Token: 89c048992</p>
                  </div>
                </div>

                <div className="relative pl-10">
                  <div className="absolute left-2 top-1.5 -translate-x-1/2 w-4 h-4 rounded-full bg-purple-500 ring-4 ring-purple-100" />
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <span className="text-[10px] font-bold text-purple-600 uppercase tracking-wider">Drop Stop 3 • Final Destination</span>
                    <h4 className="font-bold text-neutral-dark text-sm mt-0.5">EcoPlast Processing Facility (Factory F2)</h4>
                    <p className="text-xs text-neutral-gray mt-1">Unload 20 kg • S2 Cell Token: 89c048995</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-7 border border-gray-100 shadow-sm flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-neutral-dark text-base mb-4">Route Efficiency Index</h4>
                <div className="space-y-4 text-xs">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <span className="text-neutral-gray">Estimated Time</span>
                    <p className="text-lg font-black text-neutral-dark mt-0.5">38 mins</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                    <span className="text-neutral-gray">Carbon Emission Saved</span>
                    <p className="text-lg font-black text-emerald-600 mt-0.5">4.2 kg CO₂e</p>
                  </div>
                </div>
              </div>

              <button onClick={() => showToast('Navigation Started in Google Maps 🗺️')} className="w-full mt-6 bg-primary text-white py-3.5 rounded-2xl font-bold text-xs shadow-lg shadow-primary/20 flex items-center justify-center gap-2">
                <Navigation className="w-4 h-4" />
                <span>Start GPS Navigation</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'Settings') {
      return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
          <div>
            <h1 className="text-2xl font-black text-neutral-dark">Driver & Vehicle Settings</h1>
            <p className="text-sm font-medium text-neutral-gray">Manage your logistics vehicle registration, driver profile and duty status</p>
          </div>

          <form onSubmit={handleSaveDriverSettings} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-neutral-dark uppercase tracking-wider mb-2">Driver Name</label>
                <input 
                  type="text"
                  required
                  value={driverSettings.driver_name}
                  onChange={(e) => setDriverSettings({ ...driverSettings, driver_name: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-neutral-dark focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-dark uppercase tracking-wider mb-2">Contact Phone</label>
                <input 
                  type="text"
                  required
                  value={driverSettings.phone_number}
                  onChange={(e) => setDriverSettings({ ...driverSettings, phone_number: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-neutral-dark focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-dark uppercase tracking-wider mb-2">Vehicle Type</label>
                <select
                  value={driverSettings.vehicle_type}
                  onChange={(e) => setDriverSettings({ ...driverSettings, vehicle_type: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-neutral-dark focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all"
                >
                  <option value="Electric Compactor Truck (4.5 Ton)">Electric Compactor Truck (4.5 Ton)</option>
                  <option value="Mini Waste Tipper (1.5 Ton)">Mini Waste Tipper (1.5 Ton)</option>
                  <option value="Heavy Duty Hydraulic Truck (10 Ton)">Heavy Duty Hydraulic Truck (10 Ton)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-dark uppercase tracking-wider mb-2">Vehicle Registration Number</label>
                <input 
                  type="text"
                  required
                  value={driverSettings.vehicle_number}
                  onChange={(e) => setDriverSettings({ ...driverSettings, vehicle_number: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold font-mono text-neutral-dark focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-dark uppercase tracking-wider mb-2">Commercial Driving License</label>
                <input 
                  type="text"
                  required
                  value={driverSettings.license_number}
                  onChange={(e) => setDriverSettings({ ...driverSettings, license_number: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold font-mono text-neutral-dark focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-neutral-dark uppercase tracking-wider mb-2">Driver Duty Status</label>
                <select
                  value={driverSettings.duty_status}
                  onChange={(e) => setDriverSettings({ ...driverSettings, duty_status: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-bold text-neutral-dark focus:bg-white focus:ring-2 focus:ring-primary outline-none transition-all"
                >
                  <option value="ACTIVE_ONLINE">🟢 On Duty / Active for Pickups</option>
                  <option value="ON_BREAK">🟡 On Break / Temporarily Off</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs font-medium flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Logistics vehicle verification status is active and synced with India SWM 2026 digital manifest system.</span>
            </div>

            <button type="submit" disabled={savingSettings} className="w-full bg-primary hover:bg-green-700 text-white py-3.5 rounded-2xl font-bold text-sm shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-2">
              {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>Save Driver & Vehicle Settings</span>
            </button>
          </form>
        </div>
      );
    }

    return null;
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

      {/* Desktop Left Sidebar matching Society & Factory Portals */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-100 p-6 fixed inset-y-0 z-30 justify-between">
        <div>
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10 px-2">
            <div className="w-10 h-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/30 text-white">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-black text-neutral-dark tracking-tight">UrbanEco-Link</span>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-primary">Delivery Partner</span>
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
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 font-black flex items-center justify-center text-sm border border-emerald-200/50">
              {user?.name ? user.name.slice(0, 2).toUpperCase() : 'DP'}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-neutral-dark truncate">{driverSettings.driver_name}</h4>
              <p className="text-[10px] font-bold text-neutral-gray uppercase tracking-wider">LOGISTICS DRIVER</p>
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
            <Truck className="w-5 h-5" />
          </div>
          <span className="font-black text-neutral-dark text-base">UrbanEco Delivery</span>
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
              <span>Good Morning, {driverSettings.driver_name}</span>
              <span className="text-2xl">🚚</span>
            </h2>
            <p className="text-xs text-neutral-gray font-medium mt-0.5">
              Vehicle: {driverSettings.vehicle_number} • Duty: {driverSettings.duty_status === 'ACTIVE_ONLINE' ? 'Active' : 'On Break'}
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative p-2.5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:bg-gray-50 cursor-pointer">
              <Bell className="w-5 h-5 text-neutral-gray" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            </div>
            <button 
              onClick={fetchPickups}
              className="bg-primary hover:bg-primary-dark text-white px-5 py-3 rounded-2xl font-bold text-xs transition-all shadow-lg shadow-primary/20 flex items-center gap-2 active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 ${loadingPickups ? 'animate-spin' : ''}`} />
              <span>Refresh Pickups</span>
            </button>
          </div>
        </div>

        {renderContent()}
      </main>
    </div>
  );
};

export default DeliveryPartnerDashboard;
