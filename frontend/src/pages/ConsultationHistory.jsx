import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, Calendar, FileText, ArrowRight, CheckCircle2 } from 'lucide-react';
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-xs font-bold border border-teal-200/80 mb-2">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <span>Clinical Archives & Past Encounters</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Consultation History & Records
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Archived repository of finalized medical encounters, diagnoses, and treatment notes.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by patient name, ID, or CNS#..."
              value={searchPatient}
              onChange={(e) => setSearchPatient(e.target.value)}
              className="pl-9 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 w-64 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/20"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex items-center gap-2 bg-slate-50 px-3.5 py-2 rounded-2xl border border-slate-200 text-xs">
            <Filter className="w-3.5 h-3.5 text-teal-600" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="all">All Completed</option>
              <option value="completed">Finalized</option>
              <option value="amended">Amended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Database Table Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card overflow-hidden">
        {loading ? (
          <SkeletonTable rows={5} />
        ) : filtered.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-600 mx-auto flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900">No completed consultations found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Completed consultations will automatically appear in this historical archive.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-100 text-slate-600 font-bold">
                <tr>
                  <th className="py-3.5 px-5 font-mono">Encounter Reference</th>
                  <th className="py-3.5 px-5">Patient Name</th>
                  <th className="py-3.5 px-5">Consultation Date</th>
                  <th className="py-3.5 px-5">Chief Complaint</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => {
                  const patientName = c.patient?.fullName || `${c.patient?.firstName} ${c.patient?.lastName}`;
                  const initials = `${c.patient?.firstName?.[0] || 'P'}${c.patient?.lastName?.[0] || ''}`;

                  return (
                    <tr key={c._id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="py-4 px-5 font-mono font-bold text-teal-700">
                        {c.consultationNumber}
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {initials}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">
                              {patientName}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                              <span>{c.patient?.patientId}</span>
                              <span>•</span>
                              <span>{c.patient?.universityId}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-slate-600 font-medium">
                        {new Date(c.appointmentDate || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-5 text-slate-700 max-w-xs truncate font-medium">
                        {c.reasonForVisit || 'Clinical consultation'}
                      </td>
                      <td className="py-4 px-5">
                        <Badge variant={c.status === 'amended' ? 'amber' : 'completed'}>
                          {c.status === 'amended' ? 'Amended' : 'Completed'}
                        </Badge>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <Link
                          to={`/doctor/consultations/${c._id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100/80 rounded-xl border border-teal-200 transition-all"
                        >
                          <span>Review File</span>
                          <ArrowRight className="w-3.5 h-3.5" />
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

