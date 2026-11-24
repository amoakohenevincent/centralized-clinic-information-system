import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight, Activity, FileText } from 'lucide-react';
import DiagnosisBadge from './DiagnosisBadge';
import Badge from '../common/Badge';

const ConsultationTimeline = ({ consultations = [] }) => {
  if (consultations.length === 0) {
    return (
      <div className="text-center py-12 bg-white border border-dashed border-slate-200 rounded-3xl">
        <p className="text-xs text-slate-500 font-medium">No previous consultations recorded for this patient.</p>
      </div>
    );
  }

  return (
    <div className="relative border-l-2 border-teal-200 ml-3.5 pl-6 space-y-6">
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
            {/* Round teal bullet */}
            <div className="absolute -left-[31px] top-4 w-3.5 h-3.5 rounded-full bg-teal-500 ring-4 ring-white shadow-xs"></div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-card hover:border-teal-200 transition-all space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-3 py-1 rounded-xl border border-teal-200">
                    {c.consultationNumber || `CNS-${idx + 1}`}
                  </span>
                  <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{visitDate}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={c.status === 'amended' ? 'amber' : 'completed'}>
                    {c.status || 'completed'}
                  </Badge>
                  <Link
                    to={`/doctor/consultations/${c._id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-teal-600 hover:text-teal-700 bg-teal-50 hover:bg-teal-100/70 px-3 py-1 rounded-xl transition-all"
                  >
                    <span>View Notes</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              <div className="text-xs text-slate-600">
                Attending Doctor: <strong className="text-slate-900 font-bold">{doctorName}</strong>
              </div>

              {c.clinicalObservations && (
                <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 line-clamp-2">
                  {c.clinicalObservations}
                </p>
              )}

              {c.diagnoses && c.diagnoses.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
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
