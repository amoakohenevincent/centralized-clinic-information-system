import React, { useState, useEffect } from 'react';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { prescriptionService } from '../services/prescriptionService';
import { useAuth } from '../context/AuthContext';

export const PrescriptionDashboard = ({ onNavigate, onSelectPrescription }) => {
  const { isDoctor, isPharmacist } = useAuth();
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
    <div className="space-y-6 animate-fade-in">
      {/* Top Welcome & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Prescription Operations Dashboard</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time synchronization between Clinical Consultations and Pharmacy Dispensing
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={loadData} isLoading={loading}>
            Refresh
          </Button>
          {isDoctor && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigate('create')}
            >
              + Create Prescription
            </Button>
          )}
        </div>
      </div>

      {/* KPI Stat Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Total Prescriptions"
          count={stats.total}
          subtitle="All active records"
          color="teal"
          isActive={selectedFilter === 'all'}
          onClick={() => setSelectedFilter('all')}
        />
        <StatCard
          title="Pending Pharmacy"
          count={stats.pending}
          subtitle="Awaiting dispensing"
          color="amber"
          isActive={selectedFilter === 'pending'}
          onClick={() => setSelectedFilter('pending')}
        />
        <StatCard
          title="Partially Dispensed"
          count={stats.partiallyDispensed}
          subtitle="Incomplete items"
          color="blue"
          isActive={selectedFilter === 'partially_dispensed'}
          onClick={() => setSelectedFilter('partially_dispensed')}
        />
        <StatCard
          title="Fulfilled"
          count={stats.fulfilled}
          subtitle="All items completed"
          color="emerald"
          isActive={selectedFilter === 'fulfilled'}
          onClick={() => setSelectedFilter('fulfilled')}
        />
        <StatCard
          title="Pending Backorder"
          count={stats.pendingBackorder}
          subtitle="Stock reorder pending"
          color="purple"
          isActive={selectedFilter === 'pending_backorder'}
          onClick={() => setSelectedFilter('pending_backorder')}
        />
      </div>

      {/* Main Prescriptions Table Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-700">Filter Queue:</span>
            <div className="flex gap-1">
              {['all', 'pending', 'partially_dispensed', 'fulfilled', 'pending_backorder'].map((statusKey) => (
                <button
                  key={statusKey}
                  onClick={() => setSelectedFilter(statusKey)}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                    selectedFilter === statusKey
                      ? 'bg-teal-600 text-white'
                      : 'text-slate-600 hover:bg-slate-200/60'
                  }`}
                >
                  {statusKey === 'all'
                    ? 'All'
                    : statusKey === 'partially_dispensed'
                    ? 'Partial'
                    : statusKey === 'pending_backorder'
                    ? 'Backorder'
                    : statusKey.charAt(0).toUpperCase() + statusKey.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Search by RX#, patient, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
            <svg
              className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-xs text-slate-500">Loading prescription queue...</div>
          ) : filteredList.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <div className="text-slate-400 font-medium text-sm">No prescriptions match your current filter.</div>
              {isDoctor && (
                <Button variant="outline" size="sm" onClick={() => onNavigate('create')}>
                  Create New Prescription
                </Button>
              )}
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Prescription #</th>
                  <th className="px-4 py-3">Patient Name & ID</th>
                  <th className="px-4 py-3">Prescribing Doctor</th>
                  <th className="px-4 py-3">Date Prescribed</th>
                  <th className="px-4 py-3">Items Prescribed</th>
                  <th className="px-4 py-3">Dispensing Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((rx) => (
                  <tr key={rx._id} className="hover:bg-teal-50/30 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-teal-800">
                      {rx.prescriptionNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{rx.patientName}</div>
                      <div className="text-slate-400 text-[11px] font-mono">{rx.patientIdentifier}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{rx.doctorName || 'Authorized Physician'}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(rx.prescriptionDate || rx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-800">
                        {rx.items?.length || 0} medications
                      </span>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">
                        {rx.items?.map((i) => i.medicineName).join(', ')}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={rx.status} />
                    </td>
                    <td className="px-4 py-3 text-right space-x-1 whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          onSelectPrescription(rx);
                          onNavigate('details');
                        }}
                      >
                        Details
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          onSelectPrescription(rx);
                          onNavigate('status');
                        }}
                      >
                        Dispense Track
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
