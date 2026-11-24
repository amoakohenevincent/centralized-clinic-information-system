import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  PlusCircle,
  Edit3,
  FileText,
  Activity,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { clinicalService } from '../services/clinicalService';
import { useAuth } from '../context/AuthContext';
import VitalSignsDisplay from '../components/clinical/VitalSignsDisplay';
import DiagnosisBadge from '../components/clinical/DiagnosisBadge';
import PrescriptionHandoffCard from '../components/clinical/PrescriptionHandoffCard';
import Badge from '../components/common/Badge';
import Modal from '../components/common/Modal';
import AlertBanner from '../components/common/AlertBanner';
import { SkeletonCard } from '../components/common/LoadingSkeleton';

const ConsultationDetails = () => {
  const { id } = useParams();
  const { isDoctor, currentUser } = useAuth();

  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Controlled Amendment State
  const [isAmendModalOpen, setIsAmendModalOpen] = useState(false);
  const [amendedObservations, setAmendedObservations] = useState('');
  const [amendedDoctorNotes, setAmendedDoctorNotes] = useState('');
  const [reasonForChange, setReasonForChange] = useState('');
  const [amending, setAmending] = useState(false);
  const [amendError, setAmendError] = useState(null);

  const fetchConsultation = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await clinicalService.getConsultationById(id);
      setConsultation(data);
      setAmendedObservations(data.clinicalObservations || '');
      setAmendedDoctorNotes(data.doctorNotes || '');
    } catch (err) {
      setError(err.message || 'Failed to load consultation.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchConsultation();
    }
  }, [id]);

  const handleAmendSubmit = async (e) => {
    e.preventDefault();
    if (!reasonForChange.trim()) {
      setAmendError('An explicit reason for clinical amendment is legally required.');
      return;
    }

    setAmending(true);
    setAmendError(null);
    try {
      await clinicalService.updateConsultation(id, {
        clinicalObservations: amendedObservations,
        doctorNotes: amendedDoctorNotes,
        reasonForChange: reasonForChange.trim(),
      });
      setIsAmendModalOpen(false);
      setReasonForChange('');
      await fetchConsultation();
    } catch (err) {
      setAmendError(err.message || 'Failed to amend clinical record.');
    } finally {
      setAmending(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (error || !consultation) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <AlertBanner type="danger" title="Consultation Not Found" message={error || 'The requested clinical consultation could not be found.'} />
        <div className="mt-4">
          <Link to="/doctor/dashboard" className="text-xs font-bold text-teal-600 hover:underline flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Return to Doctor Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const patient = consultation.patientId;
  const doctor = consultation.doctorId;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      {/* Back button */}
      <div>
        <Link
          to={`/doctor/patients/${patient?._id}/history`}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-teal-700 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Patient Medical Records</span>
        </Link>
      </div>

      {/* Header Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Consultation Record & Notes
              </h1>
              <Badge variant={consultation.status === 'amended' ? 'amber' : 'completed'}>
                {consultation.status === 'amended' ? 'Amended' : 'Completed'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              Encounter: <strong className="text-teal-700">{consultation.consultationNumber}</strong> • {new Date(consultation.consultationDate).toLocaleString()}
            </p>
          </div>

          {/* Action buttons (Doctor only) */}
          {isDoctor && (
            <div className="flex items-center gap-2.5">
              <Link
                to={`/doctor/diagnoses?consultationId=${consultation._id}`}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-2xl shadow-xs transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Add Diagnosis</span>
              </Link>

              <button
                onClick={() => setIsAmendModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-2xl border border-slate-200 transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Amend Notes</span>
              </button>
            </div>
          )}
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
          <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-0.5">
              Patient Name
            </span>
            <strong className="text-slate-900 text-xs sm:text-sm block truncate">
              {patient?.fullName || `${patient?.firstName} ${patient?.lastName}`}
            </strong>
            <span className="text-[11px] text-teal-600 font-mono block mt-0.5">{patient?.universityId}</span>
          </div>

          <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-0.5">
              Attending Doctor
            </span>
            <strong className="text-slate-900 text-xs sm:text-sm block truncate">
              {doctor?.title || 'Dr.'} {doctor?.firstName} {doctor?.lastName}
            </strong>
            <span className="text-[11px] text-slate-500 block mt-0.5">{doctor?.specialization || 'Medical Officer'}</span>
          </div>

          <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-0.5">
              License Reg No.
            </span>
            <span className="font-mono text-xs font-bold text-slate-800">
              {doctor?.medicalLicenseNumber || 'MDC-88319-GH'}
            </span>
          </div>

          <div className="bg-slate-50/70 p-3.5 rounded-2xl border border-slate-100">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block mb-0.5">
              Blood Group
            </span>
            <span className="font-mono text-xs font-extrabold text-rose-600">
              {patient?.bloodGroup || 'O+'}
            </span>
          </div>
        </div>
      </div>

      {/* Vital Signs Grid */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-800 flex items-center gap-2">
          <Activity className="w-4 h-4 text-teal-600" />
          <span>Patient Vital Signs Measured</span>
        </h3>
        <VitalSignsDisplay vitals={consultation.vitalSigns} />
      </div>

      {/* Complaints & Symptoms */}
      <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-card space-y-4">
        <h3 className="text-base font-bold text-slate-900">Patient Complaints & Symptoms</h3>
        <div className="space-y-2.5">
          {consultation.presentingComplaints?.length === 0 ? (
            <p className="text-xs text-slate-400">No complaints logged.</p>
          ) : (
            consultation.presentingComplaints?.map((c, idx) => (
              <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
                <span className="font-bold text-slate-800">{c.complaint}</span>
                <div className="flex items-center gap-2.5">
                  <span className="text-slate-500 font-medium">{c.duration}</span>
                  <Badge variant={c.severity === 'severe' ? 'urgent' : 'amber'}>{c.severity}</Badge>
                </div>
              </div>
            ))
          )}
        </div>

        {consultation.symptoms?.length > 0 && (
          <div className="pt-2">
            <span className="text-xs font-bold text-slate-500 block mb-2">Reported Symptoms:</span>
            <div className="flex flex-wrap gap-2">
              {consultation.symptoms.map((s, idx) => (
                <span key={idx} className="text-xs px-3 py-1 bg-slate-100 text-slate-700 font-semibold rounded-full border border-slate-200/60">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Clinical Observations & Diagnoses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Physical Findings */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-card space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-600" />
            <span>Doctor Examination & Physical Findings</span>
          </h3>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100 whitespace-pre-line font-medium">
            {consultation.clinicalObservations}
          </p>

          {consultation.doctorNotes && (
            <div className="pt-3 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-500 block mb-1.5">Doctor's Clinical Notes:</span>
              <p className="text-xs text-slate-800 bg-slate-50 p-3.5 rounded-2xl border border-slate-200/60">
                {consultation.doctorNotes}
              </p>
            </div>
          )}
        </div>

        {/* Diagnoses List */}
        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-card space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-600" />
            <span>Diagnosed Conditions ({consultation.diagnoses?.length || 0})</span>
          </h3>
          <div className="space-y-2.5">
            {consultation.diagnoses?.map((diag, idx) => (
              <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                <DiagnosisBadge diagnosis={diag} />
                {diag.notes && <p className="text-xs text-slate-500 pl-1 mt-1">{diag.notes}</p>}
              </div>
            ))}
          </div>

          {/* Follow-up card */}
          {consultation.followUpRecommendations?.followUpRequired && (
            <div className="mt-4 p-4 bg-teal-50/70 border border-teal-200/80 rounded-2xl text-xs space-y-1">
              <span className="font-bold text-teal-900 block">Follow-up Review Recommended</span>
              <div className="text-teal-700 font-medium">
                Scheduled Date: {consultation.followUpRecommendations.followUpDate ? new Date(consultation.followUpRecommendations.followUpDate).toLocaleDateString() : 'To be confirmed'}
              </div>
              {consultation.followUpRecommendations.instructions && (
                <div className="text-teal-600 text-xs mt-1">
                  Instructions: {consultation.followUpRecommendations.instructions}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Prescription Handoff Section */}
      <PrescriptionHandoffCard
        consultation={consultation}
        onHandoffInitiated={() => fetchConsultation()}
      />

      {/* Controlled Traceable Audit Trail */}
      {consultation.auditTrail && consultation.auditTrail.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-card space-y-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>Clinical Audit Trail ({consultation.auditTrail.length} revisions)</span>
          </h3>
          <div className="space-y-3">
            {consultation.auditTrail.map((entry, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="font-bold text-slate-800">
                    Amended by {entry.modifiedByName || 'Authorized Clinician'}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">
                    {new Date(entry.modifiedAt).toLocaleString()}
                  </span>
                </div>
                <div className="text-slate-800 bg-white p-3 rounded-xl border border-slate-200/80">
                  <strong className="text-slate-900">Reason for Amendment:</strong> {entry.reasonForChange}
                </div>
                {entry.changesSummary && (
                  <p className="text-xs text-slate-500 italic">{entry.changesSummary}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Controlled Amendment Modal */}
      <Modal
        isOpen={isAmendModalOpen}
        onClose={() => setIsAmendModalOpen(false)}
        title="Controlled Amendment of Clinical Record"
      >
        <form onSubmit={handleAmendSubmit} className="space-y-4">
          <AlertBanner
            type="warning"
            title="Legal Audit Notice"
            message="All revisions are permanently recorded in the tamper-evident CCIS audit trail. An explicit clinical justification is legally required."
          />

          {amendError && <AlertBanner type="danger" message={amendError} />}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Revised Clinical Observations & Findings *
            </label>
            <textarea
              rows={4}
              value={amendedObservations}
              onChange={(e) => setAmendedObservations(e.target.value)}
              className="w-full text-xs p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Revised Doctor's Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={amendedDoctorNotes}
              onChange={(e) => setAmendedDoctorNotes(e.target.value)}
              className="w-full text-xs p-3.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/20"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Legal Reason for Clinical Amendment *
            </label>
            <input
              type="text"
              placeholder="e.g. Revised diagnosis following urgent radiology findings."
              value={reasonForChange}
              onChange={(e) => setReasonForChange(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/20"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={() => setIsAmendModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={amending}
              className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-2xl shadow-xs disabled:opacity-50"
            >
              {amending ? 'Saving Revision...' : 'Save Traceable Amendment'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default ConsultationDetails;

