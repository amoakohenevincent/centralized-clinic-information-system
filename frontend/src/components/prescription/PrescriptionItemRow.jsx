import React from 'react';

const FREQUENCY_OPTIONS = [
  'Once daily (OD)',
  'Twice daily (BD)',
  'Three times daily (TDS)',
  'Four times daily (QDS)',
  'Every 4 hours (q4h)',
  'Every 6 hours (q6h)',
  'Every 8 hours (q8h)',
  'As needed / PRN',
  'Stat / Immediate single dose',
  'At bedtime (ON)'
];

export const PrescriptionItemRow = ({ item, index, onChange, onRemove, disabled = false }) => {
  return (
    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs space-y-3 relative hover:border-teal-200 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-teal-100 text-teal-800 font-bold text-xs flex items-center justify-center shrink-0">
            {index + 1}
          </span>
          <div>
            <div className="font-semibold text-slate-900 text-sm">{item.medicineName}</div>
            <div className="text-xs text-slate-500">
              Strength: <span className="font-medium text-slate-700">{item.strength}</span> • Form:{' '}
              <span className="font-medium text-slate-700">{item.form}</span>
            </div>
          </div>
        </div>

        {!disabled && (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="text-slate-400 hover:text-rose-600 p-1 rounded-md hover:bg-rose-50 transition-colors"
            title="Remove medication"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* Dosage */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Dosage <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g., 1 tablet, 5ml"
            value={item.dosage || ''}
            disabled={disabled}
            onChange={(e) => onChange(index, 'dosage', e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          />
        </div>

        {/* Frequency */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Frequency <span className="text-rose-500">*</span>
          </label>
          <select
            value={item.frequency || FREQUENCY_OPTIONS[0]}
            disabled={disabled}
            onChange={(e) => onChange(index, 'frequency', e.target.value)}
            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          >
            {FREQUENCY_OPTIONS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Duration <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            placeholder="e.g., 5 days, 2 weeks"
            value={item.duration || ''}
            disabled={disabled}
            onChange={(e) => onChange(index, 'duration', e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          />
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-xs font-medium text-slate-600 mb-1">
            Qty Prescribed <span className="text-rose-500">*</span>
          </label>
          <input
            type="number"
            min="1"
            value={item.quantityPrescribed || ''}
            disabled={disabled}
            onChange={(e) => onChange(index, 'quantityPrescribed', parseInt(e.target.value, 10) || 1)}
            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
            required
          />
        </div>
      </div>

      {/* Specific Instructions */}
      <div>
        <label className="block text-xs font-medium text-slate-600 mb-1">
          Medication Instructions / Patient Counselling
        </label>
        <input
          type="text"
          placeholder="e.g., Take after meals with plenty of water. Do not crush."
          value={item.instructions || ''}
          disabled={disabled}
          onChange={(e) => onChange(index, 'instructions', e.target.value)}
          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
      </div>
    </div>
  );
};
