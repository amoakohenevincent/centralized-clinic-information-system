import React from 'react';

export default function StatsBanner() {
  const stats = [
    {
      number: '25+',
      label: 'Years of Excellence',
    },
    {
      number: '150+',
      label: 'Expert Doctors',
    },
    {
      number: '500+',
      label: 'Medical Services',
    },
    {
      number: '100K+',
      label: 'Happy Patients',
    },
    {
      number: '50+',
      label: 'Healthcare Centers',
    },
  ];

  return (
    <div className="w-full bg-teal-700 text-white py-8 sm:py-10 border-y border-teal-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:gap-8 items-center">
          {stats.map((item, idx) => (
            <div key={idx} className="flex flex-col text-center sm:text-left">
              <span className="block text-2xl sm:text-3xl font-extrabold tracking-tight">
                {item.number}
              </span>
              <span className="block text-xs sm:text-sm text-teal-100 font-semibold mt-0.5">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
