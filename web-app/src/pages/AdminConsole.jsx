import React, { useState, useEffect } from 'react';
import pickupService from '../services/pickupService';
import { 
  Leaf,

  Building2, 
  Users, 
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
  CheckCircle, 
  Truck, 
  PlusCircle, 
  ArrowRight, 
  Info, 
  X, 
  Clock, 
  ShieldCheck, 
  FileText, 
  Layout, 
  Bot, 
  Zap, 
  Cpu, 
  Activity, 
  AlertTriangle, 
  Check, 
  Globe, 
  Trophy,
  History,
  FileBarChart,
  Settings2,
  Phone,
  Mail,
  MoreVertical,
  Eye,
  EyeOff,
  User,
  LayoutDashboard,
  Smartphone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  LineChart, 
  Line, 
  AreaChart, 
  Area 
} from 'recharts';

// --- REAL-TIME DATA CONSTANTS ---

const CITY_KPI = [
  { id: 1, label: 'Total Societies', value: '0', sub: 'Active on platform', icon: <Users className="w-5 h-5 text-blue-600" />, color: 'bg-blue-50 text-blue-600' },
  { id: 2, label: 'Total Orgs', value: '0', sub: 'Subscribed partners', icon: <Building2 className="w-5 h-5 text-purple-600" />, color: 'bg-purple-50 text-purple-600' },
  { id: 3, label: 'Total Diverted', value: '0 kg', sub: 'This month city-wide', icon: <BarChart3 className="w-5 h-5 text-green-600" />, color: 'bg-green-50 text-green-600' },
  { id: 4, label: 'CO2 Offset', value: '0 kg', sub: 'Equivalent CO2 saved', icon: <Globe className="w-5 h-5 text-teal-600" />, color: 'bg-teal-50 text-teal-600' },
  { id: 5, label: 'Active Batches', value: '0', sub: 'Across all societies', icon: <Package className="w-5 h-5 text-orange-600" />, color: 'bg-orange-50 text-orange-600' },
  { id: 6, label: 'Avg Accuracy', value: '0%', sub: 'Waste segregation rate', icon: <Target className="w-5 h-5 text-red-600" />, color: 'bg-red-50 text-red-600' },
];

const TOP_SOCIETIES = [];

const WASTE_TYPE_DATA = [
  { name: 'Organic', value: 0, color: '#16A34A' },
  { name: 'Recyclable', value: 0, color: '#2563EB' },
  { name: 'Non-Recyclable', value: 0, color: '#94A3B8' },
];

const WEEKLY_DISTRIBUTION = [];

const ACCURACY_TREND = [];

const DEVICES = [];

const MATCH_LOG = [];

const SOCIETIES = [];

const ORGS = [];

const MOCKED_BINS = [];

const MOCKED_MISSED = [];

// --- HELPER COMPONENTS ---

const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-neutral-dark/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
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
  );
};

