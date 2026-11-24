import React, { useState, useEffect } from 'react';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { prescriptionService } from '../services/prescriptionService';

export const PrescriptionHistory = ({ onNavigate, onSelectPrescription }) => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [patientFilter, setPatientFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    prescriptionService.getPrescriptions().then((data) => {
      setPrescriptions(data);
      setLoading(false);
    });
  }, []);

  const filtered = prescriptions.filter((rx) => {
    const matchesStatus = !statusFilter || rx.status === statusFilter;
    const matchesPatient =
      !patientFilter ||
      rx.patientName.toLowerCase().includes(patientFilter.toLowerCase()) ||
      rx.patientIdentifier.toLowerCase().includes(patientFilter.toLowerCase()) ||
      rx.prescriptionNumber.toLowerCase().includes(patientFilter.toLowerCase());

    return matchesStatus && matchesPatient;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200/80 mb-2">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <span>Prescription Records Archive</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Prescription History & Archive
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Searchable historical audit record across all university clinic encounters and fulfilled orders.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => onNavigate('dashboard')}>
          Back to Dashboard
        </Button>
      </div>

      {/* Filter Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Search Patient, ID, or RX Number
          </label>
          <input
            type="text"
            placeholder="e.g. Kofi, STU-2024, RX-202611..."
            value={patientFilter}
            onChange={(e) => setPatientFilter(e.target.value)}
            className="w-full px-3.5 py-2 border border-slate-200 rounded-2xl text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/20"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Dispensing Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3.5 py-2 border border-slate-200 rounded-2xl text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/20"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="partially_dispensed">Partially Dispensed</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="pending_backorder">Pending Backorder</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Time Horizon</label>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-3.5 py-2 border border-slate-200 rounded-2xl text-xs sm:text-sm bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/20"
          >
            <option value="all">All Available Records</option>
            <option value="today">Today</option>
            <option value="week">Past 7 Days</option>
            <option value="month">Current Month</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500">Loading prescription archive...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No prescription records match your search criteria.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-600 font-bold">
                <tr>
                  <th className="px-5 py-3.5">Prescription ID</th>
                  <th className="px-5 py-3.5">Patient</th>
                  <th className="px-5 py-3.5">Doctor</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Prescribed Medicines</th>
                  <th className="px-5 py-3.5">Dispensing Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((rx) => (
                  <tr key={rx._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-mono font-bold text-teal-800">
                      {rx.prescriptionNumber}
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{rx.patientName}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{rx.patientIdentifier}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{rx.doctorName}</td>
                    <td className="px-4 py-3 text-slate-500">
                      {new Date(rx.prescriptionDate || rx.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-0.5">
                        {rx.items?.map((item, idx) => (
                          <div key={idx} className="text-[11px] text-slate-700">
                            • <span className="font-medium">{item.medicineName}</span> ({item.strength}) —{' '}
                            <span className="text-slate-500">{item.dosage}, {item.frequency}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge status={rx.status} />
                    </td>
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          onSelectPrescription(rx);
                          onNavigate('details');
                        }}
                      >
                        Inspect
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
