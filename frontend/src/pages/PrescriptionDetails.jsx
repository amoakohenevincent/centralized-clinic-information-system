import React, { useState } from 'react';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Alert } from '../components/common/Alert';
import { Modal } from '../components/common/Modal';
import { prescriptionService } from '../services/prescriptionService';
import { useAuth } from '../context/AuthContext';

export const PrescriptionDetails = ({ prescription, onNavigate, onUpdateSuccess }) => {
  const { isDoctor, currentUser } = useAuth();
  const [currentRx, setCurrentRx] = useState(prescription);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editReason, setEditReason] = useState('');
  const [editInstructions, setEditInstructions] = useState(currentRx?.generalInstructions || '');
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [isSaving, setIsSaving] = useState(false);

  if (!currentRx) {
    return (
      <div className="p-8 text-center space-y-3">
        <div className="text-slate-500 text-sm">No prescription selected.</div>
        <Button size="sm" onClick={() => onNavigate('dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const isPending = currentRx.status === 'pending';

  // Controlled update before dispensing
  const handleSaveUpdate = async () => {
    if (!editReason || editReason.trim().length < 5) {
      setFeedback({ type: 'error', message: 'A valid clinical reason (min 5 characters) is required for audit logging.' });
      return;
    }

    setIsSaving(true);
    try {
      const updated = await prescriptionService.updatePrescription(currentRx._id, {
        reason: editReason,
        generalInstructions: editInstructions
      });
      setCurrentRx(updated);
      setIsEditModalOpen(false);
      setFeedback({ type: 'success', message: 'Prescription updated and audit trail recorded successfully.' });
      if (onUpdateSuccess) onUpdateSuccess(updated);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setIsSaving(false);
    }
  };

  // Pre-dispense cancellation
  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this prescription before dispensing? This action is recorded in the audit trail.')) {
      return;
    }
    try {
      const updated = await prescriptionService.updatePrescription(currentRx._id, {
        reason: 'Cancelled by physician prior to pharmacy dispensing'
      });
      updated.status = 'cancelled';
      setCurrentRx({ ...updated });
      setFeedback({ type: 'info', message: 'Prescription marked as cancelled.' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fadeIn">
      {/* Action Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="secondary" size="sm" onClick={() => onNavigate('dashboard')}>
            ← Back
          </Button>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              Prescription {currentRx.prescriptionNumber}
            </h2>
            <p className="text-xs text-slate-500">Official Clinical Record</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            Print Prescription
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => onNavigate('status')}
          >
            Track Dispensing
          </Button>
        </div>
      </div>

      {feedback.message && (
        <Alert
          type={feedback.type}
          message={feedback.message}
          onDismiss={() => setFeedback({ type: '', message: '' })}
        />
      )}

      {/* Main Printable Clinic Rx Card */}
      <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-card space-y-6 printable-area">
        {/* Clinic Header */}
        <div className="flex justify-between items-start border-b-2 border-teal-700 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-7 h-7 rounded-lg bg-teal-700 text-white font-bold flex items-center justify-center text-sm">
                Rx
              </span>
              <h1 className="text-base font-bold text-slate-900 tracking-tight">
                UNIVERSITY HEALTH SERVICES
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">Centralized Clinic Information System (CCIS)</p>
            <p className="text-[11px] text-slate-400">Main Campus Health Directorate • Pharmacy Department</p>
          </div>

          <div className="text-right">
            <div className="font-mono font-bold text-teal-800 text-sm tracking-wide">
              {currentRx.prescriptionNumber}
            </div>
            <div className="text-xs text-slate-500">
              Date: {new Date(currentRx.prescriptionDate || currentRx.createdAt).toLocaleDateString()}
            </div>
            <div className="mt-1">
              <Badge status={currentRx.status} />
            </div>
          </div>
        </div>

        {/* Patient & Doctor Credentials Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Patient Name</span>
            <span className="font-bold text-slate-900 text-sm">{currentRx.patientName}</span>
            <div className="font-mono text-slate-500 text-[11px] mt-0.5">{currentRx.patientIdentifier}</div>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Prescribing Physician</span>
            <span className="font-semibold text-slate-800">{currentRx.doctorName}</span>
            <div className="text-slate-500 text-[11px] mt-0.5">Authorized Medical Officer</div>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Consultation Ref</span>
            <span className="font-mono text-slate-700">{currentRx.consultationId || 'Direct Consultation'}</span>
            <div className="text-slate-500 text-[11px] mt-0.5">
              Diagnosis: <span className="font-medium text-slate-800">{currentRx.clinicalDiagnosis || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Medication Schedule Table */}
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
            Prescribed Medications & Dosage Schedule
          </h3>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 text-[11px]">
                <tr>
                  <th className="px-4 py-3">#</th>
                  <th className="px-4 py-3">Medication Name & Strength</th>
                  <th className="px-4 py-3">Dosage & Frequency</th>
                  <th className="px-4 py-3">Duration</th>
                  <th className="px-4 py-3">Quantity</th>
                  <th className="px-4 py-3">Instructions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentRx.items?.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 font-semibold text-slate-400">{idx + 1}</td>
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{item.medicineName}</div>
                      <div className="text-[11px] text-slate-500">
                        {item.strength} • {item.form}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      <div>{item.dosage}</div>
                      <div className="text-[11px] text-teal-700 font-semibold">{item.frequency}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-700">{item.duration}</td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">
                      {item.quantityPrescribed}
                    </td>
                    <td className="px-4 py-3 text-slate-600 italic">
                      {item.instructions || 'As instructed by doctor'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* General Instructions */}
        {currentRx.generalInstructions && (
          <div className="bg-teal-50/50 border border-teal-100 rounded-lg p-3 text-xs">
            <span className="font-bold text-teal-900 block mb-0.5">Doctor's Advice to Patient:</span>
            <p className="text-slate-700">{currentRx.generalInstructions}</p>
          </div>
        )}

        {/* Controlled Updates / Management Actions (Before Dispensing) */}
        {isDoctor && (
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
            <div className="text-xs text-slate-500">
              {isPending ? (
                <span className="text-emerald-700 font-medium">
                  ● Status is Pending: Controlled updates or cancellation are permitted before pharmacy dispensing.
                </span>
              ) : (
                <span className="text-slate-400">
                  🔒 Locked: Prescription modifications are prohibited once pharmacy dispensing has commenced.
                </span>
              )}
            </div>

            {isPending && (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditModalOpen(true)}
                >
                  Edit Instructions
                </Button>
                <Button
                  size="sm"
                  variant="dangerOutline"
                  onClick={handleCancel}
                >
                  Cancel Prescription
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Audit Trail Section */}
        {currentRx.auditTrail && currentRx.auditTrail.length > 0 && (
          <div className="pt-4 border-t border-slate-100 space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Clinical Audit History
            </h4>
            <div className="space-y-1.5 text-xs text-slate-600">
              {currentRx.auditTrail.map((entry, idx) => (
                <div key={idx} className="flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-100">
                  <span>
                    <strong className="text-slate-800 capitalize">{entry.action.replace('_', ' ')}</strong>
                    {entry.reason && <span className="text-slate-500"> — {entry.reason}</span>}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {new Date(entry.modifiedAt).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Edit Modal (Pre-dispense) */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Controlled Prescription Update (Pre-Dispense)"
      >
        <div className="space-y-4">
          <Alert
            type="warning"
            title="Audit Requirement"
            message="All updates to a prescription require a recorded clinical reason and are saved directly into the audit trail."
          />

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Clinical Reason for Modification <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g., Adjusted instructions following lab sensitivity report"
              value={editReason}
              onChange={(e) => setEditReason(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              General Patient Instructions
            </label>
            <textarea
              rows="3"
              value={editInstructions}
              onChange={(e) => setEditInstructions(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="secondary" size="sm" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveUpdate} isLoading={isSaving}>
              Save & Log Audit
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
