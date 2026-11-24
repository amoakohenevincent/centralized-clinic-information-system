import React, { useState, useEffect } from 'react';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { prescriptionService } from '../services/prescriptionService';
import { useAuth } from '../context/AuthContext';

export const PrescriptionDashboard = ({ onNavigate, onSelectPrescription }) => {
  const { isDoctor } = useAuth();
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    partiallyDispensed: 0,
    fulfilled: 0,
    pendingBackorder: 0,
    createdToday: 0,
    recentPrescriptions: []
  });
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsData, listData] = await Promise.all([
        prescriptionService.getDashboardStats(),
        prescriptionService.getPrescriptions()
      ]);
      setStats(statsData);
      setPrescriptions(listData);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredList = prescriptions.filter((rx) => {
    const matchesFilter = selectedFilter === 'all' || rx.status === selectedFilter;
    const matchesSearch =
      rx.prescriptionNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rx.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rx.patientIdentifier.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Card */}
      <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 inline-block mb-1">
            Pharmacy & Dispensing Operations
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Prescription Operations & Dispensing
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time synchronization between Doctor Consultations, Dispensing Desk, and Medicine Inventory.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={loadData} isLoading={loading}>
            Refresh
          </Button>
          {isDoctor && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigate('create')}
            >
              Create Prescription
            </Button>
          )}
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <StatCard
          title="Total Prescriptions"
          count={stats.total}
          subtitle="All active records"
          color="teal"
          isActive={selectedFilter === 'all'}
          onClick={() => setSelectedFilter('all')}
        />
        <StatCard
          title="Pending Dispensing"
          count={stats.pending}
          subtitle="Awaiting pharmacy"
          color="neutral"
          isActive={selectedFilter === 'pending'}
          onClick={() => setSelectedFilter('pending')}
        />
        <StatCard
          title="Partially Dispensed"
          count={stats.partiallyDispensed}
          subtitle="Remaining refills"
          color="neutral"
          isActive={selectedFilter === 'partially_dispensed'}
          onClick={() => setSelectedFilter('partially_dispensed')}
        />
        <StatCard
          title="Fulfilled"
          count={stats.fulfilled}
          subtitle="Completely dispensed"
          color="teal"
          isActive={selectedFilter === 'fulfilled'}
          onClick={() => setSelectedFilter('fulfilled')}
        />
        <StatCard
          title="Backordered"
          count={stats.pendingBackorder}
          subtitle="Awaiting stock"
          color="neutral"
          isActive={selectedFilter === 'pending_backorder'}
          onClick={() => setSelectedFilter('pending_backorder')}
        />
      </div>

      {/* Main Prescriptions Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-700 mr-1">Queue Filter:</span>
            {[
              { key: 'all', label: 'All' },
              { key: 'pending', label: 'Pending' },
              { key: 'partially_dispensed', label: 'Partially Dispensed' },
              { key: 'fulfilled', label: 'Fulfilled' },
              { key: 'pending_backorder', label: 'Backorder' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setSelectedFilter(key)}
                className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-all ${
                  selectedFilter === key
                    ? 'bg-teal-600 text-white font-bold shadow-xs'
                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Search by RX#, patient, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3.5 py-1.5 text-xs border border-slate-300 rounded-xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-16 text-center text-xs text-slate-500">Loading prescription queue...</div>
          ) : filteredList.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <div className="text-slate-800 font-bold text-sm">No prescriptions match your filter.</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Select another filter or generate a new prescription from consultation notes.
              </p>
              {isDoctor && (
                <Button variant="outline" size="sm" onClick={() => onNavigate('create')}>
                  Create New Prescription
                </Button>
              )}
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Prescription #</th>
                  <th className="px-4 py-3">Patient Information</th>
                  <th className="px-4 py-3">Prescribing Doctor</th>
                  <th className="px-4 py-3">Date Prescribed</th>
                  <th className="px-4 py-3">Items Prescribed</th>
                  <th className="px-4 py-3">Dispensing Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredList.map((rx) => {
                  const initials = `${rx.patientName?.split(' ')[0]?.[0] || 'P'}${rx.patientName?.split(' ')[1]?.[0] || ''}`;
                  return (
                    <tr key={rx._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3.5 font-mono font-bold text-teal-800">
                        {rx.prescriptionNumber}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-300">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{rx.patientName}</div>
                            <div className="text-slate-500 text-[11px] font-mono">{rx.patientIdentifier}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-700 font-medium">{rx.doctorName || 'Authorized Physician'}</td>
                      <td className="px-4 py-3.5 text-slate-500 font-medium">
                        {new Date(rx.prescriptionDate || rx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="font-bold text-slate-800">
                          {rx.items?.length || 0} medications
                        </span>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs mt-0.5">
                          {rx.items?.map((i) => i.medicineName).join(', ')}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge status={rx.status} />
                      </td>
                      <td className="px-4 py-3.5 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => {
                            onSelectPrescription(rx);
                            onNavigate('details');
                          }}
                          className="inline-block px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-all"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => {
                            onSelectPrescription(rx);
                            onNavigate('status');
                          }}
                          className="inline-block px-3 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg shadow-xs transition-all"
                        >
                          Dispense Track
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrescriptionDashboard;
