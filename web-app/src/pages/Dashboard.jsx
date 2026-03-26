import React, { useState } from 'react';
import { 
  BarChart3, 
  Home, 
  Trash2, 
  Package, 
  Truck, 
  Settings, 
  LogOut, 
  Bell, 
  Plus, 
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  Award,
  ChevronRight,
  Menu,
  X,
  Recycle,
  Leaf,
  AlertTriangle,
  History,
  Activity,
  Calendar,
  Layers,
  QrCode,
  Download,
  Info,
  Check,
  Building2,
  MapPin,
  CalendarDays,
  ArrowRight,
  User,
  Shield,
  FileText,
  Upload,
  Eye,
  EyeOff,
  Smartphone,
  Monitor,
  Users
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, ReferenceLine
} from 'recharts';

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
      active 
        ? 'bg-primary text-white shadow-md' 
        : 'text-neutral-gray hover:bg-primary-light/50 hover:text-primary'
    }`}
  >
    <Icon className="w-5 h-5" />
    <span className="font-semibold text-sm">{label}</span>
  </button>
);

const StatCard = ({ title, value, subtext, trend, icon: Icon, colorClass }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
  >
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <div className="flex items-center gap-1 text-xs font-bold text-primary">
          <TrendingUp className="w-3.5 h-3.5" />
          {trend}
        </div>
      )}
    </div>
    <h3 className="text-sm font-medium text-neutral-gray mb-1">{title}</h3>
    <div className="text-2xl font-bold text-neutral-dark mb-1">{value}</div>
    <p className="text-xs text-neutral-gray/70">{subtext}</p>
  </motion.div>
);

const CircularGauge = ({ percentage, color }) => {
  const radius = 36;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-24 h-24 flex items-center justify-center">
      <svg className="w-full h-full transform -rotate-90">
        <circle
          cx="48"
          cy="48"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-gray-100"
        />
        <motion.circle
          cx="48"
          cy="48"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          style={{ color }}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute text-lg font-bold text-neutral-dark">{percentage}%</span>
    </div>
  );
};

const BinCard = ({ type, percentage, total, capacity, daysToFull, destination, status, urgent }) => {
  let color = '#16A34A'; // Green
  if (percentage >= 80) color = '#EF4444'; // Red
  else if (percentage >= 60) color = '#F59E0B'; // Orange

  return (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border ${urgent ? 'border-red-200 shadow-red-50' : 'border-gray-100'} hover:shadow-md transition-all`}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h4 className="font-bold text-neutral-dark text-lg">{type}</h4>
          <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
            urgent ? 'bg-red-100 text-red-600' : 'bg-primary-light text-primary'
          }`}>
            {status}
          </span>
        </div>
        <CircularGauge percentage={percentage} color={color} />
      </div>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-neutral-gray">Stored Capacity</span>
          <span className="font-bold text-neutral-dark">{total} kg / {capacity} kg</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-neutral-gray">Days to Full</span>
          <span className={`font-bold ${percentage >= 80 ? 'text-red-500' : 'text-neutral-dark'}`}>{daysToFull} days</span>
        </div>
      </div>
    </div>
  );
};

const MiniBarChart = ({ data, color }) => {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-1 h-12 w-full">
      {data.map((val, i) => (
        <motion.div 
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${(val / max) * 100}%` }}
          className="flex-1 rounded-t-sm"
          style={{ 
            backgroundColor: color,
            opacity: 0.4 + (i / data.length) * 0.6
          }}
        />
      ))}
    </div>
  );
};

