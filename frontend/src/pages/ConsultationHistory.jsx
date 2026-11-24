import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { clinicalService } from '../services/clinicalService';
import Badge from '../components/common/Badge';
import { SkeletonTable } from '../components/common/LoadingSkeleton';

const ConsultationHistory = () => {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchPatient, setSearchPatient] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const data = await clinicalService.getAppointmentQueue('completed');
        const list = data
          .filter((appt) => appt.consultation)
          .map((appt) => ({
            ...appt.consultation,
            appointmentNumber: appt.appointmentNumber,
            patient: appt.patientId,
            appointmentDate: appt.appointmentDate,
            reasonForVisit: appt.reasonForVisit,
          }));
        setConsultations(list);
      } catch (err) {
        console.error('Failed to load consultation archive:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [statusFilter]);

  const filtered = consultations.filter((item) => {
    if (!searchPatient.trim()) return true;
    const q = searchPatient.toLowerCase();
    const pName = item.patient?.fullName || `${item.patient?.firstName} ${item.patient?.lastName}` || '';
    const pId = item.patient?.patientId || '';
    const uId = item.patient?.universityId || '';
    const cNum = item.consultationNumber || '';
    return (
      pName.toLowerCase().includes(q) ||
      pId.toLowerCase().includes(q) ||
      uId.toLowerCase().includes(q) ||
      cNum.toLowerCase().includes(q)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 inline-block mb-1">
            Clinical Archives & Past Encounters
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Consultation History & Records
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Archived repository of finalized medical encounters, diagnoses, and treatment notes.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-2.5">
          <input
            type="text"
            placeholder="Search by name, ID, or CNS#..."
            value={searchPatient}
            onChange={(e) => setSearchPatient(e.target.value)}
            className="px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl text-slate-900 w-56 sm:w-64 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-600"
          >
            <option value="all">All Completed</option>
            <option value="completed">Finalized</option>
            <option value="amended">Amended</option>
          </select>
        </div>
      </div>

      {/* Database Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <SkeletonTable rows={5} />
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <h4 className="text-sm font-bold text-slate-900">No completed consultations found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Completed consultations will automatically appear in this historical archive.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4 font-mono">Encounter Reference</th>
                  <th className="py-3 px-4">Patient Name</th>
                  <th className="py-3 px-4">Consultation Date</th>
                  <th className="py-3 px-4">Chief Complaint</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filtered.map((c) => {
                  const patientName = c.patient?.fullName || `${c.patient?.firstName} ${c.patient?.lastName}`;
                  const initials = `${c.patient?.firstName?.[0] || 'P'}${c.patient?.lastName?.[0] || ''}`;

                  return (
                    <tr key={c._id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-teal-800">
                        {c.consultationNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-800 flex items-center justify-center font-bold text-xs shrink-0 border border-slate-300">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">
                              {patientName}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {c.patient?.patientId} • {c.patient?.universityId}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {new Date(c.appointmentDate || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 max-w-xs truncate font-medium">
                        {c.reasonForVisit || 'Clinical consultation'}
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge variant={c.status === 'amended' ? 'warning' : 'completed'}>
                          {c.status === 'amended' ? 'Amended' : 'Completed'}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          to={`/doctor/consultations/${c._id}`}
                          className="inline-block px-3 py-1.5 text-xs font-bold text-teal-800 bg-teal-50 hover:bg-teal-100 rounded-lg border border-teal-200 transition-all"
                        >
                          Review File
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConsultationHistory;
