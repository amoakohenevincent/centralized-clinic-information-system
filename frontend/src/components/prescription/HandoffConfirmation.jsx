import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Alert } from '../common/Alert';

export const HandoffConfirmation = ({
  isOpen,
  onClose,
  prescriptionData,
  onConfirmHandoff,
  isSubmitting
}) => {
  const [confirmedAllergies, setConfirmedAllergies] = useState(false);
  const [confirmedDosage, setConfirmedDosage] = useState(false);

  if (!prescriptionData) return null;

  const canSubmit = confirmedAllergies && confirmedDosage && !isSubmitting;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Clinical Prescription Sign-Off & Pharmacy Handoff"
      maxWidth="max-w-xl"
    >
      <div className="space-y-4">
        <Alert
          type="info"
          title="Electronic Pharmacy Dispatch Protocol"
          message="Submitting this prescription will transmit the order directly to the Pharmacy dispensing queue. Once dispensing begins, modifications are locked."
        />

        {/* Patient & Summary */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">Patient:</span>
            <span className="font-semibold text-slate-900">
              {prescriptionData.patientName} ({prescriptionData.patientIdentifier})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Clinical Diagnosis:</span>
            <span className="font-medium text-slate-800">
              {prescriptionData.clinicalDiagnosis || 'Not specified'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Medications Count:</span>
            <span className="font-bold text-teal-800">{prescriptionData.items?.length || 0} items</span>
          </div>
        </div>

        {/* Item Summary List */}
        <div className="border border-slate-200 rounded-xl max-h-48 overflow-y-auto divide-y divide-slate-200 text-xs">
          {prescriptionData.items?.map((item, idx) => (
            <div key={idx} className="p-3 flex justify-between items-center">
              <div>
                <span className="font-semibold text-slate-900">{item.medicineName}</span>{' '}
                <span className="text-slate-500">({item.strength}, {item.form})</span>
                <div className="text-[11px] text-slate-500">
                  {item.dosage} • {item.frequency} • {item.duration}
                </div>
              </div>
              <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded border border-slate-300">
                Qty: {item.quantityPrescribed}
              </span>
            </div>
          ))}
        </div>

        {/* Clinical Safety Checkboxes */}
        <div className="space-y-2 pt-2 border-t border-slate-200">
          <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmedAllergies}
              onChange={(e) => setConfirmedAllergies(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-600"
            />
            <span>
              I have checked the patient's allergy profile and confirmed no contraindications exist with the selected medicines.
            </span>
          </label>

          <label className="flex items-start gap-2.5 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={confirmedDosage}
              onChange={(e) => setConfirmedDosage(e.target.checked)}
              className="mt-0.5 rounded border-slate-300 text-teal-600 focus:ring-teal-600"
            />
            <span>
              I authorize the clinical dosages, frequencies, and durations prescribed for dispensing.
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel / Edit
          </Button>
          <Button
            variant="primary"
            onClick={onConfirmHandoff}
            disabled={!canSubmit}
            isLoading={isSubmitting}
          >
            Authorize & Dispatch to Pharmacy
          </Button>
        </div>
      </div>
    </Modal>
  );
};
export default HandoffConfirmation;
