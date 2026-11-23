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
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <div className="text-xs text-[#787774] mb-2 uppercase tracking-wider font-semibold">
            Clinic Records Archive
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#191919] tracking-tight">
            Consultation Archives
          </h1>
          <p className="text-xs sm:text-sm text-[#787774] mt-1">
            Complete list of attended patients and documented clinic consultations.
          </p>
        </div>

        {/* Search & Filter */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div>
            <input
              type="text"
              placeholder="Search by patient name, ID, or CNS#..."
              value={searchPatient}
              onChange={(e) => setSearchPatient(e.target.value)}
              className="px-3 py-1.5 text-xs bg-white border border-[#e9e9e7] rounded-none text-[#191919] w-64 focus:bg-white"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-none border border-[#e9e9e7] text-xs">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-medium text-[#191919] focus:outline-none"
            >
              <option value="all">All Records</option>
              <option value="completed">Completed</option>
              <option value="amended">Amended</option>
            </select>
          </div>
        </div>
      </div>

      {/* Database Table */}
      <div className="bg-white rounded-none border border-[#e9e9e7] shadow-notion-card overflow-hidden">
        {loading ? (
          <SkeletonTable rows={5} />
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-[#787774]">
            <h4 className="font-serif font-medium text-base text-[#191919]">No completed consultations found</h4>
            <p className="text-xs text-[#9b9a97] mt-1">
              Finalize patient consultations to populate this archive.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#faf9f6] border-b border-[#e9e9e7] text-[#787774] font-medium">
                <tr>
                  <th className="py-2.5 px-4 font-mono">Encounter Ref</th>
                  <th className="py-2.5 px-4">Patient Information</th>
                  <th className="py-2.5 px-4">Encounter Date</th>
                  <th className="py-2.5 px-4">Chief Complaint</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f1ef]">
                {filtered.map((c) => {
                  return (
                    <tr key={c._id} className="hover:bg-[#fbfbfa] transition-colors group">
                      <td className="py-3 px-4 font-mono font-medium text-[#191919]">
                        {c.consultationNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-[#191919]">
                          {c.patient?.fullName || `${c.patient?.firstName} ${c.patient?.lastName}`}
                        </div>
                        <div className="text-[11px] text-[#787774] font-mono flex items-center gap-1.5">
                          <span>{c.patient?.patientId}</span>
                          <span>•</span>
                          <span className="text-[#191919] font-sans font-medium">{c.patient?.universityId}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-[#787774] font-medium">
                        {new Date(c.appointmentDate || Date.now()).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-[#37352f] max-w-xs truncate">
                        {c.reasonForVisit || 'Clinical consultation'}
                      </td>
                      <td className="py-3 px-4">
                        <Badge>
                          {c.status === 'amended' ? 'Amended' : 'Completed'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          to={`/doctor/consultations/${c._id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#191919] hover:bg-[#f1f1ef] border border-[#e5e5e3] rounded-none transition-colors"
                        >
                          Review File →
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
