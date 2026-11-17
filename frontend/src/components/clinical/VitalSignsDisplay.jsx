import React from 'react';
import Badge from '../common/Badge';

const VitalSignsDisplay = ({ vitals }) => {
  if (!vitals) return null;

  const items = [
    {
      label: 'Blood Pressure',
      value: vitals.bloodPressure || 'N/A',
      unit: 'mmHg',
      badge: vitals.bloodPressure && vitals.bloodPressure.startsWith('14') ? <Badge>High</Badge> : null,
    },
    {
      label: 'Heart Rate',
      value: vitals.heartRate ? `${vitals.heartRate} bpm` : 'N/A',
      unit: 'Pulse',
      badge: vitals.heartRate > 100 ? <Badge>High</Badge> : null,
    },
    {
      label: 'Temperature',
      value: vitals.temperature ? `${vitals.temperature}°C` : 'N/A',
      unit: 'Body Temp',
      badge: vitals.temperature >= 38.0 ? <Badge>Fever</Badge> : null,
    },
    {
      label: 'SpO2 Oxygen',
      value: vitals.oxygenSaturation ? `${vitals.oxygenSaturation}%` : 'N/A',
      unit: 'Saturation',
      badge: vitals.oxygenSaturation < 95 ? <Badge>Low</Badge> : null,
    },
    {
      label: 'Respiratory Rate',
      value: vitals.respiratoryRate ? `${vitals.respiratoryRate} bpm` : 'N/A',
      unit: 'Breaths',
      badge: null,
    },
    {
      label: 'Weight & Height',
      value: vitals.weight && vitals.height ? `${vitals.weight}kg • ${vitals.height}cm` : 'N/A',
      unit: vitals.bmi ? `BMI: ${vitals.bmi}` : 'Biometrics',
      badge: vitals.bmi ? <Badge>BMI {vitals.bmi}</Badge> : null,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
      {items.map((item, idx) => (
        <div
          key={idx}
          className="bg-white p-3 rounded-none border border-[#e9e9e7] shadow-notion-card flex flex-col justify-between"
        >
          <div className="flex items-center justify-between text-xs text-[#787774] mb-1.5">
            <span className="font-medium text-[11px] truncate">{item.label}</span>
          </div>
          <div>
            <div className="font-serif font-bold text-base text-[#191919] tracking-tight">
              {item.value}
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-[10px] text-[#9b9a97]">{item.unit}</span>
              {item.badge}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VitalSignsDisplay;
