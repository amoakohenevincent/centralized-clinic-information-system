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
    <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm space-y-3 relative hover:border-teal-600 transition-colors">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
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
            className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            Remove
          </button>
        )}
      </div>

      {/* Inputs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {/* Dosage */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Dosage *
          </label>
          <input
            type="text"
            placeholder="e.g., 1 tablet, 5ml"
            value={item.dosage || ''}
            disabled={disabled}
            onChange={(e) => onChange(index, 'dosage', e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
            required
          />
        </div>

        {/* Frequency */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Frequency *
          </label>
          <select
            value={item.frequency || FREQUENCY_OPTIONS[0]}
            disabled={disabled}
            onChange={(e) => onChange(index, 'frequency', e.target.value)}
            className="w-full px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
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
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Duration *
          </label>
          <input
            type="text"
            placeholder="e.g., 5 days, 2 weeks"
            value={item.duration || ''}
            disabled={disabled}
            onChange={(e) => onChange(index, 'duration', e.target.value)}
            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
            required
          />
        </div>

        {/* Quantity */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">
            Qty Prescribed *
          </label>
          <input
            type="number"
            min="1"
            value={item.quantityPrescribed || ''}
            disabled={disabled}
            onChange={(e) => onChange(index, 'quantityPrescribed', parseInt(e.target.value, 10) || 1)}
            className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
            required
          />
        </div>
      </div>

      {/* Specific Instructions */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1">
          Medication Instructions / Patient Counselling
        </label>
        <input
          type="text"
          placeholder="e.g., Take after meals with plenty of water. Do not crush."
          value={item.instructions || ''}
          disabled={disabled}
          onChange={(e) => onChange(index, 'instructions', e.target.value)}
          className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-600"
        />
      </div>
    </div>
  );
};
export default PrescriptionItemRow;
