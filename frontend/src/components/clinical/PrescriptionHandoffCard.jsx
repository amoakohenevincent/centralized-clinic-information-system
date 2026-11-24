import React, { useState } from 'react';
import { Pill, Send, CheckCircle2, ArrowRight } from 'lucide-react';
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
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-card space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold text-sm">
            <Pill className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-base text-slate-900">
              Prescription & Pharmacy Handoff
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Instantly route consultation findings and diagnosis to the dispensing pharmacy queue.
            </p>
          </div>
        </div>

        <div>
          {isInitiated ? (
            <Badge variant="completed">
              Prescription Sent
            </Badge>
          ) : (
            <Badge variant="neutral">
              Awaiting Handoff
            </Badge>
          )}
        </div>
      </div>

      {error && <AlertBanner type="danger" message={error} />}

      {isInitiated ? (
        <AlertBanner
          type="success"
          title="Prescription Transmitted to Pharmacy"
          message={`Transmitted to CCIS Pharmacy Queue under Token #${
            handoffResult?.data?.prescriptionNumber ||
            consultation?.prescriptionHandoff?.prescriptionNumber ||
            'RX-PENDING'
          }. Pharmacist can dispense medications immediately.`}
        />
      ) : (
        <div className="space-y-3 pt-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Prescription Clinical Instructions / Dispensing Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Dispense first-line Artemether-Lumefantrine 20/120mg, Paracetamol 500mg TDS"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs sm:text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-400/20"
            />
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={handleInitiate}
              disabled={loading}
              className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-xs hover:shadow transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{loading ? 'Transmitting to Pharmacy...' : 'Initiate Pharmacy Handoff'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PrescriptionHandoffCard;
