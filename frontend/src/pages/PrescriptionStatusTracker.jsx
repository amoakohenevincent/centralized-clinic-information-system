import React, { useState } from 'react';
import { DispensingTracker } from '../components/prescription/DispensingTracker';
import { Button } from '../components/common/Button';
import { Alert } from '../components/common/Alert';
import { Badge } from '../components/common/Badge';
import { prescriptionService } from '../services/prescriptionService';
import { useAuth } from '../context/AuthContext';

export const PrescriptionStatusTracker = ({ prescription, onNavigate, onStatusUpdated }) => {
  const { isPharmacist, currentUser } = useAuth();
  const [currentRx, setCurrentRx] = useState(prescription);
  const [dispenseInputs, setDispenseInputs] = useState(() => {
    const initial = {};
    prescription?.items?.forEach((it) => {
      initial[it.medicineId] = {
        quantityDispensed: it.quantityDispensed || 0,
        batchNumber: it.batchNumber || 'BAT-2026-01',
        itemStatus: it.itemStatus || 'pending'
      };
    });
    return initial;
  });
  const [dispensingNotes, setDispensingNotes] = useState('');
  const [overallStatus, setOverallStatus] = useState(prescription?.status || 'pending');
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!currentRx) {
    return (
      <div className="p-8 text-center space-y-3">
        <div className="text-slate-500 text-sm">No prescription selected for status tracking.</div>
        <Button size="sm" onClick={() => onNavigate('dashboard')}>
          Back to Dashboard
        </Button>
      </div>
    );
  }

  const handleItemQtyChange = (medicineId, qty) => {
    setDispenseInputs((prev) => ({
      ...prev,
      [medicineId]: {
        ...prev[medicineId],
        quantityDispensed: Math.max(0, parseInt(qty, 10) || 0)
      }
    }));
  };

  const handleItemBatchChange = (medicineId, batch) => {
    setDispenseInputs((prev) => ({
      ...prev,
      [medicineId]: {
        ...prev[medicineId],
        batchNumber: batch
      }
    }));
  };

  // Pharmacy Handoff Execution (Madam Sarah Module 4 Integration)
  const handleRecordDispense = async (e) => {
    e.preventDefault();
    setFeedback({ type: '', message: '' });

    // Enforce Rule: Do not mark as fulfilled when only some items have been dispensed
    if (overallStatus === 'fulfilled') {
      const anyItemIncomplete = currentRx.items.some((item) => {
        const inp = dispenseInputs[item.medicineId];
        const dispensed = inp ? inp.quantityDispensed : item.quantityDispensed || 0;
        return dispensed < item.quantityPrescribed;
      });

      if (anyItemIncomplete) {
        setFeedback({
          type: 'error',
          message:
            'Integrity rule violation: Cannot mark prescription as fulfilled when one or more items have not been completely dispensed. Please select "Partially dispensed" or "Pending backorder".'
        });
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const itemsPayload = currentRx.items.map((item) => ({
        medicineId: item.medicineId,
        quantityDispensed: dispenseInputs[item.medicineId]?.quantityDispensed ?? item.quantityDispensed,
        batchNumber: dispenseInputs[item.medicineId]?.batchNumber || '',
        itemStatus:
          (dispenseInputs[item.medicineId]?.quantityDispensed ?? 0) >= item.quantityPrescribed
            ? 'dispensed'
            : (dispenseInputs[item.medicineId]?.quantityDispensed ?? 0) > 0
            ? 'partially_dispensed'
            : overallStatus === 'pending_backorder'
            ? 'backordered'
            : 'pending'
      }));

      const updated = await prescriptionService.updateDispenseStatus(currentRx._id, {
        status: overallStatus,
        dispensingNotes,
        itemsDispensed: itemsPayload,
        pharmacistName: currentUser.name
      });

      setCurrentRx(updated);
      setFeedback({
        type: 'success',
        message: `Dispensing status successfully synchronized. Current status: '${overallStatus}'.`
      });

      if (onStatusUpdated) {
        onStatusUpdated(updated);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            Dispensing Status & Pharmacy Reconciliation
          </h2>
          <p className="text-xs text-slate-500">
            Prescription ID: <span className="font-mono font-bold text-teal-800">{currentRx.prescriptionNumber}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" onClick={() => onNavigate('dashboard')}>
            Dashboard
          </Button>
          <Button variant="outline" size="sm" onClick={() => onNavigate('details')}>
            View Full Rx
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

      {/* Visual Live Tracker Component */}
      <DispensingTracker prescription={currentRx} />

      {/* Pharmacist Dispensing Execution Panel (Madam Sarah's Integration Interface) */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <h3 className="text-sm font-semibold text-slate-800">
              Module 4 Pharmacy Dispensing Action Interface
            </h3>
          </div>
          <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
            Pharmacist Role Active: {currentUser.name}
          </span>
        </div>

        {!isPharmacist ? (
          <Alert
            type="info"
            title="Read-Only View for Non-Pharmacists"
            message="Only authorized Pharmacy staff may record medication dispensing. To test or simulate dispensing, switch your simulation role to 'Pharmacist (Sarah)' in the top navbar."
          />
        ) : (
          <form onSubmit={handleRecordDispense} className="space-y-4 text-xs">
            {/* Item Dispensing Quantity Form */}
            <div className="space-y-3">
              <label className="block font-semibold text-slate-700">
                Record Dispensed Quantities per Medication:
              </label>

              {currentRx.items?.map((item) => (
                <div
                  key={item.medicineId}
                  className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex-1">
                    <span className="font-bold text-slate-900">{item.medicineName}</span>{' '}
                    <span className="text-slate-500">({item.strength})</span>
                    <div className="text-[11px] text-slate-500">
                      Prescribed: <strong className="text-slate-800">{item.quantityPrescribed} units</strong> • Current Dispensed: {item.quantityDispensed || 0}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Batch Number</span>
                      <input
                        type="text"
                        value={dispenseInputs[item.medicineId]?.batchNumber || ''}
                        onChange={(e) => handleItemBatchChange(item.medicineId, e.target.value)}
                        placeholder="Batch #"
                        className="px-2 py-1 text-xs border border-slate-300 rounded font-mono w-28 bg-white focus:ring-1 focus:ring-teal-500"
                      />
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 block">Dispense Qty</span>
                      <input
                        type="number"
                        min="0"
                        max={item.quantityPrescribed}
                        value={dispenseInputs[item.medicineId]?.quantityDispensed ?? 0}
                        onChange={(e) => handleItemQtyChange(item.medicineId, e.target.value)}
                        className="px-2 py-1 text-xs border border-slate-300 rounded font-bold w-20 bg-white focus:ring-1 focus:ring-teal-500"
                        required
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Target Status Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Updated Prescription Status <span className="text-rose-500">*</span>
                </label>
                <select
                  value={overallStatus}
                  onChange={(e) => setOverallStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-medium text-xs focus:ring-2 focus:ring-teal-500"
                >
                  <option value="pending">Pending</option>
                  <option value="partially_dispensed">Partially dispensed</option>
                  <option value="fulfilled">Fulfilled</option>
                  <option value="pending_backorder">Pending backorder</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  Note: Marking "Fulfilled" requires that all items have been 100% dispensed.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pharmacist Dispensing Notes & Patient Counselling
                </label>
                <textarea
                  rows="2"
                  placeholder="e.g., Patient counselled on taking antibiotic after meals. 2nd item backordered."
                  value={dispensingNotes}
                  onChange={(e) => setDispensingNotes(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Submit Action */}
            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
              >
                Transmit Dispensing Update to Prescription Module
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
