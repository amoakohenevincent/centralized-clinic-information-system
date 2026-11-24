import React, { useEffect } from 'react';
import { Activity, Heart, Thermometer, Wind, Droplets, Scale } from 'lucide-react';
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
    <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-card">
      <div className="flex items-center justify-between pb-3 mb-5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-teal-600" />
          <h4 className="text-base font-bold text-slate-900">
            Patient Vital Signs & Biometrics
          </h4>
        </div>
        <span className="text-xs text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-full font-bold border border-teal-200">
          Triage Parameters
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Blood Pressure */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
            <span>Blood Pressure</span>
            <span className="text-[10px] text-slate-400">mmHg</span>
          </label>
          <input
            type="text"
            placeholder="120/80"
            value={vitals.bloodPressure || ''}
            onChange={(e) => handleChange('bloodPressure', e.target.value)}
            className="w-full text-xs sm:text-sm font-semibold bg-white px-3 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
          />
        </div>

        {/* Heart Rate */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
            <span>Heart Rate</span>
            {isTachycardia && <Badge variant="urgent">High</Badge>}
          </label>
          <input
            type="number"
            placeholder="72"
            value={vitals.heartRate || ''}
            onChange={(e) => handleChange('heartRate', e.target.value)}
            className="w-full text-xs sm:text-sm font-semibold bg-white px-3 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
          />
        </div>

        {/* Temperature */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
            <span>Temperature (°C)</span>
            {isFever && <Badge variant="urgent">Fever</Badge>}
          </label>
          <input
            type="number"
            step="0.1"
            placeholder="37.0"
            value={vitals.temperature || ''}
            onChange={(e) => handleChange('temperature', e.target.value)}
            className="w-full text-xs sm:text-sm font-semibold bg-white px-3 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
          />
        </div>

        {/* Oxygen Saturation */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center justify-between">
            <span>Oxygen (SpO2 %)</span>
            {isHypoxia && <Badge variant="urgent">Low</Badge>}
          </label>
          <input
            type="number"
            placeholder="98"
            value={vitals.oxygenSaturation || ''}
            onChange={(e) => handleChange('oxygenSaturation', e.target.value)}
            className="w-full text-xs sm:text-sm font-semibold bg-white px-3 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
          />
        </div>

        {/* Respiratory Rate */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Respiratory Rate (bpm)
          </label>
          <input
            type="number"
            placeholder="16"
            value={vitals.respiratoryRate || ''}
            onChange={(e) => handleChange('respiratoryRate', e.target.value)}
            className="w-full text-xs sm:text-sm font-semibold bg-white px-3 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
          />
        </div>

        {/* Weight */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Weight (kg)
          </label>
          <input
            type="number"
            step="0.5"
            placeholder="70"
            value={vitals.weight || ''}
            onChange={(e) => handleChange('weight', e.target.value)}
            className="w-full text-xs sm:text-sm font-semibold bg-white px-3 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
          />
        </div>

        {/* Height */}
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
          <label className="block text-xs font-bold text-slate-700 mb-1.5">
            Height (cm)
          </label>
          <input
            type="number"
            placeholder="175"
            value={vitals.height || ''}
            onChange={(e) => handleChange('height', e.target.value)}
            className="w-full text-xs sm:text-sm font-semibold bg-white px-3 py-2 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
          />
        </div>

        {/* Calculated BMI */}
        <div className="bg-teal-50/70 p-4 rounded-2xl border border-teal-200/80 flex flex-col justify-between">
          <label className="block text-xs font-bold text-teal-800 mb-1.5">
            Computed BMI
          </label>
          <div className="text-xl sm:text-2xl font-extrabold text-teal-900">
            {vitals.bmi ? vitals.bmi : '—'}
          </div>
          <span className="text-[10px] text-teal-700 font-semibold mt-1">
            {vitals.bmi < 18.5 ? 'Underweight' : vitals.bmi <= 24.9 ? 'Normal' : vitals.bmi <= 29.9 ? 'Overweight' : 'Obese'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default VitalSignsInput;
