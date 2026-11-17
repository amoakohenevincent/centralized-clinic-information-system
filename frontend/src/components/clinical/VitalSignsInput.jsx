import React, { useEffect } from 'react';
import Badge from '../common/Badge';

const VitalSignsInput = ({ vitals, onChange }) => {
  useEffect(() => {
    if (vitals.weight && vitals.height && vitals.height > 0) {
      const heightInMeters = vitals.height / 100;
      const bmi = parseFloat((vitals.weight / (heightInMeters * heightInMeters)).toFixed(1));
      if (vitals.bmi !== bmi) {
        onChange({ ...vitals, bmi });
      }
    }
  }, [vitals.weight, vitals.height]);

  const handleChange = (field, value) => {
    onChange({
      ...vitals,
      [field]: value === '' ? '' : Number(value) ? Number(value) : value,
    });
  };

  const isFever = vitals.temperature >= 38.0;
  const isTachycardia = vitals.heartRate > 100;
  const isHypoxia = vitals.oxygenSaturation && vitals.oxygenSaturation < 95;

  return (
    <div className="bg-white p-5 rounded-none border border-[#e9e9e7] shadow-notion-card">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#f1f1ef]">
        <div>
          <h4 className="text-sm font-semibold text-[#191919]">
            Patient Vital Signs (Vitals Checked)
          </h4>
        </div>
        <span className="text-[11px] text-[#787774] font-mono">Triage Check</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        {/* Blood Pressure */}
        <div className="bg-[#fbfbfa] p-3 rounded-none border border-[#e9e9e7]">
          <label className="block text-[11px] font-medium text-[#787774] mb-1 flex items-center justify-between">
            <span>Blood Pressure</span>
            <span className="text-[10px] text-[#9b9a97]">mmHg</span>
          </label>
          <input
            type="text"
            placeholder="120/80"
            value={vitals.bloodPressure || ''}
            onChange={(e) => handleChange('bloodPressure', e.target.value)}
            className="w-full text-sm font-medium bg-white px-2.5 py-1.5 border border-[#e5e5e3] rounded-none text-[#191919]"
          />
        </div>

        {/* Heart Rate */}
        <div className="bg-[#fbfbfa] p-3 rounded-none border border-[#e9e9e7]">
          <label className="block text-[11px] font-medium text-[#787774] mb-1 flex items-center justify-between">
            <span>Pulse / Heart Rate</span>
            {isTachycardia && <Badge>High</Badge>}
          </label>
          <input
            type="number"
            placeholder="72 bpm"
            value={vitals.heartRate || ''}
            onChange={(e) => handleChange('heartRate', e.target.value)}
            className="w-full text-sm font-medium px-2.5 py-1.5 border rounded-none bg-white border-[#e5e5e3] text-[#191919]"
          />
        </div>

        {/* Temperature */}
        <div className="bg-[#fbfbfa] p-3 rounded-none border border-[#e9e9e7]">
          <label className="block text-[11px] font-medium text-[#787774] mb-1 flex items-center justify-between">
            <span>Temperature</span>
            {isFever && <Badge>Fever</Badge>}
          </label>
          <input
            type="number"
            step="0.1"
            placeholder="36.8 °C"
            value={vitals.temperature || ''}
            onChange={(e) => handleChange('temperature', e.target.value)}
            className="w-full text-sm font-medium px-2.5 py-1.5 border rounded-none bg-white border-[#e5e5e3] text-[#191919]"
          />
        </div>

        {/* Oxygen Saturation */}
        <div className="bg-[#fbfbfa] p-3 rounded-none border border-[#e9e9e7]">
          <label className="block text-[11px] font-medium text-[#787774] mb-1 flex items-center justify-between">
            <span>SpO2 Saturation</span>
            {isHypoxia && <Badge>Low</Badge>}
          </label>
          <input
            type="number"
            placeholder="98 %"
            min="50"
            max="100"
            value={vitals.oxygenSaturation || ''}
            onChange={(e) => handleChange('oxygenSaturation', e.target.value)}
            className="w-full text-sm font-medium px-2.5 py-1.5 border rounded-none bg-white border-[#e5e5e3] text-[#191919]"
          />
        </div>

        {/* Respiratory Rate */}
        <div className="bg-[#fbfbfa] p-3 rounded-none border border-[#e9e9e7]">
          <label className="block text-[11px] font-medium text-[#787774] mb-1">
            Resp. Rate (bpm)
          </label>
          <input
            type="number"
            placeholder="16"
            value={vitals.respiratoryRate || ''}
            onChange={(e) => handleChange('respiratoryRate', e.target.value)}
            className="w-full text-sm font-medium bg-white px-2.5 py-1.5 border border-[#e5e5e3] rounded-none text-[#191919]"
          />
        </div>

        {/* Weight */}
        <div className="bg-[#fbfbfa] p-3 rounded-none border border-[#e9e9e7]">
          <label className="block text-[11px] font-medium text-[#787774] mb-1">Weight (kg)</label>
          <input
            type="number"
            step="0.5"
            placeholder="70"
            value={vitals.weight || ''}
            onChange={(e) => handleChange('weight', e.target.value)}
            className="w-full text-sm font-medium bg-white px-2.5 py-1.5 border border-[#e5e5e3] rounded-none text-[#191919]"
          />
        </div>

        {/* Height */}
        <div className="bg-[#fbfbfa] p-3 rounded-none border border-[#e9e9e7]">
          <label className="block text-[11px] font-medium text-[#787774] mb-1">Height (cm)</label>
          <input
            type="number"
            placeholder="175"
            value={vitals.height || ''}
            onChange={(e) => handleChange('height', e.target.value)}
            className="w-full text-sm font-medium bg-white px-2.5 py-1.5 border border-[#e5e5e3] rounded-none text-[#191919]"
          />
        </div>

        {/* Computed BMI */}
        <div className="bg-[#fbfbfa] p-3 rounded-none border border-[#e9e9e7] flex flex-col justify-between">
          <label className="block text-[11px] font-medium text-[#787774]">Computed BMI</label>
          <div className="flex items-baseline justify-between mt-1">
            <span className="font-serif font-bold text-lg text-[#191919]">{vitals.bmi || '--'}</span>
            <span className="text-[10px] text-[#787774]">
              {vitals.bmi < 18.5
                ? 'Underweight'
                : vitals.bmi <= 24.9
                ? 'Normal'
                : vitals.bmi <= 29.9
                ? 'Overweight'
                : vitals.bmi
                ? 'Obese'
                : 'kg/m²'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VitalSignsInput;
