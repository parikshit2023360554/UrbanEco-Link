import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import pickupService from '../services/pickupService';
import batchService from '../services/batchService';
import authService from '../services/authService';
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
  ScanLine
} from 'lucide-react';

const DeliveryPartnerDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // QR Scanning state
  const [qrToken, setQrToken] = useState('');
  const [scanning, setScanning] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(null);
  const [scanError, setScanError] = useState(null);

  // Active pickups
  const [pickups, setPickups] = useState([]);
  const [loadingPickups, setLoadingPickups] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
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
        society_name: b.society_name,
        stream_category: b.stream_category,
        estimated_weight_kg: b.weight_kg,
        qr_code_token: b.qr_code,
        status: b.status === 'IN_TRANSIT' ? 'OUT_FOR_DELIVERY' : b.status === 'PENDING_PICKUP' ? 'REQUESTED' : b.status,
        assigned_driver: b.driver_name,
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

  const handleScanSubmit = async (e) => {
    if (e) e.preventDefault();
    setAlertSuccess(null);
    setScanError(null);

    const tokenToScan = qrToken.trim();
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

      setAlertSuccess(res.alert || res.message || 'Pickup verified! Marked as IN_TRANSIT / Out for Delivery to Factory.');
      setQrToken('');

      // Refresh pickups list
      await fetchPickups();
    } catch (err) {
      setScanError(err.message || 'Scanning failed. QR Code Token not found.');
    } finally {
      setScanning(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const outForDeliveryPickups = pickups.filter((p) => p.status === 'OUT_FOR_DELIVERY');
  const requestedPickups = pickups.filter((p) => p.status === 'REQUESTED');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Header Navbar */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <span className="font-bold text-lg text-white">UrbanEco Link</span>
              <span className="ml-2 text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                Delivery Partner Portal
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-semibold text-slate-200">{user?.name || 'Driver Alex Rivera'}</p>
              <p className="text-xs text-slate-400">Truck #402 • Verified Logistics</p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-8">
        {/* Banner Alert on QR Verification Success */}
        {alertSuccess && (
          <div className="p-4 bg-emerald-50 border-2 border-emerald-500/30 rounded-2xl text-emerald-800 flex items-center gap-3 animate-in fade-in shadow-sm">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <div className="flex-1">
              <p className="font-bold text-base">{alertSuccess}</p>
              <p className="text-xs text-emerald-700 mt-0.5">
                The waste bin is now tracked live and ready for intake at the Factory Processing Plant.
              </p>
            </div>
            <button 
              onClick={() => setAlertSuccess(null)}
              className="text-xs text-emerald-700 hover:text-emerald-900 font-bold underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* QR Code Scanner Interface */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

          <div className="max-w-2xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
              <ScanLine className="w-4 h-4 text-emerald-600" />
              Live QR Scanner Engine
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Scan Waste Bin QR Code
            </h1>
            <p className="text-sm text-slate-500 max-w-lg mx-auto">
              Scan or enter the unique <code className="bg-slate-100 px-2 py-0.5 rounded font-mono text-emerald-700 font-semibold">qr_code_token</code> attached to the society bulk waste bin to mark it as <strong>Out for Delivery</strong>.
            </p>

            {/* Error Message */}
            {scanError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center justify-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>{scanError}</span>
              </div>
            )}

            {/* Scan Form */}
            <form onSubmit={handleScanSubmit} className="space-y-4 max-w-md mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={qrToken}
                  onChange={(e) => setQrToken(e.target.value)}
                  placeholder="e.g. QR_WET_89234"
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-200 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10 outline-none text-center text-lg font-mono tracking-wider font-semibold uppercase bg-slate-50 focus:bg-white transition-all"
                />
                <QrCode className="w-6 h-6 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2" />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={scanning}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white py-4 rounded-2xl font-bold text-base transition-all shadow-lg shadow-emerald-600/20 active:scale-95 flex items-center justify-center gap-2"
                >
                  {scanning ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Verifying QR Code...
                    </>
                  ) : (
                    <>
                      <ScanLine className="w-5 h-5" />
                      Scan Waste Bin QR
                    </>
                  )}
                </button>
              </div>

              {/* Sample QR Codes for quick demo testing */}
              {requestedPickups.length > 0 && (
                <div className="pt-4 border-t border-slate-100 text-left">
                  <p className="text-xs font-semibold text-slate-400 mb-2">Quick Test - Click requested QR to test:</p>
                  <div className="flex flex-wrap gap-2">
                    {requestedPickups.slice(0, 4).map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setQrToken(p.qr_code_token)}
                        className="text-xs font-mono bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 border border-slate-200 px-2.5 py-1 rounded-lg transition-all"
                      >
                        {p.qr_code_token} ({p.stream_category})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Requested Pickups</p>
              <p className="text-2xl font-bold text-slate-900">{requestedPickups.length}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Out for Delivery</p>
              <p className="text-2xl font-bold text-slate-900">{outForDeliveryPickups.length}</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Logistics Compliance</p>
              <p className="text-2xl font-bold text-emerald-600">100%</p>
            </div>
          </div>
        </div>

        {/* Active Pickups Stream Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900">All Waste Pickup Inventory</h2>
              <p className="text-xs text-slate-500">Real-time status tracking for delivery partners</p>
            </div>

            <button
              onClick={fetchPickups}
              disabled={loadingPickups}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-all"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingPickups ? 'animate-spin' : ''}`} />
              Refresh Table
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-xs uppercase text-slate-400 font-bold border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4">QR Token</th>
                  <th className="px-6 py-4">Society Source</th>
                  <th className="px-6 py-4">Stream</th>
                  <th className="px-6 py-4">Est. Weight</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Assigned Driver</th>
                  <th className="px-6 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {pickups.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-slate-400 text-sm">
                      No pickups found. Request a pickup from the Society Portal.
                    </td>
                  </tr>
                ) : (
                  pickups.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-slate-900">
                        {p.qr_code_token}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900">
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
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        {p.estimated_weight_kg} kg
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          (p.status === 'IN_TRANSIT' || p.status === 'OUT_FOR_DELIVERY') ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                          p.status === 'PARTIALLY_DELIVERED' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          (p.status === 'COMPLETED' || p.status === 'DELIVERED') ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                          'bg-orange-100 text-orange-800 border border-orange-200'
                        }`}>
                          <span className={`w-2 h-2 rounded-full ${
                            (p.status === 'IN_TRANSIT' || p.status === 'OUT_FOR_DELIVERY') ? 'bg-blue-500 animate-pulse' :
                            p.status === 'PARTIALLY_DELIVERED' ? 'bg-amber-500' :
                            (p.status === 'COMPLETED' || p.status === 'DELIVERED') ? 'bg-emerald-500' : 'bg-orange-500'
                          }`} />
                          {p.status === 'REQUESTED' || p.status === 'ALLOCATED' ? 'PENDING_PICKUP' : p.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-700">
                        {p.assigned_driver || 'Driver Alex Rivera'}
                      </td>
                      <td className="px-6 py-4">
                        {(p.status === 'PENDING_PICKUP' || p.status === 'REQUESTED' || p.status === 'ALLOCATED' || p.status === 'ASSIGNED') ? (
                          <button
                            onClick={async () => {
                              setQrToken(p.qr_code_token);
                              setScanning(true);
                              try {
                                const res = await batchService.deliveryScan(p.qr_code_token);
                                setAlertSuccess(res.message || 'Pickup verified! Status set to IN_TRANSIT across all allocated factories.');
                                await fetchPickups();
                              } catch (e) {
                                setScanError(e.message || 'Scan failed.');
                              } finally {
                                setScanning(false);
                              }
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-sm active:scale-95"
                          >
                            <ScanLine className="w-3.5 h-3.5" />
                            Scan & Pick Up
                          </button>
                        ) : (p.status === 'IN_TRANSIT' || p.status === 'OUT_FOR_DELIVERY') ? (
                          <span className="text-xs text-blue-600 font-bold">🚚 In Transit</span>
                        ) : p.status === 'PARTIALLY_DELIVERED' ? (
                          <span className="text-xs text-amber-600 font-bold">⏳ Partial Intake</span>
                        ) : (
                          <span className="text-xs text-emerald-600 font-bold">✅ Completed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DeliveryPartnerDashboard;
