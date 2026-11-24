import React, { useState } from 'react';
import { Button } from '../components/common/Button';
import { Alert } from '../components/common/Alert';
import { PrescriptionItemRow } from '../components/prescription/PrescriptionItemRow';
import { MedicineSelectorModal } from '../components/prescription/MedicineSelectorModal';
import { HandoffConfirmation } from '../components/prescription/HandoffConfirmation';
import { prescriptionService } from '../services/prescriptionService';
import { useAuth } from '../context/AuthContext';

const CLINICAL_CONSULTATION_STUBS = [
  {
    consultationId: 'con_001',
    patientId: 'pat_001',
    patientName: 'Kofi Mensah',
    patientIdentifier: 'STU-2024-8841',
    age: 21,
    gender: 'Male',
    diagnosis: 'Acute Bacterial Tonsillitis with pyrexia',
    allergies: ['Penicillin (mild rash reported)']
  },
  {
    consultationId: 'con_002',
    patientId: 'pat_002',
    patientName: 'Ama Serwaa',
    patientIdentifier: 'STU-2023-4109',
    age: 22,
    gender: 'Female',
    diagnosis: 'Moderate Persistent Asthma with Nocturnal Wheeze',
    allergies: ['Aspirin / NSAIDs (bronchospasm risk)']
  },
  {
    consultationId: 'con_003',
    patientId: 'pat_003',
    patientName: 'Prof. Ernest Addo',
    patientIdentifier: 'STF-1998-0042',
    age: 58,
    gender: 'Male',
    diagnosis: 'Type 2 Diabetes Mellitus & Stage 1 Hypertension',
    allergies: ['No known drug allergies (NKDA)']
  }
];

