import React, { useState, useEffect } from 'react';
import civicService from '../services/civicService';
import pickupService from '../services/pickupService';
import taskService from '../services/taskService';
import { 
  Leaf, 

  Home, 
  ClipboardList, 
  Truck, 
  CheckCircle, 
  BarChart3, 
  Settings, 
  LogOut, 
  Bell, 
  Plus, 
  Search, 
  Filter, 
  ChevronRight, 
  MapPin, 
  Package, 
  Target, 
  Calendar, 
  QrCode, 
  Upload, 
  Camera, 
  X, 
  MoreVertical,
  ArrowRight,
  Info,
  Clock,
  ShieldCheck,
  Building2,
  Phone,
  Mail,
  FileText,
  Globe,
  Layout,
  User,
  Eye,
  EyeOff,
  Users,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  Legend 
} from 'recharts';

// --- DATA ---
const STATS = [
  { id: 1, label: 'Active Subscriptions', value: '0', icon: <ClipboardList className="w-5 h-5" />, color: 'bg-blue-50 text-blue-600' },
  { id: 2, label: 'Collected This Month', value: '0 kg', icon: <Leaf className="w-5 h-5" />, color: 'bg-green-50 text-green-600' },
  { id: 3, label: 'Pending Pickups', value: '0', icon: <Truck className="w-5 h-5" />, color: 'bg-orange-50 text-orange-600' },
  { id: 4, label: 'Monthly Quota Used', value: '0%', icon: <Target className="w-5 h-5" />, color: 'bg-purple-50 text-purple-600' },
];

const QUOTAS = [];
const UPCOMING_PICKUPS = [];
const RECENT_VERIFICATIONS = [];

// --- COMPONENTS ---

