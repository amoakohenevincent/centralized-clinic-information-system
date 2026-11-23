import React from 'react';
import { Badge } from '../common/Badge';

export const DispensingTracker = ({ prescription }) => {
  if (!prescription) return null;

  const totalItems = prescription.items?.length || 0;
  const fullyDispensedItems =
    prescription.items?.filter((i) => (i.quantityDispensed || 0) >= i.quantityPrescribed).length || 0;
  const progressPercent = totalItems > 0 ? Math.round((fullyDispensedItems / totalItems) * 100) : 0;

  const steps = [
    { label: 'Prescribed', done: true, date: prescription.prescriptionDate },
    {
      label: 'Received at Pharmacy',
      done: prescription.status !== 'cancelled',
      active: prescription.status === 'pending'
    },
    {
      label: 'Dispensing / Processing',
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
    <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900">Pharmacy Dispensing Status</h3>
          <p className="text-xs text-slate-500">Live reconciliation with Pharmacy and Inventory module</p>
        </div>
        <Badge status={prescription.status} size="lg" />
      </div>

      {/* Visual Stepper */}
      <div className="relative flex items-center justify-between max-w-2xl mx-auto py-2">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200 w-full z-0" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-teal-500 transition-all duration-500 z-0"
          style={{ width: `${progressPercent}%` }}
        />

        {steps.map((step, idx) => (
          <div key={idx} className="relative z-10 flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                step.done
                  ? 'bg-teal-600 text-white shadow-sm'
                  : step.active
                  ? 'bg-amber-500 text-white ring-4 ring-amber-100'
                  : 'bg-slate-200 text-slate-500'
              }`}
            >
              {step.done ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                idx + 1
              )}
            </div>
            <span className="text-[11px] font-medium text-slate-700 mt-1.5 text-center whitespace-nowrap">
              {step.label}
            </span>
          </div>
        ))}
      </div>

      {/* Progress Bar */}
      <div>
        <div className="flex justify-between text-xs font-medium text-slate-600 mb-1.5">
          <span>Overall Medication Fulfillment</span>
          <span>
            {fullyDispensedItems} of {totalItems} items completed ({progressPercent}%)
          </span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-2.5 rounded-full transition-all duration-500 ${
              progressPercent === 100
                ? 'bg-emerald-500'
                : progressPercent > 0
                ? 'bg-teal-500'
                : 'bg-slate-300'
            }`}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Items Breakdown Checklist */}
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 text-[11px]">
            <tr>
              <th className="px-4 py-2.5">Medication</th>
              <th className="px-4 py-2.5">Prescribed</th>
              <th className="px-4 py-2.5">Dispensed</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Batch #</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
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
                  <Badge status={item.itemStatus || 'pending'} size="sm" />
                </td>
                <td className="px-4 py-3 font-mono text-slate-500 text-[11px]">
                  {item.batchNumber || '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pharmacist Dispensing Logs */}
      {prescription.dispensingHistory && prescription.dispensingHistory.length > 0 && (
        <div className="bg-slate-50 rounded-lg p-4 border border-slate-200 space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
            Pharmacist Dispensing Audit Trail
          </h4>
          <div className="space-y-2">
            {prescription.dispensingHistory.map((dh, i) => (
              <div key={i} className="text-xs bg-white p-3 rounded-md border border-slate-200">
                <div className="flex items-center justify-between text-slate-500 text-[11px] mb-1">
                  <span className="font-semibold text-slate-800">{dh.pharmacistName}</span>
                  <span>{new Date(dh.dispensedAt).toLocaleString()}</span>
                </div>
                {dh.notes && <p className="text-slate-700 italic">"{dh.notes}"</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
