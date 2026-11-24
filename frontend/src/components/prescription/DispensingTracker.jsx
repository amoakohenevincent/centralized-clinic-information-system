import React from 'react';
import { Badge } from '../common/Badge';

export const DispensingTracker = ({ prescription }) => {
  if (!prescription) return null;

  const totalItems = prescription.items?.length || 0;
  const fullyDispensedItems =
    prescription.items?.filter((i) => (i.quantityDispensed || 0) >= i.quantityPrescribed).length || 0;
  const progressPercent = totalItems > 0 ? Math.round((fullyDispensedItems / totalItems) * 100) : 0;

  const steps = [
    { label: 'Prescribed', done: true },
    {
      label: 'Received',
      done: prescription.status !== 'cancelled',
      active: prescription.status === 'pending'
    },
    {
      label: 'Dispensing',
      done: ['partially_dispensed', 'fulfilled'].includes(prescription.status),
      active: ['partially_dispensed', 'pending_backorder'].includes(prescription.status)
    },
    {
      label: 'Fulfilled',
      done: prescription.status === 'fulfilled',
      active: prescription.status === 'fulfilled'
    }
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-base font-bold text-slate-900">Pharmacy Dispensing Status</h3>
          <p className="text-xs text-slate-500">Live reconciliation with Pharmacy and Inventory module</p>
        </div>
        <Badge status={prescription.status} />
      </div>

      {/* Visual Stepper */}
      <div className="relative flex items-center justify-between max-w-xl mx-auto py-2">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 w-full z-0" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-teal-600 transition-all duration-300 z-0"
          style={{ width: `${progressPercent}%` }}
        />

        {steps.map((step, idx) => (
          <div key={idx} className="relative z-10 flex flex-col items-center">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                step.done
                  ? 'bg-teal-600 text-white'
                  : step.active
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {idx + 1}
            </div>
            <span className="text-[11px] font-semibold text-slate-700 mt-1.5 text-center whitespace-nowrap">
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1.5">
          <span>Overall Medication Fulfillment</span>
          <span>
            {fullyDispensedItems} of {totalItems} items completed ({progressPercent}%)
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
          <div
            className="h-2 rounded-full bg-teal-600 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Items Breakdown Checklist */}
      <div className="border border-slate-200 rounded-xl overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 text-slate-700 font-bold border-b border-slate-200 text-[11px] uppercase tracking-wider">
            <tr>
              <th className="px-4 py-3">Medication</th>
              <th className="px-4 py-3">Prescribed</th>
              <th className="px-4 py-3">Dispensed</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Batch #</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {prescription.items?.map((item, idx) => (
              <tr key={idx} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-900">{item.medicineName}</div>
                  <div className="text-[11px] text-slate-500">
                    {item.strength} • {item.form}
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-slate-700">{item.quantityPrescribed}</td>
                <td className="px-4 py-3 font-semibold text-slate-900">
                  {item.quantityDispensed || 0}
                </td>
                <td className="px-4 py-3">
                  <Badge status={item.itemStatus || 'pending'} />
                </td>
                <td className="px-4 py-3 font-mono text-slate-600 text-[11px]">
                  {item.batchNumber || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pharmacist Dispensing Logs */}
      {prescription.dispensingHistory && prescription.dispensingHistory.length > 0 && (
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Pharmacist Dispensing Audit Trail
          </h4>
          <div className="space-y-2">
            {prescription.dispensingHistory.map((dh, i) => (
              <div key={i} className="text-xs bg-white p-3 rounded-lg border border-slate-200">
                <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
                  <span className="font-semibold text-slate-900">{dh.pharmacistName}</span>
                  <span>{new Date(dh.dispensedAt).toLocaleString()}</span>
                </div>
                {dh.notes && <p className="text-slate-700">"{dh.notes}"</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default DispensingTracker;
