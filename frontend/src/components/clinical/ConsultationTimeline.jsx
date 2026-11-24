import React from 'react';
import { Link } from 'react-router-dom';
import DiagnosisBadge from './DiagnosisBadge';
import Badge from '../common/Badge';

const ConsultationTimeline = ({ consultations = [] }) => {
  if (consultations.length === 0) {
    return (
      <div className="text-center py-10 bg-white border border-slate-200 rounded-2xl">
        <p className="text-xs text-slate-500 font-medium">No previous consultations recorded for this patient.</p>
      </div>
    );
  }

  return (
    <div className="relative border-l-2 border-teal-600 ml-3 pl-5 space-y-5">
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
          <div key={c._id || idx} className="relative">
            {/* Round teal bullet */}
            <div className="absolute -left-[27px] top-4 w-3 h-3 rounded-full bg-teal-600 ring-4 ring-white" />

            <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-teal-600 transition-all space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
                    {c.consultationNumber || `CNS-${idx + 1}`}
                  </span>
                  <span className="text-xs font-semibold text-slate-600">
                    {visitDate}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={c.status === 'amended' ? 'warning' : 'completed'}>
                    {c.status || 'completed'}
                  </Badge>
                  <Link
                    to={`/doctor/consultations/${c._id}`}
                    className="text-xs font-bold text-teal-700 hover:text-teal-900 bg-teal-50 hover:bg-teal-100 px-3 py-1 rounded-lg border border-teal-200 transition-all"
                  >
                    View Notes
                  </Link>
                </div>
              </div>

              <div className="text-xs text-slate-600">
                Attending Doctor: <strong className="text-slate-900 font-bold">{doctorName}</strong>
              </div>

              {c.clinicalObservations && (
                <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200 line-clamp-2">
                  {c.clinicalObservations}
                </p>
              )}

              {c.diagnoses && c.diagnoses.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {c.diagnoses.map((d, dIdx) => (
                    <DiagnosisBadge key={dIdx} diagnosis={d} />
                  ))}
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
