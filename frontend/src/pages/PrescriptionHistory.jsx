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
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Clinical Prescription History & Archive</h2>
          <p className="text-xs text-slate-500">
            Searchable historical audit record across all university clinic encounters
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={() => onNavigate('dashboard')}>
          Back to Dashboard
        </Button>
      </div>

      {/* Filter Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">
            Search Patient, ID, or RX Number
          </label>
          <input
            type="text"
            placeholder="e.g. Kofi, STU-2024, RX-202611..."
            value={patientFilter}
            onChange={(e) => setPatientFilter(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Dispensing Status</label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-teal-500"
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
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Time Horizon</label>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:ring-2 focus:ring-teal-500"
          >
            <option value="all">All Available Records</option>
            <option value="today">Today</option>
            <option value="week">Past 7 Days</option>
            <option value="month">Current Month</option>
          </select>
        </div>
      </div>

      {/* History Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-500">Loading prescription archive...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-500">
              No prescription records match your search criteria.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">Prescription ID</th>
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Doctor</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Prescribed Medicines</th>
                  <th className="px-4 py-3">Dispensing Status</th>
                  <th className="px-4 py-3 text-right">View</th>
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