const Toast = ({ isVisible, message, onClose }) => {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[200] bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10"
        >
          <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-sm tracking-wide">{message}</span>
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

const AdminConsole = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [activeSettingsTab, setActiveSettingsTab] = useState('platform');
  const [toast, setToast] = useState({ visible: false, message: '' });
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isSocietyModalOpen, setIsSocietyModalOpen] = useState(false);
  const [selectedSociety, setSelectedSociety] = useState(null);
  const [isAddSocietyModalOpen, setIsAddSocietyModalOpen] = useState(false);
  const [isOrgModalOpen, setIsOrgModalOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);

  // New states for audit
  const [societySearchQuery, setSocietySearchQuery] = useState('');
  const [activeSocietyFilter, setActiveSocietyFilter] = useState('All');
  const [orgSearchQuery, setOrgSearchQuery] = useState('');
  const [activeOrgFilter, setActiveOrgFilter] = useState('All');
  const [isBinsModalOpen, setIsBinsModalOpen] = useState(false);
   const [isPickupsModalOpen, setIsPickupsModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [isReasonModalOpen, setIsReasonModalOpen] = useState(false);
  const [isCustomReportModalOpen, setIsCustomReportModalOpen] = useState(false);
  const [isAddPartnerModalOpen, setIsAddPartnerModalOpen] = useState(false);
  const [loadingReportId, setLoadingReportId] = useState(null);
  const [maintenanceModeModal, setMaintenanceModeModal] = useState(false);
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [conflictResolved, setConflictResolved] = useState(false);

  const [devicesState, setDevicesState] = useState(DEVICES);

  // Live Pickups State from GET /api/v1/pickups/admin/all
  const [adminPickups, setAdminPickups] = useState([]);
  const [loadingPickups, setLoadingPickups] = useState(false);

  const fetchAdminPickups = async () => {
    try {
      setLoadingPickups(true);
      const res = await pickupService.getAdminPickups();
      setAdminPickups(res.pickups || []);
    } catch (err) {
      console.error('Error fetching admin pickups:', err);
    } finally {
      setLoadingPickups(false);
    }
  };

  useEffect(() => {
    fetchAdminPickups();
  }, []);

  const filteredSocieties = SOCIETIES.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(societySearchQuery.toLowerCase());
    const matchesFilter = activeSocietyFilter === 'All' || s.status === activeSocietyFilter;
    return matchesSearch && matchesFilter;
  });

  const filteredOrgs = ORGS.filter(o => {
    const matchesSearch = o.name.toLowerCase().includes(orgSearchQuery.toLowerCase());
    const matchesFilter = activeOrgFilter === 'All' || o.status === activeOrgFilter;
    return matchesSearch && matchesFilter;
  });

  const showToast = (message) => setToast({ visible: true, message });

  const navItems = [
    { id: 'overview', label: 'City Overview', icon: <Building2 className="w-5 h-5" /> },
    { id: 'pickups', label: 'Requested Pickups', icon: <Truck className="w-5 h-5" /> },
    { id: 'ai', label: 'AI Performance', icon: <Bot className="w-5 h-5" /> },
    { id: 'matching', label: 'Matching Engine', icon: <Settings2 className="w-5 h-5" /> },
    { id: 'societies', label: 'Society Mgmt', icon: <Users className="w-5 h-5" /> },
    { id: 'orgs', label: 'Organization Mgmt', icon: <Building2 className="w-5 h-5" /> },
    { id: 'reports', label: 'Reports', icon: <FileBarChart className="w-5 h-5" /> },
    { id: 'settings', label: 'System Settings', icon: <Settings className="w-5 h-5" /> },
  ];


  const renderOverview = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {CITY_KPI.map((stat) => (
          <div key={stat.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.color.split(' ')[0]}`}>
                {stat.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500 truncate">{stat.label}</p>
                <h4 className="text-lg font-bold text-gray-900 mt-0.5 truncate">{stat.value}</h4>
              </div>
            </div>
            <p className="text-[10px] text-gray-400 mt-3 font-medium truncate">{stat.sub}</p>
          </div>
        ))}
        
        {/* Special Audit Cards */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-orange-100 bg-orange-50/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-500 truncate uppercase tracking-tighter">Bins Near Capacity</p>
              <h4 className="text-xl font-black text-gray-900 mt-0.5">23</h4>
            </div>
          </div>
          <button 
            onClick={() => setIsBinsModalOpen(true)}
            className="text-[10px] font-bold text-orange-600 hover:underline mt-4 uppercase tracking-widest flex items-center gap-1 active:scale-95 transition-all"
          >
            View All <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-sm border border-red-100 bg-red-50/20">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 text-red-600 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-gray-500 truncate uppercase tracking-tighter">Missed Pickups</p>
              <h4 className="text-xl font-black text-gray-900 mt-0.5">3</h4>
            </div>
          </div>
          <button 
            onClick={() => setIsPickupsModalOpen(true)}
            className="text-[10px] font-bold text-red-600 hover:underline mt-4 uppercase tracking-widest flex items-center gap-1 active:scale-95 transition-all"
          >
            View Details <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Row 2: Leaderboard */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-gray-900">Top Performing Societies</h3>
            <span className="px-2 py-0.5 bg-gray-50 text-gray-400 text-[10px] font-bold rounded uppercase">Updated Daily</span>
          </div>
          <button onClick={() => navigate('/leaderboard')} className="text-sm font-bold text-green-600 hover:underline transition-all active:scale-95">View Full Leaderboard</button>
        </div>
        <div className="overflow-x-auto text-nowrap">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50">
                <th className="px-4 py-3">Rank</th>
                <th className="px-4 py-3">Society</th>
                <th className="px-4 py-3">City</th>
                <th className="px-4 py-3">Eco Points</th>
                <th className="px-4 py-3">Performance</th>
                <th className="px-4 py-3 text-right">Diverted</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {TOP_SOCIETIES.map((soc, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-4 font-bold text-gray-400">#0{i + 1}</td>
                  <td className="px-4 py-4 font-bold text-gray-900">{soc.name}</td>
                  <td className="px-4 py-4 text-gray-500 font-medium">{soc.city}</td>
                  <td className="px-4 py-4 font-bold text-green-600">{soc.pts} pts</td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-0.5 bg-green-50 text-green-600 rounded text-[10px] font-bold uppercase border border-green-100">{soc.rank}</span>
                  </td>
                  <td className="px-4 py-4 text-right font-bold text-gray-700">{soc.kg}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 3: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">City Waste Distribution This Month</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={WEEKLY_DISTRIBUTION} margin={{ top: 20, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `${val}kg`} />
                <Tooltip cursor={{ fill: '#F8FAFC' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                <Bar dataKey="organic" name="Organic" fill="#16A34A" radius={[4, 4, 0, 0]} />
                <Bar dataKey="recyclable" name="Recyclable" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="nonRecyclable" name="Non-Recyclable" fill="#94A3B8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <h3 className="text-lg font-bold text-gray-900 mb-6">City Waste Breakdown</h3>
          <div className="flex-1 flex flex-col items-center justify-center relative">
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={WASTE_TYPE_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={8} dataKey="value">
                    {WASTE_TYPE_DATA.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '12px', border: 'none' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-4">
              <span className="text-2xl font-bold text-gray-900">48,240</span>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total kg</span>
            </div>
            <div className="mt-8 grid grid-cols-1 gap-2 w-full max-w-[200px]">
              {WASTE_TYPE_DATA.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 rounded-full h-2" style={{ backgroundColor: item.color }} />
                    <span className="text-xs font-medium text-gray-500">{item.name}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-900">{item.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Indicators */}
      <h3 className="text-lg font-bold text-gray-900">City Health Indicators</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Societies On Track', desc: '118 out of 142 societies contributed this week', icon: <Users className="w-5 h-5" />, color: 'green', val: '83%', h: 'Good' },
          { label: 'Bins Near Capacity', desc: '23 bins across 15 societies are above 80% fill level', icon: <PlusCircle className="w-5 h-5" />, color: 'orange', val: '16%', h: 'Warning', onClick: () => setIsBinsModalOpen(true) },
          { label: 'Missed Pickups', desc: '3 missed pickups this month across 2 societies', icon: <Truck className="w-5 h-5" />, color: 'red', val: '2%', h: 'Action Needed', onClick: () => setIsMissedPickupsModalOpen(true) },
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
            <div className={`p-2 bg-${item.color}-50 text-${item.color}-600 rounded-lg w-fit`}>{item.icon}</div>
            <div>
              <h4 className="font-bold text-gray-900">{item.label}</h4>
              <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <span>Intensity</span><span>{item.val}</span>
              </div>
              <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
                <div className={`h-full bg-${item.color}-600 rounded-full`} style={{ width: item.val }} />
              </div>
            </div>
            {item.onClick && (
              <button 
                onClick={item.onClick}
                className="text-xs font-bold text-green-600 hover:underline transition-all active:scale-95"
              >
                {item.label === 'Bins Near Capacity' ? 'View All' : 'View Details'}
              </button>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );

  const renderAI = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 pb-20 md:pb-8">
      <div>
        <h3 className="text-xl font-bold text-gray-900">AI Performance Monitor</h3>
        <p className="text-sm text-gray-500 mt-1">Scan model accuracy across the city</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Scans Today', value: '1,247', icon: <Bot className="w-5 h-5" />, color: 'bg-blue-50 text-blue-600' },
          { label: 'Avg Accuracy', value: '93.8%', icon: <Target className="w-5 h-5" />, color: 'bg-green-50 text-green-600' },
          { label: 'Avg Scan Time', value: '1.2 sec', icon: <Zap className="w-5 h-5" />, color: 'bg-orange-50 text-orange-600' },
          { label: 'Active Devices', value: '89', icon: <Smartphone className="w-5 h-5" />, color: 'bg-purple-50 text-purple-600' },
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${item.color.split(' ')[0]}`}>{item.icon}</div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-widest">{item.label}</p>
              <h4 className="text-xl font-bold text-gray-900 mt-1">{item.value}</h4>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h3 className="text-lg font-bold text-gray-900 mb-6">City-Wide AI Accuracy (Last 30 Days)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={ACCURACY_TREND}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
              <XAxis dataKey="date" stroke="#94A3B8" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis domain={[85, 100]} stroke="#94A3B8" fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} />
              <Line type="monotone" dataKey="accuracy" stroke="#16A34A" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#16A34A' }} />
              <Line type="monotone" data={ACCURACY_TREND.map(d => ({ ...d, threshold: 85 }))} dataKey="threshold" stroke="#EF4444" strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Organic Waste', acc: '95.2%', count: '18,420', color: 'green', status: 'Excellent' },
          { label: 'Recyclable Waste', acc: '93.1%', count: '15,280', color: 'blue', status: 'Good' },
          { label: 'Non-Recyclable', acc: '91.4%', count: '10,190', color: 'slate', status: 'Monitor' },
        ].map((item, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 space-y-4 shadow-sm">
            <div className="flex justify-between items-start">
              <h4 className="font-bold text-gray-800 text-sm">{item.label}</h4>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${item.color === 'green' ? 'bg-green-50 text-green-600' : item.color === 'blue' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>{item.status}</span>
            </div>
            <div className="flex items-end justify-between">
              <span className="text-2xl font-bold text-gray-900">{item.acc}</span>
              <span className="text-xs text-gray-400 font-medium">{item.count} scans</span>
            </div>
            <div className="h-2 bg-gray-50 rounded-full overflow-hidden">
              <div className={`h-full bg-${item.color === 'slate' ? 'orange' : item.color}-600 rounded-full`} style={{ width: item.acc }} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <h3 className="text-lg font-bold text-gray-900">IoT Device Status</h3>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">Weight sensors and scanners across societies</p>
        </div>
        <div className="overflow-x-auto text-nowrap">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Society</th>
                <th className="px-6 py-4">Device ID</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Last Ping</th>
                <th className="px-6 py-4">Accuracy</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-medium">
              {devicesState.map((dev, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">{dev.society}</td>
                  <td className="px-6 py-4 font-mono text-gray-400">{dev.id}</td>
                  <td className="px-6 py-4 text-gray-500">{dev.type}</td>
                  <td className="px-6 py-4 text-nowrap">
                    <span className={`flex items-center gap-1.5 font-bold ${dev.status === 'Online' ? 'text-green-600' : dev.status === 'Warning' ? 'text-orange-600' : 'text-red-500'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${dev.status === 'Online' ? 'bg-green-500' : dev.status === 'Warning' ? 'bg-orange-500' : 'bg-red-500'}`} />
                      {dev.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{dev.lastPing}</td>
                  <td className="px-6 py-4 font-bold text-gray-700">{dev.accuracy}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => { setSelectedDevice(dev); setIsDeviceModalOpen(true); }}
                      className="text-green-600 font-bold hover:underline"
                    >
                      {dev.status === 'Online' ? 'View' : 'Fix'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );

  const renderMatching = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-green-50 rounded-lg"><Activity className="w-5 h-5 text-green-600" /></div>
             <h3 className="text-lg font-bold text-gray-900">Matching Engine Operational</h3>
          </div>
          <span className="px-2 py-0.5 bg-gray-50 text-gray-400 text-[10px] font-bold rounded uppercase tracking-widest">Updated Daily</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-gray-50">
          {[
            { label: 'Matches Today', val: '12' },
            { label: 'Avg Match Time', val: '0.3s' },
            { label: 'Conflicts Resolved', val: '2' },
            { label: 'Pending Matches', val: '3' },
          ].map((s, i) => (
            <div key={i}>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.label}</p>
              <p className="text-xl font-bold text-gray-900 mt-1">{s.val}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-green-50/50 p-6 rounded-2xl border border-green-100/50">
        <h4 className="text-xs font-bold text-green-700 uppercase tracking-widest mb-6">How Matching Works</h4>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-green-100 hidden md:block -z-10" />
          {[
            { step: '01', title: 'Bin hits 80%', icon: <Layout className="w-4 h-4" /> },
            { step: '02', title: 'Find Subscriber', icon: <Search className="w-4 h-4" /> },
            { step: '03', title: 'Check Quota', icon: <History className="w-4 h-4" /> },
            { step: '04', title: 'Assign Batch', icon: <CheckCircle className="w-4 h-4" /> },
            { step: '05', title: 'Notify Both', icon: <Bell className="w-4 h-4" /> },
          ].map((s, i) => (
            <div key={i} className="flex flex-row md:flex-col items-center gap-3 md:gap-4 md:text-center group">
              <div className="w-10 h-10 rounded-full bg-white border border-green-200 flex items-center justify-center text-xs font-bold text-green-600 shadow-sm group-hover:bg-green-600 group-hover:text-white transition-all">
                {s.icon}
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-black text-green-300 md:hidden">{s.step}</span>
                <span className="text-xs font-bold text-gray-700">{s.title}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Today's Matching Log</h3>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Real-time batch distribution</p>
          </div>
          <div className="flex items-center gap-2">
             {['All', 'Successful', 'Conflict', 'Pending'].map(f => (
               <button key={f} className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${f === 'All' ? 'bg-green-600 text-white shadow-md' : 'text-gray-400 hover:bg-gray-50'}`}>{f}</button>
             ))}
          </div>
        </div>
        <div className="overflow-x-auto text-nowrap">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Society</th>
                <th className="px-6 py-4">Waste Type</th>
                <th className="px-6 py-4">Weight</th>
                <th className="px-6 py-4">Matched To</th>
                <th className="px-6 py-4">Distance</th>
                <th className="px-6 py-4">Score</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-medium">
              {MATCH_LOG.map((log, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-gray-400">{log.time}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{log.society}</td>
                  <td className="px-6 py-4">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${log.type === 'Organic' ? 'bg-green-50 text-green-600' : log.type === 'Recyclable' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>{log.type}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-700">{log.weight}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{log.matchedTo}</td>
                  <td className="px-6 py-4 text-gray-400">{log.distance}</td>
                  <td className="px-6 py-4 font-bold text-green-600">{log.score}</td>
                  <td className="px-6 py-4">
                    <span className={`flex items-center gap-1.5 font-bold ${log.status === 'Matched' ? 'text-green-600' : log.status === 'Conflict' ? 'text-orange-600' : 'text-blue-500'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${log.status === 'Matched' ? 'bg-green-500' : log.status === 'Conflict' ? 'bg-orange-500' : 'bg-blue-500'}`} />
                      {log.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => { setSelectedMatch(log); setIsMatchModalOpen(true); }} className="text-green-600 font-bold hover:underline">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-900">Conflicts & Resolutions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {!conflictResolved ? (
            <div className="bg-white p-6 rounded-2xl border-2 border-orange-100 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                 <div className="p-2 bg-orange-50 rounded-lg"><AlertTriangle className="w-5 h-5 text-orange-600" /></div>
                 <span className="px-2 py-1 bg-orange-50 text-orange-600 rounded-full text-[10px] font-bold uppercase tracking-widest">Active Conflict</span>
              </div>
              <div className="space-y-1">
                 <h4 className="font-bold text-gray-900">River View Complex</h4>
                 <p className="text-xs text-gray-500 font-bold uppercase tracking-wider">152kg Organic Waste</p>
              </div>
              <p className="text-sm bg-orange-50/50 p-3 rounded-xl text-orange-700 italic border border-orange-100">
                 "GreenSoil Fertilizers quota at 98% — cannot accept new batch"
              </p>
              <div className="space-y-2">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Resolution Options</p>
                 <div className="space-y-2">
                    {['Assign to next nearest org', 'Hold batch until quota resets', 'Manual assignment'].map((opt, i) => (
                      <label key={i} className="flex items-center gap-3 p-3 border border-gray-100 rounded-xl hover:border-green-200 cursor-pointer transition-all">
                         <input type="radio" name="conflict-1" className="w-4 h-4 accent-green-600" defaultChecked={i === 0} />
                         <span className="text-xs font-medium text-gray-700">{opt}</span>
                      </label>
                    ))}
                 </div>
              </div>
              <button 
                onClick={() => {
                  setConflictResolved(true);
                  showToast('Conflict resolved successfully ✅');
                }} 
                className="w-full py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg transition-all active:scale-[98%] mt-2"
              >
                Resolve Conflict
              </button>
            </div>
          ) : (
            <div className="bg-green-50/50 p-6 rounded-2xl border-2 border-green-100 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                 <div className="p-2 bg-green-100 rounded-lg"><CheckCircle className="w-5 h-5 text-green-600" /></div>
                 <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-widest">Recently Resolved</span>
              </div>
              <div className="space-y-1">
                 <h4 className="font-bold text-gray-900">River View Complex</h4>
                 <p className="text-xs text-green-600 font-bold uppercase tracking-wider">152kg Organic Waste</p>
              </div>
              <div className="bg-white p-3 rounded-xl text-xs text-gray-500 border border-green-100">
                 <span className="font-bold text-gray-700 uppercase tracking-tighter mr-2">Resolution:</span>
                 Assigned to next nearest org (GreenRoad Constructions)
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                 <Clock className="w-3 h-3" /> Resolved at: Just Now
              </div>
            </div>
          )}

          <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100 space-y-4 opacity-60">
            <div className="flex justify-between items-start">
               <div className="p-2 bg-gray-100 rounded-lg"><CheckCircle className="w-5 h-5 text-gray-400" /></div>
               <span className="px-2 py-1 bg-gray-100 text-gray-400 rounded-full text-[10px] font-bold uppercase tracking-widest">Resolved Conflict</span>
            </div>
            <div className="space-y-1">
               <h4 className="font-bold text-gray-900">Urban Nest Society</h4>
               <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">No subscriber within 15km</p>
            </div>
            <div className="bg-white p-3 rounded-xl text-xs text-gray-500 border border-gray-100">
               <span className="font-bold text-gray-700 uppercase tracking-tighter mr-2">Resolution:</span>
               Extended radius to 20km, matched to City Municipality
            </div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
               <Clock className="w-3 h-3" /> Resolved at: Today 8:15 AM
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  const renderSocieties = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Society Management</h3>
          <p className="text-sm text-gray-500 mt-1">All registered societies on the platform</p>
        </div>
        <div className="flex gap-3">
           <button onClick={() => setIsAddSocietyModalOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-md transition-all">
             <PlusCircle className="w-4 h-4" /> Add Society
           </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
         {[
           { label: 'Total', val: '142', color: 'gray' },
           { label: 'Active', val: '138', color: 'green' },
           { label: 'Pending', val: '3', color: 'orange' },
           { label: 'Suspended', val: '1', color: 'red' },
         ].map((s, i) => (
           <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.label} Societies</p>
             <h4 className={`text-2xl font-black text-${s.color === 'gray' ? 'gray-900' : s.color + '-600'} mt-1`}>{s.val}</h4>
           </div>
         ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4 justify-between md:items-center">
           <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              {['All', 'Active', 'Pending', 'Suspended'].map(t => (
                <button 
                  key={t} 
                  onClick={() => setActiveSocietyFilter(t)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeSocietyFilter === t ? 'bg-green-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  {t}
                </button>
              ))}
           </div>
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search societies..." 
                value={societySearchQuery}
                onChange={(e) => setSocietySearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-50 border border-transparent focus:border-green-600 focus:bg-white text-sm rounded-xl outline-none w-full md:w-64 transition-all" 
              />
           </div>
        </div>
        <div className="overflow-x-auto text-nowrap">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Society Name</th>
                <th className="px-6 py-4">City</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Rank</th>
                <th className="px-6 py-4">Eco Points</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-medium">
              {filteredSocieties.map((soc, i) => (
                <tr key={soc.id || i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">{soc.name}</td>
                  <td className="px-6 py-4 text-gray-500">{soc.city}</td>
                  <td className="px-6 py-4 text-gray-400">{soc.type}</td>
                  <td className="px-6 py-4"><span className="bg-green-50 text-green-600 px-1.5 py-0.5 rounded font-black text-[10px] uppercase">{soc.rank}</span></td>
                  <td className="px-6 py-4 font-bold text-green-600">{soc.pts} pts</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${soc.status === 'Active' ? 'bg-green-50 text-green-600' : soc.status === 'Pending' ? 'bg-orange-50 text-orange-600' : 'bg-red-50 text-red-600'}`}>{soc.status}</span>
                  </td>
                  <td className="px-6 py-4 text-gray-400">{soc.joined}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => { setSelectedSociety(soc); setIsSocietyModalOpen(true); }} className="text-green-600 font-bold hover:underline">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4">
         <h3 className="text-lg font-bold text-gray-900">Pending Society Approvals (3)</h3>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex justify-between items-start">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center font-bold text-orange-600">NH</div>
                  <span className="px-2 py-0.5 bg-orange-50 text-orange-600 rounded text-[9px] font-bold uppercase tracking-widest">New Reg</span>
                </div>
                <div>
                   <h4 className="font-bold text-gray-900">Neo Heights Society</h4>
                   <p className="text-xs text-gray-400 font-medium">South Delhi | Apartment Complex</p>
                </div>
                <div className="text-[10px] text-gray-500 font-medium pt-2 border-t border-gray-50 flex items-center gap-2">
                   <Clock className="w-3 h-3" /> Submitted: 2 hrs ago
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <button 
                      onClick={() => showToast('Society approved! ✅')} 
                      className="py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-xs shadow-md transition-all active:scale-95"
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => setIsReasonModalOpen(true)}
                      className="py-2.5 border-2 border-red-50 text-red-500 hover:bg-red-50 rounded-xl font-bold text-xs transition-all active:scale-95"
                    >
                      Reject
                    </button>
                </div>
              </div>
            ))}
         </div>
      </div>
    </motion.div>
  );

  const renderOrgs = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Organization Management</h3>
          <p className="text-sm text-gray-500 mt-1">Partners and waste subscribers city-wide</p>
        </div>
        <button 
          onClick={() => setIsAddPartnerModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-md transition-all active:scale-95"
        >
          <PlusCircle className="w-4 h-4" /> Add Partner
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
         {[
           { label: 'Total', val: '38', color: 'gray' },
           { label: 'Active', val: '35', color: 'blue' },
           { label: 'Pending', val: '2', color: 'orange' },
           { label: 'Suspended', val: '1', color: 'red' },
         ].map((s, i) => (
           <div key={i} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.label} Partners</p>
             <h4 className={`text-2xl font-black text-${s.color === 'gray' ? 'gray-900' : s.color + '-600'} mt-1`}>{s.val}</h4>
           </div>
         ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row gap-4 justify-between md:items-center">
           <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
              {['All', 'Active', 'Pending', 'Suspended'].map(t => (
                <button 
                  key={t} 
                  onClick={() => setActiveOrgFilter(t)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${activeOrgFilter === t ? 'bg-green-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  {t}
                </button>
              ))}
           </div>
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search partners..." 
                value={orgSearchQuery}
                onChange={(e) => setOrgSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-50 border border-transparent focus:border-green-600 focus:bg-white text-sm rounded-xl outline-none w-full md:w-64 transition-all" 
              />
           </div>
        </div>
        <div className="overflow-x-auto text-nowrap">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Org Name</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">City</th>
                <th className="px-6 py-4">Waste Types</th>
                <th className="px-6 py-4">Quota (Monthly)</th>
                <th className="px-6 py-4">Collected</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-medium">
              {filteredOrgs.map((org, i) => (
                <tr key={org.id || i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 font-bold text-gray-900">{org.name}</td>
                  <td className="px-6 py-4 text-gray-400">{org.type}</td>
                  <td className="px-6 py-4 text-gray-500">{org.city}</td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1 flex-wrap">
                      {org.wasteTypes.map(w => (
                        <span key={w} className={`px-1.5 py-0.5 rounded text-[10px] font-black uppercase tracking-tight ${w === 'Organic' ? 'bg-green-50 text-green-600' : w === 'Recyclable' ? 'bg-blue-50 text-blue-600' : 'bg-gray-100 text-gray-600'}`}>{w}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-700">{org.quota}</td>
                  <td className="px-6 py-4 font-bold text-green-600">{org.collected}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${org.status === 'Active' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>{org.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => { setSelectedOrg(org); setIsOrgModalOpen(true); }} className="text-green-600 font-bold hover:underline transition-all active:scale-95">View</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );

  const renderReports = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div>
        <h3 className="text-xl font-bold text-gray-900">City Reports</h3>
        <p className="text-sm text-gray-500 mt-1">Generate and download city-wide sustainability reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[
          { title: 'Monthly Summary Report', desc: 'Complete city waste diversion summary for March 2026', icon: <BarChart3 className="w-6 h-6" />, id: 'monthly' },
          { title: 'Leaderboard Report', desc: 'Current standings and eco points for all 142 societies', icon: <Trophy className="w-6 h-6" />, id: 'leaderboard' },
          { title: 'AI Performance Report', desc: 'Scan accuracy and device health across all IoT sensors', icon: <Bot className="w-6 h-6" />, id: 'ai' },
          { title: 'Organization Report', desc: 'Collection compliance and quota utilization for all partners', icon: <Building2 className="w-6 h-6" />, id: 'org' },
        ].map((report, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-start gap-6 hover:border-green-200 transition-all group">
            <div className="p-4 bg-gray-50 text-gray-400 group-hover:bg-green-50 group-hover:text-green-600 rounded-2xl transition-all">
              {report.icon}
            </div>
            <div className="flex-1 space-y-2">
              <h4 className="font-bold text-gray-900">{report.title}</h4>
              <p className="text-xs text-gray-500 font-medium leading-relaxed">{report.desc}</p>
              <button 
                onClick={() => {
                  setLoadingReportId(report.id);
                  setTimeout(() => {
                    setLoadingReportId(null);
                    showToast('Report generated ✅ Download starting...');
                  }, 1500);
                }}
                disabled={loadingReportId === report.id}
                className="flex items-center gap-2 text-xs font-bold text-green-600 hover:underline pt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingReportId === report.id ? (
                  <>
                    <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-3.5 h-3.5" /> Generate PDF
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-50">
          <h3 className="text-lg font-bold text-gray-900">Previously Generated Reports</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <tr>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Report Type</th>
                <th className="px-6 py-4">Generated By</th>
                <th className="px-6 py-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 font-medium">
              {[
                { date: '25 Mar 2026', type: 'Monthly Summary', user: 'City Admin' },
                { date: '21 Mar 2026', type: 'Leaderboard Standings', user: 'City Admin' },
                { date: '18 Mar 2026', type: 'AI Audit Report', user: 'System Auto' },
                { date: '14 Mar 2026', type: 'Monthly Summary', user: 'City Admin' },
                { date: '01 Mar 2026', type: 'Monthly Summary', user: 'City Admin' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-gray-500">{row.date}</td>
                  <td className="px-6 py-4 font-bold text-gray-900">{row.type}</td>
                  <td className="px-6 py-4 text-gray-400">{row.user}</td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => showToast('Downloading report...')}
                      className="text-green-600 font-bold hover:underline flex items-center gap-1 active:scale-95 transition-all"
                    >
                      <FileText className="w-3 h-3" /> Download
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );

  const renderSettings = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row gap-8 min-h-[600px]">
      <div className="w-full md:w-64 space-y-1">
        {[
          { id: 'platform', label: 'Platform Settings', icon: <Globe className="w-4 h-4" /> },
          { id: 'leaderboard', label: 'Leaderboard Config', icon: <Trophy className="w-4 h-4" /> },
          { id: 'points', label: 'Points Configuration', icon: <Zap className="w-4 h-4" /> },
          { id: 'notifications', label: 'System Notifications', icon: <Bell className="w-4 h-4" /> },
          { id: 'security', label: 'Admin Security', icon: <ShieldCheck className="w-4 h-4" /> },
        ].map(item => (
          <button
            key={item.id}
            onClick={() => setActiveSettingsTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${activeSettingsTab === item.id ? 'bg-green-600 text-white shadow-lg shadow-green-200' : 'text-gray-500 hover:bg-gray-50'}`}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </div>

      <div className="flex-1 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm overflow-hidden min-h-full">
        {activeSettingsTab === 'platform' && (
           <div className="space-y-8 max-w-2xl">
              <div>
                <h4 className="text-lg font-bold text-gray-900">Platform Status</h4>
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">Control global platform availability</p>
              </div>
              <div className="space-y-4">
                 {[
                   { label: 'Platform Active', desc: 'Enable or disable the entire system', active: true },
                   { label: 'New Registrations', desc: 'Allow new societies and orgs to join', active: true },
                   { label: 'Leaderboard Public', desc: 'Show city rankings on the public feed', active: true },
                   { label: 'Impact Feed Public', desc: 'Visible to guest users on the homepage', active: true },
                   { label: 'Maintenance Mode', desc: 'Only admins can access the platform', active: false, danger: true },
                 ].map((s, i) => (
                   <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition-all">
                      <div className="space-y-0.5">
                        <p className={`text-sm font-bold ${s.danger && s.active ? 'text-red-600' : 'text-gray-900'}`}>{s.label}</p>
                        <p className="text-[10px] text-gray-400 font-medium">{s.desc}</p>
                      </div>
                       <Toggle 
                        enabled={s.label === 'Maintenance Mode' ? maintenanceEnabled : s.active} 
                        onChange={() => {
                          if (s.label === 'Maintenance Mode') {
                            if (!maintenanceEnabled) setMaintenanceModeModal(true);
                            else {
                              setMaintenanceEnabled(false);
                              showToast('Maintenance mode disabled ✅');
                            }
                          } else {
                            showToast(`${s.label} updated!`);
                          }
                        }} 
                      />
                   </div>
                 ))}
              </div>
           </div>
        )}

        {activeSettingsTab === 'points' && (
           <div className="space-y-8 max-w-2xl">
              <div>
                <h4 className="text-lg font-bold text-gray-900">Eco Points Formula</h4>
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">Configure how eco points are calculated city-wide</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 {[
                   { label: 'Points per kg Organic', val: '3 pts/kg' },
                   { label: 'Points per kg Recyclable', val: '4 pts/kg' },
                   { label: 'Points per kg Non-Recyclable', val: '2 pts/kg' },
                   { label: 'Bonus for on-time pickup', val: '+10 pts' },
                   { label: 'Penalty for missed pickup', val: '-5 pts' },
                 ].map((field, i) => (
                   <div key={i} className="space-y-2">
                     <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">{field.label}</label>
                     <input type="text" defaultValue={field.val} className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:border-green-600 outline-none transition-all" />
                   </div>
                 ))}
              </div>
              <button onClick={() => showToast('Formula saved successfully! ✅')} className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-200 transition-all active:scale-[98%]">Save Configuration</button>

              <div className="pt-8 border-t border-gray-100 space-y-6">
                 <div>
                   <h4 className="text-lg font-bold text-gray-900">Rank Thresholds</h4>
                   <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest font-bold">Points required for each rank level</p>
                 </div>
                 <div className="space-y-3">
                    {[
                      { l: 'A++', p: '1000+' },
                      { l: 'A+', p: '800' },
                      { l: 'A', p: '600' },
                      { l: 'B+', p: '400' },
                      { l: 'B', p: '200' },
                      { l: 'C', p: '0 (Fixed)' },
                    ].map((idx) => (
                      <div key={idx.l} className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center font-black text-xs">{idx.l}</div>
                         <div className="flex-1">
                            <input type="text" defaultValue={idx.p} disabled={idx.l === 'C'} className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-lg text-xs font-bold text-gray-900 outline-none focus:bg-white focus:border-green-600 transition-all disabled:opacity-50" />
                         </div>
                      </div>
                    ))}
                 </div>
                 <button onClick={() => showToast('Thresholds updated! ✅')} className="w-full py-3 border-2 border-green-50 text-green-600 hover:bg-green-50 rounded-xl font-bold text-sm transition-all">Update Thresholds</button>
              </div>
           </div>
        )}

        {['leaderboard', 'notifications', 'security'].includes(activeSettingsTab) && (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4 py-20">
             <div className="w-16 h-16 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center">
                <Settings2 className="w-8 h-8" />
             </div>
             <div>
                <h4 className="text-gray-900 font-bold uppercase tracking-widest text-xs">Section Coming Soon</h4>
                <p className="text-xs text-gray-400 mt-1">This configuration module is currently being finalized.</p>
             </div>
          </div>
        )}
      </div>
    </motion.div>
  );

  const renderPickups = () => (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-green-600" />
            Administrative Pickup Inventory & Real-Time Sync
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Connected live to GET /api/v1/pickups/admin/all (PostgreSQL Database Engine)
          </p>
        </div>

        <button
          onClick={fetchAdminPickups}
          disabled={loadingPickups}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 font-bold rounded-xl text-xs transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loadingPickups ? 'animate-spin' : ''}`} />
          Refresh Pickups
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-base">All Requested Waste Pickups</h3>
          <span className="text-xs bg-green-50 text-green-700 font-bold px-3 py-1 rounded-full border border-green-200">
            {adminPickups.length} Pickups Total
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-gray-600">
            <thead className="bg-gray-50 text-xs uppercase text-gray-400 font-bold border-b border-gray-100">
              <tr>
                <th className="px-6 py-4">QR Code Token</th>
                <th className="px-6 py-4">Society Name</th>
                <th className="px-6 py-4">Stream</th>
                <th className="px-6 py-4">Est. Weight</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Assigned Driver</th>
                <th className="px-6 py-4">Requested At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {adminPickups.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-gray-400 text-sm">
                    No requested pickups found in database. Request a pickup from Society Portal to generate test data.
                  </td>
                </tr>
              ) : (
                adminPickups.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-gray-900">
                      {p.qr_code_token}
                    </td>
                    <td className="px-6 py-4 font-semibold text-gray-900">
                      {p.society_name}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        p.stream_category === 'WET' ? 'bg-emerald-100 text-emerald-800' :
                        p.stream_category === 'DRY' ? 'bg-blue-100 text-blue-800' :
                        p.stream_category === 'HAZARDOUS' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {p.stream_category}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-bold text-gray-900">
                      {p.estimated_weight_kg} kg
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                        p.status === 'OUT_FOR_DELIVERY' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        p.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${
                          p.status === 'OUT_FOR_DELIVERY' ? 'bg-blue-500 animate-pulse' :
                          p.status === 'DELIVERED' ? 'bg-emerald-500' : 'bg-amber-500'
                        }`} />
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-semibold text-gray-700">
                      {p.assigned_driver}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400">
                      {p.created_at ? new Date(p.created_at).toLocaleString() : 'Recent'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );

  return (

    <div className="min-h-screen bg-light-green/20 font-inter">
      {/* Fixed Sidebar - Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 fixed top-0 bottom-0 left-0 z-50">
        <div className="p-6 flex items-center gap-3 border-b border-gray-50">
          <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-100">
            <Leaf className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-black text-gray-900 tracking-tight">UrbanEco<span className="text-green-600">Link</span></span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto mt-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all relative group ${
                activeTab === item.id 
                  ? 'bg-green-600 text-white shadow-lg shadow-green-100' 
                  : 'text-gray-500 hover:text-green-600 hover:bg-green-50/50'
              }`}
            >
              <span className="relative z-10">{item.icon}</span>
              <span className="relative z-10">{item.label}</span>
              {activeTab === item.id && (
                <motion.div layoutId="nav-bg" className="absolute inset-0 bg-green-600 rounded-xl -z-0" />
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-50">
          <div className="bg-gray-50 rounded-2xl p-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-900 text-white rounded-full flex items-center justify-center font-bold text-sm tracking-wider">CA</div>
              <div>
                <p className="text-sm font-bold text-gray-900">City Admin</p>
                <p className="text-[10px] font-bold text-green-600 uppercase tracking-widest leading-tight">Super Admin</p>
              </div>
            </div>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-gray-600 rounded-xl text-xs font-bold border border-gray-200 hover:border-red-100 hover:text-red-500 hover:bg-red-50 transition-all">
              <LogOut className="w-4 h-4" /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="md:pl-64 flex flex-col min-h-screen">
        {/* Header Bar */}
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 md:px-8 py-4 h-[72px] flex items-center justify-between">
          <div className="flex flex-col">
            <h2 className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-2">City Dashboard 🏙️</h2>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>

          <div className="flex items-center gap-2 md:gap-5">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-100 rounded-full">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
               <span className="text-[10px] font-bold text-green-700 uppercase tracking-wider">All Systems Operational</span>
            </div>
            <button className="relative p-2.5 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all">
              <Bell className="w-5 h-5 text-gray-500" />
              <span className="absolute top-2 right-2 w-4 h-4 bg-red-500 text-white text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white">5</span>
            </button>
            <button onClick={() => setIsCustomReportModalOpen(true)} className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-xs shadow-lg shadow-green-100 transition-all active:scale-[98%]">
              <Plus className="w-4 h-4" /> Generate Custom Report
            </button>
          </div>
        </header>

        {/* Dynamic Content */}
        <section className="flex-1 p-4 md:p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && renderOverview()}
            {activeTab === 'pickups' && renderPickups()}
            {activeTab === 'ai' && renderAI()}
            {activeTab === 'matching' && renderMatching()}
            {activeTab === 'societies' && renderSocieties()}
            {activeTab === 'orgs' && renderOrgs()}
            {activeTab === 'reports' && renderReports()}
            {activeTab === 'settings' && renderSettings()}
          </AnimatePresence>
        </section>



      {/* Modals & Toasts */}
      <Toast isVisible={toast.visible} message={toast.message} onClose={() => setToast({ visible: false, message: '' })} />

      <Modal isOpen={isDeviceModalOpen} onClose={() => setIsDeviceModalOpen(false)} title={`${selectedDevice?.status === 'Online' ? 'Device Details' : 'Device Maintenance'} — ${selectedDevice?.id}`}>
        <div className="space-y-6">
          <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
               <div className="p-2 bg-white rounded-xl shadow-sm"><Smartphone className="w-5 h-5 text-gray-400" /></div>
               <div>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none">Status</p>
                  <p className={`text-sm font-bold mt-1 ${selectedDevice?.status === 'Online' ? 'text-green-600' : selectedDevice?.status === 'Warning' ? 'text-orange-600' : 'text-red-500'}`}>{selectedDevice?.status}</p>
               </div>
            </div>
            <div className="text-right">
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{selectedDevice?.status === 'Online' ? 'Uptime' : 'Offline Since'}</p>
               <p className="text-sm font-bold text-gray-900 mt-1">{selectedDevice?.status === 'Online' ? '99.8%' : selectedDevice?.lastPing}</p>
            </div>
          </div>
          <div className="space-y-4">
             <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-medium">Associated Society</span>
                <span className="font-bold text-gray-900">{selectedDevice?.society}</span>
             </div>
             <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-medium">Model Type</span>
                <span className="font-bold text-gray-900">v2.4 Smart-Weight Pro</span>
             </div>
             {selectedDevice?.status === 'Online' && (
                <div className="pt-2 space-y-3">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Accuracy History (Last 7 days)</p>
                   <div className="flex items-end justify-between h-12 gap-1 px-1">
                      {[92, 95, 93, 97, 94, 96, 95].map((h, i) => (
                        <div key={i} className="flex-1 bg-green-100 rounded-t-sm relative group" style={{ height: `${h}%` }}>
                           <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-gray-900 text-white text-[8px] px-1 rounded">{h}%</div>
                        </div>
                      ))}
                   </div>
                </div>
             )}
          </div>
          <div className="grid grid-cols-2 gap-4">
             <button onClick={() => { showToast('Alert sent to society admin 📲'); setIsDeviceModalOpen(false); }} className="py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-xs shadow-lg transition-all active:scale-95">Send Alert to Society</button>
             {selectedDevice?.status !== 'Online' ? (
                <button 
                  onClick={() => { 
                    setDevicesState(prev => prev.map(d => d.id === selectedDevice.id ? { ...d, status: 'Online', lastPing: 'Just now', accuracy: '95%' } : d));
                    showToast('Device marked as resolved ✅'); 
                    setIsDeviceModalOpen(false); 
                  }} 
                  className="py-3.5 border-2 border-green-50 text-green-600 hover:bg-green-50 rounded-xl font-bold text-xs transition-all active:scale-95"
                >
                  Mark as Resolved
                </button>
             ) : (
                <button onClick={() => setIsDeviceModalOpen(false)} className="py-3.5 border-2 border-gray-50 text-gray-500 hover:bg-gray-50 rounded-xl font-bold text-xs transition-all active:scale-95">Close Details</button>
             )}
          </div>
        </div>
      </Modal>

      <Modal isOpen={isMatchModalOpen} onClose={() => setIsMatchModalOpen(false)} title="Match Details">
        <div className="space-y-6">
           <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl border border-green-100">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-white rounded-xl shadow-sm"><Package className="w-5 h-5 text-green-600" /></div>
                 <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Batch Matched</p>
                    <p className="text-sm font-bold text-gray-900 mt-1">{selectedMatch?.weight} {selectedMatch?.type}</p>
                 </div>
              </div>
              <span className="text-lg font-black text-green-600">{selectedMatch?.score} Match</span>
           </div>
           <div className="space-y-4">
              <div className="grid grid-cols-2 gap-6 relative">
                 <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white border border-gray-100 rounded-full flex items-center justify-center -rotate-90 md:rotate-0"><ArrowRight className="w-4 h-4 text-green-600" /></div>
                 <div className="p-4 bg-gray-50 rounded-2xl text-center space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">From</p>
                    <p className="text-xs font-bold text-gray-900 truncate">{selectedMatch?.society}</p>
                 </div>
                 <div className="p-4 bg-gray-50 rounded-2xl text-center space-y-1">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">To</p>
                    <p className="text-xs font-bold text-gray-900 truncate">{selectedMatch?.matchedTo}</p>
                 </div>
              </div>
              <div className="p-4 bg-gray-50 rounded-2xl space-y-3">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Algorithm Reasoning</p>
                 <div className="space-y-2">
                    {[
                      { l: 'Distance Check', v: 'PASS (2.3km < 15km)' },
                      { l: 'Quota Check', v: 'PASS (92% Utilized)' },
                      { l: 'Type Compliance', v: 'MATCH (Organic OK)' },
                    ].map((idx) => (
                      <div key={idx.l} className="flex justify-between items-center text-[10px]">
                         <span className="text-gray-500 font-medium">{idx.l}</span>
                         <span className="font-bold text-green-600">{idx.v}</span>
                      </div>
                    ))}
                 </div>
              </div>
           </div>
           <button onClick={() => setIsMatchModalOpen(false)} className="w-full py-3.5 bg-gray-900 text-white rounded-xl font-bold text-xs shadow-lg transition-all active:scale-[98%]">Close Log Details</button>
        </div>
      </Modal>

      {/* Bins Near Capacity Modal */}
      <Modal isOpen={isBinsModalOpen} onClose={() => setIsBinsModalOpen(false)} title="Bins Near Capacity (>80%)">
        <div className="space-y-4">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                <tr>
                  <th className="px-4 py-2">Society</th>
                  <th className="px-4 py-2">Bin Type</th>
                  <th className="px-4 py-2">Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {MOCKED_BINS.map(bin => (
                  <tr key={bin.id} className="hover:bg-gray-50/50">
                    <td className="px-4 py-3 font-bold text-gray-900">{bin.society}</td>
                    <td className="px-4 py-3 text-gray-500">{bin.type}</td>
                    <td className="px-4 py-3 text-red-600 font-black">{bin.level}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={() => setIsBinsModalOpen(false)} className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-xs shadow-lg transition-all active:scale-[98%]">Close</button>
        </div>
      </Modal>

    


      <Modal isOpen={isSocietyModalOpen} onClose={() => setIsSocietyModalOpen(false)} title="Society Profile">
         <div className="space-y-6">
            <div className="flex items-center gap-4">
               <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center font-black text-xl">RH</div>
               <div>
                  <h4 className="text-lg font-bold text-gray-900">{selectedSociety?.name}</h4>
                  <p className="text-xs text-gray-400 font-medium">Society ID: SOC-2024-142</p>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
               {[
                 { label: 'City', val: 'Greater Noida' },
                 { label: 'Type', val: 'Hostel/Residence' },
                 { label: 'Eco Points', val: '1,340' },
                 { label: 'Waste Diverted', val: '4,820 kg' },
               ].map((field, i) => (
                 <div key={i} className="p-3 bg-gray-50 rounded-xl">
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{field.label}</p>
                   <p className="text-sm font-bold text-gray-900 mt-0.5">{field.val}</p>
                 </div>
               ))}
            </div>
            <div className="space-y-3">
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-100 pb-2">Contact Information</p>
               <div className="flex items-center gap-3 text-xs">
                  <User className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Admin: <span className="font-bold text-gray-800">Parikshit Singh</span></span>
               </div>
               <div className="flex items-center gap-3 text-xs">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-800 font-medium">admin@raghumahostel.com</span>
               </div>
               <div className="flex items-center gap-3 text-xs">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-800 font-medium">+91 98765 43210</span>
               </div>
            </div>
            <div className="grid grid-cols-2 gap-3 pt-2">
               <button 
                onClick={() => {
                  setConfirmAction({
                    title: 'Suspend Account',
                    message: `Are you sure you want to suspend the account for ${selectedSociety?.name}?`,
                    onConfirm: () => {
                      showToast('Account suspended');
                      setIsConfirmModalOpen(false);
                      setIsSocietyModalOpen(false);
                    }
                  });
                  setIsConfirmModalOpen(true);
                }} 
                className="py-3.5 border-2 border-red-50 text-red-500 hover:bg-red-50 rounded-xl font-bold text-xs transition-all active:scale-95"
               >
                Suspend Account
               </button>
               <button onClick={() => setIsNotificationModalOpen(true)} className="py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-xs shadow-lg transition-all active:scale-95">Send Notification</button>
            </div>
         </div>
      </Modal>

      <Modal isOpen={isAddSocietyModalOpen} onClose={() => setIsAddSocietyModalOpen(false)} title="Register New Society">
         <form onSubmit={(e) => { e.preventDefault(); showToast('Registration submitted! ✅'); setIsAddSocietyModalOpen(false); }} className="space-y-4">
            <div className="space-y-2">
               <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Society Name</label>
               <input type="text" placeholder="e.g. Neo Heights Society" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-green-600 transition-all" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">City</label>
                <input type="text" defaultValue="Greater Noida" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold outline-none transition-all cursor-not-allowed opacity-60" disabled />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Type</label>
                <select className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-green-600 transition-all appearance-none cursor-pointer">
                   <option>Apartment Complex</option>
                   <option>Hostel/Residence</option>
                   <option>Educational Institution</option>
                   <option>Corporate Park</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
               <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Full Address</label>
               <textarea rows="2" placeholder="Street name, Sector, nearby landmark..." className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-green-600 transition-all resize-none"></textarea>
            </div>
            <div className="pt-2 border-t border-gray-100 space-y-4">
               <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Admin Contact Detail</p>
               <div className="grid grid-cols-2 gap-4">
                  <input type="text" placeholder="Admin Name" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-green-600 transition-all" required />
                  <input type="phone" placeholder="Phone Number" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-green-600 transition-all" required />
               </div>
            </div>
            <button type="submit" className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-green-100 transition-all active:scale-[98%] mt-4 tracking-wider uppercase">Complete Registration</button>
        </form>
      </Modal>

      {/* Overview Modals (Added during audit) */}
      <Modal isOpen={isBinsModalOpen} onClose={() => setIsBinsModalOpen(false)} title="Bins Near Capacity (>80%)">
        <div className="space-y-4">
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead className="bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    <tr>
                       <th className="px-4 py-3">Society</th>
                       <th className="px-4 py-3">Type</th>
                       <th className="px-4 py-3">Fill Level</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-50 text-xs font-medium">
                    {[
                      { s: 'River View', t: 'Organic', l: 88 },
                      { s: 'Skyline Apt', t: 'Recyclable', l: 85 },
                      { s: 'Palm Grove', t: 'Organic', l: 82 },
                      { s: 'Urban Nest', t: 'Recyclable', l: 91 },
                      { s: 'Lotus Valley', t: 'Organic', l: 84 },
                    ].map((bin, i) => (
                       <tr key={i}>
                          <td className="px-4 py-3 font-bold text-gray-900">{bin.s}</td>
                          <td className="px-4 py-3 text-gray-500">{bin.t}</td>
                          <td className="px-4 py-3">
                             <div className="flex items-center gap-2">
                                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                   <div className="h-full bg-orange-500" style={{ width: `${bin.l}%` }} />
                                </div>
                                <span className="text-orange-600 font-bold">{bin.l}%</span>
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
           <button onClick={() => setIsBinsModalOpen(false)} className="w-full py-3.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg">Close Details</button>
        </div>
      </Modal>

      <Modal isOpen={isPickupsModalOpen} onClose={() => setIsPickupsModalOpen(false)} title="Missed Pickups Details">
        <div className="space-y-4">
           {[
             { s: 'Palm Heights', t: 'Organic', d: 'Mar 24' },
             { s: 'Gulmohar Society', t: 'Recyclable', d: 'Mar 25' },
             { s: 'Lotus Valley', t: 'Organic', d: 'Mar 25' },
           ].map((p, i) => (
              <div key={i} className="p-4 bg-red-50/50 border border-red-100 rounded-2xl flex items-center justify-between">
                 <div className="space-y-1">
                    <p className="font-bold text-gray-900">{p.s}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{p.t} — Scheduled {p.d}</p>
                 </div>
                 <button onClick={() => showToast('Driver alerted! 🚛')} className="px-4 py-2 bg-white text-red-600 border border-red-100 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm hover:bg-red-50 transition-all">Alert Driver</button>
              </div>
           ))}
           <button onClick={() => setIsPickupsModalOpen(false)} className="w-full py-3.5 bg-gray-50 text-gray-500 hover:bg-gray-100 rounded-xl font-bold text-sm transition-all active:scale-95 mt-2">Dismiss All</button>
        </div>
      </Modal>

      {/* Maintenance Mode Warning Modal */}
      <Modal isOpen={maintenanceModeModal} onClose={() => setMaintenanceModeModal(false)} title="Maintenance Mode Warning">
        <div className="space-y-6">
          <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-4">
             <div className="p-2 bg-white rounded-xl text-red-600 shadow-sm"><AlertTriangle className="w-5 h-5" /></div>
             <p className="text-sm font-bold text-red-900 leading-snug">
               This will make the platform unavailable to all users. Are you sure?
             </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <button onClick={() => setMaintenanceModeModal(false)} className="py-3.5 bg-gray-50 text-gray-900 rounded-xl font-bold text-xs hover:bg-gray-100 transition-all active:scale-95">Cancel</button>
             <button 
              onClick={() => {
                setMaintenanceEnabled(true);
                showToast('Maintenance mode enabled ⚠️');
                setMaintenanceModeModal(false);
              }} 
              className="py-3.5 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-xs shadow-lg shadow-red-100 transition-all active:scale-95"
             >
              Confirm
             </button>
          </div>
        </div>
      </Modal>

      {/* Add Partner Modal */}
      <Modal isOpen={isAddPartnerModalOpen} onClose={() => setIsAddPartnerModalOpen(false)} title="Register New Partner">
        <form onSubmit={(e) => { e.preventDefault(); showToast('Partner registered successfully! 🏢'); setIsAddPartnerModalOpen(false); }} className="space-y-6">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Org Name</label>
                 <input type="text" placeholder="e.g. GreenSoil Fertilizers" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-green-600 transition-all shadow-sm" required />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Org Type</label>
                 <select className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold outline-none focus:bg-white focus:border-green-600 transition-all appearance-none cursor-pointer">
                    <option>Fertilizer Plant</option>
                    <option>Construction Firm</option>
                    <option>NGO</option>
                    <option>Municipal Authority</option>
                    <option>Recycling Plant</option>
                 </select>
              </div>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Contact Person</label>
                 <input type="text" placeholder="Full Name" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold shadow-sm outline-none focus:bg-white focus:border-green-600 transition-all" required />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Processing Capacity</label>
                 <input type="text" placeholder="e.g. 500 kg/month" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold shadow-sm outline-none focus:bg-white focus:border-green-600 transition-all" required />
              </div>
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Email Address</label>
              <input type="email" placeholder="contact@org.com" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold shadow-sm outline-none focus:bg-white focus:border-green-600 transition-all" required />
           </div>
           <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-1">Office Address</label>
              <textarea rows="2" placeholder="Street, Area, Pincode" className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl text-sm font-bold shadow-sm outline-none focus:bg-white focus:border-green-600 transition-all resize-none" required />
           </div>
           <button type="submit" className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-black text-sm shadow-xl shadow-green-100 transition-all active:scale-95 tracking-wider uppercase">Complete Registration</button>
        </form>
      </Modal>

      </main>
    </div>
  );
};

export default AdminConsole;