const Modal = ({ isOpen, onClose, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          <div className="p-6">
            {children}
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);

const Toast = ({ message, type = 'success', isVisible, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => onClose(), 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3"
        >
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
          <span className="font-medium">{message}</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const Toggle = ({ enabled, onChange }) => (
  <button 
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${enabled ? 'bg-green-600' : 'bg-gray-200'}`}
  >
    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-6' : 'translate-x-1'}`} />
  </button>
);

const OrgPortal = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: '' });

  // Live Backend Data States
  const [liveReports, setLiveReports] = useState([]);
  const [livePickups, setLivePickups] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrgData = async () => {
    try {
      setLoading(true);
      const [reportsRes, pickupsRes] = await Promise.all([
        civicService.getReports().catch(() => ({ reports: [] })),
        pickupService.getAdminPickups().catch(() => ({ pickups: [] })),
      ]);
      setLiveReports(reportsRes.reports || []);
      setLivePickups(pickupsRes.pickups || []);
    } catch (err) {
      console.error('Failed to load org portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgData();
  }, []);

  // Modal States

  const [isQuotaModalOpen, setIsQuotaModalOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isProofModalOpen, setIsProofModalOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [activeSettingsTab, setActiveSettingsTab] = useState('profile');
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedSociety, setSelectedSociety] = useState(null);

  // Settings States
  const [notifications, setNotifications] = useState({
    batchNew: true,
    batchQR: true,
    pickupReminder: true,
    emergencyPickup: true,
    pickupConfirmed: true,
    batchExpired: true,
    quota80: true,
    quotaFull: true,
    newSociety: false
  });

  const [geoFenceSettings, setGeoFenceSettings] = useState({
    organic: 8,
    recyclable: 12
  });

  const [securityForm, setSecurityForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    showCurrent: false,
    showNew: false,
    showConfirm: false,
    twoFactor: false
  });

  // Form States
  const [quotaValue, setQuotaValue] = useState(500);
  const [radiusValue, setRadiusValue] = useState(8);
  const [priority, setPriority] = useState('Medium');
  const [scanning, setScanning] = useState(false);
  const [verificationData, setVerificationData] = useState(null);

  const showToast = (message) => setToast({ visible: true, message });

  const navItems = [
    { id: 'overview', label: 'Overview', icon: <Home className="w-5 h-5" /> },
    { id: 'subscriptions', label: 'Subscriptions', icon: <ClipboardList className="w-5 h-5" /> },
    { id: 'pickups', label: 'Pickups', icon: <Truck className="w-5 h-5" /> },
    { id: 'verify', label: 'Verify Waste', icon: <CheckCircle className="w-5 h-5" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> },
  ];

  const handleSimulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setIsScanModalOpen(false);
      showToast('Batch #2024-091 Verified! 162 kg Organic Waste confirmed.');
    }, 2000);
  };

  const renderSubscriptions = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Subscription Manager</h2>
          <p className="text-gray-500">Set your monthly waste resource quotas</p>
        </div>
        <button 
          onClick={() => showToast('Form to add new subscriptions will be available soon.')}
          className="bg-green-600 text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-green-700 transition-all flex items-center gap-2 w-fit">
          <Plus className="w-5 h-5" /> Add New Subscription
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {QUOTAS.slice(0, 2).map((quota) => (
          <div key={quota.id} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-green-300 transition-all">
            <div className="flex justify-between items-start mb-6">
              <span className="text-4xl">{quota.icon}</span>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wider">Active</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{quota.type}</h3>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Monthly Quota</span>
                <span className="font-bold text-gray-900">{quota.limit} kg/month</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Collection Radius</span>
                <span className="font-bold text-gray-900">{quota.id === 1 ? '8 km' : '12 km'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subscribed Societies</span>
                <span className="font-bold text-green-600 underline cursor-pointer">{quota.subscribed.length}</span>
              </div>
              <div className="flex justify-between text-sm pt-4 border-t border-gray-50">
                <span className="text-gray-400">Renewal Date</span>
                <span className="text-gray-500 font-medium">1 Apr 2026</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => setIsQuotaModalOpen(true)}
                className="py-2.5 border-2 border-green-600 text-green-600 rounded-xl font-bold text-sm hover:bg-green-50 transition-colors"
              >
                Edit Quota
              </button>
              <button className="py-2.5 border-2 border-green-600 text-green-600 rounded-xl font-bold text-sm hover:bg-green-50 transition-colors">
                View Societies
              </button>
            </div>
          </div>
        ))}
        
        <div className="bg-gray-50/50 border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-gray-50 transition-colors group">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border-2 border-green-200 mb-3 group-hover:scale-110 transition-transform">
            <Plus className="w-6 h-6 text-green-600" />
          </div>
          <h4 className="font-bold text-gray-900">Subscribe to new waste type</h4>
          <p className="text-xs text-gray-500 mt-1 max-w-[180px]">Expand your collection range to more materials</p>
          <button className="mt-4 py-2 px-6 bg-green-600 text-white rounded-full font-bold text-sm">Add Subscription</button>
        </div>
      </div>

      <div className="bg-green-50/50 p-6 rounded-2xl border border-green-100 flex gap-4">
        <div className="p-3 bg-white rounded-xl shadow-sm h-fit">
          <Info className="w-6 h-6 text-green-600" />
        </div>
        <div>
          <h4 className="font-bold text-green-800">How Subscriptions Work</h4>
          <p className="text-green-700 text-sm mt-1 leading-relaxed">
            When a subscribed society's bin reaches 80% capacity, a batch is automatically created and assigned to you based on proximity and remaining quota. You will be notified instantly via the app and email.
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Geo-Fence Configuration</h3>
        <p className="text-sm text-gray-500 mb-6">Define collection radius per waste type</p>
        <div className="divide-y divide-gray-100">
          <div className="py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-xl">🌱</span>
              <span className="font-bold text-gray-800">Organic</span>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-sm font-bold text-gray-600 px-3 py-1 bg-gray-100 rounded-lg">8 km radius</span>
              <button className="text-sm font-bold text-green-600 hover:underline">Edit</button>
            </div>
          </div>
          <div className="py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-xl">♻️</span>
              <span className="font-bold text-gray-800">Recyclable</span>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-sm font-bold text-gray-600 px-3 py-1 bg-gray-100 rounded-lg">12 km radius</span>
              <button className="text-sm font-bold text-green-600 hover:underline">Edit</button>
            </div>
          </div>
          <div className="py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <span className="text-xl opacity-30">🗑️</span>
              <span className="font-bold text-gray-400">Non-Recyclable</span>
            </div>
            <div className="flex items-center gap-6">
              <span className="text-sm font-bold text-gray-300 px-3 py-1 bg-gray-50 border border-gray-100 rounded-lg">Not subscribed</span>
              <span className="text-sm font-bold text-gray-300">—</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderPickups = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pickup Management</h2>
          <p className="text-gray-500">All scheduled and completed collections</p>
        </div>
        <div className="flex items-center gap-2 p-1 bg-white border border-gray-200 rounded-xl">
          <button className="px-4 py-2 text-sm font-bold text-green-600 bg-green-50 rounded-lg">This Week</button>
          <button className="px-4 py-2 text-sm font-bold text-gray-500 hover:bg-gray-50 rounded-lg">This Month</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Pickups', value: '31', icon: <Truck className="w-5 h-5" />, color: 'bg-green-50 text-green-600' },
          { label: 'Completed', value: '28', icon: <CheckCircle className="w-5 h-5" />, color: 'bg-blue-50 text-blue-600' },
          { label: 'Upcoming', value: '3', icon: <Calendar className="w-5 h-5" />, color: 'bg-orange-50 text-orange-600' },
          { label: 'Awaiting Scan', value: '1', icon: <QrCode className="w-5 h-5" />, color: 'bg-purple-50 text-purple-600' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <div className={`p-2 rounded-lg w-fit mb-3 ${stat.color}`}>{stat.icon}</div>
            <div className="text-xl font-bold text-gray-900 uppercase tracking-tight">{stat.value}</div>
            <div className="text-xs font-medium text-gray-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Upcoming Pickups</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {UPCOMING_PICKUPS.map((pickup, i) => (
            <div key={pickup.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm flex flex-col">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg leading-tight">{pickup.society}</h4>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3" /> Gurugram, Sector 45
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${pickup.statusColor}`}>
                    {pickup.status}
                  </span>
                </div>
                
                <div className="flex gap-2 mb-4">
                  <span className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-[10px] font-bold">{pickup.type}</span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-[10px] font-bold">~{pickup.weight}</span>
                  <span className="px-2 py-1 bg-gray-100 text-gray-400 font-mono text-[10px]">{pickup.batch}</span>
                </div>

                <div className="space-y-2 py-3 border-t border-gray-50">
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Clock className="w-3.5 h-3.5" /> <span>{pickup.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <Target className="w-3.5 h-3.5" /> <span>Distance: {i === 0 ? '2.3 km' : i === 1 ? '4.1 km' : '6.8 km'}</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-50">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">Collection Progress</p>
                   <div className="flex items-center justify-between px-1">
                     {[1, 2, 3, 4, 5].map((s) => (
                       <div key={s} className={`w-2 h-2 rounded-full ${s <= (i === 0 ? 3 : 1) ? 'bg-green-500' : 'bg-gray-200'}`} />
                     ))}
                   </div>
                   <div className="w-full h-1 bg-gray-100 rounded-full mt-1 overflow-hidden relative">
                      <div className={`absolute left-0 top-0 h-full bg-green-500`} style={{ width: `${(i === 0 ? 3 : 1) / 5 * 100}%` }} />
                   </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50/50 border-t border-gray-100">
                <button 
                  onClick={() => setIsScanModalOpen(true)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                >
                  <QrCode className="w-5 h-5" /> Scan QR on Arrival
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex items-center justify-between">
          <h3 className="text-lg font-bold text-gray-900">Pickup History</h3>
          <div className="flex items-center gap-4">
            <div className="flex rounded-lg border border-gray-200 p-1">
               {['All', 'This Week', 'This Month'].map(t => (
                 <button key={t} className={`px-3 py-1.5 text-xs font-bold rounded-md ${t === 'All' ? 'bg-gray-900 text-white' : 'text-gray-500 hover:bg-gray-50'}`}>{t}</button>
               ))}
            </div>
            <button className="p-2 text-gray-400 hover:text-gray-900 rounded-lg border border-gray-200"><Filter className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Society</th>
                <th className="px-6 py-4">Waste Type</th>
                <th className="px-6 py-4">Weight</th>
                <th className="px-6 py-4">Batch ID</th>
                <th className="px-6 py-4">QR Verified</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {[...Array(8)].map((_, i) => (
                <tr key={i} className="hover:bg-gray-50/30 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-900">2{i} Mar 2026</p>
                    <p className="text-[10px] text-gray-400">10:4{i} AM</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-gray-700">{i % 2 === 0 ? 'Raghuma Hostel' : 'Green Valley'}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded text-[10px] font-bold uppercase">{i % 3 === 0 ? 'Recyclable' : 'Organic'}</span>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm">{150 + i * 5}kg</td>
                  <td className="px-6 py-4 font-mono text-xs text-gray-400">#2024-0{80 + i}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-green-600 font-bold text-[10px]">
                      <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center"><CheckCircle className="w-2.5 h-2.5" /></div>
                      VERIFIED
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-bold">COMPLETED</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-xs font-bold text-green-600 hover:underline">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );

  const renderVerify = () => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Waste Verification</h2>
          <p className="text-gray-500">Upload proof after processing waste into new products</p>
        </div>
      </div>

      <div className="bg-green-50/50 p-6 rounded-2xl border border-green-100 flex gap-4">
        <div className="p-3 bg-white rounded-xl shadow-sm h-fit">
          <Info className="w-6 h-6 text-green-600" />
        </div>
        <div className="flex-1">
          <p className="text-green-700 text-sm leading-relaxed">
            <span className="font-bold">Pro Tip:</span> After processing collected waste into a final product (fertilizer, road material, etc.), upload proof photos here. This completes the traceability chain and is visible on the public Impact Feed.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Awaiting Verification (2)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { id: 1, batch: '#2024-088', type: 'Organic Waste', weight: '160 kg', society: 'Raghuma Hostel', date: '25 Mar 2026', status: 'Pending Proof Upload' },
            { id: 2, batch: '#2024-085', type: 'Non-Recyclable', weight: '170 kg', society: 'Green Valley Apts', date: '24 Mar 2026', status: 'Pending Proof Upload' }
          ].map((item) => (
            <div key={item.id} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:border-orange-200 transition-all">
              <div className="flex justify-between items-start mb-4">
                <span className="px-2 py-0.5 bg-orange-50 text-orange-600 rounded text-[10px] font-bold border border-orange-100 uppercase tracking-wider">{item.status}</span>
                <span className="text-[10px] font-mono text-gray-400">{item.batch}</span>
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-1">{item.type} • {item.weight}</h4>
              <p className="text-sm text-gray-500 mb-6 font-medium">Collected from: <span className="text-gray-700">{item.society}</span> on {item.date}</p>
              <button 
                onClick={() => { setVerificationData(item); setIsUploadModalOpen(true); }}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-orange-500/20 shadow-md transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" /> Upload Proof
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <h3 className="text-lg font-bold text-gray-900">Verified Batches</h3>
        </div>
        <div className="divide-y divide-gray-50">
          {RECENT_VERIFICATIONS.map((item, i) => (
            <div key={i} className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50/30 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${i % 2 === 0 ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                   {i % 2 === 0 ? '🌱' : '♻️'}
                </div>
                <div>
                   <div className="flex items-center gap-2">
                     <h4 className="font-bold text-gray-900">Batch #2024-0{70-i}</h4>
                     <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded text-[9px] font-bold uppercase">{item.type}</span>
                   </div>
                   <p className="text-xs text-gray-500 mt-0.5">{item.society} • {item.weight} processed</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-6">
                <div className="text-left md:text-right min-w-[120px]">
                   <p className="text-[10px] text-gray-400 font-bold uppercase">Final Product</p>
                   <p className="text-sm font-bold text-gray-700">{i % 3 === 0 ? 'Compost Fertilizer' : i % 3 === 1 ? 'Plastic Pellets' : 'Biogas'}</p>
                </div>
                <div className="text-left md:text-right min-w-[80px]">
                   <p className="text-[10px] text-gray-400 font-bold uppercase">Output</p>
                   <p className="text-sm font-bold text-gray-700">{40 + i*2} kg</p>
                </div>
                <div className="flex flex-col items-end gap-1.5 min-w-[100px]">
                   <span className="px-2 py-1 bg-green-50 text-green-600 rounded-full text-[10px] font-bold flex items-center gap-1 border border-green-100"><CheckCircle className="w-3 h-3" /> VERIFIED</span>
                   <button onClick={() => setIsProofModalOpen(true)} className="text-[10px] font-bold text-green-600 hover:underline">View Proof</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  const renderAnalytics = () => {
    const barData = [
      { name: 'Mar 01', organic: 120, recyclable: 80 },
      { name: 'Mar 05', organic: 150, recyclable: 100 },
      { name: 'Mar 10', organic: 180, recyclable: 120 },
      { name: 'Mar 15', organic: 140, recyclable: 90 },
      { name: 'Mar 20', organic: 210, recyclable: 140 },
      { name: 'Mar 25', organic: 190, recyclable: 130 },
      { name: 'Today', organic: 162, recyclable: 110 },
    ];

    const pieData = [
      { name: 'Raghuma Hostel', value: 42 },
      { name: 'Green Valley Apts', value: 35 },
      { name: 'Sunrise RWA', value: 23 },
    ];
    
    const COLORS = ['#16A34A', '#3B82F6', '#F59E0B'];

    const lineData = [
      { name: 'Week 1', quota: 500, actual: 420 },
      { name: 'Week 2', quota: 500, actual: 460 },
      { name: 'Week 3', quota: 500, actual: 490 },
      { name: 'Week 4', quota: 500, actual: 462 },
    ];

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analytics</h2>
            <p className="text-gray-500">Track your environmental impact and processing efficiency</p>
          </div>
          <div className="flex items-center gap-2 p-1 bg-white border border-gray-200 rounded-xl">
            {['This Week', 'This Month', 'This Year'].map(t => (
              <button key={t} className={`px-4 py-2 text-sm font-bold rounded-lg ${t === 'This Month' ? 'bg-green-600 text-white' : 'text-gray-500 hover:bg-gray-50 transition-colors'}`}>{t}</button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total Collected', value: '462 kg', icon: <Package className="w-5 h-5" />, color: 'bg-green-50 text-green-600' },
            { label: 'Products Created', value: '3 types', icon: <Building2 className="w-5 h-5" />, color: 'bg-blue-50 text-blue-600' },
            { label: 'Avg Per Pickup', value: '16.5 kg', icon: <Target className="w-5 h-5" />, color: 'bg-orange-50 text-orange-600' },
            { label: 'CO2 Offset', value: '924 kg', icon: <Leaf className="w-5 h-5" />, color: 'bg-purple-50 text-purple-600' },
          ].map((stat, i) => (
            <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
               <div className={`p-3 rounded-xl w-fit mb-4 ${stat.color}`}>{stat.icon}</div>
               <h4 className="text-2xl font-bold text-gray-900 font-mono tracking-tight">{stat.value}</h4>
               <p className="text-sm font-medium text-gray-400 uppercase tracking-widest mt-1">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-6">Monthly Collection Trends</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 500, fill: '#9ca3af' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 500, fill: '#9ca3af' }} />
                  <Tooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }} />
                  <Bar dataKey="organic" fill="#16A34A" radius={[4, 4, 0, 0]} barSize={20} />
                  <Bar dataKey="recyclable" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={20} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-6">Society Contribution Mix</h3>
            <div className="h-[300px] w-full flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px', fontWeight: 'bold' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-6">Quota Utilization Status</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 500, fill: '#9ca3af' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 500, fill: '#9ca3af' }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="quota" stroke="#e5e7eb" strokeWidth={2} strokeDasharray="5 5" dot={false} />
                  <Line type="monotone" dataKey="actual" stroke="#16A34A" strokeWidth={4} dot={{ r: 6, fill: '#16A34A', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col">
            <h3 className="font-bold text-gray-800 mb-6">Impact Insights</h3>
            <div className="space-y-4 flex-1">
               {[
                 { title: 'Processing Peak', desc: 'Your collection reached its highest ever peak last Tuesday with 82kg.', icon: <BarChart3 className="w-4 h-4" color="#16A34A" /> },
                 { title: 'Top Contributor', desc: 'Raghuma Hostel remains your most consistent partner with 98% quality rate.', icon: <ShieldCheck className="w-4 h-4" color="#3B82F6" /> },
                 { title: 'New Goal Set', desc: 'You are on track to save 1.5 tons of CO2 by end of Q2.', icon: <Target className="w-4 h-4" color="#F59E0B" /> }
               ].map((ins, i) => (
                 <div key={i} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="flex items-center gap-2 mb-1">
                       {ins.icon}
                       <h4 className="text-sm font-bold text-gray-800">{ins.title}</h4>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed font-medium">{ins.desc}</p>
                 </div>
               ))}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderSettings = () => {
    const settingsTabs = [
      { id: 'profile', label: 'Organization Profile', icon: <Building2 className="w-4 h-4" /> },
      { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
      { id: 'geofence', label: 'Geo-Fence Settings', icon: <Target className="w-4 h-4" /> },
      { id: 'societies', label: 'Subscribed Societies', icon: <Users className="w-4 h-4" /> },
      { id: 'security', label: 'Security', icon: <ShieldCheck className="w-4 h-4" /> },
      { id: 'documents', label: 'Documents & Certifications', icon: <FileText className="w-4 h-4" /> },
    ];

    const renderContent = () => {
      switch (activeSettingsTab) {
        case 'profile':
          return (
            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Organization Profile</h3>
                <p className="text-sm text-gray-500">Manage your organization's public information and processing details</p>
              </div>
              <form className="space-y-6 max-w-2xl" onSubmit={(e) => { e.preventDefault(); showToast('Profile updated successfully ✅'); }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Org Name</label>
                    <input type="text" defaultValue="GreenSoil Fertilizers" className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 text-sm font-bold outline-none focus:border-green-500 transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Org Type</label>
                    <select className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 text-sm font-bold outline-none focus:border-green-500 transition-colors">
                      <option>Fertilizer Plant</option>
                      <option>Construction Firm</option>
                      <option>NGO</option>
                      <option>Municipal Authority</option>
                      <option>Recycling Plant</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Registration Number</label>
                    <input type="text" defaultValue="REG-2024-88912" className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 text-sm font-bold outline-none focus:border-green-500 transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Processing Capacity</label>
                    <input type="text" defaultValue="500 kg/month" className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 text-sm font-bold outline-none focus:border-green-500 transition-colors" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">City</label>
                    <input type="text" defaultValue="Greater Noida" className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 text-sm font-bold outline-none focus:border-green-500 transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Pincode</label>
                    <input type="text" defaultValue="201310" className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 text-sm font-bold outline-none focus:border-green-500 transition-colors" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Address</label>
                  <textarea defaultValue="Plot 45, Industrial Estate, Phase II, Greater Noida, Uttar Pradesh" className="w-full p-3 h-24 rounded-xl border border-gray-100 bg-gray-50 text-sm font-bold outline-none focus:border-green-500 transition-colors resize-none"></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Contact Person</label>
                    <input type="text" defaultValue="Admin User" className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 text-sm font-bold outline-none focus:border-green-500 transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Email</label>
                    <input type="email" defaultValue="admin@greensoil.com" className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 text-sm font-bold outline-none focus:border-green-500 transition-colors" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Phone</label>
                    <input type="text" defaultValue="+91 98765 43210" className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 text-sm font-bold outline-none focus:border-green-500 transition-colors" />
                  </div>
                </div>
                
                <div className="pt-6">
                  <button type="submit" className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold shadow-lg shadow-green-600/20 transition-all active:scale-95">Save Profile</button>
                </div>
              </form>
            </div>
          );
        case 'notifications':
          const toggleSetting = (key) => setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
          return (
            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Notification Settings</h3>
                <p className="text-sm text-gray-500">Choose how you want to be alerted about batches and collections</p>
              </div>
              
              <div className="space-y-6">
                <section>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Package className="w-4 h-4" /> Batch Alerts
                  </h4>
                  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-50">
                    {[
                      { id: 'batchNew', label: 'New batch assigned to us', desc: 'Get notified when a new batch matches your subscriptions' },
                      { id: 'batchQR', label: 'Batch QR generated', desc: 'Alert when a society generates a QR code for collection' },
                      { id: 'pickupReminder', label: 'Pickup reminder 24hrs before', desc: 'A courtesy reminder for upcoming collections' },
                    ].map(item => (
                      <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                        <div>
                          <p className="text-sm font-bold text-gray-800">{item.label}</p>
                          <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                        <Toggle enabled={notifications[item.id]} onChange={() => toggleSetting(item.id)} />
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Truck className="w-4 h-4" /> Pickup Alerts
                  </h4>
                  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-50">
                    {[
                      { id: 'emergencyPickup', label: 'Society requests emergency pickup', desc: 'Critical alert for immediate collection needs' },
                      { id: 'pickupConfirmed', label: 'Pickup confirmed by society', desc: 'When a society confirms your arrival' },
                      { id: 'batchExpired', label: 'Batch about to expire', desc: 'Warning when a scheduled batch is nearing its time limit' },
                    ].map(item => (
                      <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                        <div>
                          <p className="text-sm font-bold text-gray-800">{item.label}</p>
                          <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                        <Toggle enabled={notifications[item.id]} onChange={() => toggleSetting(item.id)} />
                      </div>
                    ))}
                  </div>
                </section>

                <section>
                  <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" /> Quota Alerts
                  </h4>
                  <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-50">
                    {[
                      { id: 'quota80', label: 'Monthly quota 80% used', desc: 'Notification to help you plan your remaining collections' },
                      { id: 'quotaFull', label: 'Monthly quota fully used', desc: 'Alert when you reached your subscription limit' },
                      { id: 'newSociety', label: 'New society in collection radius', desc: 'Notification when a new society joins UrbanEco-Link near you' },
                    ].map(item => (
                      <div key={item.id} className="p-4 flex items-center justify-between hover:bg-gray-50/50 transition-colors">
                        <div>
                          <p className="text-sm font-bold text-gray-800">{item.label}</p>
                          <p className="text-xs text-gray-500">{item.desc}</p>
                        </div>
                        <Toggle enabled={notifications[item.id]} onChange={() => toggleSetting(item.id)} />
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          );
        case 'geofence':
          return (
            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Geo-Fence Configuration</h3>
                <p className="text-sm text-gray-500">Define your collection radius per waste type</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-50 rounded-lg text-xl">🌱</div>
                      <h4 className="font-bold text-gray-900">Organic Waste</h4>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">Active</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 font-medium">Current Radius</span>
                      <span className="font-bold text-green-600">{geoFenceSettings.organic} km</span>
                    </div>
                    <input 
                      type="range" min="1" max="50" step="1" 
                      value={geoFenceSettings.organic}
                      onChange={(e) => setGeoFenceSettings(prev => ({ ...prev, organic: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-green-600"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      <span>1 km</span>
                      <span>50 km</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-4 border-t border-gray-50">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users className="w-4 h-4" /> Societies in range: <span className="font-bold text-gray-800">3</span>
                    </div>
                  </div>
                  <button onClick={() => showToast('Organic radius updated')} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-green-600/10">Save</button>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg text-xl">♻️</div>
                      <h4 className="font-bold text-gray-900">Recyclable Waste</h4>
                    </div>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">Active</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 font-medium">Current Radius</span>
                      <span className="font-bold text-blue-600">{geoFenceSettings.recyclable} km</span>
                    </div>
                    <input 
                      type="range" min="1" max="50" step="1" 
                      value={geoFenceSettings.recyclable}
                      onChange={(e) => setGeoFenceSettings(prev => ({ ...prev, recyclable: parseInt(e.target.value) }))}
                      className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                      <span>1 km</span>
                      <span>50 km</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-4 border-t border-gray-50">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users className="w-4 h-4" /> Societies in range: <span className="font-bold text-gray-800">1</span>
                    </div>
                  </div>
                  <button onClick={() => showToast('Recyclable radius updated')} className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-green-600/10">Save</button>
                </div>

                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center">
                  <span className="text-4xl opacity-30 mb-2">🗑️</span>
                  <h4 className="font-bold text-gray-400">Non-Recyclable</h4>
                  <p className="text-xs text-gray-400 mt-1">Not subscribed</p>
                  <p className="text-[10px] text-gray-400 mt-4 uppercase tracking-widest">Subscribe first to set radius</p>
                </div>
              </div>

              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex items-start gap-3 mt-6">
                <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 leading-relaxed font-medium">
                  Increasing your radius may assign more societies to your subscription quota. Ensure your processing capacity can handle the increased volume.
                </p>
              </div>
            </div>
          );
        case 'societies':
          return (
            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Societies We Collect From</h3>
                <p className="text-sm text-gray-500">Active partnerships and collection impact</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { name: 'Raghuma Hostel', city: 'Greater Noida', types: ['Organic', 'Recyclable'], since: 'Jan 2026', total: '320 kg', status: 'Active' },
                  { name: 'Green Valley Apartments', city: 'Greater Noida', types: ['Organic'], since: 'Feb 2026', total: '195 kg', status: 'Active' },
                  { name: 'Sunrise RWA', city: 'Greater Noida', types: ['Organic'], since: 'Mar 2026', total: '148 kg', status: 'Active' },
                ].map((soc, i) => (
                  <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6 flex flex-col h-full">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg leading-tight">{soc.name}</h4>
                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1"><MapPin className="w-3 h-3" /> {soc.city}</p>
                      </div>
                      <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold uppercase border border-green-200">{soc.status}</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {soc.types.map((t, idx) => (
                        <span key={idx} className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${t === 'Organic' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>{t}</span>
                      ))}
                    </div>

                    <div className="space-y-3 pt-4 border-t border-gray-50 flex-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Partner Since</span>
                        <span className="font-bold text-gray-700">{soc.since}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Total Collected</span>
                        <span className="font-bold text-gray-700">{soc.total}</span>
                      </div>
                    </div>

                    <button 
                      onClick={() => { setSelectedSociety(soc); setIsHistoryModalOpen(true); }}
                      className="w-full py-2.5 border-2 border-green-600 text-green-600 rounded-xl font-bold text-sm hover:bg-green-50 transition-colors mt-auto"
                    >
                      View History
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        case 'security':
          return (
            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Security</h3>
                <p className="text-sm text-gray-500">Manage your password and account security settings</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                  <h4 className="text-sm font-bold text-gray-900">Change Password</h4>
                  <div className="space-y-4">
                    {[
                      { id: 'currentPassword', label: 'Current Password', showId: 'showCurrent' },
                      { id: 'newPassword', label: 'New Password', showId: 'showNew' },
                      { id: 'confirmPassword', label: 'Confirm Password', showId: 'showConfirm' },
                    ].map(field => (
                      <div key={field.id} className="space-y-1">
                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">{field.label}</label>
                        <div className="relative">
                          <input 
                            type={securityForm[field.showId] ? 'text' : 'password'}
                            value={securityForm[field.id]}
                            onChange={(e) => setSecurityForm(prev => ({ ...prev, [field.id]: e.target.value }))}
                            className="w-full p-3 pr-10 rounded-xl border border-gray-100 bg-gray-50 text-sm font-bold outline-none focus:border-green-500 transition-colors" 
                          />
                          <button 
                            type="button"
                            onClick={() => setSecurityForm(prev => ({ ...prev, [field.showId]: !prev[field.showId] }))}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            {securityForm[field.showId] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => showToast('Password updated successfully ✅')} className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold shadow-lg shadow-green-600/20 active:scale-95 transition-all">Update Password</button>
                </section>

                <div className="space-y-6">
                  <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Two-Factor Authentication</h4>
                      <p className="text-xs text-gray-500 mt-1">Add an extra layer of security to your account</p>
                    </div>
                    <Toggle enabled={securityForm.twoFactor} onChange={() => setSecurityForm(prev => ({ ...prev, twoFactor: !prev.twoFactor }))} />
                  </section>

                  <section className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                    <h4 className="text-sm font-bold text-gray-900">Active Sessions</h4>
                    <div className="space-y-4 divide-y divide-gray-50">
                      <div className="flex items-center gap-3 pt-2">
                        <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center"><Layout className="w-5 h-5 text-green-600" /></div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">Chrome on Mac</p>
                          <p className="text-xs text-green-600 flex items-center gap-1 font-bold italic"><span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Active now</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 pt-4">
                        <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center"><Phone className="w-5 h-5 text-gray-400" /></div>
                        <div>
                          <p className="text-sm font-bold text-gray-800">Mobile App</p>
                          <p className="text-xs text-gray-400 font-bold">2 hours ago</p>
                        </div>
                      </div>
                    </div>
                    <button className="text-xs font-bold text-red-600 hover:underline pt-4">Sign out all sessions</button>
                  </section>
                </div>
              </div>
            </div>
          );
        case 'documents':
          return (
            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Documents & Certifications</h3>
                <p className="text-sm text-gray-500">Manage your business licenses and environmental certifications</p>
              </div>

              <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-50">
                {[
                  { name: 'Business Registration Certificate', date: 'Jan 2026', status: 'Verified', color: 'text-green-600 bg-green-50' },
                  { name: 'Environmental Clearance Certificate', date: 'Jan 2026', status: 'Verified', color: 'text-green-600 bg-green-50' },
                  { name: 'Processing Facility License', date: 'Feb 2026', status: 'Pending Review', color: 'text-orange-600 bg-orange-50' },
                  { name: 'ISO Certification', date: 'Not uploaded', status: 'Not Uploaded', color: 'text-gray-400 bg-gray-50', isAction: true },
                ].map((doc, i) => (
                  <div key={i} className="p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center"><FileText className="w-5 h-5 text-gray-400" /></div>
                      <div>
                        <p className="text-sm font-bold text-gray-800">{doc.name}</p>
                        <p className="text-xs text-gray-500">Uploaded: {doc.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${doc.color}`}>
                        {doc.status} {doc.status === 'Verified' ? '✅' : doc.status === 'Pending Review' ? '🕐' : ''}
                      </span>
                      <button className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${doc.isAction ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' : 'border border-green-600 text-green-600 hover:bg-green-50'}`}>
                        {doc.isAction ? 'Upload' : 'View'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <section className="space-y-4">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Upload New Document</h4>
                <div className="border-2 border-dashed border-gray-200 rounded-2xl p-10 flex flex-col items-center justify-center gap-4 bg-gray-50/50 group hover:bg-white hover:border-green-300 transition-all cursor-pointer">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center border border-gray-100 shadow-sm group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-800">📎 Drag and drop or click to upload</p>
                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Accepted: PDF, JPG, PNG (Max 10MB)</p>
                  </div>
                </div>
              </section>
            </div>
          );
        default:
          return null;
      }
    };

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[650px]">
          <aside className="w-full md:w-72 border-r border-gray-100 bg-gray-50/30 p-4 shrink-0">
            <nav className="space-y-1">
              {settingsTabs.map((item) => (
                <button 
                  key={item.id}
                  onClick={() => setActiveSettingsTab(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-bold transition-all group ${
                    activeSettingsTab === item.id 
                    ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' 
                    : 'text-gray-500 hover:text-green-600 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    {item.label}
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${activeSettingsTab === item.id ? 'translate-x-1' : 'opacity-0 group-hover:opacity-100'}`} />
                </button>
              ))}
            </nav>
          </aside>
          
          <div className="flex-1 p-6 md:p-8 overflow-y-auto">
             {renderContent()}
          </div>
        </div>
      </motion.div>
    );
  };


  const renderOverview = () => (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 pb-20 md:pb-8"
    >
      {/* Row 1: Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map((stat) => (
          <div key={stat.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.color.split(' ')[0]}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{stat.label}</p>
                <h4 className="text-xl font-bold text-gray-900 mt-0.5">{stat.value}</h4>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: Quota Overview */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Monthly Quota Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {QUOTAS.map((quota) => (
            <div key={quota.id} className={`p-5 rounded-2xl border ${quota.isNotSubscribed ? 'border-dashed border-gray-200 bg-gray-50/50' : 'border-gray-100 shadow-sm transition-all hover:border-green-200'}`}>
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{quota.icon}</span>
                  <h4 className="font-bold text-gray-900">{quota.type}</h4>
                </div>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${quota.statusColor}`}>
                  {quota.status}
                </span>
              </div>
              
              {!quota.isNotSubscribed ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <span>Subscribed From</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {quota.subscribed.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-md text-[10px] whitespace-nowrap">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Monthly Quota</span>
                      <span className="font-bold text-gray-900">{quota.limit} kg</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(quota.used/quota.limit) * 100}%` }}
                        className={`h-full ${quota.progressColor}`}
                      />
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Collected: <span className="font-bold text-gray-700">{quota.used}kg</span></span>
                      <span className="text-gray-500">Remaining: <span className="font-bold text-gray-700">{quota.limit - quota.used}kg</span></span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-32 flex flex-col items-center justify-center text-center">
                  <button className="flex items-center gap-2 text-green-600 font-bold hover:text-green-700 transition-colors">
                    <Plus className="w-5 h-5 border-2 border-green-600 rounded-full" />
                    Add Subscription
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Row 3: Pickups and Verifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">Scheduled Pickups</h3>
            <button className="text-sm font-bold text-green-600 hover:underline">View All</button>
          </div>
          <div className="space-y-4">
            {loading ? (
              <div className="p-8 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                <span className="text-xs">Loading live pickups telemetry...</span>
              </div>
            ) : livePickups.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs italic">
                No active pickup requests logged in the database.
              </div>
            ) : (
              livePickups.slice(0, 4).map((pickup) => (
                <div key={pickup.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-gray-50 bg-gray-50/30 hover:bg-gray-50 transition-colors gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center">
                      <Truck className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{pickup.society_name}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{pickup.stream_category} Stream • {pickup.assigned_driver}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between md:justify-end gap-4">
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 font-mono">{pickup.qr_code_token}</p>
                      <p className="text-sm font-bold text-gray-700">{pickup.estimated_weight_kg} kg</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      pickup.status === 'OUT_FOR_DELIVERY' ? 'bg-blue-100 text-blue-700' :
                      pickup.status === 'DELIVERED' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {pickup.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Crowdsourced Civic Reports</h3>
          <div className="space-y-4">
            {loading ? (
              <div className="p-8 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-green-600" />
                <span className="text-xs">Loading live civic reports...</span>
              </div>
            ) : liveReports.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-xs italic">
                No civic waste reports filed yet.
              </div>
            ) : (
              liveReports.slice(0, 4).map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">{item.description || 'Street Dump Report'}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] px-1.5 py-0.5 bg-green-50 text-green-600 rounded font-medium">{item.waste_type}</span>
                      <span className="text-[10px] text-gray-400">{item.reporter_name || 'Anonymous Resident'}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-[10px] font-bold text-green-600 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> {item.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Row 4: Geo-Fence */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Collection Radius</h3>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3 h-64 bg-green-50 rounded-2xl relative overflow-hidden flex items-center justify-center border border-green-100">
            {/* Map Placeholder */}
            <div className="absolute inset-0 dot-grid opacity-50" />
            <div className="relative w-48 h-48 rounded-full border-2 border-green-500/30 bg-green-500/5 flex items-center justify-center">
              <div className="w-3 h-3 bg-green-600 rounded-full shadow-lg z-10 animate-pulse" />
              <div className="absolute bottom-1/2 right-1/4 group cursor-pointer">
                <div className="bg-white p-1 rounded-full shadow-md border border-gray-100 group-hover:scale-110 transition-transform">
                  <MapPin className="w-3 h-3 text-red-500 fill-red-500" />
                </div>
              </div>
              <div className="absolute top-1/3 left-1/3 group cursor-pointer">
                <div className="bg-white p-1 rounded-full shadow-md border border-gray-100 group-hover:scale-110 transition-transform">
                  <MapPin className="w-3 h-3 text-red-500 fill-red-500" />
                </div>
              </div>
              <div className="absolute bottom-1/3 left-1/2 group cursor-pointer">
                <div className="bg-white p-1 rounded-full shadow-md border border-gray-100 group-hover:scale-110 transition-transform">
                  <MapPin className="w-3 h-3 text-red-500 fill-red-500" />
                </div>
              </div>
            </div>
            <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-2 rounded-lg shadow-sm border border-gray-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-green-600" />
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">GreenSoil Fertilizers HQ</span>
            </div>
          </div>
          <div className="flex flex-col justify-center space-y-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-gray-900">8 km Radius</h4>
                <p className="text-xs text-gray-500 mt-1">Currently serving societies within this range.</p>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">Active Pins</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 font-medium">Raghuma Hostel</span>
                  <span className="text-gray-400">2.3 km</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 font-medium">Green Valley Apts</span>
                  <span className="text-gray-400">4.1 km</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600 font-medium">Sunrise RWA</span>
                  <span className="text-gray-400">6.8 km</span>
                </div>
              </div>
            </div>
            <button className="w-full py-2.5 border-2 border-green-600 text-green-600 rounded-xl font-bold hover:bg-green-50 transition-colors">
              Update Radius
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      <Toast 
        isVisible={toast.visible} 
        message={toast.message} 
        onClose={() => setToast({ visible: false, message: '' })} 
      />

      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-60 h-screen sticky top-0 bg-white border-r border-gray-100 flex-col py-6 px-4">
        <div className="flex items-center gap-3 px-2 mb-8">
          <div className="p-2 bg-green-100 rounded-lg">
            <Leaf className="w-6 h-6 text-green-600" />
          </div>
          <span className="font-bold text-lg text-gray-900 leading-tight">UrbanEco<br/><span className="text-green-600">Link</span></span>
        </div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                activeTab === item.id 
                ? 'bg-green-600 text-white shadow-lg shadow-green-600/20' 
                : 'text-gray-500 hover:text-green-600 hover:bg-green-50'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <div className="pt-6 border-t border-gray-50 space-y-4">
          <div className="flex items-center gap-3 px-2 py-2 mb-2 bg-gray-50 rounded-2xl">
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center font-bold text-green-700">
              GS
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-bold text-gray-900 truncate">GreenSoil Fertilizers</h4>
              <p className="text-[10px] text-gray-500 truncate">Organization Admin</p>
            </div>
          </div>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header Bar */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="md:block hidden">
            <h2 className="text-xl font-bold text-gray-900">Good Morning, Admin 👋</h2>
            <p className="text-sm text-gray-500 font-medium mt-0.5">{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          </div>
          
          <div className="md:hidden flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Leaf className="w-5 h-5 text-green-600" />
            </div>
            <h2 className="font-bold text-gray-900">UrbanEco-Link</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-all cursor-pointer">
              <Bell className="w-6 h-6" />
              <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full border-2 border-white flex items-center justify-center">2</span>
            </div>
            <button 
              onClick={() => showToast('Collection request sent! Dispatching nearest vehicle.')}
              className="hidden sm:flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-full font-bold shadow-lg shadow-green-600/20 active:scale-95 transition-all text-sm">
              <Truck className="w-4 h-4" />
              Request Collection
            </button>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className="p-6">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'subscriptions' && renderSubscriptions()}
          {activeTab === 'pickups' && renderPickups()}
          {activeTab === 'verify' && renderVerify()}
          {activeTab === 'analytics' && renderAnalytics()}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </main>

      {/* Modals */}
      <Modal 
        isOpen={isQuotaModalOpen} 
        onClose={() => setIsQuotaModalOpen(false)} 
        title="Edit Subscription — Organic Waste"
      >
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-gray-700">Monthly Quota</label>
              <span className="text-xl font-bold text-green-600">{quotaValue} kg</span>
            </div>
            <input 
              type="range" min="100" max="1000" step="50" 
              value={quotaValue} 
              onChange={(e) => setQuotaValue(e.target.value)}
              className="w-full accent-green-600 h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 font-bold">
              <span>100kg</span>
              <span>1000kg</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-sm font-bold text-gray-700">Collection Radius</label>
              <span className="text-xl font-bold text-green-600">{radiusValue} km</span>
            </div>
            <input 
              type="range" min="1" max="50" step="1" 
              value={radiusValue} 
              onChange={(e) => setRadiusValue(e.target.value)}
              className="w-full accent-green-600 h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-400 font-bold">
              <span>1km</span>
              <span>50km</span>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-bold text-gray-700 block text-center">Priority Level</label>
            <div className="flex gap-2 p-1 bg-gray-100 rounded-xl">
              {['Low', 'Medium', 'High'].map(lev => (
                <button 
                  key={lev}
                  onClick={() => setPriority(lev)}
                  className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all ${priority === lev ? 'bg-white text-green-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                >
                  {lev}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest leading-loose">Higher priority = assigned first when multiple orgs want same waste</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button onClick={() => setIsQuotaModalOpen(false)} className="flex-1 py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-bold transition-all">Cancel</button>
            <button onClick={() => { setIsQuotaModalOpen(false); showToast('Subscription updated successfully!'); }} className="flex-2 py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold shadow-lg shadow-green-600/20 transition-all">Save Changes</button>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={isScanModalOpen} 
        onClose={() => setIsScanModalOpen(false)} 
        title="QR Scanner"
      >
        <div className="flex flex-col items-center gap-6 py-6">
          <div className="w-64 h-64 bg-gray-100 border-2 border-dashed border-gray-300 rounded-3xl flex flex-col items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-green-500/5 group-hover:bg-green-500/10 transition-colors" />
            <QrCode className="w-20 h-20 text-gray-300 mb-4 group-hover:text-green-500/50 transition-colors" />
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest text-center px-4">Point camera at society's batch QR code</p>
            
            {scanning && (
              <motion.div 
                initial={{ top: 0 }}
                animate={{ top: '100%' }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
                className="absolute left-0 right-0 h-1 bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)] z-10"
              />
            )}
          </div>

          <p className="text-sm text-center text-gray-500 max-w-[280px]">Scanning Batch <span className="font-bold text-gray-800">#2024-091</span> from Raghuma Hostel...</p>

          <button 
            onClick={handleSimulateScan}
            disabled={scanning}
            className={`w-full py-4 rounded-2xl font-bold shadow-lg transition-all active:scale-95 ${scanning ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 text-white shadow-green-600/20'}`}
          >
            {scanning ? 'Verifying...' : 'Simulate Scan'}
          </button>
        </div>
      </Modal>

      <Modal 
        isOpen={isUploadModalOpen} 
        onClose={() => setIsUploadModalOpen(false)} 
        title="Upload Proof of Purpose"
      >
        <div className="space-y-6">
          <p className="text-sm text-gray-500">Batch <span className="font-bold text-gray-800">{verificationData?.batch}</span> — {verificationData?.weight} {verificationData?.type}</p>
          
          <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 bg-gray-50/30 group hover:bg-gray-50 transition-colors cursor-pointer">
             <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100 group-hover:scale-110 transition-transform">
               <Camera className="w-6 h-6 text-green-600" />
             </div>
             <div className="text-center">
               <p className="text-sm font-bold text-gray-900 leading-tight">Click to Upload Photo</p>
               <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest leading-loose">JPG, PNG, PDF (Max 5MB)</p>
             </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Product Type</label>
              <select className="w-full p-3 rounded-xl border border-gray-100 bg-gray-50 text-sm font-bold outline-none focus:border-green-500 transition-colors">
                <option>Compost Fertilizer</option>
                <option>Biogas</option>
                <option>Raw Recyclables</option>
                <option>Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Output Quantity</label>
              <div className="flex border border-gray-100 rounded-xl overflow-hidden bg-gray-50">
                <input type="number" placeholder="0.0" className="w-full p-3 bg-transparent text-sm font-bold outline-none" />
                <div className="p-3 bg-gray-100 text-xs font-bold text-gray-400 border-l border-gray-100 flex items-center">KG</div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Notes</label>
            <textarea placeholder="Describe the final product..." className="w-full p-3 h-24 rounded-xl border border-gray-100 bg-gray-50 text-sm font-medium outline-none focus:border-green-500 transition-colors resize-none"></textarea>
          </div>

          <button onClick={() => { setIsUploadModalOpen(false); showToast('Proof uploaded ✅ Verification complete'); }} className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-bold shadow-lg shadow-green-600/20 transition-all active:scale-95">
            Submit Verification
          </button>
        </div>
      </Modal>

      <Modal 
        isOpen={isProofModalOpen} 
        onClose={() => setIsProofModalOpen(false)} 
        title="Verification Details"
      >
        <div className="space-y-6">
          <div className="w-full h-48 bg-gray-100 rounded-2xl flex items-center justify-center border border-gray-100">
             <div className="text-center">
               <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest leading-loose">Proof Photo Placeholder</p>
             </div>
          </div>
          <div className="grid grid-cols-2 gap-y-4 text-sm">
             <div><p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Processed</p><p className="font-bold text-gray-800">160 kg Organic</p></div>
             <div><p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Output</p><p className="font-bold text-gray-800">45 kg Compost</p></div>
             <div><p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Date Verified</p><p className="font-bold text-gray-800">25 Mar 2026</p></div>
             <div><p className="text-gray-400 text-xs uppercase tracking-widest font-bold">Batch ID</p><p className="font-mono font-bold text-gray-800">#2024-088</p></div>
          </div>
          <div className="p-4 bg-green-50 rounded-xl border border-green-100 flex items-center gap-3">
             <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-green-600 shadow-sm"><Globe className="w-4 h-4" /></div>
             <p className="text-xs font-bold text-green-700 leading-tight">This proof is publicly visible on the <span className="underline cursor-pointer">Impact Feed</span> for transparency.</p>
          </div>
          <button onClick={() => setIsProofModalOpen(false)} className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-bold transition-all">Close</button>
        </div>
      </Modal>

      <Modal 
        isOpen={isHistoryModalOpen} 
        onClose={() => setIsHistoryModalOpen(false)} 
        title={`Collection History — ${selectedSociety?.name}`}
      >
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center text-sm">
             <div className="flex items-center gap-2 font-bold text-gray-600">
                <Target className="w-4 h-4 text-green-600" /> Total Impact:
             </div>
             <span className="font-bold text-green-700 text-base">{selectedSociety?.total} collected</span>
          </div>

          <div className="overflow-hidden border border-gray-100 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-400 font-bold uppercase tracking-widest">
                <tr>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Batch</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3 text-right">Weight</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {[
                  { date: '12 Mar 2026', batch: '#2024-061', type: 'Organic', weight: '45kg' },
                  { date: '05 Mar 2026', batch: '#2024-058', type: 'Organic', weight: '42kg' },
                  { date: '28 Feb 2026', batch: '#2024-052', type: 'Recyclable', weight: '38kg' },
                  { date: '21 Feb 2026', batch: '#2024-045', type: 'Organic', weight: '40kg' },
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-bold text-gray-800">{row.date}</td>
                    <td className="px-4 py-3 font-mono text-gray-400">{row.batch}</td>
                    <td className="px-4 py-3">
                       <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${row.type === 'Organic' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>{row.type}</span>
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-gray-800">{row.weight}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={() => setIsHistoryModalOpen(false)} className="w-full py-4 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-2xl font-bold transition-all">Close</button>
        </div>
      </Modal>


      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 pt-3 pb-8 px-6 flex justify-between items-center">
        {navItems.slice(0, 5).map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 ${
              activeTab === item.id ? 'text-green-600' : 'text-gray-400'
            }`}
          >
            {item.icon}
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label.split(' ')[0]}</span>
            {activeTab === item.id && <motion.div layoutId="bubble" className="w-5 h-1 bg-green-600 rounded-full mt-0.5" />}
          </button>
        ))}
      </div>
    </div>
  );
};

export default OrgPortal;
