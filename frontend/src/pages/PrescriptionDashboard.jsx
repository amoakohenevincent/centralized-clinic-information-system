import React, { useState, useEffect } from 'react';
import {
  Pill,
  Search,
  Filter,
  PlusCircle,
  RotateCw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ClipboardList,
} from 'lucide-react';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fadeIn">
      {/* MediWell Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200/80 mb-2">
            <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse" />
            <span>Pharmacy & Dispensing Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Prescription Operations & Dispensing
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time synchronization between Doctor Consultations, Dispensing Desk, and Medicine Inventory.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={loadData} isLoading={loading}>
            <RotateCw className="w-3.5 h-3.5" />
            <span>Refresh</span>
          </Button>
          {isDoctor && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => onNavigate('create')}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Prescription</span>
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
          title="Pending Dispensing"
          count={stats.pending}
          subtitle="Awaiting pharmacy"
          color="amber"
          isActive={selectedFilter === 'pending'}
          onClick={() => setSelectedFilter('pending')}
        />
        <StatCard
          title="Partially Dispensed"
          count={stats.partiallyDispensed}
          subtitle="Remaining refills"
          color="blue"
          isActive={selectedFilter === 'partially_dispensed'}
          onClick={() => setSelectedFilter('partially_dispensed')}
        />
        <StatCard
          title="Fulfilled"
          count={stats.fulfilled}
          subtitle="Completely dispensed"
          color="emerald"
          isActive={selectedFilter === 'fulfilled'}
          onClick={() => setSelectedFilter('fulfilled')}
        />
        <StatCard
          title="Backordered"
          count={stats.pendingBackorder}
          subtitle="Awaiting stock"
          color="purple"
          isActive={selectedFilter === 'pending_backorder'}
          onClick={() => setSelectedFilter('pending_backorder')}
        />
      </div>

      {/* Main Prescriptions Table Section */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50/50">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-teal-600" /> Queue Filter:
            </span>
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
                className={`px-3 py-1.5 text-xs rounded-xl font-bold transition-all ${
                  selectedFilter === key
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              placeholder="Search by RX#, patient, or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-2xl bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-16 text-center text-xs text-slate-500">Loading prescription queue...</div>
          ) : filteredList.length === 0 ? (
            <div className="p-16 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                <Pill className="w-6 h-6" />
              </div>
              <div className="text-slate-800 font-bold text-sm">No prescriptions match your filter.</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Select another filter or generate a new prescription from consultation notes.
              </p>
              {isDoctor && (
                <Button variant="outline" size="sm" onClick={() => onNavigate('create')}>
                  + Create New Prescription
                </Button>
              )}
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-600 font-bold">
                <tr>
                  <th className="px-5 py-3.5">Prescription #</th>
                  <th className="px-5 py-3.5">Patient Information</th>
                  <th className="px-5 py-3.5">Prescribing Doctor</th>
                  <th className="px-5 py-3.5">Date Prescribed</th>
                  <th className="px-5 py-3.5">Items Prescribed</th>
                  <th className="px-5 py-3.5">Dispensing Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredList.map((rx) => {
                  const initials = `${rx.patientName?.split(' ')[0]?.[0] || 'P'}${rx.patientName?.split(' ')[1]?.[0] || ''}`;
                  return (
                    <tr key={rx._id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="px-5 py-4 font-mono font-bold text-teal-700">
                        {rx.prescriptionNumber}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{rx.patientName}</div>
                            <div className="text-slate-500 text-[11px] font-mono">{rx.patientIdentifier}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-slate-700 font-medium">{rx.doctorName || 'Authorized Physician'}</td>
                      <td className="px-5 py-4 text-slate-500 font-medium">
                        {new Date(rx.prescriptionDate || rx.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-bold text-slate-800">
                          {rx.items?.length || 0} medications
                        </span>
                        <div className="text-[11px] text-slate-500 truncate max-w-xs mt-0.5">
                          {rx.items?.map((i) => i.medicineName).join(', ')}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <Badge status={rx.status} />
                      </td>
                      <td className="px-5 py-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          onClick={() => {
                            onSelectPrescription(rx);
                            onNavigate('details');
                          }}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-teal-700 bg-slate-100 hover:bg-teal-50 rounded-xl transition-all"
                        >
                          Details
                        </button>
                        <button
                          onClick={() => {
                            onSelectPrescription(rx);
                            onNavigate('status');
                          }}
                          className="inline-flex items-center gap-1 px-3.5 py-1.5 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-all"
                        >
                          <span>Dispense Track</span>
                          <ArrowRight className="w-3.5 h-3.5" />
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
