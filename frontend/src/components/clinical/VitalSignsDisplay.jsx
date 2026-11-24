import React from 'react';
import Badge from '../common/Badge';

const VitalSignsDisplay = ({ vitals }) => {
  if (!vitals) return null;

  const items = [
    {
      label: 'Blood Pressure',
      value: vitals.bloodPressure || 'N/A',
      unit: 'mmHg',
      badge: vitals.bloodPressure && vitals.bloodPressure.startsWith('14') ? <Badge variant="urgent">High</Badge> : null,
    },
    {
      label: 'Heart Rate',
      value: vitals.heartRate ? `${vitals.heartRate} bpm` : 'N/A',
      unit: 'Pulse Rate',
      badge: vitals.heartRate > 100 ? <Badge variant="urgent">High</Badge> : null,
    },
    {
      label: 'Temperature',
      value: vitals.temperature ? `${vitals.temperature}°C` : 'N/A',
      unit: 'Body Temp',
      badge: vitals.temperature >= 38.0 ? <Badge variant="urgent">Fever</Badge> : null,
    },
    {
      label: 'SpO2 Oxygen',
      value: vitals.oxygenSaturation ? `${vitals.oxygenSaturation}%` : 'N/A',
      unit: 'Blood O2',
      badge: vitals.oxygenSaturation < 95 ? <Badge variant="urgent">Low</Badge> : null,
    },
    {
      label: 'Respiratory Rate',
      value: vitals.respiratoryRate ? `${vitals.respiratoryRate} bpm` : 'N/A',
      unit: 'Breaths / Min',
      badge: null,
    },
    {
      label: 'Weight & Height',
      value: vitals.weight && vitals.height ? `${vitals.weight}kg • ${vitals.height}cm` : 'N/A',
      unit: vitals.bmi ? `BMI: ${vitals.bmi}` : 'Biometrics',
      badge: vitals.bmi ? <Badge variant="teal">BMI {vitals.bmi}</Badge> : null,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-teal-600 transition-all"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 truncate">
              {item.label}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-teal-600" />
          </div>
          <div>
            <div className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
              {item.value}
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 font-medium">
              <span>{item.unit}</span>
              {item.badge}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VitalSignsDisplay;
