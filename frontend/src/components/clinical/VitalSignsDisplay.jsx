import React from 'react';
import { Activity, Heart, Thermometer, Wind, Droplets, Scale } from 'lucide-react';
import Badge from '../common/Badge';

const VitalSignsDisplay = ({ vitals }) => {
  if (!vitals) return null;

  const items = [
    {
      label: 'Blood Pressure',
      value: vitals.bloodPressure || 'N/A',
      unit: 'mmHg',
      icon: Activity,
      color: 'teal',
      badge: vitals.bloodPressure && vitals.bloodPressure.startsWith('14') ? <Badge variant="urgent">High</Badge> : null,
    },
    {
      label: 'Heart Rate',
      value: vitals.heartRate ? `${vitals.heartRate} bpm` : 'N/A',
      unit: 'Pulse Rate',
      icon: Heart,
      color: 'rose',
      badge: vitals.heartRate > 100 ? <Badge variant="urgent">High</Badge> : null,
    },
    {
      label: 'Temperature',
      value: vitals.temperature ? `${vitals.temperature}°C` : 'N/A',
      unit: 'Body Temp',
      icon: Thermometer,
      color: 'amber',
      badge: vitals.temperature >= 38.0 ? <Badge variant="urgent">Fever</Badge> : null,
    },
    {
      label: 'SpO2 Oxygen',
      value: vitals.oxygenSaturation ? `${vitals.oxygenSaturation}%` : 'N/A',
      unit: 'Blood O2',
      icon: Droplets,
      color: 'blue',
      badge: vitals.oxygenSaturation < 95 ? <Badge variant="urgent">Low</Badge> : null,
    },
    {
      label: 'Respiratory Rate',
      value: vitals.respiratoryRate ? `${vitals.respiratoryRate} bpm` : 'N/A',
      unit: 'Breaths / Min',
      icon: Wind,
      color: 'teal',
      badge: null,
    },
    {
      label: 'Weight & Height',
      value: vitals.weight && vitals.height ? `${vitals.weight}kg • ${vitals.height}cm` : 'N/A',
      unit: vitals.bmi ? `BMI: ${vitals.bmi}` : 'Biometrics',
      icon: Scale,
      color: 'purple',
      badge: vitals.bmi ? <Badge variant="teal">BMI {vitals.bmi}</Badge> : null,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
      {items.map((item, idx) => {
        const Icon = item.icon;
        return (
          <div
            key={idx}
            className="bg-white p-4 rounded-2xl border border-slate-100 shadow-card flex flex-col justify-between hover:border-teal-200 transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 truncate">
                {item.label}
              </span>
              <Icon className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div>
              <div className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">
                {item.value}
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span>{item.unit}</span>
                {item.badge}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default VitalSignsDisplay;