const LargeBinCard = ({ type, percentage, total, capacity, daysToFull, destination, status, history, onRequestPickup, onViewDetails, urgent, color }) => {
  const isRed = percentage >= 80;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white p-6 rounded-3xl shadow-sm border transition-all ${
        urgent ? 'border-red-200 shadow-red-50 ring-1 ring-red-100' : 'border-gray-100'
      }`}
    >
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${urgent ? 'bg-red-50 text-red-500' : 'bg-primary-light/50 text-primary'}`}>
            {type.includes('Organic') ? <Leaf className="w-5 h-5" /> : type.includes('Recyclable') ? <Recycle className="w-5 h-5" /> : <Trash2 className="w-5 h-5" />}
          </div>
          <div>
            <h4 className="font-bold text-neutral-dark">{type}</h4>
            <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
              urgent ? 'bg-red-100 text-red-600' : status.includes('Active') ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
            }`}>
              {status}
            </span>
          </div>
        </div>
        <CircularGauge percentage={percentage} color={color} />
      </div>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-neutral-gray font-medium">Current Fill</p>
            <p className="text-xl font-black text-neutral-dark">{total}kg <span className="text-sm font-medium text-neutral-gray">/ {capacity}kg</span></p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              {percentage >= 80 ? <AlertTriangle className="w-4 h-4 text-red-500" /> : percentage >= 60 ? <AlertTriangle className="w-4 h-4 text-orange-500" /> : <CheckCircle2 className="w-4 h-4 text-primary" />}
              <span className={`text-sm font-bold ${percentage >= 80 ? 'text-red-600' : percentage >= 60 ? 'text-orange-600' : 'text-primary'}`}>
                {daysToFull} Days
              </span>
            </div>
            <p className="text-[10px] text-neutral-gray uppercase font-bold">To Full</p>
          </div>
        </div>

        <div>
          <p className="text-[10px] text-neutral-gray uppercase font-bold tracking-widest mb-3 flex items-center gap-2">
            <History className="w-3 h-3" /> 7-Day Fill History
          </p>
          <MiniBarChart data={history} color={color} />
        </div>
      </div>

      <div className="pt-4 border-t border-gray-50 mb-6">
        <p className="text-[10px] text-neutral-gray uppercase tracking-widest mb-1.5">Destination Partner</p>
        <p className="text-sm font-bold text-primary">{destination}</p>
      </div>

      {urgent ? (
        <button 
          onClick={onRequestPickup}
          className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-md shadow-red-100 active:scale-95"
        >
          Request Pickup Now
        </button>
      ) : (
        <button onClick={onViewDetails} className="w-full border border-primary text-primary hover:bg-primary/5 py-3 rounded-xl font-bold text-sm transition-all active:scale-95">
          View Details
        </button>
      )}
    </motion.div>
  );
};

const RequestPickupModal = ({ onClose, onSubmit }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
  >
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-neutral-dark text-xl">Request Emergency Pickup</h3>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <X className="w-5 h-5 text-neutral-gray" />
        </button>
      </div>
      
      <div className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-neutral-gray uppercase tracking-widest mb-2">Select Bin Type</label>
          <select className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all">
            <option>Organic Waste</option>
            <option>Recyclable Waste</option>
            <option>Non-Recyclable Waste</option>
          </select>
        </div>
        
        <div>
          <label className="block text-xs font-bold text-neutral-gray uppercase tracking-widest mb-2">Message (Optional)</label>
          <textarea 
            placeholder="Add a note for the organization..."
            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium h-24 focus:ring-2 focus:ring-primary/20 outline-none resize-none transition-all"
          />
        </div>
        
        <button 
          onClick={onSubmit}
          className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-primary/20"
        >
          Send Request
        </button>
      </div>
    </motion.div>
  </motion.div>
);

const TrackPickupModal = ({ batchId, onClose }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
  >
    <motion.div 
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl"
    >
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-neutral-dark text-xl">Track Collection</h3>
        <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <X className="w-5 h-5 text-neutral-gray" />
        </button>
      </div>
      
      <div className="mb-8">
        <p className="text-xs text-neutral-gray font-bold uppercase tracking-widest mb-1">Batch ID</p>
        <p className="text-lg font-black text-neutral-dark tracking-tight">#{batchId}</p>
      </div>
      
      <div className="space-y-0">
        {[
          { label: 'Batch Created', time: '26 Mar, 6:00 AM', status: 'completed' },
          { label: 'Assigned to City Municipality', time: '26 Mar, 6:01 AM', status: 'completed' },
          { label: 'Pickup Confirmed by Organization', time: '26 Mar, 9:00 AM', status: 'completed' },
          { label: 'Driver En Route', time: 'Expected by 6:00 PM', status: 'active' },
          { label: 'QR Scanned on Arrival', time: 'Pending', status: 'pending' },
          { label: 'Collection Complete', time: 'Pending', status: 'pending' },
        ].map((step, idx, arr) => (
          <div key={idx} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div className={`w-3 h-3 rounded-full mt-1.5 ${
                step.status === 'completed' ? 'bg-primary' : 
                step.status === 'active' ? 'bg-primary animate-pulse' : 'bg-gray-200'
              }`} />
              {idx !== arr.length - 1 && (
                <div className={`w-0.5 grow my-1 ${step.status === 'completed' ? 'bg-primary' : 'bg-gray-100'}`} />
              )}
            </div>
            <div className="pb-8">
              <p className={`text-sm font-bold ${step.status === 'pending' ? 'text-neutral-gray' : 'text-neutral-dark'}`}>{step.label}</p>
              <p className="text-[10px] font-bold text-neutral-gray uppercase tracking-widest mt-0.5">{step.time}</p>
            </div>
          </div>
        ))}
      </div>
      
      <button 
        onClick={onClose}
        className="w-full bg-gray-50 hover:bg-gray-100 text-neutral-dark py-4 rounded-xl font-bold text-sm transition-all active:scale-95 border border-gray-100"
      >
        Close
      </button>
    </motion.div>
  </motion.div>
);

const QrModal = ({ batch, onClose, showToast }) => {
  if (!batch) return null;
  const isUrgent = batch.due && batch.due.includes('URGENT');
  const typeIcon = batch.type === 'Organic' ? '🌱 ' : batch.type.includes('Recycle') && !batch.type.includes('Non') ? '♻️ ' : '🗑️ ';
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl text-center relative overflow-hidden" onClick={e => e.stopPropagation()}>
        {isUrgent && (
          <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-xs font-bold py-2 px-4 shadow-sm z-10">
            ⚠️ Pickup due TOMORROW — Contact {batch.partner} immediately
          </div>
        )}
        <div className={`flex justify-between items-center mb-6 pt-2 ${isUrgent ? 'mt-8' : ''}`}>
          <h3 className="font-bold text-neutral-dark text-xl">Batch QR Code — #{batch.id}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-neutral-gray" /></button>
        </div>
        <div className="text-left space-y-2 bg-gray-50 p-4 rounded-xl mb-6">
          <div className="flex justify-between text-sm"><span className="text-neutral-gray">Waste Type</span><span className="font-bold text-neutral-dark flex items-center gap-1">{typeIcon}{batch.type}</span></div>
          <div className="flex justify-between text-sm"><span className="text-neutral-gray">Weight</span><span className="font-bold text-primary">{batch.weight}</span></div>
          <div className="flex justify-between text-sm"><span className="text-neutral-gray">Generated</span><span className="font-bold text-neutral-dark">{batch.gen || batch.date}</span></div>
          <div className="flex justify-between text-sm"><span className="text-neutral-gray">Assigned To</span><span className="font-bold text-neutral-dark">{batch.partner}</span></div>
          <div className="flex justify-between text-sm"><span className="text-neutral-gray">Pickup Due</span><span className={`font-bold ${isUrgent ? 'text-red-600' : 'text-neutral-dark'}`}>{batch.due || batch.date}</span></div>
        </div>
        <div className="flex justify-center mb-4">
          <svg className="w-32 h-32" viewBox="0 0 100 100" fill="black">
            <rect width="100" height="100" fill="white" />
            <rect x="10" y="10" width="25" height="25" />
            <rect x="15" y="15" width="15" height="15" fill="white" />
            <rect x="18" y="18" width="9" height="9" />
            <rect x="65" y="10" width="25" height="25" />
            <rect x="70" y="15" width="15" height="15" fill="white" />
            <rect x="73" y="18" width="9" height="9" />
            <rect x="10" y="65" width="25" height="25" />
            <rect x="15" y="70" width="15" height="15" fill="white" />
            <rect x="18" y="73" width="9" height="9" />
            <rect x="40" y="10" width="20" height="10" />
            <rect x="45" y="25" width="15" height="15" />
            <rect x="10" y="40" width="15" height="20" />
            <rect x="30" y="45" width="25" height="25" />
            <rect x="60" y="40" width="30" height="15" />
            <rect x="40" y="75" width="15" height="15" />
            <rect x="65" y="60" width="10" height="30" />
            <rect x="80" y="70" width="10" height="20" />
          </svg>
        </div>
        <p className="text-xs text-neutral-gray mb-6 font-bold">Show this QR to the driver on arrival for verification</p>
        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => { showToast("QR Downloaded ✅"); onClose(); }} className="flex items-center justify-center gap-2 border border-primary text-primary hover:bg-primary/5 py-3 rounded-xl font-bold text-sm transition-all active:scale-95"><Download className="w-4 h-4" /> Download QR</button>
          <button onClick={onClose} className="bg-gray-100 hover:bg-gray-200 text-neutral-dark py-3 rounded-xl font-bold text-sm transition-all active:scale-95">Close</button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const BatchDetailsModal = ({ batch, onClose }) => {
  if (!batch) return null;
  const isCompleted = batch.status === 'Completed';
  const steps = [
    { label: 'Batch Created', date: batch.gen || batch.date },
    { label: `Assigned to ${batch.partner}`, date: '' },
    { label: 'QR Generated', date: '' },
    { label: `Picked Up on ${batch.date}`, date: '' },
    { label: 'Confirmed by Organization', date: '' }
  ];
  const currentStep = isCompleted ? 5 : batch.status === 'In Progress' ? 2 : batch.status === 'Pending' ? 1 : 0;
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-neutral-dark text-xl">Batch Details — #{batch.id}</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-neutral-gray" /></button>
        </div>
        <div className="space-y-3 mb-8 bg-gray-50 p-4 rounded-xl">
          <div className="flex justify-between text-sm"><span className="text-neutral-gray">Waste Type</span><span className="font-bold text-neutral-dark">{batch.type}</span></div>
          <div className="flex justify-between text-sm"><span className="text-neutral-gray">Weight</span><span className="font-bold text-primary">{batch.weight}</span></div>
          <div className="flex justify-between text-sm"><span className="text-neutral-gray">Organization</span><span className="font-bold text-neutral-dark">{batch.partner}</span></div>
          <div className="flex justify-between text-sm"><span className="text-neutral-gray">Pickup Date</span><span className="font-bold text-neutral-dark">{batch.date || batch.due}</span></div>
          <div className="flex justify-between text-sm"><span className="text-neutral-gray">Status</span><span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${isCompleted ? 'bg-green-100 text-green-700' : batch.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'}`}>{batch.status}</span></div>
        </div>
        <div className="space-y-4 mb-8 pl-2">
          {steps.map((step, idx) => (
            <div key={idx} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white ${idx < currentStep ? 'bg-primary' : 'bg-gray-200'}`}>
                  {idx < currentStep && <Check className="w-3 h-3" />}
                </div>
                {idx !== steps.length - 1 && <div className={`w-0.5 h-6 my-1 ${idx < currentStep - 1 ? 'bg-primary' : 'bg-gray-100'}`} />}
              </div>
              <div>
                <div className={`text-sm font-bold pt-0.5 ${idx < currentStep ? 'text-neutral-dark' : 'text-neutral-gray'}`}>{step.label}</div>
                {idx < currentStep && step.date && <div className="text-[10px] text-neutral-gray font-bold tracking-widest leading-none mt-1">{step.date}</div>}
              </div>
            </div>
          ))}
        </div>
        {isCompleted && (
          <div className="bg-green-100 text-green-700 py-3 rounded-xl text-center font-bold text-sm mb-6 border border-green-200">
            ✅ Completed
          </div>
        )}
        <button onClick={onClose} className="w-full bg-gray-100 hover:bg-gray-200 text-neutral-dark py-3 rounded-xl font-bold text-sm transition-all active:scale-95">Close</button>
      </motion.div>
    </motion.div>
  );
};

const ManualBatchModal = ({ onClose, onCreate }) => {
  const [step, setStep] = useState('form');
  const [formData, setFormData] = useState({ type: 'Organic', weight: '', reason: 'Sensor Malfunction', notes: '' });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-neutral-dark text-xl">⚠️ Create Batch Manually</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-neutral-gray" /></button>
        </div>
        
        {step === 'form' ? (
          <>
            <div className="bg-orange-50 border border-orange-100 text-orange-800 p-4 rounded-xl text-xs font-bold leading-relaxed mb-6">
              This option should ONLY be used if the automatic system has failed. Manual batches are flagged in system logs for technical review.
            </div>
            <div className="space-y-4 mb-8 text-left">
              <div>
                <label className="block text-[10px] font-black text-neutral-gray uppercase tracking-widest mb-1.5">Select Bin Type</label>
                <select 
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-neutral-dark focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow"
                  value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})}
                >
                  <option value="Organic">Organic</option>
                  <option value="Recyclable">Recyclable</option>
                  <option value="Non-Recyclable">Non-Recyclable</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-neutral-gray uppercase tracking-widest mb-1.5">Estimated Weight (kg)</label>
                <input 
                  type="number" 
                  placeholder="e.g. 150"
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-neutral-dark focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow"
                  value={formData.weight} onChange={e => setFormData({...formData, weight: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-neutral-gray uppercase tracking-widest mb-1.5">Reason for Manual Creation</label>
                <select 
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-neutral-dark focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow"
                  value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})}
                >
                  <option value="Sensor Malfunction">Sensor Malfunction</option>
                  <option value="Sensor Offline">Sensor Offline</option>
                  <option value="Emergency Overflow">Emergency Overflow</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-neutral-gray uppercase tracking-widest mb-1.5">Additional Notes</label>
                <textarea 
                  rows="2"
                  placeholder="Optional"
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-neutral-dark focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow resize-none"
                  value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={onClose} className="border border-gray-200 hover:bg-gray-50 text-neutral-dark py-3 rounded-xl font-bold text-sm transition-all active:scale-95">Cancel</button>
              <button onClick={() => setStep('confirm')} className="bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-md shadow-orange-200 active:scale-95">Create Batch</button>
            </div>
          </>
        ) : (
          <div className="py-4 text-center">
            <AlertTriangle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <h4 className="text-lg font-bold text-neutral-dark mb-2">Are you sure you want to manually create this batch?</h4>
            <p className="text-sm text-neutral-gray mb-8">This action will be logged.</p>
            <div className="grid grid-cols-1 gap-3">
              <button onClick={() => onCreate(formData)} className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-bold text-sm transition-all shadow-md shadow-orange-200 active:scale-95">Yes, Create Batch</button>
              <button onClick={() => setStep('form')} className="w-full bg-gray-100 hover:bg-gray-200 text-neutral-dark py-3 rounded-xl font-bold text-sm transition-all active:scale-95">Go Back</button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

const CollectionDetailsModal = ({ pickup, onClose }) => {
  if (!pickup) return null;
  const steps = ['Created', 'Notified', 'Confirmed', 'Arrived', 'Complete'];
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-neutral-dark text-xl">Collection Details</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-neutral-gray" /></button>
        </div>
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${pickup.statusColor} !bg-opacity-20`}>{pickup.initial}</div>
          <div>
            <h4 className="font-black text-neutral-dark">{pickup.partner}</h4>
            <div className="flex items-center gap-1 text-xs font-bold text-neutral-gray"><span className="text-base">{pickup.icon}</span> {pickup.type}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gray-50 p-3 rounded-xl">
            <p className="text-[10px] text-neutral-gray uppercase font-black tracking-widest mb-1">Batch ID</p>
            <p className="font-black text-neutral-dark">#{pickup.batch}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl">
            <p className="text-[10px] text-neutral-gray uppercase font-black tracking-widest mb-1">Weight</p>
            <p className="font-black text-primary">{pickup.weight}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-xl col-span-2">
            <p className="text-[10px] text-neutral-gray uppercase font-black tracking-widest mb-1">Scheduled for</p>
            <p className="font-bold text-neutral-dark">{pickup.date} • {pickup.time}</p>
          </div>
        </div>
        <div className="mb-6 space-y-3 pl-2">
          {steps.map((s, idx) => (
            <div key={idx} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className={`w-3 h-3 rounded-full mt-1.5 ${idx < pickup.step ? 'bg-primary' : 'bg-gray-200'}`} />
                {idx !== steps.length - 1 && <div className={`w-0.5 h-6 my-1 ${idx < pickup.step - 1 ? 'bg-primary' : 'bg-gray-100'}`} />}
              </div>
              <div className={`text-sm font-bold pt-0.5 ${idx < pickup.step ? 'text-neutral-dark' : 'text-neutral-gray'}`}>{s}</div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-6">
           <div className="w-12 h-12 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
             <QrCode className="w-6 h-6 text-neutral-gray opacity-40 shrink-0" />
           </div>
           <p className="text-xs font-bold text-neutral-gray">Driver will scan this on arrival</p>
        </div>
        <button onClick={onClose} className="w-full bg-gray-100 hover:bg-gray-200 text-neutral-dark py-3 rounded-xl font-bold text-sm transition-all active:scale-95">Close</button>
      </motion.div>
    </motion.div>
  );
};

const CollectionHistoryModal = ({ row, onClose }) => {
  if (!row) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-neutral-dark text-xl">Collection Summary</h3>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-neutral-gray" /></button>
        </div>
        <div className="space-y-4 mb-6">
          <div className="flex justify-between border-b border-gray-100 pb-3">
            <span className="text-sm text-neutral-gray">Date</span>
            <span className="text-sm font-bold text-neutral-dark">{row.date}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-3">
            <span className="text-sm text-neutral-gray">Batch ID</span>
            <span className="text-sm font-black text-neutral-dark">#{row.id}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-3">
            <span className="text-sm text-neutral-gray">Waste Type</span>
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${row.type === 'Organic' ? 'bg-green-100 text-green-700' : row.type === 'Recyclable' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}>{row.type}</span>
          </div>
          <div className="flex justify-between border-b border-gray-100 pb-3">
             <span className="text-sm text-neutral-gray">Weight</span>
             <span className="text-sm font-black text-primary">{row.weight}</span>
          </div>
          <div className="flex justify-between">
             <span className="text-sm text-neutral-gray">Organization</span>
             <span className="text-sm font-bold text-neutral-dark">{row.partner}</span>
          </div>
        </div>
        <div className="bg-green-50 p-4 rounded-xl mb-6">
           <div className="flex items-center gap-2 mb-2">
             <CheckCircle2 className="w-5 h-5 text-green-600" />
             <span className="font-bold text-green-700">QR Verified properly</span>
           </div>
           <p className="text-xs text-green-700/80">Organization driver scanned the respective QR code to accept weight and confirm completion.</p>
        </div>
        <button onClick={onClose} className="w-full bg-gray-100 hover:bg-gray-200 text-neutral-dark py-3 rounded-xl font-bold text-sm transition-all active:scale-95">Close</button>
      </motion.div>
    </motion.div>
  );
};

const PartnerDetailsModal = ({ org, onClose }) => {
  if (!org) return null;
  const perc = Math.round((org.collected / org.quota) * 100);
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-6">
          <div className={`w-14 h-14 rounded-2xl bg-${org.color}/10 text-${org.color} flex items-center justify-center font-black text-xl border border-${org.color}/20`}>
            {org.initial}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-neutral-gray" /></button>
        </div>
        <div className="mb-6">
          <h3 className="font-black text-neutral-dark text-xl">{org.name}</h3>
          <p className="text-sm text-neutral-gray font-medium">{org.type}</p>
        </div>
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2 text-sm font-bold text-neutral-dark bg-gray-50 p-3 rounded-xl">
             <Leaf className="w-4 h-4 text-primary" /> Collects: {org.waste}
          </div>
          <div className="bg-gray-50 p-4 rounded-xl">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-neutral-gray mb-2">
              <span>Monthly Quota Completion</span>
              <span className="text-neutral-dark">{org.collected} / {org.quota} kg</span>
            </div>
            <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden mb-2">
              <motion.div initial={{ width: 0 }} animate={{ width: `${perc}%` }} className={`h-full ${perc > 85 ? 'bg-primary' : perc > 60 ? 'bg-orange-500' : 'bg-blue-500'}`} />
            </div>
            <p className="text-xs font-bold text-neutral-gray">{perc}% collected so far</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
             <div className="bg-gray-50 p-3 rounded-xl flex flex-col items-center">
               <MapPin className="w-5 h-5 text-neutral-gray mb-1" />
               <span className="text-xs font-bold text-neutral-dark">{org.radius}</span>
             </div>
             <div className="bg-gray-50 p-3 rounded-xl flex flex-col items-center">
               <History className="w-5 h-5 text-neutral-gray mb-1" />
               <span className="text-xs font-bold text-neutral-dark">Since {org.since}</span>
             </div>
          </div>
          <div className="bg-primary/5 p-4 rounded-xl text-center border border-primary/10">
             <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-1">Total Collections Done</p>
             <p className="text-2xl font-black text-neutral-dark">142</p>
          </div>
        </div>
        <button onClick={onClose} className="w-full bg-gray-100 hover:bg-gray-200 text-neutral-dark py-3 rounded-xl font-bold text-sm transition-all active:scale-95">Close</button>
      </motion.div>
    </motion.div>
  );
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('Overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  const [batchFilter, setBatchFilter] = useState('All');
  const [selectedBatch, setSelectedBatch] = useState(null);
  const [selectedBatchDetails, setSelectedBatchDetails] = useState(null);
  const [selectedCollectionDetails, setSelectedCollectionDetails] = useState(null);
  const [selectedCollectionHistory, setSelectedCollectionHistory] = useState(null);
  const [selectedPartner, setSelectedPartner] = useState(null);
  const [selectedBinDetails, setSelectedBinDetails] = useState(null);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const [isManualBatchModalOpen, setIsManualBatchModalOpen] = useState(false);

  const [activeBatches, setActiveBatches] = useState([
    { id: '2024-088', type: 'Organic Waste', weight: '160 kg', gen: '25 Mar 2026, 6:00 AM', partner: 'GreenSoil Fertilizers', due: '25 Mar 2026 (Completed)', step: 4, status: 'Completed', statusColor: 'bg-green-100 text-green-700' },
    { id: '2024-089', type: 'Recyclable Waste', weight: '90 kg', gen: '25 Mar 2026, 6:00 AM', partner: 'GreenRoad Constructions', due: '28 Mar 2026', step: 2, status: 'In Progress', statusColor: 'bg-blue-100 text-blue-600' },
    { id: '2024-090', type: 'Non-Recyclable Waste', weight: '176 kg', gen: '26 Mar 2026, 6:00 AM', partner: 'City Municipality', due: '27 Mar 2026 (URGENT)', step: 2, status: 'Pending Pickup', statusColor: 'bg-orange-100 text-orange-600', urgent: true },
  ]);

  const [batchHistory, setBatchHistory] = useState([
    { id: '2024-080', type: 'Organic', weight: '162 kg', partner: 'GreenSoil Fertilizers', date: '20 Mar', status: 'Completed' },
    { id: '2024-081', type: 'Recyclable', weight: '145 kg', partner: 'GreenRoad Constructions', date: '21 Mar', status: 'Completed' },
    { id: '2024-082', type: 'Non-Recycle', weight: '178 kg', partner: 'City Municipality', date: '21 Mar', status: 'Completed' },
    { id: '2024-083', type: 'Organic', weight: '158 kg', partner: 'GreenSoil Fertilizers', date: '22 Mar', status: 'Completed' },
    { id: '2024-084', type: 'Recyclable', weight: '140 kg', partner: 'GreenRoad Constructions', date: '22 Mar', status: 'Completed' },
    { id: '2024-085', type: 'Non-Recycle', weight: '170 kg', partner: 'City Municipality', date: '23 Mar', status: 'Completed' },
    { id: '2024-086', type: 'Organic', weight: '155 kg', partner: 'GreenSoil Fertilizers', date: '23 Mar', status: 'Completed' },
    { id: '2024-087', type: 'Recyclable', weight: '138 kg', partner: 'GreenRoad Constructions', date: '24 Mar', status: 'Completed' },
    { id: '2024-088', type: 'Organic', weight: '160 kg', partner: 'GreenSoil Fertilizers', date: '25 Mar', status: 'Completed' },
    { id: '2024-089', type: 'Recyclable', weight: '90 kg', partner: 'GreenRoad Constructions', date: '28 Mar', status: 'In Progress' },
    { id: '2024-090', type: 'Non-Recycle', weight: '176 kg', partner: 'City Municipality', date: '27 Mar', status: 'Pending' },
  ]);

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [collectionFilter, setCollectionFilter] = useState('All');
  const [requestType, setRequestType] = useState('Organic');

  const [analyticsPeriod, setAnalyticsPeriod] = useState('This Month');
  const [settingsTab, setSettingsTab] = useState('Society Profile');
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Settings Toggles State
  const [toggles, setToggles] = useState({
    bin80: true,
    bin100: true,
    pickupSch: true,
    batchCreate: true,
    batchQr: true,
    orgConfirm: true,
    rankChange: true,
    milestone: true,
    dailyReport: false,
    twoFactor: false
  });
  
  const handleToggle = (key) => setToggles(prev => ({ ...prev, [key]: !prev[key] }));

  // Settings Sliders State
  const [sliders, setSliders] = useState({
    orgCollect: 80,
    orgWarn: 60,
    recCollect: 80,
    recWarn: 60,
    nonCollect: 80,
    nonWarn: 60
  });

  const handleSlider = (e, key) => setSliders(prev => ({...prev, [key]: parseInt(e.target.value)}));

  const navItems = [
    { id: 'Overview', icon: Home, label: 'Overview' },
    { id: 'Inventory', icon: Trash2, label: 'Bin Inventory' },
    { id: 'Batches', icon: Package, label: 'Batches' },
    { id: 'Collections', icon: Truck, label: 'Collections' },
    { id: 'Analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'Settings', icon: Settings, label: 'Settings' }
  ];

  const renderContent = () => {
    if (activeTab === 'Inventory') {
      return (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-neutral-dark">Bin Inventory</h1>
              <p className="text-sm text-neutral-gray">Real-time fill levels based on AI scanner logs</p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[10px] px-2 py-1 bg-gray-100 text-neutral-gray rounded-lg font-bold uppercase tracking-tight">Updated Daily</span>
              <p className="text-xs text-neutral-gray">Last updated: <span className="font-semibold">Today 6:00 AM</span></p>
            </div>
          </div>

          {/* ROW 1: Large Bin Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <LargeBinCard 
              type="Organic Waste"
              percentage={72}
              total={144}
              capacity={200}
              daysToFull="3"
              destination="GreenSoil Fertilizers"
              status="Pickup Scheduled"
              color="#F59E0B"
              history={[60, 65, 70, 68, 72, 74, 72]}
              onViewDetails={() => setSelectedBinDetails({type: 'Organic Waste', percentage: 72, total: 144, capacity: 200, daysToFull: '3', destination: 'GreenSoil Fertilizers', status: 'Pickup Scheduled', color: '#F59E0B', history: [60, 65, 70, 68, 72, 74, 72]})}
            />
            <LargeBinCard 
              type="Recyclable Waste"
              percentage={45}
              total={90}
              capacity={200}
              daysToFull="7"
              destination="GreenRoad Constructions"
              status="Active Collection"
              color="#16A34A"
              history={[30, 38, 42, 50, 55, 60, 90]}
              onViewDetails={() => setSelectedBinDetails({type: 'Recyclable Waste', percentage: 45, total: 90, capacity: 200, daysToFull: '7', destination: 'GreenRoad Constructions', status: 'Active Collection', color: '#16A34A', history: [30, 38, 42, 50, 55, 60, 90]})}
            />
            <LargeBinCard 
              type="Non-Recyclable Waste"
              percentage={88}
              total={176}
              capacity={200}
              daysToFull="1"
              destination="City Municipality"
              status="Urgent - Request Pickup"
              color="#EF4444"
              urgent
              history={[100, 120, 130, 140, 150, 165, 176]}
              onRequestPickup={() => showToast("Pickup request sent to City Municipality ✅")}
            />
          </div>

          {/* ROW 2: Performance Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-primary-light/10">
              <h3 className="font-bold text-neutral-dark">Bin Performance This Month</h3>
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[10px] text-neutral-gray uppercase font-black tracking-widest bg-gray-50">
                  <tr>
                    <th className="px-6 py-4">Bin Type</th>
                    <th className="px-6 py-4">Total Scans</th>
                    <th className="px-6 py-4">Avg Daily Input</th>
                    <th className="px-6 py-4">Total This Month</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-50">
                  {[
                    { type: '🌱 Organic', scans: '342', daily: '11.4 kg', total: '144 kg', status: 'Healthy', dot: 'bg-green-500' },
                    { type: '♻️ Recyclable', scans: '289', daily: '9.6 kg', total: '90 kg', status: 'Monitor', dot: 'bg-yellow-500' },
                    { type: '🗑️ Non-Recyclable', scans: '198', daily: '6.6 kg', total: '176 kg', status: 'Critical', dot: 'bg-red-500' },
                  ].map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? '' : 'bg-gray-50/30'}>
                      <td className="px-6 py-5 font-bold text-neutral-dark">{row.type}</td>
                      <td className="px-6 py-5 text-neutral-gray">{row.scans} scans</td>
                      <td className="px-6 py-5 font-medium text-neutral-dark">{row.daily}/day</td>
                      <td className="px-6 py-5 font-bold text-primary">{row.total}</td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${row.dot}`} />
                          <span className="font-semibold text-neutral-dark">{row.status}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-8">

            {/* ROW 4: Predictions */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-primary" />
                <h3 className="font-bold text-neutral-dark text-lg">AI Pickup Predictions</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
                {[
                  { type: 'Organic', text: 'Pickup needed in 3 days', date: '29 Mar', color: 'bg-orange-500', val: '72%', org: 'GreenSoil Fertilizers' },
                  { type: 'Recyclable', text: 'Pickup needed in 7 days', date: '2 Apr', color: 'bg-green-500', val: '45%', org: 'GreenRoad Constructions' },
                  { type: 'Non-Recyclable', text: 'Pickup needed TOMORROW', date: '27 Mar', color: 'bg-red-500', val: '88%', urgent: true, org: 'City Municipality' },
                ].map((pred, idx) => (
                  <div key={idx} className={`p-5 rounded-3xl border ${pred.urgent ? 'bg-red-50/50 border-red-200' : 'bg-white border-gray-100'} shadow-sm`}>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-neutral-dark text-sm">{pred.type}</h4>
                        <p className={`text-xs font-bold ${pred.urgent ? 'text-red-600' : 'text-primary'}`}>{pred.text}</p>
                      </div>
                      <span className="text-xs font-bold text-neutral-gray">{pred.date}</span>
                    </div>
                    <div className="h-2 w-full bg-gray-100 rounded-full mb-3 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: pred.val }}
                        className={`h-full ${pred.color}`}
                      />
                    </div>
                    <p className="text-[10px] text-neutral-gray uppercase font-bold tracking-widest">{pred.org}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'Batches') {
      const filteredHistory = batchHistory.filter(item => {
        if (batchFilter === 'All') return true;
        return item.status === batchFilter;
      });

      return (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-neutral-dark">Waste Batches</h1>
              <p className="text-sm text-neutral-gray">Auto-generated batches when bin reaches collection threshold</p>
            </div>
            <div className="relative">
              <button 
                onMouseEnter={() => setIsTooltipOpen(true)}
                onMouseLeave={() => setIsTooltipOpen(false)}
                onClick={() => setIsTooltipOpen(!isTooltipOpen)}
                className="flex items-center gap-2 bg-green-50 text-primary px-4 py-2 rounded-xl font-bold text-sm hover:bg-green-100 transition-colors"
              >
                <Info className="w-4 h-4" /> How Batches Work ?
              </button>
              <AnimatePresence>
                {isTooltipOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 top-full mt-2 w-72 bg-neutral-dark text-white p-4 rounded-2xl shadow-2xl z-50 text-xs leading-relaxed"
                  >
                    When a bin reaches 80% capacity, the system automatically creates a Batch and locks it for the nearest subscribed organization. The batch is released after the organization scans the QR code on pickup.
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* SYSTEM STATUS BAR */}
          <div className="bg-white p-4 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 mt-8 mb-2">
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-bold text-neutral-dark">Organic Sensor — <span className="text-green-600">Online</span></span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-bold text-neutral-dark">Recyclable Sensor — <span className="text-green-600">Online</span></span>
              </div>
              <div className="flex items-center gap-2 relative">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
                <span className="text-xs font-bold text-neutral-dark">Non-Recyclable Sensor — <span className="text-red-500">OFFLINE</span></span>
              </div>
            </div>
            <button 
              onClick={() => setIsManualBatchModalOpen(true)}
              className="flex items-center gap-2 text-xs font-bold border border-gray-200 text-neutral-dark hover:bg-gray-50 px-4 py-2 rounded-xl transition-colors active:scale-95"
            >
              <AlertTriangle className="w-4 h-4 text-orange-500" /> ⚠️ Manual Batch Creation Available
            </button>
          </div>

          {/* ROW 1: Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Batches', val: '24', sub: 'This month', icon: Layers, color: 'text-neutral-dark' },
              { label: 'Completed', val: '18', sub: 'Successful pickups', icon: Check, color: 'text-green-600', bg: 'bg-green-100' },
              { label: 'In Progress', val: '4', sub: 'Assigned to partners', icon: History, color: 'text-blue-600', bg: 'bg-blue-100' },
              { label: 'Pending Pickup', val: '2', sub: 'Threshold reached', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
            ].map((card, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-lg bg-gray-50 ${card.bg ? card.bg + ' !bg-opacity-50' : ''} ${card.color}`}>
                    <card.icon className="w-5 h-5" />
                  </div>
                </div>
                <h3 className="text-2xl font-black text-neutral-dark mb-1">{card.val}</h3>
                <p className="text-sm font-bold text-neutral-dark mb-1">{card.label}</p>
                <p className="text-[10px] text-neutral-gray uppercase font-black tracking-widest">{card.sub}</p>
              </div>
            ))}
          </div>

          {/* ROW 2: Active Batches */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-neutral-dark text-lg">Active Batches</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {activeBatches.map((batch, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`bg-white p-6 rounded-3xl shadow-sm border ${batch.urgent ? 'border-red-200 shadow-red-50 ring-1 ring-red-100' : 'border-gray-100'}`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="font-black text-neutral-dark">BATCH #{batch.id}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${batch.statusColor}`}>
                          {batch.status}
                        </span>
                        {batch.status === 'Manual Creation' && (
                          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-orange-500 text-white shadow-sm">
                            Manual
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-primary font-bold">
                      <Package className="w-5 h-5 opacity-40" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 mb-8">
                    <div>
                      <p className="text-[10px] text-neutral-gray uppercase font-black tracking-widest mb-1">Waste Weight</p>
                      <p className="text-xl font-black text-neutral-dark">{batch.weight}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-neutral-gray uppercase font-black tracking-widest mb-1">Pickup Due</p>
                      <p className={`text-sm font-bold ${batch.urgent ? 'text-red-600' : 'text-primary'}`}>{batch.due}</p>
                    </div>
                    <div className="col-span-2">
                       <p className="text-[10px] text-neutral-gray uppercase font-black tracking-widest mb-1">Assigned Partner</p>
                       <p className="text-sm font-bold text-neutral-dark">{batch.partner}</p>
                    </div>
                  </div>

                  <div className="mb-8">
                    <div className="flex justify-between text-[10px] font-bold text-neutral-gray uppercase mb-4">
                       <span>Progress</span>
                       <span className="text-primary italic">Step {batch.step + 1} of 4</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {['Batch Created', 'Assigned', 'Awaiting Pickup', 'Confirmed'].map((s, idx) => (
                        <div key={idx} className="flex-1">
                          <div className={`h-1.5 rounded-full mb-2 ${
                            idx < batch.step ? 'bg-primary' : idx === batch.step ? 'bg-primary animate-pulse' : 'bg-gray-100'
                          }`} />
                          <p className={`text-[8px] font-bold text-center ${idx === batch.step ? 'text-primary' : 'text-neutral-gray'}`}>{s}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {batch.status === 'Completed' ? (
                    <div className="flex items-center gap-4 p-4 bg-green-50 rounded-2xl border border-green-100 text-green-700">
                      <CheckCircle2 className="w-8 h-8 opacity-50" />
                      <div>
                        <p className="text-sm font-bold mb-0.5">Pickup Complete</p>
                        <p className="text-[10px] font-bold tracking-widest uppercase opacity-80">Moves to history in 24h</p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-6 p-4 bg-gray-50 rounded-2xl">
                      <div className="w-16 h-16 bg-white rounded-xl border border-gray-200 flex items-center justify-center">
                        <QrCode className="w-8 h-8 text-neutral-gray opacity-40 shrink-0" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs font-bold text-neutral-gray mb-2">Driver will scan this on arrival</p>
                        <button 
                          onClick={() => setSelectedBatch(batch)}
                          className="w-full border border-primary text-primary hover:bg-primary/5 py-2 rounded-xl font-bold text-xs transition-all active:scale-95"
                        >
                          View QR Code
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>

          {/* ROW 3: History Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-neutral-dark">Batch History</h3>
              </div>
              <div className="flex bg-gray-50 p-1 rounded-xl">
                {['All', 'Completed', 'In Progress', 'Pending'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setBatchFilter(tab)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      batchFilter === tab ? 'bg-white text-primary shadow-sm' : 'text-neutral-gray hover:text-neutral-dark'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[10px] text-neutral-gray uppercase font-black tracking-widest bg-gray-50">
                  <tr>
                    <th className="px-6 py-4">Batch ID</th>
                    <th className="px-6 py-4">Waste Type</th>
                    <th className="px-6 py-4">Weight</th>
                    <th className="px-6 py-4">Assigned To</th>
                    <th className="px-6 py-4">Pickup Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {filteredHistory.map((row, idx) => (
                    <tr key={idx} className={`border-b border-gray-50/50 hover:bg-gray-50/30 transition-colors ${
                      row.status === 'In Progress' ? 'bg-blue-50/20' : row.status === 'Pending' ? 'bg-orange-50/20' : ''
                    }`}>
                      <td className="px-6 py-5 font-bold text-neutral-dark">#{row.id}</td>
                      <td className="px-6 py-5 text-neutral-gray font-medium">{row.type}</td>
                      <td className="px-6 py-5 font-bold text-neutral-dark">{row.weight}</td>
                      <td className="px-6 py-5 text-neutral-gray">{row.partner}</td>
                      <td className="px-6 py-5 font-bold text-neutral-dark">{row.date}</td>
                      <td className="px-6 py-5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          row.status === 'Completed' ? 'bg-green-100 text-green-700' :
                          row.status === 'In Progress' ? 'bg-blue-100 text-blue-700' : 'bg-orange-100 text-orange-700'
                        }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <button 
                          onClick={() => setSelectedBatchDetails(row)}
                          className="text-primary hover:text-primary-dark font-bold text-xs flex items-center gap-1"
                        >
                          View <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* ROW 4: Points */}
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-neutral-dark text-lg">Points Earned From Batches</h3>
              <p className="text-sm text-neutral-gray">Eco points are awarded after organization confirms pickup</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { type: 'Organic', pts: '420', count: '9 completed batches', icon: Leaf, color: 'text-green-600' },
                { type: 'Recyclable', pts: '310', count: '7 completed batches', icon: Recycle, color: 'text-blue-600' },
                { type: 'Non-Recyclable', pts: '130', count: '2 completed batches', icon: Trash2, color: 'text-red-600' },
              ].map((p, i) => (
                <div key={i} className="bg-white p-6 rounded-3xl border border-gray-100 flex items-center gap-4">
                  <div className={`p-3 rounded-2xl bg-gray-50 ${p.color}`}>
                    <p.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-black text-xl text-neutral-dark">{p.pts} <span className="text-xs font-bold text-neutral-gray">pts earned</span></h4>
                    <p className="text-xs font-bold text-neutral-gray uppercase tracking-widest">{p.count}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="bg-primary p-6 rounded-3xl text-center text-white shadow-lg shadow-primary/20">
              <p className="text-lg font-black">Total: 860 Eco Points earned this month 🎉</p>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'Collections') {
      const historyData = [
        { date: '25 Mar', id: '2024-087', type: 'Recyclable', weight: '138 kg', partner: 'GreenRoad Constructions', qr: true, status: 'Completed' },
        { date: '24 Mar', id: '2024-086', type: 'Organic', weight: '155 kg', partner: 'GreenSoil Fertilizers', qr: true, status: 'Completed' },
        { date: '23 Mar', id: '2024-085', type: 'Non-Recycle', weight: '170 kg', partner: 'City Municipality', qr: true, status: 'Completed' },
        { date: '22 Mar', id: '2024-084', type: 'Recyclable', weight: '140 kg', partner: 'GreenRoad Constructions', qr: true, status: 'Completed' },
        { date: '22 Mar', id: '2024-083', type: 'Organic', weight: '158 kg', partner: 'GreenSoil Fertilizers', qr: true, status: 'Completed' },
        { date: '21 Mar', id: '2024-082', type: 'Non-Recycle', weight: '178 kg', partner: 'City Municipality', qr: true, status: 'Completed' },
        { date: '21 Mar', id: '2024-081', type: 'Recyclable', weight: '145 kg', partner: 'GreenRoad Constructions', qr: true, status: 'Completed' },
        { date: '20 Mar', id: '2024-080', type: 'Organic', weight: '162 kg', partner: 'GreenSoil Fertilizers', qr: true, status: 'Completed' },
      ];

      const filteredCollectionHistory = historyData.filter(item => {
        if (collectionFilter === 'All' || collectionFilter === 'This Month') return true;
        if (collectionFilter === 'This Week') {
          return ['25 Mar', '24 Mar'].includes(item.date);
        }
        return true;
      });

      return (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-neutral-dark">Collection Schedule</h1>
              <p className="text-sm text-neutral-gray">All scheduled and completed pickups by assigned organizations</p>
            </div>
            <button 
              onClick={() => setIsRequestModalOpen(true)}
              className="bg-primary hover:bg-primary-dark text-white px-6 py-2.5 rounded-full font-bold text-sm transition-all active:scale-95 shadow-lg shadow-primary/20 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Request Pickup
            </button>
          </div>

          {/* ROW 1: Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Collections', val: '31', sub: 'This month', icon: Truck, color: 'text-neutral-dark' },
              { label: 'Completed', val: '28', sub: 'Successfully picked up', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
              { label: 'Upcoming', val: '3', sub: 'Confirmed schedules', icon: CalendarDays, color: 'text-blue-600', bg: 'bg-blue-100' },
              { label: 'Missed', val: '0', sub: 'Excellent record!', icon: X, color: 'text-gray-400', bg: 'bg-gray-100' },
            ].map((card, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:border-primary/20 transition-all group">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors ${card.bg || 'bg-gray-50'} ${card.color}`}>
                  <card.icon className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-black text-neutral-dark mb-1">{card.val}</h3>
                <p className="text-sm font-bold text-neutral-dark mb-1">{card.label}</p>
                <p className="text-[10px] text-neutral-gray uppercase font-black tracking-widest">{card.sub}</p>
              </div>
            ))}
          </div>

          {/* ROW 2: Upcoming Pickups */}
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-neutral-dark text-lg">Upcoming Pickups</h3>
              <p className="text-sm text-neutral-gray">Confirmed collections scheduled by assigned organizations</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { type: 'Organic', icon: '🌱', partner: 'GreenSoil Fertilizers', initial: 'GS', date: 'Tomorrow, 27 Mar', time: '10:00 AM', batch: '2024-091', weight: '~162 kg', statusColor: 'bg-green-50 text-green-700', status: 'Confirmed', step: 3 },
                { type: 'Recyclable', icon: '♻️', partner: 'GreenRoad Constructions', initial: 'GR', date: '28 Mar 2026', time: '2:00 PM', batch: '2024-089', weight: '90 kg', statusColor: 'bg-blue-50 text-blue-700', status: 'Scheduled', step: 2 },
                { type: 'Non-Recyclable', icon: '🗑️', partner: 'City Municipality', initial: 'CM', date: 'Today, 26 Mar', time: '6:00 PM', batch: '2024-090', weight: '176 kg', statusColor: 'bg-red-50 text-red-700', status: 'Urgent', step: 3, urgent: true },
              ].map((pickup, i) => (
                <div key={i} className={`bg-white p-6 rounded-3xl border transition-all ${pickup.urgent ? 'border-red-200 shadow-red-50/50 shadow-xl' : 'border-gray-100 shadow-sm'}`}>
                  <div className="flex justify-between items-start mb-6">
                    <span className="text-xl">{pickup.icon}</span>
                    <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${pickup.statusColor}`}>{pickup.status}</span>
                  </div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${pickup.statusColor} !bg-opacity-20`}>{pickup.initial}</div>
                    <div>
                      <h4 className="text-sm font-black text-neutral-dark">{pickup.partner}</h4>
                      <p className="text-xs text-neutral-gray line-clamp-1">{pickup.date} • {pickup.time}</p>
                    </div>
                  </div>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-gray">Batch ID</span>
                      <span className="font-bold text-neutral-dark">#{pickup.batch}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-neutral-gray">Est. Weight</span>
                      <span className="font-bold text-primary">{pickup.weight}</span>
                    </div>
                  </div>
                  <div className="text-[10px] text-neutral-gray font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    Driver with QR scanner
                  </div>
                  <div className="space-y-1 mb-8">
                    {['Created', 'Notified', 'Confirmed', 'Arrived', 'Complete'].map((s, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${idx < pickup.step ? 'bg-primary' : 'bg-gray-200'}`} />
                        <span className={`text-[10px] font-bold uppercase ${idx < pickup.step ? 'text-primary' : 'text-neutral-gray'}`}>{s}</span>
                      </div>
                    ))}
                  </div>
                  <button 
                    onClick={() => pickup.urgent ? setIsTrackModalOpen(true) : setSelectedCollectionDetails({ ...pickup, statusColor: pickup.statusColor || 'bg-blue-100 text-blue-700' })}
                    className={`w-full py-3 rounded-xl font-bold text-xs transition-all active:scale-95 ${
                      pickup.urgent ? 'bg-red-500 text-white shadow-lg shadow-red-200' : 'border border-primary text-primary hover:bg-green-50'
                    }`}
                  >
                    {pickup.urgent ? 'Track Pickup' : 'View Batch Details'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ROW 3: Waste Partners */}
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-neutral-dark text-lg">Our Waste Partners</h3>
              <p className="text-sm text-neutral-gray">Organizations subscribed to collect from Raghuma Hostel</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: 'GreenSoil Fertilizers', initial: 'GS', type: 'Fertilizer Plant 🌱', waste: 'Organic Waste', quota: 500, collected: 462, since: 'Jan 2026', radius: '8 km', color: 'primary' },
                { name: 'GreenRoad Constructions', initial: 'GR', type: 'Construction Firm 🏗️', waste: 'Recyclable Waste', quota: 400, collected: 285, since: 'Feb 2026', radius: '12 km', color: 'blue' },
                { name: 'City Municipality', initial: 'CM', type: 'Municipal Authority 🏙️', waste: 'Non-Recyclable Waste', quota: 600, collected: 528, since: 'Jan 2026', radius: '20 km', color: 'neutral-dark' },
              ].map((org, i) => {
                const perc = Math.round((org.collected / org.quota) * 100);
                return (
                  <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-12 h-12 rounded-2xl bg-${org.color}/10 text-${org.color} flex items-center justify-center font-black text-lg border border-${org.color}/20`}>
                        {org.initial}
                      </div>
                      <div>
                        <h4 className="font-black text-neutral-dark tracking-tight">{org.name}</h4>
                        <p className="text-xs text-neutral-gray font-medium">{org.type}</p>
                      </div>
                    </div>
                    <div className="space-y-4 mb-6">
                      <div className="flex items-center gap-2 text-xs font-bold text-neutral-dark">
                        <Leaf className="w-3.5 h-3.5 text-primary" />
                        {org.waste}
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-neutral-gray mb-2">
                          <span>Monthly Quota</span>
                          <span className="text-neutral-dark">{org.collected} / {org.quota} kg</span>
                        </div>
                        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${perc}%` }}
                            className={`h-full ${perc > 85 ? 'bg-primary' : perc > 60 ? 'bg-orange-500' : 'bg-blue-500'}`}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="text-[10px] font-bold text-neutral-gray px-2 py-1 bg-gray-50 rounded-lg flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {org.radius}
                      </span>
                      <span className="text-[10px] font-bold text-neutral-gray px-2 py-1 bg-gray-50 rounded-lg flex items-center gap-1">
                        <History className="w-3 h-3" /> Since {org.since}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ROW 4: History Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-neutral-dark">Collection History</h3>
              </div>
              <div className="flex bg-gray-50 p-1 rounded-xl">
                {['All', 'This Week', 'This Month'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setCollectionFilter(tab)}
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      collectionFilter === tab ? 'bg-white text-primary shadow-sm' : 'text-neutral-gray hover:text-neutral-dark'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="text-[10px] text-neutral-gray uppercase font-black tracking-widest bg-gray-50">
                  <tr>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Batch ID</th>
                    <th className="px-6 py-4">Waste Type</th>
                    <th className="px-6 py-4">Weight</th>
                    <th className="px-6 py-4">Organization</th>
                    <th className="px-6 py-4">QR Verified</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Action</th>
                  </tr>
                </thead>
                <tbody className="text-sm divide-y divide-gray-50">
                   {filteredCollectionHistory.length > 0 ? filteredCollectionHistory.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-5 font-bold text-neutral-gray">{row.date}</td>
                      <td className="px-6 py-5 font-black text-neutral-dark tracking-tight">#{row.id}</td>
                      <td className="px-6 py-5">
                         <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          row.type === 'Organic' ? 'bg-green-100 text-green-700' : 
                          row.type === 'Recyclable' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {row.type}
                        </span>
                      </td>
                      <td className="px-6 py-5 font-black text-primary">{row.weight}</td>
                      <td className="px-6 py-5 text-neutral-dark font-medium">{row.partner}</td>
                      <td className="px-6 py-5 font-bold text-primary">✅ Yes</td>
                      <td className="px-6 py-5">
                         <span className="inline-flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
                           <Check className="w-2.5 h-2.5" /> COMPLETED
                         </span>
                      </td>
                      <td className="px-6 py-5">
                        <button onClick={() => setSelectedCollectionHistory(row)} className="text-primary hover:text-primary-dark font-bold text-xs flex items-center gap-1">
                          View <ChevronRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                   )) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-12 text-center text-neutral-gray">
                        No collections found for {collectionFilter}.
                      </td>
                    </tr>
                   )}
                </tbody>
              </table>
            </div>
            <div className="p-4 border-t border-gray-50 flex justify-center">
              <nav className="flex items-center gap-1">
                {[1, 2, 3].map(p => (
                  <button key={p} className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${p === 1 ? 'bg-primary text-white shadow-lg' : 'hover:bg-gray-100 text-neutral-gray'}`}>
                    {p}
                  </button>
                ))}
                <button className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 text-neutral-gray">
                   <ChevronRight className="w-4 h-4" />
                </button>
              </nav>
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'Analytics') {
      const getBarData = () => {
        if (analyticsPeriod === 'This Week') {
          return [
            { day: 'Mon', organic: 13, recyclable: 7, non: 13 },
            { day: 'Tue', organic: 14, recyclable: 9, non: 11 },
            { day: 'Wed', organic: 11, recyclable: 11, non: 10 },
            { day: 'Thu', organic: 15, recyclable: 10, non: 12 },
            { day: 'Fri', organic: 12, recyclable: 8, non: 14 },
          ];
        }
        if (analyticsPeriod === 'This Year') {
          return [
            { day: 'Jan', organic: 480, recyclable: 310, non: 520 },
            { day: 'Feb', organic: 510, recyclable: 340, non: 540 },
            { day: 'Mar', organic: 144, recyclable: 90, non: 176 },
          ];
        }
        // This Month Default
        return [
          { day: '1 Mar', organic: 12, recyclable: 8, non: 14 },
          { day: '5 Mar', organic: 15, recyclable: 10, non: 12 },
          { day: '10 Mar', organic: 10, recyclable: 12, non: 15 },
          { day: '15 Mar', organic: 14, recyclable: 9, non: 11 },
          { day: '20 Mar', organic: 11, recyclable: 11, non: 10 },
          { day: '26 Mar', organic: 13, recyclable: 7, non: 13 },
        ];
      };

      const getPieData = () => {
        if (analyticsPeriod === 'This Week') {
          return [
            { name: 'Organic', value: 65, color: '#16A34A' },
            { name: 'Recyclable', value: 45, color: '#3B82F6' },
            { name: 'Non-Recyclable', value: 60, color: '#6B7280' },
          ];
        }
        if (analyticsPeriod === 'This Year') {
          return [
            { name: 'Organic', value: 1134, color: '#16A34A' },
            { name: 'Recyclable', value: 740, color: '#3B82F6' },
            { name: 'Non-Recyclable', value: 1236, color: '#6B7280' },
          ];
        }
        return [
          { name: 'Organic', value: 144, color: '#16A34A' },
          { name: 'Recyclable', value: 90, color: '#3B82F6' },
          { name: 'Non-Recyclable', value: 176, color: '#6B7280' },
        ];
      };

      const barData = getBarData();
      const pieData = getPieData();
      const totalPieValue = pieData.reduce((acc, curr) => acc + curr.value, 0);

      const lineData = [
        { month: 'Jan', points: 280 },
        { month: 'Feb', points: 565 },
        { month: 'Mar', points: 860 },
      ];

      return (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-neutral-dark">Analytics</h1>
              <p className="text-sm text-neutral-gray">Track your society's waste diversion performance over time</p>
            </div>
            <div className="flex bg-gray-50 p-1 rounded-xl">
              {['This Week', 'This Month', 'This Year'].map((t) => (
                <button
                  key={t}
                  onClick={() => setAnalyticsPeriod(t)}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    analyticsPeriod === t ? 'bg-primary text-white shadow-lg' : 'text-neutral-gray hover:text-neutral-dark'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* ROW 1: KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Waste Diverted', val: '1,240 kg', sub: '↑ 12% vs last month', icon: Package, color: 'text-green-600' },
              { label: 'Avg Daily Input', val: '41.3 kg/day', sub: 'Across all 3 bins', icon: Activity, color: 'text-neutral-dark' },
              { label: 'Current Eco Points', val: '860 pts', sub: '↑ 95 pts this month', icon: Award, color: 'text-green-600' },
              { label: 'Diversion Rate', val: '94.2%', sub: 'Diverted from landfill', icon: TrendingUp, color: 'text-primary' },
            ].map((card, i) => (
              <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 transition-all hover:border-primary/20">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center mb-4 text-neutral-dark">
                  <card.icon className="w-5 h-5" />
                </div>
                <h3 className="text-2xl font-black text-neutral-dark mb-1 tracking-tight">{card.val}</h3>
                <p className="text-sm font-bold text-neutral-dark mb-1">{card.label}</p>
                <p className={`text-[10px] uppercase font-black tracking-widest ${card.color}`}>{card.sub}</p>
              </div>
            ))}
          </div>

          {/* ROW 2: Mixed Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-neutral-dark text-lg mb-6">Waste Diverted ({analyticsPeriod})</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#9CA3AF'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#9CA3AF'}} />
                    <Tooltip 
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px'}}
                      cursor={{fill: '#F9FAFB'}}
                    />
                    <Legend iconType="circle" wrapperStyle={{paddingTop: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px'}} />
                    <Bar name="Organic" dataKey="organic" fill="#16A34A" radius={[4, 4, 0, 0]} />
                    <Bar name="Recyclable" dataKey="recyclable" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    <Bar name="Non-Recyclable" dataKey="non" fill="#6B7280" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
              <h3 className="font-bold text-neutral-dark text-lg mb-6">Waste Type Distribution</h3>
              <div className="h-[250px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-black text-neutral-dark">{totalPieValue}</span>
                  <span className="text-[10px] font-bold text-neutral-gray uppercase tracking-widest">kg total</span>
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {pieData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{backgroundColor: d.color}} />
                      <span className="text-neutral-gray">{d.name}</span>
                    </div>
                    <span className="text-neutral-dark">{d.value} kg ({Math.round(d.value/totalPieValue*100)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ROW 3: Growth & Efficiency */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-neutral-dark text-lg mb-6">Eco Points Growth (This Year)</h3>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={lineData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#9CA3AF'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#9CA3AF'}} />
                    <Tooltip 
                      contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px'}}
                    />
                    <ReferenceLine y={1000} stroke="#EF4444" strokeDasharray="3 3" label={{value: 'A++ Threshold', position: 'insideBottomRight', fontSize: 10, fontWeight: 'bold', fill: '#EF4444'}} />
                    <Line type="monotone" dataKey="points" stroke="#16A34A" strokeWidth={4} dot={{fill: '#16A34A', strokeWidth: 2, r: 6, stroke: '#fff'}} activeDot={{r: 8}} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-neutral-dark text-lg mb-6">Collection Efficiency</h3>
              <div className="space-y-6">
                {[
                  { label: 'Organic Collection Rate', val: 92, kg: '462 / 500', color: 'bg-primary' },
                  { label: 'Recyclable Collection Rate', val: 71, kg: '285 / 400', color: 'bg-blue-500' },
                  { label: 'Non-Recycle Collection Rate', val: 88, kg: '528 / 600', color: 'bg-neutral-dark' },
                ].map((eff, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center mb-2">
                       <span className="text-xs font-bold text-neutral-dark">{eff.label}</span>
                       <span className="text-xs font-black text-neutral-dark">{eff.val}%</span>
                    </div>
                    <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden mb-1">
                       <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${eff.val}%` }}
                        className={`h-full ${eff.color}`}
                       />
                    </div>
                    <div className="flex justify-between text-[10px] font-bold text-neutral-gray uppercase tracking-widest">
                       <span>Collected / Quota</span>
                       <span>{eff.kg} kg</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ROW 4: Comparison Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
             <div className="p-6 border-b border-gray-50">
               <h3 className="font-bold text-neutral-dark">Month-on-Month Performance</h3>
             </div>
             <div className="overflow-x-auto">
               <table className="w-full text-left">
                 <thead className="bg-gray-50 text-[10px] font-black uppercase tracking-widest text-neutral-gray">
                   <tr>
                     <th className="px-6 py-4">Month</th>
                     <th className="px-6 py-4">Organic (kg)</th>
                     <th className="px-6 py-4">Recyclable (kg)</th>
                     <th className="px-6 py-4">Non-Recyclable (kg)</th>
                     <th className="px-6 py-4">Total (kg)</th>
                     <th className="px-6 py-4">Eco Points</th>
                     <th className="px-6 py-4">Rank</th>
                   </tr>
                 </thead>
                 <tbody className="text-sm divide-y divide-gray-50">
                   {[
                     { month: 'Jan 2026', org: '480', rec: '310', non: '520', tot: '1,310', pts: '280', rank: 'B+', color: 'text-orange-600', bg: 'bg-orange-50' },
                     { month: 'Feb 2026', org: '510', rec: '340', non: '540', tot: '1,390', pts: '285', rank: 'A', color: 'text-blue-600', bg: 'bg-blue-50' },
                     { month: 'Mar 2026', org: '144', rec: '90', non: '176', tot: '410', pts: '95', rank: 'A+', inProg: true, color: 'text-primary', bg: 'bg-green-50' },
                   ].map((row, i) => (
                    <tr key={i} className={`hover:bg-gray-50/50 transition-colors ${row.inProg ? 'bg-primary/5' : ''}`}>
                      <td className="px-6 py-5 font-bold text-neutral-dark">
                        {row.month}
                        {row.inProg && <span className="ml-2 bg-primary text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest">In Progress</span>}
                      </td>
                      <td className="px-6 py-5 font-medium text-neutral-gray">{row.org}</td>
                      <td className="px-6 py-5 font-medium text-neutral-gray">{row.rec}</td>
                      <td className="px-6 py-5 font-medium text-neutral-gray">{row.non}</td>
                      <td className="px-6 py-5 font-black text-neutral-dark">{row.tot}</td>
                      <td className="px-6 py-5 font-black text-primary">+{row.pts}</td>
                      <td className="px-6 py-5">
                         <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${row.bg} ${row.color}`}>
                           {row.rank}
                         </span>
                      </td>
                    </tr>
                   ))}
                 </tbody>
               </table>
             </div>
          </div>

          {/* ROW 5: Insights */}
          <div className="space-y-6">
            <div>
              <h3 className="font-bold text-neutral-dark text-lg">💡 AI Insights</h3>
              <p className="text-sm text-neutral-gray">Auto-generated observations based on your data</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { type: 'Positive', msg: 'Your Organic waste diversion increased by 18% compared to last month. Keep it up!', icon: TrendingUp, color: 'border-green-500 bg-green-50 text-green-700' },
                { type: 'Warning', msg: 'Recyclable collection efficiency is at 71%. GreenRoad Constructions still has 29% quota remaining — more pickups expected.', icon: AlertTriangle, color: 'border-yellow-500 bg-yellow-50 text-yellow-700' },
                { type: 'Goal', msg: 'You need 140 more Eco Points to reach A++. At your current rate you will achieve it by 8th April 2026.', icon: Award, color: 'border-blue-500 bg-blue-50 text-blue-700' },
              ].map((ins, i) => (
                <div key={i} className={`p-6 rounded-3xl border-l-[6px] shadow-sm ${ins.color}`}>
                  <ins.icon className="w-5 h-5 mb-4 opacity-70" />
                  <p className="text-sm font-bold leading-relaxed">{ins.msg}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (activeTab === 'Settings') {
      const settingsNav = [
        { id: 'Society Profile', icon: User },
        { id: 'Notifications', icon: Bell },
        { id: 'Bin Configuration', icon: Trash2 },
        { id: 'Partner Organizations', icon: Users },
        { id: 'Security', icon: Shield },
        { id: 'Documents', icon: FileText },
      ];

      return (
        <div className="space-y-8 animate-in fade-in duration-500 pb-20">
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-neutral-dark">Settings</h1>
              <p className="text-sm text-neutral-gray">Manage your society profile and preferences</p>
            </div>
            {(settingsTab === 'Society Profile' || settingsTab === 'Security' || settingsTab === 'Bin Configuration') && (
              <button 
                onClick={() => showToast(settingsTab === 'Security' ? 'Password updated successfully ✅' : 'Profile updated successfully ✅')}
                className="bg-primary hover:bg-primary-dark text-white px-8 py-2.5 rounded-full font-bold text-sm transition-all active:scale-95 shadow-lg shadow-primary/20 whitespace-nowrap"
              >
                {settingsTab === 'Security' ? 'Update Password' : 'Save Changes'}
              </button>
            )}
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* LEFT MENU */}
            <div className="w-full md:w-[30%] space-y-2">
              {settingsNav.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setSettingsTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl transition-all font-bold text-sm ${
                    settingsTab === item.id 
                      ? 'bg-primary text-white shadow-md' 
                      : 'text-neutral-gray hover:bg-primary/5 hover:text-primary'
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.id}
                </button>
              ))}
            </div>

            {/* RIGHT CONTENT PANEL */}
            <div className="w-full md:w-[70%]">
              
              {/* Society Profile */}
              {settingsTab === 'Society Profile' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <div>
                    <h2 className="text-xl font-bold text-neutral-dark">Society Profile</h2>
                    <p className="text-sm text-neutral-gray">Basic information about your society</p>
                  </div>
                  
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary text-3xl font-black border-4 border-white shadow-lg">
                        RH
                      </div>
                      <button className="flex items-center gap-2 text-sm font-bold text-primary hover:text-primary-dark transition-colors">
                        <Upload className="w-4 h-4" /> Upload Logo
                      </button>
                    </div>
                    
                    <div className="flex-1 space-y-6 w-full">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-neutral-gray uppercase tracking-widest mb-2">Society Name</label>
                          <input type="text" defaultValue="Raghuma Hostel" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-neutral-dark focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-neutral-gray uppercase tracking-widest mb-2">Society Type</label>
                          <select defaultValue="University Hostel" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-neutral-dark focus:ring-2 focus:ring-primary/20 outline-none transition-all">
                            <option>Apartment</option>
                            <option>Gated Community</option>
                            <option>RWA</option>
                            <option>University Hostel</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-neutral-gray uppercase tracking-widest mb-2">City</label>
                          <input type="text" defaultValue="Greater Noida" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-neutral-dark focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-neutral-gray uppercase tracking-widest mb-2">Pincode</label>
                          <input type="text" defaultValue="201310" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-neutral-dark focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-bold text-neutral-gray uppercase tracking-widest mb-2">Full Address</label>
                        <textarea defaultValue="Knowledge Park III, Greater Noida, Uttar Pradesh" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-neutral-dark focus:ring-2 focus:ring-primary/20 outline-none transition-all h-24 resize-none" />
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs font-bold text-neutral-gray uppercase tracking-widest mb-2">Total Units / Flats</label>
                          <input type="number" defaultValue="240" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-neutral-dark focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-neutral-gray uppercase tracking-widest mb-2">Registered Since</label>
                          <input type="text" value="January 2026" disabled className="w-full bg-gray-100 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-gray-400 cursor-not-allowed" />
                        </div>
                      </div>

                      <div className="pt-6 border-t border-gray-100">
                        <h3 className="font-bold text-neutral-dark mb-4">Admin Contact</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-neutral-gray uppercase tracking-widest mb-2">Admin Name</label>
                            <input type="text" defaultValue="Raghuma Admin" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-neutral-dark focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-neutral-gray uppercase tracking-widest mb-2">Email Address</label>
                            <input type="email" defaultValue="admin@raghumahostel.in" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-neutral-dark focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-neutral-gray uppercase tracking-widest mb-2">Phone Number</label>
                            <input type="tel" defaultValue="+91 98765 43210" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-neutral-dark focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                          </div>
                        </div>
                      </div>
                      
                      <button 
                        onClick={() => showToast('Profile updated successfully ✅')}
                        className="w-full md:w-auto bg-primary hover:bg-primary-dark text-white px-8 py-4 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-primary/20 md:hidden"
                      >
                        Save Profile
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications */}
              {settingsTab === 'Notifications' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <div>
                    <h2 className="text-xl font-bold text-neutral-dark">Notification Preferences</h2>
                    <p className="text-sm text-neutral-gray">Choose what alerts you want to receive</p>
                  </div>
                  
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50">
                      <h3 className="flex items-center gap-2 font-bold text-neutral-dark"><Trash2 className="w-5 h-5 text-neutral-gray" /> Bin Alerts</h3>
                    </div>
                    <div className="p-6 space-y-6">
                      {[
                        { label: 'Notify when bin reaches 80% capacity', key: 'bin80' },
                        { label: 'Notify when bin is full (100%)', key: 'bin100' },
                        { label: 'Notify when pickup is scheduled', key: 'pickupSch' },
                      ].map((t) => (
                        <div key={t.key} className="flex items-center justify-between">
                          <span className="text-sm font-bold text-neutral-dark">{t.label}</span>
                          <button onClick={() => handleToggle(t.key)} className={`w-12 h-6 rounded-full transition-colors relative ${toggles[t.key] ? 'bg-primary' : 'bg-gray-200'}`}>
                            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${toggles[t.key] ? 'left-7' : 'left-1'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                      <h3 className="flex items-center gap-2 font-bold text-neutral-dark"><Package className="w-5 h-5 text-neutral-gray" /> Batch Alerts</h3>
                    </div>
                    <div className="p-6 space-y-6">
                      {[
                        { label: 'Notify when new batch is created', key: 'batchCreate' },
                        { label: 'Notify when batch QR is generated', key: 'batchQr' },
                        { label: 'Notify when organization confirms pickup', key: 'orgConfirm' },
                      ].map((t) => (
                        <div key={t.key} className="flex items-center justify-between">
                          <span className="text-sm font-bold text-neutral-dark">{t.label}</span>
                          <button onClick={() => handleToggle(t.key)} className={`w-12 h-6 rounded-full transition-colors relative ${toggles[t.key] ? 'bg-primary' : 'bg-gray-200'}`}>
                            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${toggles[t.key] ? 'left-7' : 'left-1'}`} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                      <h3 className="flex items-center gap-2 font-bold text-neutral-dark"><Award className="w-5 h-5 text-neutral-gray" /> Leaderboard Alerts</h3>
                    </div>
                    <div className="p-6 space-y-6">
                      {[
                        { label: 'Notify when rank changes', key: 'rankChange' },
                        { label: 'Notify when eco points milestone reached', key: 'milestone' },
                        { label: 'Daily summary report at 6:00 AM', key: 'dailyReport' },
                      ].map((t) => (
                        <div key={t.key} className="flex items-center justify-between">
                          <span className="text-sm font-bold text-neutral-dark">{t.label}</span>
                          <button onClick={() => handleToggle(t.key)} className={`w-12 h-6 rounded-full transition-colors relative ${toggles[t.key] ? 'bg-primary' : 'bg-gray-200'}`}>
                            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${toggles[t.key] ? 'left-7' : 'left-1'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Bin Configuration */}
              {settingsTab === 'Bin Configuration' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <div>
                    <h2 className="text-xl font-bold text-neutral-dark">Bin Configuration</h2>
                    <p className="text-sm text-neutral-gray">Set capacity thresholds for your waste bins</p>
                  </div>

                  <div className="space-y-6">
                    {[
                      { type: 'Organic Bin 🌱', color: 'primary', current: '144 kg (72%)', cKey: 'orgCollect', wKey: 'orgWarn' },
                      { type: 'Recyclable Bin ♻️', color: 'blue', current: '90 kg (45%)', cKey: 'recCollect', wKey: 'recWarn' },
                      { type: 'Non-Recyclable Bin 🗑️', color: 'neutral-dark', current: '176 kg (88%)', cKey: 'nonCollect', wKey: 'nonWarn' },
                    ].map((bin, i) => (
                      <div key={i} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col gap-6">
                        <div className="flex justify-between items-center">
                          <h3 className="font-black text-lg text-neutral-dark">{bin.type}</h3>
                          <div className="text-right">
                             <p className="text-[10px] text-neutral-gray uppercase font-black tracking-widest">Current Fill</p>
                             <p className="text-sm font-bold text-neutral-dark">{bin.current}</p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                          <div>
                            <label className="block text-xs font-bold text-neutral-gray uppercase tracking-widest mb-2">Max Capacity (kg)</label>
                            <input type="number" defaultValue="200" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-neutral-dark focus:ring-2 focus:ring-primary/20 outline-none transition-all" />
                          </div>
                          
                          <div className="col-span-2 space-y-6">
                            <div>
                               <div className="flex justify-between mb-2">
                                 <label className="text-xs font-bold text-neutral-gray uppercase tracking-widest">Collection Threshold (Batch trigger)</label>
                                 <span className="text-xs font-black text-neutral-dark">{sliders[bin.cKey]}%</span>
                               </div>
                               <input type="range" min="50" max="100" value={sliders[bin.cKey]} onChange={(e) => handleSlider(e, bin.cKey)} className={`w-full h-2 rounded-full appearance-none cursor-pointer ${
                                  bin.color === 'primary' ? 'bg-primary/20 accent-primary' : bin.color === 'blue' ? 'bg-blue-500/20 accent-blue-500' : 'bg-gray-200 accent-neutral-dark'
                               }`} />
                            </div>
                            <div>
                               <div className="flex justify-between mb-2">
                                 <label className="text-xs font-bold text-neutral-gray uppercase tracking-widest">Warning Alert at</label>
                                 <span className="text-xs font-black text-neutral-dark">{sliders[bin.wKey]}%</span>
                               </div>
                               <input type="range" min="30" max="90" value={sliders[bin.wKey]} onChange={(e) => handleSlider(e, bin.wKey)} className="w-full h-2 rounded-full appearance-none cursor-pointer bg-yellow-500/20 accent-yellow-500" />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="bg-primary-light/10 text-primary-dark p-4 rounded-xl flex gap-3 items-start border border-primary/20">
                      <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                      <p className="text-sm font-bold">Changing thresholds will directly affect when batches are auto-generated and locked for pickup by your assigned organizations.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Partner Organizations */}
              {settingsTab === 'Partner Organizations' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <div>
                    <h2 className="text-xl font-bold text-neutral-dark">Subscribed Organizations</h2>
                    <p className="text-sm text-neutral-gray">Organizations currently assigned to collect your waste</p>
                  </div>
                  
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
                    {[
                      { name: 'GreenSoil Fertilizers', type: 'Fertilizer Plant', waste: 'Organic Waste', since: 'Jan 2026', initial: 'GS', color: 'primary' },
                      { name: 'GreenRoad Constructions', type: 'Construction Firm', waste: 'Recyclable Waste', since: 'Feb 2026', initial: 'GR', color: 'blue' },
                      { name: 'City Municipality', type: 'Municipal Authority', waste: 'Non-Recyclable Waste', since: 'Jan 2026', initial: 'CM', color: 'neutral-dark' },
                    ].map((org, i) => (
                      <div key={i} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-gray-50/50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-2xl bg-${org.color}/10 text-${org.color} flex items-center justify-center font-black text-lg`}>
                            {org.initial}
                          </div>
                          <div>
                            <h3 className="font-bold text-neutral-dark">{org.name}</h3>
                            <p className="text-xs text-neutral-gray">{org.type} • {org.waste}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap items-center gap-4">
                          <span className="text-[10px] font-bold text-neutral-gray uppercase tracking-widest">Since {org.since}</span>
                          <span className="px-3 py-1 bg-green-50 text-green-700 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-100 hidden sm:block">Active</span>
                          <button onClick={() => setSelectedPartner(org)} className="px-4 py-2 border border-primary text-primary hover:bg-primary/5 rounded-xl text-xs font-bold transition-colors">
                            View Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-green-50 border border-green-200 text-green-800 p-4 rounded-xl flex gap-3 items-start">
                    <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-bold">Organizations are auto-assigned based on proximity and their subscription quota. Please contact UrbanEco-Link support if you need to manually change your assigned organizations.</p>
                  </div>
                </div>
              )}

              {/* Security */}
              {settingsTab === 'Security' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <div>
                    <h2 className="text-xl font-bold text-neutral-dark">Security Settings</h2>
                    <p className="text-sm text-neutral-gray">Manage your account security and sessions</p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                    <h3 className="font-bold text-neutral-dark mb-6">Change Password</h3>
                    <div className="space-y-4">
                      <div className="relative">
                        <label className="block text-xs font-bold text-neutral-gray uppercase tracking-widest mb-2">Current Password</label>
                        <input type={showPassword ? "text" : "password"} defaultValue="password123" className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-neutral-dark focus:ring-2 focus:ring-primary/20 outline-none transition-all pr-12" />
                        <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-9 text-neutral-gray hover:text-neutral-dark transition-colors">
                          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                        <div className="relative">
                          <label className="block text-xs font-bold text-neutral-gray uppercase tracking-widest mb-2">New Password</label>
                          <input type={showNewPassword ? "text" : "password"} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-neutral-dark focus:ring-2 focus:ring-primary/20 outline-none transition-all pr-12" />
                          <button onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-9 text-neutral-gray hover:text-neutral-dark transition-colors">
                            {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        <div className="relative">
                          <label className="block text-xs font-bold text-neutral-gray uppercase tracking-widest mb-2">Confirm New Password</label>
                          <input type={showConfirmPassword ? "text" : "password"} className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-bold text-neutral-dark focus:ring-2 focus:ring-primary/20 outline-none transition-all pr-12" />
                          <button onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-9 text-neutral-gray hover:text-neutral-dark transition-colors">
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>
                      <button 
                        onClick={() => showToast('Password updated successfully ✅')}
                        className="w-full md:w-auto mt-4 bg-primary hover:bg-primary-dark text-white px-8 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-primary/20 md:hidden"
                      >
                        Update Password
                      </button>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-neutral-dark mb-1">Two-Factor Authentication (2FA)</h3>
                      <p className="text-sm text-neutral-gray">Add an extra layer of security to your account</p>
                    </div>
                    <button onClick={() => handleToggle('twoFactor')} className={`w-12 h-6 rounded-full transition-colors relative ${toggles['twoFactor'] ? 'bg-primary' : 'bg-gray-200'}`}>
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${toggles['twoFactor'] ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>

                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 border-b border-gray-50 flex justify-between items-center">
                      <h3 className="font-bold text-neutral-dark">Active Sessions</h3>
                      <button className="text-xs font-bold text-red-500 hover:text-red-700 transition-colors">Sign out all other sessions</button>
                    </div>
                    <div className="divide-y divide-gray-50">
                      <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-neutral-dark"><Monitor className="w-5 h-5" /></div>
                          <div>
                            <p className="text-sm font-bold text-neutral-dark">Chrome on Mac</p>
                            <p className="text-xs text-neutral-gray">Greater Noida, IN</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="text-xs font-bold text-green-700">Active now</span>
                        </div>
                      </div>
                      <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-neutral-dark"><Smartphone className="w-5 h-5" /></div>
                          <div>
                            <p className="text-sm font-bold text-neutral-dark">Mobile App</p>
                            <p className="text-xs text-neutral-gray">Greater Noida, IN</p>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-neutral-gray text-right">2 hours ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Documents */}
              {settingsTab === 'Documents' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                  <div>
                    <h2 className="text-xl font-bold text-neutral-dark">Society Documents</h2>
                    <p className="text-sm text-neutral-gray">Uploaded verification and certification documents</p>
                  </div>
                  
                  <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
                    {[
                      { name: 'Society Registration Certificate', date: 'Uploaded Jan 2026', status: 'Verified ✅', bg: 'bg-green-50', color: 'text-green-700', active: true },
                      { name: 'Admin ID Proof', date: 'Uploaded Jan 2026', status: 'Verified ✅', bg: 'bg-green-50', color: 'text-green-700', active: true },
                      { name: 'City Champion Certificate 2026', date: 'Awarded to top society at year end', status: 'Not Yet Awarded 🏆', bg: 'bg-gray-100', color: 'text-gray-500', active: false },
                    ].map((doc, i) => (
                      <div key={i} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex gap-4">
                          <FileText className="w-8 h-8 text-neutral-gray shrink-0" />
                          <div>
                            <h3 className="font-bold text-neutral-dark">{doc.name}</h3>
                            <p className="text-xs text-neutral-gray mt-1">{doc.date}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 self-end sm:self-auto">
                          <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${doc.bg} ${doc.color}`}>{doc.status}</span>
                          <button disabled={!doc.active} className={`px-6 py-2 rounded-xl text-xs font-bold border transition-colors ${doc.active ? 'border-primary text-primary hover:bg-primary/5' : 'border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'}`}>
                            {doc.active ? 'View' : 'Pending'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-2 border-dashed border-gray-200 rounded-3xl p-10 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer group">
                    <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Upload className="w-8 h-8" />
                    </div>
                    <h3 className="font-bold text-neutral-dark mb-1">Drag and drop or click to upload</h3>
                    <p className="text-xs text-neutral-gray uppercase font-bold tracking-widest">Accepted formats: PDF, JPG, PNG</p>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      );
    }

    if (activeTab !== 'Overview') {
      const TabIcon = navItems.find(i => i.id === activeTab)?.icon || Home;
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
          <div className="w-20 h-20 bg-primary-light/30 rounded-full flex items-center justify-center mb-6">
            <TabIcon className="w-10 h-10 text-primary" />
          </div>
          <h2 className="text-2xl font-bold text-neutral-dark mb-2">{activeTab}</h2>
          <p className="text-neutral-gray italic">This module is under development. Coming soon!</p>
        </div>
      );
    }

    return (
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* ROW 1: Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Current Rank" 
            value="A+" 
            subtext="Top 15% in your city"
            icon={Award} 
            colorClass="bg-yellow-50 text-yellow-600"
          />
          <StatCard 
            title="Total Diverted" 
            value="1,240 kg" 
            subtext="This month"
            trend="12%"
            icon={Recycle} 
            colorClass="bg-green-50 text-green-600"
          />
          <StatCard 
            title="Avg Daily Input" 
            value="27.6 kg" 
            subtext="Last 30 days average"
            icon={TrendingUp} 
            colorClass="bg-blue-50 text-blue-600"
          />
          <StatCard 
            title="Next Pickup" 
            value="Tomorrow, 10:00 AM" 
            subtext="GreenRoad Constructions"
            icon={Clock} 
            colorClass="bg-orange-50 text-orange-600"
          />
        </div>

        {/* ROW 2: Bin Inventory */}
        <div>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-xl font-bold text-neutral-dark">Live Bin Inventory</h2>
            <span className="text-[10px] px-2 py-1 bg-gray-100 text-neutral-gray rounded-lg font-bold uppercase tracking-tight">Updated Daily</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <BinCard 
              type="Organic Waste"
              percentage={72}
              total={144}
              capacity={200}
              daysToFull={3}
              destination="GreenSoil Fertilizers"
              status="Pickup Scheduled"
            />
            <BinCard 
              type="Recyclable Waste"
              percentage={45}
              total={90}
              capacity={200}
              daysToFull={7}
              destination="GreenRoad Constructions"
              status="Active Collection"
            />
            <BinCard 
              type="Non-Recyclable"
              percentage={88}
              total={176}
              capacity={200}
              daysToFull={1}
              destination="City Municipality"
              status="Urgent - Request Pickup"
              urgent
            />
          </div>
        </div>

        {/* ROW 3: Scan Log & Collections */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="font-bold text-neutral-dark text-lg">Today's Bin Scan Log</h3>
                <p className="text-sm text-neutral-gray">Logged automatically by weight sensor when item dropped</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50 text-xs text-neutral-gray uppercase tracking-wider">
                    <th className="py-4 font-bold">Time</th>
                    <th className="py-4 font-bold">Waste Type</th>
                    <th className="py-4 font-bold">Weight Added</th>
                    <th className="py-4 font-bold">Bin Updated</th>
                    <th className="py-4 font-bold">Running Total</th>
                  </tr>
                </thead>
                <tbody className="text-sm">
                  {[
                    { time: '9:42 AM', type: 'Organic', weight: '+2.4 kg', bin: '🌱 Organic Bin', total: '144 kg' },
                    { time: '9:31 AM', type: 'Recyclable', weight: '+1.8 kg', bin: '♻️ Recyclable Bin', total: '90 kg' },
                    { time: '9:15 AM', type: 'Organic', weight: '+3.1 kg', bin: '🌱 Organic Bin', total: '141 kg' },
                    { time: '8:58 AM', type: 'Non-Recyclable', weight: '+0.9 kg', bin: '🗑️ Non-Recycle Bin', total: '176 kg' },
                    { time: '8:45 AM', type: 'Recyclable', weight: '+2.2 kg', bin: '♻️ Recyclable Bin', total: '88 kg' },
                  ].map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-50/50">
                      <td className="py-4 font-medium text-neutral-gray">{row.time}</td>
                      <td className="py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          row.type === 'Organic' ? 'bg-green-100 text-green-700' : 
                          row.type === 'Recyclable' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'
                        }`}>
                          {row.type}
                        </span>
                      </td>
                      <td className="py-4 font-black text-primary">{row.weight}</td>
                      <td className="py-4 font-medium text-neutral-dark">{row.bin}</td>
                      <td className="py-4 font-bold text-neutral-dark">{row.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button className="w-full py-4 mt-2 text-sm font-bold text-primary hover:text-primary-dark border-t border-gray-50 text-center transition-colors">
              View Full Log
            </button>
          </div>

          <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-neutral-dark text-lg mb-6">Collection Schedule</h3>
            <div className="space-y-4">
              {[
                { org: 'GreenSoil Fertilizers', initial: 'GF', type: 'Organic', time: 'Tomorrow 10AM', status: 'Confirmed', color: 'bg-green-100 text-green-700' },
                { org: 'GreenRoad Constructions', initial: 'GR', type: 'Recyclable', time: '28 Mar', status: 'Scheduled', color: 'bg-blue-100 text-blue-700' },
                { org: 'City Municipality', initial: 'CM', type: 'Non-Recyclable', time: 'Today 6PM', status: 'Urgent', color: 'bg-red-100 text-red-700' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                      {item.initial}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-neutral-dark">{item.org}</h4>
                      <p className="text-xs text-neutral-gray">{item.type} • {item.time}</p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${item.color}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ROW 4: Points & Rank Progress */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
            <div>
              <h3 className="font-bold text-neutral-dark text-xl mb-2">Your Eco Points Journey</h3>
              <div className="flex items-center gap-4">
                <span className="text-5xl font-black text-primary">860</span>
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-neutral-gray uppercase tracking-widest">Points</span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded-full">
                    <Award className="w-3 h-3" /> A+ RANK
                  </span>
                </div>
              </div>
            </div>
            <div className="text-left md:text-right">
              <p className="text-sm text-neutral-gray mb-1">Next Milestone: <span className="font-bold text-primary">A++</span></p>
              <p className="text-xs text-neutral-gray">You need <span className="text-primary font-black">140 more points</span> to reach A++!</p>
            </div>
          </div>

          <div className="relative pt-6 pb-12">
            <div className="h-4 w-full bg-gray-100 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '86%' }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-primary relative"
              />
            </div>
            
            {/* Markers */}
            {[
              { label: 'C', pts: 200, left: '20%' },
              { label: 'B', pts: 400, left: '40%' },
              { label: 'B+', pts: 600, left: '60%' },
              { label: 'A', pts: 700, left: '70%' },
              { label: 'A+', pts: 800, left: '80%' },
              { label: 'A++', pts: 1000, left: '100%' },
            ].map((m, idx) => (
              <div key={idx} className="absolute top-4 flex flex-col items-center" style={{ left: m.left, transform: 'translateX(-50%)' }}>
                <div className="w-1 h-8 bg-gray-200" />
                <span className="text-[10px] font-black text-neutral-gray mt-1">{m.label}</span>
                <span className="text-[8px] text-neutral-gray/60">{m.pts}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-gray-50">
            <div className="text-center">
              <span className="block text-lg font-bold text-green-600">420</span>
              <span className="text-[10px] text-neutral-gray uppercase font-bold">🌱 Organic</span>
            </div>
            <div className="text-center border-x border-gray-100">
              <span className="block text-lg font-bold text-blue-600">310</span>
              <span className="text-[10px] text-neutral-gray uppercase font-bold">♻️ Recyclable</span>
            </div>
            <div className="text-center">
              <span className="block text-lg font-bold text-gray-600">130</span>
              <span className="text-[10px] text-neutral-gray uppercase font-bold">🗑️ Non-Recyclable</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50/50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-gray-100 flex-col sticky top-0 h-screen">
        <div className="p-6">
          <div className="flex items-center gap-2 mb-8">
            <Leaf className="w-8 h-8 text-primary fill-primary/20" />
            <span className="text-xl font-bold text-primary-dark tracking-tight">UrbanEco-Link</span>
          </div>
          <div className="h-px bg-gray-100 mb-8" />
          <nav className="space-y-2">
            {navItems.map((item) => (
              <SidebarItem 
                key={item.id}
                {...item}
                active={activeTab === item.id}
                onClick={() => setActiveTab(item.id)}
              />
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-gray-100 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">RH</div>
            <div>
              <p className="text-sm font-bold text-neutral-dark">Raghuma Hostel</p>
              <p className="text-[10px] text-neutral-gray uppercase font-bold tracking-widest">Society Admin</p>
            </div>
          </div>
          <button className="w-full flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-600 transition-colors px-2">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header Bar */}
        <header className="bg-white border-b border-gray-100 sticky top-0 z-40">
          <div className="px-6 h-20 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-neutral-dark">Good Morning, Admin 👋</h2>
              <p className="text-xs text-neutral-gray">Today is {new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative p-2 text-neutral-gray hover:bg-gray-100 rounded-full transition-colors cursor-pointer">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-[10px] text-white flex items-center justify-center rounded-full font-bold">3</span>
              </div>
              <button className="hidden sm:flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-5 py-2.5 rounded-full text-sm font-bold transition-all shadow-md hover:shadow-lg active:scale-95">
                <Plus className="w-4 h-4" />
                Request Pickup
              </button>
              {/* Mobile Menu Toggle */}
              <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-2 text-neutral-dark">
                <Menu />
              </button>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          {renderContent()}
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/50 z-[60] lg:hidden"
            />
            <motion.div 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              className="fixed inset-y-0 left-0 w-72 bg-white z-[70] p-6 lg:hidden flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-2">
                  <Leaf className="w-8 h-8 text-primary fill-primary/20" />
                  <span className="text-xl font-bold text-primary-dark">UrbanEco-Link</span>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-neutral-gray">
                  <X />
                </button>
              </div>
              <nav className="space-y-2 flex-1">
                {navItems.map((item) => (
                  <SidebarItem 
                    key={item.id}
                    {...item}
                    active={activeTab === item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                  />
                ))}
              </nav>
              <div className="pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">RH</div>
                  <div>
                    <h4 className="text-sm font-bold text-neutral-dark">Raghuma Hostel</h4>
                    <p className="text-[10px] text-neutral-gray font-bold">SOCIETY ADMIN</p>
                  </div>
                </div>
                <button className="flex items-center gap-2 text-red-500 font-bold text-sm">
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 flex justify-between items-center z-50">
        {[
          { icon: Home, label: 'Home', id: 'Overview' },
          { icon: Trash2, label: 'Bins', id: 'Inventory' },
          { icon: Package, label: 'Batches', id: 'Batches' },
          { icon: Truck, label: 'Trucks', id: 'Collections' },
        ].map((item) => (
          <button 
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 ${activeTab === item.id ? 'text-primary' : 'text-neutral-gray'}`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-bold">{item.label}</span>
          </button>
        ))}
      </nav>
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 md:bottom-12 left-1/2 -translate-x-1/2 z-[100]"
          >
            <div className="bg-neutral-dark text-white px-6 py-3 rounded-full shadow-2xl font-bold text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              {toast}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedBatch && (
          <QrModal 
            batch={selectedBatch} 
            onClose={() => setSelectedBatch(null)} 
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedBatchDetails && <BatchDetailsModal batch={selectedBatchDetails} onClose={() => setSelectedBatchDetails(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {selectedCollectionDetails && <CollectionDetailsModal pickup={selectedCollectionDetails} onClose={() => setSelectedCollectionDetails(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {selectedCollectionHistory && <CollectionHistoryModal row={selectedCollectionHistory} onClose={() => setSelectedCollectionHistory(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {selectedPartner && <PartnerDetailsModal org={selectedPartner} onClose={() => setSelectedPartner(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {selectedBinDetails && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedBinDetails(null)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl p-8 max-w-sm w-full shadow-2xl relative" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-neutral-dark text-xl">{selectedBinDetails.type}</h3>
                <button onClick={() => setSelectedBinDetails(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors"><X className="w-5 h-5 text-neutral-gray" /></button>
              </div>
              <div className="flex items-center justify-center mb-6">
                <CircularGauge percentage={selectedBinDetails.percentage} color={selectedBinDetails.color} />
              </div>
              <div className="space-y-3 mb-8 bg-gray-50 p-4 rounded-xl">
                <div className="flex justify-between text-sm"><span className="text-neutral-gray">Status</span><span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${selectedBinDetails.urgent ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-700'}`}>{selectedBinDetails.status}</span></div>
                <div className="flex justify-between text-sm"><span className="text-neutral-gray">Current Fill</span><span className="font-bold text-neutral-dark">{selectedBinDetails.total} kg / {selectedBinDetails.capacity} kg</span></div>
                <div className="flex justify-between text-sm"><span className="text-neutral-gray">Days to Full</span><span className={`font-bold ${selectedBinDetails.urgent ? 'text-red-500' : 'text-neutral-dark'}`}>{selectedBinDetails.daysToFull} days</span></div>
                <div className="flex justify-between text-sm"><span className="text-neutral-gray">Destination Partner</span><span className="font-bold text-primary">{selectedBinDetails.destination}</span></div>
              </div>
              <div className="mb-6">
                 <p className="text-[10px] text-neutral-gray uppercase font-bold tracking-widest mb-3 flex items-center gap-2"><History className="w-3 h-3" /> 7-Day Fill History</p>
                 <MiniBarChart data={selectedBinDetails.history} color={selectedBinDetails.color} />
              </div>
              <button onClick={() => setSelectedBinDetails(null)} className="w-full bg-gray-100 hover:bg-gray-200 text-neutral-dark py-3 rounded-xl font-bold text-sm transition-all active:scale-95">Close</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isRequestModalOpen && (
          <RequestPickupModal 
            onClose={() => setIsRequestModalOpen(false)}
            onSubmit={() => {
              setIsRequestModalOpen(false);
              showToast("Pickup request sent successfully ✅");
            }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isTrackModalOpen && (
          <TrackPickupModal 
            batchId="2024-090"
            onClose={() => setIsTrackModalOpen(false)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isManualBatchModalOpen && (
          <ManualBatchModal 
            onClose={() => setIsManualBatchModalOpen(false)}
            onCreate={(data) => {
              const newBatch = {
                id: `2024-${Math.floor(100 + Math.random() * 900)}`,
                type: `${data.type} Waste`,
                weight: `${data.weight} kg`,
                gen: 'Just Now (Manual)',
                partner: data.type === 'Organic' ? 'GreenSoil Fertilizers' : data.type === 'Recyclable' ? 'GreenRoad Constructions' : 'City Municipality',
                due: 'Pending Assessment',
                step: 0,
                status: 'Manual Creation',
                statusColor: 'bg-orange-100 text-orange-600',
                urgent: data.type === 'Non-Recyclable' || data.reason === 'Emergency Overflow'
              };
              setActiveBatches([newBatch, ...activeBatches]);
              
              const newHistoryRow = {
                id: newBatch.id,
                type: data.type,
                weight: newBatch.weight,
                partner: newBatch.partner,
                date: 'Just Now',
                status: 'Pending'
              };
              setBatchHistory([newHistoryRow, ...batchHistory]);
              
              setIsManualBatchModalOpen(false);
              showToast("Batch created manually ✅ — Logged for technical review");
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
