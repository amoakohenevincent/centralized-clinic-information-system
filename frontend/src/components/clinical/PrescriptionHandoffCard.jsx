import React, { useState } from 'react';
import { clinicalService } from '../../services/clinicalService';
import AlertBanner from '../common/AlertBanner';
import Badge from '../common/Badge';

const PrescriptionHandoffCard = ({ consultation, onHandoffInitiated }) => {
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [handoffResult, setHandoffResult] = useState(null);
  const [error, setError] = useState(null);

  const isInitiated = consultation?.prescriptionHandoff?.initiated || handoffResult !== null;

  const handleInitiate = async () => {
    if (!consultation?.diagnoses || consultation.diagnoses.length === 0) {
      setError('Cannot initiate prescription without at least one recorded diagnosis.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await clinicalService.initiatePrescriptionHandoff(consultation._id, notes);
      setHandoffResult(result);
      if (onHandoffInitiated) {
        onHandoffInitiated(result);
      }
    } catch (err) {
      setError(err.message || 'Failed to initiate prescription handoff.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-none border border-[#e9e9e7] shadow-notion-card space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-none bg-[#f1f1ef] text-[#191919] border border-[#e5e5e3] flex items-center justify-center font-bold text-xs">
            Rx
          </div>
          <div>
            <h4 className="font-serif font-bold text-lg text-[#191919]">
              Prescription & Pharmacy Handoff
            </h4>
            <p className="text-xs text-[#787774]">
              Send patient diagnosis and vitals to the dispensary / pharmacy
            </p>
          </div>
        </div>

        <div>
          {isInitiated ? (
            <Badge>
              Prescription Sent
            </Badge>
          ) : (
            <Badge>
              Not Sent Yet
            </Badge>
          )}
        </div>
      </div>

      {error && <AlertBanner type="danger" message={error} />}

      {isInitiated ? (
        <AlertBanner
          type="success"
          title="Prescription Sent to Pharmacy"
          message="Patient details, illness diagnosed, vitals, and drug allergies have been sent to the clinic pharmacy."
        >
          <div className="mt-3 p-2.5 bg-[#fbfbfa] rounded-none border border-[#e5e5e3] font-mono text-xs text-[#191919] flex items-center justify-between">
            <span>Prescription Link:</span>
            <span className="font-bold">
              {handoffResult?.redirectUrl ||
                `/prescriptions/new?consultationId=${consultation._id}&patientId=${consultation.patientId?._id}`}
            </span>
          </div>
          <p className="text-[11px] text-[#787774] mt-2 italic">
            * Dispensing of drugs is handled by the pharmacy and dispensary staff.
          </p>
        </AlertBanner>
      ) : (
        <div className="space-y-4 pt-1">
          <p className="text-xs text-[#5a5a5a] leading-relaxed">
            Send this patient's diagnosis and notes to the pharmacy so medication can be prescribed and dispensed.
          </p>

          <div>
            <label className="block text-[11px] font-medium text-[#787774] mb-1">
              Doctor's Notes for the Pharmacist (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Paracetamol 500mg TDS for 3 days; Amoxicillin 500mg TDS for 5 days"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs px-3 py-2 bg-[#fbfbfa] border border-[#e5e5e3] rounded-none text-[#191919]"
            />
          </div>

          <button
            onClick={handleInitiate}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-[#191919] hover:bg-[#333333] text-white font-medium text-xs rounded-none shadow-notion-button transition-colors disabled:opacity-50"
          >
            <span>
              {loading ? 'Sending to Pharmacy...' : 'Send Details to Clinic Pharmacy'}
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default PrescriptionHandoffCard;