export const CreatePrescription = ({ onNavigate, onCreatedSuccess }) => {
  const { currentUser, isDoctor } = useAuth();

  const [selectedConsultation, setSelectedConsultation] = useState(CLINICAL_CONSULTATION_STUBS[0]);

  const [clinicalDiagnosis, setClinicalDiagnosis] = useState(CLINICAL_CONSULTATION_STUBS[0].diagnosis);
  const [generalInstructions, setGeneralInstructions] = useState('');
  const [isControlledMedication, setIsControlledMedication] = useState(false);
  const [items, setItems] = useState([]);

  const [isCatalogueOpen, setIsCatalogueOpen] = useState(false);
  const [isHandoffOpen, setIsHandoffOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorFeedback, setErrorFeedback] = useState('');
  const [successFeedback, setSuccessFeedback] = useState('');

  const handleConsultationChange = (conId) => {
    const found = CLINICAL_CONSULTATION_STUBS.find((c) => c.consultationId === conId);
    if (found) {
      setSelectedConsultation(found);
      setClinicalDiagnosis(found.diagnosis);
    }
  };

  const handleSelectMedicine = (med) => {
    setErrorFeedback('');
    if (items.some((i) => i.medicineId === med._id)) {
      setErrorFeedback(`'${med.name}' is already added to this prescription.`);
      return;
    }

    if (med.isControlled) {
      setIsControlledMedication(true);
    }

    const newItem = {
      medicineId: med._id,
      medicineName: med.name,
      strength: med.strength,
      form: med.form,
      dosage: med.form === 'Tablet' ? '1 tablet' : med.form === 'Capsule' ? '1 capsule' : '5ml',
      frequency: 'Three times daily (TDS)',
      duration: '5 days',
      quantityPrescribed: 15,
      instructions: 'Take after meals'
    };

    setItems([...items, newItem]);
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    updated[index] = { ...updated[index], [field]: value };
    setItems(updated);
  };

  const handleRemoveItem = (index) => {
    const updated = items.filter((_, idx) => idx !== index);
    setItems(updated);
  };

  const handleValidateAndProceed = (e) => {
    e.preventDefault();
    setErrorFeedback('');

    if (!isDoctor) {
      setErrorFeedback('Security violation: Only authorized clinical physicians may author prescriptions.');
      return;
    }

    if (items.length === 0) {
      setErrorFeedback('Prescription must contain at least one medication item before submission.');
      return;
    }

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      if (!it.dosage || !it.duration || !it.quantityPrescribed || it.quantityPrescribed < 1) {
        setErrorFeedback(
          `Please provide complete dosage, duration, and valid quantity (>= 1) for Item #${i + 1} (${it.medicineName}).`
        );
        return;
      }
    }

    setIsHandoffOpen(true);
  };

  const handleConfirmHandoff = async () => {
    setIsSubmitting(true);
    setErrorFeedback('');

    try {
      const payload = {
        patientId: selectedConsultation.patientId,
        patientName: selectedConsultation.patientName,
        patientIdentifier: selectedConsultation.patientIdentifier,
        consultationId: selectedConsultation.consultationId,
        clinicalDiagnosis,
        generalInstructions,
        isControlledMedication,
        items
      };

      const newRx = await prescriptionService.createPrescription(payload);
      setIsSubmitting(false);
      setIsHandoffOpen(false);
      setSuccessFeedback(
        `Prescription ${newRx.prescriptionNumber} submitted successfully to the central pharmacy queue.`
      );

      if (onCreatedSuccess) {
        onCreatedSuccess(newRx);
      }
    } catch (err) {
      setIsSubmitting(false);
      setErrorFeedback(err.message || 'Failed to submit prescription to pharmacy.');
    }
  };

  if (!isDoctor) {
    return (
      <div className="max-w-3xl mx-auto py-12">
        <Alert
          type="error"
          title="Access Restricted"
          message="Prescription authoring is restricted to authorized physicians. Switch your active simulation role to Doctor in the top navbar to proceed."
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Page Header */}
      <div className="bg-white p-5 sm:p-7 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-teal-800 bg-teal-50 px-2.5 py-0.5 rounded-full border border-teal-200 inline-block mb-1">
            Physician Prescription Authoring
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Create Clinical Prescription
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Author medications following patient clinical consultation with verified stock and allergy screening.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => onNavigate('dashboard')}>
            Prescription Dashboard
          </Button>
          <Button variant="outline" size="sm" onClick={() => onNavigate('catalogue')}>
            Medicine Catalogue
          </Button>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successFeedback && (
        <Alert type="success" title="Prescription Registered" message={successFeedback} />
      )}

      {/* Error Notification Banner */}
      {errorFeedback && (
        <Alert type="error" title="Submission Error" message={errorFeedback} onDismiss={() => setErrorFeedback('')} />
      )}

      {/* 1. Patient & Consultation Link */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
            <h3 className="text-sm sm:text-base font-bold text-slate-900">
              Clinical Consultation Context
            </h3>
          </div>

          {/* Quick Consultation Picker */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Select Patient:</span>
            <select
              value={selectedConsultation.consultationId}
              onChange={(e) => handleConsultationChange(e.target.value)}
              className="px-2.5 py-1 border border-slate-300 rounded-lg bg-slate-50 text-slate-800 font-semibold text-xs focus:ring-2 focus:ring-teal-600"
            >
              {CLINICAL_CONSULTATION_STUBS.map((c) => (
                <option key={c.consultationId} value={c.consultationId}>
                  {c.patientName} ({c.patientIdentifier})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Patient Details Snapshot Card */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 text-xs">
          <div>
            <span className="text-slate-500 block mb-0.5">Patient Name</span>
            <span className="font-semibold text-slate-900 text-sm">{selectedConsultation.patientName}</span>
          </div>
          <div>
            <span className="text-slate-500 block mb-0.5">Student/Staff ID</span>
            <span className="font-mono font-medium text-slate-800">{selectedConsultation.patientIdentifier}</span>
          </div>
          <div>
            <span className="text-slate-500 block mb-0.5">Demographics</span>
            <span className="font-medium text-slate-800">
              {selectedConsultation.age} yrs • {selectedConsultation.gender}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block mb-0.5">Consultation Ref</span>
            <span className="font-mono text-slate-700">{selectedConsultation.consultationId}</span>
          </div>
        </div>

        {/* Allergy Warning Alert */}
        {selectedConsultation.allergies && (
          <div className="p-3.5 bg-slate-900 rounded-xl text-xs text-white">
            <span className="font-bold text-teal-300">Known Drug Allergies: </span>
            <span>{selectedConsultation.allergies.join(', ')}</span>
          </div>
        )}
      </div>

      {/* 2. Clinical Notes & Diagnosis */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-3">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 border-b border-slate-200 pb-2">
          Clinical Indication
        </h3>
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Clinical Diagnosis / Reason for Prescription *
          </label>
          <input
            type="text"
            value={clinicalDiagnosis}
            onChange={(e) => setClinicalDiagnosis(e.target.value)}
            className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-xs sm:text-sm bg-slate-50 text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600"
            required
          />
        </div>
      </div>

      {/* 3. Prescribed Medications Builder */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-3 gap-2">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900">Prescribed Medications</h3>
            <p className="text-xs text-slate-500">
              Select verified medicines from the shared Pharmacy Catalogue
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsCatalogueOpen(true)}
          >
            Add Medicine from Catalogue
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="p-10 border border-slate-200 rounded-xl text-center space-y-2 bg-slate-50">
            <div className="text-slate-800 text-sm font-bold">No medications added yet</div>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click the button below to browse available medicines and specify dosages.
            </p>
            <div className="pt-2">
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => setIsCatalogueOpen(true)}
              >
                Open Medicine Catalogue
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((item, idx) => (
              <PrescriptionItemRow
                key={item.medicineId || idx}
                item={item}
                index={idx}
                onChange={handleItemChange}
                onRemove={handleRemoveItem}
              />
            ))}
          </div>
        )}
      </div>

      {/* 4. General Patient Instructions */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-4">
        <h3 className="text-sm sm:text-base font-bold text-slate-900 border-b border-slate-200 pb-2">
          General Instructions & Sign-Off
        </h3>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            General Patient Advice & Prescription Notes
          </label>
          <textarea
            rows="3"
            placeholder="e.g., Drink at least 2 litres of water daily. Return to clinic if fever persists beyond 72 hours."
            value={generalInstructions}
            onChange={(e) => setGeneralInstructions(e.target.value)}
            className="w-full px-3.5 py-2 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <label className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={isControlledMedication}
              onChange={(e) => setIsControlledMedication(e.target.checked)}
              className="rounded border-slate-300 text-teal-600 focus:ring-teal-600"
            />
            <span>Mark as Controlled Substance (Requires physical ID verification at pharmacy)</span>
          </label>

          <div className="flex items-center gap-2.5">
            <Button variant="secondary" size="md" onClick={() => onNavigate('dashboard')}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              disabled={items.length === 0}
              onClick={handleValidateAndProceed}
            >
              Review & Submit to Pharmacy
            </Button>
          </div>
        </div>
      </div>

      {/* Medicine Selection Modal */}
      <MedicineSelectorModal
        isOpen={isCatalogueOpen}
        onClose={() => setIsCatalogueOpen(false)}
        onSelectMedicine={handleSelectMedicine}
      />

      {/* Pharmacy Handoff Confirmation Modal */}
      <HandoffConfirmation
        isOpen={isHandoffOpen}
        onClose={() => setIsHandoffOpen(false)}
        prescriptionData={{
          patientName: selectedConsultation.patientName,
          patientIdentifier: selectedConsultation.patientIdentifier,
          clinicalDiagnosis,
          items
        }}
        onConfirmHandoff={handleConfirmHandoff}
        isSubmitting={isSubmitting}
      />
    </div>
  );
};

export default CreatePrescription;
