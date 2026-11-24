import React from 'react';
import { Award, UserCheck, Stethoscope, Smile, Building2 } from 'lucide-react';

export default function StatsBanner() {
  const stats = [
    {
      number: '25+',
      label: 'Years of Excellence',
      icon: Award,
    },
    {
      number: '150+',
      label: 'Expert Doctors',
      icon: UserCheck,
    },
    {
      number: '500+',
      label: 'Medical Services',
      icon: Stethoscope,
    },
    {
      number: '100K+',
      label: 'Happy Patients',
      icon: Smile,
    },
    {
      number: '50+',
      label: 'Healthcare Centers',
      icon: Building2,
    },
  ];

  return (
    <div className="w-full bg-gradient-to-r from-teal-600 via-teal-500 to-cyan-600 text-white py-8 sm:py-10 shadow-inner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 items-center">
          {stats.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center gap-3.5 justify-center sm:justify-start">
                <div className="w-11 h-11 rounded-full border border-white/30 bg-white/10 flex items-center justify-center shrink-0 shadow-sm backdrop-blur-xs">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-left leading-tight">
                  <span className="block text-2xl sm:text-3xl font-extrabold tracking-tight">
                    {item.number}
                  </span>
                  <span className="block text-xs sm:text-sm text-teal-50 font-medium">
                    {item.label}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

