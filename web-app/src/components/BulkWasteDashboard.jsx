import React, { useState, useEffect } from 'react';
import { bwgService } from '../services/bwgService';
import pickupService from '../services/pickupService';
import { AlertTriangle, CheckCircle, RefreshCw, Scale, Trash2, Plus, Loader2, QrCode, Truck, Package } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

/**
 * Bulk Waste Management (BWG) Dashboard Component
 * Real-time integration with Node.js/Express/PostgreSQL backend API endpoints:
 * - GET /api/v1/bwg/compliance-report
 * - POST /api/v1/bwg/waste-log
 * - POST /api/v1/pickups/request
 */
const BulkWasteDashboard = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form State for Logging Waste
  const [streamCategory, setStreamCategory] = useState('WET');
  const [volumeLiters, setVolumeLiters] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  // Form State for Requesting Pickup
  const [pickupStream, setPickupStream] = useState('WET');
  const [pickupWeight, setPickupWeight] = useState('');
  const [requestingPickup, setRequestingPickup] = useState(false);
  const [pickupSuccess, setPickupSuccess] = useState(null);
  const [recentPickups, setRecentPickups] = useState([]);

  // Fetch Compliance Metrics & Recent Pickups on Mount
  const fetchReport = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await bwgService.getComplianceReport();
      setReport(data);

      // Fetch society pickups for active list
      const pickupRes = await pickupService.getSocietyPickups();
      setRecentPickups(pickupRes.pickups || []);
    } catch (err) {
      setError(err.message || 'Failed to load bulk waste compliance report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  // Handle Log Waste Submission
  const handleLogWasteSubmit = async (e) => {
    e.preventDefault();
    setSubmitSuccess(null);
    setError(null);

    const volume = parseFloat(volumeLiters);
    if (isNaN(volume) || volume <= 0) {
      setError('Please enter a valid bag volume in Liters.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await bwgService.logWaste({
        stream_category: streamCategory,
        estimated_volume_liters: volume,
        notes,
      });

      setSubmitSuccess(res.message || 'Waste log recorded successfully!');
      setVolumeLiters('');
      setNotes('');
      await fetchReport();
    } catch (err) {
      setError(err.message || 'Failed to submit waste log.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Pickup Request Submission
  const handlePickupRequestSubmit = async (e) => {
    e.preventDefault();
    setPickupSuccess(null);
    setError(null);

    const weight = parseFloat(pickupWeight);
    if (isNaN(weight) || weight <= 0) {
      setError('Please enter a valid estimated weight in KG for pickup.');
      return;
    }

    try {
      setRequestingPickup(true);
      const res = await pickupService.requestPickup({
        stream_category: pickupStream,
        estimated_weight_kg: weight,
      });

      const newQr = res.pickup?.qr_code_token;
      setPickupSuccess(
        res.message ? `${res.message} Generated QR Token: ${newQr}` : `Pickup requested! QR Code: ${newQr}`
      );
      setPickupWeight('');
      await fetchReport();
    } catch (err) {
      setError(err.message || 'Failed to request pickup.');
    } finally {
      setRequestingPickup(false);
    }
  };

  const CHART_COLORS = {
    WET: '#10B981',      // Emerald Green
    DRY: '#3B82F6',      // Blue
    SANITARY: '#F59E0B', // Amber
    HAZARDOUS: '#EF4444',// Red
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pillar 1: Bulk Waste Compliance & Pickup Portal</h1>
          <p className="text-sm text-gray-500 mt-1">
            Real-time compliance monitoring & QR-coded pickup requests under India SWM Rules 2026
          </p>
        </div>

        <button
          onClick={fetchReport}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-xl text-sm transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </button>
      </div>

      {/* Error / Success Notifications */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {submitSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>{submitSuccess}</span>
        </div>
      )}

      {pickupSuccess && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 flex items-center gap-3 animate-in fade-in">
          <QrCode className="w-6 h-6 text-blue-600 shrink-0" />
          <div className="flex-1 font-semibold text-sm">
            {pickupSuccess}
          </div>
        </div>
      )}

      {/* Main Grid: Pickup Request Form + Waste Log Form + Compliance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Forms */}
        <div className="space-y-6">
          {/* Form 1: Request Waste Pickup (POST /api/v1/pickups/request) */}
          <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-emerald-800/50 space-y-4">
            <div className="flex items-center gap-2 font-bold text-lg text-emerald-400">
              <Truck className="w-6 h-6" />
              Request Waste Pickup (QR Token)
            </div>
            <p className="text-xs text-slate-300">
              Generates a unique QR token code and alerts delivery partners for waste container collection.
            </p>

            <form onSubmit={handlePickupRequestSubmit} className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Stream Category
                </label>
                <select
                  value={pickupStream}
                  onChange={(e) => setPickupStream(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm font-medium"
                >
                  <option value="WET">Wet Organic Waste</option>
                  <option value="DRY">Dry Recyclables</option>
                  <option value="SANITARY">Sanitary Waste</option>
                  <option value="HAZARDOUS">Hazardous E-Waste</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                  Estimated Weight (KG)
                </label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  placeholder="e.g. 75"
                  value={pickupWeight}
                  onChange={(e) => setPickupWeight(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white placeholder-slate-500 focus:ring-2 focus:ring-emerald-500 outline-none transition-all text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={requestingPickup}
                className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-extrabold py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {requestingPickup ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Generating QR Token...
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4" />
                    Request Waste Pickup
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Form 2: Log Waste Bag Container */}
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
            <div className="flex items-center gap-2 text-gray-900 font-bold text-lg">
              <Plus className="w-5 h-5 text-emerald-600" />
              Log Daily Waste Container
            </div>

            <form onSubmit={handleLogWasteSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Stream Category
                </label>
                <select
                  value={streamCategory}
                  onChange={(e) => setStreamCategory(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm font-medium"
                >
                  <option value="WET">Wet Organic Waste (~0.40 kg/L)</option>
                  <option value="DRY">Dry Recyclables (~0.15 kg/L)</option>
                  <option value="SANITARY">Sanitary Waste (~0.25 kg/L)</option>
                  <option value="HAZARDOUS">Hazardous / E-Waste (~0.35 kg/L)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Bag / Bin Volume (Liters)
                </label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  placeholder="e.g. 50"
                  value={volumeLiters}
                  onChange={(e) => setVolumeLiters(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
                  Notes (Optional)
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g. Kitchen wet waste bin #4"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all text-sm resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Calculating Mass via AI Density Engine...
                  </>
                ) : (
                  'Submit Waste Log'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Metrics & Pickups Overview */}
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="bg-white p-12 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
              <p className="text-sm text-gray-500">Loading statutory compliance metrics & pickups...</p>
            </div>
          ) : (
            <>
              {/* Active Society Pickups Table */}
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                    <Package className="w-5 h-5 text-emerald-600" />
                    Requested Society Pickups (QR Tokens)
                  </h3>
                  <span className="text-xs bg-emerald-50 text-emerald-700 font-bold px-2.5 py-1 rounded-full border border-emerald-200">
                    {recentPickups.length} Total Requests
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-400 font-bold border-b border-gray-100">
                      <tr>
                        <th className="px-4 py-3">QR Token</th>
                        <th className="px-4 py-3">Stream</th>
                        <th className="px-4 py-3">Weight</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Assigned Driver</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {recentPickups.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-4 py-6 text-center text-gray-400 text-xs">
                            No active pickup requests yet. Use the form on the left to request a pickup.
                          </td>
                        </tr>
                      ) : (
                        recentPickups.slice(0, 5).map((p) => (
                          <tr key={p.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-mono font-bold text-xs text-gray-900">
                              {p.qr_code_token}
                            </td>
                            <td className="px-4 py-3">
                              <span className="font-bold text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                                {p.stream_category}
                              </span>
                            </td>
                            <td className="px-4 py-3 font-semibold text-gray-900">
                              {p.estimated_weight_kg} kg
                            </td>
                            <td className="px-4 py-3">
                              <span className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full ${
                                p.status === 'OUT_FOR_DELIVERY' ? 'bg-blue-100 text-blue-800' :
                                p.status === 'DELIVERED' ? 'bg-emerald-100 text-emerald-800' :
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {p.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-xs text-gray-500 font-medium">
                              {p.assigned_driver}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* KPI Cards */}
              {report && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="text-xs font-semibold text-gray-500 uppercase">CPCB Status</div>
                    <div className={`text-xl font-bold mt-2 ${
                      report.cpcb_swm_2026_compliance.status === 'COMPLIANT'
                        ? 'text-emerald-600'
                        : report.cpcb_swm_2026_compliance.status === 'WARNING'
                        ? 'text-amber-600'
                        : 'text-red-600'
                    }`}>
                      {report.cpcb_swm_2026_compliance.status}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{report.cpcb_swm_2026_compliance.notes}</p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="text-xs font-semibold text-gray-500 uppercase">Segregation Efficiency</div>
                    <div className="text-3xl font-extrabold text-emerald-600 mt-2">
                      {report.cpcb_swm_2026_compliance.segregation_efficiency_percentage}%
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Target: &gt;70% segregated wet/dry</p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="text-xs font-semibold text-gray-500 uppercase">Total Mass (30 Days)</div>
                    <div className="text-3xl font-extrabold text-gray-900 mt-2 flex items-baseline gap-1">
                      {report.aggregated_metrics.total_mass_kg}
                      <span className="text-sm font-semibold text-gray-500">KG</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">Calculated via Density Coefficients</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </div>
    </div>
  );
};

export default BulkWasteDashboard;
