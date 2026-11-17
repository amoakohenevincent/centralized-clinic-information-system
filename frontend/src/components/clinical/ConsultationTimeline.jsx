import React from 'react';
import { Link } from 'react-router-dom';
import DiagnosisBadge from './DiagnosisBadge';
import Badge from '../common/Badge';

const ConsultationTimeline = ({ consultations = [] }) => {
  if (consultations.length === 0) {
    return (
      <div className="text-center py-10 bg-white border border-dashed border-[#e9e9e7] rounded-none">
        <p className="text-xs text-[#191919] font-medium">No previous consultations recorded for this patient.</p>
      </div>
    );
  }

  return (
    <div className="relative border-l border-[#e9e9e7] ml-3 pl-6 space-y-6">
      {consultations.map((c, idx) => {
        const visitDate = new Date(c.consultationDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        const doctorName = c.doctorId
          ? `${c.doctorId.title || 'Dr.'} ${c.doctorId.firstName} ${c.doctorId.lastName}`
          : 'Attending Physician';

        return (
          <div key={c._id || idx} className="relative group">
            {/* Minimal square bullet */}
            <div className="absolute -left-[30px] top-2 w-2.5 h-2.5 rounded-none bg-[#191919] ring-4 ring-[#fbfbfa]"></div>

            <div className="bg-white p-5 rounded-none border border-[#e9e9e7] shadow-notion-card hover:border-[#191919] transition-colors space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-[#191919] bg-[#f1f1ef] px-2 py-0.5 rounded-none border border-[#e5e5e3]">
                    {c.consultationNumber || `CNS-${idx + 1}`}
                  </span>
                  <span className="text-xs font-medium text-[#191919]">
                    {visitDate}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={c.status === 'amended' ? 'orange' : 'green'}>
                    {c.status || 'completed'}
                  </Badge>
                  <Link
                    to={`/doctor/consultations/${c._id}`}
                    className="inline-flex items-center text-xs font-semibold text-[#191919] hover:underline px-2.5 py-1 rounded-none transition-colors"
                  >
                    View Details
                  </Link>
                </div>
              </div>

              <div className="text-xs text-[#191919]">
                Doctor: <strong className="text-[#191919]">{doctorName}</strong>
              </div>

              <p className="text-xs text-[#191919] leading-relaxed bg-[#fbfbfa] p-3 rounded-none border border-[#e9e9e7]">
                {c.clinicalObservations}
              </p>

              {c.diagnoses && c.diagnoses.length > 0 && (
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-[#191919] block mb-1.5">
                    Diagnoses:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {c.diagnoses.map((diag, dIdx) => (
                      <DiagnosisBadge key={dIdx} diagnosis={diag} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConsultationTimeline;
