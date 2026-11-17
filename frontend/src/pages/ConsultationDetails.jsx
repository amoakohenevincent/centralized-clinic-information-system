import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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
      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
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
          <Link to="/doctor/dashboard" className="text-xs font-medium text-[#191919] hover:underline flex items-center gap-1">
            ← Return to Doctor Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const patient = consultation.patientId;
  const doctor = consultation.doctorId;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to={`/doctor/patients/${patient?._id}/history`}
          className="text-xs font-medium text-[#787774] hover:text-[#191919] flex items-center gap-1 transition-colors"
        >
          ← Back to Patient Records
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-serif text-3xl sm:text-4xl font-normal text-[#191919] tracking-tight">
                Consultation Details & Notes
              </h1>
              <Badge>
                {consultation.status === 'amended' ? 'Updated' : 'Completed'}
              </Badge>
            </div>
            <p className="text-xs text-[#787774] mt-1 font-mono">
              Visit No: <strong className="text-[#191919]">{consultation.consultationNumber}</strong> • {new Date(consultation.consultationDate).toLocaleString()}
            </p>
          </div>

          {/* Action buttons (Doctor only) */}
          {isDoctor && (
            <div className="flex items-center gap-2">
              <Link
                to={`/doctor/diagnoses?consultationId=${consultation._id}`}
                className="px-3 py-1.5 text-xs font-medium text-[#191919] bg-[#f1f1ef] hover:bg-[#e5e5e3] rounded-none border border-[#e5e5e3] transition-colors"
              >
                + Add Diagnosis
              </Link>

              <button
                onClick={() => setIsAmendModalOpen(true)}
                className="px-3 py-1.5 text-xs font-medium text-[#191919] bg-[#f1f1ef] hover:bg-[#e5e5e3] rounded-none border border-[#e5e5e3] transition-colors"
              >
                Update Notes
              </button>
            </div>
          )}
        </div>

        {/* Metadata Table */}
        <div className="bg-white rounded-none border border-[#e9e9e7] p-5 shadow-notion-card">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-[#9b9a97] text-[11px] block font-medium">Patient Name</span>
              <strong className="text-[#191919] block">{patient?.fullName || `${patient?.firstName} ${patient?.lastName}`}</strong>
              <span className="text-[11px] text-[#191919] font-mono block">{patient?.universityId}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[#9b9a97] text-[11px] block font-medium">Doctor on Duty</span>
              <strong className="text-[#191919] block">{doctor?.title || 'Dr.'} {doctor?.firstName} {doctor?.lastName}</strong>
              <span className="text-[11px] text-[#787774] block">{doctor?.specialization || 'Medical Officer'}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[#9b9a97] text-[11px] block font-medium">License / Reg No.</span>
              <span className="font-mono text-[#191919]">{doctor?.medicalLicenseNumber || 'MDC-88319-GH'}</span>
            </div>
            <div className="space-y-1">
              <span className="text-[#9b9a97] text-[11px] block font-medium">Blood Group</span>
              <span className="font-bold text-[#191919]">{patient?.bloodGroup || 'O+'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Vital Signs Grid */}
      <div className="space-y-2">
        <span className="text-xs uppercase font-bold tracking-wider text-[#787774] block">
          Patient Vital Signs Checked
        </span>
        <VitalSignsDisplay vitals={consultation.vitalSigns} />
      </div>

      {/* Complaints & Symptoms */}
      <div className="bg-white rounded-none border border-[#e9e9e7] p-6 shadow-notion-card space-y-3">
        <h3 className="font-serif font-bold text-base text-[#191919]">Patient Complaints & Symptoms</h3>
        <div className="space-y-2">
          {consultation.presentingComplaints?.length === 0 ? (
            <p className="text-xs text-[#9b9a97]">No complaints logged.</p>
          ) : (
            consultation.presentingComplaints?.map((c, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-[#fbfbfa] rounded-none border border-[#e9e9e7] text-xs">
                <span className="font-medium text-[#191919]">{c.complaint}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[#787774]">{c.duration}</span>
                  <Badge variant={c.severity === 'severe' ? 'red' : 'yellow'}>{c.severity}</Badge>
                </div>
              </div>
            ))
          )}
        </div>

        {consultation.symptoms?.length > 0 && (
          <div className="pt-2">
            <span className="text-[11px] font-medium text-[#787774] block mb-1.5">Symptoms Mentioned:</span>
            <div className="flex flex-wrap gap-1.5">
              {consultation.symptoms.map((s, idx) => (
                <span key={idx} className="text-xs px-2.5 py-0.5 bg-[#ebebeb] text-[#5a5a5a] rounded-none">
                  {s}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Clinical Observations & Diagnoses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Physical Findings */}
        <div className="bg-white rounded-none border border-[#e9e9e7] p-6 shadow-notion-card space-y-3">
          <h3 className="font-serif font-bold text-base text-[#191919] flex items-center gap-2">
            Doctor's Findings & Physical Examination
          </h3>
          <p className="text-xs sm:text-sm text-[#37352f] leading-relaxed bg-[#fbfbfa] p-4 rounded-none border border-[#f1f1ef] whitespace-pre-line">
            {consultation.clinicalObservations}
          </p>

          {consultation.doctorNotes && (
            <div className="pt-2 border-t border-[#f1f1ef]">
              <span className="text-[11px] font-medium text-[#787774] block mb-1">Doctor's Notes & Advice:</span>
              <p className="text-xs text-[#191919] bg-[#fbfbfa] p-3 rounded-none border border-[#e5e5e3]">
                {consultation.doctorNotes}
              </p>
            </div>
          )}
        </div>

        {/* Diagnoses List */}
        <div className="bg-white rounded-none border border-[#e9e9e7] p-6 shadow-notion-card space-y-3">
          <h3 className="font-serif font-bold text-base text-[#191919]">
            Illnesses Diagnosed ({consultation.diagnoses?.length || 0})
          </h3>
          <div className="space-y-2">
            {consultation.diagnoses?.map((diag, idx) => (
              <div key={idx} className="p-3 bg-[#fbfbfa] rounded-none border border-[#e9e9e7] space-y-1">
                <DiagnosisBadge diagnosis={diag} />
                {diag.notes && <p className="text-[11px] text-[#787774] pl-1">{diag.notes}</p>}
              </div>
            ))}
          </div>

          {/* Follow-up card */}
          {consultation.followUpRecommendations?.followUpRequired && (
            <div className="mt-4 p-3.5 bg-[#f7f6f3] border border-[#e9e9e7] rounded-none text-xs space-y-1">
              <span className="font-semibold text-[#191919] block">Review Visit Recommended</span>
              <div className="text-[#5a5a5a]">
                Date: {consultation.followUpRecommendations.followUpDate ? new Date(consultation.followUpRecommendations.followUpDate).toLocaleDateString() : 'To be confirmed'}
              </div>
              {consultation.followUpRecommendations.instructions && (
                <div className="text-[#787774] text-[11px]">
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

      {/* Controlled Traceable Audit Trail (Functional Requirement 6) */}
      {consultation.auditTrail && consultation.auditTrail.length > 0 && (
        <div className="bg-white rounded-none border border-[#e9e9e7] p-6 shadow-notion-card space-y-3">
          <h3 className="font-serif font-bold text-base text-[#191919]">
            Clinical Record Audit Trail ({consultation.auditTrail.length} revisions)
          </h3>
          <div className="space-y-2.5">
            {consultation.auditTrail.map((entry, idx) => (
              <div key={idx} className="p-3 bg-[#fbfbfa] rounded-none border border-[#e9e9e7] text-xs space-y-1">
                <div className="flex items-center justify-between text-[#787774]">
                  <span className="font-medium text-[#191919]">
                    Amended by {entry.modifiedByName || 'Authorized Doctor'}
                  </span>
                  <span className="text-[11px] text-[#9b9a97]">
                    {new Date(entry.modifiedAt).toLocaleString()}
                  </span>
                </div>
                <div className="text-[#37352f] bg-white p-2.5 rounded-none border border-[#e5e5e3]">
                  <strong>Reason for Modification:</strong> {entry.reasonForChange}
                </div>
                {entry.changesSummary && (
                  <p className="text-[11px] text-[#787774] italic">{entry.changesSummary}</p>
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
            <label className="block text-[11px] font-medium text-[#787774] mb-1">
              Revised Clinical Observations & Findings *
            </label>
            <textarea
              rows={4}
              value={amendedObservations}
              onChange={(e) => setAmendedObservations(e.target.value)}
              className="w-full text-xs p-3 bg-[#fbfbfa] border border-[#e5e5e3] rounded-none text-[#191919] focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#787774] mb-1">
              Revised Doctor's Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={amendedDoctorNotes}
              onChange={(e) => setAmendedDoctorNotes(e.target.value)}
              className="w-full text-xs p-3 bg-[#fbfbfa] border border-[#e5e5e3] rounded-none text-[#191919] focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#787774] mb-1">
              Legal Reason for Clinical Amendment *
            </label>
            <input
              type="text"
              placeholder="e.g. Revised diagnosis following urgent radiology findings."
              value={reasonForChange}
              onChange={(e) => setReasonForChange(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-[#fbfbfa] border border-[#e5e5e3] rounded-none text-[#191919]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAmendModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-[#5a5a5a] hover:bg-[#f1f1ef] rounded-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={amending}
              className="px-5 py-2 bg-[#191919] hover:bg-[#333333] text-white text-xs font-medium rounded-none shadow-notion-button disabled:opacity-50"
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
